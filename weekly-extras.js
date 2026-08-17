(() => {
  const USAGE_KEY = 'food-schedule-shopping-item-usage-v1';
  function usage(){try{return JSON.parse(localStorage.getItem(USAGE_KEY)||'{}')}catch{return{}}}
  function record(raw){const name=cleanName(raw||'');if(!name)return;const counts=usage();counts[name]=(counts[name]||0)+1;localStorage.setItem(USAGE_KEY,JSON.stringify(counts));if(!state.previousItems.some(item=>item.toLowerCase()===name.toLowerCase()))state.previousItems.push(name)}
  function existing(){return new Set((state.extras||[]).map(item=>(typeof item==='string'?item:item.name||'').toLowerCase()))}
  function quick(){const counts=usage(),used=existing();return unique([...(state.previousItems||[]),...Object.keys(counts)]).filter(name=>!used.has(name.toLowerCase())).sort((a,b)=>(counts[b]||0)-(counts[a]||0)||a.localeCompare(b)).slice(0,5)}
  function renderQuick(){const items=quick();weeklyQuickItems.innerHTML=items.length?items.map(name=>`<button type="button" class="quick-shop-pill" data-weekly-quick="${esc(name)}">${esc(name)}</button>`).join(''):'<span class="muted">Items you add regularly will appear here.</span>'}
  function renderResults(){const q=weeklyItemSearch.value.trim().toLowerCase();if(!q){weeklyItemSuggestions.innerHTML='';return}const used=existing(),counts=usage(),known=unique([...allIngredients(),...(state.previousItems||[]),...Object.keys(counts)]);const matches=known.filter(name=>!used.has(name.toLowerCase())&&name.toLowerCase().includes(q)).slice(0,20);const clean=cleanName(weeklyItemSearch.value);const exact=matches.some(name=>name.toLowerCase()===clean.toLowerCase())||used.has(clean.toLowerCase());weeklyItemSuggestions.innerHTML=[...matches.map(name=>`<button type="button" class="dish-result" data-weekly-pick="${esc(name)}"><span>${esc(name)}</span></button>`),...(!exact&&clean?[`<button type="button" class="dish-result" data-weekly-pick="${esc(clean)}"><span>+ Add “${esc(clean)}”</span><small>New item</small></button>`]:[])].join('')||'<p class="muted ingredient-empty">No matching items.</p>'}
  function close(){weeklyItemDialog.close();weeklyItemSearch.value='';weeklyItemSuggestions.innerHTML=''}
  function add(raw){const name=cleanName(raw||'');if(!name)return;record(name);state.extras.push({name,type:'Extra'});save();render();close();toast('Weekly item added')}
  addWeeklyItemBtn.onclick=()=>{weeklyItemSearch.value='';weeklyItemSuggestions.innerHTML='';renderQuick();weeklyItemDialog.showModal();setTimeout(()=>weeklyItemSearch.focus(),0)};
  weeklyItemSearch.addEventListener('input',renderResults);
  weeklyItemSearch.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add(weeklyItemSearch.value)}});
  weeklyItemPopupAddBtn.onclick=()=>add(weeklyItemSearch.value);
  document.addEventListener('click',e=>{const quick=e.target.closest('[data-weekly-quick]');if(quick)add(quick.dataset.weeklyQuick);const pick=e.target.closest('[data-weekly-pick]');if(pick)add(pick.dataset.weeklyPick)});
  closeWeeklyItemDialog.onclick=cancelWeeklyItemBtn.onclick=close;
})();