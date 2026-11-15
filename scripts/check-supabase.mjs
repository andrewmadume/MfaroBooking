import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {httpsFetch} from '../tests/https-fetch.mjs';
const values=Object.fromEntries(readFileSync('.dev.vars','utf8').trim().split(/\r?\n/).filter(l=>l&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');const v=l.slice(i+1);return [l.slice(0,i),v.startsWith('"')?JSON.parse(v):v]}));
const headers={'Content-Type':'application/json',Authorization:'Bearer '+values.SUPABASE_GATEWAY_ANON_KEY,apikey:values.SUPABASE_GATEWAY_ANON_KEY,'x-mfaro-database-key':values.MFARO_DATABASE_KEY};
async function request(queries,override={}){const r=await httpsFetch(values.SUPABASE_GATEWAY_URL,{method:'POST',headers:{...headers,...override},body:JSON.stringify({queries}),signal:AbortSignal.timeout(20000)});return {status:r.status,data:await r.json()};}
const health={sql:'SELECT 1 AS connected',args:[]};
assert.equal((await request([health])).data.results[0].results[0].connected,1);console.log('PASS: authenticated Supabase connection');
assert.equal((await request([health],{'x-mfaro-database-key':'0'.repeat(64)})).status,401);console.log('PASS: incorrect application key denied');
assert.equal((await request([health],{Authorization:'Bearer invalid-jwt'})).status,401);console.log('PASS: invalid gateway JWT denied');
assert.equal((await request([{sql:"SELECT set_config('role','postgres',true)",args:[]}])).status,400);console.log('PASS: arbitrary SQL and role escalation denied');
assert.equal((await request([{sql:'SELECT * FROM mfarobooking_private.app_keys',args:[]}])).status,400);console.log('PASS: private credential table cannot be queried');
const id='rollback-check-'+crypto.randomUUID(),settings=JSON.stringify({timezone:'UTC'});
const failed=await request([{sql:'INSERT INTO businesses VALUES (?,?,?,?,?,?)',args:[id,'verification','Rollback verification','Professional services',settings,new Date().toISOString()]},{sql:'INSERT INTO members VALUES (?,?,?,?,?,?)',args:[crypto.randomUUID(),id,'verification','INVALID_ROLE',null,null]}]);
assert.equal(failed.status,400);assert.equal((await request([{sql:'SELECT * FROM businesses WHERE id=?',args:[id]}])).data.results[0].results.length,0);console.log('PASS: failed transaction rolls back every statement');
console.log('6 live connection/security checks passed.');
