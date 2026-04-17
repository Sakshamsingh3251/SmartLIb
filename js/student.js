let currentUser=null, activeZone='All', activeCat='All';
let activeRes=null, resTimer=null, myBookings=[];
// Save demo data and keep SEATS as the working array
const SEATS_DEMO = [...SEATS]; // Backup of demo data from data.js

document.addEventListener('DOMContentLoaded', async ()=>{
  currentUser = requireAuth('student');
  if(!currentUser) return;
  document.getElementById('stuNameDisplay').textContent = currentUser.name;
  
  // Load seats from API (with fallback to demo)
  await loadSeatsFromAPI();
  buildZoneTabs(); 
  renderSeats();
  buildCatTabs(); 
  renderRacks();
  renderBookings();
  
  // Refresh seats every 3 seconds for real-time updates
  setInterval(loadSeatsFromAPI, 3000);
});

// Fetch seats from database via API with fallback to demo data
async function loadSeatsFromAPI() {
  try {
    const response = await fetch(`${API_URL}/seats.php?action=get`);
    const result = await response.json();
    
    if (result.success && result.data.seats && result.data.seats.length > 0) {
      // Load from API
      SEATS.length = 0; // Clear array
      result.data.seats.forEach(s => {
        SEATS.push({
          id: s.seat_id,
          zone: s.zone,
          amenities: s.amenities,
          status: s.status,
          reservedBy: s.reserved_by,
          occupiedBy: s.occupied_by
        });
      });
      console.log('✓ Loaded', SEATS.length, 'seats from database API');
    } else {
      // Fallback to demo data if API returns empty
      SEATS.length = 0;
      SEATS_DEMO.forEach(s => SEATS.push({...s}));
      console.log('⚠ API empty, using demo data:', SEATS.length, 'seats');
    }
    
    // Update display if we're on seats section
    if (document.getElementById('seatGrid')) {
      renderSeats();
    }
  } catch(e) {
    console.error('✗ Error loading seats from API:', e);
    // Fallback to demo data on error
    SEATS.length = 0;
    SEATS_DEMO.forEach(s => SEATS.push({...s}));
    console.log('⚠ API failed, using demo data:', SEATS.length, 'seats');
    if (document.getElementById('seatGrid')) {
      renderSeats();
    }
  }
}

// Override showSection to update page title
const _origShow = showSection;
window.showSection = function(id, el) {
  _origShow(id, el);
  const titles = {seats:'Find a Seat', books:'Browse Books', mybookings:'My Bookings'};
  document.getElementById('pageTitle').textContent = titles[id] || '';
};

/* ---- ZONE TABS ---- */
function buildZoneTabs(){
  const c=document.getElementById('zoneTabs');
  const zones=['All',...new Set(SEATS.map(s=>s.zone))];
  c.innerHTML=zones.map(z=>`<button class="zone-tab${z===activeZone?' active':''}" onclick="selectZone('${z}')">${z}</button>`).join('');
}
function selectZone(z){activeZone=z;buildZoneTabs();renderSeats();}

/* ---- SEATS ---- */
function renderSeats(){
  const g=document.getElementById('seatGrid');
  const q=(document.getElementById('seatSearch')?.value||'').toLowerCase();
  const list=SEATS.filter(s=>(activeZone==='All'||s.zone===activeZone)&&(!q||s.id.toLowerCase().includes(q)||s.zone.toLowerCase().includes(q)));
  if(!list.length){g.innerHTML='<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-chair"></i><p>No seats match your search.</p></div>';return;}
  g.innerHTML=list.map(s=>{
    const emoji={available:'🪑',reserved:'⏳',occupied:'✅'}[s.status];
    const label={available:'Available',reserved:'Reserved',occupied:'Occupied'}[s.status];
    const isMyRes=activeRes&&activeRes.seatId===s.id;
    const timer=s.status==='reserved'?`<span class="seat-timer" id="sti_${s.id}">${isMyRes?fmt(activeRes.timeLeft):'Hold'}</span>`:'';
    const click=s.status==='available'?`onclick="openRes('${s.id}')"`:s.status==='reserved'&&isMyRes?`onclick="document.getElementById('reserveModal').classList.remove('hidden')"`:''
    return `<div class="seat-card ${s.status}" ${click} id="sc_${s.id}">${timer}<span class="seat-emoji">${emoji}</span><span class="seat-id">${s.id}</span><span class="seat-zone-lbl">${s.zone}</span><span class="seat-badge">${label}</span></div>`;
  }).join('');
}
function filterSeats(){renderSeats();}

/* ---- RESERVATION ---- */
function openRes(id){
  if(activeRes){showToast('You already have an active reservation!','warning');return;}
  const seat=SEATS.find(s=>s.id===id);
  if(!seat||seat.status!=='available')return;
  document.getElementById('mTitle').textContent=`Reserve Seat ${id}`;
  document.getElementById('mDesc').textContent=`Zone: ${seat.zone} · ${seat.amenities}`;
  makeQR('qrGrid','qrLbl',id);
  document.getElementById('reserveModal').classList.remove('hidden');
  startTimer(id);
}

async function startTimer(id){
  const TOTAL=600;
  let t=TOTAL;
  const seat=SEATS.find(s=>s.id===id);
  
  if(!seat) {
    showToast('Seat not found', 'error');
    return;
  }
  
  // Send booking request to API
  try {
    const response = await fetch(`${API_URL}/seats.php?action=book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        seat_id: id,
        student_id: currentUser.id || currentUser.user_id
      })
    });
    const result = await response.json();
    
    if (!result.success) {
      showToast('Booking failed: ' + (result.message || 'Unknown error'), 'error');
      console.error('Booking error:', result);
      closeModal('reserveModal');
      return;
    }
    
    console.log('✓ Booking successful:', result);
  } catch(e) {
    showToast('Error booking seat: ' + e.message, 'error');
    console.error('Booking exception:', e);
    closeModal('reserveModal');
    return;
  }
  
  activeRes={seatId:id,timeLeft:t};
  myBookings.unshift({seatId:id,zone:seat.zone,startTime:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),timeLeft:t,status:'reserved'});
  updateBadge(); 
  renderSeats();
  renderBookings();
  
  // Show modal with timer
  document.getElementById('mTitle').textContent=`⏱ Reserved: ${id}`;
  document.getElementById('mDesc').textContent=`Zone: ${seat.zone} · ${seat.amenities}`;
  document.getElementById('reserveModal').classList.remove('hidden');
  
  const ring=document.getElementById('ringFill');
  if(resTimer)clearInterval(resTimer);
  
  resTimer=setInterval(()=>{
    t--; 
    if(!activeRes) {
      clearInterval(resTimer);
      return;
    }
    activeRes.timeLeft=t;
    const bk=myBookings.find(b=>b.seatId===id); 
    if(bk) bk.timeLeft=t;
    
    document.getElementById('timerNum').textContent=fmt(t);
    const pct=t/TOTAL; 
    ring.style.strokeDashoffset=226.2*(1-pct);
    
    if(pct<0.3){
      ring.style.stroke='#ef4444';
      document.getElementById('timerNum').style.color='#ef4444';
    }
    
    const sti=document.getElementById('sti_'+id); 
    if(sti) sti.textContent=fmt(t);
    
    const bti=document.getElementById('bti_'+id); 
    if(bti){
      bti.textContent=fmt(t);
      if(t<120) bti.style.color='#ef4444';
    }
    
    if(t<=0) expireRes(id);
  },1000);
  
  showToast(`Seat ${id} reserved for 10 minutes!`, 'success');
}

async function confirmCheckin(){
  if(!activeRes) return;
  const id=activeRes.seatId;
  
  // Send check-in request to API
  try {
    const response = await fetch(`${API_URL}/seats.php?action=check_in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        seat_id: id,
        student_id: currentUser.id || currentUser.user_id
      })
    });
    const result = await response.json();
    if (!result.success) {
      showToast('Check-in failed: ' + (result.message || 'Unknown error'), 'error');
      console.error('Check-in error:', result);
      return;
    }
    console.log('✓ Check-in successful:', result);
  } catch(e) {
    showToast('Error checking in: ' + e.message, 'error');
    console.error('Check-in exception:', e);
    return;
  }
  
  clearInterval(resTimer); 
  resTimer=null;
  const bk=myBookings.find(b=>b.seatId===id); 
  if(bk){
    bk.status='checked-in';
    bk.timeLeft=null;
  }
  activeRes=null;
  closeModal('reserveModal'); 
  await loadSeatsFromAPI();
  renderSeats(); 
  renderBookings();
  showToast(`✓ Checked in to seat ${id}!`,'success');
}

async function cancelRes(){
  if(activeRes) {
    const id = activeRes.seatId;
    try {
      const response = await fetch(`${API_URL}/seats.php?action=release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          seat_id: id,
          student_id: currentUser.id || currentUser.user_id
        })
      });
      const result = await response.json();
      if (result.success) {
        console.log('✓ Reservation cancelled');
        expireRes(id, 'cancelled');
      } else {
        showToast('Failed to cancel: ' + result.message, 'error');
      }
    } catch(e) {
      console.error('Cancel error:', e);
      expireRes(id, 'cancelled');
    }
  }
  closeModal('reserveModal');
}

async function expireRes(id,reason='expired'){
  clearInterval(resTimer); 
  resTimer=null;
  myBookings=myBookings.filter(b=>b.seatId!==id);
  activeRes=null;
  closeModal('reserveModal'); 
  await loadSeatsFromAPI();
  renderSeats(); 
  renderBookings(); 
  updateBadge();
  showToast(reason==='cancelled'?`Reservation for ${id} cancelled.`:`Hold for seat ${id} expired.`,reason==='cancelled'?'info':'warning');
}
function updateBadge(){
  const b=document.getElementById('bookBadge');
  b.textContent=myBookings.length||'';
  b.style.display=myBookings.length?'':'none';
}

/* ---- MY BOOKINGS ---- */
function renderBookings(){
  const c=document.getElementById('bookingsList');
  if(!myBookings.length){c.innerHTML='<div class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><p>No active bookings yet.<br/>Reserve a seat from <strong>Find a Seat</strong>.</p></div>';return;}
  c.innerHTML=myBookings.map(b=>{
    const active=b.timeLeft!=null&&b.status==='reserved';
    return `<div class="booking-item"><div class="booking-seat-ico">🪑</div><div class="booking-info"><div class="booking-seat-name">Seat ${b.seatId}</div><div class="booking-zone-name">${b.zone}</div><div class="booking-time-str">Reserved at ${b.startTime} · ${b.status==='checked-in'?'✅ Checked in':'⏳ Reserved'}</div></div>${active?`<div class="booking-timer-num" id="bti_${b.seatId}">${fmt(b.timeLeft)}</div>`:''}${active?`<button class="btn-cancel-bk" onclick="expireRes('${b.seatId}','cancelled')"><i class="fa-solid fa-ban"></i> Cancel</button>`:''}</div>`;
  }).join('');
}

/* ---- BOOKS / RACKS ---- */
function buildCatTabs(){
  const c=document.getElementById('bookCatTabs');
  const cats=['All',...new Set(RACKS.map(r=>r.genre))];
  c.innerHTML=cats.map(g=>`<button class="zone-tab${g===activeCat?' active':''}" onclick="selectCat('${g}')">${g}</button>`).join('');
}
function selectCat(g){activeCat=g;buildCatTabs();renderRacks();}
function renderRacks(){
  const c=document.getElementById('racksContainer');
  const q=(document.getElementById('bookSearch')?.value||'').toLowerCase();
  const racks=RACKS.filter(r=>activeCat==='All'||r.genre===activeCat);
  if(!racks.length){c.innerHTML='<div class="empty-state"><i class="fa-solid fa-layer-group"></i><p>No racks found.</p></div>';return;}
  c.innerHTML=racks.map(rack=>{
    const books=rack.books.filter(b=>!q||b.title.toLowerCase().includes(q)||b.author.toLowerCase().includes(q)||rack.genre.toLowerCase().includes(q));
    const avail=books.filter(b=>b.status==='available').length;
    const borr=books.filter(b=>b.status==='borrowed').length;
    const [bg,col]=(GENRE_COLORS[rack.genre]||'#dbeafe:#2563eb').split(':');
    const ico=GENRE_ICONS[rack.genre]||'fa-book';
    return `<div class="rack-block"><div class="rack-head" onclick="toggleRack('rb_${rack.id}',this)"><div class="rack-head-left"><div class="rack-genre-icon" style="background:${bg};color:${col}"><i class="fa-solid ${ico}"></i></div><div><div class="rack-head-name">${rack.name}</div><div class="rack-head-meta">${rack.location} · ${books.length} books</div></div></div><div class="rack-head-stats"><span class="rack-stat-chip chip-green"><i class="fa-solid fa-circle-check" style="font-size:10px"></i> ${avail}</span><span class="rack-stat-chip chip-red"><i class="fa-solid fa-circle-xmark" style="font-size:10px"></i> ${borr}</span><i class="fa-solid fa-chevron-down rack-toggle"></i></div></div><div class="rack-books" id="rb_${rack.id}">${books.map(b=>bookCard(b)).join('')}</div></div>`;
  }).join('');
}
function bookCard(b){
  const ico=b.status==='available'?'📚':'❌';
  const lbl=b.status==='available'?'Available':'Borrowed';
  return `<div class="book-card ${b.status}"><div class="book-status-dot"></div><div class="book-icon">${ico}</div><div class="book-title" title="${b.title}">${b.title}</div><div class="book-author">${b.author}</div><span class="book-tag"><i class="fa-solid ${b.status==='available'?'fa-circle-check':'fa-circle-xmark'}" style="font-size:9px"></i> ${lbl}</span></div>`;
}
function filterBooks(){renderRacks();}
function toggleRack(id,hd){
  const el=document.getElementById(id), tg=hd.querySelector('.rack-toggle');
  const hidden=el.style.display==='none';
  el.style.display=hidden?'grid':'none';
  tg.classList.toggle('open',hidden);
}
function makeQR(gId,lId,label){
  const g=document.getElementById(gId); if(!g)return;
  g.innerHTML='';
  for(let i=0;i<100;i++){const r=Math.floor(i/10),c2=i%10,isCo=(r<3&&c2<3)||(r<3&&c2>6)||(r>6&&c2<3),d=document.createElement('div');d.className='qr-cell';d.style.background=isCo?'#1e4db7':(((i*37+(label.charCodeAt(i%label.length)||0))%100)>45?'#1e4db7':'#fff');g.appendChild(d);}
  const l=document.getElementById(lId); if(l)l.textContent=`QR: ${label}`;
}