import { OSRHItemConfig } from '../item-config.mjs';

export async function registerSystemHooks() {
  const systemData = OSRH.systemData;
  console.log('register system hooks');
  switch (game.system.id) {
    case 'dcc':
      Hooks.on('renderItemSheet', (obj, html, item) => {

        if (systemData.lightItemTypes.includes(item.item.type)) {
          addItemConfigControl(html, item.item);
        }
      });

      break;
      case 'ose':
        Hooks.on('renderItemSheet', (app, html, item) => {

          if (systemData.lightItemTypes.includes(app.object.type)) {
            addItemConfigControl(html, app.object);
          }
        });

        break;
    default:
      Hooks.on('renderItemSheet', (app, html, item) => {
        if (systemData.lightItemTypes.includes(item.type)) {
          let parent = app.object.parent ? app.object.parent : null
          addItemConfigControl(html, app.object, parent);
        }
      });
  }
  // universal hooks
  Hooks.on('renderOSRHItemConfig', async (obj, html, app) => {
    let itemType = obj.itemType;
    if (!itemType) itemType = 'none';
    const select = html[0].querySelector('#item-type');
    select.value = itemType;
  });
}

function addItemConfigControl(html, item) {
  const headerEl = html[0].querySelector('.window-header');
  const configIcon = '<i class="fa-regular fa-book-skull"></i>';
  const titleEl = headerEl?.querySelector('.window-title');
  if (titleEl) {
    const configBtn = document.createElement('a');
    configBtn.classList.add('control', 'osrh-item-config');
    configBtn.innerHTML = configIcon;
    titleEl.after(configBtn);
    configBtn.addEventListener('click', async (ev) => {
      let itemData;
      if (item.actor) {
        itemData = await item.actor.items.get(item._id);
      } else {
        itemData = await game.items.get(item._id);
      }
      let ration = OSRH.systemData.rationItemTypes.includes(item.type);
      new OSRHItemConfig(itemData, ration).render(true, {top: ev.y, left: ev.x - 125});
    });
  }
}
