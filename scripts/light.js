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

async function oseLightTurnRemaining(name) {
  const actorId = game.actors.getName(name)?.id;
  const data = await game.settings.get('OSE-helper', 'lightData');
  let type;
  for (let light in data.actors[actorId]) {
    if (data.actors[actorId][light].isOn) {
      type = light;
    }
  }
  //console.log('data', type, data);
  const dur = data.actors?.[actorId]?.[type]?.duration;
  if (dur > 0) {
    //console.log(dur, 'duration');
    // console.log(data, 'show turn');
    let capType;
    let style = '<span style ="color: green">';
    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: '',
      whisper: [game.user._id]
    };
    if (type == 'torch') {
      capType = 'Torch';
      if (dur < 40) {
        style = '<span style ="color: orangered">';
      }
      if (dur < 20) {
        style = '<span style ="color: red">';
      }
    } else if (type == 'lantern') {
      capType = 'Lantern';
      if (dur < 60) {
        style = '<span style ="color: orangered">';
      }
      if (dur < 30) {
        style = '<span style ="color: red">';
      }
    }

    chatData.content = `<h3>${capType} Turns Left</h3><br><p>Light Type: ${type}</p><p> ${style}Turns Remaining:</span> ${Math.ceil(
      dur / 10
    )}</p>`;
    //console.log(chatData);
    ChatMessage.create(chatData);
  }
}

async function lightOn(actorId, type) {
  //get data
  const data = await game.settings.get('OSE-helper', 'lightData');
  const actor = await game.actors.find((a) => a.id == actorId);
  const item = await actor.items.getName(oseLight[type].name);
  //console.log(oseLight[type].name, item, 'item');
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

  //if datr contains an actorid with a light of this type that is on
  //console.log(data.actors?.[actorId]?.lightLit, 'lightlit');
  if (data.actors?.[actorId]?.lightLit) {
    //console.log('lightlit true');
    if (data.actors?.[actorId]?.[type]?.isOn) {
      //console.log('light is on');
      //set isOn to false
      data.actors[actorId].lightLit = false;
      data.actors[actorId][type].isOn = false;

      //run lightOff function with actorId
      game.settings.set('OSE-helper', 'lightData', data);
      lightOff(actorId);
      return;
    }
    ui.notifications.error('Light Already Lit!');
    return;
  }

  if (data.actors?.[actorId]?.[type]?.isOn == false) {
    //if data contains actorId.type.isOn = false set isOn to true
    data.actors[actorId].lightLit = true;
    data.actors[actorId][type].isOn = true;
    game.settings.set('OSE-helper', 'lightData', data);
    updateTokens(actorId, 10, 30);
    return;
  }
  if (!data.actors?.[actorId]) {
    //if no actorId found, creat actor id and light type
    // console.log('no actor or type found');
    data.actors[actorId] = {
      lightLit: true,
      [type]: {
        isOn: true,
        duration: oseLight[type].duration
      }
    };
    //console.log(data);
    game.settings.set('OSE-helper', 'lightData', data);
    updateTokens(actorId, 10, 30);
    return;
  }
  if (!data.actors[actorId][type]) {
    data.actors[actorId].lightLit = true;
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
