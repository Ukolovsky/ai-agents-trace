/* v7: «База знаний» (Wiki). Верхний уровень и запись встречи по Figma «Wiki Черновик» 2560:55637 (missing/wiki),
   разделы по HTML-макетам Wiki Hub (prototypes/wiki-hub/screens: HP, HT, REG, MEET, SMP, CH, EXT, AG). Данные ГК «Стройка». */
(function(){
const {I,esc,store,route,go,notify,PDF} = BP;
const A=()=>window.APP; const S=()=>store.s;
const emp=id=>S().employees.find(e=>e.id===id)||{name:id};
const kc=(t,c)=>`<span class="chip ${c||'grey'}">${esc(t)}</span>`;
const ST={'Активно':'green','Не настроен':'grey','Частично заполнено':'lav','Волна 2':'yellow','Черновик':'grey','Опубликовано':'green','Готово':'green','включён':'green','выключен':'grey','активно':'green','активно, ошибка':'orange','идёт прогон':'blue','пауза':'grey','Критичный':'orange','Важный':'yellow','Стандартный пункт':'grey','норма обновлена':'yellow','черновик':'grey','осн. версия':'green','снята':'grey','текст готов':'green','на индексе':'blue'};
const sc=t=>kc(t,ST[t]);
function seed(){ const s=S(); if(s.kb) return;
  s.kb={view:'table',
   src:[['help','Help Center BusinessPad','Инструкции продукта. Пишет администратор BP. Общий на всех тенантах','Админ BP','48 статей','Help','Активно'],
    ['tenant','Help тенанта','Свой help клиента для его пользователей. Пишет редактор тенанта','Редактор тенанта','-','Help','Не настроен'],
    ['reg','Регламенты и правила','Глоссарий, бизнес-правила, этапы «как принято», skills','Агент','12 документов','Magic Pad','Частично заполнено'],
    ['meet','Встречи и суммаризации','Транскрипты и протоколы. Загрузка файлов','Magic Pad','31 файл','Magic Pad','Активно'],
    ['smp','Образцы документов','Эталоны договора, счёта, заявки','-','-','Документы','Не настроен'],
    ['ch','История бесед','Прошлые ответы сотрудников в Magic Pad и на этапах','Magic Pad','-','Magic Pad','Волна 2'],
    ['ext','Внешние базы: Notion, Confluence','Синхронизация папки как источника. Не первая очередь','Внешние базы','-','Интеграции','Волна 2']].map(([id,name,desc,by,mat,use,st])=>({id,name,desc,by,mat,use,st})),
   help:{tree:[['Релиз 15.1',['Чипы хаба','Каталог источников','Magic Pad']],['Релиз 15.0',['Роли и права','Календарь']]],cur:'Чипы хаба'},
   tenant:{ver:3,arts:[['Приёмка на объекте',['Как принять бетон на объекте','Акт расхождений']],['Договоры',['Кто визирует спецификацию']],['Поддержка',['Куда писать']]],cur:'Как принять бетон на объекте',
     text:'Заявку на приёмку создаёт прораб из карточки поставки. Мастер участка видит её в капсуле объекта и начинает приёмку. Срок приёмки бетона 2 часа с момента прибытия миксера на объект.',
     text2:'Если в поставке больше 20 позиций, приёмку делят на две партии; норма 2 часа действует на первую партию.'},
   spaces:[{id:'sp-zdn',name:'Объект ЖК «Заднепровье»',owner:'e-belov',arts:14,role:'автор · публикует',upd:'02.10.2026'},{id:'sp-dog',name:'Договоры',owner:'e-kotova',arts:9,role:'чтение',upd:'28.09.2026'},{id:'sp-ot',name:'Охрана труда',owner:'e-belov',arts:3,role:'владелец',upd:'15.09.2026'}],
   tree:[['Устав объекта','v1'],['Приёмка материалов на объект','v8',1],['Входной контроль','v3',2],['Приёмка бетона','черновик',2],['Складирование на площадке','v2',2],['Возвраты поставщику','',0],['Инвентаризация','',0]],
   art:'Приёмка материалов на объект', roles:[['e-belov','владелец',[1,1,1,1,1]],['e-sokolova','пользователь',[1,1,1,0,1]],['Смена участка №1','группа',[1,0,0,0,0]],['Агент «Норма приёмки»','агент',[1,0,0,0,0]]],
   smp:[{id:'t1',name:'Договор поставки материалов',tags:['договор','РФ'],v:5,st:'осн. версия',by:'e-kotova',d:'28.09.2026'},{id:'t2',name:'Договор подряда',tags:['договор','подряд'],v:3,st:'осн. версия',by:'e-kotova',d:'12.09.2026'},{id:'t3',name:'КП стандарт 15 позиций',tags:['КП'],v:3,st:'осн. версия',by:'e-morozov',d:'15.09.2026'},{id:'t4',name:'Акт приёма-передачи',tags:['акт'],v:2,st:'осн. версия',by:'e-kotova',d:'02.09.2026'},{id:'t5',name:'Договор поставки материалов',tags:['договор','РФ'],v:6,st:'черновик',by:'e-kotova',d:'05.10.2026'}],
   inbox:[{id:'i1',f:'Договор_поставки_СтройМонолит.pdf',src:'API',d:'05.10 11:20',idx:'текст готов',cmp:null},{id:'i2',f:'КП_Бетон-Сервис.docx',src:'Загрузка',d:'05.10 09:04',idx:'текст готов',cmp:'2 критичных'},{id:'i3',f:'Договор_Омега.pdf',src:'API',d:'04.10 18:11',idx:'на индексе',cmp:null}],
   crit:[['Срок поставки указан и не хуже эталона','п. 4.2','Критичный'],['Порядок рекламации','п. 7.1','Важный'],['Язык переписки','п. 11.3','Стандартный пункт']],
   ch:[{id:'c1',name:'Как считать 2 часа приёмки бетона',sec:'Приёмка',by:'e-sokolova',d:'12.09.2026',q:2,norm:'Приёмка материалов на объект v7',upd:1},{id:'c2',name:'Две партии при 20+ позициях',sec:'Приёмка',by:'сотрудник',d:'20.09.2026',q:1,norm:'Приёмка материалов на объект v8'},{id:'c3',name:'Кто визирует спецификацию',sec:'Договоры',by:'e-kotova',d:'28.09.2026',q:3,norm:'Договор поставки материалов v5'}],
   ext:[{id:'x1',name:'Notion Стройка · Регламенты',type:'Notion',st:'активно',last:'05.10 02:14 · 6 мин',next:'06.10 02:00',pages:128,err:'-'},{id:'x2',name:'Confluence ПТО',type:'Confluence',st:'активно, ошибка',last:'04.10 09:30',next:'каждые 6 ч',pages:64,err:'401: проверьте учётную запись'},{id:'x3',name:'Notion База знаний снабжения',type:'Notion',st:'идёт прогон',last:'05.10 13:00',next:'вручную',pages:90,err:'-'},{id:'x4',name:'Confluence Архив',type:'Confluence',st:'пауза',last:'28.09 02:10',next:'-',pages:210,err:'-'}],
   ag:[{id:'a1',name:'Норма приёмки',desc:'Отвечает по регламентам приёмки',on:1,src:['Регламенты','Help тенанта','Встречи'],v:4,d:'05.10',by:'e-belov'},{id:'a2',name:'Помощник по договору',desc:'Сверяет черновик с образцом',on:1,src:['Образцы','Регламенты','Внешние базы'],v:2,d:'28.09',by:'e-belov'},{id:'a3',name:'Агент встреч',desc:'Саммари и поручения',on:1,src:['Встречи','Регламенты'],v:7,d:'01.10',by:'пайплайн'},{id:'a4',name:'Справка продукта',desc:'Отвечает по Help платформы',on:0,src:['Help платформы'],v:1,d:'12.09',by:'e-belov'}],
   pub:{}};
  store.save(); }
const K=()=>{ seed(); return S().kb; };
const crumbs=(...x)=>A().setCrumbs([['База знаний','#/kb'],...x],true);
const TABS=[['src','Все источники'],['ag','Агенты'],['mp','MagicPad'],['help','Помощь']];
const tabs=t=>STAND.seg(TABS,t,'kbtab');
const bindTabs=()=>STAND.bindSeg('kbtab',x=>go(x==='src'?'#/kb':x==='help'?'#/kb/help?tab=help':'#/kb?tab='+x));
const HREF={help:'#/kb/help',tenant:'#/kb/tenant',reg:'#/kb/reg',meet:'#/kb/meet',smp:'#/kb/smp',ch:'#/kb/ch',ext:'#/kb/ext'};
const lh=(t,n,plus,ph)=>`<div class="lh"><h2 class="h3">${t}</h2>${n!=null?`<span class="cnt0">${n}</span>`:''}${plus?`<button class="plus round" id="${plus}" title="Добавить">${I('add','ic16')}</button>`:''}${ph?`<div class="search" style="width:240px;margin-left:auto">${I('search','ic16')}<input class="inp kbq" placeholder="${ph}"></div>`:''}</div>`;
const bindQ=()=>document.querySelectorAll('.kbq').forEach(q=>q.oninput=()=>document.querySelectorAll('.kbrow,.uni tbody tr,.kbcard').forEach(r=>r.hidden=!BP.norm(r.textContent).includes(BP.norm(q.value))));
function page(title,body,o={}){ A().content(`<div class="page">${A().ph(title,{icon:o.icon,after:o.after,extra:o.extra,dots:o.dots})}<div class="paper col fill" style="gap:12px">${body}</div></div>`); bindQ(); }
function rowMenus(list,items){ document.querySelectorAll('.uni tbody tr').forEach((tr,i)=>{ const b=tr.querySelector('td.act .ibtn'); if(!b) return; b.tabIndex=0; b.onclick=e=>{ e.stopPropagation(); A().popMenu(b,items(list[i])); }; }); }
function sideForm(title,body,okT,ok){ document.querySelectorAll('.sp-back,.sidepage').forEach(x=>x.remove());
  const back=document.createElement('div'); back.className='sp-back'; const sp=document.createElement('div'); sp.className='sidepage'; sp.setAttribute('role','dialog');
  sp.innerHTML=`<button class="xbtn sp-x" title="Закрыть">${I('close','ic16')}</button><div class="sph"><h1 class="h1">${esc(title)}</h1></div><div class="paper col spbody" style="gap:12px">${body}</div><div class="spfoot">${okT?`<button class="btn" id="spok">${okT}</button>`:''}<button class="btn out" id="spno" style="margin-left:auto">${okT?'Отмена':'Закрыть'}</button></div>`;
  const close=()=>{ back.remove(); sp.remove(); }; back.onclick=close; sp.querySelector('.sp-x').onclick=sp.querySelector('#spno').onclick=close;
  const o=sp.querySelector('#spok'); o&&(o.onclick=()=>{ if(ok(sp)!==false) close(); }); document.body.append(back,sp); return sp; }
const fld=(l,v,id,ta)=>`<div class="fld"><label>${l}</label>${ta?`<textarea class="ta" id="${id}">${esc(v)}</textarea>`:`<input class="inp" id="${id}" value="${esc(v)}">`}</div>`;
function hl(inp,cnt){ const q=document.getElementById(inp), art=document.getElementById('art'); const orig=art.innerHTML;
  q.oninput=()=>{ const v=q.value.trim(); art.innerHTML=orig; if(!v){ document.getElementById(cnt).textContent=''; return; }
    const re=new RegExp('('+v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'); let n=0; art.querySelectorAll('p').forEach(p=>{ p.innerHTML=p.innerHTML.replace(/(<[^>]+>)|([^<]+)/g,(m,tag,txt)=>tag||txt.replace(re,x=>{ n++; return `<mark>${x}</mark>`; })); });
    document.getElementById(cnt).textContent=n?`${n} вхожд.`:'Не найдено'; }; }
window.KB={seed,K,kc,sc,emp,crumbs,tabs,bindTabs,HREF,lh,bindQ,page,rowMenus,sideForm,fld,hl};
})();
