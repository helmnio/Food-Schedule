(() => {
  const USAGE_KEY = 'food-schedule-shopping-item-usage-v1';

  function usage() {
    try { return JSON.parse(localStorage.getItem(USAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function recordItem(raw) {
    const name = cleanName(raw || '');
    if (!name) return;
    const counts = usage();
    counts[name] = (counts[name] || 0) + 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(counts));
    if (!state.previousItems.some(item => item.toLowerCase() === name.toLowerCase())) state.previousItems.push(name);
  }

  function extraNames(){return new Set((state.extras||[]).map(item=>(typeof item==='string'?item:item.name||'').toLowerCase()))}

  function quickItems() {
    const counts = usage();
    const inList = new Set([...state.shopping.map(item => item.name.toLowerCase()), ...extraNames()]);
    const known = unique([...(state.previousItems || []), ...Object.keys(counts)]).filter(name => !inList.has(name.toLowerCase()));
    return known.sort((a, b) => (counts[b] || 0) - (counts[a] || 0) || a.localeCompare(b)).slice(0, 5);
  }

  function renderQuickItems() {
    const items = quickItems();
    shoppingQuickItems.innerHTML = items.length
      ? items.map(name => `<button type="button" class="quick-shop-pill" data-quick-shop="${esc(name)}">${esc(name)}</button>`).join('')
      : '<span class="muted">Items you add regularly will appear here.</span>';
  }

  function openShoppingAdd() {
    customShopInput.value = '';
    shopSuggestions.hidden = true;
    shopSuggestions.innerHTML = '';
    renderQuickItems();
    shoppingAddDialog.showModal();
    setTimeout(() => customShopInput.focus(), 0);
  }

  function closeShoppingAdd() {
    shoppingAddDialog.close();
    customShopInput.value = '';
    shopSuggestions.hidden = true;
  }

  function addAsExtra(raw){
    const name=cleanName(raw||'');
    if(!name)return;
    recordItem(name);
    if(!extraNames().has(name.toLowerCase())) state.extras.push({name,type:''});
    save();render();closeShoppingAdd();toast('Item added');
  }

  addShopBtn.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    openShoppingAdd();
  }, true);

  shoppingPopupAddBtn.addEventListener('click', () => addAsExtra(customShopInput.value));

  customShopInput.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addAsExtra(customShopInput.value);
  });

  document.addEventListener('click', event => {
    const quick = event.target.closest('[data-quick-shop]');
    if (quick) {
      addAsExtra(quick.dataset.quickShop);
      return;
    }

    const suggestion = event.target.closest('[data-shop-suggestion]');
    if (suggestion && shoppingAddDialog.open) {
      event.preventDefault();
      event.stopImmediatePropagation();
      addAsExtra(suggestion.dataset.shopSuggestion);
    }
  }, true);

  closeShoppingAddDialog.onclick = cancelShoppingAddBtn.onclick = closeShoppingAdd;
})();