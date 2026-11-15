'use client';
import { useEffect,useState } from 'react';
import Workspace from './components/workspace';
import { Brand } from './components/brand';
import { PublicBooking,GuestPortal } from './components/public-booking';
export default function Home(){const [route,setRoute]=useState<{book:string|null;portal:string|null}|null>(null);useEffect(()=>{const p=new URLSearchParams(location.search);setRoute({book:p.get('book'),portal:p.get('portal')})},[]);if(!route)return <div className="splash"><Brand className="splash-brand" priority/><h2>MfaroBooking</h2><p>Every booking. Perfectly managed.</p></div>;return route.book?<PublicBooking id={route.book}/>:route.portal?<GuestPortal id={route.portal}/>:<Workspace/>}
