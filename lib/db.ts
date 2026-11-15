import { env } from 'cloudflare:workers';
export function database(){if(!env.DB)throw Error('Database binding DB is required.');return env.DB;}
export const id=()=>crypto.randomUUID();
export async function all(sql:string,...args:any[]){return (await database().prepare(sql).bind(...args).all()).results as any[];}
export async function one(sql:string,...args:any[]){return await database().prepare(sql).bind(...args).first() as any;}
export async function run(sql:string,...args:any[]){return database().prepare(sql).bind(...args).run();}
export async function audit(business:string,actor:string,kind:string,detail:string){await run('INSERT INTO events VALUES (?,?,?,?,?,?)',id(),business,actor,kind,detail,new Date().toISOString());}
