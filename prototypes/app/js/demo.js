/* Меню управления демо. Живёт поверх приложения (position:fixed), не меняет раскладку и размеры экрана.
   Открывается кнопкой-триггером в левом нижнем углу или Shift+D. Параметр ?clean=1 прячет триггер. */
(function(){
const {esc,store,go} = BP;
const L=store.s.links;
const STEPS=[
  {k:'mp-open',t:'Открыть MagicPad',h:'#/payments?mp=1'},
  {k:'slash',t:'«/» → Импорт из файла',h:'#/payments?mp=1'},
  {k:'file',t:'Прикрепить ТН-0842 и отправить',h:'#/payments?mp=1'},
  {k:'proc',t:'Выбрать «Входящие документы»',h:'#/payments?mp=1'},
  {k:'fields',t:'Исправить «Грузополучателя», добавить поле ТТН',h:''},
  {k:'created',t:'Создать черновик документа',h:''},
  {k:'cp',t:'«Проверить и создать» контрагента',h:''},
  {k:'prod',t:'«Создать товар» (Арматура)',h:''},
  {k:'found',t:'Найти «ИнвестСтрой» в ИИ поиске',h:'#/search?q=ИнвестСтрой'}];
const JUMPS=[['Платежи подрядчикам','#/payments'],['MagicPad: меню «/»','#/payments?mp=1&slash=1'],['Импорт: нечитаемый скан','#/import/start?file=file-scan'],
  ['ИИ поиск: СтройМонолит','#/search?q=СтройМонолит'],['Контрагенты','#/counterparties'],['Документы','#/documents']];
const HINT={'mp-open':'Нажмите кнопку с искрой в шапке страницы.','slash':'В поле MagicPad введите «/» и выберите «Импорт из файла».','file':'Выберите «Товарная накладная ТН-0842.pdf» и отправьте.','proc':'Нажмите карточку «Входящие документы».','fields':'На шаге «Распознанные поля» исправьте «Грузополучателя» на ООО «ИнвестСтрой». Нажмите «+», добавьте «Номер транспортной накладной» без значения и выделите номер в документе.','created':'Нажмите «Создать» внизу мастера.','cp':'В ответе Феликса нажмите «Проверить и создать», отметьте контрагента и нажмите «Создать».','prod':'Нажмите «Создать товар», отметьте Арматуру и нажмите «Создать».','found':'Введите «ИнвестСтрой» в поиске по системе.'};
const clean=new URLSearchParams(location.search).get('clean')==='1';
const css=`#demo-trig{position:fixed;left:16px;bottom:52px;z-index:2147483000;width:40px;height:24px;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:#1E1E24;color:#FFD27A;font:600 10px/22px ui-monospace,Menlo,monospace;letter-spacing:.08em;text-align:center;cursor:pointer;opacity:.55;padding:0;transition:opacity .2s}
#demo-trig:hover,#demo-trig.on{opacity:1}
#demo-panel{position:fixed;left:56px;bottom:16px;z-index:2147483001;width:320px;max-height:calc(100vh - 32px);overflow:auto;background:#1E1E24;color:#EDEDED;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.45);font:13px/18px ui-monospace,Menlo,Consolas,monospace;padding:12px 14px}
#demo-panel[hidden]{display:none}#demo-panel h4{margin:12px 0 6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#9A9AA6}
#demo-panel a,#demo-panel button.l{display:block;width:100%;text-align:left;color:#9FC3FF;background:none;border:0;padding:3px 0;cursor:pointer;font:inherit;text-decoration:none}
#demo-panel a:hover,#demo-panel button.l:hover{text-decoration:underline}
#demo-panel .st{display:flex;gap:8px;align-items:flex-start;padding:2px 0}#demo-panel .st i{font-style:normal;width:16px;flex:none;color:#777}
#demo-panel .st.done i{color:#7CD67C}#demo-panel .st.next{color:#FFD27A}
#demo-panel .hd{display:flex;align-items:center;gap:8px}#demo-panel .hd b{flex:1}#demo-panel .x{background:none;border:0;color:#aaa;cursor:pointer;font-size:16px}
#demo-panel .rst{margin-top:10px;width:100%;background:#3A2A2A;color:#FFB4A8;border:1px solid #6A3A3A;border-radius:6px;padding:6px;cursor:pointer;font:inherit}
#demo-panel .k{color:#777;font-size:11px}`;
let trig, panel;
function build(){
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  panel=document.createElement('div'); panel.id='demo-panel'; panel.hidden=true; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Управление демо');
  document.body.appendChild(panel);
  if(!clean){ trig=document.createElement('button'); trig.id='demo-trig'; trig.title='Управление демо (Shift+D)'; trig.textContent='DEMO'; trig.onclick=toggle; document.body.appendChild(trig); }
  document.addEventListener('keydown',e=>{ if(e.shiftKey&&(e.code==='KeyD')&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ e.preventDefault(); toggle(); } if(e.key==='Escape'&&!panel.hidden) toggle(); });
  panel.addEventListener('click',e=>{ const a=e.target.closest('[data-go]'); if(a){ e.preventDefault(); go(a.dataset.go); }
    if(e.target.closest('.x')) toggle();
    if(e.target.closest('.rst')){ APP.resetDemo(); refresh(); } });
  refresh();
}
function toggle(){ panel.hidden=!panel.hidden; trig&&trig.classList.toggle('on',!panel.hidden); refresh(); }
function refresh(){
  if(!panel||panel.hidden) return; const pr=store.s.progress; const next=STEPS.find(s=>!pr[s.k]);
  panel.innerHTML=`<div class="hd"><b>Демо · ${esc(store.s.company.name)}</b><span class="k">Shift+D</span><button class="x" title="Закрыть">×</button></div>
  <h4>Сценарий «Накладная от поставщика»</h4>${STEPS.map((s,i)=>`<div class="st ${pr[s.k]?'done':s===next?'next':''}"><i>${pr[s.k]?'✓':i+1+'.'}</i>${s.h&&!pr[s.k]?`<a href="${s.h}" data-go="${s.h}">${esc(s.t)}</a>`:`<span>${esc(s.t)}</span>`}</div>`).join('')}
  <h4>Подсказка</h4><div style="color:#CFCFD6">${esc(HINT[(next||{}).k]||'Сценарий пройден. Сбросьте данные, чтобы начать заново.')}</div><h4>Быстрые действия</h4>${JUMPS.map(j=>`<a href="${j[1]}" data-go="${j[1]}">${esc(j[0])}</a>`).join('')}
  <h4>Материалы</h4><a href="${L.agents}" target="_blank" rel="noopener">ТЗ и спецификация (ver-2)</a><a href="${L.figma}" target="_blank" rel="noopener">Макеты Figma BP-CPQ-AI</a><a href="${L.portal}" target="_blank" rel="noopener">Портал картиночных прототипов</a>
  <button class="rst">Сбросить демо-данные</button><div class="k" style="margin-top:6px">?clean=1 скрывает кнопку-триггер; меню остаётся по Shift+D</div>`;
}
window.DEMO={refresh,toggle,isOpen:()=>panel&&!panel.hidden};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',build):build();
})();
