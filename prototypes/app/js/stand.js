/* v5: базовые экраны стенда test.business-pad.com на данных ГК «Стройка»:
   Процессы, Настройки системы (хаб, бизнес-процессы, карточка БП с табами, сотрудники, группы, права, справочники), Чат. */
(function(){
const {I,esc,store,chip,route,go,notify,money} = BP;
const A=()=>window.APP; const S=()=>store.s;
const view=(k,def)=>localStorage.getItem('bp-view-'+k)||def;
/* меню переключателя вида */
document.addEventListener('click',e=>{
  const m=e.target.closest('[data-vsw-menu]'); const vm=document.querySelector('.vmenu');
  if(vm && !e.target.closest('.vmenu')){ vm.remove(); if(m) return; }
  if(!m) { const t=e.target.closest('[data-vsw]'); return; }
  const k=m.dataset.vswMenu; const r=m.getBoundingClientRect(); const p=document.createElement('div'); p.className='popper vmenu';
  p.style.cssText=`position:fixed;top:${r.bottom+4}px;left:${r.right-180}px;min-width:180px`;
  p.innerHTML=[['cards','Карточки'],['table','Таблица']].map(([v,t])=>`<div class="mi ${view(k,'table')===v?'act':''}" data-v="${v}">${I(v==='table'?'table':'cards','ic16')}${t}</div>`).join('');
  p.onclick=ev=>{ const it=ev.target.closest('[data-v]'); if(!it) return; localStorage.setItem('bp-view-'+k,it.dataset.v); p.remove(); BP.render(); };
  document.body.appendChild(p);
});
function procHref(p){ return p.service==='meetings'?'#/meetings':p.id==='proc-payments'?'#/payments':'#/process/'+p.id; }
function tbl(cols, rows, href, o={}){ return CARDS.uni(cols, rows, href, o); }
function listHead(t,n,plus){ return `<div class="lh"><h2 class="h3">${esc(t)}</h2>${n!=null?`<span class="cnt0">${n}</span>`:''}${plus?`<button class="plus round" title="${esc(plus)}" data-act="${plus==='Создать процесс'?'newbp':'plus'}">${I('add','ic16')}</button>`:''}</div>`; }
function seg(items, cur, attr){ return `<div class="seg">${items.map(([k,t])=>`<button class="${k===cur?'on':''}" data-${attr}="${k}">${esc(t)}</button>`).join('')}</div>`; }
function bindSeg(attr, fn){ document.querySelectorAll(`[data-${attr}]`).forEach(b=>b.onclick=()=>fn(b.dataset[attr])); }
function sideMenu(items, cur, base){ return `<div class="smenu">${items.map(([k,t])=>`<a class="${k===cur?'on':''}" href="${base}${k}">${esc(t)}</a>`).join('')}</div>`; }

/* ---------- Процессы ---------- */
route(/^\/processes$/, ()=>{
  A().setCrumbs([['Процессы']]);
  const v=view('proc','table'); const rows=S().processes;
  const cnt=p=>S().instances.filter(i=>i.process===p.id).length+(p.id==='proc-payments'?S().finops.length:0)+(p.service==='meetings'?S().meetings.length:0);
  A().content(`<div class="page">${A().ph('Процессы',{icon:'bag',extra:A().wsSelect()+A().viewSw(v,'proc')})}
  <div class="paper">${listHead('Список процессов',rows.length,'Создать процесс')}
  ${v==='table'?tbl([{t:'Название',w:'34%',f:r=>`<a href="${procHref(r)}">${esc(r.name)}</a>`,tt:r=>r.name},{t:'Описание',f:r=>esc(r.description),tt:r=>r.description},{t:'Экземпляров процесса',w:'190px',f:r=>cnt(r)}],rows,procHref):
   `<div class="cgrid">${rows.map(r=>`<a class="bpcard" href="${procHref(r)}"><div class="t">${I('doc','ic16')}<b>${esc(r.name)}</b><span class="num">№ ${r.num}</span></div><div class="m"><span>Экземпляров: <b>${cnt(r)}</b></span><span>Тип: <b>${esc(r.type)}</b></span></div><div class="d cap muted">${esc(r.description)}</div></a>`).join('')}</div>`}</div></div>`);
});
document.addEventListener('click',e=>{ if(e.target.closest('[data-act="newbp"]')) go('#/constructor'); });

/* ---------- Настройки системы: 4 плитки ---------- */
const HUB=[
  ['Настройки бизнес-процессов',[['Список бизнес-процессов','#/settings/bps']]],
  ['Настройки пользователя',[['Информация о сотруднике','#/settings/profile'],['Список сотрудников','#/settings/employees'],['Группы пользователей','#/settings/groups']]],
  ['Настройка прав',[['Права доступа к объектам и функциям','#/settings/rights'],['Шаблоны ролей','#/settings/role-templates']]],
  ['Справочники',[['Финансы','#/settings/dir/finance'],['Документы','#/settings/dir/documents'],['Товары','#/settings/dir/products'],['Контрагенты','#/settings/dir/counterparties'],['Сотрудники и контакты','#/settings/employees']]]];
route(/^\/settings$/, ()=>{
  A().setCrumbs([['Настройки системы']]);
  A().content(`<div class="page">${A().ph('Настройки системы',{icon:'settings',nomp:1})}
  <div class="hub">${HUB.map(([t,l])=>`<div class="tile"><div class="tt"><b>${esc(t)}</b><span class="cap muted">Настроек: ${l.length}</span></div>${l.map(([n,h])=>`<a href="${h}">${I('dot','ic16')}${esc(n)}</a>`).join('')}</div>`).join('')}</div></div>`);
});
const SC=t=>A().setCrumbs([['Настройки системы','#/settings'],[t]],true);

/* ---------- Бизнес-процессы (карточки как на стенде) ---------- */
route(/^\/settings\/bps$/, ()=>{
  SC('Бизнес-процессы'); const v=view('bps','cards'); const rows=S().processes;
  const vars=p=>(S().bpFields[p.id]||S().bpFields.default).length, roles=()=>S().roles.custom.length;
  A().content(`<div class="page">${A().ph('Бизнес-процессы',{plus:'Создать процесс',plusAct:'newbp',nomp:1,extra:A().wsSelect()})}
  <div class="paper">${v==='cards'?`<div class="cgrid">${rows.map(r=>`<a class="bpcard" href="#/settings/bp/${r.id}"><div class="t">${I('doc','ic16')}<b>${esc(r.name)}</b><span class="num">№ ${r.num}</span>${I('more','ic16')}</div>
   <div class="m"><span>${I('table','ic16')}Активные экземпляры: <b>${S().instances.filter(i=>i.process===r.id).length}</b></span><span>${I('key','ic16')}Переменных: <b>${vars(r)}</b></span><span>${I('people','ic16')}Бизнес-ролей: <b>${roles()}</b></span></div>
   <div class="d cap">${esc(r.created)}${r.status==='Черновик'?' '+chip('Черновик'):''}</div></a>`).join('')}</div>`:''}</div></div>`);
});

/* ---------- Карточка БП: Полотно / Настройка процесса / Права и роли / Поля и переменные ---------- */
function canvas(stages, lanes, o={}){
  const W=230, H=150, x0=190; const lanesN=lanes.length;
  const pos=stages.map((s,i)=>({x:x0+i*W, y:Math.max(0,lanes.indexOf(s[2]||lanes[0]))*H+49, s}));
  const boxes=pos.map((p,i)=>`<div class="stg ${o.sel===i?'sel':''}" data-stg="${i}" style="left:${p.x}px;top:${p.y}px"><i></i><div><b>${esc(p.s[0])}</b><span class="cap muted">${esc(p.s[1]||'')}</span></div>${I('more','ic16')}</div>`).join('');
  const endX=x0+stages.length*W+(stages.length?0:120);
  const lines=[]; let px=136, py=75; pos.forEach(p=>{ lines.push(`<path d="M${px} ${py} H${(px+p.x)/2} V${p.y+26} H${p.x}"/>`); px=p.x+180; py=p.y+26; });
  lines.push(`<path d="M${px} ${py} H${endX}"/>`);
  return `<div class="canvas ${o.cls||''}"><div class="stats"><span>Этапы:</span><b>${stages.length}</b><span>Переходы:</span><b>${stages.length+1}</b></div>
  ${lanes.map((l,i)=>`<div class="lane" style="top:${i*H}px;height:${H}px"><span>${esc(l)}</span></div>`).join('')}
  <svg class="links" width="${endX+80}" height="${lanesN*H}"><defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8z" fill="#85868A"/></marker></defs><g stroke="#85868A" fill="none" marker-end="url(#ar)">${lines.join('')}</g></svg>
  <span class="ev start" style="left:100px;top:57px"></span>${boxes}<span class="ev end" style="left:${endX}px;top:${py-18}px"></span>
  ${o.panel||`<div class="cpanel"><button class="ibtn s" id="cpopen">${I('chev','ic16')}</button><div>Панель управления</div></div>`}
  <div class="zoom"><span class="zb">${I('add','ic16')}<b>100 %</b><span>—</span>${I('fit','ic16')}</span><span class="zb">${I('down','ic16')}${I('up','ic16')}</span></div>
  <div class="ctool"><label><input type="checkbox" class="chk">Процессы ${I('drop','ic16')}</label><span>${I('diamond','ic16')}Шлюзы ${I('drop','ic16')}</span><span>${I('loop','ic16')}Циклы ${I('drop','ic16')}</span><span>${I('cards','ic16')}Еще ${I('drop','ic16')}</span></div></div>`;
}
const LANES=['Инициатор','Согласующие','Исполнители'];
function stagesOf(p){ return p.stages.map((s,i)=>[s,i===0?'Инициатор':i===p.stages.length-1?'Исполнители':'Согласующие',i===0?LANES[0]:i===p.stages.length-1?LANES[2]:LANES[1]]); }
const BPTABS=[['canvas','Полотно'],['setup','Настройка процесса'],['roles','Права и роли'],['fields','Поля и переменные']];
route(/^\/settings\/bp\/([\w-]+)$/, ([id],q)=>{
  const p=store.proc(id); if(!p) return go('#/settings/bps');
  A().setCrumbs([['Бизнес-процессы','#/settings/bps'],[p.name]],true);
  const tab=q.tab||'canvas';
  const fl=S().bpFields[p.id]||S().bpFields.default; const fseg=q.f||'all';
  const body = tab==='canvas'? canvas(stagesOf(p), LANES):
    tab==='setup'? `<div class="form2"><div class="fld"><label>Название процесса</label><input class="inp" value="${esc(p.name)}"></div><div class="fld"><label>Описание</label><textarea class="ta">${esc(p.description)}</textarea></div>
      <div class="fld"><label>Тип процесса</label><input class="inp" value="${esc(p.type)}"></div><div class="fld"><label>Владелец</label><input class="inp" value="${esc(p.owner)}"></div><div class="fld"><label>Рабочая среда</label><input class="inp" value="Рабочая среда"></div></div>`:
    tab==='roles'? `<div class="split">${`<div class="smenu"><a class="${q.r!=='custom'?'on':''}" href="#/settings/bp/${id}?tab=roles">Системные роли</a><a class="${q.r==='custom'?'on':''}" href="#/settings/bp/${id}?tab=roles&r=custom">Пользовательские роли</a></div>`}
      <div class="grow">${listHead('Список ролей',S().roles[q.r==='custom'?'custom':'system'].length,q.r==='custom'?'Добавить роль':'')}${tbl([{t:'Название',w:'30%',f:r=>`<a href="#/settings/bp/${id}/role/${encodeURIComponent(r.name)}">${esc(r.name)}</a>`},{t:'Описание',f:r=>esc(r.desc)},{t:'Пользователи',w:'140px',f:r=>r.users}],S().roles[q.r==='custom'?'custom':'system'],r=>`#/settings/bp/${id}/role/${encodeURIComponent(r.name)}`)}</div></div>`:
    `${listHead('Список полей и переменных',fl.length)}<div class="tbar">${seg([['all','Все'],['var','Переменные'],['fld','Поля']],fseg,'fseg')}<div class="search" style="width:240px">${I('search','ic16')}<input class="inp" placeholder="Поиск"></div></div>
     ${tbl([{t:'Название',f:r=>esc(r.name)},{t:'Описание',f:r=>esc(r.desc)},{t:'Тип',w:'110px',f:r=>esc(r.type)},{t:'Формат',w:'170px',f:r=>esc(r.format)},{t:'Действия',w:'90px',f:()=>`${I('edit','ic16')}`},{t:'Значение по умолчанию',w:'190px',f:r=>esc(r.def)}],fl.filter(f=>fseg==='all'||(fseg==='var')===(f.type==='Переменная')),()=>`#/settings/bp/${id}?tab=fields`)}`;
  A().content(`<div class="page">${A().ph(p.name,{icon:'puzzle',after:chip(p.status||'Опубликован'),nomp:0,dots:1,extra:`<button class="btn pri out" id="bpedit">Редактировать</button><span class="split-btn"><button>CFF</button><button>${I('drop','ic16')}</button></span>`})}
   <div class="paper col fill">${seg(BPTABS,tab,'bptab')}${body}</div></div>`);
  bindSeg('bptab',t=>go(`#/settings/bp/${id}?tab=${t}`)); bindSeg('fseg',f=>go(`#/settings/bp/${id}?tab=fields&f=${f}`));
  document.getElementById('bpedit').onclick=()=>go('#/constructor?from='+id);
});
route(/^\/settings\/bp\/([\w-]+)\/role\/(.+)$/, ([id,rn])=>{
  const p=store.proc(id); const name=decodeURIComponent(rn); A().setCrumbs([[p.name,`#/settings/bp/${id}?tab=roles`],[name]],true);
  const rights=['Создание экземпляра','Просмотр экземпляров','Редактирование полей','Переход между этапами','Удаление экземпляра'];
  A().content(`<div class="page"><div class="ph"><div class="title"><h1 class="h1">Настроить роль «${esc(name)}»</h1></div><div class="acts"><button class="xbtn" id="rolex" title="Закрыть">${I('close','ic16')}</button></div></div>
  <div class="paper">${listHead('Права роли',rights.length)}${tbl([{t:'Право',f:r=>esc(r)},{t:'Доступ',w:'160px',f:(r)=>`<input type="checkbox" class="chk" ${rights.indexOf(r)<3?'checked':''} onclick="event.stopPropagation()">`}],rights,()=>'#'+BP.parseHash().path)}</div></div>`);
  document.getElementById('rolex').onclick=()=>go(`#/settings/bp/${id}?tab=roles`);
});

/* ---------- Пользователи и права ---------- */
route(/^\/settings\/employees$/, ()=>{ SC('Сотрудники'); const rows=S().employees;
  A().content(`<div class="page">${A().ph('Сотрудники',{plus:'Добавить сотрудника',nomp:1})}<div class="paper"><div class="tbar"><div class="search" style="width:280px">${I('search','ic16')}<input class="inp" id="eq" placeholder="Поиск сотрудника"></div></div>
  <div class="cgrid">${rows.map(e=>`<div class="ecard"><div class="t"><span class="ava">${I('person','ic16')}</span><div><b>${esc(e.name)}</b><span class="cap muted">${esc(e.pos)}</span></div>${chip(e.status)}</div><div class="cap">${I('mail','ic16')} Почта: <a href="mailto:${e.email}">${esc(e.email)}</a></div></div>`).join('')}</div></div></div>`);
  const q=document.getElementById('eq'); q.oninput=()=>document.querySelectorAll('.ecard').forEach(c=>c.hidden=!BP.norm(c.textContent).includes(BP.norm(q.value)));
});
route(/^\/(?:settings\/profile|employee\/([\w-]+))$/, ([eid])=>{ SC('Информация о сотруднике'); const e=(eid&&S().employees.find(x=>x.id===eid))||S().employees[0];
  A().content(`<div class="page">${A().ph('Информация о сотруднике',{nomp:1})}<div class="paper"><dl class="dl"><dt>ФИО</dt><dd>${esc(e.name)}</dd><dt>Должность</dt><dd>${esc(e.pos)}</dd><dt>Компания</dt><dd>${esc(S().company.name)}</dd><dt>Почта</dt><dd>${esc(e.email)}</dd><dt>Статус</dt><dd>${chip(e.status)}</dd></dl></div></div>`); });
route(/^\/settings\/groups$/, (_,q)=>{ SC('Группы пользователей'); const f=q.f||'all';
  const rows=S().groups.filter(g=>f==='all'||(f==='dyn')===(g.type==='Динамическая'));
  A().content(`<div class="page">${A().ph('Группы пользователей',{nomp:1})}<div class="paper">${listHead('Список групп',rows.length,'Создать группу')}<div class="tbar">${seg([['all','Все'],['dyn','Динамические'],['st','Статические']],f,'gseg')}</div>
  ${tbl([{t:'п/п',w:'60px',f:r=>rows.indexOf(r)+1},{t:'Название',f:r=>`<a>${esc(r.name)}</a>`},{t:'Описание',f:r=>esc(r.desc)},{t:'Тип',w:'140px',f:r=>esc(r.type)},{t:'Формат',w:'120px',f:r=>esc(r.format)},{t:'Участники',w:'110px',f:r=>r.members}],rows,()=>'#/settings/groups')}</div></div>`);
  bindSeg('gseg',x=>go('#/settings/groups?f='+x)); });
route(/^\/settings\/rights$/, ()=>{ SC('Права доступа'); const rows=S().rights;
  A().content(`<div class="page">${A().ph('Права доступа к объектам и функциям',{nomp:1})}<div class="paper">${listHead('Список прав',rows.length,'Создать право')}
  ${tbl([{t:'Название',f:r=>`<a>${esc(r.name)}</a>`},{t:'Описание',f:r=>esc(r.desc)},{t:'Пользователи',w:'130px',f:r=>r.users},{t:'Групп',w:'100px',f:r=>r.groups}],rows,()=>'#/settings/rights')}</div></div>`); });
route(/^\/settings\/role-templates$/, ()=>{ SC('Шаблоны ролей'); const rows=S().roleTpl;
  A().content(`<div class="page">${A().ph('Шаблоны ролей',{nomp:1})}<div class="paper">${listHead('Список шаблонов',rows.length,'Создать шаблон')}
  ${tbl([{t:'Название',f:r=>`<a>${esc(r.name)}</a>`},{t:'Описание',f:r=>esc(r.desc)},{t:'Пользователи',w:'130px',f:r=>r.users},{t:'Групп',w:'100px',f:r=>r.groups}],rows,()=>'#/settings/role-templates')}</div></div>`); });

/* ---------- Справочники: левое меню + сегмент Все/Активные/В архиве ---------- */
const DIRS={products:'Товары',counterparties:'Контрагенты',documents:'Документы',finance:'Финансы'};
route(/^\/settings\/dir\/(\w+)(?:\/(\w+))?$/, ([k,sub],q)=>{
  const t=DIRS[k]; if(!t) return go('#/settings'); SC('Справочник: '+t); const f=q.f||'all'; const s=S();
  let menu, list, cols, href, plus;
  if(k==='products'){ menu=[['','Товары'],['/units','Единица измерения']];
    if(sub==='units'){ list=s.dirs.units.rows; cols=[{t:'Обозначение',w:'200px',f:r=>esc(r[0])},{t:'Наименование',f:r=>esc(r[1])}]; href=()=>'#/settings/dir/products/units'; plus='Добавить единицу'; }
    else { list=s.products.slice().reverse(); cols=[{t:'Наименование',f:r=>`<a href="#/product/${r.id}">${esc(r.name)}</a>`,tt:r=>r.name},{t:'Артикул',w:'130px',f:r=>esc(r.article)},{t:'Группа',w:'170px',f:r=>esc(r.group)},{t:'Ед.',w:'70px',f:r=>esc(r.unit)},{t:'Цена',w:'110px',f:r=>money(r.price)},{t:'Статус',w:'120px',f:()=>chip('Активный')}]; href=r=>'#/product/'+r.id; plus='Создать товар'; } }
  else if(k==='counterparties'){ menu=[['','Контрагенты']]; list=s.counterparties.slice().reverse(); cols=[{t:'Название',f:r=>`<a href="#/counterparty/${r.id}">${esc(r.name)}</a>`,tt:r=>r.name},{t:'ИНН',w:'120px',f:r=>r.inn},{t:'Роль',w:'140px',f:r=>esc(r.role)},{t:'Статус',w:'130px',f:r=>chip(r.status)},{t:'Ответственный',w:'170px',f:r=>esc(r.manager)}]; href=r=>'#/counterparty/'+r.id; plus='Создать контрагента'; }
  else if(k==='documents'){ menu=[['','Документы']]; list=s.documents.slice().reverse(); cols=[{t:'Название',f:r=>`<a href="#/document/${r.id}">${esc(r.name)}</a>`,tt:r=>r.name},{t:'Тип',w:'120px',f:r=>esc(r.type)},{t:'Контрагент',w:'200px',f:r=>esc(CARDS.cpName(r.counterparty))},{t:'Статус',w:'140px',f:r=>chip(r.status)},{t:'Дата',w:'100px',f:r=>r.date}]; href=r=>'#/document/'+r.id; plus='Импорт из файла'; }
  else { menu=s.dirs.finance.menu.map((m,i)=>[i?'/acc':'',m]); list=s.dirs.finance.rows; cols=[{t:'Название',f:r=>esc(r[0])},{t:'Вид',w:'160px',f:r=>esc(r[1])}]; href=()=>'#/settings/dir/finance'; plus='Добавить статью'; }
  const arch=r=>r.status==='Архив'; const rows=list.filter(r=>f==='all'||(f==='arch')===arch(r));
  A().content(`<div class="page">${A().ph('Справочник: '+t,{nomp:1})}<div class="split">${sideMenu(menu,sub?'/'+sub:'','#/settings/dir/'+k)}
   <div class="paper grow">${listHead(menu.find(m=>m[0]===(sub?'/'+sub:''))[1],rows.length,plus)}<div class="tbar">${seg([['all','Все'],['act','Активные'],['arch','В архиве']],f,'dseg')}${f==='act'?`<span class="chip neutral">Активные ${I('close','ic16')}</span>`:''}<div class="search" style="width:240px;margin-left:auto">${I('search','ic16')}<input class="inp" placeholder="Поиск"></div></div>
   ${tbl(cols,rows,href)}</div></div></div>`);
  bindSeg('dseg',x=>go(`#/settings/dir/${k}${sub?'/'+sub:''}?f=${x}`));
});
/* старые адреса справочников ведут в Справочники */
route(/^\/(products|counterparties|documents)$/, ([k])=>location.replace('#/settings/dir/'+k));

/* ---------- Чат: список слева и пустые состояния как на стенде ---------- */
route(/^\/chat$/, ()=>{ A().setCrumbs([['Чат']]);
  A().content(`<div class="chatpg"><div class="chl"><div class="search">${I('search','ic16')}<input class="inp" placeholder="Найти чат"></div><div class="empty"><b>У вас ещё нет чатов</b>Начните переписку с коллегой</div></div>
  <div class="chr"><div class="empty"><b>Открыть переписку просто</b>Выберите чат слева или найдите коллегу по имени</div></div></div>`); });

window.STAND={canvas, seg, bindSeg, listHead, LANES};
})();
