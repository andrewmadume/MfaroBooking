'use client';
import { useEffect,useRef } from 'react';
import { X,ArrowUpRight,CalendarDays } from 'lucide-react';
export function Modal({title,children,onClose,error}:{title:string,children:React.ReactNode,onClose:()=>void,error?:string}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{ref.current?.showModal();return()=>ref.current?.close()},[]);return <dialog ref={ref} onCancel={onClose} className="modal" aria-label={title}><div className="modal-head"><div><span className="eyebrow">MFAROBOOKING</span><h2>{title}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div>{error&&<p className="error modal-error" role="alert">{error}</p>}{children}</dialog>}
export function Field({label,children}:{label:string,children:React.ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
export function Empty({title='Nothing here yet',detail='Add your first record to get started.'}:{title?:string,detail?:string}){return <div className="empty"><CalendarDays size={30}/><h3>{title}</h3><p>{detail}</p></div>}
export function Status({value}:{value:string}){return <span className={`status status-${value.replaceAll(' ','-')}`}><i/>{value}</span>}
export function Stat({label,value,note,icon:Icon}:{label:string,value:string|number,note:string,icon:any}){return <article className="stat"><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18}/></span></div><strong>{value}</strong><div className="stat-note"><ArrowUpRight size={13}/>{note}</div></article>}
export function download(name:string,content:string,type='text/plain'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export function csv(rows:any[][]){return rows.map(row=>row.map(x=>'"'+String(x??'').replaceAll('"','""').replace(/^[=+@-]/,"'$&")+'"').join(',')).join('\r\n')}
