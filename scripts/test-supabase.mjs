import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['--test','tests/server.test.mjs'],{stdio:'inherit',env:{...process.env,MFARO_LIVE_SUPABASE:'1'}});
process.exitCode=result.status??1;
