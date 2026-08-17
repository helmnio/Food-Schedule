(() => {
  const baseRenderShopping = renderShopping;
  renderShopping = function renderShoppingWithExtrasLabel() {
    baseRenderShopping();
    shoppingList.querySelectorAll('.meal-group-head h3').forEach(heading => {
      if (heading.textContent.trim() === 'Snacks & drinks') heading.textContent = 'Extras';
    });
  };
  renderShopping();
})();
