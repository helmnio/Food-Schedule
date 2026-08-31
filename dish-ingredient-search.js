(() => {
  const RESET_KEY = 'food-schedule-custom-ingredients-cleared-v1';

  if (!localStorage.getItem(RESET_KEY)) {
    state.customIngredients = [];
    save();
    localStorage.setItem(RESET_KEY, '1');
  }

  function customResult(value, attribute) {
    const name = cleanName(value || '');
    if (!name) return '';
    return `<button type="button" class="dish-result custom-add-result" ${attribute}="${esc(name)}"><span>+ Add custom ingredient “${esc(name)}”</span></button>`;
  }

  function resultsFor(query, excluded) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allIngredients().filter(name => !excluded.has(name.toLowerCase()) && name.toLowerCase().includes(q));
  }

  function renderDishPicker() {
    const selected = new Set(draftIngredients.map(name => name.toLowerCase()));
    const visible = unique(draftIngredientOptions);
    ingredientCount.textContent = `${draftIngredients.length} selected`;
    selectedIngredientPicker.innerHTML = visible.length
      ? visible.map(name => `<label class="ingredient-option"><input type="checkbox" data-selected-ingredient="${esc(name)}" ${selected.has(name.toLowerCase()) ? 'checked' : ''}><span>${esc(name)}</span></label>`).join('')
      : '<p class="muted ingredient-empty">No ingredients selected yet.</p>';

    const q = ingredientSearch.value.trim();
    if (!q) { ingredientPicker.hidden = true; ingredientPicker.innerHTML = ''; return; }
    const excluded = new Set(visible.map(name => name.toLowerCase()));
    ingredientPicker.innerHTML = resultsFor(q, excluded).map(name => `<label class="ingredient-option"><input type="checkbox" data-add-ingredient="${esc(name)}"><span>${esc(name)}</span></label>`).join('') + customResult(q, 'data-dish-custom-add');
    ingredientPicker.hidden = false;
  }

  function renderMealPicker() {
    const selected = new Set(mealDraftIngredients.map(name => name.toLowerCase()));
    const visible = unique(mealDraftIngredientOptions);
    mealIngredientCount.textContent = `${mealDraftIngredients.length} selected`;
    mealSelectedIngredients.innerHTML = visible.length
      ? visible.map(name => `<label class="ingredient-option"><input type="checkbox" data-meal-selected-ingredient="${esc(name)}" ${selected.has(name.toLowerCase()) ? 'checked' : ''}><span>${esc(name)}</span></label>`).join('')
      : '<p class="muted ingredient-empty">No ingredients selected.</p>';

    const q = mealIngredientSearch.value.trim();
    if (!q) { mealIngredientPicker.hidden = true; mealIngredientPicker.innerHTML = ''; return; }
    const excluded = new Set(visible.map(name => name.toLowerCase()));
    mealIngredientPicker.innerHTML = resultsFor(q, excluded).map(name => `<label class="ingredient-option"><input type="checkbox" data-meal-add-ingredient="${esc(name)}"><span>${esc(name)}</span></label>`).join('') + customResult(q, 'data-meal-custom-add');
    mealIngredientPicker.hidden = false;
  }

  window.renderIngredientPicker = renderDishPicker;
  window.renderMealIngredientPicker = renderMealPicker;

  ingredientSearch.addEventListener('input', renderDishPicker);
  mealIngredientSearch.addEventListener('input', renderMealPicker);

  document.addEventListener('click', event => {
    const dishCustom = event.target.closest('[data-dish-custom-add]');
    if (dishCustom) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const name = cleanName(dishCustom.dataset.dishCustomAdd || '');
      if (!name) return;
      if (!draftIngredientOptions.some(item => item.toLowerCase() === name.toLowerCase())) draftIngredientOptions.push(name);
      if (!draftIngredients.some(item => item.toLowerCase() === name.toLowerCase())) draftIngredients.push(name);
      ingredientSearch.value = '';
      renderDishPicker();
      return;
    }

    const mealCustom = event.target.closest('[data-meal-custom-add]');
    if (mealCustom) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const name = cleanName(mealCustom.dataset.mealCustomAdd || '');
      if (!name) return;
      if (!mealDraftIngredientOptions.some(item => item.toLowerCase() === name.toLowerCase())) mealDraftIngredientOptions.push(name);
      if (!mealDraftIngredients.some(item => item.toLowerCase() === name.toLowerCase())) mealDraftIngredients.push(name);
      mealIngredientSearch.value = '';
      renderMealPicker();
    }
  }, true);

  /* app.js still references these IDs, so retain them invisibly for compatibility only. */
  const dishLegacyRow = document.querySelector('#customIngredientInput')?.closest('.custom-ingredient-row');
  if (dishLegacyRow) dishLegacyRow.style.display = 'none';
  const mealLegacyRow = document.querySelector('#mealCustomIngredientInput')?.closest('.custom-ingredient-row');
  if (mealLegacyRow) mealLegacyRow.style.display = 'none';
})();