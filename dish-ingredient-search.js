(() => {
  window.renderIngredientPicker = function renderDishIngredientPicker() {
    const q = ingredientSearch.value.trim().toLowerCase();
    const selected = new Set(draftIngredients.map(name => name.toLowerCase()));
    const visible = unique(draftIngredientOptions);

    ingredientCount.textContent = `${draftIngredients.length} selected`;
    selectedIngredientPicker.innerHTML = visible.length
      ? visible.map(name => `<label class="ingredient-option"><input type="checkbox" data-selected-ingredient="${esc(name)}" ${selected.has(name.toLowerCase()) ? 'checked' : ''}><span>${esc(name)}</span></label>`).join('')
      : '<p class="muted ingredient-empty">No ingredients selected yet.</p>';

    if (!q) {
      ingredientPicker.hidden = true;
      ingredientPicker.innerHTML = '';
      return;
    }

    const optionSet = new Set(visible.map(name => name.toLowerCase()));
    const available = allIngredients()
      .filter(name => !optionSet.has(name.toLowerCase()) && name.toLowerCase().includes(q))
      .slice(0, 20);
    const custom = cleanName(ingredientSearch.value);

    ingredientPicker.innerHTML = [
      ...available.map(name => `<label class="ingredient-option"><input type="checkbox" data-add-ingredient="${esc(name)}"><span>${esc(name)}</span></label>`),
      ...(custom ? [`<button type="button" class="dish-result custom-add-result dish-custom-add" data-dish-custom-add="${esc(custom)}"><span>+ Add “${esc(custom)}”</span><small>Custom</small></button>`] : [])
    ].join('');
    ingredientPicker.hidden = false;
  };

  document.addEventListener('click', event => {
    const custom = event.target.closest('[data-dish-custom-add]');
    if (!custom) return;
    event.preventDefault();
    const name = cleanName(custom.dataset.dishCustomAdd || '');
    if (!name) return;
    if (!state.customIngredients.some(item => item.toLowerCase() === name.toLowerCase())) state.customIngredients.push(name);
    if (!draftIngredientOptions.some(item => item.toLowerCase() === name.toLowerCase())) draftIngredientOptions.push(name);
    if (!draftIngredients.some(item => item.toLowerCase() === name.toLowerCase())) draftIngredients.push(name);
    ingredientSearch.value = '';
    renderIngredientPicker();
  });
})();