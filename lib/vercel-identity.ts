export async function vercelIdentity(request:Request){
 const token=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('mfaro_session='))?.slice('mfaro_session='.length);
 if(!token)return null;
 const base=new URL(process.env.SUPABASE_GATEWAY_URL!).origin;
 const response=await fetch(base+'/auth/v1/user',{headers:{apikey:process.env.SUPABASE_GATEWAY_ANON_KEY!,Authorization:'Bearer '+token},cache:'no-store'});
 if(!response.ok)return null;const user:any=await response.json();return {id:user.id as string,email:user.email as string};
}
