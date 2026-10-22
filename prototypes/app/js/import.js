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
    {k:'btn',t:'Проверить и создать',a:'flow:cp'},{k:'btn',t:'Все процессы',a:'go:#/drafts/pick'}]); },50);
}

/* ---------- v7: U6 Стройка контрагенты, U7 Стройматериалы, U8/U9 Приёмка товара (мат поток), оверлей выбора процесса ----------
   Макеты: import/BP CPQ+AI (8)…(11), missing/import/3512-528815, 3512-528882, 3357-362517, 3515-538647/539068. */
const S=()=>store.s;
function imp(){ const s=S(); if(!s.imp){ const r=R(), np=r.parties.find(p=>!p.match);
  s.imp={cp:{name:np.name,description:'Контрагент ООО «ИнвестСтрой» из файла «Товарная накладная № ТН-0842».',inn:np.inn,kpp:np.kpp,address:np.address,contact:'',st:'Черновик',id:null},
   prod:r.items.filter(i=>!i.match).map(i=>({n:i.n,name:i.name,unit:i.unit,price:i.price,qty:i.qty,description:`Товар «${i.name}» из файла «Товарная накладная № ТН-0842».`,article:'',maker:'',st:'Черновик',id:null})),
   mf:null}; store.save(); } return s.imp; }
const cpOk=()=>{ const c=imp().cp; return !!c.id; };
const prodOk=it=>it.match||(imp().prod.find(p=>p.n===it.n)||{}).id;
function mfRows(){ const m=imp(); if(m.mf) return m.mf; if(!m.pre){ m.pre=R().items.map(it=>({n:it.n,name:`Приёмка товара ТН-0842 - ${it.name}`})); store.save(); }
  m.pre.forEach(r=>r.st=cpOk()&&prodOk(ITEM(r.n))?'Экземпляр':'Черновик'); return m.pre; }
const ITEM=n=>R().items.find(i=>i.n===n);
const mfArt=r=>{ const it=ITEM(r.n), pr=imp().prod.find(p=>p.n===r.n); return r.article!=null?r.article:((pr&&pr.article)||''); };
const TBL={
 kontragenty:{proc:'proc-kontragenty',chip:'Контрагенты',list:'Список контрагентов',srch:'Поиск по контрагентам',what:'контрагента',
   rows:()=>{ const c=imp().cp; return c.id&&c.st==='Запущен'?[]:[c]; }, done:()=>imp().cp.id?[imp().cp]:[],
   cols:['Название','Описание','Статус','ИНН','КПП','Адрес','Контактное лицо'],
   cells:c=>[`<a>${esc(c.name)}</a>`,esc(c.description),chip(c.st),c.inn,c.kpp,'В процессе',c.contact?esc(c.contact):'<span class="cap muted">Не заполнено</span>'],
   form:[['name','Название',1],['description','Описание',1,1],['inn','ИНН',1],['kpp','КПП',1],['address','Адрес',1],['contact','Контактное лицо',1]]},
 materials:{proc:'proc-materials',chip:'Товары',list:'Список товаров',srch:'Поиск по товарам',what:'товара',
   rows:()=>imp().prod.filter(p=>!p.id), done:()=>imp().prod.filter(p=>p.id),
   cols:['Название','Описание','Статус','Единица измерения','Артикул','Производитель'],
   cells:p=>[`<a>${esc(p.name)}</a>`,esc(p.description),chip(p.st),p.unit,p.article||'<span class="cap muted">Не заполнено</span>',p.maker?esc(p.maker):'-'],
   form:[['name','Название',1],['description','Описание',1,1],['unit','Единица измерения',1],['article','Артикул',1],['maker','Производитель',1]]},
 priemka:{proc:'proc-priemka',chip:'Материальный поток',list:'Список экземпляров',srch:'Поиск по экземплярам',what:'экземпляра',
   rows:()=>mfRows().filter(r=>r.st!=='Запущен'), done:()=>mfRows().filter(r=>r.st==='Запущен'),
   cols:['Название','Описание','Статус','Номер документа','Номер договора поставки','Дата документа','Артикул','Цена','Стоимость','Поставщик','Плательщик','Товар'],
   cells:r=>{ const it=ITEM(r.n); const pr=prodOk(it); return [`<a>${esc(r.name)}</a>`,'Материальный поток по ТН-0842',chip(r.st),'ТН-0842','118-П','10.07.2026',esc(mfArt(r))||'-',String(it.price),String(it.sum),'<a href="#/counterparty/cp-stroymonolit">ООО «СтройМонолит»</a>',
     cpOk()?`<a href="#/counterparty/${imp().cp.id}">${esc(imp().cp.name)}</a>`:'<span class="cap muted">Требуется экземпляр процесса</span>',
     pr?`<a href="#/product/${pr}">${esc(it.name)}</a>`:'<span class="cap muted">Требуется экземпляр процесса</span>']; },
   form:[['name','Наименование экземпляра',1],['description','Описание экземпляра',0,1],['doc','Номер документа',1],['date','Дата документа',1],['article','Артикул',0],['contract','Номер договора поставки',1],['item','Товар',1],['qty','Количество',1],['price','Цена',1],['supplier','Поставщик',1],['buyer','Покупатель',1]]}};
route(/^\/drafts\/(kontragenty|materials|priemka)$/, ([k],q)=>{
  const c=TBL[k], p=store.proc(c.proc); const tab=q.tab||'all'; const sel=new Set();
  APP.setCrumbs([['Финансы','#/payments'],['Платежи подрядчикам','#/payments'],['Предпросмотр документа']], true);
  if(MP.isOpen()) MP.close();
  const render=()=>{ const dr=c.rows(), dn=c.done(); const all=[...dr,...dn]; const ready=dr.filter(r=>r.st==='Экземпляр');
   const rows=tab==='dr'?dr.filter(r=>r.st==='Черновик'):tab==='in'?all.filter(r=>r.st!=='Черновик'):all;
   const canSel=r=>dr.includes(r)&&(k==='priemka'?true:r.st==='Экземпляр');
   shell(head(p.name,`<span class="chip neutral">${c.chip}</span>`),
   `<div class="paper col" style="flex:1;min-width:0"><div class="tabs">${[['all','Все',all.length],['dr','Черновики',dr.filter(r=>r.st==='Черновик').length],['in','Экземпляры',all.length-dr.filter(r=>r.st==='Черновик').length]].map(([v,t,n])=>`<button data-dt="${v}" class="${v===tab?'on':''}">${t} <span class="counter">${n}</span></button>`).join('')}</div>
    <div class="row" style="align-items:center;gap:12px"><h2 class="h3">${c.list}</h2><span class="counter">${rows.length}</span><div class="search" style="margin-left:auto;width:188px">${I('search')}<input class="inp" id="dq" placeholder="${c.srch}"></div></div>
    <div class="tblwrap" style="overflow-x:auto"><table class="uni"><thead><tr><th class="cb"><input type="checkbox" class="chk" id="dall"></th>${c.cols.map(t=>`<th>${t}</th>`).join('')}<th class="act"></th></tr></thead>
    <tbody>${rows.length?rows.map(r=>{ const i=all.indexOf(r); return `<tr data-row="${i}"><td class="cb"><input type="checkbox" class="chk" data-i="${i}" ${canSel(r)?'':'disabled'} ${sel.has(i)?'checked':''}></td>${c.cells(r).map(x=>`<td>${x}</td>`).join('')}<td class="act"><button class="ibtn s" data-m="${i}" title="Ещё">${I('more','ic16')}</button></td></tr>`; }).join(''):`<tr><td colspan="${c.cols.length+2}" class="empty"><b>${tab==='dr'?'Черновиков нет':'Нет объектов'}</b></td></tr>`}</tbody></table></div></div>`,
   `<span style="flex:1"></span><span class="muted">Выбрано:</span><span class="counter">${sel.size}</span><button class="btn" id="dcreate" ${sel.size?'':'disabled'}>Создать</button><button class="btn out" id="wzcancel">Отменить</button>`);
   const ov=wz();
   ov.querySelectorAll('[data-dt]').forEach(b=>b.onclick=()=>go(`#/drafts/${k}?tab=${b.dataset.dt}`));
   ov.querySelectorAll('[data-i]').forEach(x=>x.onchange=()=>{ x.checked?sel.add(+x.dataset.i):sel.delete(+x.dataset.i); render(); });
   const a=ov.querySelector('#dall'); const selectable=rows.filter(canSel).map(r=>all.indexOf(r)); a.disabled=!selectable.length; a.checked=selectable.length&&selectable.every(i=>sel.has(i)); a.onchange=()=>{ selectable.forEach(i=>a.checked?sel.add(i):sel.delete(i)); render(); };
   const dq=ov.querySelector('#dq'); dq.oninput=()=>ov.querySelectorAll('tbody tr[data-row]').forEach(tr=>tr.hidden=!norm(tr.textContent).includes(norm(dq.value)));
   ov.querySelectorAll('tbody tr[data-row]').forEach(tr=>{ const r=all[+tr.dataset.row]; tr.querySelector('td:nth-child(2) a').onclick=e=>{ e.preventDefault(); k==='priemka'&&dr.includes(r)?go('#/drafts/priemka/edit/'+r.n):edit(k,r,render); }; });
   ov.querySelectorAll('[data-m]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const r=all[+b.dataset.m]; APP.popMenu(b, dr.includes(r)?[['edit','Редактировать',()=>edit(k,r,render)]]:[['doc','Открыть',()=>go(r.id?(k==='kontragenty'?'#/counterparty/':'#/product/')+r.id:'#/process/'+c.proc)]]); });
   ov.querySelector('#wzx').onclick=ov.querySelector('#wzcancel').onclick=()=>go('#/payments');
   ov.querySelector('#dcreate').onclick=()=>{ const list=[...sel].map(i=>all[i]); k==='kontragenty'?createCp():k==='materials'?createProd(list):createMf(list); };
  }; render();
});
/* Side page «Редактировать» (3512-528815 → 3512-528882; 3357-362517) */
function edit(k,r,rerender){ const c=TBL[k];
  const MF=()=>{ const it=ITEM(r.n), pr=imp().prod.find(p=>p.n===r.n); return {name:r.name,description:`Материальный поток по товару «${it.name}» из файла «Товарная накладная № ТН-0842»`,doc:'ТН-0842',date:'10.07.2026',article:mfArt(r),contract:'118-П',item:prodOk(it)?it.name:'',qty:String(it.qty),price:String(it.price),supplier:'ООО «СтройМонолит»',buyer:cpOk()?imp().cp.name:''}; };
  const val=f=>k==='priemka'?MF()[f]:(r[f]||'');
  const it=k==='priemka'&&ITEM(r.n);
  const conf=f=>{ if(k!=='priemka') return val(f)?(f==='contact'||f==='article'||f==='maker'?100:99):0;
    if(f==='article') return mfArt(r)?100:0; if(f==='item') return prodOk(it)?100:0; if(f==='buyer') return cpOk()?100:0; return ['qty','price','supplier'].includes(f)?100:99; };
  const SEL={item:()=>[it.name],supplier:()=>['ООО «СтройМонолит»'],buyer:()=>[imp().cp.name]};
  const ctl=(f,l,ta)=>k==='priemka'&&SEL[f]?`<select class="inp" data-ef="${f}">${SEL[f]().map(o=>`<option ${f==='item'||f==='supplier'||cpOk()||1?'selected':''}>${esc(o)}</option>`).join('')}</select>`
    :ta?`<textarea class="ta" data-ef="${f}">${esc(val(f))}</textarea>`:`<input class="inp" data-ef="${f}" placeholder="Введите ${l.toLowerCase()}" value="${esc(val(f))}">`;
  const body=`<h2 class="h3">Основная информация</h2>${c.form.map(([f,l,req,ta])=>`<div class="fld rfi" style="grid-template-columns:1fr 36px"><label>${l}${req?' <span style="color:var(--error)">*</span>':''}</label>${ctl(f,l,ta)}${ring(conf(f))}</div>`).join('')}`;
  const sp=KB.sideForm('Редактировать',body,'Сохранить',sp=>{ const v={}; sp.querySelectorAll('[data-ef]').forEach(x=>v[x.dataset.ef]=x.value.trim());
    const miss=c.form.find(([f,,req])=>req&&!v[f]); if(miss){ notify(`Заполните поле «${miss[1]}»`,'warning'); return false; }
    if(k==='priemka'){ r.name=v.name; r.article=v.article; } else { Object.assign(r,v); r.st='Экземпляр'; }
    store.save(); notify(k==='kontragenty'?`Данные для контрагента ${r.name} обновлены`:k==='materials'?`Данные для товара «${r.name}» обновлены`:`Данные экземпляра «${r.name}» обновлены`); rerender(); });
  sp.querySelectorAll('[data-ef]').forEach(x=>x.addEventListener('input',()=>{ const g=x.parentElement.querySelector('.ring'); if(g&&x.value.trim()&&/>0%</.test(g.outerHTML)) g.outerHTML=ring(100); }));
  const ok=sp.querySelector('#spok'); const chk=()=>{ ok.disabled=c.form.some(([f,,req])=>req&&!sp.querySelector(`[data-ef="${f}"]`).value.trim()); }; sp.querySelectorAll('[data-ef]').forEach(x=>x.oninput=chk); chk();
}
/* U9 «Распознанные поля - Требуют правки»: полноэкранное редактирование черновика мат потока по документу */
route(/^\/drafts\/priemka\/edit\/(\d+)$/, ([n])=>{ const r=mfRows().find(x=>x.n===+n); if(!r){ go('#/drafts/priemka'); return; }
  if(MP.isOpen()) MP.close(); APP.setCrumbs([['Финансы','#/payments'],['Платежи подрядчикам','#/payments'],['Предпросмотр документа']], true);
  const it=ITEM(r.n); const st={tab:'att',q:''};
  const F=[['name','Наименование экземпляра',1,r.name,99,'',100],['description','Описание экземпляра',0,`Приёмка ${it.name} по накладной ТН-0842, количество ${it.qty}, цена ${it.price}`,99,'',250],
    ['doc','Номер документа',1,'ТН-0842',99,'страница 1 строка №'],['date','Дата документа',1,'10.07.2026',99,'страница 1 строка №'],['contract','Номер договора поставки',1,'118-П',99,'страница 1 строка «Основание»'],
    ['qty','Количество',1,String(it.qty),100,`страница 1 таблица и строка ${it.n} колонка 4`],['price','Цена',1,String(it.price),100,`страница 1 таблица и строка ${it.n} колонка 5`],['supplier','Поставщик',1,'ООО «СтройМонолит»',100,'страница 1 строка «Поставщик»'],
    ['article','Артикул',0,mfArt(r),mfArt(r)?100:0,mfArt(r)?'исправлено вручную':'отсутствует'],['item','Товар',1,it.name,prodOk(it)?100:0,`страница 1 таблица товаров строка ${it.n} колонка «Товар»`],['buyer','Плательщик',1,imp().cp.name,cpOk()?100:0,'страница 1 строка «Плательщик»']]
    .map(([key,label,req,value,conf,src,max])=>({key,label,req,value,conf,src,max}));
  const draw=()=>{ const att=F.filter(f=>f.conf<70), ok=F.filter(f=>f.conf>=70), q=norm(st.q); const list=(st.tab==='ok'?ok:att).filter(f=>!q||norm(f.label+' '+f.value).includes(q));
    shell(head(`Редактировать «${r.name}»`), `<div class="row" style="flex:1;min-height:0;align-items:stretch"><div class="docview" id="docview">${torg()}</div>
     <div class="rf"><div class="row" style="align-items:center;gap:8px"><h2 class="h3">Распознанные поля</h2><span class="dotinfo"></span></div>
     <div class="tabs soft"><button data-tab="att" class="${st.tab!=='ok'?'on':''}">Требуют внимания <span class="counter">${att.length}</span></button><button data-tab="ok" class="${st.tab==='ok'?'on':''}">Распознано <span class="counter">${ok.length}</span></button></div>
     <div class="search">${I('search')}<input class="inp" id="fq" placeholder="Введите поисковый запрос..." value="${esc(st.q)}"></div>
     <div class="row" style="align-items:center;gap:8px"><span class="h4">Поля</span><button class="plus" id="addf" title="Добавить поле" style="width:24px;height:24px">${I('add','ic16')}</button><span class="cap muted" style="margin-left:auto">Уверенность ${st.tab==='ok'?'выше':'ниже'} 70%</span></div>
     <div class="rf-list">${list.map(f=>`<div class="rfi" data-k="${f.key}"><label>${esc(f.label)}${f.req?' <span style="color:var(--error)">*</span>':''}</label><input class="inp" data-v="${f.key}" placeholder="Введите ${f.label.toLowerCase()}" value="${esc(f.value)}" aria-label="${esc(f.label)}">${ring(f.conf)}<span class="src">${f.max?f.value.length+'/'+f.max:'Источник: '+esc(f.src)}</span></div>`).join('')||'<span class="cap muted">Нет полей</span>'}</div></div></div>`,
     `<span style="flex:1"></span><button class="btn" id="mfsave">Сохранить</button><button class="btn out" id="wzcancel">Отменить</button>`);
    const ov=wz();
    ov.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ st.tab=b.dataset.tab; draw(); });
    ov.querySelector('#fq').oninput=e=>{ st.q=e.target.value; const pos=e.target.selectionStart; draw(); const n2=wz().querySelector('#fq'); n2.focus(); n2.setSelectionRange(pos,pos); };
    ov.querySelector('#addf').onclick=()=>notify('Новое поле добавляется из карточки процесса «Приёмка товара»','info');
    ov.querySelectorAll('[data-v]').forEach(x=>{ const f=F.find(y=>y.key===x.dataset.v); x.oninput=()=>{ f.value=x.value; };
      x.onfocus=()=>{ ov.querySelectorAll('.rfi').forEach(e=>e.classList.toggle('on',e.dataset.k===f.key)); };
      x.onchange=()=>{ if(f.conf<70&&f.value.trim()){ f.conf=100; f.src='исправлено вручную'; draw(); } }; });
    ov.querySelector('#wzx').onclick=ov.querySelector('#wzcancel').onclick=()=>go('#/drafts/priemka?tab=dr');
    ov.querySelector('#mfsave').onclick=()=>{ const v=Object.fromEntries(F.map(f=>[f.key,f.value.trim()])); const miss=F.find(f=>f.req&&!v[f.key]&&f.key!=='item'&&f.key!=='buyer'); if(miss){ notify(`Заполните поле «${miss.label}»`,'warning'); return; }
      r.name=v.name||r.name; r.article=v.article; store.save(); notify(`Данные экземпляра «${r.name}» обновлены`); go('#/drafts/priemka?tab=dr'); };
  }; draw(); });
function back(fn){ wz().innerHTML=''; go('#/payments'); setTimeout(()=>{ MP.open(); fn(); },50); }
const PROCS={k:'btn',t:'Все процессы',a:'go:#/drafts/pick'};
function nextOpts(){ const m=imp(), o=[];
  const drafts=(m.mf||[]).filter(r=>r.st==='Черновик'); const ready=drafts.filter(r=>cpOk()&&prodOk(ITEM(r.n)));
  if(ready.length) o.push({k:'launch',t:`Можно запустить ${ready.length===1?'1 готовый черновик':ready.length+' черновика'}`,d:'Связи с созданными экземплярами будут внесены после подтверждения. Незавершённые черновики останутся без изменений.',b:'Связать и запустить',a:'flow:mflink'});
  else if(S().pending&&S().pending.doc&&cpOk()&&!store.doc(S().pending.doc).consignee) o.push({k:'launch',t:'Можно запустить готовые черновики',d:'Связи с созданными экземплярами будут внесены после подтверждения. Незавершённые черновики останутся без изменений.',b:'Связать и запустить 1 экземпляр',a:'flow:link'});
  if(!cpOk()&&(drafts.length||S().pending)) o.push({k:'text',t:'Для запуска нужен контрагент'},{k:'btn',t:'Проверить и создать',a:'flow:cp'});
  else if(m.prod.some(p=>!p.id)&&(drafts.length>ready.length||!m.mf)) o.push({k:'text',t:'Для запуска оставшихся черновиков требуется создать экземпляр процесса «Стройматериалы»'},{k:'btn',t:'Создать товар',a:'flow:prod'});
  else if(!m.mf) o.push({k:'text',t:'Можно продолжить создание с этим файлом'},{t:'Приёмка товара',r:'100%',d:'Тип: Материальный поток',a:'flow:mf'},{t:'Перемещение материалов',r:'82%',d:'Тип: Материальный поток',a:'go:#/drafts/pick'});
  else if(!drafts.length) o.push({k:'text',t:'Можно продолжить создание с этим файлом'},{t:'Входящие документы',r:'100%',d:'Тип: Документ',a:'go:#/process/proc-in-docs'},{t:'Документы с обязательными участниками',r:'82%',d:'Тип: Документ',a:'go:#/drafts/pick'});
  o.push(PROCS); return o; }
const cyc=(i,d)=>`<span>Последний цикл: создано экземпляров - ${i}, черновиков - ${d}.</span>`;
function createCp(){
  const s=S(), c=imp().cp; const doc=s.pending&&store.doc(s.pending.doc);
  const cp={id:store.id('cp'),name:c.name,inn:c.inn,kpp:c.kpp,address:c.address,contact:c.contact,role:'Покупатель',status:'Действующий',manager:s.company.user,since:s.today,imported:true,source:doc?doc.id:null};
  s.counterparties.push(cp); c.id=cp.id; c.st='Запущен'; if(s.pending){ s.pending.cp=null; s.pending.cpId=cp.id; }
  s.instances.unshift({id:store.id('in'),name:'Проверка контрагента '+cp.name,process:'proc-kontragenty',counterparty:cp.id,stage:'Действующий',status:'В работе',updated:s.today,amount:0});
  s.events.unshift({date:s.today,who:'Феликс',text:`Создан контрагент ${cp.name} из накладной ТН-0842`,counterparty:cp.id});
  store.mark('cp'); store.save(); notify('Запущен 1 экземпляр процесса «Стройка контрагенты»');
  back(()=>MP.bot(cyc(1,0),[{k:'card',t:cp.name,d:'Стройка контрагенты - экземпляр запущен',a:'go:#/counterparty/'+cp.id},...nextOpts()]));
}
function link(){
  const s=S(), doc=store.doc(s.pending.doc); doc.consignee=s.pending.cpId||imp().cp.id; doc.status='Сохранён';
  s.events.unshift({date:s.today,who:'Феликс',text:`Экземпляр «${doc.name}» связан и запущен`,counterparty:doc.consignee,object:doc.id}); store.save();
  notify(`Запущен 1 экземпляр процесса «${esc(store.proc(doc.process).name)}»`);
  MP.bot(cyc(1,0),[{k:'card',t:doc.name,d:`${store.proc(doc.process).name} - экземпляр запущен`,a:'go:#/document/'+doc.id},...nextOpts()]);
}
function createProd(list){
  const s=S(); const made=[];
  list.forEach(i=>{ const p={id:store.id('pr'),name:i.name,unit:i.unit,price:i.price,article:i.article,maker:i.maker,group:'Металлопрокат',supplier:'cp-stroymonolit',stock:i.qty,imported:true};
    s.products.push(p); made.push(p); i.id=p.id; i.st='Запущен';
    const doc=s.pending&&store.doc(s.pending.doc); const it=doc&&doc.items.find(x=>x.name===i.name); if(it) it.product=p.id;
    s.events.unshift({date:s.today,who:'Феликс',text:`Создан товар «${p.name}»`,object:p.id}); });
  if(s.pending) s.pending.prod=(s.pending.prod||[]).filter(i=>!list.some(l=>l.name===i.name)); store.mark('prod'); store.save();
  notify(`Запущен ${made.length} экземпляр${made.length>1?'а':''} процесса «Стройматериалы»`);
  back(()=>MP.bot(cyc(made.length,0),[...made.map(p=>({k:'card',t:p.name,d:'Стройматериалы - экземпляр запущен',a:'go:#/product/'+p.id})),...nextOpts()]));
}
function launchMf(rows){ const s=S(); rows.forEach(r=>{ const it=ITEM(r.n); const id=store.id('in'); r.st='Запущен'; r.id=id;
  s.instances.unshift({id,name:r.name,process:'proc-priemka',counterparty:'cp-stroymonolit',stage:'Ожидает поставки',status:'В работе',updated:s.today,amount:it.sum}); }); }
function createMf(list){
  const s=S(), m=imp(); m.mf=m.mf||mfRows().map(r=>Object.assign({},r)); const pick=m.mf.filter(r=>list.some(l=>l.n===r.n));
  const ready=pick.filter(r=>r.st==='Экземпляр'), dr=pick.filter(r=>r.st!=='Экземпляр'); launchMf(ready); store.mark('mf'); store.save();
  notify(dr.length?'Созданы черновики экземпляров процесса «Приёмка товара»':`Создано ${ready.length} экземпляра процесса «Приёмка товара»`);
  back(()=>MP.bot(cyc(ready.length,dr.length),[...pick.map(r=>({k:'card',t:r.name,d:`Приёмка товара - ${r.st==='Запущен'?'экземпляр запущен':'черновик сохранён'}`,a:r.id?'go:#/instance/'+r.id:'go:#/drafts/priemka?tab=dr'})),...nextOpts()]));
}
function mfLink(){ const m=imp(); const ready=(m.mf||[]).filter(r=>r.st==='Черновик'&&cpOk()&&prodOk(ITEM(r.n))); launchMf(ready); store.save();
  const left=m.mf.filter(r=>r.st==='Черновик').length; notify(`Запущен${ready.length>1?'о':''} ${ready.length} экземпляр${ready.length>1?'а':''} процесса «Приёмка товара»`);
  MP.bot(cyc(ready.length,0),[...ready.map(r=>({k:'card',t:r.name,d:'Приёмка товара - экземпляр запущен',a:'go:#/instance/'+r.id})),...nextOpts()]); }
/* Оверлей «Выбрать бизнес-процесс» (3515-538647 → 3515-539068) */
route(/^\/drafts\/pick$/, (_,q)=>{ if(MP.isOpen()) MP.close(); APP.setCrumbs([['Финансы','#/payments'],['Платежи подрядчикам','#/payments']], true); let cur=null;
  const L=S().processes; const pct={'proc-in-docs':100,'proc-priemka':100,'proc-kontragenty':100,'proc-materials':100,'proc-payments':80};
  const render=()=>{ shell(head('Выбрать бизнес-процесс',`<span class="chip neutral">Рабочая среда</span>`),
   `<div class="paper col" style="flex:1"><div class="row" style="align-items:center;gap:12px"><h2 class="h3">Список бизнес-процессов</h2><span class="cap muted">${L.length} из ${L.length}</span><div class="search" style="margin-left:auto;width:188px">${I('search')}<input class="inp" id="pq" placeholder="Поиск по процессам"></div></div>
   <div class="tblwrap"><table class="uni"><thead><tr><th class="cb"></th><th>№</th><th>Название</th><th>Описание</th><th>Тип</th><th>Экземпляры</th><th>Данные для запуска</th><th class="act"></th></tr></thead><tbody>${L.map((p,i)=>`<tr data-p="${p.id}"><td class="cb"><input type="radio" name="pp" ${cur===p.id?'checked':''}></td><td>${i+1}</td><td><a>${esc(p.name)}</a></td><td>${esc((p.description||'').slice(0,40))}…</td><td>${esc(p.type)}</td><td>${S().instances.filter(x=>x.process===p.id).length}</td><td>${pct[p.id]||60}%</td><td class="act"><button class="ibtn s" data-pm="${p.id}" title="Ещё">${I('more','ic16')}</button></td></tr>`).join('')}</tbody></table></div></div>`,
   `<span style="flex:1"></span><button class="btn" id="ppick" ${cur?'':'disabled'}>Выбрать</button><button class="btn out" id="wzcancel">Отменить</button>`);
   const ov=wz(); ov.querySelectorAll('tr[data-p]').forEach(tr=>tr.onclick=()=>{ cur=tr.dataset.p; render(); });
   ov.querySelectorAll('[data-pm]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); APP.popMenu(b,[['doc','Открыть процесс',()=>go('#/process/'+b.dataset.pm)]]); });
   const pq=ov.querySelector('#pq'); pq.oninput=()=>ov.querySelectorAll('tr[data-p]').forEach(tr=>tr.hidden=!norm(tr.textContent).includes(norm(pq.value)));
   ov.querySelector('#wzx').onclick=ov.querySelector('#wzcancel').onclick=()=>go('#/payments');
   ov.querySelector('#ppick').onclick=()=>{ const t={'proc-priemka':'#/drafts/priemka','proc-kontragenty':'#/drafts/kontragenty','proc-materials':'#/drafts/materials'}[cur];
     if(t) return go(t); const id=store.id('imp'); S().drafts[id]={file:q.file||'file-tn-0842',process:cur,step:0}; store.save(); go('#/import/'+id); };
  }; render(); });
window.IMPORT={flow(v){ if(v==='cp') go('#/drafts/kontragenty'); else if(v==='prod') go('#/drafts/materials'); else if(v==='mf') go('#/drafts/priemka'); else if(v==='link') link(); else if(v==='mflink') mfLink(); }};
})();
