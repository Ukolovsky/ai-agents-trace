/* Мастер «Импорт из файла» (OverlayScreen): Общие данные → Распознанные поля → Товары → Контрагенты → Создать. */
(function(){
const {I,PDF,esc,money,norm,store,notify,route,go,chip} = BP;
const R=()=>store.s.recognition;
const STEPS=['Общие данные','Распознанные поля','Товары','Контрагенты'];
let picked=null; // ключ поля, в которое вставляем выделенный фрагмент

function draftOf(id){
  const d=store.s.drafts[id]; if(!d) return null;
  if(!d.fields){ const r=R(); Object.assign(d,{title:r.title, description:r.description, recognized:false,
    fields:r.fields.map(f=>Object.assign({},f,{ok:!f.attention, orig:f.value})), items:r.items.map(i=>Object.assign({},i,{action:i.match?'match':'create'})),
    parties:r.parties.map(p=>Object.assign({},p,{action:p.match?'match':'create'})), tab:'att'}); store.save(); }
  return d;
}

route(/^\/import\/start$/, (_,q)=>{ go('#/payments'); setTimeout(()=>MP.attachSend(q.file||'file-tn-0842'),200); });
route(/^\/import\/([\w-]+)$/, ([id])=>{
  const d=draftOf(id); if(!d){ go('#/'); return; }
  if(d.done){ go('#/document/'+d.done); return; }
  draw(id,d);
});

function draw(id,d){
  const ov=document.getElementById('overlay'); const f=store.s.demoFiles.find(x=>x.id===d.file);
  const att=d.fields.filter(x=>!x.ok).length;
  ov.innerHTML=`<div class="overlay" role="dialog" aria-label="Импорт из файла">
   <div class="appbar"><button class="ibtn" id="ovx" title="Закрыть мастер">${I('close')}</button><span class="body1">Импорт из файла</span><span class="file-chip">${PDF}${esc(f.name)}</span><span class="sp"></span>
    <div class="stepper">${STEPS.map((s,i)=>`${i?`<span class="step-line ${i<=d.step?'done':''}"></span>`:''}<span class="step ${i<d.step?'done':i===d.step?'cur':''}"><i>${i<d.step?'✓':i+1}</i>${s}</span>`).join('')}</div></div>
   <div class="ovbody" id="ovbody">${[general,fieldsStep,itemsStep,partiesStep][d.step](d)}</div>
   <div class="bottombar"><button class="btn pri out" id="ovback" ${d.step===0?'disabled':''}>Назад</button><span class="sp" style="flex:1"></span>
    ${d.step===1&&att?`<span class="muted">Осталось проверить полей: ${att}</span>`:''}
    ${d.step<3?`<button class="btn ${d.step===1&&att?'dis':''}" id="ovnext" ${!d.recognized?'disabled':''}>Далее</button>`:`<button class="btn" id="ovcreate">Создать</button>`}</div></div>`;
  ov.querySelector('#ovx').onclick=()=>{ notify('Черновик импорта сохранён, вернуться можно из MagicPad','info'); history.length>1?history.back():go('#/payments'); };
  ov.querySelector('#ovback').onclick=()=>{ d.step--; store.save(); draw(id,d); };
  const nx=ov.querySelector('#ovnext'); nx&&(nx.onclick=()=>{
    if(d.step===1&&att){ notify(`Подтвердите поля, требующие внимания: ${att}`,'warning'); d.tab='att'; draw(id,d); return; }
    if(d.step===1) store.mark('fields');
    d.step++; store.save(); draw(id,d); });
  const cr=ov.querySelector('#ovcreate'); cr&&(cr.onclick=()=>create(id,d));
  bind[d.step](id,d,ov);
}

/* ---------- Шаг 1: общие данные + анимация распознавания ---------- */
function general(d){
  return `<div class="row" style="align-items:flex-start"><div class="paper col" style="flex:1;max-width:760px">
   <h2 class="h3">Общие данные</h2>
   <div class="fld"><label>Процесс <span class="req">*</span></label><select class="sel inp" id="gproc">${store.s.processes.map(p=>`<option value="${p.id}" ${p.id===d.process?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div>
   <div class="fld"><label>Название документа <span class="req">*</span></label><input class="inp" id="gtitle" value="${esc(d.title)}"></div>
   <div class="fld"><label>Описание</label><textarea class="ta" id="gdesc">${esc(d.description)}</textarea></div>
   <div class="fld"><label>Тип документа</label><input class="inp" value="Товарная накладная (ТОРГ-12)" disabled></div></div>
   <div class="paper magic col" style="width:380px;flex:none" id="recbox">${d.recognized?recDone(d):`<b class="sub1">Феликс распознаёт документ</b><div class="proc-steps" id="rsteps">${['Распознавание текста (OCR)','Поиск реквизитов ТОРГ-12','Сопоставление товаров с каталогом','Сопоставление контрагентов'].map(s=>`<div>${I('ok','ic16')}<span>${s}</span></div>`).join('')}</div>`}</div></div>`;
}
function recDone(d){ const att=d.fields.filter(f=>!f.ok).length;
  return `<div class="row" style="gap:8px;align-items:center">${I('ok')}<b class="sub1">Распознано полей: ${d.fields.length}</b></div>
  <span>Требуют внимания: <b>${att}</b>. Товаров: ${d.items.length}, из них новых: ${d.items.filter(i=>!i.match).length}. Контрагентов: ${d.parties.length}, новых: ${d.parties.filter(p=>!p.match).length}.</span>`; }
const bind=[
 (id,d,ov)=>{
  ov.querySelector('#gproc').onchange=e=>{d.process=e.target.value;store.save();};
  ov.querySelector('#gtitle').oninput=e=>{d.title=e.target.value;store.save();};
  ov.querySelector('#gdesc').oninput=e=>{d.description=e.target.value;store.save();};
  if(!d.recognized){ const rows=[...ov.querySelectorAll('#rsteps div')]; let i=0;
    const tick=()=>{ if(!document.getElementById('rsteps')) return; rows.forEach((r,j)=>{ r.className=j<i?'done':j===i?'cur':''; if(j===i) r.firstElementChild.outerHTML='<span class="spin"></span>'; });
      if(i>=rows.length){ d.recognized=true; store.save(); draw(id,d); notify('Документ распознан. Проверьте поля на следующем шаге'); return; } i++; setTimeout(tick,700); };
    tick(); }
 },
 /* ---------- Шаг 2: распознанные поля + документ с подсветкой ---------- */
 (id,d,ov)=>{
  const doc=ov.querySelector('.docview');
  const focus=key=>{ picked=key; ov.querySelectorAll('.rfi').forEach(x=>x.classList.toggle('on',x.dataset.k===key));
    doc.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('hl',x.dataset.f===key));
    const t=doc.querySelector(`[data-f="${key}"]`); t&&t.scrollIntoView({block:'center',behavior:'smooth'});
    doc.classList.add('picking'); };
  ov.querySelectorAll('.rfi').forEach(r=>{ const k=r.dataset.k, f=d.fields.find(x=>x.key===k);
    r.addEventListener('click',()=>focus(k));
    const inp=r.querySelector('input'); inp.addEventListener('focus',()=>focus(k));
    inp.addEventListener('input',()=>{ f.value=inp.value; store.save(); inp.classList.toggle('err',f.required&&!f.value.trim()); });
    inp.addEventListener('change',()=>{ if(f.ok && f.value!==f.orig){ f.edited=1; store.save(); } });
    const lb=r.querySelector('.lbl'); lb&&lb.addEventListener('input',()=>{ f.label=lb.value; store.save(); });
    const ok=r.querySelector('[data-ok]'); ok&&ok.addEventListener('click',e=>{ e.stopPropagation();
      if(f.required&&!f.value.trim()){ inp.classList.add('err'); notify(`Поле «${esc(f.label)}» обязательное: введите значение или выделите его в документе`,'warning'); return; }
      f.ok=true; f.conf=100; f.edited=f.value!==f.orig; store.save(); notify(`Поле «${esc(f.label)}» подтверждено`); draw(id,d); });
  });
  ov.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ d.tab=b.dataset.tab; store.save(); draw(id,d); });
  ov.querySelector('#addf').onclick=()=>{ const k='custom'+Date.now(); d.fields.push({key:k,label:'Новое поле',value:'',conf:100,ok:false,custom:1,src:'добавлено вручную: выделите значение в документе'}); d.tab='att'; store.save(); draw(id,d); setTimeout(()=>{const x=document.querySelector(`.rfi[data-k="${k}"] .lbl`); x&&x.select();},30); };
  // Выделение текста в документе → кнопка «Вставить в поле»
  doc.addEventListener('mouseup',()=>{ const s=getSelection(); const txt=s.toString().trim(); document.querySelectorAll('.selpop').forEach(x=>x.remove());
    if(!txt||!picked) return; const f=d.fields.find(x=>x.key===picked); const rc=s.getRangeAt(0).getBoundingClientRect();
    const b=document.createElement('div'); b.className='selpop'; b.style.left=rc.left+'px'; b.style.top=(rc.bottom+6)+'px';
    b.innerHTML=`<button class="btn pri s">${I('add','ic16')}Вставить в «${esc(f.label)}»</button>`;
    b.onmousedown=e=>{ e.preventDefault(); f.value=txt; f.src='выделено пользователем в документе'; store.save(); b.remove(); s.removeAllRanges(); notify(`Значение «${esc(txt)}» вставлено в поле «${esc(f.label)}»`,'info'); draw(id,d);
      setTimeout(()=>{ const r=document.querySelector(`.rfi[data-k="${f.key}"]`); r&&r.click(); },30); };
    document.body.appendChild(b); });
  if(picked && d.fields.some(f=>f.key===picked)) { const r=ov.querySelector(`.rfi[data-k="${picked}"]`); r?focus(picked):null; }
 },
 (id,d,ov)=>{ ov.querySelectorAll('[data-item]').forEach(s=>s.onchange=()=>{ d.items[+s.dataset.item].action=s.value; store.save(); }); },
 (id,d,ov)=>{ ov.querySelectorAll('[data-pf]').forEach(inp=>inp.oninput=()=>{ const [i,k]=inp.dataset.pf.split('.'); d.parties[+i][k]=inp.value; store.save(); }); }
];

function ring(c){ const r=15, L=2*Math.PI*r, col=c>=90?'var(--success)':c>=60?'var(--warning)':'var(--error)';
  return `<div class="ring" title="Уверенность распознавания ${c}%"><svg width="36" height="36"><circle cx="18" cy="18" r="${r}" fill="none" stroke="var(--lightGrey)" stroke-width="3"/><circle cx="18" cy="18" r="${r}" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="${L*c/100} ${L}"/></svg><span>${c}%</span></div>`; }
function fieldsStep(d){
  const att=d.fields.filter(f=>!f.ok), ok=d.fields.filter(f=>f.ok); const list=d.tab==='ok'?ok:att;
  return `<div class="row" style="flex:1;min-height:0;align-items:stretch">
   <div class="rf"><div class="row" style="align-items:center;gap:8px"><h2 class="h4">Распознанные поля</h2><button class="plus" id="addf" title="Добавить поле" style="margin-left:auto">${I('add')}</button></div>
    <div class="tabs soft"><button data-tab="att" class="${d.tab!=='ok'?'on':''}">Требуют внимания <span class="counter">${att.length}</span></button><button data-tab="ok" class="${d.tab==='ok'?'on':''}">Распознано <span class="counter">${ok.length}</span></button></div>
    <span class="cap muted">Нажмите на поле, чтобы увидеть фрагмент в документе. Чтобы заполнить поле из документа, выделите текст мышью.</span>
    <div class="rf-list">${list.length?list.map(f=>`<div class="rfi" data-k="${f.key}">
      ${f.custom?`<input class="inp lbl" style="grid-column:1/3;height:28px;font-size:12px" value="${esc(f.label)}" aria-label="Название поля">`:`<label>${esc(f.label)}${f.required?' <span style="color:var(--error)">*</span>':''}${f.edited?' · <span style="color:var(--info)">исправлено</span>':''}</label>`}
      <input class="inp ${f.required&&!f.value?'err':''}" value="${esc(f.value)}" placeholder="${f.key==='ttn'?'Выделите номер в документе':'Значение'}" aria-label="${esc(f.label)}">${ring(f.conf)}
      <span class="src">${I('info','ic16')} ${esc(f.src)}</span>${!f.ok?`<div class="acts"><button class="btn s" data-ok="1">${I('check','ic16')}Подтвердить</button></div>`:''}</div>`).join(''):`<div class="empty"><b>Все поля проверены</b>Можно переходить к товарам</div>`}</div></div>
   <div class="docview" id="docview">${torg()}</div></div>`;
}
/* Предпросмотр ТОРГ-12. data-f = ключ распознанного поля. Номер ТТН в разметке не размечен: его выделяет пользователь. */
function torg(){
  const r=R(); const it=r.items; const F=k=>(r.fields.find(f=>f.key===k)||{}).value;
  return `<div class="torg"><div class="form" data-f="form">Унифицированная форма № ТОРГ-12<br>Утверждена постановлением Госкомстата России от 25.12.98 № 132</div>
  <h3>ТОВАРНАЯ НАКЛАДНАЯ</h3><div class="no">№ <span data-f="number">ТН-0842</span> от <span data-f="date">10.07.2026</span></div>
  <div class="kv"><span class="muted">Грузоотправитель</span><span><span data-f="shipper">ООО «СтройМонолит»</span>, ИНН <span data-f="shipperInn">6730123456</span>, КПП <span data-f="shipperKpp">673001001</span>, <span data-f="shipperAddr">${esc(F('shipperAddr'))}</span></span></div>
  <div class="kv"><span class="muted">Грузополучатель</span><span><span data-f="consignee" style="filter:blur(.4px)">ООО «ИнвестСтрой»</span>, ИНН <span data-f="consigneeInn">6731987654</span>, КПП <span data-f="consigneeKpp">673101001</span>, <span data-f="consigneeAddr">${esc(F('consigneeAddr'))}</span></span></div>
  <div class="kv"><span class="muted">Поставщик</span><span data-f="supplier">ООО «СтройМонолит»</span></div>
  <div class="kv"><span class="muted">Плательщик</span><span data-f="payer">ООО «ИнвестСтрой»</span></div>
  <div class="kv"><span class="muted">Основание</span><span data-f="basis">Договор поставки № 118-П от 02.06.2026</span></div>
  <div class="kv"><span class="muted">Транспортная накладная</span><span class="pickable" id="ttnfrag">№ ТТН-5531 от 10.07.2026</span></div>
  <table><thead><tr><th>№</th><th>Товар</th><th>Ед.</th><th>Кол-во</th><th>Цена, ₽</th><th>Сумма с НДС, ₽</th></tr></thead><tbody>
  ${it.map(i=>`<tr><td>${i.n}</td><td><span data-f="item${i.n}">${esc(i.name)}</span></td><td>${i.unit}</td><td class="n">${i.qty}</td><td class="n">${i.price.toLocaleString('ru-RU')}</td><td class="n">${i.sum.toLocaleString('ru-RU')},00</td></tr>`).join('')}</tbody></table>
  <div class="tot"><span>Итого (с НДС):</span><b data-f="total">486 200,00</b><span>в т. ч. НДС 20%:</span><span data-f="vat">81 033,33</span></div>
  <p>Всего наименований <span data-f="positions">3</span>, всего мест <span data-f="places">15</span>. Масса груза нетто <span data-f="netto">3 200</span> кг, брутто <span data-f="brutto">3 350</span> кг.</p>
  <p class="muted">Отпуск груза разрешил: директор Петров А. В. &nbsp;&nbsp; Груз получил: кладовщик Сидоров И. И.</p></div>`;
}
/* ---------- Шаг 3: товары ---------- */
function itemsStep(d){
  return `<div class="paper col"><h2 class="h3">Товары из накладной</h2><span class="muted">Феликс сопоставил позиции с каталогом «Стройматериалы». Новые позиции будут созданы при сохранении.</span>
  <div class="tblwrap"><table class="uni"><colgroup><col style="width:40px"><col><col style="width:80px"><col style="width:110px"><col style="width:120px"><col style="width:320px"></colgroup>
  <thead><tr><th>№</th><th>Наименование</th><th>Кол-во</th><th>Цена</th><th>Сумма</th><th>Сопоставление</th></tr></thead><tbody>
  ${d.items.map((i,n)=>`<tr class="${i.match?'':'new'}"><td>${i.n}</td><td title="${esc(i.name)}">${esc(i.name)}</td><td>${i.qty} ${i.unit}</td><td>${money(i.price)}</td><td>${money(i.sum)}</td>
   <td>${i.match?`${I('ok','ic16')} <span style="color:var(--success)">Найден в каталоге</span>`:`<select class="inp" style="height:28px;padding:2px 8px" data-item="${n}"><option value="create" ${i.action==='create'?'selected':''}>Создать новый товар</option>${store.s.products.filter(p=>!p.imported).map(p=>`<option value="${p.id}" ${i.action===p.id?'selected':''}>Сопоставить: ${esc(p.name)}</option>`).join('')}</select>`}</td></tr>`).join('')}</tbody></table></div>
  <div class="row" style="justify-content:flex-end;gap:24px"><span class="muted">Итого с НДС</span><b>${money(d.items.reduce((a,i)=>a+i.sum,0))}</b></div></div>`;
}
/* ---------- Шаг 4: контрагенты ---------- */
function partiesStep(d){
  return `<div class="paper col"><h2 class="h3">Контрагенты</h2><div class="grid3" style="grid-template-columns:1fr 1fr">${d.parties.map((p,i)=>`<div class="paper out col">
   <div class="row" style="align-items:center;gap:8px"><span class="cap muted">${esc(p.role)}</span><span style="margin-left:auto">${p.match?'<span class="chip green">Найден в справочнике</span>':'<span class="chip blue">Будет создан</span>'}</span></div>
   ${p.match?`<b class="h4">${esc(p.name)}</b><span class="muted">ИНН ${p.inn} · КПП ${p.kpp}</span><span class="muted">${esc(p.address)}</span><a href="#/counterparty/${p.match}" target="_blank">Открыть карточку</a>`:
   [['name','Название'],['inn','ИНН'],['kpp','КПП'],['address','Адрес']].map(([k,l])=>`<div class="fld"><label>${l} <span class="req">*</span></label><input class="inp" data-pf="${i}.${k}" value="${esc(p[k])}"></div>`).join('')}</div>`).join('')}</div></div>`;
}

/* ---------- Создание объектов ---------- */
function create(id,d){
  const s=store.s, F=k=>(d.fields.find(f=>f.key===k)||{}).value||'';
  const np=d.parties.find(p=>!p.match);
  if(np && (!np.name.trim()||!/^\d{10}$/.test(np.inn))){ notify('Проверьте контрагента: название и ИНН из 10 цифр обязательны','error'); return; }
  const docId=store.id('doc'); let newCp=null; const newProds=[];
  if(np){ newCp={id:store.id('cp'),name:np.name,inn:np.inn,kpp:np.kpp,address:np.address,role:'Покупатель',status:'Новый',manager:s.company.user,since:s.today,imported:true,source:docId};
    s.counterparties.push(newCp); }
  const supplier=d.parties.find(p=>p.match).match;
  const items=d.items.map(i=>{ let pid=i.match;
    if(!pid){ if(i.action==='create'){ const p={id:store.id('pr'),name:i.name,unit:i.unit,price:i.price,article:'ARM-A500-12',group:'Металлопрокат',supplier,stock:i.qty,imported:true}; s.products.push(p); newProds.push(p); pid=p.id; } else pid=i.action; }
    return {n:i.n,name:i.name,unit:i.unit,qty:i.qty,price:i.price,sum:i.sum,product:pid}; });
  const doc={id:docId,name:`${d.title} от ${F('date')}`,type:'Товарная накладная',counterparty:supplier,consignee:newCp?newCp.id:null,date:F('date'),updated:s.today,amount:486200,status:'Сохранён',stage:'Регистрация',process:d.process,
    file:s.demoFiles.find(f=>f.id===d.file).name,imported:true,items,fields:d.fields.map(f=>({label:f.label,value:f.value}))};
  s.documents.push(doc);
  s.events.unshift({date:s.today,who:'Феликс',text:`Создан документ «${doc.name}» из файла`,counterparty:supplier,object:docId});
  if(newCp) s.events.unshift({date:s.today,who:'Феликс',text:`Создан контрагент ${newCp.name} из накладной ТН-0842`,counterparty:newCp.id});
  newProds.forEach(p=>s.events.unshift({date:s.today,who:'Феликс',text:`Создан товар «${p.name}»`,object:p.id}));
  d.done=docId; store.mark('created');
  document.getElementById('overlay').innerHTML='';
  notify(`Документ «${esc(doc.name)}» сохранён. Создано: контрагент ${newCp?1:0}, товаров ${newProds.length}`);
  MP.open();
  MP.bot(`<span>Готово! Документ <b>${esc(doc.name)}</b> сохранён в процессе «${esc(store.proc(d.process).name)}».</span><span>Создал контрагента ${newCp?`<b>${esc(newCp.name)}</b>`:'—'} и ${newProds.length} товар${newProds.length===1?'':'а'}: ${newProds.map(p=>esc(p.name)).join(', ')||'—'}. Остальные позиции сопоставлены с каталогом.</span>`,
    [{t:'Открыть документ',a:'go:#/document/'+docId},...(newCp?[{t:newCp.name,d:'Карточка контрагента',a:'go:#/counterparty/'+newCp.id}]:[]),...newProds.map(p=>({t:p.name,d:'Карточка товара',a:'go:#/product/'+p.id})),{t:'Найти в ИИ поиске',a:'say:Найди ИнвестСтрой'}]);
  go('#/document/'+docId);
}
})();
