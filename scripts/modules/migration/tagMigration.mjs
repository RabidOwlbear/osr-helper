export async function tagMigration() {
  let migrated = await game.settings.get('osr-helper', 'migrationItemTags');
  if (OSRH.systemData.tags && !migrated) {
    for (let item of game.items) {
      handleTag(item);
    }
    for (let scene of game.scenes) {
      for (let token of scene.tokens) {
        let actor = token.actor;
        actor?.items.map(async (i) => {
          await handleTag(i);
          await ratTagOp(i);
        });
      }
    }
    for (let actor of game.actors) {
      for (let item of actor.items) {
        handleTag(item);
      }
    }
    game.settings.set('osr-helper', 'migrationItemTags', true);
  }
}

async function handleTag(item) {
  if (item.system.tags.find((t) => t.value === 'Light')) {
    if (!item.getFlag('osr-helper', 'itemType')) {
      await item.setFlag('osr-helper', 'itemType', 'light');
    }
  } else if (item.system.tags.find((t) => t.value === 'Ration')) {
    if (!item.getFlag('osr-helper', 'itemType')) {
      await item.setFlag('osr-helper', 'itemType', 'ration');
    }
  }
}
async function ratTagOp(item) {
  if (item.system.tags.find((t) => t.value === 'Ration')) {
    let itemType = item.getFlag('osr-helper', 'itemType');
    if (!itemType) {
      await item.setFlag('osr-helper', 'itemType', 'ration');
    }
    if (!item.flags?.['osr-helper']?.rationData) {
      let data =foundry.utils.mergeObject(OSRH.data.defaultRationSettings, { name: item.name });
      await item.setFlag('osr-helper', 'rationData', data);
    }
  }
}
