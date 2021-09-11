

async function tick() {
  if (game.user.role >= 4) {
    console.log('tick');

    //get data
    const data = {
      light: game.settings.get('OSE-helper', 'lightData'),
      turn: game.settings.get('OSE-helper', 'turnData')
    };
    const curTime = game.time.worldTime;
    const elapsed = (curTime - data.light.lastTick) / 60;
    //manage light duration
    //loop through actorIds in light flag
    for (let actorId in data.light.actors) {
      //loop through the light types in data.actorId
      for (let lightType in data.light.actors[actorId]) {
        //check if light isOn = true
        if (data.light.actors[actorId][lightType].isOn) {
          //decrement duration by time elapsed in minutes
          data.light.actors[actorId][lightType].duration -= elapsed;
          //if duration is greater than maximum, set to maximum.
          if (data.light.actors[actorId][lightType].duration > oseLight[lightType].duration) {
            console.log('exceeded max');
            data.light.actors[actorId][lightType].duration = oseLight[lightType].duration;
          }
          // if duration <= 0 run lightOff function, and delete light type object
          if (data.light.actors[actorId][lightType].duration <= 0) {
            const actor = await game.actors.find((a) => a.id == actorId);
            const item = await actor.data.items.getName(oseLight[lightType].name);
            const newCount = item.data.data.quantity.value - 1;
            if (newCount <= 0) {
              await item.delete();
            } else {
              await item.update({
                data: {
                  quantity: {
                    value: newCount
                  }
                }
              });
            }
            data.light.actors[actorId].lightLit = false;
            console.log('before light off');
            oseLightOff(actorId);
            delete data.light.actors[actorId][lightType];
          }
        }
      }
    }
    //update lightData
    data.light.lastTick = curTime;
    game.settings.set('OSE-helper', 'lightData', data.light);
  }
}
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
      case 'lanternOil':
        ui.notifications.error('No Oil Left!');
        break;
    }
    return;
  }
  if (data.actors?.[actorId]?.lightLit) {
    if (data.actors?.[actorId]?.[type]?.isOn) {
      console.log('light is on');
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

  console.log(data, data.actors?.[actorId]?.[type]?.isOn);

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
    console.log('no actor or type found');
    data.actors[actorId] = {
      lightLit: true,
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

async function oseLightOn(actorId) {
  const lightData = game.settings.get('OSE-helper', 'lightData');
  console.log(lightData, '<-----------------');
  const actor = await game.actors.find((a) => a.id == actorId);

  if (lightData.actors?.[actorId]?.lightLit) {
    console.log('light lit');
    for (let type in lightData.actors?.[actorId]) {
      if (typeof lightData.actors?.[actorId][type] == 'object') {
        console.log('object', lightData.actors?.[actorId][type]);
        lightData.actors[actorId][type].isOn = false;
        console.log('object', lightData.actors?.[actorId][type]);
      }
    }
    lightData.actors[actorId].lightLit = false;
    await game.settings.set('OSE-helper', 'lightData', lightData);
    oseLightOff(actorId);
    return;
  }

  let lightOptions = '';

  for (let type in oseLight) {
    console.log(type, oseLight[type].name);
    const item = actor.data.items.getName(oseLight[type].name);
    if (item) {
      console.log('item', item);
      lightOptions += `<option value="${type}">${item.name}: ${item.data.data.quantity.value}</option>`;
    }
  }
  
  if (lightOptions == '') {
    ui.notifications.error('No Light Items Found');
    return;
  }
  console.log(lightOptions);
  let dialogTemplate = `
  <h1> Pick a Light Type </h1>
  <div style="display:flex">
    <div  style="flex:1"><select id="lightType">${lightOptions}</select></div>
    </div>`;

  new Dialog({
    title: 'Light on',
    content: dialogTemplate,
    buttons: {
      rollAtk: {
        label: 'Light On',
        callback: async (html) => {
          const itemType = html.find('#lightType')[0].value;
          const item = actor.items.getName(oseLight[itemType].name);
          console.log(item);
          if (lightData.actors?.[actorId]?.[itemType]?.isOn == false) {
            //if data contains actorId.type.isOn = false set isOn to true
            lightData.actors[actorId].lightLit = true;
            lightData.actors[actorId][itemType].isOn = true;
            game.settings.set('OSE-helper', 'lightData', lightData);
            oseUpdateTokens(actorId, oseLight[itemType]);
            return;
          }
          if (!lightData.actors?.[actorId]) {
            //if no actorId found, creat actor id and light type
            console.log('no actor or type found');
            lightData.actors[actorId] = {
              lightLit: true,
              [itemType]: {
                isOn: true,
                duration: oseLight[itemType].duration
              }
            };
            console.log(lightData);
            game.settings.set('OSE-helper', 'lightData', lightData);
            oseUpdateTokens(actorId, oseLight[itemType]);
            return;
          }
          if (!lightData.actors[actorId][itemType]) {
            lightData.actors[actorId].lightLit = true;
            lightData.actors[actorId][itemType] = {
              isOn: true,
              duration: oseLight[itemType].duration
            };
            game.settings.set('OSE-helper', 'lightData', lightData);
            oseUpdateTokens(actorId, oseLight[itemType]);
            return;
          }
        }
      },
      close: {
        label: 'Close'
      }
    }
  }).render(true);
}