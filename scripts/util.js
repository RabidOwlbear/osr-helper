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
      //get data
      const data = {
        light: null
      };
      const curTime = game.time.worldTime;
      const elapsed = (curTime - lastTick) / 60;
      //manage light duration
      for (let user of game.users.contents) {
        data.light = await user.getFlag('OSE-helper', 'lightData');
        //loop through actorIds in light flag
        for (let actorId in data.light) {
          //If actor does not have light lit...
          if (data.light[actorId].lightLit) {
            //loop through the light types in data.actorId
            for (let lightType in data.light[actorId]) {
              //check if light isOn = true
              if (data.light[actorId][lightType].isOn) {
                //decrement duration by time elapsed in minutes
                data.light[actorId][lightType].duration -= elapsed;
                //if duration is greater than maximum, set to maximum.
                if (data.light[actorId][lightType].duration > OSEH.data.lightSource[lightType].duration) {
                  data.light[actorId][lightType].duration = OSEH.data.lightSource[lightType].duration;
                }
                //on last turn shrink light radius
                if (data.light[actorId][lightType].duration <= 10) {
                  OSEH.util.updateTokens(actorId, OSEH.data.lightSource[lightType], true);
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
                  //changed oseh.light.ligthOff to oseLightOff
                  OSEH.light.oseLightOff(actorId);
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
      for (let user of game.users.contents) {
        effectData = await user.getFlag('OSE-helper', 'effectData');

        for (let effectId in effectData) {
          let effect = effectData[effectId];
          effect.duration -= elapsed;

          if (effect.duration <= 0) {
            const msgData = `<h3 style="color: red;"> Custom Effect Expired</h3>
    <div>Custom effect ${effectData[effectId].name} has expired!.`;
            OSEH.util.ChatMessage(effectData[effectId], effectData[effectId].data.userId, msgData);
            delete effectData[effectId];
          }
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
    await user.unsetFlag(scope, flagname);
    if (reset) await user.setFlag(scope, flagname, {});
  };

  OSEH.util.resetMonsterAttacks = async function () {
    for (let combatant of game.combats.active.combatants.contents) {
      const actor = combatant.actor;
      if (actor.type == 'monster') {
        for (let item of actor.data.items.contents) {
          if (item.type == 'weapon') {
            let count = item.data.data.counter.max;
            await item.update({ data: { counter: { value: count } } });
          }
        }
      }
    }
  };

  OSEH.util.GetActorById = function (id) {
    return game.actors.contents.find((a) => a.id == id);
  };
  OSEH.util.getActorId = function (actorName) {
    const id = game.actors.getName(actorName)?.id;
    if (id) {
      return id;
    }
  };

  OSEH.util.UserAssigned = function (actorId) {
    for (let user of game.users.contents) {
      if (user?.character?.id == actorId) {
        return user.id;
      }
    }
  };

  OSEH.util.ChatMessage = function (effectData, userId, msgContent) {
    const whisperArray = [userId];
    if (effectData.data.whisperTarget) {
      const targetId = OSEH.util.getActorId(effectData.data.target);
      const targetUserId = OSEH.util.UserAssigned(targetId);
      // if target is a user controlled character
      if (targetUserId) {
        whisperArray.push(targetUserId);
      }
    }

    ChatMessage.create({ content: msgContent, whisper: whisperArray });
  };

  OSEH.util.centerHotbar = function () {
    if (game.settings.get('OSE-helper', 'centerHotbar')) {
      document.documentElement.style.setProperty('--hotbar-center', 'calc(50% - 270px');
    } else {
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
    //loop through active game scenes
    for (let scene of game.scenes.contents) {
      //loop through tokens contaioned in scene
      scene.data.tokens.contents.forEach(async (t) => {
        //if token actorId == actorId set light settings to off

        if (t?.actor?.id == actorId) {
          let dim = lightData.dimLight;
          if (lastTurn) dim = dim * 0.7;
          //hacky version check, if less than v8 = false, data checks if oldVer is false, and sends appropriate data object
          const version = OSEH.gameVersion;

          const oldVer = parseInt(version) < 9;

          let data;
          if (oldVer) {
            data = {
              brightLight: lightData.brightLight,
              dimLight: dim,
              lightColor: lightData.color,
              lightAlpha: lightData.lightAlpha,
              lightAnimation: { type: 'torch', speed: 3, intensity: 5 }
            };
          } else {
            data = {
              light: {
                bright: lightData.brightLight,
                dim: dim,
                color: lightData.color,
                alpha: lightData.lightAlpha,
                gradual: true,
                animation: { type: 'torch', speed: 3, intensity: 5 }
              }
            };
          }

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
    return flavorArr[index];
  };

  OSEH.util.getPartyActors = function () {
    const allParty = game.actors.filter((a) => a.data.flags?.ose?.party == true);
    const retObj = {
      party: allParty,
      characters: [],
      retainers: []
    };
    for (let actor of allParty) {
      if (actor.data.data.retainer.enabled) {
        retObj.retainers.push(actor);
      } else {
        retObj.characters.push(actor);
      }
    }
    return retObj;
  };

  OSEH.util.attack = async function () {
    // Get Selected
    if (!OSEH.util.singleSelected()) {
      return;
    }
    const selectedActor = canvas.tokens.controlled[0].actor;
    // Select Weapon
    let actorWeapons = selectedActor.data.items.filter((item) => item.type == 'weapon');
    let actorSpells = selectedActor.data.items.filter((item) => {
      if (item.type == 'spell') return true;
    });
    if(actorWeapons.length == 0 && actorSpells.length == 0){
      ui.notifications.error('No weapons found.')
      return
    }
    let atkOptions = '';
    for (let item of actorWeapons) {
      atkOptions += `<option value=${item.id}>${item.name} | ATK: ${item.data.data.damage}</option>`;
    }
    for (let item of actorSpells) {
      if (item.data.data.roll != '') {
        atkOptions += `<option value=${item.id}>${item.name} | ATK: ${item.data.data.roll}</option>`;
      }
    }

    const ammoCheck = game.modules.get('osr-item-shop')?.active ? `
      <div>
      <input id="ammoCheck" type="checkbox" checked />Check Ammo
      </div>
      ` :
      `
      <div>
      </div>
      `;
    let dialogTemplate = `
     <h1> Pick a weapon </h1>
     <div style="display:flex; justify-content: space-between; margin-bottom: 1em;">
       <div>
       <select id="weapon">${atkOptions}</select>
       </div>
       ${ammoCheck}
       <div>
       <input id="skip" type="checkbox" checked />Skip Dialog
       </div>
       </div>
     `;
    new Dialog({
      title: 'Roll Attack',
      content: dialogTemplate,
      buttons: {
        rollAtk: {
          label: 'Roll Attack',
          callback: async (html) => {
            let selected = html.find('#weapon')[0];
            let skipCheck = html.find('#skip')[0]?.checked;
            let ammoCheck = html.find(`#ammoCheck`)[0]?.checked;
            let weapon = selectedActor.items.find((i) => i.id == selected.value);
            let ammoObj = OSEH.data.ammoData.find((a) => a.name == weapon?.name);
            let ammo, ammoQty;
            if (ammoObj && ammoCheck) {
              ammo = selectedActor.items.find((i) => i.name == ammoObj.ammoType);
              ammoQty = ammo?.data.data.quantity.value;
              if (ammoQty > 0) {
                await weapon.roll({ skipDialog: skipCheck });
                //delete ammo object if quantity is 0 or less
                console.log(ammoQty, ammo)
                if(ammoQty - 1 == 0){
                  ammo.delete()
                }else{
                  await ammo.update({ data: { quantity: { value: ammoQty - 1 } } });
                }
                
              } else {
                ui.notifications.warn('No ammo');
                main();
              }
            } else {
              await weapon.roll({ skipDialog: skipCheck });
            }
          }
        },
        close: {
          label: 'Close'
        }
      }
    }).render(true);
  };

  OSEH.util.charMonReact= async function () {
    const tableName = 'Monster Reaction Roll'
    const characters = await OSEH.util.getPartyActors().party;
    // const characters = [];
    // game.users.players.map((p)=>{
    //     const char = p.character
    //     characters.push({
    //         name: char?.name,
    //         id: char?.id,
    //         bonus: char?.data.data.scores.cha.mod
    //     })
    // })
    console.log( characters )
    let characterList = ``
    for(let char of characters){
      const cData = {
        name: char?.name,
        id: char?.id,
        bonus: char?.data.data.scores.cha.mod
      }
        if(cData.name){
        characterList += `<option value="${cData.bonus}">${cData.name}: CHA bonus:${cData.bonus}</option>`
        }
    }
    let dialogTemplate = `
  <h1> Pick A Character </h1>
  <div style="display:flex">
    <div  style="flex:1">
        <select id="character">${characterList}</select>
    </div>
  </div>`;
    
    
    new Dialog({
        title: 'Character vs. Monster Reaction Roll',
        content: dialogTemplate,
        buttons: {
        roll: {
            label: 'Roll',
            callback: async (html)=>{
                let bonus = html.find("#character")[0].value;
                const table = await game.tables.find(t=>t.name== tableName);
                console.log('bonus', bonus)
                let roll = new Roll(`2d6 + @mod`, {mod: bonus});
                let result = await table.roll({roll})
               
                console.log('res', result)
                
                const gm = game.users.find(u=>u.isGM)[0]
                const message = {
                    flavor: `
                    <span style='color: red'>Reaction Roll Results</span>
                    <br/>${result?.results[0]?.data?.text}<br/></br>
                    mod: ${bonus}<br/>`,
                    user: game.user.id,
                    roll: result,
                    speaker: ChatMessage.getSpeaker(),
                    // content: ``,
                    whisper: [gm]
                    };
                    console.log(`before message`)
                // ChatMessage.create(message)
                result.roll.toMessage(message)
                    
                }
            }
        }
    }).render(true);
  };
});
