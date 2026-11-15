import type {ApplicationDatabase,Statement,StatementResult} from './database-contract';
interface GatewayConfig {url:string;anonKey:string;databaseKey:string}
interface Query {sql:string;args:any[]}
/** Server-only HTTPS transport. The Edge Function owns PostgreSQL transactions. */
export class SupabaseDatabase implements ApplicationDatabase {
  constructor(private config:GatewayConfig,private transport:typeof fetch=fetch){
    if(new URL(config.url).protocol!=='https:')throw Error('Supabase database transport requires HTTPS.');
    if(!config.anonKey||!config.databaseKey)throw Error('Supabase server credentials are not configured.');
  }
  prepare(sql:string){return new SupabaseStatement(this,{sql,args:[]});}
  async execute(queries:Query[]):Promise<StatementResult[]>{
    const response=await this.transport(this.config.url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${this.config.anonKey}`,'apikey':this.config.anonKey,'x-mfaro-database-key':this.config.databaseKey},body:JSON.stringify({queries}),signal:AbortSignal.timeout(30000)});
    const body:any=await response.json();
    if(!response.ok){console.error(JSON.stringify({event:'supabase_database_error',status:response.status,code:body.code||'unknown'}));throw Error('The database request failed. Please try again.');}
    if(!Array.isArray(body.results)||body.results.length!==queries.length)throw Error('Invalid database response.');
    return body.results;
  }
  async batch(statements:Statement[]){
    if(statements.some(s=>!(s instanceof SupabaseStatement)||s.database.config.url!==this.config.url||s.database.config.anonKey!==this.config.anonKey||s.database.config.databaseKey!==this.config.databaseKey||s.database.transport!==this.transport))throw Error('A database batch cannot mix connections.');
    return this.execute((statements as SupabaseStatement[]).map(s=>s.query));
  }
}
class SupabaseStatement implements Statement {
  constructor(readonly database:SupabaseDatabase,readonly query:Query){}
  bind(...args:any[]){return new SupabaseStatement(this.database,{sql:this.query.sql,args});}
  async all(){return (await this.database.execute([this.query]))[0];}
  async first(){return (await this.all()).results[0]||null;}
  async run(){return this.all();}
}
