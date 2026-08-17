const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const seedDishes=[
 {id:'seed-fajitas',name:'Chicken Fajitas',ingredients:['Chicken breast','Tortillas','Bell peppers','Onion','Cheese','Sour cream'],favourite:true,source:'seed'},
 {id:'seed-bolognese',name:'Spaghetti Bolognese',ingredients:['Spaghetti','Beef mince','Onion','Garlic','Chopped tomatoes','Tomato puree','Italian herbs','Parmesan'],favourite:true,source:'seed'},
 {id:'seed-curry',name:'Chicken Curry',ingredients:['Chicken breast','Rice','Onion','Garlic','Ginger','Coconut milk','Curry powder'],favourite:false,source:'seed'},
 {id:'seed-burgers',name:'Burgers',ingredients:['Burgers','Burger buns','Cheese','Lettuce','Tomato','Onion'],favourite:false,source:'seed'},
 {id:'seed-roast',name:'Roast Chicken',ingredients:['Whole chicken','Potatoes','Carrots','Broccoli','Gravy'],favourite:false,source:'seed'},
 {id:'seed-lasagne',name:'Lasagne',ingredients:['Beef mince','Lasagne sheets','Onion','Garlic','Chopped tomatoes','Cheese','Milk'],favourite:false,source:'seed'}
];
const freshState=()=>({dishes:seedDishes,schedule:Object.fromEntries(DAYS.map(d=>[d,[]])),extras:[],shopping:[],customIngredients:[]});
let state=load();let editingId=null;let activeDay=null;let draftIngredients=[];

function load(){
 try{
  const saved=JSON.parse(localStorage.getItem('food-schedule-v1'))||{};
  const base=freshState();
  const merged={...base,...saved};
  merged.customIngredients=Array.isArray(saved.customIngredients)?saved.customIngredients:[];
  merged.shopping=Array.isArray(saved.shopping)?saved.shopping:[];
  return merged;
 }catch{return freshState()}
}
function save(){localStorage.setItem('food-schedule-v1',JSON.stringify(state))}
function id(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random()}
function cleanName(s){return s.trim().replace(/\s+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function uniqueIngredients(list){const seen=new Map();for(const raw of list){const n=cleanName(raw);if(n&&!seen.has(n.toLowerCase()))seen.set(n.toLowerCase(),n)}return [...seen.values()]}
function allIngredients(){return uniqueIngredients([...seedDishes.flatMap(d=>d.ingredients),...state.dishes.flatMap(d=>d.ingredients||[]),...state.customIngredients]).sort((a,b)=>a.localeCompare(b))}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,2200)}
function render(){syncShopping();renderWeek();renderDishes();renderShopping();save()}

function renderWeek(){
 const grid=document.querySelector('#weekGrid');
 grid.innerHTML=DAYS.map(day=>`<article class="day"><h3>${day}</h3>${state.schedule[day].map((slot,i)=>{const dish=state.dishes.find(d=>d.id===slot.dishId);const title=slot.type==='dish'?(dish?.name||'Missing dish'):(slot.label||slot.type.replace('-',' '));return `<div class="slot"><div><strong>${esc(title)}</strong><small>${slot.type==='dish'?'Meal':esc(slot.type.replace('-',' '))}</small></div><button data-remove-slot="${day}|${i}" aria-label="Remove">×</button></div>`}).join('')}<button class="add-slot" data-day="${day}">+ Add</button></article>`).join('');
 document.querySelector('#extrasList').innerHTML=state.extras.map((x,i)=>`<span class="chip">${esc(x.name)} <small>${x.type}</small><button data-extra-remove="${i}">×</button></span>`).join('')
}
function renderDishes(){
 const q=document.querySelector('#dishSearch').value.toLowerCase();
 const dishes=[...state.dishes].sort((a,b)=>Number(b.favourite)-Number(a.favourite)||a.name.localeCompare(b.name)).filter(d=>!q||d.name.toLowerCase().includes(q)||(d.ingredients||[]).some(i=>i.toLowerCase().includes(q)));
 document.querySelector('#dishGrid').innerHTML=dishes.map(d=>`<article class="dish-card" data-edit-dish="${d.id}"><span class="heart">${d.favourite?'♥':'♡'}</span><h3>${esc(d.name)}</h3><div class="ingredients">${(d.ingredients||[]).map(esc).join(' · ')}</div></article>`).join('')||'<p class="muted">No dishes found.</p>'
}
function renderShopping(){
 const list=document.querySelector('#shoppingList');
 list.innerHTML=state.shopping.map((x,i)=>`<label class="shop-item ${x.checked?'checked':''}"><input type="checkbox" data-shop-check="${i}" ${x.checked?'checked':''}><span>${esc(x.name)}</span>${x.manual?'<small>Added</small>':''}<button type="button" data-shop-remove="${i}" aria-label="Remove">×</button></label>`).join('')||'<div class="shop-item"><span class="muted">Add dishes to your week and their ingredients will appear here automatically.</span></div>'
}
function syncShopping(){
 const previous=new Map((state.shopping||[]).map(x=>[x.name.toLowerCase(),x]));
 const wanted=new Map();
 for(const day of DAYS)for(const slot of state.schedule[day]||[])if(slot.type==='dish'){
  const dish=state.dishes.find(d=>d.id===slot.dishId);
  for(const ing of dish?.ingredients||[]){const key=ing.toLowerCase();if(!wanted.has(key))wanted.set(key,ing)}
 }
 for(const extra of state.extras||[]){const key=extra.name.toLowerCase();if(!wanted.has(key))wanted.set(key,extra.name)}
 const generated=[...wanted].map(([key,name])=>({name,checked:previous.get(key)?.checked||false,manual:false}));
 const manual=(state.shopping||[]).filter(x=>x.manual).map(x=>({name:x.name,checked:x.checked||false,manual:true}));
 const combined=new Map();
 for(const item of [...generated,...manual]){
  const key=item.name.toLowerCase();
  if(!combined.has(key))combined.set(key,item);
  else if(item.manual)combined.set(key,{...combined.get(key),checked:item.checked||combined.get(key).checked,manual:true});
 }
 state.shopping=[...combined.values()].sort((a,b)=>a.name.localeCompare(b.name));
}

function openDish(dish){
 editingId=dish?.id||null;
 draftIngredients=[...(dish?.ingredients||[])];
 document.querySelector('#dishDialogTitle').textContent=dish?'Edit dish':'New dish';
 document.querySelector('#dishName').value=dish?.name||'';
 document.querySelector('#dishFavourite').checked=!!dish?.favourite;
 document.querySelector('#deleteDishBtn').hidden=!dish;
 document.querySelector('#ingredientSearch').value='';
 document.querySelector('#customIngredientInput').value='';
 renderIngredientPicker();
 document.querySelector('#dishDialog').showModal();
}
function renderIngredientPicker(){
 const q=document.querySelector('#ingredientSearch').value.trim().toLowerCase();
 const selected=new Set(draftIngredients.map(x=>x.toLowerCase()));
 const ingredients=allIngredients().filter(x=>!q||x.toLowerCase().includes(q));
 document.querySelector('#ingredientCount').textContent=`${draftIngredients.length} selected`;
 document.querySelector('#ingredientPicker').innerHTML=ingredients.map(name=>`<label class="ingredient-option"><input type="checkbox" data-ingredient="${escAttr(name)}" ${selected.has(name.toLowerCase())?'checked':''}><span>${esc(name)}</span></label>`).join('')||'<p class="muted ingredient-empty">No matching ingredients. Add it below.</p>';
}
function addCustomIngredient(){
 const input=document.querySelector('#customIngredientInput');const name=cleanName(input.value);if(!name)return;
 if(!state.customIngredients.some(x=>x.toLowerCase()===name.toLowerCase()))state.customIngredients.push(name);
 if(!draftIngredients.some(x=>x.toLowerCase()===name.toLowerCase()))draftIngredients.push(name);
 input.value='';document.querySelector('#ingredientSearch').value='';renderIngredientPicker();save();toast(`${name} added`);
}
function openSlot(day){activeDay=day;document.querySelector('#slotTitle').textContent=`Add to ${day}`;document.querySelector('#slotType').value='dish';document.querySelector('#slotDish').innerHTML=[...state.dishes].sort((a,b)=>Number(b.favourite)-Number(a.favourite)||a.name.localeCompare(b.name)).map(d=>`<option value="${d.id}">${esc(d.name)}${d.favourite?' ♥':''}</option>`).join('');toggleSlotFields();document.querySelector('#slotDialog').showModal()}
function toggleSlotFields(){const type=document.querySelector('#slotType').value;document.querySelector('#slotDishWrap').hidden=type!=='dish';document.querySelector('#slotLabelWrap').hidden=!['custom','leftovers','takeaway','eating-out'].includes(type);const input=document.querySelector('#slotLabel');input.placeholder={leftovers:'Optional: leftovers from Monday',takeaway:'Optional: Pizza','eating-out':'Optional: Restaurant',custom:'e.g. Freezer meal'}[type]||''}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function escAttr(s=''){return esc(s)}

document.addEventListener('click',e=>{
 const tab=e.target.closest('[data-view]');if(tab){document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));tab.classList.add('active');document.querySelector('#'+tab.dataset.view).classList.add('active')}
 const add=e.target.closest('[data-day]');if(add)openSlot(add.dataset.day);
 const rem=e.target.closest('[data-remove-slot]');if(rem){const [day,i]=rem.dataset.removeSlot.split('|');state.schedule[day].splice(+i,1);render()}
 const edit=e.target.closest('[data-edit-dish]');if(edit)openDish(state.dishes.find(d=>d.id===edit.dataset.editDish));
 const er=e.target.closest('[data-extra-remove]');if(er){state.extras.splice(+er.dataset.extraRemove,1);render()}
 const sr=e.target.closest('[data-shop-remove]');if(sr){const item=state.shopping[+sr.dataset.shopRemove];if(item?.manual){state.shopping.splice(+sr.dataset.shopRemove,1);render()}else toast('Remove this item by changing its dish or weekly extra')}
});
document.addEventListener('change',e=>{
 if(e.target.matches('[data-shop-check]')){state.shopping[+e.target.dataset.shopCheck].checked=e.target.checked;renderShopping();save()}
 if(e.target.matches('[data-ingredient]')){const name=e.target.dataset.ingredient;if(e.target.checked){if(!draftIngredients.some(x=>x.toLowerCase()===name.toLowerCase()))draftIngredients.push(name)}else draftIngredients=draftIngredients.filter(x=>x.toLowerCase()!==name.toLowerCase());renderIngredientPicker()}
});
document.querySelector('#dishSearch').addEventListener('input',renderDishes);
document.querySelector('#ingredientSearch').addEventListener('input',renderIngredientPicker);
document.querySelector('#newDishBtn').onclick=()=>openDish();
document.querySelector('#slotType').onchange=toggleSlotFields;
document.querySelector('#addCustomIngredientBtn').onclick=addCustomIngredient;
document.querySelector('#customIngredientInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addCustomIngredient()}});
document.querySelector('#dishForm').addEventListener('submit',e=>{
 e.preventDefault();
 const name=cleanName(document.querySelector('#dishName').value);if(!name)return;
 const dish={id:editingId||id(),name,ingredients:uniqueIngredients(draftIngredients),favourite:document.querySelector('#dishFavourite').checked,source:editingId?(state.dishes.find(d=>d.id===editingId)?.source||'user'):'user'};
 if(editingId)state.dishes=state.dishes.map(d=>d.id===editingId?dish:d);else state.dishes.push(dish);
 document.querySelector('#dishDialog').close();render();
});
document.querySelector('#deleteDishBtn').onclick=()=>{if(!editingId)return;state.dishes=state.dishes.filter(d=>d.id!==editingId);for(const day of DAYS)state.schedule[day]=state.schedule[day].filter(s=>s.dishId!==editingId);document.querySelector('#dishDialog').close();render()};
document.querySelector('#slotForm').addEventListener('submit',e=>{e.preventDefault();const type=document.querySelector('#slotType').value;state.schedule[activeDay].push({type,dishId:type==='dish'?document.querySelector('#slotDish').value:null,label:type==='dish'?'':document.querySelector('#slotLabel').value.trim()});document.querySelector('#slotLabel').value='';document.querySelector('#slotDialog').close();render()});
document.querySelector('#addExtraBtn').onclick=()=>{const input=document.querySelector('#extraInput');if(!input.value.trim())return;state.extras.push({name:cleanName(input.value),type:document.querySelector('#extraType').value});input.value='';render()};
document.querySelector('#addShopBtn').onclick=()=>{const input=document.querySelector('#customShopInput');const name=cleanName(input.value);if(!name)return;const existing=state.shopping.find(x=>x.name.toLowerCase()===name.toLowerCase());if(existing)existing.manual=true;else state.shopping.push({name,checked:false,manual:true});input.value='';render()};
document.querySelector('#clearCheckedBtn').onclick=()=>{state.shopping=state.shopping.filter(x=>!(x.checked&&x.manual));for(const item of state.shopping)item.checked=false;render()};
render();
