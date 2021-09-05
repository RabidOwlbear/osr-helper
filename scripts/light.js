const oseLight = {
  torch: {
    name: 'Torches (6)',
    dimLight: 30,
    brightLight: 10,
    duration: 60
  },
  lantern: {
    name: 'Oil (1 flask)',
    dimLight: 30,
    brightLight: 10,
    duration: 180
  }
};

async function lightOn(actorId, type) {
  //get data
  const data = await game.settings.get('OSE-helper', 'lightData');
  const actor = await game.actors.find((a) => a.id == actorId);
  const item = await actor.items.getName(oseLight[type].name);
  console.log(oseLight[type].name, item, 'item');
  if (!item || item.data.data.quantity.value <= 0) {
    switch (type) {
      case 'torch':
        ui.notifications.error('No Torches Left!');
        break;
      case 'lantern':
        ui.notifications.error('No Oil Left!');
        break;
    }
    return;
  }

  console.log(data, data.actors?.[actorId]?.[type]?.isOn);
  //if datr contains an actorid with a light of this type that is on
  if (data.actors?.[actorId]?.[type]?.isOn) {
    console.log('light is on');
    //set isOn to false
    data.actors[actorId][type].isOn = false;

    //run lightOff function with actorId
    game.settings.set('OSE-helper', 'lightData', data);
    lightOff(actorId);
    return;
  }
  if (data.actors?.[actorId]?.[type]?.isOn == false) {
    //if data contains actorId.type.isOn = false set isOn to true
    data.actors[actorId][type].isOn = true;
    game.settings.set('OSE-helper', 'lightData', data);
    updateTokens(actorId, 10, 30);
    return;
  }
  if (!data.actors?.[actorId]) {
    //if no actorId found, creat actor id and light type
    console.log('no actor or type found');
    data.actors[actorId] = {
      [type]: {
        isOn: true,
        duration: oseLight[type].duration
      }
    };
    console.log(data);
    game.settings.set('OSE-helper', 'lightData', data);
    updateTokens(actorId, 10, 30);
    return;
  }
  if (!data.actors[actorId][type]) {
    data.actors[actorId][type] = {
      isOn: true,
      duration: oseLight[type].duration
    };
    game.settings.set('OSE-helper', 'lightData', data);
    updateTokens(actorId, 10, 30);
    return;
  }
}

async function lightOff(actorId) {
  //loop through active game scenes
  updateTokens(actorId, 0, 0);
}

async function updateTokens(actorId, bl, dl) {
  //loop through active game scenes
  for (let scene of game.scenes.contents) {
    //loop through tokens contaioned in scene
    scene.data.tokens.contents.forEach(async (t) => {
      //if token actorId == actorId set light settings to off
      if (t?.actor?.id == actorId) {
        await t.update({ brightLight: bl, dimLight: dl });
      }
    });
  }
}
function singleSelected() {
  if (canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1) {
    ui.notifications.error('Please select a single token');
    return false;
  }
  return true;
}
