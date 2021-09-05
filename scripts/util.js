//tick: manages light duration, turn count
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
            lightOff(actorId);
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

function setLightFlag(data) {
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
