//tick: manages light duration, turn count
async function oseTick() {
  if (game.user.role >= 4) {
    console.log('tick');

    //get data
    const data = {
      light: null,
      lastTick: game.settings.get('OSE-helper', 'lastTick')
    };
    const curTime = game.time.worldTime;
    const elapsed = (curTime - data.lastTick) / 60;
    //manage light duration
    for (let user of game.users.contents) {
      data.light = await user.getFlag('OSE-helper', 'lightData');
      console.log('user', user, data);
      //loop through actorIds in light flag
      for (let actorId in data.light) {
        //If actor does not have light lit...
        if (data.light[actorId].lightLit) {
          console.log('lit', data.light);
          //loop through the light types in data.actorId
          for (let lightType in data.light[actorId]) {
            //check if light isOn = true
            if (data.light[actorId][lightType].isOn) {
              console.log('isOn', lightType, elapsed);
              //decrement duration by time elapsed in minutes
              data.light[actorId][lightType].duration -= elapsed;
              //if duration is greater than maximum, set to maximum.
              console.log(data.light[actorId][lightType].duration, 'after');
              if (data.light[actorId][lightType].duration > oseLight[lightType].duration) {
                console.log('exceeded max');
                data.light[actorId][lightType].duration = oseLight[lightType].duration;
              }
              // if duration <= 0 run lightOff function, and delete light type object
              if (data.light[actorId][lightType].duration <= 0) {
                const actor = await game.actors.contents.find((a) => a.id == actorId);
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
                data.light[actorId].lightLit = false;
                console.log('before light off');
                oseLightOff(actorId);
                delete data.light[actorId][lightType];
                if (Object.keys(data.light[actorId]).length == 1) {
                  delete data.light[actorId];
                }
              }
            }
          }
        }
      }
      await user.unsetFlag('OSE-helper', 'lightData');
      await user.setFlag('OSE-helper', 'lightData', data.light);
    }

    //update lightData
    data.lastTick = curTime;
    game.settings.set('OSE-helper', 'lastTick', data.lastTick);
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
async function oseClearUserFlag(data) {
  const { user, scope, flagname, reset } = data;
  console.log(scope, flagname);
  await user.unsetFlag(scope, flagname);
  console.log('OSE-helper: Flag Unset');
  if (reset) await user.setFlag(scope, flagname, {});
  console.log('OSE-helper: Flag Reset');
}