/* Интегратор: «Импорт из базы данных» по Figma стр. «5. Интегратор» (646-*, 650-*, 657-*, 667-*, 669-*, 691-126734).
   Подключение → Выбор данных → Сопоставление → Предпросмотр; MagicPad закреплён справа, как в макетах. */
(function(){
const {I,esc,store,chip,route,go,notify} = BP;
const A=()=>window.APP; const S=()=>store.s;
/* общая раскладка страниц-мастеров: ✕ + заголовок, тело, нижняя панель со степпером */
function wpage(title, body, foot, o={}){
  A().content(`<div class="wpage"><div class="ph"><div class="title"><button class="xbtn" id="wx" title="Закрыть">${I('close','ic16')}</button><h1 class="h1">${esc(title)}</h1>${o.after||''}</div>
   <div class="acts">${o.extra||''}<button class="ibtn magic ${MP.isOpen()?'on':''}" data-act="mp" title="MagicPad">${I('shine','ic16')}</button>${o.dots?`<button class="ibtn" data-act="dots" title="Ещё">${I('more')}</button>`:''}</div></div>
   <div class="wbody">${body}</div><div class="wfoot">${foot}</div></div>`);
  const x=document.getElementById('wx'); x.onclick=o.close||(()=>history.back());
}
function steps(names, cur){ return `<div class="stepper">${names.map((n,i)=>`${i?`<span class="step-line ${i<=cur?'done':''}"></span>`:''}<span class="step ${i<cur?'done':i===cur?'cur':''}" title="${esc(n)}"><i>${i+1}</i>${esc(n)}</span>`).join('')}</div>`; }
window.WP={wpage,steps};

const ST=['Подключение','Выбор данных','Сопоставление','Предпросмотр'];
const G=()=>{ const s=S(); if(!s.ig) s.ig={step:0,checked:false,table:null,dec:{},pubd:false,only:false,sel:null}; return s.ig; };
const NAMES=['Белов Сергей','Зайцев Никита','Лисин Дмитрий','Громова Ольга','Кузнецов Андрей','Волкова Елена','Титов Роман','Егорова Анна','Фёдоров Максим','Романова Татьяна','Орлов Павел','Котова Ирина','Соколова Мария','Морозов Алексей','Новиков Илья','Павлова Светлана','Смирнов Олег','Васильева Дарья','Попов Артём','Лебедева Ксения','Козлов Денис','Николаева Юлия','Медведев Игорь','Ершова Алина'];
const POS=['Прораб','Мастер участка','Инженер ПТО','Снабженец','Кладовщик','Сметчик','Монтажник','Бетонщик','Электромонтажник','Водитель'];
const DEP=['Участок №1','Участок №2','Снабжение','Склад','ПТО','Бухгалтерия'];
const rows=()=>NAMES.concat(NAMES.map(n=>n.split(' ').reverse().join(' '))).slice(0,40).map((n,i)=>({n:i+1,fio:n,tab:'СТ-'+String(842+i).padStart(5,'0'),pos:POS[i%POS.length],dep:DEP[i%DEP.length],email:n.split(' ')[1].slice(0,1).toLowerCase()+'.'+i+'@stroyka.ru',phone:'+7 910 2'+String(10+i)+'-'+String(11+i)+'-0'+(i%9),bad:[3,9,10,17,22,26,31,35].includes(i)}));
const TOTAL=214, BAD=12;
function decided(){ const g=G(); return S().integ.cols.every((c,i)=>g.dec[i]||(c[5]>=70)); }

route(/^\/integrator$/, ()=>{
  const g=G(); const s=S().integ; A().setCrumbs([['Настройки','#/settings'],['Интеграции']],true);
  const close=()=>{ S().ig=null; store.save(); go('#/settings'); };
  if(g.step===0){
    const c=s.conn; const f=(k,l,t='text')=>`<div class="fld"><label>${l} <span class="req">*</span></label><input class="inp" data-k="${k}" type="${t}" value="${esc(c[k])}"></div>`;
    wpage('Импорт из базы данных',`<div class="paper col" style="flex:1"><h2 class="h3">Общая информация</h2><div class="col" style="max-width:375px;gap:10px">
      ${f('name','Название')}${f('host','Хост')}${f('port','Порт')}${f('db','Имя базы')}${f('login','Логин')}${f('pass','Пароль','password')}
      <div class="fld"><label>Синхронизация</label><select class="sel" data-k="sync">${['Раз в неделю','Раз в день','Вручную'].map(x=>`<option ${x===c.sync?'selected':''}>${x}</option>`).join('')}</select></div></div></div>`,
      `${steps(ST,0)}<span style="flex:1"></span><button class="btn pri out" id="igcheck">Проверить подключение</button><button class="btn" id="ignext" ${g.checked?'':'disabled'}>Далее</button><button class="btn out" id="igcancel">Отменить</button>`,{close});
    const upd=()=>{ document.getElementById('igcheck').disabled=!['name','host','port','db','login','pass'].every(k=>c[k]); };
    document.querySelectorAll('[data-k]').forEach(i=>i.oninput=i.onchange=()=>{ c[i.dataset.k]=i.value; g.checked=false; store.save(); upd(); document.getElementById('ignext').disabled=true; }); upd();
    document.getElementById('igcheck').onclick=async()=>{ if(!MP.isOpen()) MP.open(); await MP.typing(['Подключение к '+c.host,'Чтение схемы базы']); g.checked=true; store.save(); store.mark('ig-conn');
      notify('Подключение установлено. Схема прочитана'); document.getElementById('ignext').disabled=false;
      MP.bot(`<span>Подключение к «${esc(c.name)}» установлено, схема прочитана. Нашёл:</span><span>${s.groups.map(([n,t])=>`${n}: ${t.length} табл., ${t.reduce((a,x)=>a+x[1],0).toLocaleString('ru-RU')} записей`).join('<br>')}</span><span>Нажмите «Далее» и выберите нужную таблицу.</span>`); };
  } else if(g.step===1){
    wpage('Импорт из базы данных',`<div class="paper col" style="flex:1"><div class="lh"><h2 class="h3">Список таблиц</h2><span class="cnt0">7</span><div class="search" style="width:240px;margin-left:auto">${I('search','ic16')}<input class="inp" placeholder="Введите поисковый запрос..."></div></div>
      <div class="tblwrap"><table class="uni"><colgroup><col style="width:32px"><col><col style="width:200px"><col style="width:200px"></colgroup><thead><tr><th></th><th>Название</th><th>Записи</th><th>Поля</th></tr></thead><tbody>
      ${s.groups.map(([n,t])=>`<tr class="grp"><td></td><td colspan="3">${I('drop','ic16')} ${esc(n)}</td></tr>`+t.map(r=>`<tr class="click" data-t="${r[0]}"><td class="cb"><input type="radio" name="igt" ${g.table===r[0]?'checked':''}></td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')).join('')}</tbody></table></div></div>`,
      `${steps(ST,1)}<span style="flex:1"></span><button class="btn" id="ignext" ${g.table?'':'disabled'}>Далее</button><button class="btn out" id="igcancel">Отменить</button>`,{close});
    document.querySelectorAll('tr[data-t]').forEach(tr=>tr.onclick=()=>{ g.table=tr.dataset.t; store.save(); BP.render(); });
  } else if(g.step===2){
    const cols=s.cols; const st=(c,i)=>{ const d=g.dec[i]; if(d==='skip') return chip('Не переносить'); if(d) return `<span class="chip green">Сопоставлено вручную</span>`; if(!c[5]) return `<span class="chip yellow">Не сопоставлено</span>`; return `<span class="chip ${c[5]<70?'orange':'green'}">${c[5]}%</span>`; };
    wpage('Импорт из базы данных',`<div class="paper col" style="flex:1;min-height:0"><div class="lh"><h2 class="h3">Сопоставление колонок</h2><span class="cnt0">${cols.length}</span><div class="search" style="width:240px;margin-left:auto">${I('search','ic16')}<input class="inp" placeholder="Поиск по ..."></div></div>
      <div class="tblwrap" style="overflow:auto"><table class="uni"><colgroup><col style="width:32px"><col><col><col style="width:120px"><col><col style="width:150px"><col style="width:150px"><col style="width:32px"></colgroup>
      <thead><tr><th class="cb"><input type="checkbox" class="chk"></th><th>Колонка источника</th><th>Пример значения</th><th>Тип источника</th><th>Колонка в BP</th><th>Тип переменной в BP</th><th>Статус</th><th></th></tr></thead><tbody>
      ${cols.map((c,i)=>{ const d=g.dec[i]; const bp=d&&d!=='skip'?d:c[3]; return `<tr><td class="cb"><input type="checkbox" class="chk"></td><td>${esc(c[0])} ${(!c[5]||c[5]<70)&&!d?'<i class="wdot"></i>':''}</td><td>${esc(c[1])}</td><td>${c[2]}</td><td>${esc(d==='skip'?'-':bp||'-')}</td><td>${esc(d&&d!=='skip'?c[2]:c[4]||'-')}</td><td>${st(c,i)}</td><td class="act"><button class="ibtn s" data-col="${i}">${I('more','ic16')}</button></td></tr>`; }).join('')}</tbody></table></div></div>`,
      `${steps(ST,2)}<span style="flex:1"></span><button class="btn" id="ignext" ${decided()?'':'disabled'}>Далее</button><button class="btn out" id="igcancel">Отменить</button>`,{close,extra:`<button class="btn pri out">${I('filter','ic16')}Фильтры</button>`});
    document.querySelectorAll('[data-col]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const i=+b.dataset.col; const c=cols[i];
      const opts=[...(c[3]?[['ok','Подтвердить «'+c[3]+'»']]:[]),...S().integ.bpFields.map(f=>['f:'+f,f]),['new','Создать поле «'+c[0]+'»'],['skip','Не переносить']];
      A().popMenu(b,opts.map(([k,t])=>[k==='skip'?'close':k==='new'?'add':'edit',t,()=>{ g.dec[i]=k==='skip'?'skip':k==='ok'?c[3]:k==='new'?c[0]:k.slice(2); store.save(); BP.render();
        if(decided()&&!g.doneMsg){ g.doneMsg=1; store.save(); store.mark('ig-map'); MP.isOpen()||MP.open(); MP.bot(`<span>Готово, по всем колонкам есть решение. Переносим ${cols.filter((c,j)=>g.dec[j]!=='skip').length} колонок. Нажмите «Далее», чтобы перейти к проверке данных.</span>`); } }])); });
  } else {
    let rs=rows(); const sel=g.sel||(g.sel=rs.filter(r=>!r.bad).map(r=>r.n)); const shown=g.only?rs.filter(r=>r.bad&&!g.fixed):rs;
    const selN=TOTAL-(rs.length-sel.length)-(g.fixed?0:BAD-8);
    wpage('Импорт из базы данных',`<div class="paper col" style="flex:1;min-height:0"><div class="lh"><h2 class="h3">Предпросмотр</h2><span class="cnt0">${TOTAL}</span><label class="tgl" style="margin-left:auto"><input type="checkbox" id="igonly" ${g.only?'checked':''}><i></i>Только проблемные</label><div class="search" style="width:240px">${I('search','ic16')}<input class="inp" placeholder="Поиск по ..."></div></div>
      <div class="tblwrap" style="overflow:auto"><table class="uni"><colgroup><col style="width:32px"><col style="width:44px"><col><col style="width:120px"><col><col><col><col style="width:150px"></colgroup>
      <thead><tr><th class="cb"><input type="checkbox" class="chk" id="igall"></th><th>№</th><th>ФИО</th><th>Табельный №</th><th>Должность</th><th>Подразделение</th><th>Email</th><th>Телефон</th></tr></thead><tbody>
      ${shown.map(r=>`<tr><td class="cb"><input type="checkbox" class="chk" data-r="${r.n}" ${sel.includes(r.n)?'checked':''}></td><td>${r.n}</td><td>${esc(r.fio)}</td><td>${r.tab}</td><td>${esc(r.pos)} ${r.bad&&!g.fixed?'<i class="wdot" title="Должности нет в справочнике"></i>':''}</td><td>${r.bad&&!g.fixed?'<span class="muted">пусто</span>':esc(r.dep)}</td><td>${r.email}</td><td>${r.phone}</td></tr>`).join('')}</tbody></table></div></div>`,
      `${steps(ST,3)}<span style="flex:1"></span><span class="cap muted">Выбрано</span><span class="counter">${selN}/${TOTAL}</span>${g.fixed?'':`<span class="cap">При публикации не исправленные записи (${BAD}) не переносятся.</span>`}<button class="btn pri out" id="igact">Действия</button><button class="btn" id="igpub">Опубликовать</button><button class="btn out" id="igcancel">Отменить</button>`,{close,extra:`<button class="btn pri out">${I('filter','ic16')}Фильтры</button>`});
    if(!g.prevMsg){ g.prevMsg=1; store.save(); MP.isOpen()||MP.open(); MP.bot(`<span>Я проверил ${TOTAL} записей и нашёл ${BAD} с ошибками: например, пустое подразделение или должность, которой нет в справочнике.</span><span>Исправить ошибки: отметьте записи галочками и нажмите «Действия».</span><span>Перенести данные: отметьте нужные записи и нажмите «Опубликовать». Записи с ошибками не перенесутся, пока вы их не исправите.</span>`); }
    document.getElementById('igonly').onchange=e=>{ g.only=e.target.checked; store.save(); BP.render(); };
    document.querySelectorAll('[data-r]').forEach(c=>c.onchange=()=>{ const n=+c.dataset.r; g.sel=c.checked?[...new Set([...sel,n])]:sel.filter(x=>x!==n); store.save(); BP.render(); });
    document.getElementById('igall').onchange=e=>{ g.sel=e.target.checked?rs.map(r=>r.n):[]; store.save(); BP.render(); };
    document.getElementById('igact').onclick=e=>{ e.stopPropagation(); A().popMenu(e.currentTarget,[['edit','Исправить: подразделение по объекту',()=>{ g.fixed=1; g.sel=rs.map(r=>r.n); store.save(); BP.render(); notify(`Исправлено записей: ${BAD}`); }],['close','Снять выделение',()=>{ g.sel=[]; store.save(); BP.render(); }]]); };
    document.getElementById('igpub').onclick=()=>{ const n=selN; const add=rs.filter(r=>g.sel.includes(r.n)&&(!r.bad||g.fixed)&&!S().employees.some(e=>e.name===r.fio.split(' ').reverse().join(' '))).slice(0,4);
      add.forEach((r,i)=>{ S().employees.push({id:'e-ig'+i,name:r.fio.split(' ').reverse().join(' '),pos:r.pos,email:r.email,status:'Работает',imported:1}); });
      S().ig=null; store.save(); store.mark('ig-pub'); notify(`Данные опубликованы: перенесено записей ${n}`); MP.bot(`<span>Перенёс ${n} записей из «hr.employees_main» в справочник «Сотрудники».</span>`,[{t:'Открыть сотрудников',a:'go:#/settings/employees'}]); go('#/settings/employees'); };
  }
  const nx=document.getElementById('ignext'); nx&&(nx.onclick=()=>{ g.step++; store.save(); if(g.step===2&&!g.mapMsg){ g.mapMsg=1; MP.isOpen()||MP.open(); MP.bot(`<span>Выбрана таблица «${esc(g.table)}».</span><span>Я подобрал, в какие поля BusinessPad положить данные: для 11 колонок нашёл подходящие поля, по двум не уверен, а для восьми полей в BusinessPad пока нет, их можно создать.</span><span>Проверьте мои предложения: нажмите ⋮ в строке и выберите нужное. Кнопка «Далее» станет активной, когда по каждой колонке будет принято решение.</span>`); } BP.render(); });
  const cn=document.getElementById('igcancel'); cn&&(cn.onclick=close);
});
/* Вход из MagicPad: «Откуда нужно импортировать данные?» */
window.MPX=window.MPX||{};
MPX.integ=k=>{ if(k==='src'){ MP.bot('<span>Привет! Откуда нужно импортировать данные?</span>',[{t:'Документ',d:'Импорт данных из PDF, DOCX, XLSX, CSV',a:'cmd:import'},{t:'База данных',d:'Подключение внешней БД PostgreSQL',a:'ext:integ:db'},{t:'Приложение',d:'Интеграция с сервисом',a:'ext:integ:na'},{t:'Справочники',d:'Импорт готовых данных',a:'ext:integ:na'},{t:'ERP-система',d:'Перенос из другой системы',a:'ext:integ:na'}]); }
  if(k==='db'){ MP.useAll(); MP.me('База данных'); MP.bot('<span>Подключим PostgreSQL.</span><span>Выберите сохранённое подключение или создайте новое. Логин и пароль вводятся в защищённой форме, не в чат.</span>',[{k:'btn',t:'Новое подключение',a:'ext:integ:new'},{k:'btn',t:'Выбрать сохранённое',a:'ext:integ:new'}]); }
  if(k==='new'){ MP.useAll(); MP.me('Новое подключение'); S().ig=null; store.save(); store.mark('ig-start'); go('#/integrator'); }
  if(k==='na'){ notify('В пилоте доступны «Документ» и «База данных»','info'); }
};
})();
