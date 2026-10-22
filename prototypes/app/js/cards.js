/* Списки (UniTable) и общие карточки объектов: контрагент, документ, товар, процесс, экземпляр, задача, фин. операция. */
(function(){
const {I,PDF,esc,money,store,chip,route,go,notify} = BP;
const A = () => window.APP;
const cpName = id => (store.cp(id)||{}).name || '—';
const cpLink = id => id&&store.cp(id) ? `<a href="#/counterparty/${id}">${esc(cpName(id))}</a>` : '—';

/* ---------- UniTable ---------- */
function uni(cols, rows, href, o={}){
  if(!rows.length) return `<div class="empty"><b>Ничего не найдено</b>Попробуйте изменить запрос</div>`;
  return `<div class="tblwrap"><table class="uni"><colgroup>${o.cb?'<col style="width:32px">':''}${cols.map(c=>`<col style="width:${c.w||'auto'}">`).join('')}<col style="width:32px"></colgroup>
  <thead><tr>${o.cb?'<th class="cb"><input type="checkbox" class="chk" aria-label="Выбрать все"></th>':''}${cols.map(c=>`<th title="${esc(c.t)}">${esc(c.t)}</th>`).join('')}<th class="act"></th></tr></thead>
  <tbody>${rows.map(r=>`<tr class="click" data-href="${href(r)}">${o.cb?'<td class="cb"><input type="checkbox" class="chk" onclick="event.stopPropagation()"></td>':''}${cols.map(c=>`<td title="${esc(c.tt?c.tt(r):'')}">${c.f(r)}</td>`).join('')}<td class="act"><button class="ibtn s" tabindex="-1">${I('more','ic16')}</button></td></tr>`).join('')}</tbody></table></div>`;
}
document.addEventListener('click',e=>{ const tr=e.target.closest('tr[data-href]'); if(tr && !e.target.closest('a[href],button,input,select,label')){ if(tr.dataset.href===location.hash){ const n=(tr.querySelector('a')||tr.cells[0]||tr).innerText.trim(); BP.notify(`«${n}»: карточка на стенде открывается только для просмотра, в макетах её нет`,'info'); } else go(tr.dataset.href); } });

function listPage(title, crumbsTitle, cols, rows, href, plusTitle){
  A().setCrumbs([[crumbsTitle||title]]);
  A().content(`<div class="page">${A().ph(title,{counter:rows.length, plus:plusTitle, filters:1})}<div class="paper flat">${uni(cols,rows,href)}</div></div>`);
}

/* ---------- Платежи подрядчикам: хост-раздел для MagicPad (по макетам Точек входа) ---------- */
route(/^\/payments$/, (_,q)=>{
  A().setCrumbs([['Процессы','#/processes'],['Платежи подрядчикам']], true);
  const rows=store.s.finops;
  A().content(`<div class="page">${A().ph('Платежи подрядчикам',{icon:'finance',filters:1,dots:1, extra:A().viewSw('table','pay')})}
  <div class="paper col" style="flex:1"><div class="row" style="align-items:center;gap:12px"><h2 class="h3">Список платежей</h2><span class="counter">${rows.length}</span><button class="plus" data-act="plus" title="Создать платёж">${I('add')}</button>
   <div class="search" style="margin-left:auto;width:188px">${I('search')}<input class="inp" placeholder="Поиск по платежам" aria-label="Поиск по платежам"></div></div>
  ${uni([
    {t:'Контрагенты',w:'180px',f:r=>esc(cpName(r.counterparty)),tt:r=>cpName(r.counterparty)},
    {t:'Название',f:r=>esc(r.name),tt:r=>r.name},
    {t:'Тип операции',w:'190px',f:r=>esc(r.op),tt:r=>r.op},
    {t:'Статус',w:'140px',f:r=>chip(r.status)},
    {t:'Этап',w:'150px',f:r=>esc(r.stage)},
    {t:'Дата',w:'100px',f:r=>r.date},
    {t:'Сумма',w:'120px',f:r=>money(r.amount)}], rows, r=>'#/finop/'+r.id, {cb:1})}</div></div>`);
  if(q.mp) MP.open(); if(q.slash) setTimeout(()=>MP.slash(),100);
  if(q.say) setTimeout(()=>MP.say(q.say),300);
});

/* ---------- Общая карточка ---------- */
let tab='main';
function card(o){
  A().setCrumbs(o.crumbs, true);
  const tabs=[['main','Общие сведения'],['rel','Связанные объекты',o.rel.length],['hist','История',o.hist.length]];
  A().content(`<div class="page">${A().ph(o.title,{after:(o.status?chip(o.status):''),dots:1})}
  <div class="tabs soft" style="max-width:560px">${tabs.map(t=>`<button class="${tab===t[0]?'on':''}" data-tab="${t[0]}">${t[1]}${t[2]!=null?` <span class="counter">${t[2]}</span>`:''}</button>`).join('')}</div>
  <div class="row" style="align-items:flex-start">
   <div class="paper" style="flex:1;min-width:0">${tab==='main'?`<dl class="dl">${o.fields.map(f=>`<dt>${esc(f[0])}</dt><dd>${f[1]}</dd>`).join('')}</dl>${o.extra||''}`:
     tab==='rel'?(o.rel.length?`<div class="col" style="gap:8px">${o.rel.map(r=>`<a class="acard" href="${r.h}"><span class="cap muted">${esc(r.k)}</span><b class="sub1">${esc(r.t)}</b>${r.s?`<span>${chip(r.s)}</span>`:''}</a>`).join('')}</div>`:'<div class="empty"><b>Нет связанных объектов</b></div>'):
     (o.hist.length?`<div class="tl">${o.hist.map(h=>`<div><span>${esc(h.text)}</span><span class="cap muted">${h.date} · ${esc(h.who)}</span></div>`).join('')}</div>`:'<div class="empty"><b>Нет событий</b></div>')}</div>
  </div></div>`);
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab; BP.render();});
}
let lastCard=''; function resetTab(id){ if(id!==lastCard){tab='main'; lastCard=id;} }
const evFor = (id, extra=[]) => extra.concat(store.s.events.filter(e=>e.counterparty===id||e.object===id));

route(/^\/counterparty\/([\w-]+)$/, ([id])=>{
  const c=store.cp(id); if(!c) return notFound(); resetTab(id);
  const rel=[...store.s.documents.filter(d=>d.counterparty===id).map(d=>({k:'Документ',t:d.name,s:d.status,h:'#/document/'+d.id})),
    ...store.s.instances.filter(d=>d.counterparty===id).map(d=>({k:'Экземпляр процесса',t:d.name,s:d.status,h:'#/instance/'+d.id})),
    ...store.s.tasks.filter(d=>d.counterparty===id).map(d=>({k:'Задача',t:d.name,s:d.status,h:'#/task/'+d.id})),
    ...store.s.products.filter(d=>d.supplier===id).map(d=>({k:'Товар',t:d.name,h:'#/product/'+d.id}))];
  card({title:c.name, status:c.status, imported:c.imported, crumbs:[['Справочник: Контрагенты','#/settings/dir/counterparties'],[c.name]],
    fields:[['ИНН',c.inn],['КПП',c.kpp||'—'],['Роль',esc(c.role)],['Адрес',esc(c.address)],['Ответственный',esc(c.manager)],['Телефон',esc(c.phone||'—')],['Почта',esc(c.email||'—')],['С нами с',c.since],
      ...(c.source?[['Источник',`<a href="#/document/${c.source}">${esc((store.doc(c.source)||{}).name||'')}</a>`]]:[])],
    rel, hist:evFor(id), ai:`Связанных объектов: ${rel.length}. Последнее событие: ${(evFor(id)[0]||{}).text||'нет'}.`});
});
route(/^\/document\/([\w-]+)$/, ([id])=>{
  const d=store.doc(id); if(!d) return notFound(); resetTab(id);
  const p=store.proc(d.process);
  const rel=[...(d.counterparty?[{k:'Контрагент',t:cpName(d.counterparty),h:'#/counterparty/'+d.counterparty}]:[]),
    ...(d.consignee?[{k:'Грузополучатель',t:cpName(d.consignee),h:'#/counterparty/'+d.consignee}]:[]),
    ...(p?[{k:'Процесс',t:p.name,h:'#/process/'+p.id}]:[]),
    ...(d.items||[]).filter(i=>i.product).map(i=>({k:'Товар',t:(store.prod(i.product)||{}).name||i.name,h:'#/product/'+i.product}))];
  const items = d.items ? `<h3 class="h4" style="margin:24px 0 8px">Товары</h3>${uni([{t:'№',w:'48px',f:r=>r.n},{t:'Наименование',f:r=>esc(r.name),tt:r=>r.name},{t:'Ед.',w:'70px',f:r=>esc(r.unit)},{t:'Кол-во',w:'90px',f:r=>r.qty},{t:'Цена',w:'100px',f:r=>money(r.price)},{t:'Сумма',w:'120px',f:r=>money(r.sum)}], d.items, r=>r.product?'#/product/'+r.product:'#/document/'+id)}`:'';
  const ff = d.fields ? `<h3 class="h4" style="margin:24px 0 8px">Распознанные реквизиты</h3><dl class="dl">${d.fields.filter(f=>f.value).map(f=>`<dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd>`).join('')}</dl>`:'';
  card({title:d.name, status:d.status, imported:d.imported, crumbs:[['Справочник: Документы','#/settings/dir/documents'],[d.name]],
    fields:[['Тип',esc(d.type)],['Контрагент',cpLink(d.counterparty)],['Дата',d.date],['Сумма',d.amount?money(d.amount):'—'],['Процесс',p?`<a href="#/process/${p.id}">${esc(p.name)}</a>`:'—'],['Этап',esc(d.stage||(p&&p.stages[0])||'—')],['Файл',`<span class="file-chip">${PDF}${esc(d.file)}</span>`],['Изменён',d.updated]],
    extra: items+ff, rel, hist:evFor(id), ai: d.imported?'Документ создан из файла, все обязательные поля подтверждены пользователем.':''});
});
route(/^\/product\/([\w-]+)$/, ([id])=>{
  const p=store.prod(id); if(!p) return notFound(); resetTab(id);
  const docs=store.s.documents.filter(d=>(d.items||[]).some(i=>i.product===id));
  card({title:p.name, status:p.imported?'Новый':'В каталоге', imported:p.imported, crumbs:[['Справочник: Товары','#/settings/dir/products'],[p.name]],
    fields:[['Артикул',esc(p.article)],['Группа',esc(p.group)],['Единица',esc(p.unit)],['Цена',money(p.price)],['Поставщик',cpLink(p.supplier)],['Остаток',p.stock]],
    rel:[...(p.supplier?[{k:'Поставщик',t:cpName(p.supplier),h:'#/counterparty/'+p.supplier}]:[]),...docs.map(d=>({k:'Документ',t:d.name,s:d.status,h:'#/document/'+d.id}))], hist:evFor(id)});
});
route(/^\/process\/([\w-]+)$/, ([id])=>{
  const p=store.proc(id); if(!p) return notFound(); resetTab(id);
  const inst=store.s.instances.filter(i=>i.process===id), docs=store.s.documents.filter(d=>d.process===id);
  card({title:p.name, crumbs:[['Процессы','#/processes'],[p.name]],
    fields:[['Тип',esc(p.type)],['Владелец',esc(p.owner)],['Этапы',p.stages.map(s=>`<span class="chip lav">${esc(s)}</span>`).join(' ')],['Описание',esc(p.description)]],
    rel:[...inst.map(i=>({k:'Экземпляр',t:i.name,s:i.status,h:'#/instance/'+i.id})),...docs.map(d=>({k:'Документ',t:d.name,s:d.status,h:'#/document/'+d.id}))], hist:[]});
});
route(/^\/instance\/([\w-]+)$/, ([id])=>{
  const p=store.inst(id); if(!p) return notFound(); resetTab(id);
  card({title:p.name, status:p.status, crumbs:[[store.proc(p.process).name,'#/process/'+p.process],[p.name]],
    fields:[['Процесс',`<a href="#/process/${p.process}">${esc(store.proc(p.process).name)}</a>`],['Контрагент',cpLink(p.counterparty)],['Этап',esc(p.stage)],['Сумма',p.amount?money(p.amount):'—'],['Изменён',p.updated]],
    rel:[...(p.counterparty?[{k:'Контрагент',t:cpName(p.counterparty),h:'#/counterparty/'+p.counterparty}]:[]),...(id==='in-deal-5695'?[{k:'Документы сделки',t:'Документы сделки № 5695',h:'#/deal/in-deal-5695/docs'}]:[])], hist:evFor(id)});
});
route(/^\/task\/([\w-]+)$/, ([id])=>{
  const t=store.task(id)||store.s.meetings.find(m=>m.id===id); if(!t) return notFound(); resetTab(id);
  card({title:t.name, status:t.status, crumbs:[['Задачи','#/search?cat=tasks'],[t.name]],
    fields:t.due?[['Исполнитель',esc(t.assignee)],['Срок',t.due],['Приоритет',chip(t.priority)],['Контрагент',cpLink(t.counterparty)]]:[['Дата',t.date],['Время',t.from+' - '+t.to],['Участники',(t.people||[]).length],['Контрагент',cpLink(t.counterparty)]],
    rel:t.counterparty?[{k:'Контрагент',t:cpName(t.counterparty),h:'#/counterparty/'+t.counterparty}]:[], hist:[]});
});
route(/^\/finop\/([\w-]+)$/, ([id])=>{
  const t=store.s.finops.find(f=>f.id===id); if(!t) return notFound(); resetTab(id);
  card({title:t.name, status:t.status, crumbs:[['Платежи подрядчикам','#/payments'],[t.name]],
    fields:[['Контрагент',cpLink(t.counterparty)],['Вид операции',esc(t.op)],['Этап',esc(t.stage)],['Дата',t.date],['Сумма',money(t.amount)]],
    rel:[{k:'Контрагент',t:cpName(t.counterparty),h:'#/counterparty/'+t.counterparty}], hist:[]});
});
route(/^\/(report|setting|wiki)\/([\w-]+)$/, ([k,id])=>{
  const coll={report:'reports',setting:'settings',wiki:'wiki'}[k]; const t=store.s[coll].find(x=>x.id===id); if(!t) return notFound(); resetTab(id);
  card({title:t.name, crumbs:[[{report:'Отчёты',setting:'Настройки',wiki:'Wiki'}[k],'#/search?cat='+coll],[t.name]], fields:[['Обновлён',t.updated],['Ключевые слова',esc(t.text)]], rel:[], hist:[]});
});
function notFound(){ A().setCrumbs([['Не найдено']],true); A().content(`<div class="page">${A().ph('Объект не найден')}<div class="paper empty"><b>Объект удалён или недоступен</b><a href="#/processes">К списку процессов</a></div></div>`); }

window.CARDS={uni, cpName};
})();
