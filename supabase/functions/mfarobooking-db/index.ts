// Supabase Deno runtime. This entrypoint is excluded from the app's TypeScript target.
import postgres from 'npm:postgres@3.4.7';
import {postgresQuery} from './dialect.ts';
import {approvedQueries} from './allowed.ts';

const connection=Deno.env.get('SUPABASE_DB_URL');
if(!connection)throw Error('Supabase database URL is unavailable.');
const pool=postgres(connection,{prepare:false,max:1,ssl:'require',connect_timeout:10,idle_timeout:20,types:{bigint:postgres.BigInt}});
const headers={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
function reply(body:unknown,status=200){return new Response(JSON.stringify(body,(_key,v)=>typeof v==='bigint'?Number(v):v),{status,headers});}

Deno.serve(async(request:Request)=>{
 if(request.method!=='POST')return reply({code:'method_not_allowed'},405);
 if(Number(request.headers.get('content-length'))>262144)return reply({code:'request_too_large'},413);
 const key=request.headers.get('x-mfaro-database-key')||'';
 if(!/^[a-f0-9]{64}$/.test(key))return reply({code:'unauthorized'},401);
 try{
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key)))).map(v=>v.toString(16).padStart(2,'0')).join('');
   const result=await pool.begin(async tx=>{
     // Authenticate before parsing or executing any application statement.
     const allowed=await tx`SELECT id FROM mfarobooking_private.app_keys WHERE key_hash=${digest} AND enabled=true`;
     if(!allowed.length)throw new Error('unauthorized');
     const raw=await request.text();if(raw.length>262144)throw new Error('invalid_payload');
     const payload=JSON.parse(raw);
     if(!Array.isArray(payload.queries)||payload.queries.length<1||payload.queries.length>150)throw new Error('invalid_payload');
     const queries=payload.queries.map((q:{sql:string;args:unknown[]})=>{
       if(typeof q.sql!=='string'||q.sql.length>15000||!Array.isArray(q.args)||q.args.length>200||q.args.some(v=>v!==null&&!['string','number','boolean'].includes(typeof v)))throw new Error('invalid_payload');
       if(!approvedQueries.has(q.sql.trim()))throw new Error('invalid_payload');
       return {sql:postgresQuery(q.sql,q.args.length),args:q.args};
     });
     // Every mutating app request takes the same transaction lock before its first statement.
     // Under READ COMMITTED, subsequent checks see the previous writer's committed data.
     if(queries.some((q:{sql:string})=>!/^\s*SELECT\b/i.test(q.sql)))await tx`SELECT pg_advisory_xact_lock(7164628820917)`;
     await tx.unsafe('SET LOCAL ROLE mfarobooking_runtime');
     await tx.unsafe('SET LOCAL search_path TO mfarobooking, pg_catalog');
     await tx.unsafe("SET LOCAL statement_timeout TO '15s'");
     const output=[];
     for(const q of queries){const rows=await tx.unsafe(q.sql,q.args);output.push({results:Array.from(rows),meta:{changes:rows.count||0}});}
     return output;
   });
   return reply({results:result});
 }catch(error){
   const message=error instanceof Error?error.message:'';
   if(message==='unauthorized')return reply({code:'unauthorized'},401);
   if(message==='invalid_payload'||error instanceof SyntaxError)return reply({code:'invalid_payload'},400);
   console.error(JSON.stringify({event:'mfarobooking_database_failure',code:(error as {code?:string}).code||'request_failed'}));
   return reply({code:'database_request_failed'},400);
 }
});
