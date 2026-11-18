import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './supabase-config.js';
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const form=document.getElementById('ticket-booking-form');
if(form){const status=form.querySelector('.booking-feedback');form.addEventListener('submit',async e=>{e.preventDefault();if(form.elements.website.value)return;const btn=form.querySelector('button[type=submit]');btn.disabled=true;status.textContent='Submitting reservation…';try{const name=form.elements.student_name.value.trim();const email=form.elements.contact_email.value.trim();if(name.length<2||name.length>100)throw Error('Enter a valid name.');const {data,error}=await db.rpc('create_festival_reservation',{p_student_name:name,p_contact_email:email||null,p_ticket_type:form.elements.ticket_type.value});if(error)throw error;status.replaceChildren();const title=document.createElement('strong');title.textContent='✓ Ticket booking request received!';const ref=document.createElement('p');ref.textContent=`Your booking reference: ${data}`;const note=document.createElement('p');note.textContent='Please save this reference. Pay cash at school. Your booking is pending admin approval; this is not a paid or issued ticket.';status.append(title,ref,note);status.setAttribute('role','status');saveBookingReference(data);refreshSavedBookings();form.reset();}catch(err){status.textContent='Reservation failed: '+(err.message||'Please try again.');}finally{btn.disabled=false;}});}

// Public event details are read-only; the booking RPC enforces current prices and open status.
(async()=>{const {data,error}=await db.from('festival_ticket_settings').select('event_title,event_date,event_time,venue,description,price_one,price_two,bookings_open').eq('id',1).single();if(error||!data)return;
const put=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
put('festival-event-title',data.event_title);put('festival-event-description',data.description);
const date=new Date(data.event_date+'T12:00:00');const niceDate=isNaN(date)?data.event_date:date.toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
put('festival-event-details',`${niceDate} · ${data.event_time.slice(0,5)} · ${data.venue}`);
const isSinhala=location.pathname.includes('/si/');
put('festival-option-one',`Admit One — ${isSinhala?'රු.':'Rs.'} ${data.price_one}`);put('festival-option-two',`Admit Two — ${isSinhala?'රු.':'Rs.'} ${data.price_two}`);
if(form&&!data.bookings_open){form.querySelector('button[type=submit]').disabled=true;form.querySelector('.booking-feedback').textContent='Reservations are currently closed.';}
})();

// Public lookup reveals only the booking status; student details stay admin-only.
for(const lookup of document.querySelectorAll('.ticket-status-form')){
 lookup.addEventListener('submit',async e=>{
  e.preventDefault();const output=lookup.querySelector('.ticket-status-result');
  const ref=lookup.elements.booking_ref.value.trim().toUpperCase();
  output.textContent='Checking…';
  const {data,error}=await db.rpc('get_festival_booking_status',{p_booking_ref:ref});
  if(error){output.textContent='Unable to check status. Please try again.';return;}
  if(!data){output.textContent='Booking not found. Check your reference.';return;}
  const labels={pending:'Pending Approval',approved:'Approved — payment at school required',paid:'Paid & Confirmed',rejected:'Rejected'};
  output.textContent='Booking '+ref+': '+(labels[data]||'Status unavailable');
 });
}


// References are stored only in this browser. Status comes from the database.
// Deleting a reservation in Admin makes its public status lookup return null.
const SAVED_BOOKINGS_KEY='society_festival_booking_refs_v1';
const savedList=document.getElementById('saved-bookings-list');
function readSavedBookingRefs(){
 try {const refs=JSON.parse(localStorage.getItem(SAVED_BOOKINGS_KEY)||'[]');
  return Array.isArray(refs)?[...new Set(refs.filter(x=>typeof x==='string'&&/^FF26-[A-Z0-9]{10}$/.test(x)))].slice(0,30):[];
 }catch{return [];}
}
function saveBookingReference(ref){
 if(typeof ref!=='string'||!/^FF26-[A-Z0-9]{10}$/.test(ref))return;
 try{localStorage.setItem(SAVED_BOOKINGS_KEY,JSON.stringify([ref,...readSavedBookingRefs().filter(x=>x!==ref)].slice(0,30)));}catch{}
}
let savedRefreshRunning=false;
async function refreshSavedBookings(){
 if(!savedList||savedRefreshRunning)return;
 savedRefreshRunning=true;
 try{
  const refs=readSavedBookingRefs();savedList.replaceChildren();
  if(!refs.length){savedList.textContent='No saved bookings on this browser.';return;}
  const statuses={pending:'Pending Approval',approved:'Approved — pay at school',paid:'Paid & Confirmed',rejected:'Rejected'};
  const remaining=[];let networkFailure=false;
  for(const ref of refs){
   const {data,error}=await db.rpc('get_festival_booking_status',{p_booking_ref:ref});
   if(error){networkFailure=true;remaining.push(ref);continue;}
   if(!data)continue; // Deleted in Admin: remove from browser as well.
   remaining.push(ref);
   const card=document.createElement('div');card.className='saved-booking-item';
   const strong=document.createElement('strong');strong.textContent=ref;
   const text=document.createElement('span');text.textContent=statuses[data]||'Status unavailable';
   card.append(strong,text);savedList.append(card);
  }
  if(!networkFailure){try{localStorage.setItem(SAVED_BOOKINGS_KEY,JSON.stringify(remaining));}catch{}}
  if(networkFailure){const msg=document.createElement('p');msg.textContent='Some bookings could not be checked. Please try again later.';savedList.append(msg);}
  if(!savedList.children.length)savedList.textContent='No active saved bookings.';
 }finally{savedRefreshRunning=false;}
}
if(savedList){
 refreshSavedBookings();
 // Recheck after tab focus and periodically while this page is open.
 window.addEventListener('focus',refreshSavedBookings);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSavedBookings();});
 setInterval(()=>{if(!document.hidden)refreshSavedBookings();},30000);
}
