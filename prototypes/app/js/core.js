/* Ядро пилота: иконки, хранилище (localStorage), утилиты, роутер, уведомления. */
(function(){
const P = {
  chat:'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H5.17L4 17.17V4h16z',
  puzzle:'M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 0 0 0-5',
  abox:'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5a2 2 0 0 0-2-2m-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6m7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58z',
  dot:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10', cards:'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z',
  key:'M12.65 10A6 6 0 0 0 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a6 6 0 0 0 5.65-4H17v4h4v-4h2v-4zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2',
  book:'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2M6 4h5v8l-2.5-1.5L6 12z',
  video:'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11z',
  person:'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4',
  mail:'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z',
  fit:'M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2m2 10H3v4c0 1.1.9 2 2 2h4v-2H5zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2',
  down:'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8z', up:'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z',
  diamond:'M12 2 2 12l10 10 10-10zm0 3 7 7-7 7-7-7z', loop:'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8m0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4z',
  lock:'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z',
  menu:'M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z', close:'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  add:'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z', search:'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14',
  more:'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2',
  filter:'M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04c-.83 0-1.3.95-.79 1.61',
  back:'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z', chev:'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z', drop:'m7 10 5 5 5-5z',
  shine:'M10 2.5 11.8 7.7 17 9.5 11.8 11.3 10 16.5 8.2 11.3 3 9.5 8.2 7.7zM18 13l.9 2.6 2.6.9-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9zM18 2l.7 1.8 1.8.7-1.8.7L18 7l-.7-1.8-1.8-.7 1.8-.7z',
  check:'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z', attach:'M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6z',
  upload:'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96M14 13v4h-4v-4H7l5-5 5 5z',
  mic:'M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72z',
  copy:'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z',
  thup:'M1 21h4V9H1zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73z',
  thdown:'M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2m4 0v12h4V3z',
  reply:'M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11',
  emoji:'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5m-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11m3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5',
  send:'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z', expand:'M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z', collapse:'M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z',
  doc:'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z',
  home:'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', cal:'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V10h14z',
  bag:'M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2m-6 0h-4V5h4z',
  table:'M3 3v18h18V3zm8 16H5v-6h6zm0-8H5V5h6zm8 8h-6v-6h6zm0-8h-6V5h6z', finance:'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4',
  people:'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5',
  box:'M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2m-5 12H9v-2h6zm5-7H4V4l16-.02z',
  stage:'M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z', settings:'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6',
  flow:'M17 16l-4-4V8.82C14.16 8.4 15 7.3 15 6c0-1.66-1.34-3-3-3S9 4.34 9 6c0 1.3.84 2.4 2 2.82V12l-4 4H3v5h5v-3.05l4-4.2 4 4.2V21h5v-5z',
  task:'M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-9 14-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9z',
  bell:'M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2m6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1z',
  info:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z', warn:'M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z', ok:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z',
  edit:'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z', reset:'M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z',
  link:'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5', play:'M8 5v14l11-7z', exit:'M10.09 15.59 11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67zM19 3H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2'
};
const I = (n,c='') => `<svg class="ic ${c}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${P[n]||P.info}"/></svg>`;
const PDF = `<svg class="ic ic16" viewBox="0 0 24 24"><path fill="#F32A16" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8z"/><text x="12" y="18" font-size="6" text-anchor="middle" fill="#fff" font-family="Fira Sans" font-weight="600">PDF</text></svg>`;
const BPLOGO = `<svg class="ic" viewBox="0 0 24 24"><path fill="#343A7E" d="M6 3h7.5a5.5 5.5 0 0 1 2.9 10.2A5.5 5.5 0 0 1 13.5 21H9v-3h4.5a2.5 2.5 0 0 0 0-5H9v-3h4.5a2.5 2.5 0 0 0 0-5H9v16H6z"/><circle cx="18.5" cy="5.5" r="2" fill="#60B5F8"/></svg>`;

const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => (Math.round(n*100)/100).toLocaleString('ru-RU',{minimumFractionDigits:0,maximumFractionDigits:2}).replace(/\u00a0/g,' ')+' ₽';
const norm = s => String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[«»"'“”]/g,'').replace(/\s+/g,' ').trim();
const nowTime = () => new Date().toTimeString().slice(0,5);
const parseD = d => { const [a,b,c]=String(d).split('.'); return new Date(+c,+b-1,+a); };

/* ---------- Хранилище ---------- */
const KEY='bp-pilot-v7';
const clone = o => JSON.parse(JSON.stringify(o));
function fresh(){ const d=clone(window.DEMO_DATA); return Object.assign(d,{recent:['СтройМонолит','ТН-0842'],chat:[],progress:{},drafts:{},seq:1}); }
let state;
try{ state = JSON.parse(localStorage.getItem(KEY)) || fresh(); }catch(e){ state = fresh(); }
const store = {
  get s(){ return state; },
  save(){ localStorage.setItem(KEY, JSON.stringify(state)); },
  reset(){ localStorage.removeItem(KEY); state=fresh(); store.save(); },
  id(p){ state.seq=(state.seq||1)+1; return p+'-'+Date.now().toString(36)+state.seq; },
  cp: id => state.counterparties.find(x=>x.id===id),
  doc: id => state.documents.find(x=>x.id===id),
  prod: id => state.products.find(x=>x.id===id),
  proc: id => state.processes.find(x=>x.id===id),
  inst: id => state.instances.find(x=>x.id===id),
  task: id => state.tasks.find(x=>x.id===id),
  mark(k){ state.progress[k]=Date.now(); store.save(); window.APP && APP.updateHint && APP.updateHint(); }
};

/* ---------- Уведомления (Snackbar слева сверху, не больше 3) ---------- */
function notify(text, kind='success', ms=4000){
  const box=document.getElementById('snacks'); if(!box) return;
  const el=document.createElement('div'); el.className='snack '+kind; el.setAttribute('role','status');
  el.innerHTML=`${I(kind==='success'?'ok':kind==='error'?'warn':'info')}<div>${text}</div><span class="x">${I('close','ic16')}</span>`;
  el.querySelector('.x').onclick=()=>el.remove();
  box.prepend(el); while(box.children.length>1) box.lastChild.remove();
  if(ms) setTimeout(()=>el.remove(), ms);
}

/* ---------- Статусы → цвета чипов (пастельные токены, разные статусы разными цветами) ---------- */
const CHIP = {'Работает':'green','Опубликован':'green','Предстоящая':'blue','Завершена':'grey','Отменена':'mgrey','Активный':'green','В архиве':'grey','На согласовании':'yellow','Оплачен':'green','На утверждении':'blue','Запланирован':'orange','Просрочен':'grey','Согласован':'lav',
  'Действующий':'green','На проверке':'yellow','Новый':'blue','Черновик':'yellow','В работе':'blue','Завершён':'green','Новая':'lav','Действует':'green','Архив':'grey','Подписан':'green','Сохранён':'green','Предстоящая':'yellow','Высокий':'orange','Средний':'lav','В каталоге':'green'};
const chip = s => `<span class="chip ${CHIP[s]||'grey'}">${esc(s)}</span>`;
const hl = (text,q) => { const t=esc(text); if(!q) return t; const qs=norm(q).split(' ').filter(x=>x.length>1); let out=t;
  qs.forEach(w=>{ const re=new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/е/g,'[её]')+')','ig'); out=out.replace(re,'<mark>$1</mark>'); }); return out; };

/* ---------- Роутер ---------- */
const routes=[];
const route = (re, fn) => routes.push([re,fn]);
function parseHash(){ const h=location.hash.replace(/^#/,'')||'/'; const [p,q='']=h.split('?'); return {path:p, query:Object.fromEntries(new URLSearchParams(q))}; }
function go(h){ if(location.hash===h) render(); else location.hash=h; }
function render(){
  const {path,query}=parseHash();
  for(const [re,fn] of routes){ const m=path.match(re); if(m){ try{ fn(m.slice(1),query); }catch(e){ console.error(e); throw e; } window.APP && APP.afterRender && APP.afterRender(path); return; } }
  go('#/');
}
window.addEventListener('hashchange', render);

window.BP = {I,PDF,BPLOGO,esc,money,norm,nowTime,parseD,store,notify,chip,hl,route,go,render,parseHash};
})();
