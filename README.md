# Food Schedule

A lightweight personal food planner built around the shopping list rather than recipes.

## MVP

- Starter dish library with ingredient-only dishes (no amounts or cooking instructions)
- Optional TheMealDB import to populate more dishes
- Dish search by name or ingredient
- Create, edit, delete and favourite dishes
- Add/remove ingredients freely, including custom ingredients
- Monday–Sunday food schedule
- Schedule normal dishes or non-shopping entries: leftovers, takeaway, eating out and custom meals
- Weekly snacks and drinks
- Generate one deduplicated shopping list from scheduled dishes + extras
- Add arbitrary shopping items
- Check off and clear bought items
- Local persistence via `localStorage`

## Data approach

TheMealDB is treated as seed content only. Imported records are reduced to dish name, source ID and ingredient names. Measurements, quantities, instructions, nutrition and other recipe fields are ignored.

Ingredient names are trimmed, title-cased and deduplicated within each dish. The current MVP intentionally keeps this cleaning conservative rather than incorrectly merging genuinely different foods.

## Run

This is a dependency-free static web app. Serve the repository directory with any static server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Next production step

The current version is intentionally local-first so the complete product flow can be tested quickly. A production multi-user version should move dishes, user customisations, schedules and shopping lists into a hosted database with authentication. The UI/data model can then distinguish global seed dishes from each user's customised versions.
