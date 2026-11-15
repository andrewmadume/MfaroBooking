import {NextResponse} from 'next/server';
export function GET(request:Request){const response=NextResponse.redirect(new URL('/signin',request.url));response.cookies.set('mfaro_session','',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});return response;}
