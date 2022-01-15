Hooks.on('ready', () => {
  OSEH.util = OSEH.util || {};
  //tick: manages light duration, turn count
  OSEH.util.oseTick = async function () {
    if (game.user.role >= 4) {
      lastTick = game.settings.get('OSE-helper', 'lastTick');
      await OSEH.util.oseLightTick(lastTick);
      await OSEH.util.oseEffectTick(lastTick);

      //update lightTick

      await game.settings.set('OSE-helper', 'lastTick', game.time.worldTime);
    }
  };
  OSEH.util.oseLightTick = async function (lastTick) {
    if (game.user.role >= 4) {
      console.log('tick');

      //get data
      const data = {
        light: null
      };
      const curTime = game.time.worldTime;
      const elapsed = (curTime - lastTick) / 60;
      //manage light duration
      for (let user of game.users.contents) {
        data.light = await user.getFlag('OSE-helper', 'lightData');
        // console.log('user', user, data);
        //loop through actorIds in light flag
        for (let actorId in data.light) {
          //If actor does not have light lit...
          if (data.light[actorId].lightLit) {
            // console.log('lit', data.light);
            //loop through the light types in data.actorId
            for (let lightType in data.light[actorId]) {
              //check if light isOn = true
              if (data.light[actorId][lightType].isOn) {
                // console.log('isOn', lightType, elapsed);
                //decrement duration by time elapsed in minutes
                data.light[actorId][lightType].duration -= elapsed;
                //if duration is greater than maximum, set to maximum.
                // console.log(data.light[actorId][lightType].duration, 'after');
                if (data.light[actorId][lightType].duration > OSEH.data.lightSource[lightType].duration) {
                  // console.log('exceeded max');
                  data.light[actorId][lightType].duration = OSEH.data.lightSource[lightType].duration;
                }
                //on last turn shrink light radius
                if (data.light[actorId][lightType].duration <= 10) {
                  // console.log('last turn');
                  oseUpdateTokens(actorId, OSEH.data.lightSource[lightType], true);
                }
                // if duration <= 0 run lightOff function, and delete light type object
                if (data.light[actorId][lightType].duration <= 0) {
                  const actor = await game.actors.contents.find((a) => a.id == actorId);
                  const item = await actor.data.items.getName(OSEH.data.lightSource[lightType].name);
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
                  // console.log('before light off');
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
    }
  };
  OSEH.util.oseEffectTick = async function (lastTick) {
    if (game.user.role >= 4) {
      const curTime = game.time.worldTime;
      const elapsed = (curTime - lastTick) / 60;
      // console.log('effect', elapsed);
      for (let user of game.users.contents) {
        effectData = await user.getFlag('OSE-helper', 'effectData');

        for (let effectId in effectData) {
          let effect = effectData[effectId];
          // console.log('customEffect', effect.name, effect.duration);
          effect.duration -= elapsed;
          // console.log('after', effect.name, effect.duration);

          if (effect.duration <= 0) {
            console.log('effect depleted');
            const msgData = `<h3 style="color: red;"> Custom Effect Expired</h3>
    <div>Custom effect ${effectData[effectId].name} has expired!.`;
            OSEH.util.ChatMessage(effectData[effectId], effectData[effectId].data.userId, msgData);
            delete effectData[effectId];
          }

          //if actor object empty, delete
          // if (Object.keys(effectData[actorId]).length == 0) {
          //   delete effectData[actorId];
          // }
        }

        await user.unsetFlag('OSE-helper', 'effectData');
        await user.setFlag('OSE-helper', 'effectData', effectData);
      }
    }
  };
  OSEH.util.setLightFlag = function (data) {
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
  };

  OSEH.util.getById = function (type, id) {
    if (type == 'actor') {
      return game.actors.find((a) => a.id == id);
    }
    if (type == 'journal') {
      return game.journal.find((j) => j.id == id);
    }
  };

  OSEH.util.getActor = function () {
    if (canvas.tokens.controlled.length > 1 || canvas.tokens.controlled.length == 0) {
      ui.notifications.error('Please select a single token');
      return;
    }
    return game.actors.find((a) => a.id == canvas.tokens.controlled[0].actor.id);
  };

  OSEH.util.unSetLightFlag = function (data) {
    const { actor, actorId } = data;
    const journal = game.journal.getName(game.settings.get('OSE-helper', 'timeJournalName'));
    let flags = journal.data.flags.world.oseLights;
    delete flags[actorId];
    journal.unsetFlag('world', 'oseLights');
    journal.setFlag('world', 'oseLights', flags);
    actor.setFlag('world', 'lightLit', false);
  };

  OSEH.util.oseClearUserFlag = async function (data) {
    const { user, scope, flagname, reset } = data;
    // console.log(scope, flagname);
    await user.unsetFlag(scope, flagname);
    // console.log('OSE-helper: Flag Unset');
    if (reset) await user.setFlag(scope, flagname, {});
    // console.log('OSE-helper: Flag Reset');
  };

  OSEH.util.resetMonsterAttacks = async function () {
    for (let combatant of game.combats.active.combatants.contents) {
      // console.log(combatant, combatant.actor.type);
      const actor = combatant.actor;
      // console.log('actor', actor);
      if (actor.type == 'monster') {
        for (let item of actor.data.items.contents) {
          if (item.type == 'weapon') {
            // console.log('item', item, item.data.data.counter.max);
            let count = item.data.data.counter.max;
            // console.log('before', item.data.data.counter.value);
            await item.update({ data: { counter: { value: count } } });
            // console.log('after', item.data.data.counter);
          }
        }
      }
    }
  };

  //const newItemData = {};

  OSEH.util.GetActorById = function (id) {
    return game.actors.contents.find((a) => a.id == id);
  };
  function oseGetActorId(actorName) {
    const id = game.actors.getName(actorName)?.id;
    if (id) {
      // console.log('id=', id);
      return id;
    }
  }

  OSEH.util.UserAssigned = function (actorId) {
    for (let user of game.users.contents) {
      if (user?.character?.id == actorId) {
        console.log('User Found');
        return user.id;
      }
    }
  };

  OSEH.util.ChatMessage = function (effectData, userId, msgContent) {
    // console.log('oseChat', effectData);
    const whisperArray = [userId];
    if (effectData.data.whisperTarget) {
      // console.log(effectData.data.target);
      const targetId = oseGetActorId(effectData.data.target);
      const targetUserId = OSEH.util.UserAssigned(targetId);
      // console.log('target actor id', targetId, 'target userId', targetUserId);
      // if target is a user controlled character
      if (targetUserId) {
        whisperArray.push(targetUserId);
        // console.log('new array', whisperArray);
      }
    }

    ChatMessage.create({ content: msgContent, whisper: whisperArray });
  };

  OSEH.util.centerHotbar = function () {
    console.log('Hotbar Fired');
    if (game.settings.get('OSE-helper', 'centerHotbar')) {
      console.log('center the bar');
      document.documentElement.style.setProperty('--hotbar-center', 'calc(50% - 270px');
    } else {
      console.log('dont center the bar');
      document.documentElement.style.setProperty('--hotbar-center', '220px');
    }
  };

  OSEH.util.oseHook = function (hookName, args = []) {
    Hooks.callAll(hookName, ...args);
  };
  OSEH.util.toggleButton = function (btn) {
    if (btn.disabled) {
      btn.disabled = false;
      return;
    }
    btn.disabled = true;
  };

  OSEH.util.updateTokens = async function (actorId, lightData, lastTurn = false) {
    // // console.log(lightData, actorId);
    //loop through active game scenes
    for (let scene of game.scenes.contents) {
      //loop through tokens contaioned in scene
      scene.data.tokens.contents.forEach(async (t) => {
        //if token actorId == actorId set light settings to off

        if (t?.actor?.id == actorId) {
          console.log(t, actorId);
          let dim = lightData.dimLight;
          if (lastTurn) dim = dim * 0.7;
          //hacky version check, if less than v8 = false, data checks if oldVer is false, and sends appropriate data object 
          const oldVer = parseInt(game.version) < 9;
          const data = !oldVer ? {
            light: {
              bright: lightData.brightLight,
              dim: dim,
              color: lightData.color,
              alpha: lightData.lightAlpha,
              gradual: true,
              animation: { type: 'torch', speed: 3, intensity: 5 }
            }
          } :
          {
            brightLight: lightData.brightLight,
            dimLight: dim,
            lightColor: lightData.color,
            lightAlpha: lightData.lightAlpha,
            lightAnimation: { type: 'torch', speed: 3, intensity: 5 }
          }
          console.log(data)
          //end version check
          await t.update(data);
        }
      });
    }
  };

  OSEH.util.countJournalInit = async function (journalName) {
    let entry = game.journal.getName(journalName);

    if (!entry) {
      entry = await JournalEntry.create({
        content: ``,
        name: `${journalName}`
      });
      console.log('entry', entry)
      OSEH.turn.updateJournal();
      console.log(`OSE-helper: no count journal found.
      Journal entry named ${journalName} created.`);
    }
    return entry;
  };

  OSEH.util.singleSelected = function () {
    if (canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1) {
      ui.notifications.error('Please select a single token');
      return false;
    }
    return true;
  };

  //random text generator
  OSEH.util.tableFlavor = function () {
    let flavorArr = [
      '<span style="color: DeepPink">What is THIS!!!</span>',
      '<span style="color: DeepPink">What is that I hear?</span>',
      '<span style="color: DeepPink">Something is Coming!</span>',
      '<span style="color: DeepPink">What was THAT!?!</span>',
      '<span style="color: DeepPink">LISTEN! Do you smell something?!?</span>'
    ];
    let index = Math.floor(Math.random() * flavorArr.length);
    // console.log(index);
    //// console.log(flavorArr[index]);
    return flavorArr[index];
  };
});
