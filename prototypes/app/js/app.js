/* Оболочка: Drawer, AppHeader с глобальным поиском, PageHeader, стартовая «Демо-сценарии», заглушки. */
(function(){
const {I,BPLOGO,esc,store,notify,route,go,render} = BP;
const PORTAL = window.DEMO_DATA.links.portal;

const NAV = [
  {h:'#/', ic:'home', t:'Демо-сценарии'},
  {h:'#/payments', ic:'finance', t:'Платежи подрядчикам'},
  {h:'#/search', ic:'search', t:'ИИ поиск'},
  {h:'#/documents', ic:'doc', t:'Документы'},
  {h:'#/counterparties', ic:'people', t:'Контрагенты'},
  {h:'#/products', ic:'box', t:'Товары'},
  {sep:1},
  {h:'#/soon/task-tracker', ic:'task', t:'Задачи', soon:1},
  {h:'#/soon/nastroyshchik', ic:'stage', t:'Настройщик процессов', soon:1},
  {h:'#/soon/integrator', ic:'link', t:'Интегратор', soon:1},
  {h:'#/soon/data-flow', ic:'flow', t:'Data flow', soon:1},
  {h:'#/soon/wiki-hub', ic:'table', t:'Wiki Hub', soon:1},
  {h:'#/soon/tochki-vhoda', ic:'shine', t:'Точки входа ИИ', soon:1}
];
const SOON = {
  'task-tracker':['Задачи (Task tracker)','Канбан, список и календарь задач, карточка задачи, ИИ-помощник в задаче.'],
  'nastroyshchik':['Настройщик процессов','Конструктор процесса с ИИ: этапы, поля, роли, маршруты согласования.'],
  'integrator':['Интегратор','Подключение внешних систем и сопоставление полей с помощью Феликса.'],
  'data-flow':['Data flow','Поток данных между процессами и интеграциями, визуальная схема.'],
  'wiki-hub':['Wiki Hub','База знаний компании, регламенты и ответы Феликса со ссылками на статьи.'],
  'tochki-vhoda':['Точки входа ИИ','Все места, откуда вызывается Феликс: шапка, поля, таблицы, карточки.']
};

/* Шаги демо-сценария: ключ progress → описание. Используются на стартовой и в подсказке. */
const STEPS = [
  {k:'mp-open', t:'Откройте MagicPad', d:'Раздел «Платежи подрядчикам», кнопка с искрой в шапке страницы.', h:'#/payments?mp=1'},
  {k:'slash', t:'Введите «/» и выберите «Импорт из файла»', d:'Появится меню команд, как в макете U1.', h:'#/payments?mp=1'},
  {k:'file', t:'Прикрепите демо-файл ТН-0842 и отправьте', d:'Феликс проверит файл и предложит процессы.', h:'#/payments?mp=1'},
  {k:'proc', t:'Выберите процесс «Входящие документы»', d:'Откроется мастер импорта с распознаванием.', h:'#/payments?mp=1'},
  {k:'fields', t:'Проверьте распознанные поля', d:'Исправьте «Грузополучателя», выделите номер ТТН в документе.', h:''},
  {k:'created', t:'Создайте документ, товар и контрагента', d:'Новые объекты сохранятся в демо-данных.', h:''},
  {k:'found', t:'Найдите созданное в ИИ поиске', d:'Например, «ИнвестСтрой» или «Арматура».', h:'#/search?q=ИнвестСтрой'}
];
const nextStep = () => STEPS.find(s=>!store.s.progress[s.k]);

/* ---------- Drawer ---------- */
function drawer(){
  const d=document.getElementById('drawer'); const open=localStorage.getItem('bp-drawer')==='1';
  d.classList.toggle('open',open);
  d.innerHTML = `<div class="logo"><img src="assets/logo.png" alt=""><span>BusinessPad</span></div>
  <div class="nav">${NAV.map(n=>n.sep?'<div class="sep"></div>':`<a href="${n.h}" data-h="${n.h}" title="${esc(n.t)}">${I(n.ic)}<span class="lbl">${esc(n.t)}</span>${n.soon?'<span class="soon">скоро</span>':''}</a>`).join('')}</div>
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
    <div class="gsearch search" id="gsearch">${I('search')}<input class="inp" id="gq" placeholder="Поиск по компании" autocomplete="off" aria-label="Глобальный поиск"></div>
    <button class="ibtn" title="Уведомления">${I('bell')}</button>
    <div class="avatar" style="background-image:url(assets/user.png)" title="${esc(store.s.company.user)}"></div>`;
  window.SEARCH && SEARCH.bindHeader(document.getElementById('gq'));
}

/* ---------- PageHeader по capsule-паттернам: Title + plus, справа Фильтры, BP help, magic, ⋮ ---------- */
function ph(title, o={}){
  return `<div class="ph"><div class="title"><h1 class="h1">${esc(title)}</h1>${o.counter!=null?`<span class="counter">${o.counter}</span>`:''}${o.plus?`<button class="plus" title="${esc(o.plus)}" data-act="plus">${I('add')}</button>`:''}</div>
  <div class="acts">${o.extra||''}${o.filters?`<button class="btn text">${I('filter')}Фильтры</button>`:''}
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
  else if(a==='dots'){ popMenu(b,[['reset','Сбросить демо',()=>resetDemo()],['home','Демо-сценарии',()=>go('#/')]]); }
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
function resetDemo(){ store.reset(); window.MP&&MP.resetUi(); notify('Демо сброшено: данные и переписка вернулись к исходным','info'); go('#/'); render(); updateHint(); }

/* ---------- Подсказка «следующий шаг» ---------- */
function updateHint(){
  const el=document.getElementById('hint'); const n=nextStep(); const path=BP.parseHash().path;
  if(!n || path==='/' || localStorage.getItem('bp-hint-off')==='1'){ el.classList.add('hide'); return; }
  const i=STEPS.indexOf(n)+1;
  el.classList.remove('hide');
  el.innerHTML=`<img src="assets/felix.png" alt="" style="width:32px;height:32px;border-radius:50%"><div style="display:flex;flex-direction:column;gap:4px"><span class="k">Шаг ${i} из ${STEPS.length}</span><b class="sub1">${esc(n.t)}</b><span class="cap muted">${esc(n.d)}</span></div><button class="ibtn s" title="Скрыть" id="hintx">${I('close','ic16')}</button>`;
  el.querySelector('#hintx').onclick=()=>{ localStorage.setItem('bp-hint-off','1'); el.classList.add('hide'); };
  el.style.right = MP_open()? 'calc(var(--mp-w) + 48px)':'24px';
}

/* ---------- Стартовая: Демо-сценарии ---------- */
route(/^\/$/, ()=>{
  setCrumbs([['Демо-сценарии']]);
  const n=nextStep(); const L=store.s.links; const pr=store.s.progress;
  const created = store.s.documents.filter(d=>d.imported);
  content(`<div class="page">${ph('Демо-сценарии')}
  <div class="row" style="align-items:flex-start">
   <div class="col" style="flex:1;min-width:0">
    <div class="paper magic row" style="align-items:center">
      <img src="assets/fox.png" alt="" style="height:96px">
      <div class="col" style="gap:8px"><h2 class="h3">${esc(store.s.company.name)} · ${esc(store.s.company.city)}</h2>
      <span class="body1">Пилот живого прототипа: MagicPad, импорт документа из файла и ИИ поиск работают на общих демо-данных. Всё, что вы создадите, сохраняется в браузере.</span>
      <div class="row" style="gap:8px"><button class="btn l" id="startBtn">${I('play')}${n&&n!==STEPS[0]?'Продолжить сценарий':'Начать сценарий'}</button><button class="btn pri out l" data-act="dots">Сбросить демо…</button></div></div>
    </div>
    <div class="paper col"><h3 class="h3">Сценарий «Накладная от поставщика»</h3>
      <div class="scen">${STEPS.map((s,i)=>`<div class="st ${pr[s.k]?'done':(s===n?'next':'')}"><span class="n">${pr[s.k]?I('check','ic16'):i+1}</span><div><div class="sub1">${esc(s.t)}</div><div class="cap muted">${esc(s.d)}</div></div>${s.h&&!pr[s.k]?`<a class="btn text" href="${s.h}">Перейти</a>`:(pr[s.k]?'<span class="chip green">готово</span>':'')}</div>`).join('')}</div>
    </div>
    <div class="paper col"><h3 class="h3">Другие сценарии</h3>
      <div class="grid3">
       <a class="acard" href="#/search?q=СтройМонолит"><b class="sub1">ИИ поиск по контрагенту</b><span class="cap muted">Сводка, тепловая карта активности, связанные объекты.</span></a>
       <a class="acard" href="#/payments?mp=1&say=Сделай сводку по платежам"><b class="sub1">Сводка по платежам</b><span class="cap muted">Феликс считает суммы по статусам из таблицы.</span></a>
       <a class="acard" href="#/import/start?file=file-scan"><b class="sub1">Нечитаемый скан</b><span class="cap muted">Валидация файла плохого качества (U2.1).</span></a>
      </div></div>
   </div>
   <div class="col" style="width:340px;flex:none">
    <div class="paper col"><h3 class="h4">Документы</h3><div class="doclist">
      <a href="${L.agents}" target="_blank" rel="noopener">${I('doc')}ТЗ и спецификация ИИ-агентов (ver-2)</a>
      <a href="${L.figma}" target="_blank" rel="noopener">${I('link')}Макеты Figma BP-CPQ-AI</a>
      <a href="${L.portal}" target="_blank" rel="noopener">${I('table')}Портал картиночных прототипов v2.0</a>
      <a href="${L.portal}import/" target="_blank" rel="noopener">${I('doc')}Импорт: все экраны U1–U9</a>
      <a href="${L.portal}poisk/" target="_blank" rel="noopener">${I('search')}ИИ поиск: все экраны</a></div></div>
    <div class="paper col"><h3 class="h4">Созданное в демо</h3>${created.length?created.map(d=>`<a href="#/document/${d.id}">${esc(d.name)}</a>`).join(''):'<span class="muted">Пока ничего. Пройдите сценарий импорта.</span>'}</div>
   </div>
  </div></div>`);
  document.getElementById('startBtn').onclick=()=>go((n||STEPS[0]).h||'#/payments?mp=1');
});

/* ---------- Заглушки разделов ---------- */
route(/^\/soon\/([\w-]+)$/, ([slug])=>{
  const s=SOON[slug]||[slug,''];
  setCrumbs([['Демо-сценарии','#/'],[s[0]]]);
  content(`<div class="page">${ph(s[0])}<div class="paper soonpage col"><span class="chip special" style="align-self:flex-start">скоро в живом пилоте</span>
  <span class="body1">${esc(s[1])}</span><span class="muted">Пока раздел доступен как кликабельный картиночный прототип по макетам Figma.</span>
  <div><a class="btn" href="${PORTAL}${slug}/" target="_blank" rel="noopener">${I('link')}Открыть картиночный прототип</a></div></div></div>`);
});

function content(html){ const c=document.getElementById('content'); c.innerHTML=html; c.scrollTop=0; }

window.APP = {
  start(){ drawer(); appbar(); window.MP&&MP.mount(); render(); },
  afterRender(path){ if(!path.startsWith('/import/')) document.getElementById('overlay').innerHTML=''; document.querySelectorAll('.selpop').forEach(x=>x.remove()); markNav(); setCrumbs(crumbs, crumbs._back); updateHint(); },
  setCrumbs, ph, content, popMenu, updateHint, STEPS, resetDemo
};
})();
