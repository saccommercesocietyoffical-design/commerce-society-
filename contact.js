import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import {SUPABASE_URL,SUPABASE_ANON_KEY} from "./supabase-config.js";
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
for(const form of document.querySelectorAll('.society-contact-form')){
 const status=form.querySelector('.contact-feedback'),button=form.querySelector('button[type=submit]');
 form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;
 const f=new FormData(form);if(f.get('website')){form.reset();status.textContent='Thank you.';return;}
 const values={sender_name:String(f.get('sender_name')||'').trim(),sender_email:String(f.get('sender_email')||'').trim(),message:String(f.get('message')||'').trim()};
 if(!values.sender_name||!values.sender_email||!values.message)return;
 button.disabled=true;status.textContent=document.documentElement.lang==='si'?'පණිවිඩය යවමින්…':'Sending message…';
 try{const {error}=await db.from('society_contact_messages').insert(values);if(error)throw error;form.reset();status.textContent=document.documentElement.lang==='si'?'ඔබගේ පණිවිඩය සාර්ථකව යවන ලදී.':'Your message was sent successfully.';}
 catch(err){console.error('Contact form error',err);status.textContent=document.documentElement.lang==='si'?'පණිවිඩය යැවීමට නොහැකි විය. නැවත උත්සාහ කරන්න.':'Message could not be sent. Please try again.';}finally{button.disabled=false;}
 });
}
