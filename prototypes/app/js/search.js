/* ИИ поиск: индекс по всем сущностям data.js + созданным в демо, выпадающий список в шапке, страница результатов. */
(function(){
const {I,PDF,esc,money,norm,store,chip,hl,route,go} = BP;
const A=()=>window.APP;
const CATS=[['all','Все'],['documents','Документы'],['instances','Экземпляры процесса'],['processes','Процессы'],['tasks','Задачи'],['counterparties','Контрагенты'],['products','Товары'],['finops','Финансовые операции'],['reports','Отчёты'],['settings','Настройки'],['wiki','Wiki']];
const CATNAME=Object.fromEntries(CATS);
const cpn=id=>(store.cp(id)||{}).name||'';

function index(){
  const s=store.s, out=[];
  const add=(cat,o,title,sub,href,extra='',status,date,amount)=>out.push({cat,id:o.id,title,sub,href,status,date,amount,imported:!!o.imported,o,text:norm([title,sub,extra].join(' '))});
  s.documents.forEach(d=>add('documents',d,d.name,`${d.type} · ${cpn(d.counterparty)}`,'#/document/'+d.id,[d.file,cpn(d.consignee),(d.items||[]).map(i=>i.name).join(' '),(d.fields||[]).map(f=>f.value).join(' ')].join(' '),d.status,d.date,d.amount));
  s.instances.forEach(d=>add('instances',d,d.name,`${store.proc(d.process).name} · ${d.stage}`,'#/instance/'+d.id,cpn(d.counterparty),d.status,d.updated,d.amount));
  s.processes.forEach(d=>add('processes',d,d.name,`${d.type} · владелец ${d.owner}`,'#/process/'+d.id,d.description+' '+d.stages.join(' ')));
  s.tasks.forEach(d=>add('tasks',d,d.name,`Задача · ${d.assignee} · до ${d.due}`,'#/task/'+d.id,cpn(d.counterparty),d.status,d.due));
  s.meetings.forEach(d=>add('tasks',d,d.name,`Встреча · ${d.date} ${d.time}`,'#/task/'+d.id,cpn(d.counterparty),d.status,d.date));
  s.counterparties.forEach(d=>add('counterparties',d,d.name,`ИНН ${d.inn} · ${d.role}`,'#/counterparty/'+d.id,[d.inn,d.kpp,d.address,d.manager].join(' '),d.status,d.since));
  s.products.forEach(d=>add('products',d,d.name,`${d.article} · ${d.group}`,'#/product/'+d.id,cpn(d.supplier)+' '+d.unit,null,null,d.price));
  s.finops.forEach(d=>add('finops',d,d.name,`${cpn(d.counterparty)} · ${d.op}`,'#/finop/'+d.id,'',d.status,d.date,d.amount));
  s.reports.forEach(d=>add('reports',d,d.name,'Отчёт · '+d.updated,'#/report/'+d.id,d.text));
  s.settings.forEach(d=>add('settings',d,d.name,'Настройка · '+d.updated,'#/setting/'+d.id,d.text));
  s.wiki.forEach(d=>add('wiki',d,d.name,'Wiki · '+d.updated,'#/wiki/'+d.id,d.text));
  return out;
}
/* Все слова запроса должны встречаться; вес: совпадение в названии выше. Простая стемминг-подрезка окончаний. */
function find(q){
  const words=norm(q).split(' ').filter(Boolean).map(w=>w.length>5?w.slice(0,-2):w);
  if(!words.length) return [];
  return index().map(e=>{ const t=norm(e.title); let sc=0;
    for(const w of words){ if(t.includes(w)) sc+=t.startsWith(w)||t.includes(' '+w)?3:2; else if(e.text.includes(w)) sc+=1; else return null; }
    return Object.assign({score:sc+(e.imported?0.5:0)},e); }).filter(Boolean).sort((a,b)=>b.score-a.score);
}
function remember(q){ q=q.trim(); if(!q) return; const r=store.s.recent.filter(x=>norm(x)!==norm(q)); r.unshift(q); store.s.recent=r.slice(0,6);
  const res=find(q); if(res.some(e=>e.imported)) store.mark('found'); store.save(); }

/* ---------- Выпадающий список в шапке (макет 978-9757) ---------- */
function bindHeader(inp){
  let act=-1, items=[];
  const close=()=>{ const p=document.getElementById('gpop'); p&&p.remove(); act=-1; };
  const open=()=>{
    close(); const q=inp.value.trim(); const p=document.createElement('div'); p.className='popper'; p.id='gpop';
    p.style.cssText='top:36px;left:0;right:0;max-height:440px;overflow:auto';
    if(!q){ items=store.s.recent.map(r=>({href:'#/search?q='+encodeURIComponent(r),q:r}));
      p.innerHTML=`<div class="ph2">Недавний поиск</div>`+(items.length?items.map((r,i)=>`<div class="mi" data-i="${i}">${I('reset','ic16')}${esc(r.q)}</div>`).join(''):'<div class="ph2">Пусто</div>');
    } else { const res=find(q).slice(0,7); items=res.map(e=>({href:e.href,q}));
      p.innerHTML=(res.length?res.map((e,i)=>`<div class="mi" data-i="${i}" style="flex-direction:column;align-items:flex-start;gap:2px"><span style="max-width:100%;overflow:hidden;text-overflow:ellipsis">${hl(e.title,q)}</span><span class="cap muted">${CATNAME[e.cat]} · ${esc(e.sub)}</span></div>`).join(''):'<div class="ph2">Ничего не найдено</div>')+
        `<div class="foot" data-adv="1">Расширенный поиск${res.length?` · все результаты`:''}</div>`; }
    p.onmousedown=e=>{ e.preventDefault(); const m=e.target.closest('.mi'); if(m){ pick(+m.dataset.i); } else if(e.target.closest('[data-adv]')) adv(); };
    inp.parentNode.appendChild(p);
  };
  const pick=i=>{ const it=items[i]; if(!it) return; remember(it.q); close(); inp.blur(); go(it.href); };
  const adv=()=>{ const q=inp.value.trim(); remember(q); close(); inp.blur(); go('#/search?q='+encodeURIComponent(q)); };
  inp.addEventListener('focus',open); inp.addEventListener('input',open); inp.addEventListener('blur',()=>setTimeout(close,100));
  inp.addEventListener('keydown',e=>{ const ms=[...document.querySelectorAll('#gpop .mi')];
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); act=(act+(e.key==='ArrowDown'?1:-1)+ms.length)%ms.length; ms.forEach((m,i)=>m.classList.toggle('act',i===act)); }
    else if(e.key==='Enter'){ act>=0?pick(act):adv(); } else if(e.key==='Escape'){ close(); inp.blur(); } });
}

/* ---------- Страница поиска ---------- */
route(/^\/search$/, (_,qs)=>{
  const q=qs.q||'', cat=qs.cat||'all';
  A().setCrumbs([['ИИ поиск']]);
  const res=q?find(q):index().filter(e=>cat==='all'||e.cat===cat);
  const by=c=>res.filter(e=>e.cat===c);
  const u=c=>'#/search?'+new URLSearchParams(Object.assign(q?{q}:{}, c==='all'?{}:{cat:c})).toString();
  const left=`<div class="cats">${CATS.map(([k,t])=>`<button class="${cat===k?'on':''}" data-href="${u(k)}"><span>${t}</span><span class="cap muted">${k==='all'?res.length:by(k).length}</span></button>`).join('')}</div>`;
  let main='';
  if(!q && cat==='all'){
    main=`<div class="paper col"><h3 class="h4">Недавний поиск</h3><div class="row" style="flex-wrap:wrap;gap:8px">${store.s.recent.map(r=>`<a class="chip neutral" href="#/search?q=${encodeURIComponent(r)}">${esc(r)}</a>`).join('')||'<span class="muted">Пусто</span>'}</div>
      <span class="muted">Ищите по названию, ИНН, номеру документа, товару. Попробуйте: «СтройМонолит», «Цемент», «118-П», «6730123456».</span></div>`;
  } else if(cat==='all'){
    if(!res.length) main=`<div class="paper empty"><b>По запросу «${esc(q)}» ничего не найдено</b>Проверьте написание или выберите другую категорию</div>`;
    else { const top=by('counterparties')[0]; main=(top&&top.score>=res[0].score-0.5?summary(top.o,q):'')+
      CATS.slice(1).filter(([k])=>by(k).length).map(([k,t])=>`<div class="paper col"><div class="row" style="align-items:center;gap:8px"><h3 class="h4">${t}</h3><span class="counter">${by(k).length}</span>${by(k).length>3?`<a class="btn text" style="margin-left:auto" href="${u(k)}">Показать все</a>`:''}</div>
        <div class="col" style="gap:8px">${by(k).slice(0,3).map(e=>row(e,q)).join('')}</div></div>`).join(''); }
  } else {
    const list=q?by(cat):res;
    main=`<div class="paper flat">${CARDS.uni([{t:'Название',f:e=>hl(e.title,q),tt:e=>e.title},{t:'Описание',w:'34%',f:e=>esc(e.sub),tt:e=>e.sub},{t:'Статус',w:'140px',f:e=>e.status?chip(e.status):'—'},{t:'Дата',w:'100px',f:e=>e.date||'—'},{t:'Сумма',w:'120px',f:e=>e.amount?money(e.amount):'—'}],list,e=>e.href)}</div>`;
  }
  A().content(`<div class="page">${A().ph('ИИ поиск')}
   <div class="search" style="max-width:720px">${I('search')}<input class="inp" id="sq" style="height:40px" placeholder="Что найти? Например, СтройМонолит" value="${esc(q)}" aria-label="Поисковый запрос"></div>
   ${q?`<div class="muted">Найдено ${res.length} по запросу «${esc(q)}»</div>`:''}
   <div class="srch-layout">${left}<div class="col" style="min-width:0">${main}</div></div></div>`);
  const sq=document.getElementById('sq');
  sq.onkeydown=e=>{ if(e.key==='Enter'){ remember(sq.value); go('#/search?'+new URLSearchParams(Object.assign({q:sq.value.trim()}, cat==='all'?{}:{cat}))); } };
  document.querySelectorAll('.cats button').forEach(b=>b.onclick=()=>go(b.dataset.href));
  if(q) remember(q);
});
function row(e,q){ return `<a class="acard" href="${e.href}" style="flex-direction:row;align-items:center;gap:12px;text-decoration:none;color:inherit">${e.cat==='documents'?PDF:''}<div class="col" style="gap:2px;min-width:0;flex:1"><span class="sub1" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${hl(e.title,q)}</span><span class="cap muted">${esc(e.sub)}</span></div>${e.status?chip(e.status):''}${e.amount?`<span>${money(e.amount)}</span>`:''}</a>`; }
/* Сводка по контрагенту (макет 973-9302): KPI, тепловая карта, связанные объекты, лента событий */
function summary(c,q){
  const s=store.s, id=c.id;
  const docs=s.documents.filter(d=>d.counterparty===id||d.consignee===id), inst=s.instances.filter(d=>d.counterparty===id), fo=s.finops.filter(d=>d.counterparty===id), tasks=s.tasks.filter(d=>d.counterparty===id);
  const paid=fo.filter(f=>f.status==='Оплачен').reduce((a,f)=>a+f.amount,0);
  const ev=s.events.filter(e=>e.counterparty===id);
  let seed=[...id].reduce((a,ch)=>a+ch.charCodeAt(0),0);
  const rnd=()=>{ seed=(seed*9301+49297)%233280; return seed/233280; };
  const cells=Array.from({length:364},(_,i)=>{ const r=rnd(); const recent=i>300; return r>(recent?.45:.8)?(r>.93?4:r>.85?3:r>.7?2:1):0; });
  return `<div class="paper col"><div class="row" style="align-items:center;gap:8px"><a class="h3" href="#/counterparty/${id}">${hl(c.name,q)}</a>${chip(c.status)}<span class="muted" style="margin-left:auto">ИНН ${c.inn}</span></div>
   <div class="grid4"><div class="kpi"><span class="muted">Документы</span><span class="v">${docs.length}</span></div><div class="kpi"><span class="muted">Экземпляры процессов</span><span class="v">${inst.length}</span></div><div class="kpi"><span class="muted">Оплачено</span><span class="v">${money(paid)}</span></div><div class="kpi"><span class="muted">Открытые задачи</span><span class="v">${tasks.length}</span></div></div>
   <div class="col" style="gap:8px"><span class="sub1">Активность за год</span><div class="heat" style="grid-auto-flow:column;grid-template-rows:repeat(7,auto);grid-template-columns:none;grid-auto-columns:1fr">${cells.map(l=>`<i class="${l?'l'+l:''}"></i>`).join('')}</div></div>
   ${ev.length?`<div class="col" style="gap:8px"><span class="sub1">Последняя активность</span><div class="tl">${ev.slice(0,4).map(e=>`<div><span>${esc(e.text)}</span><span class="cap muted">${e.date} · ${esc(e.who)}</span></div>`).join('')}</div></div>`:''}</div>`;
}
window.SEARCH={bindHeader,find,remember,index,CATNAME};
})();
