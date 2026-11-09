import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const grid=document.getElementById('dynamic-gallery');
const sinhala=document.documentElement.lang.toLowerCase().startsWith('si');
async function load(){const {data,error}=await db.from('society_gallery').select('id,title,title_si,category,image_url').order('created_at',{ascending:false}).limit(1000);if(error){console.error('Gallery:',error.message);return;}grid.replaceChildren();if(!data?.length){const p=document.createElement('p');p.className='gallery-empty';p.textContent=sinhala?'ඡායාරූප ඉදිරියේදී මෙහි පළ වේ.':'Gallery photos will appear here soon.';grid.append(p);return;}for(const item of data){const card=document.createElement('figure');card.className='gallery-photo-card';const img=document.createElement('img');img.src=item.image_url;img.alt=(sinhala&&item.title_si)||item.title;img.loading='lazy';const caption=document.createElement('figcaption');const title=document.createElement('strong');title.textContent=(sinhala&&item.title_si)||item.title;const cat=document.createElement('small');cat.textContent=item.category;caption.append(title,cat);card.append(img,caption);grid.append(card);}}
load();
