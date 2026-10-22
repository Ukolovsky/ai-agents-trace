/* v7: Детали встречи, вкладки «Записи» и «Связанные объекты» (Figma «Wiki Черновик» 2560:55637: 2692:168096, 2697:260369, 2724:300773, 2697:261198, 2697:261776, 2710:267436) */
(function(){
const {I,esc,store,chip,route,go,notify} = BP;
const A=()=>window.APP; const S=()=>store.s;
const emp=id=>S().employees.find(e=>e.id===id)||{name:id,pos:''};
function seed(){ const s=S(); if(s.mrec) return;
  s.mrec={'m-plan':[{id:'r1',name:'Планёрка по ЖК «Заднепровье»',dt:'17.08.2026 09:00',org:'e-belov',dur:'28:14',st:'Завершена',tr:'Готово'},{id:'r2',name:'Планёрка: обсуждение графика',dt:'17.08.2026 09:30',org:'e-morozov',dur:'-',st:'В процессе',tr:'-'},{id:'r3',name:'Планёрка: повтор записи',dt:'17.08.2026 09:31',org:'e-morozov',dur:'-',st:'Ошибка',tr:'-'}]};
  s.mobj={'m-plan':[{id:'o1',name:'Проверить документы от СтройМонолит',type:'Задача',resp:'e-morozov',st:'В работе',href:'#/task/t-check-docs'},{id:'o2',name:'Договор поставки № 118-П от 02.06.2026',type:'Документ',resp:'e-kotova',st:'Черновик',href:'#/document/doc-dog-118'},{id:'o3',name:'ООО «СтройМонолит»',type:'Контрагент',resp:'e-kotova',st:'Поставщик',href:'#/counterparty/cp-stroymonolit'}]};
  store.save(); }
const TABS=[['rec','Записи'],['obj','Связанные объекты'],['com','Комментарии'],['doc','Документы'],['ppl','Участники']];
route(/^\/meetings\/(m-[\w-]+)$/, ([id],q)=>{
  seed(); const m=S().meetings.find(x=>x.id===id); if(!m){ go('#/meetings'); return; }
  const t=q.tab||'rec';
  A().setCrumbs([['Центр встреч','#/meetings'],[m.name]],true);
  const ppl=m.people||[]; const files=m.files||[];
  const info=`<div class="mdinfo"><span class="st">${chip(m.status)}</span><div class="meta"><span>Тип:</span><b>Встреча</b><span>Дата:</span><b>${m.date}</b><span>Время:</span><b>${m.from} - ${m.to}</b></div>
   <div>${esc(m.desc||'Обсудить ход работ и ближайшие задачи по объекту.')}</div>
   <div class="grp"><div><span class="cap muted">Участники:</span><span class="avs">${ppl.slice(0,3).map(p=>`<i title="${esc(emp(p).name)}">${esc(emp(p).name.split(' ').map(x=>x[0]).join(''))}</i>`).join('')}${ppl.length>3?`<b>+${ppl.length-3}</b>`:''}</span></div>
   <div><span class="cap muted">Материалы:</span><span>${files.length?files.map(f=>`<span class="file-chip">${BP.PDF}${esc(f)}</span>`).join(' '):'<span class="cap muted">-</span>'}</span></div></div>
   <div class="auth"><span class="org">${I('person','ic16')}${esc(emp(m.org).name)}</span><span class="cap muted">${m.date} в ${m.from}</span></div></div>`;
  let body='';
  const head=(title,n,plus)=>`<div class="lh"><h2 class="h3">${title}</h2>${n?`<span class="cnt0">${n}</span>`:''}<button class="plus round" id="${plus}" title="Добавить">${I('add','ic16')}</button>${n?`<div class="search" style="width:240px;margin-left:auto">${I('search','ic16')}<input class="inp" id="mdq" placeholder="Поиск по встречам"></div>`:''}</div>`;
  const empty=(a,b)=>`<div class="mdempty"><b>${a}</b><span class="cap muted">${b}</span></div>`;
  if(t==='rec'){ const r=S().mrec[id]||[]; body=head('Список записей',r.length,'mdadd')+`<a class="cap" href="#/kb/meet" id="mdkb">Протоколы в базе знаний</a>`+(r.length?CARDS.uni([{t:'Название',f:x=>`<a>${esc(x.name)}</a>`},{t:'Дата и время',f:x=>x.dt},{t:'Организатор',f:x=>`<span class="org">${I('person','ic16')}${esc(emp(x.org).name)}</span>`},{t:'Длительность',f:x=>x.dur},{t:'Статус',f:x=>chip(x.st)},{t:'Транскрипция',f:x=>x.tr}],r,x=>`#/kb/rec/${id}/${x.id}`):empty('Для этой задачи пока нет встреч','Добавьте первую встречу для этой задачи')); }
  else if(t==='obj'){ const r=S().mobj[id]||[]; body=head('Список объектов',r.length,'mdadd')+(r.length?CARDS.uni([{t:'Объект',f:x=>`<a>${esc(x.name)}</a>`},{t:'Тип',f:x=>x.type},{t:'Ответственный',f:x=>`<span class="org">${I('person','ic16')}${esc(emp(x.resp).name)}</span>`},{t:'Статус',f:x=>chip(x.st)}],r,x=>x.href):empty('Для этой задачи пока нет связанных объектов','Добавьте объект для этой встречи')); }
  else if(t==='ppl'){ body=`<div class="lh"><h2 class="h3">Список участников</h2><span class="cnt0">${ppl.length}</span></div>`+CARDS.uni([{t:'ФИО',f:x=>`<a>${esc(x.name)}</a>`},{t:'Должность',f:x=>esc(x.pos)}],ppl.map(emp),x=>'#/employee/'+x.id); }
  else if(t==='doc'){ body=`<div class="lh"><h2 class="h3">Список документов</h2></div>`+(files.length?`<div class="col" style="gap:6px">${files.map(f=>`<span class="file-chip">${BP.PDF}${esc(f)}</span>`).join('')}</div>`:empty('Для этой встречи пока нет документов','Добавьте материалы в карточке встречи')); }
  else body=`<div class="lh"><h2 class="h3">Комментарии</h2></div>`+empty('Комментариев пока нет','Здесь появится обсуждение встречи');
  A().content(`<div class="page">${A().ph(m.name,{dots:0,extra:`<button class="btn orange" id="mdjoin">Подключиться</button>`})}<div class="paper col" style="gap:12px">${info}</div>
   <div class="paper col fill" style="gap:12px">${STAND.seg(TABS,t,'mdtab')}${body}</div></div>`);
  const dots=document.createElement('button'); dots.className='ibtn'; dots.id='mddots'; dots.title='Ещё'; dots.innerHTML=I('more'); document.querySelector('.ph .acts').appendChild(dots);
  dots.onclick=e=>{ e.stopPropagation(); A().popMenu(dots,[['edit','Редактировать встречу',()=>MEET.side(m)]]); };
  STAND.bindSeg('mdtab',x=>go(`#/meetings/${id}?tab=${x}`));
  document.getElementById('mdjoin').onclick=()=>notify(`Подключение: ${esc(m.service)}`,'info');
  const add=document.getElementById('mdadd');
  if(add) add.onclick=e=>{ e.stopPropagation();
    if(t==='rec') notify('Запись начнётся после подключения к встрече','info');
    else { const have=new Set((S().mobj[id]||[]).map(o=>o.href)); const c=[...S().tasks.map(x=>({name:x.name,type:'Задача',href:'#/task/'+x.id,st:'В работе'})),...S().documents.map(x=>({name:x.name,type:'Документ',href:'#/document/'+x.id,st:'Черновик'})),...S().counterparties.map(x=>({name:x.name,type:'Контрагент',href:'#/counterparty/'+x.id,st:'Поставщик'}))].filter(x=>!have.has(x.href)).slice(0,8);
      A().popMenu(add,c.map(x=>[x.type==='Задача'?'task':'doc',x.name,()=>{ (S().mobj[id]=S().mobj[id]||[]).push({id:store.id('o'),resp:m.org,...x}); store.save(); notify('Объект связан со встречей'); BP.render(); }])); } };
  const mdq=document.getElementById('mdq'); mdq&&(mdq.oninput=()=>document.querySelectorAll('.uni tbody tr').forEach(r=>r.hidden=!BP.norm(r.textContent).includes(BP.norm(mdq.value))));
  document.querySelectorAll('.uni tbody tr').forEach((tr,i)=>{ const b=tr.querySelector('td.act .ibtn'); if(!b||(t!=='rec'&&t!=='obj')) return; b.tabIndex=0;
    b.onclick=e=>{ e.stopPropagation(); const list=t==='rec'?S().mrec[id]:S().mobj[id]; const x=list[i];
      A().popMenu(b,t==='rec'?[['doc','Открыть',()=>go(`#/kb/rec/${id}/${x.id}`)],['close','Удалить',()=>{ list.splice(i,1); store.save(); notify('Запись удалена'); BP.render(); }]]:[['doc','Открыть',()=>go(x.href)]]); }; });
  if(q.rec){ const x=(S().mrec[id]||[]).find(r=>r.id===q.rec); x&&setTimeout(()=>recSide(id,x),0); }
});
function recSide(id,x){
  const back=document.createElement('div'); back.className='sp-back'; const sp=document.createElement('div'); sp.className='sidepage'; sp.setAttribute('role','dialog');
  sp.innerHTML=`<button class="xbtn sp-x" title="Закрыть">${I('close','ic16')}</button><div class="sph"><h1 class="h1">${esc(x.name)}</h1></div><div class="paper col spbody"><dl class="dl"><dt>Дата и время</dt><dd>${x.dt}</dd><dt>Организатор</dt><dd>${esc(emp(x.org).name)}</dd><dt>Длительность</dt><dd>${x.dur}</dd><dt>Статус</dt><dd>${chip(x.st)}</dd><dt>Транскрипция</dt><dd>${x.tr}</dd></dl></div><div class="spfoot"><button class="btn out" id="rclose" style="margin-left:auto">Закрыть</button></div>`;
  const close=()=>{ back.remove(); sp.remove(); history.replaceState(null,'',`#/meetings/${id}?tab=rec`); };
  back.onclick=close; sp.querySelector('.sp-x').onclick=sp.querySelector('#rclose').onclick=close; document.body.append(back,sp); }
window.MDET={recSide,seed};
})();
