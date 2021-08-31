console.log('tick loaded');
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
async function tick() {
  console.log('tick');
  //get data
  const data = game.settings.get('OSE-helper', 'lightData');
  const curTime = game.time.worldTime;
  const elapsed = (curTime - data.lastTick) / 60;
  //loop through actorIds in light flag
  for (let actorId in data.actors) {
    //console.log(actorId, data.actors[actorId]);
    //loop through the light types in data.actorId
    for (let lightType in data.actors[actorId]) {
      //console.log(lightType, data.actors[actorId][lightType]);
      //check if light isOn = true
      if (data.actors[actorId][lightType].isOn) {
        //console.log(data.actors[actorId][lightType].duration, 'before');
        //decrement duration by time elapsed in minutes
        data.actors[actorId][lightType].duration -= elapsed;
        //console.log(data.actors[actorId][lightType].duration, 'after');
        // if duration <= 0 run lightOff function, and delete light type object
        if (data.actors[actorId][lightType].duration <= 0) {
          console.log('delete item', data);
          const actor = await game.actors.find((a) => a.id == actorId);
          console.log(actor, 'actor');
          const item = await actor.data.items.getName(oseLight[lightType].name);
          console.log(item);
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
          lightOff(actorId, lightType);
          delete data.actors[actorId][lightType];
          //console.log(data, 'afterdelete');
        }
      }
    }
  }
  //update lightData
  data.lastTick = curTime;
  game.settings.set('OSE-helper', 'lightData', data);
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
  for (let scene of game.scenes.contents) {
    //loop through tokens contaioned in scene
    scene.data.tokens.contents.forEach(async (t) => {
      //if token actorId == actorId set light settings to off
      if (t.actor.id == actorId) {
        await t.update({ brightLight: 0, dimLight: 0 });
      }
    });
  }
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

// async function main() {
//   console.log('Tokens: ', canvas.tokens.controlled);
//   // if none/more than 1 tokens selected, error
//   if (canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1) {
//     ui.notifications.error('Please select a single token');
//     return;
//   }
//   let actor = canvas.tokens.controlled[0].actor;
//   console.log('actor', actor);
//   let torch = actor.items.find((item) => item.data.name == 'Torches (6)');
//   let litTorch = canvas.tokens.controlled[0].data.dimLight;
//   console.log('litTorch: ', litTorch);
//   if (litTorch > 0) {
//     ui.notifications.error('Torch already lit');
//     return;
//   }
//   // torch.data.hasLitTorch = 0;
//   //await torch.update({ litTorch: 0 });
//   console.log('litTorch: ', litTorch);
//   console.log('Actor: ', actor);
//   console.log('torch: ', torch);
//   //does the tokens actor have a torch, otherwise error
//   if (torch == null || torch == undefined) {
//     ui.notifications.error('No torches left.');
//     return;
//   }
//   console.log(torch.data.data.quantity.value);
//   let count = torch.data.data.quantity.value - 1;
//   //console.log(count);
//   //let newcount = torch.data.data.quantity.value - 1;
//   //console.log(newcount);
//   await torch.update({ 'data.quantity.value': count });
//   console.log('Torch count: ', torch.data.data.quantity.value);
//   torch.update({ hasLitTorch: 1 });
//   //light torch and set duration
//   function lightsOut(token) {
//     token.update({ dimLight: 0, brightLight: 0 });
//   }
//   canvas.tokens.controlled.forEach((token) => {
//     //update light emitter
//     token.update({ dimLight: 30, brightLight: 20 });
//     // set duration
//     game.Gametime.doIn({ minutes: 60 }, lightsOut, token);
//   });
//   if (torch.data.data.quantity.value < 1) {
//     torch.delete();
//   }
//  //if(torch.data.data.quantity.value < 1){
//  // torch.delete();
//  //}
// }
