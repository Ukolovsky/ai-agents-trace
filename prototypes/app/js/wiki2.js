/* v7: База знаний: главная (Figma 2560:55637), Help платформы (HP-02), Help тенанта (HT-01/02), Регламенты (REG-00…05) */
(function(){
const {I,esc,store,route,go,notify,PDF} = BP;
const A=()=>window.APP; const S=()=>store.s;
const {K,kc,sc,emp,crumbs,tabs,bindTabs,HREF,lh,bindQ,page,rowMenus,sideForm,fld,hl}=KB;
route(/^\/kb$/, (_,q)=>{
  const k=K(); const t=q.tab||'src'; A().setCrumbs([['База знаний']]);
  if(t==='ag') return KB.agents(); if(t==='mp') return KB.feed();
  const sm=k.src.find(s=>s.id==='smp'); const ne=(S().etalons||[]).length; if(ne&&sm.st==='Не настроен'){ sm.st='Частично заполнено'; sm.mat=ne+' эталон'; }
  const tbl=CARDS.uni([{t:'Раздел',f:x=>`<a>${esc(x.name)}</a>`},{t:'Описание',f:x=>esc(x.desc),tt:x=>x.desc},{t:'Источник',f:x=>esc(x.by)},{t:'Материалы',f:x=>esc(x.mat)},{t:'Используется',f:x=>esc(x.use)},{t:'Статус',f:x=>sc(x.st)}],k.src,x=>HREF[x.id]);
  const cards=`<div class="kbcards">${k.src.map(x=>`<a class="kbcard" href="${HREF[x.id]}"><div class="row"><b>${esc(x.name)}</b><span style="margin-left:auto">${sc(x.st)}</span></div><span class="cap">${esc(x.desc)}</span><div class="row" style="gap:6px">${x.mat!=='-'?`<span class="tagc">${esc(x.mat)}</span>`:''}<span class="tagc">${esc(x.use)}</span></div></a>`).join('')}</div>`;
  const cv=k.view==='cards';
  A().content(`<div class="page">${A().ph('База знаний',{icon:'book',after:cv?`<button class="plus fill" id="kbadd" title="Добавить источник">${I('add','ic16')}</button>`:'',extra:A().viewSw(cv?'cards':'table','kb'),dots:1})}<div class="paper col fill" style="gap:12px">${tabs('src')}
    ${lh('Источники тенанта и платформы',k.src.length,cv?null:'kbadd2','Поиск по всем источникам')}${cv?cards:tbl}</div></div>`); bindQ(); bindTabs();
  document.querySelector('[data-vsw="kb"]').onclick=()=>{ k.view=cv?'table':'cards'; store.save(); BP.render(); };
  const add=()=>sideForm('Добавить источник',`<div class="fld"><label>Источник</label><select class="sel" id="ksrc">${k.src.filter(s=>s.st!=='Активно').map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div><div class="cap muted">Источник станет доступен агентам после первой публикации.</div>`,'Добавить',sp=>{ const s=k.src.find(x=>x.id===sp.querySelector('#ksrc').value); if(s){ s.st='Частично заполнено'; store.save(); notify(`Источник «${s.name}» добавлен`); BP.render(); } });
  ['kbadd','kbadd2'].forEach(id=>{ const b=document.getElementById(id); b&&(b.onclick=add); });
  rowMenus(k.src,x=>[['doc','Открыть',()=>go(HREF[x.id])],['settings','Доступ агентам',()=>go('#/kb?tab=ag')]]);
});
document.addEventListener('click',e=>{ const m=e.target.closest('[data-vsw-menu="kb"]'); if(m){ e.stopImmediatePropagation(); const k=K(); k.view=k.view==='cards'?'table':'cards'; store.save(); BP.render(); } },true);
const HELPTXT={'Чипы хаба':['Чип <b>Help</b> открывает справку продукта в режиме чтения. Справку продукта ведёт администратор BP.','Чип Agents показывает включённых агентов тенанта. Чип Magic Pad открывает диалог по контексту экрана. Чип <b>Help</b> в контексте процесса ведёт в справку компании.'],
 'Каталог источников':['Каталог показывает источники тенанта и платформы: Help, регламенты, встречи, образцы, историю бесед и внешние базы.','Статус источника показывает, готов ли он для агентов.'],'Magic Pad':['Magic Pad отвечает по контексту экрана и цитирует опубликованные версии источников.'],
 'Роли и права':['Базовая роль пространства задаёт обычные возможности по всей базе. Роль на ветке наследуется страницами ниже.'],'Календарь':['Календарь встреч показывает встречи сотрудника и запись. Протокол встречи публикуется в источник «Встречи».']};
route(/^\/kb\/help$/, (_,q)=>{ const k=K(); const h=k.help; if(q.a) h.cur=q.a; crumbs(['Help Center BusinessPad']);
  const body=(HELPTXT[h.cur]||['Статья в подготовке.']).map(p=>`<p>${p}</p>`).join('');
  A().content(`<div class="page">${A().ph('Help Center BusinessPad',{icon:'book',after:kc('чтение')+' '+kc('v12','lav')})}<div class="paper col fill" style="gap:12px">${q.tab==='help'?tabs('help'):''}
   <div class="kbgrid"><div class="kbtree">${h.tree.map(([g,arts])=>`<div class="tg">${esc(g)}</div>${arts.map(a=>`<a class="ti ${a===h.cur?'on':''}" href="#/kb/help?a=${encodeURIComponent(a)}${q.tab?'&tab=help':''}">${esc(a)}</a>`).join('')}`).join('')}</div>
   <div class="kbart"><div class="artsearch">${I('search','ic16')}<input class="inp" id="hq" placeholder="Поиск по справке"><span class="seg mini"><button class="on" data-hs="a">В статье</button><button data-hs="all">Во всей справке</button></span><span class="cap muted" id="hqn"></span></div>
    <h2 class="h2">${esc(h.cur)}</h2><span class="cap muted">Версия v12 · опубликована 28.09.2026 · администратор BP</span><div class="arttext" id="art">${body}</div>
    <div class="kbnote">Справка вашей компании: <a href="#/kb/tenant">Как принять бетон на объекте</a> → открыть Help тенанта</div></div></div></div></div>`);
  bindTabs(); hl('hq','hqn');
  document.querySelectorAll('[data-hs]').forEach(b=>b.onclick=()=>{ document.querySelectorAll('[data-hs]').forEach(x=>x.classList.toggle('on',x===b)); document.getElementById('hq').dispatchEvent(new Event('input')); });
});
route(/^\/kb\/tenant$/, (_,q)=>{ const k=K(), h=k.tenant; crumbs(['Help тенанта']); const ed=!!q.edit; if(q.a&&q.a!==h.cur){ h.cur=q.a; BP.store.save(); }
  const tree=`<div class="kbtree">${ed?`<button class="btn pri out s" id="htnew" style="margin-bottom:8px">${I('add','ic16')}Создать статью</button>`:''}${h.arts.map(([g,a])=>`<div class="tg">${esc(g)}</div>${a.map(x=>`<a class="ti ${x===h.cur?'on':''}" href="#/kb/tenant?a=${encodeURIComponent(x)}${ed?'&edit=1':''}">${esc(x)}</a>`).join('')}`).join('')}</div>`;
  const read=`<div class="kbart"><div class="artsearch">${I('search','ic16')}<input class="inp" id="tq" placeholder="Поиск по справке тенанта"><span class="cap muted" id="tqn"></span></div><h2 class="h2">${esc(h.cur)}</h2>
   <span class="cap muted">Версия v${h.ver} · опубликована 01.10.2026 · автор ${esc(emp('e-sokolova').name)}</span>
   <div class="row" style="gap:8px;flex-wrap:wrap"><span class="cap muted">Связи:</span><a class="tagc" href="#/process/proc-priemka">Процесс «Приёмка товара»</a><a class="tagc" href="#/kb/reg/sp-zdn">Норма «Приёмка материалов» v8</a><a class="tagc" href="#/kb/help">Справка платформы: чипы хаба</a></div>
   <div class="arttext" id="art"><p>${esc(h.text)}</p><p>${esc(h.text2)}</p></div></div>`;
  const edit=`<div class="kbart"><div class="toolbar">${['B','I','H2','Список','Снимок экрана','Ссылка'].map(x=>`<button class="ibtn s tb">${x}</button>`).join('')}<span class="cap muted" style="margin-left:auto">Сохранено ${BP.nowTime()}</span></div>
   <input class="inp h2in" id="htt" value="${esc(h.cur)}"><span class="cap muted">ht-priemka-beton · раздел Приёмка на объекте</span><textarea class="ta" id="htx" style="min-height:160px">${esc(h.text+'\n\n'+h.text2)}</textarea></div>
   <div class="kbprops"><b>Связи</b><span class="cap muted">Процесс</span><span class="tagc">Приёмка товара</span><span class="cap muted">Норма</span><span>Приёмка материалов · Регламенты</span><span class="cap">зафиксировать v8 · текущая</span>
    <div class="kbnote" id="v9">Норма обновлена: вышла v9.<div class="row" style="gap:6px;margin-top:6px"><button class="btn pri out s" id="v9go">Перейти на v9</button><button class="btn out s" id="v9keep">Оставить v8</button></div></div></div>`;
  A().content(`<div class="page">${A().ph('Help тенанта',{icon:'book',after:ed?kc('черновик'):kc('v'+h.ver,'lav'),extra:ed?`<button class="btn out" id="htcancel">Отменить</button><button class="btn" id="htpub">Опубликовать</button>`:`<button class="btn pri out" id="hted">Редактировать</button>`})}<div class="paper col fill"><div class="kbgrid ${ed?'three':''}">${tree}${ed?edit:read}</div></div></div>`);
  if(!ed) hl('tq','tqn'); const $=s=>document.getElementById(s);
  $('hted')&&($('hted').onclick=()=>go('#/kb/tenant?edit=1')); $('htcancel')&&($('htcancel').onclick=()=>go('#/kb/tenant'));
  $('htpub')&&($('htpub').onclick=()=>{ const [a,...b]=$('htx').value.split(/\n\s*\n/); h.text=a; h.text2=b.join(' '); h.cur=$('htt').value; h.ver++; k.src.find(s=>s.id==='tenant').st='Активно'; store.save(); notify(`Статья опубликована, версия v${h.ver}`); go('#/kb/tenant'); });
  $('htnew')&&($('htnew').onclick=()=>notify('Новая статья появится в разделе после сохранения','info'));
  $('v9go')&&($('v9go').onclick=()=>{ $('v9').remove(); notify('Связь переведена на норму v9'); });
  $('v9keep')&&($('v9keep').onclick=()=>$('v9').remove());
});
route(/^\/kb\/reg$/, ()=>{ const k=K(); crumbs(['Регламенты и правила']);
  page('Регламенты и правила',lh('Пространства',k.spaces.length,'regnew','Поиск по пространствам')+CARDS.uni([{t:'Название',f:x=>`<a>${esc(x.name)}</a>`},{t:'Владелец',f:x=>esc(emp(x.owner).name)},{t:'Опубликовано',f:x=>x.arts+' статей'},{t:'Моя роль',f:x=>esc(x.role)},{t:'Обновлено',w:'130px',f:x=>x.upd}],k.spaces,x=>'#/kb/reg/'+x.id),{icon:'book'});
  document.getElementById('regnew').onclick=()=>sideForm('Новый проект',fld('Название проекта','','rgn')+'<span class="cap muted">3–120 символов, уникально в тенанте</span>','Создать',sp=>{ const v=sp.querySelector('#rgn').value.trim(); if(v.length<3){ sp.querySelector('#rgn').classList.add('err'); notify('Название от 3 символов','error'); return false; } k.spaces.push({id:store.id('sp'),name:v,owner:'e-morozov',arts:0,role:'владелец',upd:S().today}); store.save(); notify('Проект создан'); BP.render(); });
  rowMenus(k.spaces,x=>[['doc','Открыть',()=>go('#/kb/reg/'+x.id)],['people','Роли',()=>go('#/kb/reg/'+x.id+'?v=roles')]]);
});
const REGT={'Приёмка материалов на объект':[['1. Область','Норма действует на приёмку материалов на объектах ГК «Стройка» от поставщиков и перевозчиков.'],['2. Сроки','Приёмка бетона занимает 2 часа с момента прибытия миксера на объект. Для поставок свыше 20 позиций допускается приёмка двумя партиями.'],['3. Документы','Товарная накладная сверяется с заявкой; акт расхождений оформляется по форме из «Возвраты поставщику».']],
 'Приёмка бетона':[['','Приёмка начинается после прибытия миксера. Мастер участка проверяет паспорт качества и отбирает пробы.'],['','Расхождения фиксируются актом по форме из раздела «Возвраты поставщику».']]};
route(/^\/kb\/reg\/([\w-]+)$/, ([id],q)=>{ const k=K(); const sp=k.spaces.find(s=>s.id===id); if(!sp) return go('#/kb/reg'); crumbs(['Регламенты и правила','#/kb/reg'],[sp.name]);
  if(q.a) k.art=q.a; const v=q.v||'art'; const a=k.art; const draft=k.tree.some(x=>x[0]===a&&x[1]==='черновик');
  const tree=`<div class="kbtree"><div class="tg">${esc(sp.name)}</div>${k.tree.map(([t,ver,lv])=>`<a class="ti ${t===a?'on':''}" style="padding-left:${8+(lv||0)*12}px" href="#/kb/reg/${id}?a=${encodeURIComponent(t)}">${lv===0?'▸ ':lv===1?'▾ ':''}${esc(t)}${ver?` <span class="cap muted">· ${ver}</span>`:''}</a>`).join('')}</div>`;
  const txt=(k.regt&&k.regt[a])||REGT[a]||[['','Статья в подготовке.']];
  let main, props='';
  if(v==='roles'){ const C=['Читать','Писать','Публиковать','Назначать роли','Выгружать'];
    main=`<div class="kbart"><h2 class="h3">Роли пространства</h2><table class="uni"><thead><tr><th>Участник</th><th>Тип</th>${C.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${k.roles.map((r,i)=>`<tr><td>${esc(emp(r[0]).name)}</td><td>${esc(r[1])}</td>${r[2].map((x,j)=>`<td><input type="checkbox" class="chk" data-r="${i}:${j}" ${x?'checked':''} ${r[1]==='агент'&&j?'disabled':''}></td>`).join('')}</tr>`).join('')}</tbody></table>
     <div class="cap muted">Права применяются к интерфейсу и к MCP при следующем запросе.</div><div class="row" style="gap:8px"><button class="btn" id="rsave">Сохранить</button><button class="btn out" id="radd">Добавить участника</button></div></div>`; }
  else if(v==='prof'){ main=`<div class="kbart"><div class="row" style="gap:12px;align-items:center"><span class="avbig">МС</span><div class="col"><b class="sub1">${esc(emp('e-sokolova').name)}</b><span class="cap muted">автор · публикует · 7 публикаций в «${esc(sp.name)}»</span></div></div>
     <h3 class="h3">Публикации</h3><table class="uni"><thead><tr><th>Статья</th><th>Версия</th><th>Дата</th><th>Комментарий</th></tr></thead><tbody><tr><td>Приёмка бетона</td><td>v7</td><td>26.09.2026</td><td>Уточнены пробы</td></tr><tr><td>Приёмка материалов на объект</td><td>v8</td><td>01.10.2026</td><td>Срок приёмки 2 часа</td></tr><tr><td>Входной контроль</td><td>v3</td><td>12.09.2026</td><td>Форма акта</td></tr></tbody></table>
     <h3 class="h3">Уведомления</h3>${['Комментарий к статье','Запрос на публикацию','Смена роли'].map(x=>`<label class="row" style="gap:8px;align-items:center"><input type="checkbox" class="chk" checked>${x}</label>`).join('')}
     <h3 class="h3">Токен интеграции</h3><span class="cap">wiki.proj.zdn.•••••••• · действует до 01.01.2027</span><div class="row" style="gap:8px"><button class="btn pri out s" id="tkre">Выпустить заново</button><button class="btn out s" id="tkrv">Отозвать</button></div></div>`; }
  else if(v==='edit'){ main=`<div class="kbart"><div class="toolbar">${['H2','H3','Список','Таблица','Цитата процесса','Вложение'].map(x=>`<button class="ibtn s tb">${x}</button>`).join('')}<span class="cap muted" style="margin-left:auto">Сохранено ${BP.nowTime()}</span></div>
     <input class="inp h2in" id="rgt" value="${esc(a)}"><span class="cap muted">Родитель: Приёмка материалов на объект</span><textarea class="ta" id="rgx" style="min-height:180px">${esc(txt.map(x=>x[1]).join('\n\n'))}</textarea><span class="cap">Связь с процессом: <a href="#/process/proc-priemka">Приёмка товара</a> · Вложение: ${PDF} Акт_расхождений.pdf</span></div>`; }
  else { main=`<div class="kbart">${q.find?`<div class="artsearch">${I('search','ic16')}<input class="inp" id="rq" placeholder="Найти в дереве"><span class="cap muted" id="rqn"></span><button class="ibtn s" id="rqx" title="Закрыть поиск">${I('close','ic16')}</button></div>`:''}
     <div class="row" style="align-items:center"><h2 class="h2">${esc(a)}</h2><button class="btn pri out s" id="rged" style="margin-left:auto">Редактировать</button></div>
     <span class="cap muted">${draft?'Черновик · автосохранение 14:41':`Опубликовано v8 · 01.10.2026 · ${esc(emp('e-sokolova').name)} · «Срок приёмки 2 часа»`}</span>
     <div class="arttext" id="art">${txt.map(([h,p])=>`${h?`<h3 class="h3">${h}</h3>`:''}<p>${esc(p)}</p>`).join('')}</div></div>`;
    props=`<div class="kbprops"><b>Свойства</b><span class="cap muted">Состояние</span><span>${draft?'черновик':'v8 опубликована · черновик v9 есть'}</span><span class="cap muted">Процесс</span><a href="#/process/proc-priemka">Приёмка товара</a><span class="cap muted">Вложения</span><span>${PDF} Акт_расхождений.pdf</span><span class="cap muted">Ссылаются</span><span>Help тенанта: 2 · Задачи: 5 · Разборы: 1</span><span class="cap muted">Версии</span><span>v8 · v7 · v6 · …</span></div>`; }
  const acts=v==='edit'?`<button class="btn out" id="rgprev">Предпросмотр</button><button class="btn" id="rgpub">Опубликовать v9</button>`:`<button class="btn out" id="rgfind">Найти в дереве</button><button class="btn pri out" id="rgnew">Новая статья</button>`;
  A().content(`<div class="page">${A().ph(sp.name,{icon:'book',after:kc('проект')+(v==='edit'?' '+kc('черновик'):''),extra:acts+`<button class="ibtn" id="rgdots" title="Ещё">${I('more')}</button>`})}<div class="paper col fill"><div class="kbgrid ${props?'three':''}">${tree}${main}${props}</div></div></div>`);
  const $=s=>document.getElementById(s);
  $('rgdots').onclick=e=>{ e.stopPropagation(); A().popMenu($('rgdots'),[['doc','Статья',()=>go(`#/kb/reg/${id}`)],['people','Роли пространства',()=>go(`#/kb/reg/${id}?v=roles`)],['person','Профиль автора',()=>go(`#/kb/reg/${id}?v=prof`)]]); };
  $('rged')&&($('rged').onclick=()=>go(`#/kb/reg/${id}?v=edit`));
  $('rgnew')&&($('rgnew').onclick=()=>{ if(!k.tree.some(x=>x[0]==='Новая статья')) k.tree.splice(2,0,['Новая статья','черновик',2]); k.art='Новая статья'; store.save(); go(`#/kb/reg/${id}?v=edit`); });
  $('rgfind')&&($('rgfind').onclick=()=>go(`#/kb/reg/${id}?find=1`));
  $('rqx')&&($('rqx').onclick=()=>go(`#/kb/reg/${id}`));
  if($('rq')){ hl('rq','rqn'); $('rq').focus(); }
  $('rgprev')&&($('rgprev').onclick=()=>go(`#/kb/reg/${id}`));
  $('rgpub')&&($('rgpub').onclick=()=>sideForm('Опубликовать v9',`<div class="cap muted">${esc($('rgt').value)} · ${esc(sp.name)}</div>`+fld('Комментарий публикации','Срок приёмки 2 часа','rgc')+'<span class="cap muted">3–500 символов</span>','Опубликовать',f=>{ const c=f.querySelector('#rgc').value.trim(); if(c.length<3){ f.querySelector('#rgc').classList.add('err'); notify('Комментарий от 3 символов','error'); return false; } const t=$('rgt').value; const n=k.tree.find(x=>x[0]===k.art); if(n){ n[0]=t; n[1]='v9'; } k.regt=k.regt||{}; k.regt[t]=$('rgx').value.split(/\n\s*\n/).map(p=>['',p]); k.art=t; store.save(); notify('Опубликовано: v9'); go(`#/kb/reg/${id}`); }));
  document.querySelectorAll('[data-r]').forEach(c=>c.onchange=()=>{ const [i,j]=c.dataset.r.split(':'); k.roles[i][2][j]=c.checked?1:0; });
  $('rsave')&&($('rsave').onclick=()=>{ store.save(); notify('Роли сохранены'); });
  $('radd')&&($('radd').onclick=e=>{ e.stopPropagation(); A().popMenu($('radd'),S().employees.filter(x=>!k.roles.some(r=>r[0]===x.id)).slice(0,6).map(x=>['person',x.name,()=>{ k.roles.push([x.id,'пользователь',[1,0,0,0,0]]); store.save(); BP.render(); }])); });
  $('tkre')&&($('tkre').onclick=()=>notify('Новый токен выпущен и показан один раз','info'));
  $('tkrv')&&($('tkrv').onclick=()=>notify('Токен отозван'));
});
})();
