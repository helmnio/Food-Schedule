(() => {
  const WEEK_ID_KEY = 'food-schedule-suggestion-week-v1';
  const WEEK_IDS_KEY = 'food-schedule-suggestion-ids-v1';
  let activeDishTab = 'favourites';

  function dishCard(dish, compact = false) {
    const personal = dish.source !== 'mealdb';
    const source = personal ? 'My dish' : 'Catalogue';
    const ingredientText = (dish.ingredients || []).slice(0, compact ? 4 : 8).map(esc).join(' · ');
    const more = (dish.ingredients || []).length > (compact ? 4 : 8) ? ' · …' : '';
    return `<article class="dish-card ${compact ? 'dish-card-compact' : ''}" data-edit-dish="${dish.id}"><div class="dish-card-top"><small class="dish-source">${source}</small><span class="heart">${dish.favourite ? '♥' : '♡'}</span></div><h3>${esc(dish.name)}</h3><div class="ingredients">${ingredientText}${more}</div></article>`;
  }

  function personalDishes() { return state.dishes.filter(d => d.source !== 'mealdb').sort((a,b)=>Number(b.favourite)-Number(a.favourite)||a.name.localeCompare(b.name)); }
  function favouriteDishes() { return state.dishes.filter(d => d.favourite).sort((a,b)=>a.name.localeCompare(b.name)); }
  function catalogueDishes() { return state.dishes.filter(d => d.source === 'mealdb'); }
  function matches(d,q){return !q||d.name.toLowerCase().includes(q)||(d.ingredients||[]).some(i=>i.toLowerCase().includes(q))}
  function weekKey(date=new Date()){const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));const day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-day);const ys=new Date(Date.UTC(d.getUTCFullYear(),0,1));return `${d.getUTCFullYear()}-${String(Math.ceil((((d-ys)/86400000)+1)/7)).padStart(2,'0')}`}
  function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function weeklySuggestions(){const cat=catalogueDishes();if(!cat.length)return[];const wk=weekKey();let ids=[];try{ids=JSON.parse(localStorage.getItem(WEEK_IDS_KEY)||'[]')}catch{}if(localStorage.getItem(WEEK_ID_KEY)!==wk||ids.length!==4||ids.some(id=>!cat.some(d=>d.id===id))){ids=[...cat].sort((a,b)=>hash(`${wk}:${a.id}`)-hash(`${wk}:${b.id}`)).slice(0,4).map(d=>d.id);localStorage.setItem(WEEK_ID_KEY,wk);localStorage.setItem(WEEK_IDS_KEY,JSON.stringify(ids))}return ids.map(id=>cat.find(d=>d.id===id)).filter(Boolean)}
  function renderSection(el,dishes,empty,horizontal=false){if(!el)return;el.classList.toggle('dish-strip',horizontal);el.innerHTML=dishes.length?dishes.map(d=>dishCard(d,horizontal)).join(''):`<div class="dish-empty">${empty}</div>`}

  function setDishTab(tab){activeDishTab=tab;document.querySelectorAll('[data-dish-tab]').forEach(btn=>btn.classList.toggle('active',btn.dataset.dishTab===tab));document.querySelectorAll('[data-dish-panel]').forEach(panel=>panel.hidden=panel.dataset.dishPanel!==tab);if(tab==='find')setTimeout(()=>dishSearch?.focus(),0)}

  window.renderDishes=function(){
    renderSection(document.querySelector('#favouriteDishGrid'),favouriteDishes(),'Heart dishes to keep your regulars here.');
    const myQ=(document.querySelector('#myDishSearch')?.value||'').trim().toLowerCase();
    const mine=personalDishes().filter(d=>matches(d,myQ));
    renderSection(document.querySelector('#personalDishGrid'),mine,myQ?'No matching personal dishes.':'Your created or customised dishes will appear here.');
    renderSection(document.querySelector('#suggestedDishGrid'),weeklySuggestions(),'Weekly ideas will appear once the meal catalogue has loaded.');
    const q=(dishSearch?.value||'').trim().toLowerCase();
    if(!dishGrid)return;
    if(!q){dishGrid.innerHTML='<div class="dish-search-empty"><strong>Search the full dish catalogue</strong><span>Type a dish or ingredient above. Your own dishes are prioritised in results.</span></div>';return}
    const results=[...state.dishes].filter(d=>matches(d,q)).sort((a,b)=>{const ap=a.source!=='mealdb'?1:0,bp=b.source!=='mealdb'?1:0;if(ap!==bp)return bp-ap;if(Number(a.favourite)!==Number(b.favourite))return Number(b.favourite)-Number(a.favourite);const as=a.name.toLowerCase().startsWith(q)?1:0,bs=b.name.toLowerCase().startsWith(q)?1:0;return as!==bs?bs-as:a.name.localeCompare(b.name)}).slice(0,40);
    dishGrid.innerHTML=results.length?results.map(d=>dishCard(d)).join(''):'<div class="dish-empty">No matching dishes found.</div>';
  };

  document.addEventListener('click',e=>{
    const tab=e.target.closest('[data-dish-tab]');
    if(tab)setDishTab(tab.dataset.dishTab);
    const card=e.target.closest('[data-edit-dish]');
    if(card){
      const dish=state.dishes.find(d=>d.id===card.dataset.editDish);
      deleteDishBtn.hidden=activeDishTab!=='mine'||!dish||dish.source==='mealdb';
    }
  });
  if(typeof dishSearch!=='undefined'&&dishSearch)dishSearch.oninput=window.renderDishes;
  const mySearch=document.querySelector('#myDishSearch');if(mySearch)mySearch.oninput=window.renderDishes;
  setDishTab(activeDishTab);window.renderDishes();
})();
