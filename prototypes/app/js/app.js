/* Оболочка: Drawer, AppHeader с глобальным поиском, PageHeader, пустые состояния разделов. Управление демо вынесено в demo.js. */
(function(){
const {I,BPLOGO,esc,store,notify,route,go,render} = BP;

const NAV = [
  {h:'#/payments', ic:'finance', t:'Платежи подрядчикам'},
  {h:'#/search', ic:'search', t:'ИИ поиск'},
  {h:'#/documents', ic:'doc', t:'Документы'},
  {h:'#/counterparties', ic:'people', t:'Контрагенты'},
  {h:'#/products', ic:'box', t:'Товары'},
  {sep:1},
  {h:'#/section/tasks', ic:'task', t:'Задачи'},
  {h:'#/section/processes', ic:'stage', t:'Настройщик процессов'},
  {h:'#/section/integrations', ic:'link', t:'Интегратор'},
  {h:'#/section/data-flow', ic:'flow', t:'Data flow'},
  {h:'#/section/wiki', ic:'table', t:'Wiki Hub'}
];
/* ---------- Drawer ---------- */
function drawer(){
  const d=document.getElementById('drawer'); const open=localStorage.getItem('bp-drawer')==='1';
  d.classList.toggle('open',open);
  d.innerHTML = `<div class="logo"><img src="assets/logo.png" alt=""><span>BusinessPad</span></div>
  <div class="nav">${NAV.map(n=>n.sep?'<div class="sep"></div>':`<a href="${n.h}" data-h="${n.h}" title="${esc(n.t)}">${I(n.ic)}<span class="lbl">${esc(n.t)}</span></a>`).join('')}</div>
  <button class="toggle" id="dtoggle" aria-label="Развернуть меню">${I(open?'back':'menu')}</button>`;
  d.querySelector('#dtoggle').onclick=()=>{ localStorage.setItem('bp-drawer', d.classList.contains('open')?'0':'1'); drawer(); markNav(); };
}
function markNav(){
  const p='#'+BP.parseHash().path;
  document.querySelectorAll('.nav a').forEach(a=>{ const h=a.dataset.h; a.classList.toggle('on', h==='#/'?p==='#/':p.startsWith(h.split('?')[0])); });
}

/* ---------- AppHeader: крошки + глобальный поиск + аватар ---------- */
let crumbs=[];
function setCrumbs(list, back){ if(back!==undefined) list._back=back; crumbs=list; const el=document.getElementById('crumbs'); if(!el) return;
  el.innerHTML = (back?`<button class="back" onclick="history.length>1?history.back():BP.go('#/')">${I('back','ic16')}Назад</button>`:'') +
    list.map((c,i)=> i===list.length-1?`<span class="cur body1">${esc(c[0])}</span>`:`<a href="${c[1]||'#/'}">${esc(c[0])}</a><span class="muted">/</span>`).join(' ');
}
function appbar(){
  document.getElementById('appbar').innerHTML = `<div class="crumbs" id="crumbs"></div><div class="sp"></div>
    <div class="gsearch search" id="gsearch">${I('search')}<input class="inp" id="gq" placeholder="Поиск по системе" autocomplete="off" aria-label="Глобальный поиск"></div>
    <div class="avatar" style="background-image:url(assets/user.png)" title="${esc(store.s.company.user)}"></div>`;
  window.SEARCH && SEARCH.bindHeader(document.getElementById('gq'));
}

/* ---------- PageHeader по capsule-паттернам: Title + plus, справа Фильтры, BP help, magic, ⋮ ---------- */
function ph(title, o={}){
  return `<div class="ph"><div class="title"><h1 class="h1">${esc(title)}</h1>${o.counter!=null?`<span class="counter">${o.counter}</span>`:''}${o.plus?`<button class="plus" title="${esc(o.plus)}" data-act="plus">${I('add')}</button>`:''}</div>
  <div class="acts">${o.extra||''}${o.filters?`<button class="btn pri out">${I('filter')}Фильтры</button>`:''}
  <button class="ibtn" title="Справка BusinessPad">${BPLOGO}</button>
  <button class="ibtn magic ${MP_open()?'on':''}" data-act="mp" title="MagicPad: ИИ-помощник Феликс">${I('shine')}</button>
  <button class="ibtn" data-act="dots" title="Ещё">${I('more')}</button></div></div>`;
}
const MP_open = () => window.MP && MP.isOpen();
/* делегирование кнопок PageHeader */
document.addEventListener('click', e=>{
  const b=e.target.closest('[data-act]'); if(!b) return;
  const a=b.dataset.act;
  if(a==='mp'){ MP.toggle(); }
  else if(a==='dots'){ popMenu(b,[['table','Настроить колонки',()=>{}],['doc','Экспорт в Excel',()=>{}]]); }
  else if(a==='plus'){ MP.open(); MP.slash(); }
});
function popMenu(anchor, items){
  closePop(); const r=anchor.getBoundingClientRect(); const p=document.createElement('div'); p.className='popper'; p.id='pop';
  p.style.top=(r.bottom+4+scrollY)+'px'; p.style.left=Math.max(8,r.right-240)+'px'; p.style.position='fixed'; p.style.top=(r.bottom+4)+'px';
  p.innerHTML=items.map((it,i)=>`<div class="mi" data-i="${i}">${I(it[0])}${esc(it[1])}</div>`).join('');
  p.onclick=e=>{ const m=e.target.closest('.mi'); if(m){ closePop(); items[+m.dataset.i][2](); } };
  document.body.appendChild(p); setTimeout(()=>document.addEventListener('click',closePop,{once:true}),0);
}
function closePop(){ const p=document.getElementById('pop'); p&&p.remove(); }
function resetDemo(){ store.reset(); window.MP&&MP.resetUi(); go('#/payments'); render(); }
/* Стартовый экран продукта: «Платежи подрядчикам» (макет 2943-387267) */
route(/^\/$/, ()=>{ location.replace('#/payments'); });
/* Разделы без живой реализации: пустое состояние в стиле продукта, без прототипных пояснений */
const SECT={tasks:'Задачи',processes:'Настройщик процессов',integrations:'Интегратор','data-flow':'Data flow',wiki:'Wiki Hub'};
route(/^\/section\/([\w-]+)$/, ([k])=>{ const t=SECT[k]||k; setCrumbs([[t]]);
  content(`<div class="page">${ph(t)}<div class="paper empty"><b>Нет данных</b>Здесь появятся записи раздела</div></div>`); });
route(/^\/soon\/([\w-]+)$/, ()=>location.replace('#/payments'));

function content(html){ const c=document.getElementById('content'); c.innerHTML=html; c.scrollTop=0; }

window.APP = {
  start(){ drawer(); appbar(); window.MP&&MP.mount(); render(); },
  afterRender(path){ window.DEMO&&DEMO.refresh(); if(!/^\/(import|drafts)\//.test(path)){ document.getElementById('overlay').innerHTML=''; document.querySelectorAll('.sp-back,.sidepage').forEach(x=>x.remove()); } document.querySelectorAll('.selpop').forEach(x=>x.remove()); markNav(); setCrumbs(crumbs, crumbs._back); },
  setCrumbs, ph, content, popMenu, updateHint:()=>window.DEMO&&DEMO.refresh(), resetDemo
};
})();
