import {one,run} from './db';
import {bookingRange,validateWindow,canCancel} from './engine';
export async function reschedule(b:string,bk:any,settings:any,hotel:boolean,input:{start:string;end?:string}){
 if(!canCancel(bk.start,settings.cancellation))throw Error('The rescheduling window has closed.');
 const row=await one('SELECT data FROM records WHERE id=? AND business=?',bk.service,b);if(!row)throw Error('Service no longer exists.');const service=JSON.parse(row.data);
 const resource=await one('SELECT data FROM records WHERE id=? AND business=?',bk.resource,b);if(!resource||JSON.parse(resource.data).status==='Maintenance')throw Error('Resource is unavailable.');
 const [start,end]=bookingRange(input.start,input.end,hotel,service.duration,service.buffer);validateWindow(start,end,settings,hotel);
 if(hotel&&(end-start)/86400000<(service.minStay||1))throw Error('Minimum stay not met.');
 const capacity=hotel?1:Math.min(service.capacity||1,JSON.parse(resource.data).capacity||1);
 const amount=hotel?Math.round(service.price*(end-start)/86400000*(100+settings.tax)/100):bk.amount;
 const result=await run("UPDATE bookings SET start=?,end=?,amount=? WHERE id=? AND business=? AND status NOT IN ('cancelled','no-show') AND (SELECT COUNT(*) FROM bookings WHERE business=? AND id<>? AND status NOT IN ('cancelled','no-show') AND start<? AND end>? AND (staff=? OR resource=?))<? AND NOT EXISTS (SELECT 1 FROM bookings WHERE business=? AND id<>? AND status NOT IN ('cancelled','no-show') AND start<? AND end>? AND (staff=? OR resource=?) AND (service<>? OR start<>? OR end<>?))",start,end,amount,bk.id,b,b,bk.id,end,start,hotel?'':bk.staff,bk.resource,capacity,b,bk.id,end,start,hotel?'':bk.staff,bk.resource,bk.service,start,end);
 if(!result.meta.changes)throw Error('The new time is unavailable.');
 await run("UPDATE delivery SET due=?,status=CASE WHEN status='consent-required' THEN 'consent-required' ELSE 'scheduled-preview' END WHERE booking=? AND business=? AND kind='Reminder'",start-86400000,bk.id,b);
 return {start,end,amount};
}
