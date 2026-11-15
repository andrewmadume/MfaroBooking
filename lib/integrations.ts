/** Replace this adapter with a provider-specific implementation before taking live payments. */
import type {ApplicationDatabase} from './database-contract';
export interface PaymentEvent {id:string;business:string;booking:string;amount:number;method:'Sandbox card'|'Refund'}
export async function verifySignature(body:string,signature:string,secret:string,now=Date.now()){
 const [timestamp,digest]=signature.split('.');if(!/^\d{10,13}$/.test(timestamp||'')||!digest||!/^[a-f0-9]{64}$/.test(digest))return false;
 if(Math.abs(now-Number(timestamp))>300000)return false;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 const bytes=new Uint8Array(digest.match(/../g)!.map(v=>parseInt(v,16)));
 return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(timestamp+'.'+body));
}
export async function recordPayment(db:ApplicationDatabase,business:string,payment:{booking:string;amount:number;method:string;retry:string},paymentId:string){
 const prior=await db.prepare('SELECT id FROM payments WHERE business=? AND retry=?').bind(business,payment.retry).first();if(prior)return {ok:true,replayed:true};
 const results=await db.batch([
 db.prepare('INSERT OR IGNORE INTO payments SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM bookings WHERE id=? AND business=? AND paid+?>=0 AND paid+?<=amount)').bind(paymentId,business,payment.booking,payment.amount,payment.method,payment.retry,new Date().toISOString(),payment.booking,business,payment.amount,payment.amount),
 db.prepare('UPDATE bookings SET paid=paid+? WHERE id=? AND business=? AND EXISTS (SELECT 1 FROM payments WHERE id=?)').bind(payment.amount,payment.booking,business,paymentId)
 ]);
 if(!results[0].meta.changes){const retry=await db.prepare('SELECT id FROM payments WHERE business=? AND retry=?').bind(business,payment.retry).first();if(retry)return {ok:true,replayed:true};throw Error('Payment exceeds the outstanding balance or refund exceeds payments received.');}return {ok:true,replayed:false};
}
export async function processReminderPreviews(db:ApplicationDatabase,now=Date.now()){
 // A single conditional update is safe when two workers process the same due job.
 // This adapter deliberately never reports messages as delivered.
 const result=await db.prepare("UPDATE delivery SET status='preview',attempts=attempts+1 WHERE status='scheduled-preview' AND due<=? AND EXISTS (SELECT 1 FROM bookings b WHERE b.id=delivery.booking AND b.status NOT IN ('cancelled','no-show','completed','checked-out'))").bind(now).run();
 await db.prepare('DELETE FROM limits WHERE expires<?').bind(now).run();
 return {processed:result.meta.changes,mode:'preview',sent:0};
}
