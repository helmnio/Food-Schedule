(() => {
  const USAGE_KEY = 'food-schedule-shopping-item-usage-v1';
  let ingredientDay = null;

  window.dayIngredientPicker = function dayIngredientPickerPopup(day) {
    const items = (state.dayIngredients[day] || []).map((name, index) =>
      `<span class="day-extra-chip">${esc(name)}<button type="button" data-remove-day-ingredient="${day}|${index}">×</button></span>`
    ).join('');
    return `<div class="day-extras"><div class="day-extra-list">${items}</div><button type="button" class="add-slot day-ingredient-open" data-open-day-ingredient="${day}">+ Add item</button></div>`;
  };

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

  function quickItems() {
    const counts = usage();
    const selected = new Set((state.dayIngredients[ingredientDay] || []).map(name => name.toLowerCase()));
    const known = unique([...(state.previousItems || []), ...Object.keys(counts)])
      .filter(name => !selected.has(name.toLowerCase()));
    return known.sort((a, b) => (counts[b] || 0) - (counts[a] || 0) || a.localeCompare(b)).slice(0, 5);
  }

  function renderQuickItems() {
    const items = quickItems();
    dayQuickItems.innerHTML = items.length
      ? items.map(name => `<button type="button" class="quick-shop-pill" data-day-quick-item="${esc(name)}">${esc(name)}</button>`).join('')
      : '<span class="muted">Items you add regularly will appear here.</span>';
  }

  function closeIngredientDialog() {
    dayIngredientDialog.close();
    ingredientDay = null;
    dayIngredientSearch.value = '';
    dayIngredientResults.innerHTML = '';
  }

  function renderIngredientResults() {
    const q = dayIngredientSearch.value.trim().toLowerCase();
    if (!q) {
      dayIngredientResults.innerHTML = '';
      return;
    }
    const selected = new Set((state.dayIngredients[ingredientDay] || []).map(name => name.toLowerCase()));
    const counts = usage();
    const known = unique([...allIngredients(), ...(state.previousItems || []), ...Object.keys(counts)]);
    const matches = known.filter(name => !selected.has(name.toLowerCase()) && name.toLowerCase().includes(q)).slice(0, 20);
    const clean = cleanName(dayIngredientSearch.value);
    const exact = matches.some(name => name.toLowerCase() === clean.toLowerCase()) || selected.has(clean.toLowerCase());
    dayIngredientResults.innerHTML = [
      ...matches.map(name => `<button type="button" class="dish-result" data-day-ingredient-pick="${esc(name)}"><span>${esc(name)}</span></button>`),
      ...(!exact && clean ? [`<button type="button" class="dish-result" data-day-ingredient-pick="${esc(clean)}"><span>+ Add “${esc(clean)}”</span><small>New item</small></button>`] : [])
    ].join('') || '<p class="muted ingredient-empty">No matching items.</p>';
  }

  function addItem(raw) {
    const name = cleanName(raw || '');
    if (!name || !ingredientDay) return;
    recordItem(name);
    addDayIngredient(ingredientDay, name);
    closeIngredientDialog();
  }

  document.addEventListener('click', event => {
    const open = event.target.closest('[data-open-day-ingredient]');
    if (open) {
      ingredientDay = open.dataset.openDayIngredient;
      dayIngredientDialogTitle.textContent = `Add item to ${ingredientDay}`;
      dayIngredientSearch.value = '';
      dayIngredientResults.innerHTML = '';
      renderQuickItems();
      dayIngredientDialog.showModal();
      setTimeout(() => dayIngredientSearch.focus(), 0);
      return;
    }

    const quick = event.target.closest('[data-day-quick-item]');
    if (quick && ingredientDay) {
      addItem(quick.dataset.dayQuickItem);
      return;
    }

    const pick = event.target.closest('[data-day-ingredient-pick]');
    if (pick && ingredientDay) addItem(pick.dataset.dayIngredientPick);
  });

  dayIngredientSearch.addEventListener('input', renderIngredientResults);
  dayItemPopupAddBtn.addEventListener('click', () => addItem(dayIngredientSearch.value));
  dayIngredientSearch.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addItem(dayIngredientSearch.value);
  });
  closeDayIngredientDialog.onclick = cancelDayIngredientBtn.onclick = closeIngredientDialog;

  renderWeek();
})();