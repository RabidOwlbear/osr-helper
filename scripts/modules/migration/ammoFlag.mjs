export async function migrateAmmoFlag() {
  let ammoData = OSRH.data.ammoData;
  const list = [
    'Shortbow',
    'Longbow',
    'Crossbow',
    'Sling',
    'Matchlock blunderbuss',
    'Matchlock heavy musket',
    'Matchlock musket',
    'Matchlock pistol',
    'Wheellock blunderbuss',
    'Wheellock heavy musket',
    'Wheellock pistol',
    'Wheellock musket'
  ];
  const data = {
    weapItems: game.items.filter((i) => i.type === 'weapon' && list.includes(i.name)),
    sceneActorItems: [],
    actorItems: []
  };
  for (let actor of game.actors) {
    if (actor.type === 'character') {
      let aWeapons = actor.items.filter((i) => i.type == 'weapon' && list.includes(i.name));
      if (aWeapons.length) {
        data.actorItems.push({
          id: actor.id,
          name: actor.name,
          weapons: aWeapons
        });
        aWeapons.map(async (i) => {
          let ammoType = ammoData.find((a) => a.name === i.name)?.ammoType;
          if (!i.getFlag('osr-helper', 'ammunition')) {
            console.log('flag added', i.name)
            await i.setFlag('osr-helper', 'ammunition', {
              trackAmmo: true,
              items: [ammoType]
            });
          }
        });
      }
    }
  }
  for (let scene of game.scenes) {
    let sData = {
      id: scene.id,
      name: scene.name,
      actors: []
    };
    let actors = [];
    scene.tokens.map((t) => {
      if (t.actor && t.actor.type === 'character') {
        actors.push(t.actor);
      }
    });
    for (let actor of actors) {
      let aWeapons = actor?.items?.filter((i) => i.type == 'weapon' && list.includes(i.name));
      if (aWeapons?.length > 0) {
        sData.actors.push({
          id: actor.id,
          name: actor.name,
          weapons: aWeapons
        });
      }
      aWeapons.map(async (i) => {
        let ammoType = ammoData.find((a) => a.name === i.name)?.ammoType;
        if (!i.getFlag('osr-helper', 'ammunition')) {
          console.log('flag added', i.name)
          await i.setFlag('osr-helper', 'ammunition', {
            trackAmmo: true,
            items: [ammoType]
          });
        }
      });
    }
    if (sData.actors.length > 0) {
      data.sceneActorItems.push(sData);
    }
  }
  data.weapItems.map(async (i) => {
    let ammoType = ammoData.find((a) => a.name === i.name)?.ammoType;
    if (!i.getFlag('osr-helper', 'ammunition')) {
      console.log('flag added', i.name)
      await i.setFlag('osr-helper', 'ammunition', {
        trackAmmo: true,
        items: [ammoType]
      });
    }
  });
  return data;
}
