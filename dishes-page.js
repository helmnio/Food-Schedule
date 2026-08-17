(() => {
  const WEEK_ID_KEY = 'food-schedule-suggestion-week-v1';
  const WEEK_IDS_KEY = 'food-schedule-suggestion-ids-v1';

  function dishCard(dish, compact = false) {
    const personal = dish.source !== 'mealdb';
    const source = personal ? 'My dish' : 'Catalogue';
    const ingredientText = (dish.ingredients || []).slice(0, compact ? 4 : 8).map(esc).join(' · ');
    const more = (dish.ingredients || []).length > (compact ? 4 : 8) ? ' · …' : '';
    return `<article class="dish-card ${compact ? 'dish-card-compact' : ''}" data-edit-dish="${dish.id}">
      <div class="dish-card-top"><small class="dish-source">${source}</small><span class="heart">${dish.favourite ? '♥' : '♡'}</span></div>
      <h3>${esc(dish.name)}</h3>
      <div class="ingredients">${ingredientText}${more}</div>
    </article>`;
  }

  function personalDishes() {
    return state.dishes
      .filter(dish => dish.source !== 'mealdb')
      .sort((a, b) => Number(b.favourite) - Number(a.favourite) || a.name.localeCompare(b.name));
  }

  function favouriteDishes() {
    return state.dishes
      .filter(dish => dish.favourite)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function catalogueDishes() {
    return state.dishes.filter(dish => dish.source === 'mealdb');
  }

  function weekKey(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${String(week).padStart(2, '0')}`;
  }

  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function weeklySuggestions() {
    const catalogue = catalogueDishes();
    if (!catalogue.length) return [];
    const currentWeek = weekKey();
    const savedWeek = localStorage.getItem(WEEK_ID_KEY);
    let ids = [];
    try { ids = JSON.parse(localStorage.getItem(WEEK_IDS_KEY) || '[]'); } catch {}

    if (savedWeek !== currentWeek || ids.length !== 4 || ids.some(id => !catalogue.some(d => d.id === id))) {
      const ranked = [...catalogue].sort((a, b) => hash(`${currentWeek}:${a.id}`) - hash(`${currentWeek}:${b.id}`));
      ids = ranked.slice(0, 4).map(dish => dish.id);
      localStorage.setItem(WEEK_ID_KEY, currentWeek);
      localStorage.setItem(WEEK_IDS_KEY, JSON.stringify(ids));
    }
    return ids.map(id => catalogue.find(dish => dish.id === id)).filter(Boolean);
  }

  function renderSection(el, dishes, emptyMessage, horizontal = false) {
    if (!el) return;
    el.classList.toggle('dish-strip', horizontal);
    el.innerHTML = dishes.length ? dishes.map(d => dishCard(d, horizontal)).join('') : `<div class="dish-empty">${emptyMessage}</div>`;
  }

  window.renderDishes = function renderDishesRedesigned() {
    const favourites = favouriteDishes();
    const mine = personalDishes();
    const ideas = weeklySuggestions();
    const q = (dishSearch?.value || '').trim().toLowerCase();

    renderSection(document.querySelector('#favouriteDishGrid'), favourites, 'Heart dishes to keep your regulars here.', true);
    renderSection(document.querySelector('#personalDishGrid'), mine, 'Your created or customised dishes will appear here.');
    renderSection(document.querySelector('#suggestedDishGrid'), ideas, 'Weekly ideas will appear once the meal catalogue has loaded.', true);

    if (!dishGrid) return;
    if (!q) {
      dishGrid.innerHTML = '<div class="dish-search-empty"><strong>Search the full dish catalogue</strong><span>Type a dish or ingredient above. Your own dishes are prioritised in results.</span></div>';
      return;
    }

    const results = [...state.dishes]
      .filter(dish => dish.name.toLowerCase().includes(q) || (dish.ingredients || []).some(i => i.toLowerCase().includes(q)))
      .sort((a, b) => {
        const aPersonal = a.source !== 'mealdb' ? 1 : 0;
        const bPersonal = b.source !== 'mealdb' ? 1 : 0;
        if (aPersonal !== bPersonal) return bPersonal - aPersonal;
        if (Number(a.favourite) !== Number(b.favourite)) return Number(b.favourite) - Number(a.favourite);
        const aStarts = a.name.toLowerCase().startsWith(q) ? 1 : 0;
        const bStarts = b.name.toLowerCase().startsWith(q) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 40);

    dishGrid.innerHTML = results.length ? results.map(d => dishCard(d)).join('') : '<div class="dish-empty">No matching dishes found.</div>';
  };

  if (typeof dishSearch !== 'undefined' && dishSearch) dishSearch.oninput = window.renderDishes;
  window.renderDishes();
})();
