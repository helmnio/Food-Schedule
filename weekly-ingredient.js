(() => {
  let ingredientDay = null;

  window.dayIngredientPicker = function dayIngredientPickerPopup(day) {
    const items = (state.dayIngredients[day] || []).map((name, index) =>
      `<span class="day-extra-chip">${esc(name)}<button type="button" data-remove-day-ingredient="${day}|${index}">×</button></span>`
    ).join('');
    return `<div class="day-extras"><div class="day-extra-list">${items}</div><button type="button" class="add-slot day-ingredient-open" data-open-day-ingredient="${day}">+ Add ingredient</button></div>`;
  };

  function closeIngredientDialog() {
    dayIngredientDialog.close();
    ingredientDay = null;
    dayIngredientSearch.value = '';
    dayIngredientResults.innerHTML = '';
  }

  function renderIngredientResults() {
    const q = dayIngredientSearch.value.trim().toLowerCase();
    if (!q) {
      dayIngredientResults.innerHTML = '<p class="muted ingredient-empty">Start typing to search ingredients.</p>';
      return;
    }
    const selected = new Set((state.dayIngredients[ingredientDay] || []).map(name => name.toLowerCase()));
    const matches = allIngredients().filter(name => !selected.has(name.toLowerCase()) && name.toLowerCase().includes(q)).slice(0, 20);
    const clean = cleanName(dayIngredientSearch.value);
    const exact = matches.some(name => name.toLowerCase() === clean.toLowerCase()) || selected.has(clean.toLowerCase());
    dayIngredientResults.innerHTML = [
      ...matches.map(name => `<button type="button" class="dish-result" data-day-ingredient-pick="${esc(name)}"><span>${esc(name)}</span></button>`),
      ...(!exact && clean ? [`<button type="button" class="dish-result" data-day-ingredient-pick="${esc(clean)}"><span>+ Add “${esc(clean)}”</span><small>Custom</small></button>`] : [])
    ].join('') || '<p class="muted ingredient-empty">No matching ingredients.</p>';
  }

  document.addEventListener('click', event => {
    const open = event.target.closest('[data-open-day-ingredient]');
    if (open) {
      ingredientDay = open.dataset.openDayIngredient;
      dayIngredientDialogTitle.textContent = `Add ingredient to ${ingredientDay}`;
      dayIngredientSearch.value = '';
      renderIngredientResults();
      dayIngredientDialog.showModal();
      setTimeout(() => dayIngredientSearch.focus(), 0);
      return;
    }

    const pick = event.target.closest('[data-day-ingredient-pick]');
    if (pick && ingredientDay) {
      addDayIngredient(ingredientDay, pick.dataset.dayIngredientPick);
      closeIngredientDialog();
    }
  });

  dayIngredientSearch.addEventListener('input', renderIngredientResults);
  closeDayIngredientDialog.onclick = cancelDayIngredientBtn.onclick = closeIngredientDialog;

  renderWeek();
})();
