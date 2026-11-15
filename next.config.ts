import type {NextConfig} from 'next';
import path from 'node:path';
const config:NextConfig={webpack(config,{webpack}){config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^cloudflare:workers$/, (resource:{request:string})=>{resource.request=path.resolve(process.cwd(),'lib/vercel-runtime.ts')}));return config;}};
export default config;
