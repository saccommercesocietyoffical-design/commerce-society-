import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './supabase-config.js';
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const grid=document.getElementById('dynamic-gallery-videos');
const si=document.documentElement.lang.toLowerCase().startsWith('si');
if(grid){
 const {data,error}=await db.from('society_gallery_videos').select('id,title,title_si,source_type,video_url,youtube_id').order('created_at',{ascending:false}).limit(100);
 grid.replaceChildren();
 if(error){const p=document.createElement('p');p.textContent=si?'වීඩියෝ පූරණය කළ නොහැක.':'Unable to load videos.';grid.append(p);console.error(error);}
 else if(!data?.length){const p=document.createElement('p');p.textContent=si?'වීඩියෝ ඉදිරියේදී මෙහි පළ වේ.':'Videos will appear here soon.';grid.append(p);}
 else for(const item of data){
  const card=document.createElement('figure');card.className='gallery-video-card';
  if(item.source_type==='youtube'){
   const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(item.youtube_id);frame.title=(si&&item.title_si)||item.title;frame.loading='lazy';frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;card.append(frame);
  }else{
   const vid=document.createElement('video');vid.controls=true;vid.preload='metadata';vid.playsInline=true;vid.src=item.video_url;card.append(vid);
  }
  const cap=document.createElement('figcaption');cap.textContent=(si&&item.title_si)||item.title;card.append(cap);grid.append(card);
 }
}
