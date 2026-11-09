import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabase-config.js";
const $ = id => document.getElementById(id);
const roles = ["teacher","president","secretary","treasurer"];
const roleNames = {teacher:"Teacher-in-Charge",president:"President",secretary:"Secretary",treasurer:"Treasurer"};
const status = $("status");
if (SUPABASE_URL.includes("PASTE_") || SUPABASE_ANON_KEY.includes("PASTE_")) {
  $("setup-note").textContent = "Setup required: add your Supabase Project URL and anon/public key to supabase-config.js before signing in.";
  $("setup-note").hidden = false;
  $("setup-note").style.color = "#9b2c2c";
  $("login-form").querySelector("button").disabled = true;
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  async function refresh() {
    const {data:{session}} = await supabase.auth.getSession();
    $("login-panel").hidden = !!session; $("upload-panel").hidden = !session;
    if (session) await loadCurrent();
  }
  async function loadCurrent() {
    const {data,error} = await supabase.from("society_profile_photos").select("role,public_url");
    const target = $("current-photos"); target.replaceChildren();
    if (error) { status.textContent = error.message; return; }
    roles.forEach(role => {
      const card=document.createElement("div"); card.className="current-photo";
      const item=(data||[]).find(x=>x.role===role);
      if(item?.public_url){const img=document.createElement("img");img.src=item.public_url;img.alt=roleNames[role];card.append(img);}
      else {const empty=document.createElement("div");empty.style.cssText="aspect-ratio:1;background:#f5f2eb;border-radius:8px;display:grid;place-items:center;color:#8a8f93;font-size:11px";empty.textContent="No photo";card.append(empty);}
      const label=document.createElement("span");label.textContent=roleNames[role];card.append(label);target.append(card);
    });
  }
  $("login-form").addEventListener("submit",async e=>{e.preventDefault();const b=e.currentTarget.querySelector("button");b.disabled=true;status.textContent="Signing in…";const {error}=await supabase.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});status.textContent=error?error.message:"Signed in.";b.disabled=false;if(!error)await refresh();});
  $("logout").addEventListener("click",async()=>{await supabase.auth.signOut();status.textContent="Signed out.";await refresh();});
  $("photo").addEventListener("change",()=>{const f=$("photo").files[0],p=$("preview");if(!f){p.hidden=true;return;}p.src=URL.createObjectURL(f);p.hidden=false;});
  $("upload-form").addEventListener("submit",async e=>{
    e.preventDefault();const file=$("photo").files[0];if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){status.textContent="Choose a JPG, PNG or WebP image.";return;}
    if(file.size>5*1024*1024){status.textContent="Image must be 5 MB or smaller.";return;}
    const button=e.currentTarget.querySelector("button");button.disabled=true;status.textContent="Uploading photo…";
    const role=$("role").value,ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
    const path=`team/${role}-${Date.now()}.${ext}`;
    const {error:uploadError}=await supabase.storage.from("society-photos").upload(path,file,{cacheControl:"3600",upsert:true,contentType:file.type});
    if(uploadError){status.textContent=uploadError.message;button.disabled=false;return;}
    const {data:urlData}=supabase.storage.from("society-photos").getPublicUrl(path);
    const {error:saveError}=await supabase.from("society_profile_photos").upsert({role,storage_path:path,public_url:urlData.publicUrl},{onConflict:"role"});
    status.textContent=saveError?saveError.message:`${roleNames[role]} photo uploaded successfully.`;
    if(!saveError){$("photo").value="";$("preview").hidden=true;await loadCurrent();}
    button.disabled=false;
  });
  supabase.auth.onAuthStateChange(()=>refresh());
  refresh();
}
