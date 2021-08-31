//tick: manages light duration, turn count
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

function setLightFlag(data) {
  console.log('ding', data);
  const { actor, actorId, type, duration } = data;
  const journal = game.journal.getName(game.settings.get('OSE-helper', 'timeJournalName'));
  const flagObj = {
    [actorId]: {
      [type]: {
        isOn: true,
        actorId,
        type,
        duration,
        startTime: game.time.worldTime
      }
    }
  };
  journal.setFlag('world', 'oseLights', flagObj);
  actor.setFlag('world', 'lightLit', true);
}
function getById(type, id) {
  if (type == 'actor') {
    return game.actors.find((a) => a.id == id);
  }
  if (type == 'journal') {
    return game.journal.find((j) => j.id == id);
  }
}
function getActor() {
  if (canvas.tokens.controlled.length > 1 || canvas.tokens.controlled.length == 0) {
    ui.notifications.error('Please select a single token');
    return;
  }
  return game.actors.find((a) => a.id == canvas.tokens.controlled[0].actor.id);
}
function unSetLightFlag(data) {
  const { actor, actorId } = data;
  const journal = game.journal.getName(game.settings.get('OSE-helper', 'timeJournalName'));
  let flags = journal.data.flags.world.oseLights;
  delete flags[actorId];
  journal.unsetFlag('world', 'oseLights');
  journal.setFlag('world', 'oseLights', flags);
  actor.setFlag('world', 'lightLit', false);
}
