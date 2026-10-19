(function(){
const D=window.PROTO; const S=D.screens; const idx={}; S.forEach((s,i)=>idx[s.id]=i);
const $=q=>document.querySelector(q); let cur=0, timer=null;
function list(){ const box=$('#screens'); let g=null, h='';
 S.forEach((s,i)=>{ if(s.group!==g){g=s.group; h+=`<div class="grp">${esc(g)}</div>`;}
  h+=`<button data-i="${i}" title="${esc(s.name)}"><span class="dot ${s.img||s.html?'img':''}"></span><span class="n">${i+1}</span><span>${esc(s.name)}</span></button>`; });
 box.innerHTML=h; box.querySelectorAll('button').forEach(b=>b.onclick=()=>go(+b.dataset.i)); }
function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function go(i,push=true){ if(i<0||i>=S.length) return; cur=i; clearTimeout(timer); const s=S[i];
 $('#t-name').textContent=s.name; $('#t-meta').textContent=`Экран ${i+1} из ${S.length} · ${s.group}`+(s.id&&!s.html?` · node ${s.id}`:'');
 const fl=$('#t-figma'); if(s.figma){fl.href=s.figma; fl.style.display='';} else fl.style.display='none';
 const st=$('#stage'); let h=''; $('#zones').parentElement.style.visibility=(s.img&&(s.links||[]).some(l=>!l.nozone&&!l.full))?'visible':'hidden';
 if(s.html){ h=`<iframe src="${s.html}" title="${esc(s.name)}"></iframe>`; }
 else if(s.img){ h=`<img src="${s.img}" alt="${esc(s.name)}">`;
   (s.links||[]).forEach(l=>{ if(l.nozone||l.full||!(l.dest in idx)) return; const w=s.w||1920,hh=s.h||1080;
     h+=`<a class="hs" data-d="${l.dest}" title="Переход: ${esc(S[idx[l.dest]].name)}" style="left:${l.x/w*100}%;top:${l.y/hh*100}%;width:${l.w/w*100}%;height:${l.h/hh*100}%"></a>`; }); }
 else { h=`<div class="ph"><span class="chip special">PNG экрана пока не выгружен из Figma</span><div class="big">${esc(s.name)}</div><div class="caption">${esc(s.group)} · node ${s.id}</div>${s.figma?`<a class="btn outlined" href="${s.figma}" target="_blank" rel="noopener">Открыть фрейм в Figma</a>`:''}</div>`; }
 st.innerHTML=h; st.querySelectorAll('.hs').forEach(a=>a.onclick=e=>{e.preventDefault();go(idx[a.dataset.d]);});
 const lk=(s.links||[]).filter(l=>l.dest in idx); const lb=$('#links');
 if(lk.length){ lb.style.display=''; lb.innerHTML='<span class="caption" style="align-self:center">Переходы с экрана:</span>'+lk.map(l=>`<button class="btn text" data-d="${l.dest}">${l.trig==='timeout'?'⏱ ':''}${esc(S[idx[l.dest]].name)}</button>`).join('');
   lb.querySelectorAll('button').forEach(b=>b.onclick=()=>go(idx[b.dataset.d]));
   const t=lk.find(l=>l.trig==='timeout'); if(t && $('#auto').checked) timer=setTimeout(()=>go(idx[t.dest]),2500);
 } else { lb.style.display='none'; lb.innerHTML=''; }
 $('#prev').disabled=i===0; $('#next').disabled=i===S.length-1; $('#count').textContent=`${i+1} / ${S.length}`;
 document.querySelectorAll('#screens button').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));
 const ob=document.querySelector(`#screens button[data-i="${i}"]`); if(ob) ob.scrollIntoView({block:'nearest'});
 if(push) history.replaceState(null,'','#'+(i+1)); }
window.addEventListener('hashchange',()=>{const n=parseInt(location.hash.slice(1)); if(!isNaN(n)&&n-1!==cur) go(n-1,false);});
document.addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT')return; if(e.key==='ArrowRight')go(cur+1); if(e.key==='ArrowLeft')go(cur-1); });
window.addEventListener('DOMContentLoaded',()=>{ list(); $('#prev').onclick=()=>go(cur-1); $('#next').onclick=()=>go(cur+1);
 $('#zones').onchange=e=>$('#stage').classList.toggle('show-hs',e.target.checked);
 const n=parseInt(location.hash.slice(1)); go(isNaN(n)?0:n-1,false); });
})();
