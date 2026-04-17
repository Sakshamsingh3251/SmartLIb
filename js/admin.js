let admZone='All', admBookCat='All', admSeatTarget=null, flatBooks=[];

document.addEventListener('DOMContentLoaded',()=>{
  const u=requireAuth('admin'); if(!u)return;
  document.getElementById('admNameDisplay').textContent=u.name;
  buildFlatBooks();
  refreshDash();
  buildAdmZoneTabs(); renderAdminSeats();
  renderAdminRacks();
  buildAdmBookCatTabs(); renderAdminBooks();
  renderUsers();
  updateDashTime();
  setInterval(updateDashTime,60000);
});

const _origShow2=showSection;
window.showSection=function(id,el){
  _origShow2(id,el);
  const titles={dashboard:'Dashboard',seats:'Seat Manager',racks:'Rack Manager',books:'Book Inventory',users:'Active Users'};
  document.getElementById('pageTitle').textContent=titles[id]||'';
};

function updateDashTime(){const t=new Date();document.getElementById('dashTime').textContent=`Updated: ${t.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})} at ${t.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;}
function buildFlatBooks(){flatBooks=RACKS.flatMap(r=>r.books.map(b=>({...b,genre:r.genre,rackName:r.name,rackId:r.id})));}
function refreshDash(){renderSeatStats();renderBookStats();renderRecentRes();renderZoneUtil();updateDashTime();showToast('Dashboard refreshed!','success');}

function renderSeatStats(){
  const c=document.getElementById('seatStats');
  const tot=SEATS.length,avail=SEATS.filter(s=>s.status==='available').length,res=SEATS.filter(s=>s.status==='reserved').length,occ=SEATS.filter(s=>s.status==='occupied').length;
  const util=Math.round(((res+occ)/tot)*100);
  c.innerHTML=[
    {cls:'stripe-blue',  icls:'icon-blue',  ico:'fa-chair',        num:tot,   lbl:'Total Seats',  sub:'Library capacity'},
    {cls:'stripe-green', icls:'icon-green',  ico:'fa-circle-check', num:avail, lbl:'Available',    sub:'Ready to book'},
    {cls:'stripe-yellow',icls:'icon-yellow', ico:'fa-clock',        num:res,   lbl:'Reserved',     sub:'On hold now'},
    {cls:'stripe-red',   icls:'icon-red',    ico:'fa-user-check',   num:occ,   lbl:'Occupied',     sub:'In use'},
  ].map(s=>`<div class="stat-card"><div class="stat-card-stripe ${s.cls}"></div><div class="stat-card-icon ${s.icls}"><i class="fa-solid ${s.ico}"></i></div><div class="stat-card-num">${s.num}</div><div class="stat-card-lbl">${s.lbl}</div><div class="stat-card-sub">${s.sub}</div></div>`).join('');
}
function renderBookStats(){
  const c=document.getElementById('bookStats');
  const all=RACKS.flatMap(r=>r.books),tot=all.length,avail=all.filter(b=>b.status==='available').length,borr=all.filter(b=>b.status==='borrowed').length;
  c.innerHTML=[
    {cls:'stripe-blue',  icls:'icon-blue',  ico:'fa-book',        num:tot,          lbl:'Total Books',    sub:'In collection'},
    {cls:'stripe-green', icls:'icon-green',  ico:'fa-book-open',   num:avail,        lbl:'On Shelf',       sub:'Available now'},
    {cls:'stripe-red',   icls:'icon-red',    ico:'fa-bookmark',    num:borr,         lbl:'Borrowed',       sub:'Currently out'},
    {cls:'stripe-yellow',icls:'icon-yellow', ico:'fa-layer-group', num:RACKS.length, lbl:'Total Racks',    sub:'Across library'},
  ].map(s=>`<div class="stat-card"><div class="stat-card-stripe ${s.cls}"></div><div class="stat-card-icon ${s.icls}"><i class="fa-solid ${s.ico}"></i></div><div class="stat-card-num">${s.num}</div><div class="stat-card-lbl">${s.lbl}</div><div class="stat-card-sub">${s.sub}</div></div>`).join('');
}
function renderRecentRes(){
  const c=document.getElementById('recentRes');
  const list=SEATS.filter(s=>s.status!=='available'&&s.reservedBy);
  if(!list.length){c.innerHTML='<p style="font-size:13px;color:var(--text-muted);padding:4px 0">No active reservations.</p>';return;}
  c.innerHTML=`<table class="data-table"><thead><tr><th>Seat</th><th>Zone</th><th>Student</th><th>Status</th></tr></thead><tbody>${list.map(s=>`<tr><td><strong>${s.id}</strong></td><td>${s.zone}</td><td>${s.reservedBy}</td><td><span class="tag ${s.status==='reserved'?'tag-reserved':'tag-occupied'}">${s.status}</span></td></tr>`).join('')}</tbody></table>`;
}
function renderZoneUtil(){
  const c=document.getElementById('zoneUtil');
  const zones=[...new Set(SEATS.map(s=>s.zone))];
  c.innerHTML=zones.map(z=>{const zs=SEATS.filter(s=>s.zone===z),used=zs.filter(s=>s.status!=='available').length,pct=Math.round(used/zs.length*100);return `<div class="util-item"><div class="util-label"><span>${z}</span><span>${used}/${zs.length} · ${pct}%</span></div><div class="util-bg"><div class="util-fill" style="width:${pct}%"></div></div></div>`}).join('');
}

/* ---- ADMIN SEAT MANAGER ---- */
function buildAdmZoneTabs(){
  const c=document.getElementById('admZoneTabs');
  const zones=['All',...new Set(SEATS.map(s=>s.zone))];
  c.innerHTML=zones.map(z=>`<button class="zone-tab${z===admZone?' active':''}" onclick="admSelZone('${z}')">${z}</button>`).join('');
}
function admSelZone(z){admZone=z;buildAdmZoneTabs();renderAdminSeats();}
function renderAdminSeats(){
  const g=document.getElementById('admSeatGrid');
  const q=(document.getElementById('admSeatSearch')?.value||'').toLowerCase();
  const list=SEATS.filter(s=>(admZone==='All'||s.zone===admZone)&&(!q||s.id.toLowerCase().includes(q)||s.zone.toLowerCase().includes(q)));
  const emoji={available:'🪑',reserved:'⏳',occupied:'✅'};
  const labels={available:'Available',reserved:'Reserved',occupied:'Occupied'};
  g.innerHTML=list.map(s=>`<div class="seat-card ${s.status}" onclick="openAdmSeat('${s.id}')"><span class="seat-emoji">${emoji[s.status]}</span><span class="seat-id">${s.id}</span><span class="seat-zone-lbl">${s.zone}</span><span class="seat-badge">${labels[s.status]}</span></div>`).join('');
}
function openAdmSeat(id){
  const s=SEATS.find(x=>x.id===id); if(!s)return;
  admSeatTarget=id;
  document.getElementById('admMTitle').textContent=`Seat ${id}`;
  document.getElementById('admMDesc').textContent=`Zone: ${s.zone} · ${s.amenities}`;
  document.getElementById('admMStudent').textContent=s.reservedBy?`Currently: ${s.reservedBy}`:'';
  const g=document.getElementById('admQrGrid'),l=document.getElementById('admQrLbl');
  g.innerHTML='';
  for(let i=0;i<100;i++){const r=Math.floor(i/10),c2=i%10,isCo=(r<3&&c2<3)||(r<3&&c2>6)||(r>6&&c2<3),d=document.createElement('div');d.className='qr-cell';d.style.background=isCo?'#4f46e5':(((i*37+(id.charCodeAt(i%id.length)||0))%100)>45?'#4f46e5':'#fff');g.appendChild(d);}
  l.textContent=`QR: ${id}`;
  document.getElementById('admSeatModal').classList.remove('hidden');
}
function setStatus(st){
  const s=SEATS.find(x=>x.id===admSeatTarget); if(!s)return;
  s.status=st; if(st==='available')s.reservedBy=null; if(st==='occupied'&&!s.reservedBy)s.reservedBy='Admin';
  closeModal('admSeatModal'); renderAdminSeats(); refreshDash();
  showToast(`Seat ${admSeatTarget} → ${st}`,'success');
}

/* ---- ADMIN RACKS ---- */
function renderAdminRacks(){
  const c=document.getElementById('admRacksContainer');
  c.innerHTML=RACKS.map(rack=>{
    const avail=rack.books.filter(b=>b.status==='available').length,borr=rack.books.filter(b=>b.status==='borrowed').length;
    const [bg,col]=(GENRE_COLORS[rack.genre]||'#dbeafe:#2563eb').split(':');
    const ico=GENRE_ICONS[rack.genre]||'fa-book';
    return `<div class="rack-block"><div class="rack-head" onclick="toggleRack('arb_${rack.id}',this)"><div class="rack-head-left"><div class="rack-genre-icon" style="background:${bg};color:${col}"><i class="fa-solid ${ico}"></i></div><div><div class="rack-head-name">${rack.name}</div><div class="rack-head-meta">${rack.location} · Cap: ${rack.capacity}</div></div></div><div class="rack-head-stats"><span class="rack-stat-chip" style="background:var(--blue-50);color:var(--blue-600)">${rack.books.length} total</span><span class="rack-stat-chip chip-green">${avail} avail</span><span class="rack-stat-chip chip-red">${borr} out</span><i class="fa-solid fa-chevron-down rack-toggle"></i></div></div><div class="rack-books" id="arb_${rack.id}">${rack.books.map(b=>admBookCard(b,rack.id)).join('')}</div></div>`;
  }).join('');
}
function admBookCard(b,rackId){
  return `<div class="book-card ${b.status}"><div class="book-status-dot"></div><div class="book-icon">${b.status==='available'?'📚':'❌'}</div><div class="book-title" title="${b.title}">${b.title}</div><div class="book-author">${b.author}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><span class="book-tag"><i class="fa-solid ${b.status==='available'?'fa-circle-check':'fa-circle-xmark'}" style="font-size:9px"></i> ${b.status==='available'?'Available':'Borrowed'}</span><button onclick="toggleBook('${b.id}','${rackId}')" style="font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:20px;background:var(--blue-50);color:var(--blue-600);cursor:pointer;border:none;font-family:inherit"><i class="fa-solid fa-rotate" style="font-size:9px"></i> Toggle</button></div></div>`;
}
function toggleBook(bId,rackId){
  const rack=RACKS.find(r=>r.id===rackId);if(!rack)return;
  const b=rack.books.find(x=>x.id===bId);if(!b)return;
  b.status=b.status==='available'?'borrowed':'available';
  b.borrowedBy=b.status==='borrowed'?'Admin Override':null;
  b.dueDate=b.status==='borrowed'?new Date(Date.now()+14*86400000).toISOString().split('T')[0]:null;
  buildFlatBooks(); renderAdminRacks(); renderAdminBooks(); refreshDash();
  showToast(`"${b.title}" marked as ${b.status}.`,'success');
}
function addRack(){
  const nm=prompt('New rack name (e.g. Arts Rack):'); if(!nm)return;
  const gn=prompt('Genre (Science/Literature/History/Technology/Mathematics/Philosophy/Arts):'); if(!gn)return;
  const loc=prompt('Location (e.g. Aisle 4, Row A):')||'TBD';
  RACKS.push({id:'rack-'+Date.now(),name:nm.trim(),genre:gn.trim(),location:loc,capacity:40,books:[]});
  buildFlatBooks(); renderAdminRacks(); refreshDash();
  showToast(`Rack "${nm}" added!`,'success');
}
function toggleRack(id,hd){
  const el=document.getElementById(id),tg=hd.querySelector('.rack-toggle');
  const h=el.style.display==='none';
  el.style.display=h?'grid':'none';
  tg.classList.toggle('open',h);
}

/* ---- ADMIN BOOKS TABLE ---- */
function buildAdmBookCatTabs(){
  const c=document.getElementById('admBookCatTabs');
  const cats=['All',...new Set(RACKS.map(r=>r.genre))];
  c.innerHTML=cats.map(g=>`<button class="zone-tab${g===admBookCat?' active':''}" onclick="admSelCat('${g}')">${g}</button>`).join('');
}
function admSelCat(g){admBookCat=g;buildAdmBookCatTabs();renderAdminBooks();}
function renderAdminBooks(){
  const c=document.getElementById('admBooksTable');
  const q=(document.getElementById('admBookSearch')?.value||'').toLowerCase();
  const list=flatBooks.filter(b=>(admBookCat==='All'||b.genre===admBookCat)&&(!q||b.title.toLowerCase().includes(q)||b.author.toLowerCase().includes(q)||b.genre.toLowerCase().includes(q)));
  if(!list.length){c.innerHTML='<div class="empty-state"><i class="fa-solid fa-book"></i><p>No books match your search.</p></div>';return;}
  c.innerHTML=`<div style="overflow-x:auto"><table class="data-table"><thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Rack</th><th>Status</th><th>Borrowed By</th><th>Due Date</th></tr></thead><tbody>${list.map(b=>`<tr><td>${b.title}</td><td>${b.author}</td><td><span class="genre-tag">${b.genre}</span></td><td>${b.rackName}</td><td><span class="tag ${b.status==='available'?'tag-available':'tag-borrowed'}">${b.status}</span></td><td>${b.borrowedBy||'—'}</td><td>${b.dueDate||'—'}</td></tr>`).join('')}</tbody></table></div>`;
}
function openAddBook(){
  const s=document.getElementById('nbRack');
  s.innerHTML=RACKS.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
  document.getElementById('addBookModal').classList.remove('hidden');
}
function addBook(){
  const title=document.getElementById('nbTitle').value.trim(),author=document.getElementById('nbAuthor').value.trim(),rackId=document.getElementById('nbRack').value;
  if(!title||!author){showToast('Please fill in title and author.','error');return;}
  const rack=RACKS.find(r=>r.id===rackId);if(!rack)return;
  rack.books.push({id:'b'+Date.now(),title,author,isbn:'N/A',status:'available',borrowedBy:null,dueDate:null});
  buildFlatBooks(); renderAdminRacks(); renderAdminBooks(); refreshDash();
  closeModal('addBookModal');
  document.getElementById('nbTitle').value=''; document.getElementById('nbAuthor').value='';
  showToast(`"${title}" added to ${rack.name}!`,'success');
}



function renderUsers(){
  const c=document.getElementById('usersGrid');
  c.innerHTML=ACTIVE_USERS.map(u=>`<div class="user-item"><div class="user-item-av"><i class="fa-solid fa-user-graduate"></i></div><div><div class="user-item-name">${u.name}</div><div class="user-item-id">${u.id}</div><div class="user-item-seat">${u.seat?`<i class="fa-solid fa-chair"></i> Seat ${u.seat}`:' Browsing'} <span style="font-size:11px;color:var(--gray-400);margin-left:6px">since ${u.since}</span></div></div></div>`).join('');
}