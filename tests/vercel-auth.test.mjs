import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import ts from 'typescript';
mkdirSync('.sites-runtime',{recursive:true});
writeFileSync('.sites-runtime/vercel-identity-test.mjs',ts.transpileModule(readFileSync('lib/vercel-identity.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
const {vercelIdentity}=await import('../.sites-runtime/vercel-identity-test.mjs');
test('Vercel identity does not trust caller-supplied Sites identity headers',async()=>{assert.equal(await vercelIdentity(new Request('https://example.com/api/bootstrap',{headers:{'oai-authenticated-user-id':'forged-owner'}})),null)});
test('Vercel identity validates session tokens with Supabase rather than decoding client claims',async()=>{const original=globalThis.fetch;process.env.SUPABASE_GATEWAY_URL='https://example.supabase.co/functions/v1/mfarobooking-db';process.env.SUPABASE_GATEWAY_ANON_KEY='test';try{let target;globalThis.fetch=async(url,opts)=>{target={url,opts};return Response.json({id:'verified-user',email:'test@example.com'})};assert.deepEqual(await vercelIdentity(new Request('https://example.com',{headers:{cookie:'mfaro_session=opaque-token'}})),{id:'verified-user',email:'test@example.com'});assert.equal(target.url,'https://example.supabase.co/auth/v1/user');assert.equal(target.opts.headers.Authorization,'Bearer opaque-token');globalThis.fetch=async()=>new Response('',{status:401});assert.equal(await vercelIdentity(new Request('https://example.com',{headers:{cookie:'mfaro_session=invalid'}})),null)}finally{globalThis.fetch=original}});
