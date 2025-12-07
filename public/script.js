// public/script.js
// Prefers DB resources from functions/getResources, fallbacks to static `resources` from data.js

document.addEventListener("DOMContentLoaded", async () => {
  const dbResources = await fetchResources();
  const list = (dbResources && dbResources.length) ? dbResources : (typeof resources !== "undefined" ? resources : []);
  renderCategories(list);
  renderListByCategory(list, list.length ? (list[0].category || "All") : "All");

  document.getElementById("loadUsers").addEventListener("click", loadUsers);
});

async function fetchResources() {
  try {
    const res = await fetch("/.netlify/functions/getResources");
    if (!res.ok) throw new Error("not ok");
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("DB resources fetch failed:", err);
    return null;
  }
}

function renderCategories(list) {
  const cats = Array.from(new Set(list.map(i => i.category || "Other")));
  const el = document.getElementById("categories");
  el.innerHTML = cats.map(c => `<button class="tg-btn" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join(" ");
  el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    renderListByCategory(list, b.getAttribute("data-cat"));
  }));
}

function renderListByCategory(list, category) {
  const results = document.getElementById("results");
  const filtered = list.filter(i => (i.category || "").toString() === category);
  if (!filtered.length) {
    results.innerHTML = `<div class="tg-card">No resources in <b>${escapeHtml(category)}</b></div>`;
    return;
  }
  results.innerHTML = filtered.map(r => resourceCard(r)).join("");
}

function resourceCard(r) {
  const image = r.image || r.img || '';
  return `
    <div class="card mb-2" style="padding:12px;">
      <div class="d-flex">
        <img src="${escapeAttr(image)}" width="96" height="64" style="object-fit:cover; border-radius:6px; margin-right:12px;" onerror="this.style.display='none'"/>
        <div style="flex:1;">
          <div style="font-weight:700">${escapeHtml(r.name || r.title || '')}</div>
          <div style="font-size:13px; color:#555">${escapeHtml(r.type || '')} • ${escapeHtml(r.category || '')}</div>
          <div style="margin-top:8px;">
            <a class="tg-btn-link" href="${escapeAttr(r.link || '#')}" target="_blank">Open</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadUsers(){
  const out = document.getElementById("adminOut");
  out.textContent = "Loading...";
  try {
    // If ADMIN_TOKEN set, use fetch with header 'X-Admin-Token': 'yourtoken' (not set here)
    const res = await fetch("/.netlify/functions/getUsers");
    const json = await res.json();
    if (Array.isArray(json)) {
      out.textContent = json.map(u => `${u.id} — @${u.username || '-'} — ${u.first_name || ''} ${u.last_name || ''}`).join("\n");
    } else if (json.items) {
      out.textContent = JSON.stringify(json.items, null, 2);
    } else {
      out.textContent = JSON.stringify(json, null, 2);
    }
  } catch (err) {
    out.textContent = "Error: " + err.message;
  }
}

/* small helpers */
function escapeHtml(s){ if (!s) return ""; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }
