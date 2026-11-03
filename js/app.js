(() => {
  'use strict';
  const CONFIG = window.AJV_CONFIG || {mode: 'demo'};
  const demoMode = CONFIG.mode !== 'netlify';
  const STORAGE_KEY = 'ajv-mariners-demo-inquiries-v1';
  const {addDays, isValidStay, eligibleRoomKeys, exportCsv} = window.AJV_UTILS;
  const $ = (id) => document.getElementById(id);
  const qs = (selector) => document.querySelector(selector);
  const rooms = {
    classic: {title:'Classic Room Concept', desc:'A visual example of a room for a solo guest or couple. This is not an actual inventory entry. The owner will provide room dimensions, photographs, amenities, capacity and pricing.', guests:2, image:'assets/room-classic.svg'},
    twin: {title:'Twin Room Concept', desc:'A proposed presentation for guests requesting separate beds. Exact bed types and available rooms must be verified with the owner.', guests:2, image:'assets/room-twin.svg'},
    family: {title:'Family Room Concept', desc:'A proposed presentation for families or small groups. Room size, maximum occupancy and arrangements have not been confirmed.', guests:4, image:'assets/room-family.svg'}
  };
  const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  };
  const plusDay = (value) => addDays(value, 1);
  const validDates = (checkin, checkout) => isValidStay(checkin, checkout, today());
  const dialog = (id) => $(id);
  const openDialog = (id) => { const d=dialog(id); if(d && !d.open) d.showModal(); };
  const closeDialog = (id) => { const d=dialog(id); if(d && d.open) d.close(); };
  const formatDate = (value) => {
    if (!value) return 'Date not provided';
    const d = new Date(`${value}T12:00:00`);
    return d.toLocaleDateString('en-PH', {day:'numeric', month:'short', year:'numeric'});
  };
  const readDemoInquiries = () => {
    try {const arr=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(arr)?arr:[];}catch{return []}
  };
  const saveDemoInquiry = (entry) => {
    try { const list=readDemoInquiries();list.unshift(entry);localStorage.setItem(STORAGE_KEY,JSON.stringify(list.slice(0,100)));return true;}
    catch{return false}
  };

  $('copyrightYear').textContent = String(new Date().getFullYear());
  // A concept prototype is intentionally not indexed. Remove noindex only at owner-approved launch.
  if (!demoMode) {
    const notice = $('formModeNotice');
    notice.textContent='Live inquiry submission is enabled. Your request will be sent to the inn’s configured form inbox, pending staff confirmation.';
    qs('.demo-banner').querySelector('strong').textContent='Launch setup required';
    // Owner-facing demo controls are never presented to public visitors in live mode.
    document.querySelectorAll('[data-open-owner], #ownerDialog, #inboxDialog').forEach(el => {el.hidden = true;});
  } else {
    $('formModeNotice').textContent='DEMONSTRATION MODE: Your inquiry remains in this browser only. It is not sent to the inn, and no room is reserved.';
  }

  const menu = $('menuToggle');
  const closeMenu = () => {menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');$('mainNav').classList.remove('open');};
  menu.addEventListener('click', () => {const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));menu.setAttribute('aria-label',expanded?'Open navigation':'Close navigation');$('mainNav').classList.toggle('open',!expanded)});
  document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')closeMenu();});
  document.addEventListener('click',(event)=>{if(!event.target.closest('.nav-inner'))closeMenu();});
  document.querySelectorAll('[data-open-owner]').forEach(b=>b.addEventListener('click',()=>openDialog('ownerDialog')));
  document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.dataset.closeDialog)));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',(e)=>{if(e.target===d)d.close()}));

  const dateFields=['quickCheckin','quickCheckout','formCheckin','formCheckout'];
  dateFields.forEach(id=>$(id).min=today());
  const checkoutMin = (source,target) => {const input=$(source);const out=$(target);out.min=input.value?plusDay(input.value):plusDay(today());if(out.value && input.value && out.value<=input.value)out.value=out.min;};
  $('quickCheckin').addEventListener('change',()=>checkoutMin('quickCheckin','quickCheckout'));
  $('formCheckin').addEventListener('change',()=>checkoutMin('formCheckin','formCheckout'));
  checkoutMin('quickCheckin','quickCheckout');checkoutMin('formCheckin','formCheckout');

  function showInquiry(prefRoom){
    $('inquiryIntro').hidden=false;$('inquirySuccess').hidden=true;$('inquiryError').hidden=true;
    if($('quickCheckin').value)$('formCheckin').value=$('quickCheckin').value;
    checkoutMin('formCheckin','formCheckout');
    if($('quickCheckout').value)$('formCheckout').value=$('quickCheckout').value;
    $('formGuests').value=$('quickGuests').value;
    if(prefRoom)$('formRoom').value=prefRoom;
    openDialog('inquiryDialog');
  }
  const searchNotice = $('searchNotice');
  $('quickSearchForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const checkin=$('quickCheckin').value, checkout=$('quickCheckout').value;
    if(!validDates(checkin,checkout)){searchNotice.textContent='Choose valid dates. Check-in cannot be in the past and check-out must be later.';searchNotice.classList.add('error');(checkin < today() ? $('quickCheckin') : $('quickCheckout')).focus();return;}
    searchNotice.classList.remove('error');
    const guests=Number($('quickGuests').value);
    const eligible=eligibleRoomKeys(rooms, guests);
    document.querySelectorAll('[data-room]').forEach(card=>{card.hidden=!eligible.includes(card.dataset.room)});
    if(eligible.length){searchNotice.textContent=`Showing ${eligible.length} example room concept${eligible.length>1?'s':''} for ${guests} guest${guests>1?'s':''}. Real availability must be checked by staff.`;
      $('formRoom').value=eligible.length===1?eligible[0]:'other';
    } else {searchNotice.textContent='No demo room concepts fit this party size. You can still request other options from staff.';$('formRoom').value='other';}
    showInquiry(eligible.length===1?eligible[0]:'other');
  });

  let selectedRoom='classic';
  document.querySelectorAll('[data-room-select]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.roomSelect;const room=rooms[key];if(!room)return;
    selectedRoom=key;
    $('roomDialogTitle').textContent=room.title;
    $('roomDialogDescription').textContent=room.desc;
    $('roomDialogImage').src=room.image;
    $('roomDialogGuests').textContent=`Sample: up to ${room.guests} guests`;
    openDialog('roomDialog');
  }));
  $('chooseRoomBtn').addEventListener('click',()=>{closeDialog('roomDialog');showInquiry(selectedRoom)});
  document.querySelectorAll('a[href="#inquire"]').forEach(link=>link.addEventListener('click',(e)=>{
    // In the site we keep these as accessible anchor links; booking bar is the primary entry point.
    if(e.currentTarget.classList.contains('booking-direct')){e.preventDefault();showInquiry();}
  }));

  const demoFill = $('fillDemoInquiry');
  if (demoMode) {
    demoFill.hidden = false;
    demoFill.addEventListener('click', () => {
      const start=addDays(today(), 3), end=addDays(start, 2);
      $('formCheckin').value=start; checkoutMin('formCheckin','formCheckout');
      $('formCheckout').value=end; $('formGuests').value='2'; $('formRoom').value='classic';
      $('formName').value='Demo Guest'; $('formEmail').value='demo.guest@example.com';
      $('inquiryError').hidden=true; $('formName').focus();
    });
  }

  $('inquiryForm').addEventListener('submit',async(e)=>{
    e.preventDefault();const form=e.currentTarget;const error=$('inquiryError');error.hidden=true;
    const checkin=$('formCheckin').value,checkout=$('formCheckout').value;
    if(!validDates(checkin,checkout)){error.textContent='Choose valid stay dates. Check-in cannot be in the past, and check-out must be later than check-in.';error.hidden=false;($('formCheckin').value && $('formCheckin').value >= today() ? $('formCheckout') : $('formCheckin')).focus();return;}
    if(!form.reportValidity())return;
    const selected=$('formRoom').value;
    if(!selected){error.textContent='Select a preferred room or choose Ask staff for options.';error.hidden=false;$('formRoom').focus();return;}
    if(rooms[selected] && Number($('formGuests').value)>rooms[selected].guests){error.textContent='This example room has a lower sample capacity. Choose another room or Ask staff for options.';error.hidden=false;$('formRoom').focus();return;}
    const values=new FormData(form);
    const reference=`${demoMode?'DEMO':'AJV'}-${new Date().toISOString().replace(/\D/g,'').slice(2,14)}-${Math.floor(Math.random()*900+100)}`;
    const entry={reference, createdAt:new Date().toISOString(), status:'Pending staff confirmation', name:String(values.get('name')||'').trim(), email:String(values.get('email')||'').trim(), phone:String(values.get('phone')||'').trim(), checkin, checkout, room:selected, guests:String(values.get('guests')||''), message:String(values.get('message')||'').trim()};
    const submit=$('submitInquiry');submit.disabled=true;submit.textContent='Submitting…';
    try{
      if(demoMode){if(!saveDemoInquiry(entry))throw new Error('Your browser storage is unavailable. Please allow local storage and try again.');}
      else {
        // Netlify Forms processes the form from static HTML at deploy time.
        values.set('form-name','reservation-inquiry');
        values.set('reference',reference);
        const payload=new URLSearchParams();values.forEach((value,key)=>payload.append(key,value));
        const result=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload.toString()});
        if(!result.ok)throw new Error(`Form service returned HTTP ${result.status}. The request may not have been saved.`);
      }
      $('inquiryIntro').hidden=true;$('inquirySuccess').hidden=false;
      $('inquiryReference').textContent=reference;
      $('successMessage').textContent=demoMode?'Your sample request has been stored in this browser only. Open Owner Preview to see it in the demo inbox. No room has been booked.':'Your inquiry has been submitted. Please wait for the inn to contact you directly. A room has not yet been reserved.';
      form.reset();
    }catch(err){error.textContent=`Unable to record the inquiry. ${err instanceof Error?err.message:'Please try again.'}`;error.hidden=false;}
    finally{submit.disabled=false;submit.innerHTML='Submit inquiry <span aria-hidden="true">↗</span>';}
  });

  function renderInbox(){
    const parent=$('inboxContent');parent.replaceChildren();
    if(!demoMode){const el=document.createElement('div');el.className='inbox-empty';el.textContent='Live mode: Netlify Forms entries are managed in the Netlify dashboard, not in this browser-only demo inbox.';parent.appendChild(el);return;}
    const inquiries=readDemoInquiries();
    if(!inquiries.length){const el=document.createElement('div');el.className='inbox-empty';el.textContent='No demo requests yet. Try the guest inquiry form to see a sample entry here.';parent.appendChild(el);return;}
    for(const entry of inquiries){
      const card=document.createElement('div');card.className='inbox-entry';
      const title=document.createElement('strong');title.textContent=`${entry.reference} · ${entry.name}`;
      const details=document.createElement('small');details.textContent=`${formatDate(entry.checkin)} → ${formatDate(entry.checkout)} · ${entry.guests} guest(s) · ${rooms[entry.room]?.title||'Other options'}`;
      const contact=document.createElement('p');contact.textContent=`Contact: ${entry.email}${entry.phone?' · '+entry.phone:''}`;
      const notes=document.createElement('p');notes.textContent=`Status: ${entry.status}${entry.message?' · Notes: '+entry.message:''}`;
      card.append(title,details,contact,notes);parent.appendChild(card);
    }
  }
  $('openDemoInbox').addEventListener('click',()=>{closeDialog('ownerDialog');renderInbox();openDialog('inboxDialog')});
  $('tryDemoInquiry').addEventListener('click',()=>{closeDialog('ownerDialog');showInquiry('classic');if(demoMode)demoFill.click();});
  $('clearInbox').addEventListener('click',()=>{if(!demoMode)return;if(!confirm('Remove all sample inquiries from this browser?'))return;localStorage.removeItem(STORAGE_KEY);renderInbox()});
  $('exportInbox').addEventListener('click',()=>{
    const records=readDemoInquiries();if(!records.length){alert('No demo inquiries to export.');return;}
    const columns=['reference','createdAt','status','name','email','phone','checkin','checkout','room','guests','message'];
    const csv=exportCsv(records,columns);
    const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ajv-demo-inquiries.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  });
})();
