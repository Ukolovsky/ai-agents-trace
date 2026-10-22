/* MagicPad: боковая панель Феликса. Меню команд «/», прикрепление демо-файла, скриптовый чат. */
(function(){
const {I,PDF,esc,money,norm,nowTime,store,notify,go} = BP;
const CMDS=[
  {k:'create',t:'Создать объект',d:'Контрагент, товар, документ'},
  {k:'find',t:'Найти данные',d:'Поиск по всем данным компании'},
  {k:'import',t:'Импорт из файла',d:'Распознать документ и создать объекты'},
  {k:'data',t:'Импорт данных',d:'База данных, приложение, ERP-система'},
  {k:'instance',t:'Создать экземпляр процесса',d:'Запустить процесс'},
  {k:'summary',t:'Сделать сводку',d:'По текущему разделу'},
  {k:'status',t:'Проверить статус',d:'Документа, сделки, задачи'}];
let el, bk, tab='co', htab='mp', reply=null, full=false, attached=null, popKind=null, busy=false;
const isOpen=()=>el && !el.hidden;
const S=()=>store.s;

function mount(){ el=document.getElementById('mp'); document.body.appendChild(el); bk=document.createElement('div'); bk.id='mpback'; bk.hidden=true; bk.onclick=()=>close(); document.body.appendChild(bk); if(localStorage.getItem('bp-mp')==='1'){ el.hidden=false; bk.hidden=false; document.body.classList.add('mp-open'); } draw(); }
function open(){ if(!el.hidden) return; el.hidden=false; bk.hidden=false; localStorage.setItem('bp-mp','1'); store.mark('mp-open'); draw(); sync(); setTimeout(()=>{const t=el.querySelector('textarea'); t&&t.focus();},50); }
function close(){ el.hidden=true; bk.hidden=true; full=false; el.classList.remove('full'); localStorage.setItem('bp-mp','0'); sync(); }
function toggle(){ isOpen()?close():open(); }
function sync(){ document.body.classList.toggle('mp-open',isOpen()); document.querySelectorAll('[data-act="mp"]').forEach(b=>b.classList.toggle('on',isOpen())); APP.updateHint&&APP.updateHint(); }
function resetUi(){ attached=null; busy=false; draw(); }

let view=null, mi=1, histOn=true, histQ='';
const MASC=[['Феничка','Мягкий и заботливый','assets/fox.png',''],['Феликс','Деловой и точный','assets/felix.png',''],['Тей','Быстрый и смелый','assets/felix.png','hue-rotate(140deg)']];
const HIST=['Оптимизация логистики №ERP-276','Управление персоналом №ERP-987','Мониторинг поставок №ERP-623','Интеграция CRM с ERP №ERP-412','Планирование производства №ERP-155','Контроль качества продукции №ERP-704','Автоматизация отчетности №ERP-298','Аналитика продаж №ERP-531','Управление закупками №ERP-461','Анализ финансовых потоков №ERP-839'];
function mascHtml(){ return `<div class="mpmasc"><h2 class="h2">Выберите маскота и голос</h2><div class="mrow"><button class="ibtn s" id="mmprev" title="Предыдущий">‹</button>${MASC.map((m,i)=>`<div class="mc ${i===mi?'on':''}" data-mc="${i}"><div class="av" style="background-image:url(${m[2]});filter:${m[3]}"></div><b>${m[0]}</b><span class="cap muted">${m[1]}</span></div>`).join('')}<button class="ibtn s" id="mmnext" title="Следующий">›</button></div><button class="btn orange" id="mmok">Подтвердить выбор</button><button class="btn out" id="mmno">Отменить</button></div>`; }
function voiceHtml(){ const m=MASC[S().mascot!=null?S().mascot:1]; return `<div class="mpvoice"><div class="av" style="background-image:url(${m[2]});filter:${m[3]}"></div><span class="cap muted">Настройте микрофон в настройках <button class="ibtn s" id="mvinfo" title="Подробнее">${I('info','ic16')}</button></span><div class="row" style="gap:16px"><button class="ibtn round" id="mvmic" title="Включить микрофон">${I('mic')}</button><button class="ibtn round" id="mvx" title="Закрыть">${I('close')}</button></div></div>`; }
function histHtml(){ const q=norm(histQ); return `<div class="mphist ${histOn?'':'off'}"><div class="row" style="gap:6px"><div class="search" style="flex:1">${I('search','ic16')}<input class="inp" id="mphq" placeholder="Поиск по чатам" value="${esc(histQ)}"></div><button class="ibtn s" id="mphtog" title="${histOn?'Скрыть список':'Показать список'}">${I('table','ic16')}</button></div>${histOn?HIST.filter(h=>!q||norm(h).includes(q)).map((h,i)=>`<button class="hi ${i===0&&!q?'on':''}" data-hist="${esc(h)}"><span>${esc(h)}</span><span class="cap muted">12:30</span></button>`).join(''):''}</div>`; }
function draw(){
  const chat=S().chat;
  const fh=full&&!chat.length&&!(onPay()&&tab==='co');
  el.innerHTML=`<button class="xbtn" id="mpx" title="Закрыть">${I('close','ic16')}</button><div class="mp-h"><span class="t">MagicPad</span><span style="margin-left:auto"></span>
    <button class="ibtn" id="mpmasc" title="Маскот и голос">${I('person','ic16')}</button>${chat.length||full?`<button class="ibtn ${full?'orange-plus':''}" id="mpnew" title="Новый диалог">${I('add')}</button>`:''}
    ${fh?`<button class="ibtn" id="mpfull" title="Свернуть">${I('more')}</button>`:`<button class="ibtn" id="mpfull" title="${full?'Свернуть':'Развернуть'}">${I(full?'collapse':'expand')}</button>`}</div>
  ${onPay()&&!fh?`<div class="mptabs"><button class="${tab==='co'?'on':''}" data-mtab="co">Копилот</button><button class="${tab==='mp'?'on':''}" data-mtab="mp">MagicPad</button></div>`:''}
  ${full?histHtml():''}<div class="mp-body" id="mpbody">${view==='masc'?mascHtml():view==='voice'?voiceHtml():chat.length?chat.map((m,i)=>msgHtml(m,i)).join(''):full&&!(onPay()&&tab==='co')?hero():onPay()&&tab==='co'?copilot():welcome()}</div>
  <div class="mp-in">${reply?`<div class="mp-reply" id="mpreply"><span><b>Феликс</b><span class="cap">${esc(reply)}</span></span><button class="ibtn s" id="mpunreply" title="Отменить ответ">${I('close','ic16')}</button></div>`:''}${attached?`<div class="attached"><div class="fcard"><b>${esc(attached.name)}</b><span class="cap muted">${attached.rows?attached.rows+' строк':attached.size}</span><span class="ext">${esc((attached.kind||'').toUpperCase())}</span></div><button class="ibtn s" id="mpdetach" title="Убрать файл">${I('close','ic16')}</button></div>`:''}
    <textarea id="mpt" placeholder="Спросите MagicPad..." aria-label="Сообщение Феликсу"></textarea>
    <div class="tools"><button class="ibtn" id="mpatt" title="Прикрепить файл">${I('add','ic16')}</button>
      <button class="ibtn" id="mpmic" title="Голосовой ввод" style="margin-left:auto">${I('mic','ic16')}</button><button class="ibtn send ${attached?'ready':''}" id="mpsend" title="Отправить" style="margin-left:0">${I('send','ic16')}</button></div></div>`;
  el.classList.toggle('full',full); el.classList.toggle('hero',fh);
  const t=el.querySelector('#mpt');
  t.oninput=()=>{ el.querySelector('#mpsend').classList.toggle('ready',!!(t.value.trim()||attached)); if(t.value.startsWith('/')) showCmds(t.value.slice(1)); else if(popKind==='cmd') hidePop(); };
  t.onkeydown=e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); const m=el.querySelector('.mp-pop .mi.act')||(popKind&&el.querySelector('.mp-pop .mi')); if(m&&popKind){ m.dispatchEvent(new MouseEvent('mousedown',{bubbles:true})); return; } send(); } if(e.key==='Escape'&&popKind){ hidePop(); e.stopPropagation(); } };
  el.querySelector('#mpsend').onclick=send;
  el.querySelectorAll('[data-mtab]').forEach(b=>b.onclick=()=>{ tab=b.dataset.mtab; draw(); });
  const fq=el.querySelector('#mpfq'); fq&&(fq.oninput=()=>{ const r=el.querySelector('#mpfr'); const v=norm(fq.value); r.innerHTML=v?FUNCS.filter(f=>norm(f[0]).includes(v)||norm(f[1]).includes(v)).map(f=>`<button class="mp-act" data-fa="${esc(f[2])}"><b>${esc(f[0])}</b><span class="cap muted">${esc(f[1])}</span></button>`).join('')||'<span class="cap muted">Ничего не найдено</span>':''; r.previousElementSibling.hidden=!v;
    r.querySelectorAll('[data-fa]').forEach(b=>b.onclick=()=>action(b.dataset.fa)); });
  el.querySelector('#mpx').onclick=close;
  el.querySelector('#mpfull').onclick=()=>{ full=!full; draw(); };
  el.querySelector('#mpatt').onclick=()=>showFiles();
  el.querySelector('#mpmic').onclick=()=>{ view='voice'; draw(); };
  el.querySelector('#mpmasc').onclick=()=>{ view=view==='masc'?null:'masc'; mi=S().mascot!=null?S().mascot:1; draw(); };
  const $q=x=>el.querySelector(x);
  if(view==='masc'){ $q('#mmprev').onclick=()=>{ mi=(mi+2)%3; draw(); }; $q('#mmnext').onclick=()=>{ mi=(mi+1)%3; draw(); }; el.querySelectorAll('[data-mc]').forEach(c=>c.onclick=()=>{ mi=+c.dataset.mc; draw(); });
    $q('#mmok').onclick=()=>{ S().mascot=mi; store.save(); view=null; notify(`Выбран маскот «${MASC[mi][0]}»`); draw(); }; $q('#mmno').onclick=()=>{ view=null; draw(); }; }
  if(view==='voice'){ $q('#mvmic').onclick=()=>notify('Нет доступа к микрофону. Разрешите его в настройках браузера','error'); $q('#mvinfo').onclick=()=>notify('Микрофон включается в настройках браузера для этого сайта','info'); $q('#mvx').onclick=()=>{ view=null; draw(); }; }
  const hq=$q('#mphq'); hq&&(hq.oninput=()=>{ histQ=hq.value; draw(); const n=$q('#mphq'); n.focus(); n.setSelectionRange(histQ.length,histQ.length); });
  const htg=$q('#mphtog'); htg&&(htg.onclick=()=>{ histOn=!histOn; draw(); });
  el.querySelectorAll('[data-hist]').forEach(b=>b.onclick=()=>{ const h=b.dataset.hist; S().chat=[]; full=false; store.save(); bot(`<span>Чат «${esc(h)}» открыт. Последнее: сводка по задачам и документам ГК «Стройка» за неделю.</span>`,[{t:'Открыть процессы',a:'go:#/processes'},{t:'База знаний: история бесед',a:'go:#/kb?tab=mp'}]); });
  const ur=el.querySelector('#mpunreply'); ur&&(ur.onclick=()=>{ reply=null; draw(); });
  el.querySelectorAll('[data-mtab2]').forEach(b=>b.onclick=()=>{ htab=b.dataset.mtab2; draw(); });
  const ht=el.querySelector('#mpht'); ht&&(ht.onkeydown=e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); const v=ht.value.trim(); if(v){ full=false; say(v); } } });
  const hs=el.querySelector('#mphsend'); hs&&(hs.onclick=()=>{ const v=ht.value.trim(); if(v){ full=false; say(v); } });
  el.querySelectorAll('[data-mm]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const i=+b.dataset.mm, m=S().chat[i]; const k=b.dataset.k;
    if(k==='menu') APP.popMenu(b,[['reply','Ответить',()=>{ reply=strip(m.html).slice(0,80); draw(); el.querySelector('#mpt').focus(); }],['copy','Копировать',()=>notify('Текст скопирован')]]);
    else if(k==='copy') notify('Текст скопирован');
    else { m.rate=m.rate===k?null:k; store.save(); draw(); if(m.rate) notify(k==='up'?'Спасибо за оценку':'Спасибо, учтём в следующих ответах'); } });
  const nw=el.querySelector('#mpnew'); nw&&(nw.onclick=()=>{ S().chat=[]; store.save(); attached=null; draw(); });
  const dt=el.querySelector('#mpdetach'); dt&&(dt.onclick=()=>{ attached=null; draw(); });
  el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ const a=b.dataset.a; if(a.startsWith('flow:')){ const mi=[...el.querySelectorAll('.msg')].indexOf(b.closest('.msg')); const welcomeOff=0; const m=S().chat[mi]; if(m){ m.used=1; store.save(); } } action(a, b); });
  const body=el.querySelector('#mpbody'); if(chat.length) body.scrollTop=body.scrollHeight;
}
const onPay=()=>/^\/payments/.test(BP.parseHash().path);
const FUNCS=[['Импорт документа в Wiki','Загрузите файл, Феликс распознает и импортирует в Wiki','ext:wiki:start'],['Импорт из базы данных','Подключение внешней БД PostgreSQL','ext:integ:src'],['Импорт из файла','Распознать документ и создать объекты','cmd:import'],['Подобрать пресет процессов','Конструктор процесса','go:#/constructor'],['Добавить встречу','Центр встреч','go:#/meetings']];
function copilot(){ const f=S().finops; const late=f.filter(x=>x.status==='Просрочен');
  return `<div class="mp-banner co"><div class="tx"><b>MagicPad помогает вести платежи подрядчиков</b><span class="cap">Контекст: ${f.length} платежей, ${BP.money(f.reduce((a,x)=>a+x.amount,0))}; просрочено: ${late.length}. Учитываю статусы, этапы и сроки.</span><span class="chip neutral" style="align-self:flex-start">Все платежи</span></div></div>
  <div class="mp-sec">Рекомендации</div>
  <button class="mp-act ica" data-a="say:Найди На согласовании">${I('doc','ic16')}<span><b>Согласовать на согласовании</b><span class="cap muted">Платежи, ожидающие решения</span></span></button>
  <button class="mp-act ica" data-a="say:Сделай сводку по платежам">${I('table','ic16')}<span><b>Сводка по платежам</b><span class="cap muted">Суммы по статусам и этапам</span></span></button>
  <button class="mp-act ica" data-a="say:Найди Просрочен">${I('warn','ic16')}<span><b>Найти просроченные</b><span class="cap muted">Что нужно оплатить в первую очередь</span></span></button>
  <div class="mp-sec">Создание и планирование</div>
  <button class="mp-act ica" data-a="cmd:create">${I('add','ic16')}<span><b>Добавить платёж</b><span class="cap muted">Новый платёж подрядчику</span></span></button>
  <button class="mp-act ica" data-a="ext:wiki:start">${I('attach','ic16')}<span><b>Загрузить реестр платежей</b><span class="cap muted">Из файла Excel, CSV, DOCX или PDF</span></span></button>
  <button class="mp-act ica" data-a="cmd:import">${I('finance','ic16')}<span><b>Создать платёж из счёта</b><span class="cap muted">Распознать счёт и заполнить платёж</span></span></button>
  <button class="mp-act ica" data-a="say:Найди На утверждении">${I('task','ic16')}<span><b>Платежи на утверждении</b><span class="cap muted">Ждут финального решения</span></span></button>`; }
function hero(){ return `<div class="mphero"><div class="av" style="background-image:url(assets/felix.png)"></div><h2 class="h2">Чем я могу помочь?</h2>
  <div class="hbox"><div class="htabs"><button class="${htab==='mp'?'on':''}" data-mtab2="mp">MagicPad</button><button class="${htab==='ag'?'on':''}" data-mtab2="ag">${I('shine','ic16')}Агент</button></div>
   <div class="hin"><textarea id="mpht" placeholder="${htab==='mp'?'Превратите идеи в действия. Создавайте задачи, документы или что угодно.':'Опишите задачу для ИИ-агента'}" aria-label="Запрос"></textarea><div class="tools"><button class="ibtn" data-a="cmd:import" title="Прикрепить файл">${I('add','ic16')}</button><button class="ibtn" id="mphmic" title="Голосовой ввод" style="margin-left:auto" onclick="BP.notify('Голосовой ввод недоступен: нет доступа к микрофону','error')">${I('mic','ic16')}</button><button class="ibtn send ready" id="mphsend" title="Отправить">${I('send','ic16')}</button></div></div></div>
  <div class="tiles">${[['edit','Создать документ','Счёт, заказ или акт','cmd:create'],['table','Проверить остатки','Наличие на складах','say:Найди Цемент'],['finance','Отчёт','Ключевые показатели','say:Сделай сводку по платежам'],['search','Найти данные','Клиенты, сделки и т.д.','cmd:find']].map(([i,t,d,a])=>`<button class="mp-act ica" data-a="${a}">${I(i,'ic16')}<b>${t}</b><span class="cap muted">${d}</span></button>`).join('')}</div></div>`; }
const strip=h=>String(h||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
function welcome(){
  const it=(i,t,d,a)=>`<button class="mp-act ica" data-a="${a}"><span class="wi">${I(i,'ic16')}</span><span><b>${t}</b><span class="cap muted">${d}</span></span></button>`;
  return `<div class="mp-banner"><div class="tx"><b>Феликс знает всю платформу</b><span class="cap">Поиск, ответы и рекомендации по финансам, закупкам, продажам, складу, производству и команде.</span></div><img src="assets/fox.png" alt=""></div>
  <div class="search" style="margin:4px 0">${I('search','ic16')}<input class="inp" id="mpfq" placeholder="Спросите о функциях платформы" autocomplete="off"></div><div class="mp-sec" hidden>Результаты поиска</div><div class="col" id="mpfr" style="gap:6px"></div>
  <div class="mp-sec2">Рекомендуемое сегодня</div>
  ${it('shine','Сводка по компании','Финансы, продажи и риски за неделю','say:Сделай сводку по компании')}
  ${it('warn','Что требует внимания','Просрочки, превышения бюджета, блокеры','say:Проверь статус документов')}
  ${it('finance','Главное за день','Изменения по ключевым показателям','say:Сделай сводку за день')}
  <div class="mp-sec2">Финансы и платежи</div>
  ${it('add','Денежный поток','Приход, расход и прогноз остатка','say:Сделай сводку по платежам')}
  ${it('cal','Платежи к согласованию','Сколько и кому на этой неделе','say:Найди На согласовании')}
  ${it('doc','Просроченная задолженность','Дебиторка и кредиторка','say:Найди Просрочен')}`;
}
function msgHtml(m,i){
  if(m.who==='me') return `<div class="msg me"><div class="bub">${m.quote?`<div class="quote"><b>Феликс</b><span>${esc(m.quote)}</span></div>`:''}${m.file?`<div class="fcard"><b>${esc(m.file)}</b><span class="cap muted">${m.rows?m.rows+' строк':''}</span><span class="ext">${esc(m.ext||'')}</span></div>`:''}${m.text?`<span>${esc(m.text)}</span>`:''}<span class="tm">${m.time}</span></div></div>`;
  return `<div class="msg bot"><div class="mh"><div class="av" style="background-image:url(assets/felix.png)"></div><span class="who">Феликс</span><button class="ibtn s mm" data-mm="${i}" data-k="menu" title="Ещё">${I('more','ic16')}</button></div><div class="bub">${m.html}
   ${m.opts?`<div class="opts">${m.opts.map(o=>optHtml(o,m)).join('')}</div>`:''}</div>
   <div class="rate"><button class="ibtn s" data-mm="${i}" data-k="copy" title="Копировать">${I('copy','ic16')}</button><button class="ibtn s ${m.rate==='up'?'on':''}" data-mm="${i}" data-k="up" title="Полезно">${I('thup','ic16')}</button><button class="ibtn s ${m.rate==='down'?'on':''}" data-mm="${i}" data-k="down" title="Не полезно">${I('thdown','ic16')}</button></div></div>`;
}
function optHtml(o,m){
  const dis=m.used&&o.k!=='card'?'dis':'';
  if(o.k==='text') return `<span>${esc(o.t)}</span>`;
  if(o.k==='btn') return `<button class="opt mp-btn ${dis}" data-a="${esc(o.a)}">${esc(o.t)}</button>`;
  if(o.k==='launch') return `<div class="opt launch ${dis}"><b class="sub1">${esc(o.t)}</b><span class="cap">${esc(o.d)}</span><button class="btn pri" data-a="${esc(o.a)}">${esc(o.b)}</button></div>`;
  return `<button class="opt ${o.k==='card'?'':dis} ${m.used&&o.a&&o.a.startsWith('proc:')?'dis':''}" data-a="${esc(o.a)}"><span class="r"><span>${esc(o.t)}</span>${o.r?`<span class="cap">${esc(o.r)}</span>`:''}</span>${o.d?`<span class="cap">${esc(o.d)}</span>`:''}</button>`;
}
function push(m){ m.time=nowTime(); S().chat.push(m); store.save(); draw(); }
function bot(html,opts){ push({who:'bot',html,opts}); }
function typing(steps){ return new Promise(res=>{
  busy=true; const body=el.querySelector('#mpbody'); const box=document.createElement('div'); box.className='msg'; box.id='mptyping';
  box.innerHTML=`<div class="av" style="background-image:url(assets/felix.png)"></div><div class="bub"><span class="typing">Думаю...</span>${steps?`<div class="proc-steps">${steps.map(s=>`<div>${I('ok','ic16')}<span>${esc(s)}</span></div>`).join('')}</div>`:''}</div>`;
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
  else if(k==='flow'){ const lbl={cp:'Проверить и создать',link:'Связать и запустить',mflink:'Связать и запустить',prod:'Создать товар',mf:'Приёмка товара'}[v]; push({who:'me',text:lbl}); IMPORT.flow(v); }
  else if(k==='ext'){ const [n,...r]=v.split(':'); window.MPX&&MPX[n]&&MPX[n](r.join(':')); }
  else if(k==='newinst') { const p=store.proc(v); const id=store.id('in'); S().instances.unshift({id,name:`${p.name} #${String(Date.now()).slice(-4)}`,process:v,counterparty:null,stage:p.stages[0],status:'Новый',updated:S().today,amount:0,isNew:true}); store.save(); notify(`Экземпляр процесса «${esc(p.name)}» создан`); bot(`Создал экземпляр процесса «${esc(p.name)}» на этапе «${esc(p.stages[0])}».`,[{t:'Открыть экземпляр',a:'go:#/instance/'+id}]); }
}
function command(k){
  const t=el.querySelector('#mpt'); t.value='';
  if(k==='import'){ store.mark('slash'); showFiles(); }
  else if(k==='data'){ push({who:'me',text:'/ Импорт данных'}); MPX.integ('src'); }
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
  if(attached){ const f=attached; attached=null; push({who:'me',file:f.name,rows:f.rows,ext:(f.kind||'').toUpperCase(),text}); store.mark('file'); await fileFlow(f); return; }
  if(reply){ const q=reply; reply=null; push({who:'me',text,quote:q}); await typing(); bot('<span>Принял. Уточню по сообщению выше и вернусь с ответом.</span>'); return; }
  say(text);
}
async function fileFlow(f){
  await typing(['Проверка безопасности файла','Извлечение текста и структуры','Сопоставление с процессами компании']);
  if(f.wiki){ MPX.wiki('recognized'); return; }
  if(!f.readable){ bot(`<span>Не удалось распознать «${esc(f.name)}»: изображение слишком размытое, текст не читается. Загрузите скан лучшего качества (от 300 dpi) или PDF.</span>`,[{t:'Выбрать другой файл',a:'cmd:import'}]); return; }
  bot(`<span>В товарной накладной № ТН-0842 нашёл 3 товара и 2 организации. Выберите процесс, по которому хотите создать экземпляры.</span><span>Ниже — наиболее подходящие варианты. Перед подтверждением данные можно проверить и исправить</span>`,[
    {t:'Входящие документы',r:'100%',d:'Тип: Документ',a:'proc:proc-in-docs:'+f.id},
    {t:'Приёмка товара',r:'100%',d:'Тип: Материальный поток',a:'proc:proc-priemka:'+f.id},
    {t:'Стройка контрагенты',r:'100%',d:'Тип: Контрагенты',a:'proc:proc-kontragenty:'+f.id},{k:'btn',t:'Процессы',a:'go:#/drafts/pick'}]);
}
function chooseProcess(v){
  const [pid,fid]=v.split(':'); const p=store.proc(pid);
  const last=S().chat[S().chat.length-1]; S().chat.forEach(m=>{ if(m.opts&&m.opts.some(o=>o.a&&o.a.startsWith('proc:'))) m.used=1; });
  push({who:'me',text:p.name});
  store.mark('proc');
  if(pid==='proc-priemka'||pid==='proc-kontragenty'){ go(pid==='proc-priemka'?'#/drafts/priemka':'#/drafts/kontragenty'); return; }
  const id=store.id('imp'); S().drafts[id]={file:fid,process:pid,step:0}; store.save();
    go('#/import/'+id);
}
async function say(text){
  if(!isOpen()) open();
  if(window.MPX&&MPX.onText&&MPX.onText(text)) return;
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
window.MP={redraw:()=>{ if(el){ if(!/^\/payments/.test(BP.parseHash().path)) tab='co'; draw(); } },me:t=>push({who:'me',text:t}),typing,useAll:()=>{ S().chat.forEach(m=>m.used=1); store.save(); },attachSend:fid=>{ open(); attached=S().demoFiles.find(f=>f.id===fid); draw(); send(); },mount,open,close,toggle,isOpen,say,bot,slash:()=>{ const t=el.querySelector('#mpt'); t.value='/'; t.focus(); showCmds(''); },resetUi};
})();
