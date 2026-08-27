(() => {
  const HISTORY_KEY='food-schedule-history-v1';
  const WEEK_KEY='food-schedule-current-week-v1';
  const CURRENT_DATA_KEY='food-schedule-this-week-data-v1';
  const NEXT_DATA_KEY='food-schedule-next-week-data-v1';
  const VIEW_KEY='food-schedule-week-view-v1';
  let quickDay=null;

  function weekStart(date=new Date()){const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());const day=d.getDay()||7;d.setDate(d.getDate()-day+1);return d}
  function weekKey(date=new Date()){const d=weekStart(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function dateFromKey(key){const [y,m,d]=String(key).split('-').map(Number);return new Date(y,m-1,d)}
  function nextKeyFrom(key){const d=dateFromKey(key);d.setDate(d.getDate()+7);return weekKey(d)}
  function clone(v){return JSON.parse(JSON.stringify(v))}
  function history(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch{return[]}}
  function saveHistory(items){localStorage.setItem(HISTORY_KEY,JSON.stringify(items.slice(0,26)))}
  function snapshot(key){return {key,schedule:clone(state.schedule),dayIngredients:clone(state.dayIngredients),extras:clone(state.extras),dayChecks:clone(state.dayChecks||{}),savedAt:Date.now()}}
  function hasSnapshotContent(data){return !!data&&(DAYS.some(day=>(data.schedule?.[day]||[]).length||(data.dayIngredients?.[day]||[]).length)||(data.extras||[]).length)}
  function readData(storageKey){try{return JSON.parse(localStorage.getItem(storageKey)||'null')}catch{return null}}
  function writeData(storageKey,data){localStorage.setItem(storageKey,JSON.stringify(data))}
  function archiveSnapshot(data){if(!hasSnapshotContent(data))return;const items=history().filter(item=>item.key!==data.key);items.unshift(data);saveHistory(items)}
  function emptySnapshot(key){return {key,schedule:emptyDayMap(),dayIngredients:emptyDayMap(),extras:[],dayChecks:{},savedAt:Date.now()}}
  function loadSnapshot(data){state.schedule=clone(data?.schedule||emptyDayMap());state.dayIngredients=clone(data?.dayIngredients||emptyDayMap());state.extras=clone(data?.extras||[]);state.dayChecks=clone(data?.dayChecks||{});state.shopping=[]}
  function currentView(){return localStorage.getItem(VIEW_KEY)==='next'?'next':'current'}
  function saveVisibleWeek(){const key=currentView()==='next'?nextKeyFrom(weekKey()):weekKey();writeData(currentView()==='next'?NEXT_DATA_KEY:CURRENT_DATA_KEY,snapshot(key))}
  function updateWeekHeading(){const eyebrow=document.querySelector('#week .section-head .eyebrow');if(eyebrow)eyebrow.textContent=currentView()==='next'?'NEXT WEEK':'THIS WEEK'}
  function refreshWeekButton(){const next=readData(NEXT_DATA_KEY);if(currentView()==='next'){startNextWeekBtn.disabled=false;startNextWeekBtn.textContent='View this week';startNextWeekBtn.title=''}else if(next){startNextWeekBtn.disabled=false;startNextWeekBtn.textContent='View next week';startNextWeekBtn.title=''}else{startNextWeekBtn.disabled=false;startNextWeekBtn.textContent='Start next week';startNextWeekBtn.title=''}updateWeekHeading()}
  function switchTo(view){saveVisibleWeek();const target=view==='next'?readData(NEXT_DATA_KEY):readData(CURRENT_DATA_KEY);if(!target)return;localStorage.setItem(VIEW_KEY,view);localStorage.setItem(WEEK_KEY,target.key);loadSnapshot(target);render();refreshWeekButton()}
  function ensureWeek(){
    const current=weekKey(),next=nextKeyFrom(current),oldActive=localStorage.getItem(WEEK_KEY),view=currentView();
    if(view==='next')writeData(NEXT_DATA_KEY,snapshot(oldActive||next));else writeData(CURRENT_DATA_KEY,snapshot(oldActive||current));
    let currentData=readData(CURRENT_DATA_KEY),nextData=readData(NEXT_DATA_KEY);
    if(nextData&&nextData.key===current){if(currentData&&currentData.key!==current)archiveSnapshot(currentData);currentData=nextData;writeData(CURRENT_DATA_KEY,currentData);localStorage.removeItem(NEXT_DATA_KEY);nextData=null;localStorage.setItem(VIEW_KEY,'current');loadSnapshot(currentData);localStorage.setItem(WEEK_KEY,current);render()}
    else if(currentData&&currentData.key!==current&&dateFromKey(currentData.key)<dateFromKey(current)){archiveSnapshot(currentData);currentData=emptySnapshot(current);writeData(CURRENT_DATA_KEY,currentData);localStorage.setItem(VIEW_KEY,'current');loadSnapshot(currentData);localStorage.setItem(WEEK_KEY,current);render()}
    if(nextData&&nextData.key!==next){localStorage.removeItem(NEXT_DATA_KEY);if(currentView()==='next'){localStorage.setItem(VIEW_KEY,'current');loadSnapshot(readData(CURRENT_DATA_KEY)||emptySnapshot(current));render()}}
    localStorage.setItem(WEEK_KEY,currentView()==='next'?next:current);refreshWeekButton()
  }
  function startNextWeek(){saveVisibleWeek();const next=nextKeyFrom(weekKey());if(!readData(NEXT_DATA_KEY))writeData(NEXT_DATA_KEY,emptySnapshot(next));localStorage.setItem(VIEW_KEY,'next');localStorage.setItem(WEEK_KEY,next);loadSnapshot(readData(NEXT_DATA_KEY));startNextWeekDialog.close();render();refreshWeekButton();toast('Next week started')}
  function handleWeekButton(){if(currentView()==='next'){switchTo('current');return}if(readData(NEXT_DATA_KEY)){switchTo('next');return}startNextWeekDialog.showModal()}

  function dishName(slot){if(slot.type==='dish')return state.dishes.find(d=>d.id===slot.dishId)?.name||'Meal';return slot.label||slot.type.replace('-',' ')}
  function recentDishIds(){const seen=[];for(const wk of history())for(const day of DAYS)for(const slot of wk.schedule?.[day]||[])if(slot.type==='dish'&&!seen.includes(slot.dishId))seen.push(slot.dishId);return seen}
  function quickMeals(){const scheduled=new Set(DAYS.flatMap(day=>(state.schedule[day]||[]).filter(s=>s.type==='dish').map(s=>s.dishId)));const recent=recentDishIds();return [...state.dishes].filter(d=>!scheduled.has(d.id)).sort((a,b)=>{if(Number(a.favourite)!==Number(b.favourite))return Number(b.favourite)-Number(a.favourite);const ai=recent.indexOf(a.id),bi=recent.indexOf(b.id);const ar=ai<0?999:ai,br=bi<0?999:bi;return br-ar||a.name.localeCompare(b.name)}).slice(0,5)}
  function renderQuick(){const meals=quickMeals();quickMealPills.innerHTML=meals.length?meals.map(d=>`<button type="button" class="quick-meal-pill" data-quick-dish="${d.id}">${d.favourite?'<span class="quick-heart">♥</span>':''}<span>${esc(d.name)}</span></button>`).join(''):'<span class="muted">Favourite or recently used meals will appear here.</span>'}
  function openQuick(day){quickDay=day;quickMealTitle.textContent=`Add meal to ${day}`;quickMealSearch.value='';renderQuick();quickMealSearchResults.innerHTML='';quickMealDialog.showModal()}
  function addQuick(id){if(!quickDay)return;state.schedule[quickDay].push({type:'dish',dishId:id});quickMealDialog.close();quickDay=null;render();toast('Meal added')}
  function mealChanges(slot){if(slot.type!=='dish'||!slot.ingredients)return {removed:[],added:[]};const dish=state.dishes.find(d=>d.id===slot.dishId);if(!dish)return {removed:[],added:[]};const base=dish.ingredients||[],used=slot.ingredients||[];return {removed:base.filter(i=>!used.includes(i)),added:used.filter(i=>!base.includes(i))}}
  function detailLine(label,items){return items?.length?`<div class="history-detail"><span>${label}:</span> ${items.map(esc).join(', ')}</div>`:''}
  function historyDay(day,schedule,dayIngredients){const slots=schedule?.[day]||[],extras=dayIngredients?.[day]||[];if(!slots.length&&!extras.length)return '';const meals=slots.map(slot=>{const changes=mealChanges(slot);return `<div class="history-meal"><strong>${esc(dishName(slot))}</strong>${detailLine('Removed',changes.removed)}${detailLine('Added',changes.added)}</div>`}).join('');return `<div class="history-day"><span>${day.slice(0,3)}</span><div class="history-day-content">${meals}${detailLine('Day extras',extras)}</div></div>`}
  function exampleWeek(title,example){return `<section class="history-week history-week-example"><div class="history-week-head"><div><strong>${title}</strong></div><span class="count-pill">PREVIEW</span></div>${DAYS.map(day=>{const x=example[day];return `<div class="history-day"><span>${day.slice(0,3)}</span><div class="history-day-content"><div class="history-meal"><strong>${esc(x.meal)}</strong>${detailLine('Removed',x.removed)}${detailLine('Added',x.added)}</div>${detailLine('Day extras',x.extras)}</div></div>`}).join('')}</section>`}
  function exampleHistory(){const weekOne={Monday:{meal:'Chicken Curry',removed:['Rice','Peas'],added:['Chips','Spinach'],extras:['Naan','Mango chutney']},Tuesday:{meal:'Spaghetti Bolognese',added:['Garlic bread']},Wednesday:{meal:'Leftovers — Chicken Curry',extras:['Salad']},Thursday:{meal:'Homemade Tacos',removed:['Sour cream','Jalapeños'],added:['Guacamole','Cheese']},Friday:{meal:'Takeaway — Chinese'},Saturday:{meal:'Steak & Chips',extras:['Peppercorn sauce','Onion rings']},Sunday:{meal:'Roast Chicken'}};const weekTwo={Monday:{meal:'Chilli Con Carne',removed:['Rice'],added:['Jacket potato']},Tuesday:{meal:'Eating out — The pub'},Wednesday:{meal:'Chicken Fajitas',added:['Extra peppers']},Thursday:{meal:'Leftovers — Fajitas'},Friday:{meal:'Homemade Pizza',removed:['Mushrooms'],added:['Pepperoni','Olives'],extras:['Garlic bread','Coleslaw']},Saturday:{meal:'Fish & Chips'},Sunday:{meal:'Roast Beef',extras:['Yorkshire puddings']}};return `<div class="history-example-note"><strong>Example history</strong><span>This is just a preview of how multiple weeks will look. Your real weeks will replace it once you have history.</span></div>${exampleWeek('Last week · example',weekOne)}${exampleWeek('2 weeks ago · example',weekTwo)}`}
  function renderHistory(){const items=history().slice(0,4);historyWeeks.innerHTML=items.length?items.map((wk,i)=>`<section class="history-week"><div class="history-week-head"><div><strong>${i===0?'Last week':`${i+1} weeks ago`}</strong></div><button type="button" class="secondary history-copy" data-copy-history="${i}">Copy week</button></div>${DAYS.map(day=>historyDay(day,wk.schedule,wk.dayIngredients)).join('')}</section>`).join(''):`<p class="muted">Your completed weeks will appear here.</p>${exampleHistory()}`}
  function copyWeek(index){const wk=history()[index];if(!wk)return;state.schedule=clone(wk.schedule||emptyDayMap());state.dayIngredients=clone(wk.dayIngredients||emptyDayMap());state.extras=clone(wk.extras||[]);state.dayChecks={};historyDialog.close();render();toast('Week copied')}

  const originalOpenSlot=openSlot;
  openSlot=function(day){originalOpenSlot(day);if(!slotType.querySelector('option[value="dish"]')){slotType.value='leftovers';toggleSlotFields()}};
  slotType.querySelector('option[value="dish"]')?.remove();

  document.addEventListener('click',e=>{const add=e.target.closest('[data-day]');if(add){e.preventDefault();e.stopImmediatePropagation();openQuick(add.dataset.day);return}const q=e.target.closest('[data-quick-dish]');if(q){addQuick(q.dataset.quickDish);return}const copy=e.target.closest('[data-copy-history]');if(copy)copyWeek(Number(copy.dataset.copyHistory))},true);
  quickMealSearch.addEventListener('input',()=>{const q=quickMealSearch.value.trim().toLowerCase();if(!q){quickMealSearchResults.innerHTML='';return}const results=state.dishes.filter(d=>d.name.toLowerCase().includes(q)||(d.ingredients||[]).some(i=>i.toLowerCase().includes(q))).sort((a,b)=>Number(b.favourite)-Number(a.favourite)||a.name.localeCompare(b.name)).slice(0,20);quickMealSearchResults.innerHTML=results.map(d=>`<button type="button" class="dish-result" data-quick-dish="${d.id}"><span>${d.favourite?'♥ ':''}${esc(d.name)}</span></button>`).join('')||'<p class="muted ingredient-empty">No matching meals.</p>'});
  closeQuickMealDialog.onclick=cancelQuickMealBtn.onclick=()=>{quickMealDialog.close();quickDay=null};
  viewHistoryBtn.onclick=()=>{renderHistory();historyDialog.showModal()};closeHistoryDialog.onclick=()=>historyDialog.close();
  startNextWeekBtn.onclick=handleWeekButton;
  closeStartNextWeekDialog.onclick=cancelStartNextWeekBtn.onclick=()=>startNextWeekDialog.close();confirmStartNextWeekBtn.onclick=startNextWeek;
  ensureWeek();
})();