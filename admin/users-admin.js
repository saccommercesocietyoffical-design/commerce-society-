import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabase-config.js";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {auth:{storageKey:'sb-'+new URL(SUPABASE_URL).hostname.split('.')[0]+'-auth-token'}});
const panel=document.getElementById('users-panel');
const list=document.getElementById('users-list');
const status=document.getElementById('users-status');
let admin=false;
const make=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el;};
async function load(){
  if(!admin)return;
  status.textContent='Loading students…';list.replaceChildren();
  const {data,error}=await sb.from('student_profiles').select('id,full_name,status,created_at').order('created_at',{ascending:false}).limit(500);
  if(error){status.textContent='Could not load students: '+error.message;return;}
  status.textContent=`${data.length} registered account(s) shown`;
  for(const user of data){
    const row=document.createElement('div');row.className='student-admin-row';
    const info=document.createElement('div');info.append(make('strong',user.full_name||'Unnamed student'),make('small','Status: '+user.status+' · Joined: '+new Date(user.created_at).toLocaleDateString()));
    const actions=document.createElement('div');
    for(const [label,next] of [['Approve','approved'],['Block','blocked']]){
      if(user.status===next)continue;
      const btn=make('button',label);btn.type='button';btn.className='button button-gold';
      btn.addEventListener('click',async()=>{
        if(!confirm(`${label} this student?`))return;
        btn.disabled=true;
        const {error}=await sb.from('student_profiles').update({status:next}).eq('id',user.id);
        if(error){status.textContent='Update failed: '+error.message;btn.disabled=false;return;}
        await load();
      });actions.append(btn);
    }
    row.append(info,actions);list.append(row);
  }
}
window.addEventListener('sac-admin-status',e=>{admin=e.detail.isAdmin;panel.hidden=!admin;if(admin)load();else list.replaceChildren();});
document.getElementById('users-refresh').addEventListener('click',load);
