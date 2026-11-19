import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import {SUPABASE_URL,SUPABASE_ANON_KEY} from "../supabase-config.js";
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY),$=id=>document.getElementById(id);let allowed=false,queue=[],published=[];
const say=s=>$('material-status').textContent=s;
function detect(name){
 const n=name.replace(/\.pdf$/i,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
 const year=(n.match(/(?:19|20)\d{2}/)||[])[0]||'';
 let subject='Other';
 if(/account|ගිණුම්/i.test(n))subject='Accounting';
 else if(/business\s*stud|ව්‍යාපාර/i.test(n))subject='Business Studies';
 else if(/econom|ආර්ථික/i.test(n))subject='Economics';
 let category='PDF Notes';
 if(/past\s*paper|pastpaper|\bpaper\b|ප්‍රශ්න/i.test(n))category='Past Papers';
 else if(/revision|පුනරීක්ෂණ/i.test(n))category='Revision Materials';
 const grade=/\b(?:grade|gr)\s*(?:10|11)\b|\bo\s*\/?\s*l\b/i.test(n)?'O/L':/\b(?:grade|gr)\s*(?:12|13)\b|\ba\s*\/?\s*l\b/i.test(n)?'A/L':null;
 return{title:n||name,year,subject,category,grade,ict:/\bict\b|information\s*(?:and|&)\s*communication/i.test(n)};
}
function field(tag,options,value){const s=document.createElement('select');s.dataset.field=tag;for(const [v,label] of options){const o=document.createElement('option');o.value=v;o.textContent=label;s.append(o);}s.value=value;return s;}
const subjects=[['','Select subject'],['Accounting','Accounting'],['Business Studies','Business Studies'],['Economics','Economics'],['Other','Other / ICT (database compatibility)']];const cats=[['','Select type'],['Past Papers','Past Papers'],['PDF Notes','Notes'],['Revision Materials','Revision']];
function preview(){
 const root=$('bulk-preview');if(!root){say('Missing bulk-preview element in admin/index.html');return;}
 root.replaceChildren();
 for(const entry of queue){
  const d=detect(entry.file.name),row=document.createElement('div');row.className='bulk-row';
  const label=document.createElement('strong');label.textContent=entry.file.name;
  const sub=field('subject',subjects,d.subject),cat=field('category',cats,d.category);
  const year=document.createElement('span');year.textContent=d.year||'No year';
  const title=document.createElement('input');title.value=d.title;title.maxLength=180;title.setAttribute('aria-label','PDF title');
  const grade=field('grade',[['A/L','A/L'],['O/L','O/L']],d.grade||$('bulk-grade').value);
  entry.controls={sub,cat,title,grade};
  const note=document.createElement('small');note.textContent=d.ict?'ICT is stored under Other (database restriction).':(!d.year?'No year in filename; file will remain searchable by title.':'');
  row.append(label,year,sub,cat,grade,title,note);root.append(row);
 }
 $('bulk-submit').disabled=!queue.length;
}
$('bulk-files').addEventListener('change',e=>{
 queue=[...e.target.files].filter(f=>/\.pdf$/i.test(f.name));
 $('bulk-info').textContent=`${queue.length} PDFs ready to upload. Check detected details below.`;
 preview();
});
$('bulk-grade').addEventListener('change',()=>{for(const x of queue){if(x.controls)x.controls.grade.value=$('bulk-grade').value;}});
$('bulk-submit').addEventListener('click',async()=>{if(!allowed)return;const bad=queue.find(x=>!x.controls||!x.controls.sub.value||!x.controls.cat.value||!x.controls.title.value.trim());if(bad){say('Review missing subject, type and title for '+bad.file.name);return;}const btn=$('bulk-submit');btn.disabled=true;let ok=0,failed=[];for(const x of queue){let path=null;try{const f=x.file;if(f.size===0||f.size>10*1024*1024)throw Error('File must be 1 byte to 10 MB');if(!/^application\/pdf$/i.test(f.type)&&f.type!=='')throw Error('Not a PDF');path=`pdf/${crypto.randomUUID()}.pdf`;const {error:up}=await db.storage.from('society-materials').upload(path,f,{contentType:'application/pdf'});if(up)throw up;const values={title:x.controls.title.value.trim(),title_si:null,subject:x.controls.sub.value,grade:x.controls.grade.value,category:x.controls.cat.value,kind:'pdf',note_text:null,file_path:path};const {error:ins}=await db.from('society_materials').insert(values);if(ins)throw ins;ok++;}catch(e){if(path)await db.storage.from('society-materials').remove([path]);failed.push(`${x.file.name}: ${e.message||e}`);}say(`Uploaded ${ok}/${queue.length}. ${failed.length?'Errors: '+failed.join(' | '):'All done.'}`);}queue=queue.filter(x=>failed.some(f=>f.startsWith(x.file.name+':')));$('bulk-files').value='';preview();btn.disabled=!queue.length;await load();});
async function load(){const {data,error}=await db.from('society_materials').select('*').order('created_at',{ascending:false}).limit(2000);if(error){say(error.message);return;}published=data||[];draw();}
function draw(){const q=$('admin-material-search').value.toLowerCase(),root=$('materials-admin-list');root.replaceChildren();for(const x of published.filter(x=>[x.title,x.subject,x.category,x.grade].join(' ').toLowerCase().includes(q))){const row=document.createElement('div');row.className='material-admin-row';const label=document.createElement('span');label.textContent=`${x.title} · ${x.subject} · ${x.category||''} · ${x.grade}`;const btn=document.createElement('button');btn.type='button';btn.textContent='Delete';btn.onclick=async()=>{if(!confirm('Delete this material permanently?'))return;btn.disabled=true;const {error}=await db.from('society_materials').delete().eq('id',x.id);if(error){say(error.message);btn.disabled=false;return;}if(x.file_path){const {error:e}=await db.storage.from('society-materials').remove([x.file_path]);if(e)say('Record deleted; storage cleanup failed: '+e.message);}await load();};row.append(label,btn);root.append(row);}}
$('admin-material-search').addEventListener('input',draw);
async function verify(){const {data:{user}}=await db.auth.getUser();if(!user){allowed=false;$('materials-panel').hidden=true;return;}const {data,error}=await db.rpc('is_society_admin');allowed=!error&&data===true;$('materials-panel').hidden=!allowed;if(allowed)await load();}
db.auth.onAuthStateChange(()=>setTimeout(verify,0));verify();
