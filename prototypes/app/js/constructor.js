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
let wait=null;

route(/^\/constructor$/, (_,q)=>{
  const from=q.from&&store.proc(q.from); const c=C(); const tab=q.tab||'canvas';
  A().setCrumbs([['Настройки системы','#/settings'],['Конструктор процесса']],true);
  const status=from?(from.status||'Опубликован'):c.stage==='published'?'Опубликован':'Черновик';
  const title=from?from.name:'Конструктор процесса';
  const st=from?from.stages.map((s,i,a)=>[s,'',STAND.LANES[i===0?0:i===a.length-1?2:1]]):c.stage==='empty'?[]:mainStages();
  const lanes=from?STAND.LANES:c.stage==='empty'?['Зона ответственности','Зона ответственности']:MAIN_LANES;
  const body= tab==='canvas'?STAND.canvas(st,lanes,{cls:'cons'}):
    tab==='setup'?`<div class="form2"><div class="fld"><label>Название процесса</label><input class="inp" value="${esc(c.stage==='empty'&&!from?'Новый процесс':title==='Конструктор процесса'?PR().main.name:title)}"></div><div class="fld"><label>Тип процесса</label><input class="inp" value="Сделка"></div><div class="fld"><label>Версия</label><input class="inp" value="V1" disabled></div></div>`:
    tab==='roles'?CARDS.uni([{t:'Роль',f:r=>esc(r)},{t:'Зона ответственности',f:r=>esc(MAIN_LANES[0])}],c.stage==='empty'&&!from?[]:['Менеджер по продажам','Инженер ПТО','Финансист','Заведующий складом'],()=>'#/constructor?tab=roles'):
    CARDS.uni([{t:'Название',f:r=>esc(r.name)},{t:'Тип',w:'120px',f:r=>esc(r.type)},{t:'Формат',w:'200px',f:r=>esc(r.format)}],c.stage==='empty'&&!from?[]:S().bpFields.default,()=>'#/constructor?tab=fields');
  A().content(`<div class="page">${A().ph(title,{icon:'puzzle',after:`<span class="ver">V1</span>${chip(status)}`,dots:1,extra:`<span class="split-btn"><button>CFF</button><button>${I('drop','ic16')}</button></span>`})}
   <div class="paper col fill">${STAND.seg(TABS,tab,'ctab')}${body}</div></div>`);
  STAND.bindSeg('ctab',t=>go('#/constructor?tab='+t+(from?'&from='+from.id:'')));
  if(!from && c.stage==='empty' && !c.greeted){ c.greeted=1; store.save(); setTimeout(()=>{ MP.open(); MPX.cons('greet'); },250); }
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
    bot(`<span>Развернул ${p.procs} черновиков. На полотне основной процесс «${esc(p.main.name)}»: ${p.main.stages.length} этапов в трёх зонах ответственности.</span><span>Проверьте схему и опубликуйте процессы, когда будете готовы.</span>`,[btn('Опубликовать все','pubAsk'),{k:'btn',t:'Список процессов',a:'go:#/settings/bps'}]); },
  pubAsk(){ MP.useAll(); MP.me('Опубликовать все'); const n=PR().procs;
    bot(`<span>Вы уверены что хотите опубликовать все ${n} процессов?</span><span>Будут одновременно опубликованы актуальные черновики всех процессов набора. Процессы без изменений останутся в исходной конфигурации пресета.</span>`,[btn('Опубликовать','pub'),btn('Отмена','cancel')]); },
  cancel(){ MP.useAll(); MP.me('Отмена'); bot('<span>Публикация отменена, черновики сохранены.</span>',[btn('Опубликовать все','pubAsk')]); },
  async pub(){ MP.useAll(); MP.me('Опубликовать'); await MP.typing(['Публикация процессов набора']);
    S().processes.forEach(x=>{ if(x.preset) x.status='Опубликован'; }); C().stage='published'; store.save(); store.mark('cons-pub'); BP.render(); notify('Процессы опубликованы');
    bot(`<span>Все ${PR().procs} процессов опубликованы.</span><span>Опубликованы актуальные версии всего набора, процессы появились в разделе «Процессы».</span>`,[{k:'btn',t:'К списку процессов',a:'go:#/processes'}]); }
};
window.MPX=window.MPX||{};
MPX.cons=k=>ACT[k]&&ACT[k]();
MPX.onText=text=>{ if(!wait) return false; wait=null; MP.me(text); ACT.rec(); return true; };
})();
