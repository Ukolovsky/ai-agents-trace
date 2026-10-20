/* Настройщик: «Конструктор процесса» по Figma (V1 Черновик, табы Полотно/Настройки процесса/Роли/Поля и переменные)
   + сценарий MagicPad «Подберём готовый пресет» → «Пресет выбран» → «Развернуть» → «Опубликовать все». */
(function(){
const {I,esc,store,chip,route,go,notify} = BP;
const A=()=>window.APP; const S=()=>store.s;
const C=()=>S().cons||(S().cons={stage:'empty'});
const PR=()=>S().preset;
const MAIN_LANES=['Менеджер по продажам','Согласующие','Исполнение сделки'];
const mainStages=()=>PR().main.stages.map((s,i)=>[s[0],s[1],MAIN_LANES[[0,0,1,2][i]]]);
const TABS=[['canvas','Полотно'],['setup','Настройки процесса'],['roles','Роли'],['fields','Поля и переменные']];
let wait=null, pend=null;

/* текущий процесс конструктора: ?from=… или развёрнутый основной процесс пресета */
function curProc(q){ return (q.from&&store.proc(q.from)) || (C().stage!=='empty'&&store.proc('proc-ps-0')) || null; }
let edit=null; /* {pid, idx, name, desc, roles, changes} */
const ACC=['Ответственные','Длительность','Задачи','Переменные','Дополнительные элементы','Секции','Степпер'];
function stagePanel(p, idx){
  const e=edit; const roles=e.roles;
  return `<div class="stpanel"><div class="sth"><button class="ibtn s" id="stclose" title="Свернуть">${I('chev','ic16')}</button><label><input type="checkbox" class="chk" checked disabled>Настройка этапа</label></div>
   <div class="acc open"><b>Общие настройки</b><div class="fld"><label>Название<span class="req">*</span></label><input class="inp" id="stn" value="${esc(e.name)}" maxlength="100"><span class="cnt">${e.name.length}/100</span></div>
    <div class="fld"><label>Описание</label><textarea class="ta" id="std" maxlength="250">${esc(e.desc)}</textarea><span class="cnt">${e.desc.length}/250</span></div>
    <div class="fld"><label>Номер этапа <span class="req">*</span></label><div class="row" style="gap:8px"><input class="inp" value="${idx+1}" style="flex:1"><button class="btn pri out s">Настроить</button></div></div></div>
   <div class="acc ${e.open==='Ответственные'?'open':''}" data-acc="Ответственные"><b>Ответственные</b>${e.open==='Ответственные'?`<div class="pbox"><span>Пользовательские роли: <b>${roles.length}</b></span><button class="btn pri out s" id="stroles">${roles.length?'Изменить':'Добавить'}</button></div>`:''}</div>
   ${ACC.slice(1).map(a=>`<div class="acc" data-acc="${a}"><b>${a}</b></div>`).join('')}</div>`;
}
route(/^\/constructor$/, (_,q)=>{
  const c=C(); const tab=q.tab||'canvas'; const p=curProc(q); const from=q.from&&store.proc(q.from);
  A().setCrumbs([['Настройки системы','#/settings'],['Конструктор процесса']],true);
  const status=p?(p.status||'Опубликован'):'Черновик';
  const title='Конструктор процесса';
  const isMain=p&&p.id==='proc-ps-0';
  const st=!p?[]:isMain?mainStages():p.stages.map((s,i,a)=>[s,'',STAND.LANES[i===0?0:i===a.length-1?2:1]]);
  const lanes=!p?['Зона ответственности','Зона ответственности']:isMain?MAIN_LANES:STAND.LANES;
  if(edit&&(!p||edit.pid!==p.id)) edit=null;
  const sel=q.stage!=null&&p?+q.stage:null;
  if(sel!=null&&(!edit||edit.idx!==sel)) edit={pid:p.id,idx:sel,name:st[sel][0],desc:'',roles:[],changes:0,open:null};
  const roleMenu=[['sys','Системные роли'],['user','Пользовательские роли'],['ai','ИИ-агент']]; const rm=q.r||'sys';
  const agents=(S().agents[p?p.id:'new']||[]);
  const body= tab==='canvas'?STAND.canvas(st,lanes,{cls:'cons',sel,panel:sel!=null?stagePanel(p,sel):''}):
    tab==='setup'?`<div class="form2"><div class="fld"><label>Название процесса</label><input class="inp" value="${esc(p?p.name:'Новый процесс')}"></div><div class="fld"><label>Тип процесса</label><input class="inp" value="${esc(p?p.type:'Сделка')}"></div><div class="fld"><label>Версия</label><input class="inp" value="V1" disabled></div></div>`:
    tab==='roles'?`<div class="split"><div class="smenu">${roleMenu.map(([k,t])=>`<a class="${k===rm?'on':''}" href="#/constructor?tab=roles&r=${k}${from?'&from='+from.id:''}">${t}</a>`).join('')}</div><div class="grow paper out">${
      rm==='ai'?(agents.length?`${STAND.listHead('Список ролей агента',agents.length)}<button class="plus round" id="aiadd" title="Добавить ИИ-агента" style="position:relative;top:-38px;left:200px">${I('add','ic16')}</button>${CARDS.uni([{t:'Название',f:r=>esc(r.name)},{t:'Модель',f:r=>esc(r.vendor+' '+r.model)}],agents,()=>'#'+BP.parseHash().path+location.hash.replace(/^[^?]*/,''))}`:
        `<div class="lh"><h2 class="h3">Список ИИ-агентов</h2><button class="plus round" id="aiadd" title="Добавить ИИ-агента">${I('add','ic16')}</button></div><div class="empty" style="padding:120px 0">${I('shine','ic24')}<b>Пока не настроен ни один ИИ-агент</b>Нажмите «+», чтобы настроить ИИ-агента</div>`):
      `${STAND.listHead(rm==='sys'?'Системные роли':'Пользовательские роли',rm==='sys'?3:S().roles.custom.length)}${CARDS.uni([{t:'Название',f:r=>`<a>${esc(r.name)}</a>`},{t:'Описание',f:r=>esc(r.desc)}],rm==='sys'?[{name:'Инициатор',desc:'Пользователь, запустивший экземпляр процесса'},{name:'Участник зоны ответственности',desc:'Пользователи (роли), выбранные в качестве участника зоны ответственности'},{name:'Ответственный этапа',desc:'Пользователи (роли), выбранные в качестве ответственного этапа'}]:S().roles.custom,()=>'#'+BP.parseHash().path)}`}</div></div>`:
    CARDS.uni([{t:'Название',f:r=>esc(r.name)},{t:'Тип',w:'120px',f:r=>esc(r.type)},{t:'Формат',w:'200px',f:r=>esc(r.format)}],p?S().bpFields.default:[],()=>'#/constructor?tab=fields');
  const ch=edit?edit.changes:0;
  A().content(`<div class="page cpage">${A().ph(title,{icon:'puzzle',after:`<span class="ver">V1</span>${chip(status)}`,dots:1,extra:tab==='canvas'?`<span class="split-btn"><button>CFF</button><button>${I('drop','ic16')}</button></span>`:''})}
   <div class="paper col fill">${STAND.seg(TABS,tab,'ctab')}${body}</div>
   ${tab==='canvas'&&p?`<div class="wfoot"><span style="flex:1"></span><span class="cap muted">Изменений:</span><span class="counter">${ch}</span><button class="btn" id="stsave" ${ch?'':'disabled'}>Сохранить</button><button class="btn out" id="stcancel">Отменить</button></div>`:''}</div>`);
  const qs=k=>'#/constructor?'+new URLSearchParams(Object.assign({},from?{from:from.id}:{},k)).toString();
  STAND.bindSeg('ctab',t=>go(qs({tab:t})));
  document.querySelectorAll('.canvas [data-stg]').forEach(b=>b.onclick=()=>go(qs({stage:b.dataset.stg})));
  const cpo=document.getElementById('cpopen'); cpo&&p&&(cpo.onclick=()=>go(qs({stage:0})));
  const $=id=>document.getElementById(id);
  if(sel!=null&&tab==='canvas'){
    $('stclose').onclick=()=>{ go(qs({})); };
    const bump=()=>{ edit.changes=Math.max(edit.changes,1)+0; };
    $('stn').oninput=e=>{ edit.name=e.target.value; if(!edit._n){edit._n=1; edit.changes++;} $('stsave').disabled=false; document.querySelector('.wfoot .counter').textContent=edit.changes; };
    $('std').oninput=e=>{ edit.desc=e.target.value; if(!edit._d){edit._d=1; edit.changes++;} $('stsave').disabled=false; document.querySelector('.wfoot .counter').textContent=edit.changes; };
    document.querySelectorAll('[data-acc]').forEach(a=>a.querySelector('b').onclick=()=>{ edit.open=edit.open===a.dataset.acc?null:a.dataset.acc; BP.render(); });
    const sr=$('stroles'); sr&&(sr.onclick=e=>{ e.stopPropagation(); A().popMenu(sr,S().roles.custom.map(r=>[edit.roles.includes(r.name)?'check':'person',r.name,()=>{ edit.roles=edit.roles.includes(r.name)?edit.roles.filter(x=>x!==r.name):[...edit.roles,r.name]; if(!edit._r){edit._r=1; edit.changes++;} BP.render(); }])); });
  }
  const sv=$('stsave'); sv&&(sv.onclick=()=>{ if(!edit) return; if(!edit.name.trim()){ $('stn').classList.add('err'); notify('Заполните название этапа','error'); return; }
    if(isMain){ PR().main.stages[edit.idx][0]=edit.name.trim(); } p.stages[edit.idx]=edit.name.trim(); p.changed=1; store.save(); store.mark('df-stage'); edit=null; notify('Изменения сохранены'); go(qs({})); });
  const sc=$('stcancel'); sc&&(sc.onclick=()=>{ edit=null; go(qs({})); });
  const ai=$('aiadd'); ai&&(ai.onclick=()=>go('#/agent?proc='+(p?p.id:'new')));
  if(!from && c.stage==='empty' && !c.greeted){ c.greeted=1; store.save(); setTimeout(()=>{ MP.open(); MPX.cons('greet'); },250); }
});

/* Добавить ИИ-агента: 4 шага (1522-494001, 1522-494723, 1522-496729, 2329-38966/39214) */
const AST=['Общие настройки','Агент и запуск','Инструкция агенту','Режим применения'];
let ag=null;
route(/^\/agent$/, (_,q)=>{
  const pid=q.proc||'new'; const p=store.proc(pid);
  if(!ag||ag.pid!==pid) ag={pid,step:0,name:'Агент 1',desc:'Распознаёт файл запуска и заполняет новый экземпляр процесса',vendor:'OpenAI',model:'gpt-4.1',used:true,launch:'Почта получила письмо с файлом',box:'Входящие документы — docs@stroyka.ru',prompt:'',mode:'Создавать черновик на проверку'};
  A().setCrumbs([['Настройки системы','#/settings'],['Конструктор процесса','#/constructor?tab=roles&r=ai'+(p?'&from='+pid:'')],['Добавить ИИ-агента']],true);
  const back=()=>{ ag=null; go('#/constructor?tab=roles&r=ai'+(p&&pid!=='proc-ps-0'?'&from='+pid:'')); };
  const sel=(k,l,opts,info)=>`<div class="fld"><label>${l} <span class="req">*</span>${info?` <button class="dotinfo" data-info="${esc(info)}" title="Подсказка"></button>`:''}</label><select class="sel" data-k="${k}">${opts.map(o=>`<option ${o===ag[k]?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`;
  const bodies=[
   `<h2 class="h3">Общие настройки</h2><div class="col" style="max-width:573px;gap:10px"><div class="fld"><label>Название</label><input class="inp" data-k="name" value="${esc(ag.name)}" maxlength="100"><span class="cnt">${ag.name.length}/100</span></div>
    <div class="fld"><label>Описание</label><textarea class="ta" data-k="desc" maxlength="250">${esc(ag.desc)}</textarea><span class="cnt">${ag.desc.length}/250</span></div>
    <div class="row" style="gap:10px"><div class="grow">${sel('vendor','Подключение ИИ-сервиса',['OpenAI','YandexGPT','GigaChat'],'Используются подключения из раздела «Интеграции»')}</div><div class="grow">${sel('model','Модель',['gpt-4.1','gpt-4.1-mini','YandexGPT 5 Pro'])}</div></div>
    <label class="row" style="gap:8px;align-items:center"><input type="checkbox" class="chk" data-k="used" ${ag.used?'checked':''}>Роль используется</label></div>`,
   `<h2 class="h3">Правила запуска агента</h2><div class="col" style="max-width:573px;gap:10px">${sel('launch','Вид запуска',['Почта получила письмо с файлом','Создан экземпляр процесса','По расписанию'],'Файл, полученный вместе с событием, обрабатывается автоматически. Отдельного выбора файла нет.')}${sel('box','Почтовый ящик',['Входящие документы — docs@stroyka.ru','Снабжение — supply@stroyka.ru'],'Используются данные подключений из раздела «Интеграции».')}</div>`,
   `<h2 class="h3">Инструкция агенту</h2><div class="fld" style="max-width:573px"><label>Промпт <span class="req">*</span></label><textarea class="ta" data-k="prompt" style="min-height:90px" placeholder="Опишите, что должен сделать агент">${esc(ag.prompt)}</textarea><span class="cnt">${ag.prompt.length}/1000</span></div>`,
   `<h2 class="h3">Режим применения</h2><div class="col" style="max-width:573px;gap:10px">${['Создавать черновик на проверку','Применять результат автоматически'].map(m=>`<label class="row" style="gap:8px;align-items:center"><input type="radio" name="agm" data-m="${esc(m)}" ${ag.mode===m?'checked':''}>${esc(m)}</label>`).join('')}</div>`];
  const can=ag.step!==2||ag.prompt.trim();
  WP.wpage('Добавить ИИ-агента',`<div class="paper col" style="flex:1">${bodies[ag.step]}</div>`,
    `${WP.steps(AST,ag.step)}<span style="flex:1"></span>${ag.step?'<button class="btn pri out" id="agback">Назад</button>':''}<button class="btn" id="agnext" ${can?'':'disabled'}>${ag.step===3?'Добавить':'Далее'}</button><button class="btn out" id="agcancel">Отменить</button>`,{close:back});
  document.querySelectorAll('[data-k]').forEach(i=>i.oninput=i.onchange=()=>{ ag[i.dataset.k]=i.type==='checkbox'?i.checked:i.value; if(i.dataset.k==='prompt'){ document.getElementById('agnext').disabled=!i.value.trim(); i.nextElementSibling.textContent=i.value.length+'/1000'; } });
  document.querySelectorAll('[data-m]').forEach(r=>r.onchange=()=>{ ag.mode=r.dataset.m; });
  document.querySelectorAll('[data-info]').forEach(b=>b.onclick=e=>{ e.preventDefault(); document.querySelectorAll('.informer').forEach(x=>x.remove()); const d=document.createElement('div'); d.className='informer'; d.style.cssText='position:absolute;left:0;top:18px;right:auto'; d.innerHTML=`<span>${esc(b.dataset.info)}</span><button class="ibtn s" title="Закрыть">${I('close','ic16')}</button>`; d.querySelector('button').onclick=ev=>{ ev.preventDefault(); d.remove(); }; b.parentElement.style.position='relative'; b.parentElement.appendChild(d); });
  document.getElementById('agcancel').onclick=back;
  const bk=document.getElementById('agback'); bk&&(bk.onclick=()=>{ ag.step--; BP.render(); });
  document.getElementById('agnext').onclick=()=>{ if(ag.step<3){ ag.step++; BP.render(); return; }
    (S().agents[pid]=S().agents[pid]||[]).push({name:ag.name,desc:ag.desc,vendor:ag.vendor,model:ag.model,launch:ag.launch,mode:ag.mode}); store.save(); store.mark('df-agent'); notify('ИИ-агент добавлен'); back(); };
});

/* Процессы пресета (2831-355459): основной / связанные, «Выбрано», Применить / Отменить */
route(/^\/preset$/, (_,q)=>{
  const k=q.k||'main'; const ps=S().processes.filter(x=>x.preset); const list=k==='main'?ps.slice(0,1):ps.slice(1);
  A().setCrumbs([['Настройки системы','#/settings'],['Конструктор процесса','#/constructor'],['Процессы пресета']],true);
  window._psel=window._psel||null;
  const close=()=>{ window._psel=null; go('#/constructor'); };
  WP.wpage(`Процессы пресета «${PR().name}»`,`<div class="split"><div class="smenu"><a class="${k==='main'?'on':''}" href="#/preset">Основной процесс</a><a class="${k==='rel'?'on':''}" href="#/preset?k=rel">Связанные процессы</a></div>
   <div class="paper out grow"><div class="lh"><h2 class="h3">${k==='main'?'Основной процесс':'Связанные процессы'}</h2><span class="cnt0">${list.length}</span><div class="search" style="width:240px;margin-left:auto">${I('search','ic16')}<input class="inp" placeholder="Поиск по процессам"></div></div>
   ${CARDS.uni([{t:'Процесс',f:r=>esc(r.name)},{t:'Тип',w:'180px',f:r=>esc(r.type)},{t:'Статус',w:'170px',f:r=>`<span class="chip ${r.changed?'orange':'grey'}">${r.changed?'Есть изменения':'Без изменений'}</span>`},{t:'Этапы',w:'90px',f:r=>r.stages.length}],list,r=>'#/preset?k='+k+'&pick='+r.id,{cb:1})}</div></div>`,
   `<span style="flex:1"></span><span class="cap muted">Выбрано:</span><span class="counter">${window._psel?1:0}</span><button class="btn" id="psapply" ${window._psel?'':'disabled'}>Применить</button><button class="btn out" id="pscancel">Отменить</button>`,{close,dots:1});
  if(q.pick){ window._psel=q.pick; history.replaceState(null,'','#/preset?k='+k); BP.render(); return; }
  document.querySelectorAll('tbody tr').forEach(tr=>{ const id=new URLSearchParams(tr.dataset.href.split('?')[1]).get('pick'); const cb=tr.querySelector('.chk'); cb.type='radio'; cb.checked=id===window._psel; });
  document.getElementById('pscancel').onclick=close;
  document.getElementById('psapply').onclick=()=>{ const id=window._psel; window._psel=null; const p=store.proc(id); notify(`Открыт процесс «${p.name}»`); go(id==='proc-ps-0'?'#/constructor':'#/constructor?from='+id); };
});

function bot(h,o){ MP.bot(h,o); }
const btn=(t,a)=>({k:'btn',t,a:'ext:cons:'+a});
const ACT={
  greet(){ wait=null; bot('<span>Подберём готовый пресет под ваш бизнес: я создам процессы, роли и поля, останется только проверить. Как удобнее рассказать о компании?</span>',[btn('Описать бизнес','describe'),btn('Выбрать отрасль','industry'),btn('Указать ОКВЭД','okved')]); },
  describe(){ MP.useAll(); MP.me('Описать бизнес'); wait='desc'; bot('<span>Опишите бизнес.</span><span>Расскажите, чем занимается компания, кто её клиенты и какие основные шаги выполняет команда.</span>',[btn('Выбрать другой способ','greet')]); store.mark('cons-start'); },
  industry(){ MP.useAll(); MP.me('Выбрать отрасль'); store.mark('cons-start'); bot('<span>Выберите отрасль:</span>',[{t:'Строительство и стройматериалы',d:'Опт, снабжение объектов',a:'ext:cons:rec'},{t:'Оптовая торговля',d:'Склад, отгрузки, дебиторка',a:'ext:cons:rec'},{t:'Производство',d:'Заказы, техкарты, ОТК',a:'ext:cons:rec'}]); },
  okved(){ MP.useAll(); MP.me('Указать ОКВЭД'); wait='okved'; store.mark('cons-start'); bot('<span>Введите код ОКВЭД, например 46.73 «Торговля оптовая лесоматериалами, строительными материалами».</span>',[btn('Выбрать другой способ','greet')]); },
  async rec(){ MP.useAll(); await MP.typing(['Анализ описания','Подбор отраслевого пресета']); const p=PR();
    bot(`<span>По указанным данным рекомендую готовый отраслевой пресет.</span><div class="preset"><div class="r"><b class="h4">${esc(p.name)}</b><span class="chip pri">${esc(p.tag)}</span></div>
      <span class="cap">Перед созданием вы увидите состав: основной процесс «${esc(p.main.name)}» и ${p.linked.length} связанных.</span>
      <div class="r cap"><span>Процессов <b>${p.procs}</b></span><span>Ролей <b>${p.roles}</b></span></div><div class="r">${p.tags.map(t=>`<span class="chip neutral">${esc(t)}</span>`).join('')}<span class="cap">+2</span></div>
      <div class="r"><b>${esc(p.price)}</b><span style="margin-left:auto" class="cap muted">Демо</span><button class="btn pri out s" data-a="ext:cons:pick">Выбрать</button></div></div>`,[btn('Изменить данные','greet')]); },
  pick(){ MP.useAll(); MP.me('Выбрать'); const p=PR(); store.mark('cons-pick');
    bot(`<span>Пресет выбран.</span><span>Будут созданы ${p.procs} черновиков процессов: основной процесс «${esc(p.main.name)}» и ${p.linked.length} связанных: ${p.linked.map(l=>'«'+esc(l[0])+'»').join(', ')}.</span><span>После развёртывания откроется «${esc(p.main.name)}». У каждого процесса будет собственная схема со Стартовым и Завершающим этапами.</span>`,[{k:'btn',t:'Развернуть',a:'ext:cons:deploy'},btn('Изменить','greet')]); },
  async deploy(){ MP.useAll(); MP.me('Развернуть'); await MP.typing(['Создание черновиков процессов','Схемы этапов и переходов','Роли и поля']);
    const p=PR(); const mk=(name,role,stages,i)=>({id:'proc-ps-'+i,name,type:i?'Связанный процесс':'Сделка',owner:S().company.user,stages,description:i?`Связанный процесс пресета, зона: ${role}`:'Основной процесс пресета «'+p.name+'»',num:40+i,created:S().today+' в '+BP.nowTime(),status:'Черновик',preset:1});
    S().processes=S().processes.filter(x=>!x.preset);
    S().processes.unshift(mk(p.main.name,'',p.main.stages.map(s=>s[0]),0),...p.linked.map((l,i)=>mk(l[0],l[1],['Старт','В работе','Завершено'],i+1)));
    C().stage='deployed'; store.save(); store.mark('cons-deploy'); BP.render(); notify(`Создано черновиков: ${p.procs}`);
    bot(`<span>Развернул ${p.procs} черновиков. На полотне основной процесс «${esc(p.main.name)}»: ${p.main.stages.length} этапов в трёх зонах ответственности.</span><span>Проверьте схему и опубликуйте процессы, когда будете готовы.</span>`,[btn('Опубликовать все','pubAsk'),{k:'btn',t:'Процессы пресета',a:'go:#/preset'}]); },
  pubAsk(){ MP.useAll(); MP.me('Опубликовать все'); const n=PR().procs;
    bot(`<span>Вы уверены что хотите опубликовать все ${n} процессов?</span><span>Будут одновременно опубликованы актуальные черновики всех процессов набора. Процессы без изменений останутся в исходной конфигурации пресета.</span>`,[btn('Опубликовать','pub'),btn('Отмена','cancel')]); },
  async change(text){ const p=curProc(BP.parseHash().query); if(!p) return; await MP.typing(['Анализ маршрута процесса','Проверка переходов и заданий']); pend={pid:p.id,text};
    const after=(p.id==='proc-ps-0'?PR().main.stages.map(s=>s[0]):p.stages)[0];
    bot(`<span>Предлагаю добавить в «${esc(p.name)}» этап «Проверка контрагента» сразу после «${esc(after)}» и заново проверить переходы и связанные настройки.</span><span class="cap muted">Плюс</span><span>Маршрут будет точнее соответствовать реальной последовательности работы.</span><span class="cap muted">Минус</span><span>Потребуется заново проверить условия переходов и выдачу заданий на затронутых этапах.</span><div class="warnbox">${I('warn','ic16')}<span>Изменение порядка или переходов может сделать часть маршрута недоступной либо изменить момент выдачи заданий.</span></div>`,[btn('Подтвердить изменение','chOk'),btn('Изменить запрос','chEdit'),btn('Отменить','chNo')]); },
  chOk(){ MP.useAll(); MP.me('Подтвердить изменение'); const p=store.proc(pend.pid); const ins='Проверка контрагента';
    if(p.id==='proc-ps-0'){ PR().main.stages.splice(1,0,[ins,'Юрист, бухгалтер']); } p.stages.splice(1,0,ins); p.changed=1; store.save(); store.mark('cons-upd'); BP.render();
    bot(`<span>Черновик процесса «${esc(p.name)}» обновлён. Изменение применено автоматически, проверка завершена без ошибок.</span>`,[btn('Продолжить настройку','chGo'),{k:'btn',t:'К списку процессов',a:'go:#/processes'}]); },
  chEdit(){ MP.useAll(); MP.me('Изменить запрос'); bot('<span>Опишите, что изменить в маршруте процесса.</span>'); },
  chNo(){ MP.useAll(); MP.me('Отменить'); bot('<span>Изменение отменено, процесс остался без изменений.</span>'); },
  chGo(){ MP.useAll(); MP.close(); },
  cancel(){ MP.useAll(); MP.me('Отмена'); bot('<span>Публикация отменена, черновики сохранены.</span>',[btn('Опубликовать все','pubAsk')]); },
  async pub(){ MP.useAll(); MP.me('Опубликовать'); await MP.typing(['Публикация процессов набора']);
    S().processes.forEach(x=>{ if(x.preset) x.status='Опубликован'; }); C().stage='published'; store.save(); store.mark('cons-pub'); BP.render(); notify('Процессы опубликованы');
    bot(`<span>Все ${PR().procs} процессов опубликованы.</span><span>Опубликованы актуальные версии всего набора, процессы появились в разделе «Процессы».</span>`,[{k:'btn',t:'К списку процессов',a:'go:#/processes'}]); }
};
window.MPX=window.MPX||{};
MPX.cons=k=>ACT[k]&&ACT[k]();
MPX.onText=text=>{ if(wait){ wait=null; MP.me(text); ACT.rec(); return true; }
  if(/^\/constructor/.test(BP.parseHash().path) && (C().stage!=='empty'||BP.parseHash().query.from)){ MP.me(text); ACT.change(text); return true; }
  return false; };
})();
