import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './supabase-config.js';
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const form=document.getElementById('ticket-booking-form');
if(form){const status=form.querySelector('.booking-feedback');form.addEventListener('submit',async e=>{e.preventDefault();if(form.elements.website.value)return;const btn=form.querySelector('button[type=submit]');btn.disabled=true;status.textContent='Submitting reservation…';try{const name=form.elements.student_name.value.trim();const email=form.elements.contact_email.value.trim();if(name.length<2||name.length>100)throw Error('Enter a valid name.');const {data,error}=await db.rpc('create_festival_reservation',{p_student_name:name,p_contact_email:email||null,p_ticket_type:form.elements.ticket_type.value});if(error)throw error;status.textContent=`Reservation received! Reference: ${data}. Save this number. Pay cash at school; admin approval is required.`;form.reset();}catch(err){status.textContent='Reservation failed: '+(err.message||'Please try again.');}finally{btn.disabled=false;}});}

// Public event details are read-only; the booking RPC enforces current prices and open status.
(async()=>{const {data,error}=await db.from('festival_ticket_settings').select('event_title,event_date,event_time,venue,description,price_one,price_two,bookings_open').eq('id',1).single();if(error||!data)return;
const put=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
put('festival-event-title',data.event_title);put('festival-event-description',data.description);
const date=new Date(data.event_date+'T12:00:00');const niceDate=isNaN(date)?data.event_date:date.toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
put('festival-event-details',`${niceDate} · ${data.event_time.slice(0,5)} · ${data.venue}`);
put('festival-option-one',`Admit One — Rs. ${data.price_one}`);put('festival-option-two',`Admit Two — Rs. ${data.price_two}`);
if(form&&!data.bookings_open){form.querySelector('button[type=submit]').disabled=true;form.querySelector('.booking-feedback').textContent='Reservations are currently closed.';}
})();
