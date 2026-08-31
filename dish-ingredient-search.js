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

  function renderDishPicker() {
    const q = ingredientSearch.value.trim().toLowerCase();
    const selected = new Set(draftIngredients.map(name => name.toLowerCase()));
    const visible = unique(draftIngredientOptions);
    ingredientCount.textContent = `${draftIngredients.length} selected`;
    selectedIngredientPicker.innerHTML = visible.length
      ? visible.map(name => `<label class="ingredient-option"><input type="checkbox" data-selected-ingredient="${esc(name)}" ${selected.has(name.toLowerCase()) ? 'checked' : ''}><span>${esc(name)}</span></label>`).join('')
      : '<p class="muted ingredient-empty">No ingredients selected yet.</p>';
    if (!q) { ingredientPicker.hidden = true; ingredientPicker.innerHTML = ''; return; }
    const optionSet = new Set(visible.map(name => name.toLowerCase()));
    const available = allIngredients().filter(name => !optionSet.has(name.toLowerCase()) && name.toLowerCase().includes(q));
    ingredientPicker.innerHTML = available.map(name => `<label class="ingredient-option"><input type="checkbox" data-add-ingredient="${esc(name)}"><span>${esc(name)}</span></label>`).join('') + customResult(ingredientSearch.value, 'data-dish-custom-add');
    ingredientPicker.hidden = false;
  }

  function renderMealPicker() {
    const q = mealIngredientSearch.value.trim().toLowerCase();
    const selected = new Set(mealDraftIngredients.map(name => name.toLowerCase()));
    const visible = unique(mealDraftIngredientOptions);
    mealIngredientCount.textContent = `${mealDraftIngredients.length} selected`;
    mealSelectedIngredients.innerHTML = visible.length
      ? visible.map(name => `<label class="ingredient-option"><input type="checkbox" data-meal-selected-ingredient="${esc(name)}" ${selected.has(name.toLowerCase()) ? 'checked' : ''}><span>${esc(name)}</span></label>`).join('')
      : '<p class="muted ingredient-empty">No ingredients selected.</p>';
    if (!q) { mealIngredientPicker.hidden = true; mealIngredientPicker.innerHTML = ''; return; }
    const optionSet = new Set(visible.map(name => name.toLowerCase()));
    const available = allIngredients().filter(name => !optionSet.has(name.toLowerCase()) && name.toLowerCase().includes(q));
    mealIngredientPicker.innerHTML = available.map(name => `<label class="ingredient-option"><input type="checkbox" data-meal-add-ingredient="${esc(name)}"><span>${esc(name)}</span></label>`).join('') + customResult(mealIngredientSearch.value, 'data-meal-custom-add');
    mealIngredientPicker.hidden = false;
  }

  window.renderIngredientPicker = renderDishPicker;
  window.renderMealIngredientPicker = renderMealPicker;
  ingredientSearch.oninput = renderDishPicker;
  mealIngredientSearch.oninput = renderMealPicker;

  document.addEventListener('click', event => {
    const dishCustom = event.target.closest('[data-dish-custom-add]');
    if (dishCustom) {
      event.preventDefault(); event.stopImmediatePropagation();
      const name = cleanName(dishCustom.dataset.dishCustomAdd || '');
      if (!name) return;
      if (!draftIngredientOptions.some(item => item.toLowerCase() === name.toLowerCase())) draftIngredientOptions.push(name);
      if (!draftIngredients.some(item => item.toLowerCase() === name.toLowerCase())) draftIngredients.push(name);
      ingredientSearch.value = ''; renderDishPicker(); return;
    }
    const mealCustom = event.target.closest('[data-meal-custom-add]');
    if (mealCustom) {
      event.preventDefault(); event.stopImmediatePropagation();
      const name = cleanName(mealCustom.dataset.mealCustomAdd || '');
      if (!name) return;
      if (!mealDraftIngredientOptions.some(item => item.toLowerCase() === name.toLowerCase())) mealDraftIngredientOptions.push(name);
      if (!mealDraftIngredients.some(item => item.toLowerCase() === name.toLowerCase())) mealDraftIngredients.push(name);
      mealIngredientSearch.value = ''; renderMealPicker();
    }
  }, true);

  /* Keep legacy controls in the DOM because app.js references them when opening/editing meals. */
  const dishLegacyRow = document.querySelector('#customIngredientInput')?.closest('.custom-ingredient-row');
  if (dishLegacyRow) dishLegacyRow.hidden = true;
  const mealLegacyRow = document.querySelector('#mealCustomIngredientInput')?.closest('.custom-ingredient-row');
  if (mealLegacyRow) mealLegacyRow.hidden = true;
})();