import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("PASTE_") && !SUPABASE_ANON_KEY.includes("PASTE_");
if (configured) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase.from("society_profile_photos").select("role, public_url");
  (data || []).forEach(item => {
    const img = document.querySelector(`[data-member-photo="${item.role}"]`);
    if (img && item.public_url) {
      img.src = item.public_url;
      img.addEventListener("load", () => img.closest(".member-photo-wrap")?.classList.add("photo-loaded"), { once: true });
    }
  });
}
