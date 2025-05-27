export function registerPartials() {
  foundry.applications.handlebars.loadTemplates([
    'modules/osr-helper/templates/active-effect/partials/effect-card.hbs',
    'modules/osr-helper/templates/active-effect/partials/new-effect-card.hbs',
    'modules/osr-helper/templates/active-effect/partials/effects-list-tab.hbs',
    'modules/osr-helper/templates/active-effect/partials/create-effect-tab.hbs',
    'modules/osr-helper/templates/active-effect/partials/saved-effect-card.hbs'
  ]);
}
