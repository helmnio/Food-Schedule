(() => {
  const baseRenderShopping = renderShopping;
  renderShopping = function renderShoppingWithExtrasLabel() {
    baseRenderShopping();
    shoppingList.querySelectorAll('.meal-group-head h3').forEach(heading => {
      if (heading.textContent.trim() === 'Snacks & drinks') heading.textContent = 'Extras';
    });
  };

  const THEME_KEY = 'food-schedule-theme-v1';
  const themes = {
    pink:   {label:'Pink',   bg:'#fff6fa',card:'#fffdfd',ink:'#3f2231',deep:'#4d263a',muted:'#8d697a',line:'#edcfde',accent:'#c8588c',dark:'#9f3d6c',soft:'#fbe6f0',rule:'#f2dce7',tint:'#fff1f7',mid:'#e9bfd2',rgb:'205,116,158'},
    blue:   {label:'Blue',   bg:'#f5f9ff',card:'#fcfdff',ink:'#20354a',deep:'#263f59',muted:'#687f96',line:'#ceddec',accent:'#568bc2',dark:'#3c6f9f',soft:'#e5f0fa',rule:'#dbe7f2',tint:'#eef6ff',mid:'#bdd3e8',rgb:'109,153,198'},
    green:  {label:'Green',  bg:'#f5fbf7',card:'#fcfefc',ink:'#263d31',deep:'#2d4939',muted:'#6d8778',line:'#d0e4d7',accent:'#5d9d78',dark:'#41795b',soft:'#e5f3ea',rule:'#dcebe1',tint:'#eef9f2',mid:'#bddbc8',rgb:'113,164,133'},
    yellow: {label:'Yellow', bg:'#fffaf0',card:'#fffefa',ink:'#443a25',deep:'#51452a',muted:'#8d8062',line:'#eadfbd',accent:'#c99a45',dark:'#98712f',soft:'#f8edcf',rule:'#f0e5c9',tint:'#fff7df',mid:'#e4cf98',rgb:'204,166,86'},
    orange: {label:'Orange', bg:'#fff7f2',card:'#fffdfb',ink:'#442d24',deep:'#55362a',muted:'#927265',line:'#ecd4c6',accent:'#d2764e',dark:'#a55433',soft:'#f9e7dc',rule:'#f1ddd2',tint:'#fff1e8',mid:'#e7bda8',rgb:'211,126,86'},
    grey:   {label:'Grey',   bg:'#f7f7f6',card:'#fdfdfc',ink:'#343433',deep:'#444442',muted:'#777774',line:'#ddddda',accent:'#858581',dark:'#62625f',soft:'#ececea',rule:'#e7e7e4',tint:'#f2f2f0',mid:'#d1d1cc',rgb:'145,145,139'}
  };

  const style = document.createElement('style');
  style.textContent = `
    :root{--theme-deep:#4d263a;--theme-tint:#fff1f7;--theme-mid:#e9bfd2;--theme-rgb:205,116,158}
    body{background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 31px,rgba(var(--theme-rgb),.075) 32px)}
    .topbar h1,.section-head h2,.dialog-head h2,.dish-card h3{color:var(--theme-deep)}
    .eyebrow{color:var(--accent-dark)}
    .bottom-nav{border-color:var(--theme-mid)}
    .day{background-image:linear-gradient(90deg,transparent 0,transparent 8px,rgba(var(--theme-rgb),.17) 8px,rgba(var(--theme-rgb),.17) 9px,transparent 9px)}
    .day .add-slot{background:var(--card);border-color:var(--theme-mid);color:var(--accent-dark)}
    .slot{background:var(--soft);border-left-color:var(--accent)}
    .day-extras{border-color:var(--theme-mid)}
    .day-extra-chip{background:var(--theme-tint);border-color:var(--theme-mid);color:var(--ink)}
    .chip{background:var(--soft);border-color:var(--line)}
    .dish-card{background-image:linear-gradient(90deg,transparent 0,transparent 9px,rgba(var(--theme-rgb),.18) 9px,rgba(var(--theme-rgb),.18) 10px,transparent 10px)}
    .shop-item .day-count,.count-pill{background:var(--soft);color:var(--accent-dark);border-color:var(--theme-mid)}
    .view-toggle{background:var(--rule)}
    .meal-group+.meal-group{border-top-color:var(--soft)}
    .meal-group-head{background:var(--card)}
    .meal-group-head span{color:var(--accent-dark)}
    .search,input,select,textarea{border-color:var(--theme-mid);background:var(--card)}
    .suggestions,.suggestions button,.ingredient-picker,.dish-results,.dish-result,.day-choice span{background:var(--card)}
    dialog{border-color:var(--theme-mid);background:var(--card)}
    dialog form{background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 31px,rgba(var(--theme-rgb),.05) 32px)}
    .settings-btn{width:42px;height:42px;display:grid;place-items:center;padding:0;background:transparent;color:var(--accent-dark);border:0;box-shadow:none;border-radius:50%;flex:0 0 auto}
    .settings-btn svg{width:22px;height:22px;display:block}
    #themeSettingsDialog{width:min(420px,calc(100vw - 28px))}
    .theme-settings-copy{margin:6px 0 18px}
    .theme-options{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .theme-option{display:flex;align-items:center;gap:9px;background:var(--card);color:var(--ink);border:1px solid var(--line);box-shadow:none;padding:11px;border-radius:10px;text-align:left}
    .theme-option.active{border-color:var(--accent-dark);box-shadow:inset 0 0 0 1px var(--accent-dark)}
    .theme-swatch{width:22px;height:22px;border-radius:50%;background:var(--swatch);border:1px solid rgba(0,0,0,.08);flex:0 0 auto}
    @media(max-width:560px){.topbar{align-items:flex-start}.settings-btn{width:38px;height:38px}.theme-options{grid-template-columns:repeat(2,1fr)}}
  `;
  document.head.appendChild(style);

  function applyTheme(name, persist = true) {
    const theme = themes[name] || themes.pink;
    const root = document.documentElement.style;
    root.setProperty('--bg', theme.bg);
    root.setProperty('--card', theme.card);
    root.setProperty('--ink', theme.ink);
    root.setProperty('--muted', theme.muted);
    root.setProperty('--line', theme.line);
    root.setProperty('--accent', theme.accent);
    root.setProperty('--accent-dark', theme.dark);
    root.setProperty('--soft', theme.soft);
    root.setProperty('--rule', theme.rule);
    root.setProperty('--theme-deep', theme.deep);
    root.setProperty('--theme-tint', theme.tint);
    root.setProperty('--theme-mid', theme.mid);
    root.setProperty('--theme-rgb', theme.rgb);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.bg);
    document.querySelectorAll('[data-theme-option]').forEach(btn => btn.classList.toggle('active', btn.dataset.themeOption === name));
    if (persist) localStorage.setItem(THEME_KEY, name);
  }

  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.className = 'settings-btn';
  settingsButton.setAttribute('aria-label', 'Settings');
  settingsButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.3.3.52.66.6 1 .07.36.1.73.1 1.1H21v4h-.09A1.7 1.7 0 0 0 19.4 15z"></path></svg>';
  document.querySelector('.topbar')?.appendChild(settingsButton);

  const dialog = document.createElement('dialog');
  dialog.id = 'themeSettingsDialog';
  dialog.innerHTML = `<form method="dialog"><div class="dialog-head"><div><span class="eyebrow">SETTINGS</span><h2>Appearance</h2></div><button type="button" class="icon-btn" data-close-settings>×</button></div><p class="muted theme-settings-copy">Choose a colour for your food notebook.</p><div class="theme-options">${Object.entries(themes).map(([key,t])=>`<button type="button" class="theme-option" data-theme-option="${key}"><span class="theme-swatch" style="--swatch:${t.accent}"></span><span>${t.label}</span></button>`).join('')}</div></form>`;
  document.body.appendChild(dialog);

  settingsButton.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-close-settings]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const option = event.target.closest('[data-theme-option]');
    if (!option) return;
    applyTheme(option.dataset.themeOption);
  });

  applyTheme(localStorage.getItem(THEME_KEY) || 'pink', false);
  renderShopping();
})();
