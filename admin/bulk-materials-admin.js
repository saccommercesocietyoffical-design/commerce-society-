import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import {SUPABASE_URL,SUPABASE_ANON_KEY} from "../supabase-config.js";
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const el=id=>document.getElementById(id);
const input=el('bulk-files'), preview=el('bulk-preview'), status=el('bulk-status'), upload=el('bulk-upload'), stop=el('bulk-stop');
let entries=[],running=false,stopRequested=false;
const subjects=['Accounting','Business Studies','Economics','ICT','Other'];
const categories=['Past Papers','PDF Notes','Revision Materials'];
const clean=name=>name.replace(/\.pdf$/i,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
function classify(file){
 const name=clean(file.name), low=name.toLowerCase();
 let subject='';
 if(/\b(accounting|accounts|accountancy)\b/i.test(name)||/ගිණුම්කරණ/.test(name))subject='Accounting';
 else if(/\b(business\s*studies|business\s*study|bst)\b/i.test(name)||/ව්‍යාපාර\s*අධ්‍යයන/.test(name))subject='Business Studies';
 else if(/\b(economics|economic|econ)\b/i.test(name)||/ආර්ථික/.test(name))subject='Economics';
 else if(/\b(ict|information\s*(?:and\s*)?communication\s*technology|information\s*technology)\b/i.test(name)||/තොරතුරු\s*හා\s*සන්නිවේදන/.test(name))subject='ICT';
 let category='';
 if(/\b(past\s*papers?|pastpaper|papers?|exam(?:ination)?|model\s*papers?|ප්‍රශ්න)/i.test(name))category='Past Papers';
 else if(/\b(revision|revise|පුනරීක්ෂණ)/i.test(name))category='Revision Materials';
 else if(/\b(notes?|lesson|short\s*notes?|සටහන්)/i.test(name))category='PDF Notes';
 const years=name.match(/(?:19|20)\d{2}/g)||[];
 return {file,name,subject,category,year:years.length===1?years[0]:'',problem:years.length>1?'Multiple years in filename':''};
}
function select(options,value,change){const s=document.createElement('select');s.className='bulk-choice';for(const item of options){const o=document.createElement('option');o.value=item;o.textContent=item||'— Review / select —';s.append(o);}s.value=value;s.onchange=()=>change(s.value);return s;}
function valid(x){return !!(x.subject&&x.category&&x.year&&/^(19|20)\d{2}$/.test(x.year)&&x.file.size>0&&x.file.size<=10*1024*1024&&/\.pdf$/i.test(x.file.name));}
function draw(){preview.replaceChildren();let good=0;for(const x of entries){const row=document.createElement('div');row.className='bulk-row';const heading=document.createElement('strong');heading.textContent=x.file.name;row.append(heading);
 const fields=document.createElement('div');fields.className='bulk-fields';
 const make=(label,node)=>{const box=document.createElement('label');box.textContent=label;box.append(node);fields.append(box);};
 make('Subject',select(['',...subjects],x.subject,v=>{x.subject=v;draw()}));
 make('Category',select(['',...categories],x.category,v=>{x.category=v;draw()}));
 const y=document.createElement('input');y.type='text';y.inputMode='numeric';y.maxLength=4;y.placeholder='Year (e.g. 2026)';y.value=x.year;y.oninput=()=>{x.year=y.value.trim();updateReady()};make('Year',y);
 row.append(fields);const info=document.createElement('small');info.className='bulk-file-info';info.textContent=x.file.size>10*1024*1024?'Too large (max 10 MB)':x.file.size===0?'Empty file':x.problem||(!x.subject||!x.category||!x.year?'Review missing details':'Ready');row.append(info);preview.append(row);if(valid(x))good++;}updateReady();}
function updateReady(){const good=entries.filter(valid).length;upload.disabled=running||good===0;upload.textContent=`Upload ${good} valid PDF${good===1?'':'s'}`;if(!running)status.textContent=`${entries.length} selected · ${good} ready · ${entries.length-good} need review or exceed limits.`;}
input.addEventListener('change',()=>{if(running)return;entries=Array.from(input.files||[]).filter(f=>/\.pdf$/i.test(f.name)).map(classify);draw();});
stop.addEventListener('click',()=>{stopRequested=true;stop.disabled=true;status.textContent='Stopping after the current file…';});
upload.addEventListener('click',async()=>{
 if(running)return;
 const {data:{user},error:authErr}=await db.auth.getUser();if(authErr||!user){status.textContent='Sign in as an admin first.';return;}
 const {data:allowed,error:roleErr}=await db.rpc('is_society_admin');if(roleErr||allowed!==true){status.textContent='Admin permission required.';return;}
 const batch=entries.filter(valid).map(x=>({...x}));if(!batch.length)return;
 running=true;stopRequested=false;input.disabled=true;el('bulk-grade').disabled=true;stop.hidden=false;stop.disabled=false;updateReady();let success=0,fail=0;const errors=[];
 for(let i=0;i<batch.length;i++){
  if(stopRequested)break;
  const x=batch[i];status.textContent=`Uploading ${i+1}/${batch.length}: ${x.file.name} · ${success} completed · ${fail} failed`;
  let path=null;
  try{
   path=`pdf/${crypto.randomUUID()}.pdf`;
   const {error:storageError}=await db.storage.from('society-materials').upload(path,x.file,{contentType:'application/pdf',upsert:false});if(storageError)throw storageError;
   const {error:insertError}=await db.from('society_materials').insert({title:x.name,title_si:null,subject:x.subject,grade:el('bulk-grade').value,category:x.category,kind:'pdf',note_text:null,file_path:path});if(insertError)throw insertError;
   success++;
  }catch(err){fail++;errors.push(`${x.file.name}: ${err.message||err}`);if(path)await db.storage.from('society-materials').remove([path]);}
 }
 running=false;input.disabled=false;el('bulk-grade').disabled=false;stop.hidden=true;
 status.textContent=`Finished: ${success} uploaded, ${fail} failed.${stopRequested?' Stopped early.':''} ${errors.slice(0,3).join(' | ')}`;
 // Keep failed and unclassified files in the picker for review; remove only successfully uploaded entries.
 if(success){input.value='';entries=[];preview.replaceChildren();}
 updateReady();status.textContent=`Finished: ${success} uploaded, ${fail} failed.${stopRequested?' Stopped early.':''} ${errors.slice(0,3).join(' | ')}`;
 });
