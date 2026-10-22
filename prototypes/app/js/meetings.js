/* Task tracker: «Центр встреч» по Figma (таблица 2333-258282, неделя 2379-273124, side page «Добавить встречу» 2538-64553). */
(function(){
const {I,esc,store,chip,route,go,notify,parseD} = BP;
const A=()=>window.APP; const S=()=>store.s;
const emp=id=>S().employees.find(e=>e.id===id)||{name:id,pos:''};
const WEEK=['17.08.2026','18.08.2026','19.08.2026','20.08.2026','21.08.2026','22.08.2026','23.08.2026'];
const DN=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const H0=8, H1=20, PX=48;
const tmin=t=>{ const [h,m]=t.split(':'); return +h*60+ +m; };
let mode='table';
function people(m){ const p=m.people||[]; return `<span class="avs">${p.slice(0,3).map(id=>`<i title="${esc(emp(id).name)}">${esc(emp(id).name.split(' ').map(x=>x[0]).join(''))}</i>`).join('')}${p.length>3?`<b>+${p.length-3}</b>`:''}</span>`; }
route(/^\/meetings$/, (_,q)=>{
  A().setCrumbs([['Процессы','#/processes'],['Центр встреч']],true);
  if(q.view) mode=q.view;
  const rows=S().meetings.slice().sort((a,b)=>parseD(a.date)-parseD(b.date)||tmin(a.from)-tmin(b.from));
  const top=`<div class="lh"><h2 class="h3">Август 2026</h2><span class="cnt0">${rows.length}</span><button class="plus round" id="madd" title="Добавить встречу">${I('add','ic16')}</button>
   <span class="split-btn" style="margin-left:auto"><button id="mmode">${mode==='week'?'Неделя':'Месяц'}</button><button id="mmode2">${I('drop','ic16')}</button></span>
   <div class="search" style="width:240px">${I('search','ic16')}<input class="inp" id="mq" placeholder="Поиск по встречам"></div></div>`;
  const table=CARDS.uni([
    {t:'Название',f:r=>`<a>${esc(r.name)}</a>`,tt:r=>r.name},{t:'Дата и время',w:'150px',f:r=>`${r.date} ${r.from}`},
    {t:'Организатор',w:'190px',f:r=>`<span class="org">${I('person','ic16')}${esc(emp(r.org).name)}</span>`},{t:'Участники',w:'130px',f:people},
    {t:'Сервис встречи',w:'170px',f:r=>`<span class="cap">${esc(r.service)}</span>`},{t:'Статус',w:'130px',f:r=>chip(r.status)},{t:'Транскрипция',w:'130px',f:r=>r.tr?'Готова':'—'}],
    rows, r=>'#/meetings/'+r.id);
  const week=`<div class="week"><div class="wh"><span>Время</span>${WEEK.map((d,i)=>`<span>${DN[i]}, ${+d.slice(0,2)}</span>`).join('')}</div><div class="wb">
    <div class="wt">${Array.from({length:H1-H0},(_,i)=>`<span style="height:${PX}px">${String(H0+i).padStart(2,'0')}:00</span>`).join('')}</div>
    ${WEEK.map(d=>`<div class="wd" style="height:${(H1-H0)*PX}px">${rows.filter(m=>m.date===d).map(m=>`<a class="ev ${m.status==='Завершена'?'past':''}" href="#/meetings/${m.id}" style="top:${(tmin(m.from)-H0*60)/60*PX}px;height:${Math.max(22,(tmin(m.to)-tmin(m.from))/60*PX-2)}px"><b>${esc(m.name)}</b><span>${m.from} - ${m.to}, ${esc(m.service)}</span></a>`).join('')}${d===S().today?`<i class="now" style="top:${(10.5-H0)*PX}px"></i>`:''}</div>`).join('')}</div></div>`;
  A().content(`<div class="page">${A().ph('Центр встреч',{icon:'cal',filters:mode==='table',dots:1,extra:A().viewSw(mode==='week'?'cards':'table','mt')})}<div class="paper col fill">${top}${mode==='week'?week:table}</div></div>`);
  const sw=()=>go('#/meetings?view='+(mode==='week'?'table':'week'));
  document.getElementById('mmode').onclick=document.getElementById('mmode2').onclick=sw;
  document.querySelector('[data-vsw="mt"]').onclick=sw;
  document.getElementById('madd').onclick=()=>side();
  const mq=document.getElementById('mq'); mq.oninput=()=>document.querySelectorAll('.uni tbody tr,.week .ev').forEach(r=>r.hidden=!BP.norm(r.textContent).includes(BP.norm(mq.value)));
  if(q.open) setTimeout(()=>side(S().meetings.find(m=>m.id===q.open)),0);
  if(q.resume&&window._mdraft){ const d=window._mdraft; history.replaceState(null,'','#/meetings'); setTimeout(()=>side(d.m,{ro:d.ro}),0); }
});
/* view-switch карточки/таблица на этом экране = неделя/таблица */
document.addEventListener('click',e=>{ const m=e.target.closest('[data-vsw-menu="mt"]'); if(m){ e.stopImmediatePropagation(); go('#/meetings?view='+(mode==='week'?'table':'week')); } },true);

function side(m,opt={}){
  document.querySelectorAll('.sp-back,.sidepage').forEach(x=>x.remove());
  const ro=opt.ro!=null?opt.ro:!!m; m=m||{name:'',desc:'',date:'19.08.2026',from:'14:00',to:'15:00',people:[],counterparty:'',rep:'Не повторять',files:[]}; m.files=m.files||[]; m.rep=m.rep||'Не повторять';
  const back=document.createElement('div'); back.className='sp-back'; document.body.appendChild(back);
  const sp=document.createElement('div'); sp.className='sidepage wide'; sp.setAttribute('role','dialog'); sp.setAttribute('aria-label',ro?'Встреча':'Добавить встречу');
  const opts=[['','Выберите объект'],...S().counterparties.map(c=>['cp:'+c.id,c.name]),...S().documents.map(d=>['doc:'+d.id,d.name])];
  let sel=new Set(m.people);
  const draw=()=>{ sp.innerHTML=`<button class="xbtn sp-x" title="Закрыть">${I('close','ic16')}</button><div class="sph"><h1 class="h1">${ro?esc(m.name):'Добавить встречу'}</h1><button class="ibtn" title="Развернуть">${I('expand','ic16')}</button></div>
   <div class="paper col spbody">
    <h3 class="h3">Общая информация</h3>
    <div class="fld"><label>Название</label><input class="inp" id="mn" value="${esc(m.name)}" maxlength="100"><span class="cnt" id="mnc">${m.name.length}/100</span></div>
    <div class="fld"><label>Описание</label><textarea class="ta" id="md" maxlength="250">${esc(m.desc||'')}</textarea><span class="cnt">0/250</span></div>
    <h3 class="h3">Дата и время</h3>
    <div class="fld"><label>Дата</label><input class="inp" id="mdt" value="${m.date}"></div>
    <div class="row" style="align-items:flex-end;gap:12px"><div class="fld grow"><label>Время с</label><input class="inp" id="mf" value="${m.from}"></div><span style="padding-bottom:8px">-</span><div class="fld grow"><label>Время по</label><input class="inp" id="mt" value="${m.to}"></div></div>
    <div class="fld"><label>Часовой пояс</label><select class="sel"><option>(UTC+3) Москва</option></select></div>
    <div class="fld"><label>Повторение</label><select class="sel" id="mrep">${reps(m.date).map(r=>`<option ${r===m.rep?'selected':''}>${r}</option>`).join('')}</select></div>
    <h3 class="h3">Дополнительная информация</h3>
    <div class="fld"><label>Участники</label><div class="pbox"><span>Участников: <b>${sel.size}</b></span><button class="btn pri out s" id="mpadd">${sel.size?'Изменить':'Добавить'}</button></div>
      ${sel.size?`<div class="cap muted">${[...sel].map(id=>esc(emp(id).name)).join(', ')}</div>`:''}</div>
    <div class="fld"><label>Связанный объект</label><select class="sel" id="mo">${opts.map(([v,t])=>`<option value="${v}" ${v==='cp:'+m.counterparty?'selected':''}>${esc(t)}</option>`).join('')}</select></div>
    <div class="row" style="align-items:center;gap:12px"><h3 class="h3">Материалы</h3><button class="plus round" id="mfile" title="Добавить материал">${I('add','ic16')}</button></div>
    ${m.files.length?`<div class="col" style="gap:6px">${m.files.map((f,i)=>`<div class="srcbox"><span class="file-chip">${BP.PDF}${esc(f)}</span><button class="ibtn s" data-rmf="${i}" title="Удалить">${I('close','ic16')}</button></div>`).join('')}</div>`:''}
   </div><div class="spfoot"><button class="btn" id="msave">${ro?'Сохранить':'Добавить'}</button><button class="btn out" id="mclose" style="margin-left:auto">Закрыть</button></div>`;
    const q=s=>sp.querySelector(s);
    q('#mn').oninput=e=>{ m.name=e.target.value; q('#mnc').textContent=m.name.length+'/100'; q('#mn').classList.remove('err'); };
    q('#mpadd').onclick=()=>{ keep(); m.people=[...sel]; window._mdraft={m,ro}; close(true); go('#/meetings/participants'); };
    q('#mfile').onclick=e=>{ e.stopPropagation(); keep(); APP.popMenu(q('#mfile'),S().demoFiles.map(f=>['doc',f.name,()=>{ if(!m.files.includes(f.name)) m.files.push(f.name); draw(); }])); };
    sp.querySelectorAll('[data-rmf]').forEach(b=>b.onclick=()=>{ keep(); m.files.splice(+b.dataset.rmf,1); draw(); });
    q('.sp-x').onclick=q('#mclose').onclick=close;
    q('#msave').onclick=save;
  };
  const keep=()=>{ const q=s=>sp.querySelector(s); m.name=q('#mn').value; m.desc=q('#md').value; m.date=q('#mdt').value; m.from=q('#mf').value; m.to=q('#mt').value; const o=q('#mo').value; m.counterparty=o.startsWith('cp:')?o.slice(3):''; m.obj=o; m.rep=q('#mrep').value; };
  function close(keepDraft){ back.remove(); sp.remove(); if(keepDraft!==true) window._mdraft=null; if(ro&&keepDraft!==true) history.replaceState(null,'','#/meetings'+(mode==='week'?'?view=week':'')); }
  function save(){ keep(); if(!m.name.trim()){ sp.querySelector('#mn').classList.add('err'); notify('Заполните название встречи','error'); return; }
    m.people=[...sel];
    if(!ro){ const nm={id:store.id('m'),name:m.name.trim(),desc:m.desc,rep:m.rep,files:m.files,date:m.date,from:m.from,to:m.to,org:'e-morozov',people:m.people.length?m.people:['e-morozov'],service:'Яндекс Телемост',status:'Предстоящая',tr:false,counterparty:m.counterparty||null,isNew:true};
      S().meetings.push(nm); if(nm.counterparty) S().events.unshift({date:S().today,who:'Центр встреч',text:`Назначена встреча «${nm.name}» на ${nm.date} ${nm.from}`,counterparty:nm.counterparty});
      store.save(); store.mark('meeting'); window.SEARCH&&SEARCH.reindex&&SEARCH.reindex(); close(); notify('Встреча добавлена'); BP.render(); }
    else { const t=S().meetings.find(x=>x.id===m.id); Object.assign(t,{rep:m.rep,files:m.files,name:m.name,desc:m.desc,date:m.date,from:m.from,to:m.to,people:m.people,counterparty:m.counterparty||null}); store.save(); close(); notify('Изменения сохранены'); BP.render(); } }
  back.onclick=close; draw(); document.body.appendChild(sp); setTimeout(()=>{ const n=sp.querySelector('#mn'); n&&!ro&&n.focus(); },50);
}
const WD=['воскресеньям','понедельникам','вторникам','средам','четвергам','пятницам','субботам'], WD2=['воскресенье','понедельник','вторник','среду','четверг','пятницу','субботу'], N=['первый','второй','третий','четвёртый','последний'], MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function reps(ds){ const d=parseD(ds); if(isNaN(d)) return ['Не повторять','Каждый день']; const w=d.getDay(), k=Math.min(4,Math.floor((d.getDate()-1)/7));
  return ['Не повторять','Каждый день',`Еженедельно по ${WD[w]}`,`Ежемесячно в ${(w===0?['первое','второе','третье','четвёртое','последнее']:[3,5,6].includes(w)?['первую','вторую','третью','четвёртую','последнюю']:['первый','второй','третий','четвёртый','последний'])[k]} ${WD2[w]}`,`Ежегодно ${d.getDate()} ${MON[d.getMonth()]}`,'Каждый будний день (с понедельника по пятницу)']; }
/* «Добавить участников» (2715-286083, 3100-199308): сегменты Все/Добавленные/Выбранные/Не выбранные, «Изменений», Сохранить/Отменить */
route(/^\/meetings\/participants$/, (_,q)=>{
  const d=window._mdraft; if(!d){ go('#/meetings'); return; }
  A().setCrumbs([['Центр встреч','#/meetings'],['Добавить участников']],true);
  d.pick=d.pick||new Set(d.m.people); const f=q.f||'all'; const orig=new Set(d.m.people);
  const changes=[...d.pick].filter(x=>!orig.has(x)).length+[...orig].filter(x=>!d.pick.has(x)).length;
  const all=S().employees; const list=all.filter(e=>f==='all'||(f==='added'?orig.has(e.id):f==='sel'?d.pick.has(e.id):!d.pick.has(e.id)));
  const back=()=>{ d.pick=null; go('#/meetings?resume=1'); };
  WP.wpage('Добавить участников',`<div class="paper col" style="flex:1;min-height:0">${STAND.seg([['all','Все'],['added','Добавленные'],['sel','Выбранные'],['not','Не выбранные']],f,'pseg')}
   <div class="lh"><h2 class="h3">Список участников</h2><span class="cnt0">${d.pick.size?d.pick.size+' из '+all.length:all.length}</span><div class="search" style="width:240px;margin-left:auto">${I('search','ic16')}<input class="inp" id="pq" placeholder="Поиск по участникам"></div></div>
   ${CARDS.uni([{t:'ФИО',f:r=>`<a>${esc(r.name)}</a>`},{t:'Должность',f:r=>esc(r.pos)},{t:'Состояние',w:'150px',f:r=>orig.has(r.id)?'<span class="chip grey">Добавлен</span>':'-'}],list,()=>'#/meetings/participants?f='+f,{cb:1})}</div>`,
   `<span style="flex:1"></span><span class="cap muted">Изменений:</span><span class="counter">${changes}</span><button class="btn" id="psave" ${changes?'':'disabled'}>Сохранить</button><button class="btn out" id="pcancel">Отменить</button>`,{close:back});
  document.querySelectorAll('tbody tr').forEach((tr,i)=>{ const e=list[i]; const cb=tr.querySelector('.chk'); cb.checked=d.pick.has(e.id); cb.dataset.e=e.id; tr.dataset.href='#/meetings/participants?f='+f;
    const t=()=>{ d.pick.has(e.id)?d.pick.delete(e.id):d.pick.add(e.id); BP.render(); }; cb.onclick=ev=>{ ev.stopPropagation(); t(); }; tr.onclick=ev=>{ ev.stopPropagation(); t(); }; });
  STAND.bindSeg('pseg',x=>go('#/meetings/participants?f='+x));
  const pq=document.getElementById('pq'); pq.oninput=()=>document.querySelectorAll('tbody tr').forEach(r=>r.hidden=!BP.norm(r.textContent).includes(BP.norm(pq.value)));
  document.getElementById('pcancel').onclick=back;
  document.getElementById('psave').onclick=()=>{ d.m.people=[...d.pick]; d.pick=null; store.mark('tt-people'); notify('Участники добавлены'); go('#/meetings?resume=1'); };
});
window.MEET={side};
})();
