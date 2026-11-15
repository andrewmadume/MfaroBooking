import https from 'node:https';
/** Node-only test transport for hosts whose IPv6 route is unavailable. TLS stays verified. */
export function httpsFetch(url,options={}) {
 return new Promise((resolve,reject)=>{
  const request=https.request(url,{method:options.method||'GET',headers:options.headers,family:4,signal:options.signal},response=>{
   const chunks=[];response.on('data',c=>chunks.push(c));response.on('error',reject);
   response.on('end',()=>resolve(new Response(Buffer.concat(chunks),{status:response.statusCode,headers:response.headers})));
  });
  request.on('error',reject);if(options.body)request.write(options.body);request.end();
 });
}
