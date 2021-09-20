//tick: manages light duration, turn count
async function oseTick() {
  if (game.user.role >= 4) {
    lastTick = game.settings.get('OSE-helper', 'lastTick');
    await oseLightTick(lastTick);
    await oseEffectTick(lastTick);

    //update lightTick

    game.settings.set('OSE-helper', 'lastTick', game.time.worldTime);
  }
}
async function oseLightTick(lastTick) {
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
              if (data.light[actorId][lightType].duration > oseLight[lightType].duration) {
                // console.log('exceeded max');
                data.light[actorId][lightType].duration = oseLight[lightType].duration;
              }
              //on last turn shrink light radius
              if (data.light[actorId][lightType].duration <= 10) {
                // console.log('last turn');
                oseUpdateTokens(actorId, oseLight[lightType], true);
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
}
async function oseEffectTick(lastTick) {
  if (game.user.role >= 4) {
    const curTime = game.time.worldTime;
    const elapsed = (curTime - lastTick) / 60;
    console.log('effect', elapsed);
    for (let user of game.users.contents) {
      effectData = await user.getFlag('OSE-helper', 'effectData');

      for (let effectId in effectData) {
        let effect = effectData[effectId];
        console.log('customEffect', effect.name, effect.duration);
        effect.duration -= elapsed;
        console.log('after', effect.name, effect.duration);

        if (effect.duration <= 0) {
          console.log('effect depleted');
          const msgData = `<h3 style="color: red;"> Custom Effect Expired</h3>
    <div>Custom effect ${effectData[effectId].name} has expired!.`;
          oseChatMessage(effectData[effectId], effectData[effectId].data.userId, msgData);
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
  // console.log(scope, flagname);
  await user.unsetFlag(scope, flagname);
  // console.log('OSE-helper: Flag Unset');
  if (reset) await user.setFlag(scope, flagname, {});
  // console.log('OSE-helper: Flag Reset');
}

async function resetMonsterAttacks() {
  for (let combatant of game.combats.active.combatants.contents) {
    console.log(combatant, combatant.actor.type);
    const actor = combatant.actor;
    console.log('actor', actor);
    if (actor.type == 'monster') {
      for (let item of actor.data.items.contents) {
        if (item.type == 'weapon') {
          console.log('item', item, item.data.data.counter.max);
          let count = item.data.data.counter.max;
          console.log('before', item.data.data.counter.value);
          await item.update({ data: { counter: { value: count } } });
          console.log('after', item.data.data.counter);
        }
      }
    }
  }
}

const newItemData = {};

class CustomEffectForm extends FormApplication {
  constructor(actorId, user) {
    super();
    this.user = user;
    this.actorId = actorId;
    this.actorName = oseGetActorById(actorId).name;
    this.effectId = randomID(16);
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form', 'osehForm'],
      popOut: true,
      template: `modules/OSE-helper/templates/customEffectForm.html`,
      id: 'NewEffectForm',
      title: 'New Effect Form'
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
  async _updateObject(event, formData) {
    console.log('formData', formData, this);
    const effectId = this.effectId;
    console.log('effectId', effectId);
    let effectData = await this.user.getFlag('OSE-helper', 'effectData');
    effectData[effectId] = {
      name: formData.effectName,
      duration: formData.effectDuration,
      description: formData.effectDesc,
      data: {
        target: formData.targetName,
        whisperTarget: formData.targetCheck,
        actorId: this.actorId,
        userId: this.user.id
      }
    };
    console.log('effectData', effectData);

    game.user.setFlag('OSE-helper', 'effectData', effectData);
    const msgContent = `<h3 style="color:green;">Custom Effect Created!</h3>
    <div>Custom effect named ${effectData[effectId].name} has been created.</div>
    <div>Duration : ${effectData[effectId].duration} minutes</div>
    <div>Description: ${effectData[effectId].description}</div>
    <div>Target: ${effectData[effectId].data.target}</div>
    <div>Whisper updates to target: ${effectData[effectId].data.whisperTarget}</div>`;
    oseChatMessage(effectData[effectId], game.user.id, msgContent);

    // }
  }
}

window.CustomEffectForm = CustomEffectForm;

async function oseDeleteEffect() {
  const user = game.user;
  const effectData = user.getFlag('OSE-helper', 'effectData');
  console.log('effectData', effectData);
  let activeEffects = '';
  //if no effects, return
  if (!Object.keys(effectData).length) {
    ui.notifications.warn('No Active Effects');
    return;
  }
  for (let effect in effectData) {
    console.log('effect', effect, effectData[effect]);
    activeEffects += `<option value="${effect}" name="${effectData[effect].name}">
      ${effectData[effect].name}: ${effectData[effect].duration} Minutes Left</option>`;
  }

  let dialogTemplate = `
  <h1> Choose Effect To Cancel </h1>
  <div style="display:flex">
    <div  style="flex:1"><select id="selectedEffect">${activeEffects}</select></div>
    </div>`;
  new Dialog({
    title: 'Remove Effect',
    content: dialogTemplate,
    buttons: {
      removeEffect: {
        label: 'Remove Effect',
        callback: async (html) => {
          const effectId = html.find('#selectedEffect')[0].value;
          const effectName = effectData[effectId].name;
          const whisperArray = [game.user.id];
          console.log(whisperArray);
          let msgContent = `<h3 style="color: red">Effect Deleted!</h3>
          <div>Custom Effect named ${effectName} has been deleted.</div>`;
          console.log('before osechat', effectData);
          oseChatMessage(effectData[effectId], user.id, msgContent);
          delete effectData[html.find('#selectedEffect')[0].value];
          await user.unsetFlag('OSE-helper', 'effectData');
          await game.user.setFlag('OSE-helper', 'effectData', effectData);
        }
      },
      close: {
        label: 'Close'
      }
    }
  }).render(true);
}

function oseGetActorById(id) {
  return game.actors.contents.find((a) => a.id == id);
}
function oseGetActorId(actorName) {
  const id = game.actors.getName(actorName).id;
  if (id) {
    return id;
  }
}

function oseUserAssigned(actorId) {
  for (let user of game.users.contents) {
    if (user?.character?.id == actorId) {
      console.log('User Found');
      return user.id;
    }
  }
}

function oseChatMessage(effectData, userId, msgContent) {
  console.log('oseChat', effectData);
  const whisperArray = [userId];
  if (effectData.data.whisperTarget) {
    console.log(effectData.data.target);
    const targetId = oseGetActorId(effectData.data.target);
    const targetUserId = oseUserAssigned(targetId);
    console.log('target actor id', targetId, 'target userId', targetUserId);
    // if target is a user controlled character
    if (targetUserId) {
      whisperArray.push(targetUserId);
      console.log('new array', whisperArray);
    }
  }

  ChatMessage.create({ content: msgContent, whisper: whisperArray });
}

function generateEffectReport(userId) {
  const user = game.users.contents.find((u) => u.id == userId);
  const effectData = user.getFlag('OSE-helper', 'effectData');
  let msgContent = '<h3>Custom Effect Report</h3>';
  if (!Object.keys(effectData).length) {
    ui.notifications.warn('No Active Effects');
    return;
  }
  for (let effectId in effectData) {
    let effect = effectData[effectId];
    console.log('effect', effect);
    msgContent += `
    <div>
    <h4>${effect.name}</h4>
    <div>Duration : ${effect.duration} minutes.</div>
    <div>Description: ${effect.description}</div>
    <div>Target: ${effect.data.target}</div>
    <div>Whisper updates to target: ${effect.data.whisperTarget}</div>
    </div>
    <br/>`;
  }
  //console.log(msgContent);
  let options = {
    title: 'Custom Effect Report',
    content: msgContent,
    buttons: {
      close: {
        label: 'Close'
      }
    }
  };

  new Dialog(options).render(true);
}
