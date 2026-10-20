/* Мастер импорта строго по макетам Figma «4. Документооборот»:
   U3 Общие данные (3343-221210/221996) → U4 Распознанные поля (3343-222462, 3349-*, 3006-*, 3014-*) → «Создать».
   Дальше цикл MagicPad U5/U9: черновик → «Проверить и создать» контрагента (3392-499892) → «Связать и запустить» → «Создать товар». */
(function(){
const {I,esc,money,norm,store,notify,route,go,chip} = BP;
const R=()=>store.s.recognition;
const TYPES=['Строка','Число','Дата и время','Дата','Время','Ссылка'];
let picked=null;

function draftOf(id){
  const d=store.s.drafts[id]; if(!d) return null;
  if(!d.fields){ const r=R(); Object.assign(d,{title:r.title, description:r.description, informer:true, q:'',
    fields:r.fields.filter(f=>f.key!=='ttn').map(f=>Object.assign({},f,{ok:f.conf>=70, orig:f.value})), tab:'att', panel:null, side:null}); store.save(); }
  return d;
}
const wz=()=>document.getElementById('overlay');
function shell(head, body, foot){ wz().innerHTML=`<div class="overlay wz" role="dialog">${head}<div class="ovbody">${body}</div><div class="bottombar">${foot}</div></div>`; }
function head(title, extra=''){ return `<div class="ph wz-h"><div class="title"><button class="ibtn out sec" id="wzx" title="Закрыть">${I('close')}</button><h1 class="h1">${esc(title)}</h1>${extra}</div>
  <div class="acts"><button class="ibtn out" title="Справка BusinessPad">${BP.BPLOGO}</button><button class="ibtn magic" data-act="mp" title="MagicPad">${I('shine')}</button></div></div>`; }
function stepper(n){ return `<div class="stepper"><span class="step ${n>0?'done':'cur'}"><i>1</i>Общие данные</span><span class="step-line ${n>0?'done':''}"></span><span class="step ${n===1?'cur':''}"><i>2</i>Распознанные…</span></div>`; }

route(/^\/import\/start$/, (_,q)=>{ go('#/payments'); setTimeout(()=>MP.attachSend(q.file||'file-tn-0842'),200); });
route(/^\/import\/([\w-]+)$/, ([id])=>{
  const d=draftOf(id); if(!d){ go('#/payments'); return; }
  if(d.done){ go('#/document/'+d.done); return; }
  APP.setCrumbs([['Финансы','#/payments'],['Платежи подрядчикам','#/payments'],['Предпросмотр документа']], true);
  if(MP.isOpen()) MP.close();
  draw(id,d);
});

function draw(id,d){
  const p=store.proc(d.process); const title=`Товарная накладная для процесса «${p.name}»`;
  if(d.step===0){
    shell(head(title), `<div class="paper col" style="flex:1"><h2 class="h3">Общие данные</h2>
      <div class="fld" style="max-width:574px"><label>Название</label><input class="inp" id="gtitle" maxlength="100" placeholder="Введите название" value="${esc(d.title)}"><span class="cnt" id="ct1">${d.title.length}/100</span></div>
      <div class="fld" style="max-width:574px"><label>Описание</label><textarea class="ta" id="gdesc" maxlength="250" placeholder="Введите описание">${esc(d.description)}</textarea><span class="cnt" id="ct2">${d.description.length}/250</span></div></div>`,
      `${stepper(0)}<span style="flex:1"></span><button class="btn" id="wznext" ${d.title.trim()?'':'disabled'}>Далее</button><button class="btn out" id="wzcancel">Отменить</button>`);
    const t=wz().querySelector('#gtitle'), ds=wz().querySelector('#gdesc');
    t.oninput=()=>{ d.title=t.value; store.save(); wz().querySelector('#ct1').textContent=t.value.length+'/100'; wz().querySelector('#wznext').disabled=!t.value.trim(); };
    ds.oninput=()=>{ d.description=ds.value; store.save(); wz().querySelector('#ct2').textContent=ds.value.length+'/250'; };
    wz().querySelector('#wznext').onclick=()=>{ d.step=1; store.save(); draw(id,d); };
  } else {
    shell(head(title), `<div class="row" style="flex:1;min-height:0;align-items:stretch"><div class="docview" id="docview">${torg()}</div>${d.panel==='notfound'?notFoundPanel():fieldsPanel(d)}</div>`,
      `${stepper(1)}<span style="flex:1"></span><button class="btn" id="wzcreate">Создать</button><button class="btn out" id="wzcancel">Отменить</button>`);
    bindFields(id,d);
    wz().querySelector('#wzcreate').onclick=()=>create(id,d);
  }
  wz().querySelector('#wzx').onclick=wz().querySelector('#wzcancel').onclick=()=>go('#/payments');
  sidepage(id,d);
}

function ring(c){ const r=13, L=2*Math.PI*r, col=c>=70?'var(--primary)':'var(--secondary)';
  return `<div class="ring" title="Уверенность ${c}%"><svg width="32" height="32"><circle cx="16" cy="16" r="${r}" fill="none" stroke="var(--lightGrey)" stroke-width="2.5"/><circle cx="16" cy="16" r="${r}" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="${c?L*c/100:L*.75} ${L}"/></svg><span>${c}%</span></div>`; }
function fieldsPanel(d){
  const att=d.fields.filter(f=>!f.ok), ok=d.fields.filter(f=>f.ok); const q=norm(d.q);
  const list=(d.tab==='ok'?ok:att).filter(f=>!q||norm(f.label+' '+f.value).includes(q));
  const cp=R().parties.find(p=>!p.match);
  return `<div class="rf"><div class="row" style="align-items:center;gap:8px;position:relative"><h2 class="h3">Распознанные поля</h2><button class="dotinfo" id="dotinfo" title="Подробнее"></button>
    ${d.informer?`<div class="informer" id="informer"><span>Этот экземпляр сохранится черновиком. Нет экземпляра контрагента с названием ${esc(cp.name)}</span><button class="ibtn s" id="infx">${I('close','ic16')}</button></div>`:''}</div>
   <div class="tabs soft"><button data-tab="att" class="${d.tab!=='ok'?'on':''}">Требуют внимания <span class="counter">${att.length}</span></button><button data-tab="ok" class="${d.tab==='ok'?'on':''}">Распознано <span class="counter">${ok.length}</span></button></div>
   <div class="search">${I('search')}<input class="inp" id="fq" placeholder="Введите поисковый запрос..." value="${esc(d.q)}"></div>
   <div class="row" style="align-items:center;gap:8px"><span class="h4">Поля</span><button class="plus" id="addf" title="Добавить поле" style="width:24px;height:24px">${I('add','ic16')}</button><span class="cap muted" style="margin-left:auto">Уверенность ${d.tab==='ok'?'выше':'ниже'} 70%</span></div>
   <div class="rf-list">${list.map(f=>`<div class="rfi" data-k="${f.key}"><label>${esc(f.label)}${f.required?' <span style="color:var(--error)">*</span>':''}</label>
     <input class="inp" value="${esc(f.value)}" aria-label="${esc(f.label)}">${ring(f.conf)}<span class="src">${f.manual?esc(f.src):'Источник: '+esc(f.src)}</span></div>`).join('')}</div></div>`;
}
function notFoundPanel(){ return `<div class="rf" style="align-items:center;justify-content:center;text-align:center"><div class="loader"><img src="assets/logo.png" alt=""></div><b class="h4">Значение не найдено</b><span class="cap muted">Выделите фрагмент документа, где оно указано</span></div>`; }

function bindFields(id,d){
  const ov=wz(), doc=ov.querySelector('#docview');
  const focus=key=>{ picked=key; ov.querySelectorAll('.rfi').forEach(x=>x.classList.toggle('on',x.dataset.k===key));
    doc.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('hl',x.dataset.f===key));
    const t=doc.querySelector(`[data-f="${key}"]`); t&&t.scrollIntoView({block:'center',behavior:'smooth'}); };
  ov.querySelectorAll('.rfi').forEach(r=>{ const k=r.dataset.k, f=d.fields.find(x=>x.key===k), inp=r.querySelector('input');
    r.addEventListener('click',()=>focus(k)); inp.addEventListener('focus',()=>focus(k));
    inp.addEventListener('input',()=>{ f.value=inp.value; store.save(); });
    inp.addEventListener('change',()=>{ if(!f.ok && f.value.trim() && f.value!==f.orig){ f.ok=true; f.conf=100; f.src='исправлено вручную'; store.save(); draw(id,d); } });
  });
  ov.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ d.tab=b.dataset.tab; store.save(); draw(id,d); });
  const fq=ov.querySelector('#fq'); fq&&(fq.oninput=()=>{ d.q=fq.value; store.save(); const pos=fq.selectionStart; draw(id,d); const n=wz().querySelector('#fq'); n.focus(); n.setSelectionRange(pos,pos); });
  const di=ov.querySelector('#dotinfo'); di&&(di.onclick=()=>{ d.informer=!d.informer; store.save(); draw(id,d); });
  const ix=ov.querySelector('#infx'); ix&&(ix.onclick=()=>{ d.informer=false; store.save(); draw(id,d); });
  const af=ov.querySelector('#addf'); af&&(af.onclick=()=>{ d.side={name:'',type:'',value:'',src:null,ignore:false}; store.save(); draw(id,d); });
  // Выделение фрагмента: в режиме «Значение не найдено» возвращаемся в боковую панель со значением и источником (3014-374302 → 3014-374921)
  doc.addEventListener('mouseup',()=>{ if(d.panel!=='notfound') return; const txt=getSelection().toString().trim(); if(!txt) return;
    getSelection().removeAllRanges(); d.side=Object.assign(d.pendingSide||{}, {value:txt, src:txt}); d.panel=null; store.save(); draw(id,d); });
  if(picked && ov.querySelector(`.rfi[data-k="${picked}"]`)) focus(picked);
}

/* ---------- Side page «Добавить поле» (справа) ---------- */
function sidepage(id,d){
  document.querySelectorAll('.sp-back,.sidepage').forEach(x=>x.remove());
  const s=d.side; if(!s) return;
  const back=document.createElement('div'); back.className='sp-back'; document.body.appendChild(back);
  const sp=document.createElement('div'); sp.className='sidepage'; sp.setAttribute('role','dialog'); sp.setAttribute('aria-label','Добавить поле');
  const can=s.name.trim()&&s.type;
  sp.innerHTML=`<button class="ibtn out sec sp-x" title="Закрыть">${I('close')}</button><h1 class="h1">Добавить поле</h1>
   <div class="paper col" style="flex:1">${s.checking?`<div class="col" style="flex:1;align-items:center;justify-content:center;text-align:center;gap:8px"><div class="loader"><img src="assets/logo.png" alt=""></div><b class="h4">Проверяем значение по документу</b><span class="cap muted">Новое поле ещё не добавлено</span></div>`:
   `<h2 class="h3">Основная информация</h2>
    <div class="fld"><label>Название поля</label><input class="inp" id="sname" placeholder="Введите название поля" value="${esc(s.name)}"></div>
    <div class="fld"><label>Тип поля</label><select class="inp" id="stype"><option value="" disabled ${s.type?'':'selected'}>Выберите тип поля</option>${TYPES.map(t=>`<option ${s.type===t?'selected':''}>${t}</option>`).join('')}</select></div>
    <div class="fld"><label>Значение поля</label><input class="inp" id="sval" placeholder="Введите значение поля" value="${esc(s.value)}"></div>
    ${s.src?`<div class="fld"><label>Источник</label><div class="srcbox"><span>Фрагмент документа: <span class="cap">${esc(s.src)}</span></span><button class="btn pri out s" id="schg">Изменить</button></div></div>
    <label class="row" style="gap:8px;align-items:center"><input type="checkbox" class="chk" id="sign" ${s.ignore?'checked':''}>Игнорировать источник</label>`:''}`}</div>
   <div class="row" style="justify-content:space-between"><button class="btn" id="sadd" ${can&&!s.checking?'':'disabled'}>Добавить</button><button class="btn out" id="sclose">Закрыть</button></div>`;
  document.body.appendChild(sp);
  const close=()=>{ d.side=null; store.save(); draw(id,d); };
  sp.querySelector('.sp-x').onclick=sp.querySelector('#sclose').onclick=back.onclick=close;
  if(s.checking) return;
  const upd=()=>{ s.name=sp.querySelector('#sname').value; s.type=sp.querySelector('#stype').value; s.value=sp.querySelector('#sval').value; store.save(); sp.querySelector('#sadd').disabled=!(s.name.trim()&&s.type); };
  ['#sname','#sval'].forEach(q=>sp.querySelector(q).oninput=upd); sp.querySelector('#stype').onchange=upd;
  const ig=sp.querySelector('#sign'); ig&&(ig.onchange=()=>{ s.ignore=ig.checked; store.save(); });
  const ch=sp.querySelector('#schg'); ch&&(ch.onclick=()=>{ d.pendingSide=Object.assign({},s); d.side=null; d.panel='notfound'; store.save(); draw(id,d); });
  sp.querySelector('#sadd').onclick=()=>{
    if(s.src||s.ignore) return addField(id,d,s);
    s.checking=true; store.save(); draw(id,d);
    setTimeout(()=>{ s.checking=false; const txt=norm(document.getElementById('docview').innerText);
      if(s.value.trim() && txt.includes(norm(s.value))) addField(id,d,s);
      else { d.pendingSide=Object.assign({},s); d.side=null; d.panel='notfound'; store.save(); draw(id,d); notify('Значение не найдено. Выделите фрагмент документа, где оно указано','warning'); } },1200);
  };
}
function addField(id,d,s){
  const k=/транспорт/i.test(s.name)?'ttn':'custom'+Date.now();
  d.fields.push({key:k,label:s.name,type:s.type,value:s.value,conf:100,ok:true,manual:true,src:'Добавлено вручную'+(s.src&&!s.ignore?'':'' )});
  d.side=null; d.pendingSide=null; d.panel=null; d.tab='att'; store.mark('fields'); draw(id,d); notify(`Новое поле «${esc(s.name)}» добавлено`);
}

/* Предпросмотр ТОРГ-12 (как на макете 3343-222462). data-f = ключ распознанного поля. */
function torg(){
  const r=R(); const F=k=>(r.fields.find(f=>f.key===k)||{}).value;
  return `<div class="torg"><div class="form"><span data-f="form-l">Унифицированная форма №</span> <span data-f="form">ТОРГ-12</span><br>Утверждена Постановлением Госкомстата России<br>от 25.12.1998 № 132</div>
  <h3>ТОВАРНАЯ НАКЛАДНАЯ</h3><div class="no">№ <span data-f="number">ТН-0842</span> от <span data-f="date">10 июля 2026 г.</span></div>
  <div class="kv"><span>Грузоотправитель:</span><span><span data-f="shipper">ООО «СтройМонолит»</span>, <span data-f="shipperAddr">${esc(F('shipperAddr'))}</span>, ИНН <span data-f="shipperInn">6730123456</span> / КПП <span data-f="shipperKpp">673001001</span></span></div>
  <div class="kv"><span>Грузополучатель:</span><span><span data-f="consignee">ООО «ИнвестСтрой»</span>, <span data-f="consigneeAddr">${esc(F('consigneeAddr'))}</span>, ИНН <span data-f="consigneeInn">6731987654</span> / КПП <span data-f="consigneeKpp">673101001</span></span></div>
  <div class="kv"><span>Поставщик:</span><span><span data-f="supplier">ООО «СтройМонолит»</span> (реквизиты те же, что грузоотправителя)</span></div>
  <div class="kv"><span>Плательщик:</span><span><span data-f="payer">ООО «ИнвестСтрой»</span> (реквизиты те же, что грузополучателя)</span></div>
  <div class="kv"><span>Основание:</span><span data-f="basis">Договор поставки № 118-П от 02.06.2026</span></div>
  <div class="kv"><span>Транспортная накладная:</span><span>№ <span data-f="ttn" id="ttnfrag">ТТН-0842</span> от 10.07.2026</span></div>
  <table><thead><tr><th>№</th><th>Товар</th><th>Ед. изм.</th><th>Кол-во</th><th>Цена, ₽</th><th>Сумма, ₽</th></tr></thead><tbody>
  ${r.items.map(i=>`<tr><td>${i.n}</td><td><span data-f="item${i.n}">${esc(i.name)}</span></td><td style="text-align:center">${i.unit}</td><td style="text-align:center">${i.qty.toLocaleString('ru-RU')}</td><td class="n">${i.price.toLocaleString('ru-RU',{minimumFractionDigits:2})}</td><td class="n">${i.sum.toLocaleString('ru-RU',{minimumFractionDigits:2})}</td></tr>`).join('')}</tbody></table>
  <div class="tot"><span>Итого (с НДС):</span><span data-f="total">486 200,00</span><span>в т. ч. НДС 20%:</span><span data-f="vat">81 033,33</span></div>
  <p>Всего наименований <span data-f="positions">3</span> (три), на сумму 486 200,00 (Четыреста восемьдесят шесть тысяч двести) рублей 00 копеек.</p>
  <p>Приложение: паспорт качества, сертификаты соответствия — на 4 л.</p>
  <p>Всего мест: <span data-f="places">15</span>. Масса груза: нетто <span data-f="netto">3 200</span> кг / брутто <span data-f="brutto">3 350</span> кг.</p>
  <p>Отпуск груза разрешил: директор Петров А. В. &nbsp;&nbsp; Груз получил: кладовщик Сидоров И. И.</p></div>`.replace(/\u00a0/g,' ');
}

/* ---------- «Создать»: черновик экземпляра (нет контрагента-грузополучателя) → ответ U5 ---------- */
function create(id,d){
  const s=store.s, F=k=>(d.fields.find(f=>f.key===k)||{}).value||'';
  const bad=d.fields.find(f=>f.required&&!f.value.trim()); if(bad){ notify(`Заполните поле «${esc(bad.label)}»`,'warning'); return; }
  const supplier=R().parties.find(p=>p.match).match, np=R().parties.find(p=>!p.match);
  const docId=store.id('doc');
  const doc={id:docId,name:d.title.trim()||R().title,type:'Товарная накладная',counterparty:supplier,consignee:null,date:F('date'),updated:s.today,amount:486200,status:'Черновик',stage:'Регистрация',process:d.process,
    file:s.demoFiles.find(f=>f.id===d.file).name,imported:true,description:d.description,
    items:R().items.map(i=>({n:i.n,name:i.name,unit:i.unit,qty:i.qty,price:i.price,sum:i.sum,product:i.match})),fields:d.fields.map(f=>({label:f.label,value:f.value}))};
  s.documents.push(doc);
  s.pending={doc:docId, cp:Object.assign({},np,{name:F('consignee')||np.name,description:'Юридическое лицо, грузополучатель по ТН-0842'}), prod:R().items.filter(i=>!i.match).map(i=>Object.assign({},i))};
  s.events.unshift({date:s.today,who:'Феликс',text:`Создан черновик «${doc.name}» из файла`,counterparty:supplier,object:docId});
  d.done=docId; store.mark('fields'); store.mark('created'); store.save();
  wz().innerHTML=''; document.querySelectorAll('.sp-back,.sidepage').forEach(x=>x.remove());
  notify(`Создан черновик экземпляра процесса «${esc(store.proc(d.process).name)}»`);
  go('#/payments'); setTimeout(()=>{ MP.open(); MP.bot('<span>Последний цикл: создано экземпляров - 0, черновиков - 1.</span>',[
    {k:'card',t:doc.name,d:`${store.proc(d.process).name} - черновик сохранён`,a:'go:#/document/'+docId},
    {k:'text',t:'Для запуска нужен контрагент'},
    {k:'btn',t:'Проверить и создать',a:'flow:cp'},{k:'btn',t:'Процессы',a:'go:#/search?cat=processes'}]); },50);
}

/* ---------- Список черновиков процесса (3392-499892): выбор и «Создать» ---------- */
const DRAFT={kontragenty:{proc:'proc-kontragenty',chip:'Контрагенты',list:'Список контрагентов',srch:'Поиск по контрагентам',
   cols:['Название','Описание','Статус','ИНН','КПП','Адрес','Контактное лицо'], rows:()=>store.s.pending&&store.s.pending.cp?[store.s.pending.cp]:[],
   cells:c=>[`<a>${esc(c.name)}</a>`,esc(c.description),chip('Черновик'),c.inn,c.kpp,esc(c.address),'<span class="cap muted">Не заполнено</span>']},
 materials:{proc:'proc-materials',chip:'Товары',list:'Список товаров',srch:'Поиск по товарам',
   cols:['Название','Описание','Статус','Ед. изм.','Цена','Поставщик'], rows:()=>store.s.pending?store.s.pending.prod||[]:[],
   cells:p=>[`<a>${esc(p.name)}</a>`,'Позиция из ТН-0842',chip('Черновик'),p.unit,money(p.price),'ООО «СтройМонолит»']}};
route(/^\/drafts\/(kontragenty|materials)$/, ([k])=>{
  const c=DRAFT[k], p=store.proc(c.proc), rows=c.rows(); const sel=new Set(rows.map((_,i)=>i).slice(0,0));
  APP.setCrumbs([['Финансы','#/payments'],['Платежи подрядчикам','#/payments'],['Предпросмотр документа']], true);
  if(MP.isOpen()) MP.close();
  const inst=store.s.instances.filter(i=>i.process===c.proc).length;
  const render=()=>{ shell(head(p.name,`<span class="chip neutral">${c.chip}</span>`),
   `<div class="paper col" style="flex:1"><div class="tabs"><button class="on">Все <span class="counter">${rows.length}</span></button><button>Черновики <span class="counter">${rows.length}</span></button><button>Экземпляры <span class="counter">${inst}</span></button></div>
    <div class="row" style="align-items:center;gap:12px"><h2 class="h3">${c.list}</h2><span class="counter">${rows.length}</span><div class="search" style="margin-left:auto;width:188px">${I('search')}<input class="inp" placeholder="${c.srch}"></div></div>
    <div class="tblwrap"><table class="uni"><thead><tr><th class="cb"><input type="checkbox" class="chk" id="dall"></th>${c.cols.map(t=>`<th>${t}</th>`).join('')}<th class="act"></th></tr></thead>
    <tbody>${rows.length?rows.map((r,i)=>`<tr><td class="cb"><input type="checkbox" class="chk" data-i="${i}" ${sel.has(i)?'checked':''}></td>${c.cells(r).map(x=>`<td>${x}</td>`).join('')}<td class="act">${I('more','ic16')}</td></tr>`).join(''):`<tr><td colspan="${c.cols.length+2}" class="empty"><b>Черновиков нет</b></td></tr>`}</tbody></table></div></div>`,
   `<span style="flex:1"></span><span class="muted">Выбрано:</span><span class="counter">${sel.size}</span><button class="btn" id="dcreate" ${sel.size?'':'disabled'}>Создать</button><button class="btn out" id="wzcancel">Отменить</button>`);
   wz().querySelectorAll('[data-i]').forEach(x=>x.onchange=()=>{ x.checked?sel.add(+x.dataset.i):sel.delete(+x.dataset.i); render(); });
   const all=wz().querySelector('#dall'); all.checked=rows.length&&sel.size===rows.length; all.onchange=()=>{ rows.forEach((_,i)=>all.checked?sel.add(i):sel.delete(i)); render(); };
   wz().querySelector('#wzx').onclick=wz().querySelector('#wzcancel').onclick=()=>go('#/payments');
   wz().querySelector('#dcreate').onclick=()=>k==='kontragenty'?createCp():createProd([...sel].map(i=>rows[i]));
  }; render();
});
function back(fn){ wz().innerHTML=''; go('#/payments'); setTimeout(()=>{ MP.open(); fn(); },50); }
function createCp(){
  const s=store.s, c=s.pending.cp, doc=store.doc(s.pending.doc);
  const cp={id:store.id('cp'),name:c.name,inn:c.inn,kpp:c.kpp,address:c.address,role:'Покупатель',status:'Действующий',manager:s.company.user,since:s.today,imported:true,source:doc.id};
  s.counterparties.push(cp); s.pending.cp=null; s.pending.cpId=cp.id;
  s.instances.unshift({id:store.id('in'),name:'Проверка контрагента '+cp.name,process:'proc-kontragenty',counterparty:cp.id,stage:'Действующий',status:'В работе',updated:s.today,amount:0});
  s.events.unshift({date:s.today,who:'Феликс',text:`Создан контрагент ${cp.name} из накладной ТН-0842`,counterparty:cp.id});
  store.mark('cp'); store.save();
  notify('Запущен 1 экземпляр процесса «Стройка контрагенты»');
  back(()=>MP.bot('<span>Последний цикл: создано экземпляров - 1, черновиков - 0.</span>',[
    {k:'card',t:cp.name,d:'Стройка контрагенты — экземпляр запущен',a:'go:#/counterparty/'+cp.id},
    {k:'launch',t:'Можно запустить 1 черновик',d:'Связи с созданными экземплярами будут внесены после подтверждения. Незавершённые черновики останутся без изменений.',b:'Связать и запустить',a:'flow:link'},
    {k:'text',t:'Для запуска оставшихся черновиков требуется создать экземпляр процесса «Стройматериалы»'},
    {k:'btn',t:'Создать товар',a:'flow:prod'},{k:'btn',t:'Все процессы',a:'go:#/search?cat=processes'}]));
}
function link(){
  const s=store.s, doc=store.doc(s.pending.doc); doc.consignee=s.pending.cpId; doc.status='Сохранён';
  s.events.unshift({date:s.today,who:'Феликс',text:`Экземпляр «${doc.name}» связан и запущен`,counterparty:doc.consignee,object:doc.id}); store.save();
  notify(`Запущен 1 экземпляр процесса «${esc(store.proc(doc.process).name)}»`);
  MP.bot('<span>Последний цикл: создано экземпляров - 1, черновиков - 0.</span>',[{k:'card',t:doc.name,d:`${store.proc(doc.process).name} — экземпляр запущен`,a:'go:#/document/'+doc.id},...(s.pending.prod.length?[{k:'text',t:'Для запуска оставшихся черновиков требуется создать экземпляр процесса «Стройматериалы»'},{k:'btn',t:'Создать товар',a:'flow:prod'}]:[]),{k:'btn',t:'Все процессы',a:'go:#/search?cat=processes'}]);
}
function createProd(list){
  const s=store.s, doc=store.doc(s.pending.doc); const made=[];
  list.forEach(i=>{ const p={id:store.id('pr'),name:i.name,unit:i.unit,price:i.price,article:'ARM-A500-12',group:'Металлопрокат',supplier:doc.counterparty,stock:i.qty,imported:true};
    s.products.push(p); made.push(p); const it=doc.items.find(x=>x.name===i.name); if(it) it.product=p.id;
    s.events.unshift({date:s.today,who:'Феликс',text:`Создан товар «${p.name}»`,object:p.id}); });
  s.pending.prod=s.pending.prod.filter(i=>!list.includes(i)); store.mark('prod'); store.save();
  notify(`Запущен ${made.length} экземпляр процесса «Стройматериалы»`);
  back(()=>MP.bot('<span>Последний цикл: создано экземпляров - '+made.length+', черновиков - 0.</span>',[...made.map(p=>({k:'card',t:p.name,d:'Стройматериалы — экземпляр запущен',a:'go:#/product/'+p.id})),{k:'btn',t:'Все процессы',a:'go:#/search?cat=processes'}]));
}
window.IMPORT={flow(v){ if(v==='cp') go('#/drafts/kontragenty'); else if(v==='prod') go('#/drafts/materials'); else if(v==='link') link(); }};
})();
