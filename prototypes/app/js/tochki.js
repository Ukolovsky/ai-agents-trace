/* Точки входа ИИ (стр. «2. Точки входа ИИ»): импорт документа в Wiki через MagicPad (8-103641…8-106279, 71-156*),
   предпросмотр «ДОГОВОР ПОДРЯДА № А-12» с «Переменными инициации» (8-106843), уведомление Феликса о просрочке (8-106877). */
(function(){
const {I,PDF,esc,store,route,go,notify} = BP;
const A=()=>window.APP; const S=()=>store.s; const W=()=>S().wikiDoc;
function card(){ const d=W(); return `<div class="wdoc"><div class="pg"><b>${esc(d.title)}</b><span class="cap">${esc(d.city)} · ${esc(d.date)}</span><span class="cap muted">ООО «Омега» (Заказчик) в лице генерального директора Кузнецова И. П. и ООО «Тау» (Подрядчик) заключили настоящий договор…</span></div>
  <div class="r cap"><span>Тип: договор подряда</span><span>№ А-12</span><span>Сумма 128 000 ₽</span><span>Срок: 01.07.2026</span></div><span class="cap muted">Проверьте распознанные реквизиты перед импортом.</span></div>`; }
function doImport(){ const id='wiki-a12'; if(!S().wiki.some(w=>w.id===id)) S().wiki.unshift({id,name:'Договор подряда № А-12 (реестр договоров подрядчика)',updated:S().today,text:'договор подряда А-12 Омега Тау реестр договоров подрядчика 128000'});
  store.save(); store.mark('wiki-imp'); notify('Документ импортирован в Wiki'); }
window.MPX=window.MPX||{};
MPX.wiki=k=>{
  if(k==='start'){ MP.open(); MP.bot('<span>Помогу импортировать документ в Wiki.</span><span>Добавьте файл в чат и отправьте мне: я определю тип документа, распознаю строки и колонки, а потом предложу открыть результат.</span><span>Поддерживаю Excel, CSV, DOCX и PDF.</span>',[{t:'Договоры_подрядчика.docx',d:'87 КБ · DOCX',a:'attach:file-dogovory'}]); store.mark('wiki-start'); }
  if(k==='recognized'){ MP.bot(`<span>Готово. Распознал документ как <b>реестр договоров с подрядчиками</b>. Нашёл 24 строки в 5 колонках.</span>${card()}`,[{k:'btn',t:'Открыть документ',a:'go:#/wiki-import'},{k:'btn',t:'Импортировать в Wiki',a:'ext:wiki:imp'}]); }
  if(k==='imp'){ MP.useAll(); MP.me('Импортировать в Wiki'); doImport(); MP.bot('<span>Документ «ДОГОВОР ПОДРЯДА № А-12» импортирован в Wiki.</span>',[{t:'Открыть в Wiki',a:'go:#/wiki/wiki-a12'}]); }
};
route(/^\/wiki-import$/, ()=>{
  const d=W(); A().setCrumbs([['Финансы','#/payments'],['Wiki']],true);
  const close=()=>go('#/payments');
  WP.wpage(`Предпросмотр документа «${d.title}»`,`<div class="row" style="flex:1;min-height:0;align-items:stretch"><div class="docview"><div class="torg"><h3>${esc(d.title)}</h3><div class="no">${esc(d.city)} · ${esc(d.date)}</div>
     <p>Общество с ограниченной ответственностью «Омега», именуемое в дальнейшем «Заказчик», в лице генерального директора Кузнецова Ивана Петровича, действующего на основании Устава, с одной стороны, и Общество с ограниченной ответственностью «Тау», именуемое в дальнейшем «Подрядчик», с другой стороны, заключили настоящий Договор о нижеследующем.</p>
     <p><b>1. ПРЕДМЕТ ДОГОВОРА</b></p><p>1.1. Подрядчик обязуется по заданию Заказчика выполнить работы по монтажу кровли на объекте ЖК «Заднепровье», корпус 2, а Заказчик обязуется принять и оплатить их.</p>
     <p><b>2. СТОИМОСТЬ РАБОТ И ПОРЯДОК РАСЧЁТОВ</b></p><p>2.1. Стоимость работ по настоящему Договору составляет 128 000 (сто двадцать восемь тысяч) рублей 00 копеек, НДС не облагается.</p><p>2.2. Заказчик перечисляет аванс в размере 30% от стоимости работ в течение 5 банковских дней с момента подписания Договора.</p>
     <p><b>3. СРОКИ ВЫПОЛНЕНИЯ РАБОТ</b></p><p>3.1. Срок выполнения работ: до 01 июля 2026 года.</p></div></div>
   <div class="rf"><div class="row" style="align-items:center;gap:8px"><button class="xbtn" id="vx" title="Свернуть">${I('close','ic16')}</button><h2 class="h3">Переменные инициации</h2></div><div class="rf-list">${d.vars.map(([l,v],i)=>`<div class="fld"><label>${esc(l)} <span class="chip green">${[99,97,99,95,93,93,98,96][i]}%</span></label><input class="inp" value="${esc(v)}"></div>`).join('')}</div></div></div>`,
   `<span style="flex:1"></span><button class="btn pri out" id="wiact">Действия</button><button class="btn" id="wiimp">Импортировать</button><button class="btn out" id="wicancel">Отменить</button>`,{close});
  document.getElementById('wicancel').onclick=close;
  document.getElementById('vx').onclick=()=>document.querySelector('.rf').remove();
  document.getElementById('wiact').onclick=e=>{ e.stopPropagation(); A().popMenu(e.currentTarget,[['doc','Скачать исходный файл',()=>notify('Файл «Договоры_подрядчика.docx» скачан','info')]]); };
  document.getElementById('wiimp').onclick=()=>{ doImport(); go('#/wiki/wiki-a12'); };
});
/* Уведомление Феликса (8-106877): вызывается из DEMO-оверлея */
function foxNote(){
  document.querySelectorAll('.foxnote').forEach(x=>x.remove()); if(!/^\/payments/.test(BP.parseHash().path)) go('#/payments');
  const late=S().finops.filter(f=>f.status==='Просрочен'); const sum=late.reduce((a,f)=>a+f.amount,0)||254000;
  const n=document.createElement('div'); n.className='foxnote'; n.setAttribute('role','dialog');
  n.innerHTML=`<img src="assets/fox.png" alt=""><div class="card"><button class="ibtn s x" title="Закрыть">${I('close','ic16')}</button><b>${late.length||1} платёж просрочен на ${BP.money(sum)}</b><span class="cap">Согласуйте сегодня, чтобы избежать пеней. Самый старый: ${esc(CARDS.cpName((late[0]||{}).counterparty)||'ООО «Омега»')}, «${esc((late[0]||{}).name||'Покупка бумаги')}».</span><div class="row" style="gap:8px"><button class="btn pri out s" data-f="later">Позже</button><button class="btn s" data-f="go">Посмотреть</button></div></div>`;
  n.onclick=e=>{ const b=e.target.closest('[data-f],.x'); if(!b) return; n.remove(); if(b.dataset.f==='go'){ MP.say('Найди Просрочен'); } };
  document.body.appendChild(n); store.mark('fox');
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ const n=document.querySelector('.foxnote'); if(n){ n.remove(); e.stopImmediatePropagation(); } } },true);
window.TOCHKI={foxNote};
})();
