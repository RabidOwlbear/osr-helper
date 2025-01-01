export function addSheetUi(sheetEl) {
  const exists = sheetEl.querySelector('#osrh-sheet-ui-cont');
  if (!exists) {
    const uiEl = document.createElement('div');
    uiEl.id = 'osrh-sheet-ui-cont';
    uiEl.classList.add('osrh-sheet-ui-cont');
    sheetEl.prepend(uiEl);
    return uiEl;
  }
  return 'skip';
}
export async function addcustomAttribElement(sheetEl, actor) {
  if (!actor.isOwner) {
    // check setting
    const showBar = await game.settings.get(`${OSRH.moduleName}`, 'displaycustomAttrib');
    if (showBar && actor.flags[OSRH.moduleName]?.customAttributes?.length > 0) {
      const exists = sheetEl.querySelector('#osrh-custom-attrib-cont');
      if (!exists) {
        const uiEl = document.createElement('div');
        uiEl.id = 'osrh-custom-attrib-cont';
        uiEl.classList.add('osrh-custom-attrib-cont');

        for (let attrib of actor.flags[OSRH.moduleName]?.customAttributes) {
          const div = document.createElement('div');
          div.classList.add('attrib-cont');
          div.id = attrib.id;
          const label = document.createElement('div');
          label.classList.add('custom-attrib-label');
          label.innerText = attrib.abbr;
          label.title = attrib.name;
          div.appendChild(label);
          const inp = document.createElement('input');
          inp.classList.add('custom-attrib-input');
          inp.value = attrib.value;
          inp.id = attrib.id;
          inp.addEventListener('change', async (e) => {
            e.preventDefault();
            const id = e.target.closest('.attrib-cont').id;
            const attributes = await foundry.utils.deepClone(actor.flags[OSRH.moduleName]?.customAttributes);
            const attrib = attributes.find((i) => i.id == id);
            if (attrib) attrib.value = parseInt(inp.value);
            const actorObj = await game.actors.get(actor._id);
            await actorObj.setFlag(`${OSRH.moduleName}`, 'customAttributes', attributes);

            const actorSheet = Object.values(ui.windows).find((i) => i.id.includes(actor._id));
            if (actorSheet) {
              const pos = { top: actorSheet.position.top, left: actorSheet.position.left };
              await actorSheet.close();
              actorObj.sheet.render(true, pos);
            }
          });
          div.appendChild(inp);
          uiEl.appendChild(div);
        }

        sheetEl.prepend(uiEl);
        return uiEl;
      }
      return 'skip';
    }
  }
}
export async function addAttribListeners(html, actorObj) {
  const data = actorObj.flags?.[OSRH.moduleName]?.customAttributes;
  const containerEl = html.find('div[data-tab="abilities"]')[0];
  if (data) {
    for (let attrib of data) {
      attrib?.items.map((i) => {
        const el = containerEl.querySelector(`li[data-item-id="${i.id}"] .item-image`);
        el?.addEventListener('click', (e) => {
          e.preventDefault();
          decrementAttribute(actorObj._id, attrib.id);
        });
      });
    }
  }
}
export async function decrementAttribute(actorId, attribId) {
  const actor = game.actors.get(actorId);
  const flag = await foundry.utils.deepClone(actor.flags?.[OSRH.moduleName]?.customAttributes);
  const attribute = flag.find((i) => i.id == attribId);
  if (!attribute.value >= 1) {
    ui.notifications.warn(`${attribute.name} ${game.i18n.localize('OSRH.util.notification.hasNoCharges')}`);
    return;
  } else {
    attribute.value -= 1;
    if (attribute.value < 0) attribute.value = 0;
    await actor.setFlag(OSRH.moduleName, 'customAttributes', flag);
  }
  const actorObj = Object.values(ui.windows).find((i) => i.id.includes(actor.id));
  if (actorObj) {
    await actorObj.close();
    actor.sheet.render(true);
  }
}
