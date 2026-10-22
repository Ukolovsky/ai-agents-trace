/* v7: «13. Помощник с договорами» (экспорт figma-export/13-contracts):
   U0 «Документы сделки № 5695» + меню ⋮; U0-template «Добавить эталон» (шаг «Общие данные»); U1 «Импорт документа» (шаг «Файл»).
   Шаги без макетов («Условия проверки», «Процесс», «Проверка данных», сравнения, просмотр, «Эталоны компании») сделаны минимально. */
(function(){
const {I,esc,store,route,go,notify,PDF} = BP;
const A=()=>window.APP; const S=()=>store.s;
const DID='in-deal-5695';
const PROCS=[['Договор поставки',95],['Договор оказания услуг',36],['Счёт на оплату',13]];
function seed(){ const s=S(); if(s.ddocs) return;
  s.ddocs=[['d1','Договор поставки № 118-П 02.06.2026','Договор','01 Договор 118-П — файл из AI-04'],['d2','Договор поставки № 118-П 05.06.2026','Договор','02 Договор 118-П — контрпредложение 05.06.2026'],['d3','Коммерческое предложение № КП-118','Коммерческое предложение','КП-118'],['d4','Заявка на поставку № З-42','Заявка на поставку','Заявка-З-42'],['d5','Счёт на оплату № СЧ-0156','Счёт','Счёт СЧ-0156'],['d6','Товарная накладная № ТН-0842','Товарная накладная','Товарная накладная ТН-0842'],['d7','Универсальный передаточный документ № УПД-0842','УПД','УПД-0842'],['d8','Акт приёма-передачи № АП-0842','Акт приёма-передачи','Акт приёма-передачи АП-0842']].map(([id,name,type,file])=>({id,name,type,file}));
  s.etalons=[];
  store.save(); }
const fchip=f=>`<span class="file-chip">${PDF}${esc(f)}</span>`;
const crumbs=last=>A().setCrumbs([['Сделка № 5695','#/instance/'+DID],['Документы сделки № 5695','#/deal/'+DID+'/docs'],...(last?[[last]]:[])],true);
/* ---------- U0 ---------- */
route(/^\/deal\/([\w-]+)\/docs$/, ()=>{
  seed(); A().setCrumbs([['Сделка № 5695','#/instance/'+DID],['Документы сделки № 5695']],true);
  const r=S().ddocs;
  A().content(`<div class="page">${A().ph('Документы сделки № 5695',{filters:1})}<div class="paper col fill">
   <div class="lh"><h2 class="h3">Список документов</h2><span class="cnt0">${r.length}</span><button class="plus round" id="dadd" title="Импорт документа">${I('add','ic16')}</button>
    <button class="btn pri out s" id="detal" style="margin-left:auto">Эталоны компании</button><div class="search" style="width:240px">${I('search','ic16')}<input class="inp" id="dq" placeholder="Поиск по документам"></div></div>
   ${CARDS.uni([{t:'Документ',f:x=>`<a>${esc(x.name)}</a>`},{t:'Тип',w:'28%',f:x=>esc(x.type)},{t:'Файл',w:'28%',f:x=>fchip(x.file)}],r,x=>`#/deal/${DID}/docs?view=${x.id}`)}</div></div>`);
  document.getElementById('dadd').onclick=()=>go('#/contracts/import');
  document.getElementById('detal').onclick=()=>go('#/kb/smp');
  const dq=document.getElementById('dq'); dq.oninput=()=>document.querySelectorAll('.uni tbody tr').forEach(t=>t.hidden=!BP.norm(t.textContent).includes(BP.norm(dq.value)));
  document.querySelectorAll('.uni tbody tr').forEach((tr,i)=>{ const x=r[i]; const b=tr.querySelector('td.act .ibtn'); b.tabIndex=0; b.dataset.doc=x.id;
    b.onclick=e=>{ e.stopPropagation(); A().popMenu(b,[['doc','Посмотреть',()=>view(x)],['table','Сравнить с эталоном',()=>cmpEtalon(x)],['add','Создать эталон из файла',()=>go('#/contracts/etalon?doc='+x.id)],['link','Сравнить с другим договором',()=>cmpOther(x)]]); }; });
  const v=BP.parseHash().query.view; if(v){ const x=r.find(d=>d.id===v); x&&setTimeout(()=>view(x),0); }
});
function side(title,body,onClose){
  document.querySelectorAll('.sp-back,.sidepage').forEach(x=>x.remove());
  const back=document.createElement('div'); back.className='sp-back'; const sp=document.createElement('div'); sp.className='sidepage'; sp.setAttribute('role','dialog');
  sp.innerHTML=`<button class="xbtn sp-x" title="Закрыть">${I('close','ic16')}</button><div class="sph"><h1 class="h1">${esc(title)}</h1></div><div class="paper col spbody">${body}</div><div class="spfoot"><button class="btn out" id="spclose" style="margin-left:auto">Закрыть</button></div>`;
  const close=()=>{ back.remove(); sp.remove(); onClose&&onClose(); }; back.onclick=close; sp.querySelector('.sp-x').onclick=sp.querySelector('#spclose').onclick=close; document.body.append(back,sp); return sp; }
const clearQ=()=>history.replaceState(null,'','#/deal/'+DID+'/docs');
function view(x){ history.replaceState(null,'',`#/deal/${DID}/docs?view=${x.id}`);
  side(x.name,`<dl class="dl"><dt>Тип</dt><dd>${esc(x.type)}</dd><dt>Сделка</dt><dd>Сделка № 5695</dd><dt>Контрагент</dt><dd>ООО «СтройМонолит»</dd><dt>Файл</dt><dd>${fchip(x.file)}</dd></dl>`,clearQ); }
function cmpEtalon(x){ const e=S().etalons; if(!e.length){ notify('Эталонов пока нет. Создайте эталон из файла','info'); return; }
  const et=e[0]; side('Сравнение с эталоном',`<div class="cap muted">${esc(x.name)} и эталон «${esc(et.name)}»</div>${diff(x.id===et.doc)}`); }
function cmpOther(x){ const others=S().ddocs.filter(d=>d.type==='Договор'&&d.id!==x.id);
  if(!others.length){ notify('В сделке нет других договоров для сравнения','info'); return; }
  side('Сравнение договоров',`<div class="fld"><label>Сравнить с</label><select class="sel" id="cmpwith">${others.map(o=>`<option>${esc(o.name)}</option>`).join('')}</select></div>${diff(false)}`); }
function diff(same){ const rows=[['Сумма','1 840 000 ₽',same?'1 840 000 ₽':'1 795 000 ₽'],['Срок поставки','до 30.06.2026',same?'до 30.06.2026':'до 15.07.2026'],['Неустойка','0,1% в день','0,1% в день'],['Оплата','30% аванс',same?'30% аванс':'20% аванс']];
  return `<table class="uni"><thead><tr><th>Условие</th><th>Документ</th><th>Сравнение</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[1]===r[2]?r[2]:`<b style="color:var(--red,#d32f2f)">${r[2]}</b>`}</td></tr>`).join('')}</tbody></table><div class="cap muted">Расхождений: ${rows.filter(r=>r[1]!==r[2]).length}</div>`; }
/* ---------- Эталоны компании (без макета) ---------- */
route(/^\/contracts\/etalons$/, ()=>{ seed(); crumbs('Эталоны компании'); const r=S().etalons;
  A().content(`<div class="page">${A().ph('Эталоны компании',{counter:r.length})}<div class="paper col fill">${r.length?CARDS.uni([{t:'Название',f:x=>esc(x.name)},{t:'Процесс',f:x=>esc(x.proc)},{t:'Создан',w:'140px',f:x=>x.date}],r,()=>'#/contracts/etalons'):'<div class="mdempty"><b>Эталонов пока нет</b><span class="cap muted">Создайте эталон из договора в документах сделки</span></div>'}</div></div>`); });
/* ---------- общие поля ---------- */
const ring=p=>`<span class="pring" style="--p:${p}"><b>${p}%</b></span>`;
function procSel(cur){ const p=PROCS.find(x=>x[0]===cur)||PROCS[0];
  return `<div class="fld"><label>Процесс</label><div class="row" style="gap:8px;align-items:center"><button class="sel pselbtn" id="psel" type="button"><span>${esc(p[0])}</span>${I('drop','ic16')}</button>${ring(p[1])}</div></div>`; }
function bindProc(get,set){ const b=document.getElementById('psel'); if(!b) return; b.onclick=e=>{ e.stopPropagation(); const old=document.querySelector('.pdrop'); if(old){ old.remove(); return; }
  const d=document.createElement('div'); d.className='popper pdrop'; d.innerHTML=PROCS.map(([n,p])=>`<div class="mi ${n===get()?'act':''}" data-n="${esc(n)}"><span style="flex:1">${esc(n)}</span><span class="cap muted">${p}%</span></div>`).join('');
  const r=b.getBoundingClientRect(); Object.assign(d.style,{position:'fixed',top:r.bottom+4+'px',left:r.left+'px',width:r.width+'px'}); document.body.appendChild(d);
  d.onclick=ev=>{ const m=ev.target.closest('.mi'); if(m){ set(m.dataset.n); d.remove(); BP.render(); } };
  setTimeout(()=>document.addEventListener('click',()=>d.remove(),{once:true}),0); }; }
const drop=()=>`<div class="fld"><label>Документ</label><button class="dropz" id="dz" type="button"><span class="cap muted">Нажмите или перетащите файлы сюда</span>${I('upload','ic16')}</button></div>`;
/* ---------- U0-template: Добавить эталон ---------- */
const TS=['Общие данные','Условия проверки'];
route(/^\/contracts\/etalon$/, (_,q)=>{
  seed(); const s=S(); if(!s.et||s.et.src!==(q.doc||'')) s.et={src:q.doc||'',step:0,doc:q.doc||'',proc:'Договор поставки',conds:[1,1,1,0]};
  const st=s.et; const doc=s.ddocs.find(d=>d.id===st.doc); crumbs('Добавить эталон');
  const nm=doc?doc.name:''; const ds=doc?`Условия проверки на основе ${doc.name.replace(/ (\d\d\.\d\d\.\d{4})$/,' - $1')}.`:'';
  const COND=['Сумма и порядок оплаты','Сроки поставки','Неустойка и штрафы','Реквизиты сторон'];
  const body=st.step===0?`<div class="paper col" style="gap:12px;flex:1"><h2 class="h3">Общие данные</h2><div class="col" style="gap:12px;max-width:520px">
     ${doc?`<div class="fld"><label>Документ</label><div class="fmini">${PDF}<span><b>${esc(doc.file.slice(0,12))}…</b><span class="cap muted">.docx</span></span><button class="ibtn s" id="fmenu" title="Ещё">${I('more','ic16')}</button></div></div>
     <div class="infob">${I('info','ic16')}<span>Файл выбран из документов сделки. Создаётся отдельный эталон; исходный договор не изменится.</span></div>`:drop()}
     <div class="fld"><label>Название</label><input class="inp" id="etn" maxlength="100" value="${esc(st.name!=null?st.name:nm)}"><span class="cnt" id="etnc">${(st.name!=null?st.name:nm).length}/100</span></div>
     <div class="fld"><label>Описание</label><textarea class="ta" id="etd" maxlength="250">${esc(st.desc!=null?st.desc:ds)}</textarea><span class="cnt">${(st.desc!=null?st.desc:ds).length}/250</span></div>
     ${procSel(st.proc)}</div></div>`
   :`<div class="paper col" style="gap:12px;flex:1"><h2 class="h3">Условия проверки</h2><div class="cap muted">Отметьте условия, которые Феликс будет сверять с эталоном</div>
     ${COND.map((c,i)=>`<label class="row" style="gap:8px;align-items:center"><input type="checkbox" class="chk" data-c="${i}" ${st.conds[i]?'checked':''}>${c}</label>`).join('')}</div>`;
  WP.wpage('Добавить эталон',body,`${WP.steps(TS,st.step)}<span style="flex:1"></span>${st.step?`<button class="btn out" id="etback">Назад</button><button class="btn" id="etok">Создать эталон</button>`:`<button class="btn" id="etnext" ${doc?'':'disabled'}>Далее</button>`}<button class="btn out" id="etcancel">Отменить</button>`,{close:()=>{ s.et=null; store.save(); go('#/deal/'+DID+'/docs'); }});
  const keep=()=>{ const n=document.getElementById('etn'); if(n){ st.name=n.value; st.desc=document.getElementById('etd').value; } store.save(); };
  const n=document.getElementById('etn'); n&&(n.oninput=()=>{ document.getElementById('etnc').textContent=n.value.length+'/100'; n.classList.remove('err'); });
  bindProc(()=>st.proc,v=>{ keep(); st.proc=v; });
  const dz=document.getElementById('dz'); dz&&(dz.onclick=e=>{ e.stopPropagation(); A().popMenu(dz,s.ddocs.filter(d=>d.type==='Договор').map(d=>['doc',d.file,()=>{ keep(); st.doc=d.id; st.name=null; st.desc=null; store.save(); BP.render(); }])); });
  const fm=document.getElementById('fmenu'); fm&&(fm.onclick=e=>{ e.stopPropagation(); A().popMenu(fm,[['close','Убрать файл',()=>{ keep(); st.doc=''; st.name=null; st.desc=null; store.save(); BP.render(); }]]); });
  document.querySelectorAll('[data-c]').forEach(c=>c.onchange=()=>{ st.conds[+c.dataset.c]=c.checked?1:0; store.save(); });
  document.getElementById('etcancel').onclick=document.getElementById('wx').onclick;
  const nx=document.getElementById('etnext'); nx&&(nx.onclick=()=>{ keep(); if(!st.name.trim()){ document.getElementById('etn').classList.add('err'); notify('Заполните название эталона','error'); return; } st.step=1; store.save(); BP.render(); });
  const bk=document.getElementById('etback'); bk&&(bk.onclick=()=>{ st.step=0; store.save(); BP.render(); });
  const ok=document.getElementById('etok'); ok&&(ok.onclick=()=>{ s.etalons.unshift({id:store.id('et'),name:st.name,proc:st.proc,doc:st.doc,date:s.today}); s.et=null; store.save(); store.mark('etalon'); notify('Эталон создан'); go('#/deal/'+DID+'/docs'); });
});
/* ---------- U1: Импорт документа ---------- */
const IS=['Файл','Процесс','Проверка данных'];
route(/^\/contracts\/import$/, ()=>{
  seed(); const s=S(); if(!s.ci) s.ci={step:0,file:'',proc:'Договор поставки'}; const st=s.ci; crumbs('Импорт документа');
  const FILES=['Договор 118-П — файл из AI-04','Договор поставки № 121-П (СтройМонолит)'];
  let body;
  if(st.step===0) body=`<div class="paper col" style="gap:12px;flex:1"><h2 class="h3">Загрузите файл</h2><div class="col" style="gap:12px;max-width:520px">
     ${st.file?`<div class="fld"><label>Документ</label><div class="fwide"><div class="row" style="gap:6px;align-items:center">${PDF}<span style="flex:1">${esc(st.file)}</span><button class="ibtn s" id="fmenu" title="Ещё">${I('more','ic16')}</button></div><span class="cap">Файл добавлен. Можно перейти к обработке.</span></div></div>${procSel(st.proc)}`:drop()}</div></div>`;
  else if(st.step===1) body=`<div class="paper col" style="gap:12px;flex:1"><h2 class="h3">Процесс</h2><div class="cap muted">Феликс подобрал процесс по содержимому файла</div>
     <div class="col" style="gap:8px;max-width:520px">${PROCS.map(([n,p])=>`<label class="srcbox row" style="gap:8px;align-items:center"><input type="radio" name="ciproc" value="${esc(n)}" ${n===st.proc?'checked':''}><span style="flex:1">${esc(n)}</span>${ring(p)}</label>`).join('')}</div></div>`;
  else body=`<div class="paper col" style="gap:12px;flex:1"><h2 class="h3">Проверка данных</h2><div class="cap muted">Проверьте распознанные реквизиты перед импортом</div>
     <table class="uni" style="max-width:720px"><thead><tr><th>Поле</th><th>Значение</th></tr></thead><tbody>${[['Тип','Договор поставки'],['Номер','118-П'],['Дата','02.06.2026'],['Заказчик','ООО «ГК Стройка»'],['Поставщик','ООО «СтройМонолит»'],['Сумма','1 840 000 ₽'],['Срок поставки','до 30.06.2026']].map(r=>`<tr><td>${r[0]}</td><td><input class="inp" value="${esc(r[1])}"></td></tr>`).join('')}</tbody></table></div>`;
  const btn=st.step===0?`<button class="btn" id="cinext" ${st.file?'':'disabled'}>Обработать файл</button>`:st.step===1?`<button class="btn out" id="ciback">Назад</button><button class="btn" id="cinext">Далее</button>`:`<button class="btn out" id="ciback">Назад</button><button class="btn" id="cinext">Импортировать</button>`;
  WP.wpage('Импорт документа',body,`${WP.steps(IS,st.step)}<span style="flex:1"></span>${btn}<button class="btn out" id="cicancel">Отменить</button>`,{close:()=>{ s.ci=null; store.save(); go('#/deal/'+DID+'/docs'); }});
  document.getElementById('cicancel').onclick=document.getElementById('wx').onclick;
  const dz=document.getElementById('dz'); dz&&(dz.onclick=e=>{ e.stopPropagation(); A().popMenu(dz,FILES.map(f=>['doc',f,()=>{ st.file=f; store.save(); BP.render(); }])); });
  const fm=document.getElementById('fmenu'); fm&&(fm.onclick=e=>{ e.stopPropagation(); A().popMenu(fm,[['close','Убрать файл',()=>{ st.file=''; store.save(); BP.render(); }]]); });
  bindProc(()=>st.proc,v=>{ st.proc=v; store.save(); });
  document.querySelectorAll('[name=ciproc]').forEach(r=>r.onchange=()=>{ st.proc=r.value; store.save(); });
  const bk=document.getElementById('ciback'); bk&&(bk.onclick=()=>{ st.step--; store.save(); BP.render(); });
  document.getElementById('cinext').onclick=()=>{ if(st.step<2){ st.step++; store.save(); BP.render(); return; }
    s.ddocs.push({id:store.id('d'),name:'Договор поставки № 118-П 02.06.2026 (импорт)',type:'Договор',file:st.file,isNew:true}); s.ci=null; store.save(); store.mark('cimport'); notify('Документ импортирован в сделку'); go('#/deal/'+DID+'/docs'); };
});
window.CONTRACTS={DID};
})();
