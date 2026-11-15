import { env } from 'cloudflare:workers';
import { SupabaseDatabase } from './supabase-database';
import type {ApplicationDatabase} from './database-contract';
export function database():ApplicationDatabase{
 if(env.SUPABASE_GATEWAY_URL)return new SupabaseDatabase({url:env.SUPABASE_GATEWAY_URL,anonKey:env.SUPABASE_GATEWAY_ANON_KEY||'',databaseKey:env.MFARO_DATABASE_KEY||''});
 if(!env.DB)throw Error('Configure the Supabase database connection or a local D1 binding.');
 return env.DB as unknown as ApplicationDatabase;
}
export const id=()=>crypto.randomUUID();
export async function all(sql:string,...args:any[]){return (await database().prepare(sql).bind(...args).all()).results as any[];}
export async function one(sql:string,...args:any[]){return await database().prepare(sql).bind(...args).first() as any;}
export async function run(sql:string,...args:any[]){return database().prepare(sql).bind(...args).run();}
export async function audit(business:string,actor:string,kind:string,detail:string){await run('INSERT INTO events VALUES (?,?,?,?,?,?)',id(),business,actor,kind,detail,new Date().toISOString());}
