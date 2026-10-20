/* MagicPad: боковая панель Феликса. Меню команд «/», прикрепление демо-файла, скриптовый чат. */
(function(){
const {I,PDF,esc,money,norm,nowTime,store,notify,go} = BP;
const CMDS=[
  {k:'create',t:'Создать объект',d:'Контрагент, товар, документ'},
  {k:'find',t:'Найти данные',d:'Поиск по всем данным компании'},
  {k:'import',t:'Импорт из файла',d:'Распознать документ и создать объекты'},
  {k:'instance',t:'Создать экземпляр процесса',d:'Запустить процесс'},
  {k:'summary',t:'Сделать сводку',d:'По текущему разделу'},
  {k:'status',t:'Проверить статус',d:'Документа, сделки, задачи'}];
let el, full=false, attached=null, popKind=null, busy=false;
const isOpen=()=>el && !el.hidden;
const S=()=>store.s;

function mount(){ el=document.getElementById('mp'); if(localStorage.getItem('bp-mp')==='1') el.hidden=false; draw(); }
function open(){ if(!el.hidden) return; el.hidden=false; localStorage.setItem('bp-mp','1'); store.mark('mp-open'); draw(); sync(); setTimeout(()=>{const t=el.querySelector('textarea'); t&&t.focus();},50); }
function close(){ el.hidden=true; full=false; el.classList.remove('full'); localStorage.setItem('bp-mp','0'); sync(); }
function toggle(){ isOpen()?close():open(); }
function sync(){ document.querySelectorAll('[data-act="mp"]').forEach(b=>b.classList.toggle('on',isOpen())); APP.updateHint&&APP.updateHint(); }
function resetUi(){ attached=null; busy=false; draw(); }

function draw(){
  const chat=S().chat;
  el.innerHTML=`<div class="mp-h"><button class="ibtn out" id="mpx" title="Закрыть" style="border-color:var(--g300)">${I('close')}</button><span class="t">MagicPad</span><span style="margin-left:auto"></span>
    ${chat.length?`<button class="ibtn" id="mpnew" title="Новый диалог">${I('add')}</button>`:''}
    <button class="ibtn" id="mpfull" title="${full?'Свернуть':'Развернуть'}">${I(full?'collapse':'expand')}</button></div>
  <div class="mp-body" id="mpbody">${chat.length?chat.map(msgHtml).join(''):welcome()}</div>
  <div class="mp-in">${attached?`<div class="attached"><span class="file-chip">${PDF}${esc(attached.name)}</span><button class="ibtn s" id="mpdetach" title="Убрать файл">${I('close','ic16')}</button></div>`:''}
    <textarea id="mpt" placeholder="Напишите сообщение" aria-label="Сообщение Феликсу"></textarea>
    <div class="tools"><button class="ibtn" id="mpatt" title="Прикрепить файл">${I('add','ic16')}</button><button class="ibtn" title="Эмодзи">${I('emoji','ic16')}</button><button class="ibtn" id="mpslash" title="Команды">/</button>
      <button class="ibtn send ${attached?'ready':''}" id="mpsend" title="Отправить">${I('send','ic16')}</button></div></div>`;
  el.classList.toggle('full',full);
  const t=el.querySelector('#mpt');
  t.oninput=()=>{ el.querySelector('#mpsend').classList.toggle('ready',!!(t.value.trim()||attached)); if(t.value.startsWith('/')) showCmds(t.value.slice(1)); else if(popKind==='cmd') hidePop(); };
  t.onkeydown=e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); const m=el.querySelector('.mp-pop .mi.act')||(popKind&&el.querySelector('.mp-pop .mi')); if(m&&popKind){ m.dispatchEvent(new MouseEvent('mousedown',{bubbles:true})); return; } send(); } if(e.key==='Escape') hidePop(); };
  el.querySelector('#mpsend').onclick=send;
  el.querySelector('#mpx').onclick=close;
  el.querySelector('#mpfull').onclick=()=>{ full=!full; draw(); };
  el.querySelector('#mpatt').onclick=()=>showFiles();
  el.querySelector('#mpslash').onclick=()=>{ t.value='/'; t.focus(); showCmds(''); };
  const nw=el.querySelector('#mpnew'); nw&&(nw.onclick=()=>{ S().chat=[]; store.save(); attached=null; draw(); });
  const dt=el.querySelector('#mpdetach'); dt&&(dt.onclick=()=>{ attached=null; draw(); });
  el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>action(b.dataset.a, b));
  const body=el.querySelector('#mpbody'); body.scrollTop=body.scrollHeight;
}
function welcome(){
  return `<div class="mp-banner"><div class="tx"><b>Я Феликс. Знаю BusinessPad наизусть</b><span class="cap">Найду документ, открою нужный экран, соберу черновик договора</span></div><img src="assets/fox.png" alt=""></div>
  <div class="mp-sec">Расставьте приоритеты на сегодня</div>
  <button class="mp-act" data-a="say:Сделай сводку по компании">Сводка по компании</button>
  <button class="mp-act" data-a="say:Проверь статус документов">Что требует внимания</button>
  <button class="mp-act" data-a="say:Сделай сводку за день">Главное за день</button>
  <div class="mp-sec">Финансы и платежи</div>
  <button class="mp-act" data-a="say:Сделай сводку по платежам">Денежный поток</button>
  <button class="mp-act" data-a="say:Найди На согласовании">Платежи на согласование</button>
  <button class="mp-act" data-a="say:Найди Просрочен">Просроченная задолженность</button>`;
}
function msgHtml(m){
  if(m.who==='me') return `<div class="msg me"><div class="bub">${m.file?`<span class="file-chip">${PDF}${esc(m.file)}</span>`:''}${m.text?`<span>${esc(m.text)}</span>`:''}<span class="tm">${m.time}</span></div></div>`;
  return `<div class="msg"><div class="av" style="background-image:url(assets/felix.png)"></div><div class="bub"><span class="who">Феликс</span>${m.html}
   ${m.opts?`<div class="opts">${m.opts.map(o=>`<button class="opt ${m.used&&o.a.startsWith('proc:')?'dis':''}" data-a="${esc(o.a)}"><span class="r"><span>${esc(o.t)}</span>${o.r?`<span class="chip green">${esc(o.r)}</span>`:''}</span>${o.d?`<span class="cap">${esc(o.d)}</span>`:''}</button>`).join('')}</div>`:''}<span class="tm">${m.time}</span></div></div>`;
}
function push(m){ m.time=nowTime(); S().chat.push(m); store.save(); draw(); }
function bot(html,opts){ push({who:'bot',html,opts}); }
function typing(steps){ return new Promise(res=>{
  busy=true; const body=el.querySelector('#mpbody'); const box=document.createElement('div'); box.className='msg'; box.id='mptyping';
  box.innerHTML=`<div class="av" style="background-image:url(assets/felix.png)"></div><div class="bub"><span class="typing">Феликс думает <span class="dots"><i></i><i></i><i></i></span></span>${steps?`<div class="proc-steps">${steps.map(s=>`<div>${I('ok','ic16')}<span>${esc(s)}</span></div>`).join('')}</div>`:''}</div>`;
  body.appendChild(box); body.scrollTop=body.scrollHeight;
  const rows=[...box.querySelectorAll('.proc-steps div')]; let i=0;
  const tick=()=>{ rows.forEach((r,j)=>{ r.className=j<i?'done':j===i?'cur':''; const ic=r.firstElementChild; if(j===i) ic.outerHTML='<span class="spin"></span>'; }); 
    if(i>=rows.length){ setTimeout(()=>{ box.remove(); busy=false; res(); },300); return; } i++; setTimeout(tick,650); };
  tick();
});}

/* ---------- Поповеры над полем ввода ---------- */
function hidePop(){ const p=el.querySelector('.mp-pop'); p&&p.remove(); popKind=null; }
function pop(kind, html){ hidePop(); popKind=kind; const p=document.createElement('div'); p.className='popper mp-pop'; p.innerHTML=html; el.querySelector('.mp-in').appendChild(p);
  p.onmousedown=e=>{ e.preventDefault(); const m=e.target.closest('.mi'); if(m&&m.dataset.a){ hidePop(); action(m.dataset.a); } }; return p; }
function showCmds(f){
  const list=CMDS.filter(c=>norm(c.t).includes(norm(f)));
  if(!list.length) return hidePop();
  pop('cmd', `<div class="ph2">Команды</div>`+list.map((c,i)=>`<div class="mi ${i===0?'act':''}" data-a="cmd:${c.k}" style="flex-direction:column;align-items:flex-start;gap:2px"><span class="sub1">/ ${esc(c.t)}</span><span class="cap muted">${esc(c.d)}</span></div>`).join(''));
}
function showFiles(){
  pop('file', `<div class="ph2">Недавние файлы</div>`+S().demoFiles.map(f=>`<div class="mi" data-a="attach:${f.id}">${PDF}<span style="flex:1">${esc(f.name)}</span><span class="cap muted">${f.size}</span></div>`).join('')+
    `<div class="mi" style="color:var(--text-dis);cursor:default">${I('attach','ic16')}Загрузить с компьютера</div>`);
}

/* ---------- Действия ---------- */
function action(a){
  const [k,...rest]=a.split(':'); const v=rest.join(':');
  if(k==='go'){ go(v); if(full){ full=false; draw(); } }
  else if(k==='say'){ say(v); }
  else if(k==='attach'){ attached=S().demoFiles.find(f=>f.id===v); draw(); el.querySelector('#mpt').focus(); }
  else if(k==='cmd') command(v);
  else if(k==='proc') chooseProcess(v);
  else if(k==='newinst') { const p=store.proc(v); const id=store.id('in'); S().instances.unshift({id,name:`${p.name} #${String(Date.now()).slice(-4)}`,process:v,counterparty:null,stage:p.stages[0],status:'Новый',updated:S().today,amount:0,isNew:true}); store.save(); notify(`Экземпляр процесса «${esc(p.name)}» создан`); bot(`Создал экземпляр процесса «${esc(p.name)}» на этапе «${esc(p.stages[0])}».`,[{t:'Открыть экземпляр',a:'go:#/instance/'+id}]); }
}
function command(k){
  const t=el.querySelector('#mpt'); t.value='';
  if(k==='import'){ store.mark('slash'); showFiles(); }
  else if(k==='find'){ t.value='Найди '; t.focus(); }
  else if(k==='summary') say('Сделай сводку по платежам');
  else if(k==='status') say('Проверь статус документов');
  else if(k==='create') { push({who:'me',text:'/ Создать объект'}); bot('Какой объект создать? Документ удобнее всего создать из файла: я распознаю реквизиты и сам заведу контрагента и товары.',[{t:'Документ из файла',d:'Импорт с распознаванием',a:'cmd:import'},{t:'Контрагент',d:'Откроется справочник',a:'go:#/counterparties'},{t:'Товар',d:'Откроется справочник',a:'go:#/products'}]); }
  else if(k==='instance') { push({who:'me',text:'/ Создать экземпляр процесса'}); bot('Выберите процесс:',S().processes.slice(0,4).map(p=>({t:p.name,d:p.type,a:'newinst:'+p.id}))); }
}
async function send(){
  if(busy) return; const t=el.querySelector('#mpt'); const text=t.value.trim(); hidePop();
  if(text.startsWith('/')){ const c=CMDS.find(c=>norm(c.t).includes(norm(text.slice(1)))); if(c) return command(c.k); }
  if(!text && !attached) return;
  if(attached){ const f=attached; attached=null; push({who:'me',file:f.name,text}); store.mark('file'); await fileFlow(f); return; }
  say(text);
}
async function fileFlow(f){
  await typing(['Проверка безопасности файла','Извлечение текста и структуры','Сопоставление с процессами компании']);
  if(!f.readable){ bot(`<span>Не удалось распознать «${esc(f.name)}»: изображение слишком размытое, текст не читается. Загрузите скан лучшего качества (от 300 dpi) или PDF.</span>`,[{t:'Выбрать другой файл',a:'cmd:import'}]); return; }
  bot(`<span>Файл проверен, это <b>товарная накладная ТОРГ-12 № ТН-0842</b> от ООО «СтройМонолит». Подходящие процессы:</span>`,[
    {t:'Входящие документы',r:'100%',d:'Регистрация документа, товары и контрагенты из накладной',a:'proc:proc-in-docs:'+f.id},
    {t:'Приёмка товара',r:'100%',d:'Оприходование 3 позиций на склад объекта',a:'proc:proc-priemka:'+f.id},
    {t:'Стройматериалы',r:'100%',d:'Пополнение справочника материалов',a:'proc:proc-materials:'+f.id}]);
}
function chooseProcess(v){
  const [pid,fid]=v.split(':'); const p=store.proc(pid);
  const last=S().chat[S().chat.length-1]; S().chat.forEach(m=>{ if(m.opts&&m.opts.some(o=>o.a.startsWith('proc:'))) m.used=1; });
  push({who:'me',text:p.name});
  store.mark('proc');
  const id=store.id('imp'); S().drafts[id]={file:fid,process:pid,step:0}; store.save();
  bot(`Открываю мастер импорта в процесс «${esc(p.name)}». Проверьте поля, отмеченные значком внимания.`,[{t:'Вернуться к мастеру',a:'go:#/import/'+id}]);
  go('#/import/'+id);
}
async function say(text){
  if(!isOpen()) open();
  push({who:'me',text}); const n=norm(text);
  await typing();
  if(/^(найд|найт|поиск|покаж)/.test(n)){ const q=text.replace(/^\S+\s*/,''); const r=SEARCH.find(q).slice(0,5);
    SEARCH.remember(q);
    bot(r.length?`Нашёл ${SEARCH.find(q).length} по запросу «${esc(q)}». Самое релевантное:`:`По запросу «${esc(q)}» ничего не нашёл.`, [...r.map(e=>({t:e.title,d:SEARCH.CATNAME[e.cat]+' · '+e.sub,a:'go:'+e.href})),{t:'Открыть ИИ поиск',a:'go:#/search?q='+encodeURIComponent(q)}]); }
  else if(n.includes('сводк')){ const s=S().finops; const g={}; s.forEach(f=>{g[f.status]=(g[f.status]||0)+f.amount;});
    bot(`<span>Сводка по разделу «Платежи подрядчикам», всего ${s.length} операций на ${money(s.reduce((a,f)=>a+f.amount,0))}:</span><div class="col" style="gap:4px">${Object.entries(g).map(([k,v])=>`<span>${BP.chip(k)} ${money(v)}</span>`).join('')}</div><span>Больше всего денег ждёт согласования по ООО «СтройМонолит»: «Оплата кирпича М150», 262 000 ₽.</span>`,[{t:'Открыть платёж',a:'go:#/finop/fo-11'}]); }
  else if(n.includes('статус')){ const imp=S().documents.filter(d=>d.imported);
    bot(imp.length?`<span>Последний импортированный документ «${esc(imp[imp.length-1].name)}» в статусе <b>${esc(imp[imp.length-1].status)}</b>, этап «Регистрация». Следующий шаг: проверка бухгалтерией.</span>`:'<span>Сделка №1258 на этапе «Согласование КД», Сделка №1251 на «Подписании». Счёт № 1251 на согласовании.</span>',
      imp.length?[{t:'Открыть документ',a:'go:#/document/'+imp[imp.length-1].id}]:[{t:'Сделка №1258',a:'go:#/instance/in-deal-1258'}]); }
  else bot('<span>Могу найти данные, сделать сводку, проверить статус или импортировать документ из файла. Введите «/», чтобы увидеть команды.</span>',[{t:'Импорт из файла',a:'cmd:import'}]);
}
window.MP={attachSend:fid=>{ open(); attached=S().demoFiles.find(f=>f.id===fid); draw(); send(); },mount,open,close,toggle,isOpen,say,bot,slash:()=>{ const t=el.querySelector('#mpt'); t.value='/'; t.focus(); showCmds(''); },resetUi};
})();
