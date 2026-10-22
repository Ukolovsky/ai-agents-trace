/* Реакции для элементов, у которых нет собственного обработчика (по итогам click_audit). Срабатывает после остальных обработчиков. */
(function(){
const {notify,go}=BP;
const pick=(el,sel)=>{ const box=el.parentElement.closest('.kbtree,tbody,.toolbar')||el.parentElement; box.querySelectorAll(sel).forEach(x=>x.classList.remove('on','sel')); el.classList.add(el.tagName==='TR'?'sel':'on'); };
document.addEventListener('click',e=>{
  const t=e.target; if(!t.closest) return;
  const b=t.closest('button'); const txt=b?b.textContent.trim():'';
  if(b&&!b.onclick&&!b.dataset.act&&!b.id){
    if(/^Фильтры$/.test(txt)){ e.stopPropagation(); APP.popMenu(b,[['filter','Мои записи',()=>notify('Фильтр «Мои записи» применён','info')],['filter','За последние 30 дней',()=>notify('Фильтр «За 30 дней» применён','info')],['close','Сбросить фильтры',()=>notify('Фильтры сброшены','info')]]); return; }
    if(b.title==='Справка BusinessPad'){ go('#/kb/help'); return; }
    if(b.classList.contains('tb')){ const ta=document.querySelector('.kbart textarea'); const m={B:'**текст**',I:'_текст_',H2:'\n## Заголовок\n',H3:'\n### Заголовок\n','Список':'\n- пункт\n','Таблица':'\n| A | B |\n','Ссылка':'[ссылка](#/kb)','Снимок экрана':'\n[снимок экрана]\n','Цитата процесса':'\n> Цитата процесса\n','Вложение':'\n[вложение]\n'}[txt];
      if(ta&&m){ const p=ta.selectionStart??ta.value.length; ta.value=ta.value.slice(0,p)+m+ta.value.slice(p); ta.focus(); ta.dispatchEvent(new Event('input')); } b.classList.toggle('on'); return; }
    if(txt==='CFF'){ notify('Схема CFF выгружена','info'); return; }
  }
  const a=t.closest('a.ti,a.kbrow'); if(a&&!a.getAttribute('href')&&!a.onclick){
    const tree=a.closest('.kbtree'); if(tree&&/^\/kb\/tenant/.test(BP.parseHash().path)){ const h=BP.store.s.kb&&BP.store.s.kb.tenant; if(h){ h.cur=a.textContent.trim(); BP.store.save(); BP.render(); return; } }
    if(/[?&]tab=mp/.test(location.hash)){ pick(a,'a'); MP.open(); return; }
    pick(a,'a'); return; }
  const tr=t.closest('tbody tr'); if(tr&&!tr.onclick&&!t.closest('button,a,input,label,select')){ pick(tr,'tr'); }
});
})();
