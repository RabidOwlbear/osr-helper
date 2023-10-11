import { OSRHItemConfig } from '../item-config.mjs';

export async function registerSystemHooks() {
  const systemData = OSRH.systemData[game.system.id];
  console.log('register system hooks');
  switch (game.system.id) {
    case 'dcc':
      console.log('dcc hooks registered')
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
        console.log('render item sheet',item, app, item.type)
        if (systemData.lightItemTypes.includes(item.type)) {
          console.log(app, item)
          let parent = app.object.parent ? app.object.parent : null
          addItemConfigControl(html, item, parent);
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
  console.log(item)
  if (titleEl) {
    console.log('title', titleEl)
    const configBtn = document.createElement('a');
    configBtn.classList.add('control', 'osrh-item-config');
    configBtn.innerHTML = configIcon;
    titleEl.after(configBtn);
    configBtn.addEventListener('click', async () => {
      let itemData;
      if (item.actor) {
        itemData = await item.actor.items.get(item._id);
      } else {
        itemData = await game.items.get(item._id);
      }
      let ration = OSRH.systemData[game.system.id].rationItemTypes.includes(item.type);
      new OSRHItemConfig(itemData, ration).render(true);
    });
  }
}
