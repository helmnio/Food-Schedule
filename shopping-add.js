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
  }

  function quickItems() {
    const counts = usage();
    const inList = new Set(state.shopping.map(item => item.name.toLowerCase()));
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

  addShopBtn.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    openShoppingAdd();
  }, true);

  shoppingPopupAddBtn.addEventListener('click', () => {
    const value = customShopInput.value;
    if (!value.trim()) return;
    recordItem(value);
    addShopping(value);
    closeShoppingAdd();
  });

  customShopInput.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (!customShopInput.value.trim()) return;
    recordItem(customShopInput.value);
    addShopping(customShopInput.value);
    closeShoppingAdd();
  });

  document.addEventListener('click', event => {
    const quick = event.target.closest('[data-quick-shop]');
    if (quick) {
      const name = quick.dataset.quickShop;
      recordItem(name);
      addShopping(name);
      closeShoppingAdd();
      return;
    }

    const suggestion = event.target.closest('[data-shop-suggestion]');
    if (suggestion && shoppingAddDialog.open) {
      recordItem(suggestion.dataset.shopSuggestion);
      setTimeout(closeShoppingAdd, 0);
    }
  }, true);

  closeShoppingAddDialog.onclick = cancelShoppingAddBtn.onclick = closeShoppingAdd;
})();
