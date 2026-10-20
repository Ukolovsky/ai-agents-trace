/* Оболочка: Drawer, AppHeader с глобальным поиском, PageHeader, пустые состояния разделов. Управление демо вынесено в demo.js. */
(function(){
const {I,BPLOGO,esc,store,notify,route,go,render} = BP;

const NAV = [
  {h:'#/processes', ic:'bag', t:'Процессы', m:/^#\/(processes|process|payments|finop|instance|meetings|task)/},
  {h:'#/settings', ic:'settings', t:'Настройки', m:/^#\/(settings|constructor|counterpart|product|document)/},
  {sep:1},
  {h:'#/chat', ic:'chat', t:'Чат', m:/^#\/chat/}
];
/* ---------- Сайдбар как на стенде: 48 px свёрнут, 158 px развёрнут, стрелка внизу ---------- */
function drawer(){
  const d=document.getElementById('drawer'); const open=localStorage.getItem('bp-drawer')==='1';
  d.classList.toggle('open',open);
  d.innerHTML = `<a class="logo" href="#/" title="BusinessPad"><img src="assets/logo.png" alt=""><span>BusinessPad</span></a>
  <div class="nav">${NAV.map(n=>n.sep?'<div class="sep"></div>':`<a href="${n.h}" data-h="${n.h}" data-tip="${esc(n.t)}">${I(n.ic,'ic16')}<span class="lbl">${esc(n.t)}</span></a>`).join('')}
  <button class="toggle" id="dtoggle" aria-label="${open?'Свернуть меню':'Развернуть меню'}" data-tip="${open?'Свернуть':'Развернуть'}">${I(open?'back':'exit','ic16')}</button></div>`;
  d.querySelector('#dtoggle').onclick=()=>{ localStorage.setItem('bp-drawer', d.classList.contains('open')?'0':'1'); drawer(); markNav(); };
}
function markNav(){
  const p='#'+BP.parseHash().path;
  document.querySelectorAll('.nav a').forEach(a=>{ const n=NAV.find(x=>x.h===a.dataset.h); a.classList.toggle('on', !!(n&&n.m.test(p))); });
}

/* ---------- Шапка стенда: «← Назад» на вложенных страницах, поиск, иконка пользователя с поповером ---------- */
let crumbs=[];
function setCrumbs(list, back){ if(back!==undefined) list._back=back; crumbs=list; const el=document.getElementById('crumbs'); if(!el) return;
  const parent=list.length>1?list[list.length-2]:null;
  el.innerHTML = back?`<button class="back" id="hback">${I('back','ic16')}Назад</button>${parent?`<span class="cur">${esc(parent[0])}</span>`:''}`:'';
  const b=el.querySelector('#hback'); b&&(b.onclick=()=>{ parent&&parent[1]?go(parent[1]):(history.length>1?history.back():go('#/')); });
}
function appbar(){
  document.getElementById('appbar').innerHTML = `<div class="crumbs" id="crumbs"></div><div class="sp"></div>
    <div class="gsearch search" id="gsearch">${I('search','ic16')}<input class="inp" id="gq" placeholder="Введите поисковый запрос..." autocomplete="off" aria-label="Глобальный поиск"></div>
    <button class="ubtn" id="ubtn" title="Профиль" aria-label="Профиль">${I('abox','ic16')}</button>`;
  window.SEARCH && SEARCH.bindHeader(document.getElementById('gq'));
  document.getElementById('ubtn').onclick=e=>{ e.stopPropagation(); if(document.getElementById('upop')){ closeUpop(); return; }
    const p=document.createElement('div'); p.className='popper upop'; p.id='upop';
    p.innerHTML=`<div class="uhead">${I('abox')}<div><b>${esc(store.s.company.user)}</b><span class="cap muted">${esc(store.s.company.role)}</span></div></div>
      <div class="mi" data-u="profile">${I('person','ic16')}Настроить профиль</div><div class="mi" data-u="exit">${I('exit','ic16')}Выйти</div>`;
    p.onclick=ev=>{ const m=ev.target.closest('[data-u]'); if(!m) return; closeUpop(); if(m.dataset.u==='profile') go('#/settings/profile'); else notify('Демо-режим: выход отключён','info'); };
    document.body.appendChild(p); setTimeout(()=>document.addEventListener('click',closeUpopOut),0); };
}
function closeUpopOut(e){ if(e && e.target.closest && e.target.closest('#upop')) return; closeUpop(); }
function closeUpop(){ const p=document.getElementById('upop'); p&&p.remove(); document.removeEventListener('click',closeUpopOut); }

/* ---------- PageHeader по capsule-паттернам: Title + plus, справа Фильтры, BP help, magic, ⋮ ---------- */
function ph(title, o={}){
  return `<div class="ph"><div class="title">${o.icon?`<span class="tic">${I(o.icon,'ic24')}</span>`:''}<h1 class="h1">${esc(title)}</h1>${o.after||''}${o.counter!=null?`<span class="counter">${o.counter}</span>`:''}${o.plus?`<button class="plus fill" title="${esc(o.plus)}" data-act="${o.plusAct||'plus'}">${I('add','ic16')}</button>`:''}</div>
  <div class="acts">${o.extra||''}${o.filters?`<button class="btn pri out">${I('filter','ic16')}Фильтры</button>`:''}
  ${o.nomp?'':`<button class="ibtn magic ${MP_open()?'on':''}" data-act="mp" title="MagicPad">${I('shine','ic16')}</button>`}
  ${o.dots?`<button class="ibtn" data-act="dots" title="Ещё">${I('more')}</button>`:''}</div></div>`;
}
/* Переключатель вида как на стенде: кнопка-иконка + стрелка с меню Карточки/Таблица */
function viewSw(cur, key){ return `<span class="vsw"><button class="vi" data-vsw="${key}" title="${cur==='table'?'Таблица':'Карточки'}">${I(cur==='table'?'table':'cards','ic16')}</button><button class="vd" data-vsw-menu="${key}" title="Вид">${I('drop','ic16')}</button></span>`; }
function wsSelect(){ return `<label class="ssel"><select aria-label="Рабочая среда"><option>Рабочая среда</option><option>Все процессы</option></select></label>`; }
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
function resetDemo(){ store.reset(); window.MP&&MP.resetUi(); go('#/processes'); render(); }
/* Стартовый экран продукта: «Платежи подрядчикам» (макет 2943-387267) */
route(/^\/$/, ()=>{ setCrumbs([]); content(`<div class="home"><img src="assets/logo.png" alt=""><b>business pad</b></div>`); });
/* Разделы без живой реализации: пустое состояние в стиле продукта, без прототипных пояснений */
const SECT={tasks:'Задачи',processes:'Настройщик процессов',integrations:'Интегратор','data-flow':'Data flow',wiki:'Wiki Hub'};
route(/^\/section\/([\w-]+)$/, ([k])=>{ const t=SECT[k]||k; setCrumbs([[t]]);
  content(`<div class="page">${ph(t)}<div class="paper empty"><b>Нет данных</b>Здесь появятся записи раздела</div></div>`); });
route(/^\/soon\/([\w-]+)$/, ()=>location.replace('#/processes'));

function content(html){ const c=document.getElementById('content'); c.innerHTML=html; c.scrollTop=0; }

window.APP = {
  start(){ drawer(); appbar(); window.MP&&MP.mount(); render(); },
  afterRender(path){ window.DEMO&&DEMO.refresh(); if(/^\/(import|drafts)\//.test(path)&&window.MP&&MP.isOpen()) MP.close(); if(!/^\/(import|drafts)\//.test(path)){ document.getElementById('overlay').innerHTML=''; document.querySelectorAll('.sp-back,.sidepage').forEach(x=>x.remove()); } document.querySelectorAll('.selpop').forEach(x=>x.remove()); markNav(); setCrumbs(crumbs, crumbs._back); },
  setCrumbs, ph, viewSw, wsSelect, content, popMenu, updateHint:()=>window.DEMO&&DEMO.refresh(), resetDemo
};
})();
/* Esc закрывает верхний слой: меню → side page → демо-окно → развёрнутый/обычный MagicPad */
document.addEventListener('keydown', e=>{
  if(e.key!=='Escape') return;
  const pop=document.getElementById('pop')||document.getElementById('upop')||document.querySelector('.vmenu'); if(pop){ pop.remove(); return; }
  const mpPop=document.querySelector('.mp-pop'); if(mpPop){ mpPop.remove(); return; }
  const sp=document.querySelector('.sidepage .sp-x'); if(sp){ sp.click(); return; }
  if(window.DEMO&&DEMO.isOpen()){ DEMO.toggle(); return; }
  if(window.MP&&MP.isOpen()){ MP.close(); return; }
});
