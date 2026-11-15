'use client';
import {useState} from 'react';
import {Field} from './ui';
export function VercelAuthForm({register}:{register:boolean}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 return <form className="modal-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');const f=new FormData(e.currentTarget);try{const r=await fetch('/auth/'+(register?'register':'signin'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})});const d:any=await r.json();if(!r.ok)throw Error(d.error);if(d.confirmationRequired)setMessage('Check your email to confirm your account, then return here to sign in.');else location.assign('/');}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}}>
 <Field label="Email"><input name="email" type="email" autoComplete="email" required/></Field>
 <Field label="Password"><input name="password" type="password" minLength={8} maxLength={128} autoComplete={register?'new-password':'current-password'} required/></Field>
 {message&&<p role="status">{message}</p>}<button disabled={busy} className="btn primary">{busy?'Please wait…':register?'Create account':'Sign in'}</button><p className="fine">Secure email authentication provided by Supabase. Your session lasts up to one hour.</p>
 </form>;
}
