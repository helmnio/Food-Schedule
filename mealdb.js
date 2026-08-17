(() => {
  const API = 'https://www.themealdb.com/api/json/v1/1';
  const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const REFRESH_AFTER = 365 * 24 * 60 * 60 * 1000;
  const META_KEY = 'food-schedule-mealdb-meta-v1';

  function mealIngredients(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i += 1) {
      const value = String(meal[`strIngredient${i}`] || '').trim();
      if (value) ingredients.push(value);
    }
    return unique(ingredients);
  }

  function normaliseMeal(meal) {
    return {
      id: `mealdb-${meal.idMeal}`,
      mealDbId: meal.idMeal,
      name: String(meal.strMeal || '').trim(),
      ingredients: mealIngredients(meal),
      favourite: false,
      source: 'mealdb'
    };
  }

  async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TheMealDB request failed: ${response.status}`);
    return response.json();
  }

  async function fetchMeals() {
    const meals = [];
    for (let start = 0; start < LETTERS.length; start += 5) {
      const batch = LETTERS.slice(start, start + 5);
      const results = await Promise.all(
        batch.map(letter => getJson(`${API}/search.php?f=${letter}`))
      );
      for (const result of results) meals.push(...(result.meals || []));
    }
    const byId = new Map();
    for (const meal of meals) {
      if (meal?.idMeal && meal?.strMeal) byId.set(meal.idMeal, normaliseMeal(meal));
    }
    return [...byId.values()];
  }

  async function fetchIngredients() {
    const result = await getJson(`${API}/list.php?i=list`);
    return unique((result.meals || []).map(item => item.strIngredient).filter(Boolean));
  }

  function mergeCatalogue(meals, ingredients) {
    const existingIds = new Set(state.dishes.map(dish => dish.id));
    const existingNames = new Set(state.dishes.map(dish => dish.name.toLowerCase().trim()));
    let added = 0;

    for (const meal of meals) {
      if (existingIds.has(meal.id) || existingNames.has(meal.name.toLowerCase().trim())) continue;
      state.dishes.push(meal);
      existingIds.add(meal.id);
      existingNames.add(meal.name.toLowerCase().trim());
      added += 1;
    }

    const ingredientNames = new Set(state.customIngredients.map(name => name.toLowerCase()));
    for (const ingredient of ingredients) {
      const name = cleanName(ingredient);
      if (!ingredientNames.has(name.toLowerCase())) {
        state.customIngredients.push(name);
        ingredientNames.add(name.toLowerCase());
      }
    }

    localStorage.setItem(META_KEY, JSON.stringify({
      updatedAt: Date.now(),
      mealCount: meals.length,
      ingredientCount: ingredients.length
    }));

    render();
    return added;
  }

  async function hydrateMealDb() {
    const meta = JSON.parse(localStorage.getItem(META_KEY) || 'null');
    const alreadyLoaded = state.dishes.some(dish => dish.source === 'mealdb');
    const isFresh = meta?.updatedAt && Date.now() - meta.updatedAt < REFRESH_AFTER;

    if (alreadyLoaded && isFresh) return;

    try {
      toast(alreadyLoaded ? 'Refreshing meal catalogue…' : 'Loading meal catalogue…');
      const [meals, ingredients] = await Promise.all([fetchMeals(), fetchIngredients()]);
      const added = mergeCatalogue(meals, ingredients);
      toast(added ? `${added} dishes added from TheMealDB` : 'Meal catalogue is up to date');
    } catch (error) {
      console.error('TheMealDB import failed', error);
      if (!alreadyLoaded) toast('Could not load TheMealDB catalogue');
    }
  }

  hydrateMealDb();
})();
