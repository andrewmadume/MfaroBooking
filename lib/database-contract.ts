export interface StatementResult<T=Record<string,any>> {results:T[];meta:{changes:number}}
export interface Statement {bind(...args:any[]):Statement;all():Promise<StatementResult>;first():Promise<any>;run():Promise<StatementResult>}
export interface ApplicationDatabase {prepare(sql:string):Statement;batch(statements:Statement[]):Promise<StatementResult[]>}
