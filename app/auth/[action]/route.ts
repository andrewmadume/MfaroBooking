import {NextResponse} from 'next/server';
import {z} from 'zod';
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
 if(process.env.NEXT_PUBLIC_VERCEL_AUTH!=='true')return NextResponse.json({error:'Not available.'},{status:404});
 const origin=new URL(request.url).origin;if(request.headers.get('origin')!==origin)return NextResponse.json({error:'Invalid origin.'},{status:403});
 try{
  const {action}=await params;if(!['signin','register'].includes(action))return NextResponse.json({error:'Not found.'},{status:404});
  const body=z.object({email:z.string().email().max(200),password:z.string().min(8).max(128)}).parse(await request.json());
  const base=new URL(process.env.SUPABASE_GATEWAY_URL!).origin;
  const upstream=await fetch(base+(action==='register'?'/auth/v1/signup':'/auth/v1/token?grant_type=password'),{method:'POST',headers:{'Content-Type':'application/json',apikey:process.env.SUPABASE_GATEWAY_ANON_KEY!},body:JSON.stringify(body),cache:'no-store'});
  const data:any=await upstream.json();
  if(!upstream.ok)return NextResponse.json({error:action==='signin'?'Unable to sign in. Check your email, password and email confirmation.':'Unable to register. Please try again later.'},{status:400});
  const response=NextResponse.json({ok:true,confirmationRequired:!data.access_token});
  response.headers.set('Cache-Control','no-store');
  if(data.access_token)response.cookies.set('mfaro_session',data.access_token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:Math.min(data.expires_in||3600,3600)});
  return response;
 }catch{return NextResponse.json({error:'Enter a valid email and a password of at least 8 characters.'},{status:400});}
}
