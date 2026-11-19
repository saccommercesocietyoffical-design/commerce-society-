import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import {SUPABASE_URL,SUPABASE_ANON_KEY} from "./supabase-config.js";
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const si=document.documentElement.lang==='si';
const section=document.querySelector('.materials-section');
if(section){
 const list=section.querySelector('.materials-grid'),subject=section.querySelector('.material-subject'),grade=section.querySelector('.material-grade');
 let items=[],trail=[];
 const tr=(en,sn)=>si?sn:en;
 const yearOf=x=>{const match=String(x.title||'').match(/(?:19|20)\d{2}/);return match?match[0]:tr('General','සාමාන්‍ය');};
 const typeOf=x=>{const c=(x.category||'').toLowerCase();return c.includes('past')?'Past Papers':c.includes('revision')?'Revision': 'Notes';};
 const label=t=>({ 'Past Papers':tr('Past Papers','පසුගිය ප්‍රශ්න පත්‍ර'),'Notes':tr('Notes','සටහන්'),'Revision':tr('Revision','පුනරීක්ෂණ')}[t]||t);
 const filtered=()=>items.filter(x=>(!subject.value||x.subject===subject.value)&&(!grade.value||(grade.value==='O/L'&&['O/L','Grade 10','Grade 11'].includes(x.grade))||(grade.value==='A/L'&&['A/L','Grade 12','Grade 13'].includes(x.grade))));
 const button=(name,detail,click)=>{const b=document.createElement('button');b.type='button';b.className='study-folder';const i=document.createElement('span');i.className='study-folder-icon';i.textContent='📁';const title=document.createElement('strong');title.textContent=name;const sub=document.createElement('small');sub.textContent=detail;b.append(i,title,sub);b.addEventListener('click',click);list.append(b);};
 function render(){list.replaceChildren();const arr=filtered();const nav=document.createElement('div');nav.className='study-breadcrumb';const home=document.createElement('button');home.type='button';home.textContent=tr('All subjects','සියලු විෂයයන්');home.onclick=()=>{trail=[];render()};nav.append(home);trail.forEach((part,i)=>{const sep=document.createElement('span');sep.textContent=' / ';const step=document.createElement('button');step.type='button';step.textContent=label(part);step.onclick=()=>{trail=trail.slice(0,i+1);render()};nav.append(sep,step)});list.append(nav);
 if(!arr.length){const p=document.createElement('p');p.textContent=tr('No study materials available yet.','තවම අධ්‍යයන සම්පත් නොමැත.');list.append(p);return;}
 const depth=trail.length;let current=arr;
 if(depth>=1)current=current.filter(x=>x.subject===trail[0]);
 if(depth>=2)current=current.filter(x=>typeOf(x)===trail[1]);
 if(depth>=3)current=current.filter(x=>yearOf(x)===trail[2]);
 if(depth<3){let names;if(depth===0)names=[...new Set(current.map(x=>x.subject))].sort();else if(depth===1)names=['Past Papers','Notes','Revision'].filter(n=>current.some(x=>typeOf(x)===n));else names=[...new Set(current.map(yearOf))].sort((a,b)=>b.localeCompare(a));
 if(!names.length){const p=document.createElement('p');p.textContent=tr('This folder is empty.','මෙම ෆෝල්ඩරය හිස්ය.');list.append(p)}
 names.forEach(name=>{const count=current.filter(x=>depth===0?x.subject===name:depth===1?typeOf(x)===name:yearOf(x)===name).length;button(label(name),`${count} ${tr(count===1?'item':'items','ගොනු')}`,()=>{trail.push(name);render()})});return;}
 if(!current.length){const p=document.createElement('p');p.textContent=tr('This folder is empty.','මෙම ෆෝල්ඩරය හිස්ය.');list.append(p)}
 current.forEach(x=>{const card=document.createElement('article');card.className='material-card';const meta=document.createElement('small');meta.textContent=`${x.subject} · ${x.grade} · ${x.kind==='pdf'?'PDF':'NOTE'}`;const h=document.createElement('h3');h.textContent=(si&&x.title_si)||x.title;card.append(meta,h);if(x.kind==='pdf'&&x.file_path){const a=document.createElement('a');a.className='material-download';a.textContent=tr('View / download PDF ↗','PDF බලන්න / බාගත කරන්න ↗');a.href=db.storage.from('society-materials').getPublicUrl(x.file_path).data.publicUrl;a.target='_blank';a.rel='noopener noreferrer';card.append(a)}else if(x.kind==='note'){const note=document.createElement('p');note.className='material-note';note.textContent=x.note_text||'';card.append(note)}list.append(card)});
 }
 subject.addEventListener('change',()=>{trail=[];render()});grade.addEventListener('change',()=>{trail=[];render()});
 (async()=>{const {data,error}=await db.from('society_materials').select('id,title,title_si,subject,grade,category,kind,note_text,file_path,created_at').order('created_at',{ascending:false}).limit(2000);if(error){list.textContent=tr('Could not load study materials.','සම්පත් පූරණය කළ නොහැක.');return;}items=data||[];render()})();
}
