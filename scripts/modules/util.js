export const registerUtil = () => {
  OSRH.util = OSRH.util || {};
  //tick: manages light duration, turn count
  OSRH.util.osrTick = async function () {
    if (game.user.role >= 4) {
      let lastTick = await game.settings.get(`${OSRH.moduleName}`, 'lastTick');
      await OSRH.util.osrLightTick(lastTick);
      await OSRH.util.osrEffectTick(lastTick);

      //update lightTick

      await game.settings.set(`${OSRH.moduleName}`, 'lastTick', game.time.worldTime);
    }
  };
  OSRH.util.osrLightTick = async function (lastTick) {
    if (game.user.role >= 4) {
      //get data
      const data = {
        light: null
      };
      const curTime = game.time.worldTime;
      const elapsed = (curTime - lastTick) / 60;
      //manage light duration
      for (let user of game.users.contents) {
        data.light = await user.getFlag(`${OSRH.moduleName}`, 'lightData');
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
                if (data.light[actorId][lightType].duration > OSRH.data.lightSource[lightType].duration) {
                  data.light[actorId][lightType].duration = OSRH.data.lightSource[lightType].duration;
                }
                //on last turn shrink light radius
                if (data.light[actorId][lightType].duration <= 10) {
                  OSRH.util.updateTokens(actorId, OSRH.data.lightSource[lightType], true);
                }
                // if duration <= 0 run lightOff function, and delete light type object
                if (data.light[actorId][lightType].duration <= 0) {
                  const actor = await game.actors.contents.find((a) => a.id == actorId);
                  const item = await actor.items.getName(OSRH.data.lightSource[lightType].name);
                  const newCount = item.system.quantity.value - 1;
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

                  OSRH.light.osrLightOff(actorId);
                  delete data.light[actorId][lightType];
                  if (Object.keys(data.light[actorId]).length == 1) {
                    delete data.light[actorId];
                  }
                }
              }
            }
          }
        }
        await user.unsetFlag(`${OSRH.moduleName}`, 'lightData');
        await user.setFlag(`${OSRH.moduleName}`, 'lightData', data.light);
      }
    }
  };
  OSRH.util.osrEffectTick = async function (lastTick) {
    if (game.user.role >= 4) {
      const curTime = game.time.worldTime;
      const elapsed = (curTime - lastTick) / 60;
      for (let user of game.users.contents) {
        let effectData = await user.getFlag(`${OSRH.moduleName}`, 'effectData');

        for (let effectId in effectData) {
          let effect = effectData[effectId];
          effect.duration -= elapsed;

          if (effect.duration <= 0) {
            const msgData = `<h3 style="color: red;"> Custom Effect Expired</h3>
    <div>Custom effect ${effectData[effectId].name} has expired!.`;
            OSRH.util.ChatMessage(effectData[effectId], effectData[effectId].userId, msgData);
            delete effectData[effectId];
          }
        }

        await user.unsetFlag(`${OSRH.moduleName}`, 'effectData');
        await user.setFlag(`${OSRH.moduleName}`, 'effectData', effectData);
      }
    }
  };
  OSRH.util.setLightFlag = function (data) {
    const { actor, actorId, type, duration } = data;
    const journal = game.journal.getName(game.settings.get(`${OSRH.moduleName}`, 'timeJournalName'));
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
    journal.setFlag('world', 'osrLights', flagObj);
    actor.setFlag('world', 'lightLit', true);
  };

  OSRH.util.getById = function (type, id) {
    if (type == 'actor') {
      return game.actors.find((a) => a.id == id);
    }
    if (type == 'journal') {
      return game.journal.find((j) => j.id == id);
    }
  };

  OSRH.util.getActor = function () {
    if (canvas.tokens.controlled.length > 1 || canvas.tokens.controlled.length == 0) {
      ui.notifications.error('Please select a single token');
      return;
    }
    return game.actors.find((a) => a.id == canvas.tokens.controlled[0].actor.id);
  };

  OSRH.util.unSetLightFlag = function (data) {
    const { actor, actorId } = data;
    const journal = game.journal.getName(game.settings.get(`${OSRH.moduleName}`, 'timeJournalName'));
    let flags = journal.flags.world.osrLights;
    delete flags[actorId];
    journal.unsetFlag('world', 'osrLights');
    journal.setFlag('world', 'osrLights', flags);
    actor.setFlag('world', 'lightLit', false);
  };

  OSRH.util.osrClearUserFlag = async function (data) {
    const { user, scope, flagname, reset } = data;
    await user.unsetFlag(scope, flagname);
    if (reset) await user.setFlag(scope, flagname, {});
  };

  OSRH.util.resetMonsterAttacks = async function () {
    for (let combatant of game.combats.active.combatants.contents) {
      const actor = combatant.actor;
      if (actor.type == 'monster') {
        for (let item of actor.items.contents) {
          if (item.type == 'weapon') {
            let count = item.system.counter.max;
            await item.update({ data: { counter: { value: count } } });
          }
        }
      }
    }
  };

  OSRH.util.GetActorById = function (id) {
    return game.actors.contents.find((a) => a.id == id);
  };
  OSRH.util.getActorId = function (actorName) {
    const id = game.actors.getName(actorName)?.id;
    if (id) {
      return id;
    }
  };

  OSRH.util.UserAssigned = function (actorId) {
    for (let user of game.users.contents) {
      if (user?.character?.id == actorId) {
        return user.id;
      }
    }
  };

  OSRH.util.ChatMessage = function (effectData, userId, msgContent) {
    const whisperArray = [userId];
    if (effectData.whisperTarget) {
      const targetId = OSRH.util.getActorId(effectData.target);
      const targetUserId = OSRH.util.UserAssigned(targetId);
      // if target is a user controlled character
      if (targetUserId) {
        whisperArray.push(targetUserId);
      }
    }

    ChatMessage.create({ content: msgContent, whisper: whisperArray });
  };

  OSRH.util.centerHotbar = function () {
    let hotbar = document.getElementById('hotbar');
    if (game.settings.get(`${OSRH.moduleName}`, 'centerHotbar')) {
      document.documentElement.style.setProperty('--hotbar-center', `${window.innerWidth / 2 - 289}px`);
      hotbar.classList.add('center-hotbar');
    } else {
      hotbar.classList.remove('center-hotbar');
      // document.documentElement.style.setProperty('--hotbar-center', ''); //'220px'
    }
  };

  OSRH.util.osrHook = function (hookName, args = []) {
    Hooks.callAll(hookName, ...args);
  };
  OSRH.util.toggleButton = function (btn) {
    if (btn.disabled) {
      btn.disabled = false;
      return;
    }
    btn.disabled = true;
  };

  OSRH.util.updateTokens = async function (actorId, lightData, lastTurn = false) {
        //loop through active game scenes
    for (let scene of game.scenes.contents) {
      //loop through tokens contaioned in scene
      scene.tokens.contents.forEach(async (t) => {
        //if token actorId == actorId set light settings to off

        if (t?.actor?.id == actorId) {
          let dim = lightData.dimLight;
          if (lastTurn) dim = dim * 0.7;
          //hacky version check, if less than v8 = false, data checks if oldVer is false, and sends appropriate data object
          const version = OSRH.gameVersion;

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

  OSRH.util.countJournalInit = async function (journalName) {
    let entry = game.journal.getName(journalName);

    if (!entry) {
      entry = await JournalEntry.create({
        name: `${journalName}`
      });
      await entry.createEmbeddedDocuments('JournalEntryPage', [
        {
          name: `${journalName}`,
          type: 'text'
        }
      ]);
      OSRH.turn.updateJournal();
      console.log(`OSR-helper: no count journal found.
      Journal entry named ${journalName} created.`);
    }
    return entry;
  };

  OSRH.util.singleSelected = function () {
    if (canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1) {
      ui.notifications.error('Please select a single token');
      return false;
    }
    return true;
  };

  //random text generator
  OSRH.util.tableFlavor = function () {
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

  OSRH.util.getPartyActors = function () {
    const systemName = game.system.id == 'ose' ?game.system.id : 'ose-dev';
        const allParty = game.actors.filter((a) => a?.flags?.[systemName]?.party) ;
    const retObj = {
      party: allParty,
      characters: [],
      retainers: []
    };
    for (let actor of allParty) {
      if (actor.system.retainer.enabled) {
        retObj.retainers.push(actor);
      } else {
        retObj.characters.push(actor);
      }
    }
    return retObj;
  };

  OSRH.util.attack = async function () {
    // Get Selected
    if (!OSRH.util.singleSelected()) {
      return;
    }
    const selectedActor = canvas.tokens.controlled[0].actor;
    // Select Weapon
    let actorWeapons = selectedActor?.items.filter((item) => item.type == 'weapon');
    let actorSpells = selectedActor?.items.filter((item) => {
      if (item.type == 'spell') return true;
    });
    if (actorWeapons.length == 0 && actorSpells.length == 0) {
      ui.notifications.error('No weapons found.');
      return;
    }
    let atkOptions = '';
    for (let item of actorWeapons) {
      atkOptions += `<option value=${item.id}>${item.name} | ATK: ${item.system.damage}</option>`;
    }
    for (let item of actorSpells) {
      if (item.system.roll != '') {
        atkOptions += `<option value=${item.id}>${item.name} | ATK: ${item.system.roll}</option>`;
      }
    }

    const ammoCheck = game.modules.get('osr-item-shop')?.active
      ? `
      <div style="width: 110px">
      <input id="ammoCheck" type="checkbox" checked />Check Ammo
      </div>
      `
      : `
      <div style="width: 110px">
      </div>
      `;
    let dialogTemplate = `
     <h1> Pick a weapon </h1>
     <div style="display:flex; justify-content: space-between; margin-bottom: 1em;">
       <div>
       <select id="weapon" style="width: 150px">${atkOptions}</select>
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
            let ammoObj = OSRH.data.ammoData.find((a) => a.name == weapon?.name);
            let ammo, ammoQty;
            if (ammoObj && ammoCheck) {
              ammo = selectedActor.items.find((i) => i.name == ammoObj.ammoType);
              ammoQty = ammo?.system.quantity.value;
              if (ammoQty > 0) {
                await weapon.roll({ skipDialog: skipCheck });
                //delete ammo object if quantity is 0 or less
                if (ammoQty - 1 == 0) {
                  ammo.delete();
                } else {
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

  OSRH.util.charMonReact = async function (data) {
    const { tableName } = data;
    const characters = await OSRH.util.getPartyActors().party;
    let characterList = ``;
    for (let char of characters) {
      const cData = {
        name: char?.name,
        id: char?.id,
        bonus: char?.system.scores.cha.mod
      };
      if (cData.name) {
        characterList += `<option value="${cData.bonus}">${cData.name}: CHA bonus:${cData.bonus}</option>`;
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
          callback: async (html) => {
            let bonus = html.find('#character')[0].value;
            const table = await game.tables.find((t) => t.name == tableName);
            let roll = new Roll(`2d6 + @mod`, { mod: bonus });
            let result = await table.roll({ roll });
            const gm = game.users.find((u) => u.isGM)[0];
            const message = {
              flavor: `
                    <span style='color: red'>Reaction Roll Results</span>
                    <br/>${result?.results[0]?.data?.text}<br/></br>
                    `,
              user: game.user.id,
              roll: result,
              speaker: ChatMessage.getSpeaker(),
              // content: ``,
              whisper: [gm]
            };
            result.roll.toMessage(message);
          }
        }
      }
    }).render(true);
  };

  OSRH.util.randomName = function (type = null, gender = null) {
    function getRandomItem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function getName(type, gender = 'all') {
      const nameData = OSRH.data.nameData;
      const firstObj = nameData[type];
      const typeObj =
        gender == 'all'
          ? firstObj.first[Math.floor(Math.random() * firstObj.first.length)]
          : firstObj.first.find((a) => a.type == gender);
      let firstName = getRandomItem(typeObj.list);
      let lastName = nameData[type].last.length > 0 ? getRandomItem(nameData[type].last) : false;
      let fullName = !lastName ? firstName : `${firstName} ${lastName}`;
      return fullName;
    }

    if (!type) {
      let options = ``;
      for (let key of Object.keys(OSRH.data.nameData)) {
        options += `
        <option value="${key}">${key}</option>
        `;
      }

      let diagTemplate = `
    <h1> Pick Name Type</h1>
    <div style="display:flex; margin-bottom: 5px;">
      <div  style="flex:1">
        <select id="nameType">
          <option value="none">-type-</option>
          ${options}
        </select>
      </div>
      <div  style="flex:1">
        <select id="gender">
          <option value="all">-gender-</option>
          <option value="male">male</option>
          <option value="female">female</option>
          <option value="all">all</option>
        </select>
      </div>
      <div>
        <label for="whisperCheck">whisper?</label>
        <input type ="checkbox" id="whisperCheck" checked />
      </div>
    </div>
    `;
      let prefix = [
        `Meet`,
        `Presenting`,
        `This old so and so right here is`,
        `Look who it is, it's`,
        `Hey, it's`,
        `As I live and breath, it's`,
        `Well I'll be damned, it's`,
        `Look what the cat dragged in. This here is`,
        `Introducing`
      ];
      let picker = new Dialog({
        title: 'Random Name',
        content: diagTemplate,
        buttons: {
          pick: {
            label: 'Pick',
            callback: async function (html) {
              const nameType = html.find('#nameType')[0].value;
              const gender = html.find('#gender')[0].value;
              const whisper = html.find('#whisperCheck')[0].checked;
              let openSheets = document.querySelectorAll('.ose.sheet.actor.character');
              let focusedSheet = openSheets ? openSheets[0] : null;
              for (let sheet of openSheets) {
                if (parseInt(focusedSheet.style.zIndex) < parseInt(sheet.style.zIndex)) {
                  focusedSheet = sheet;
                }
              }
              const tokens = canvas.tokens.controlled;
              if (nameType == 'none' || gender == 'none') {
                ui.notifications.warn('Please select an option');
                picker.render();
                return;
              }
              let fullName = await getName(nameType, gender);
              let cData = {
                type: 1,
                user: game.user.id,
                content: `${getRandomItem(prefix)} ${fullName}`
              };
              if (whisper) {
                cData.whisper = [game.user];
              }
              ChatMessage.create(cData);
              if (canvas.tokens.controlled.length && canvas.tokens.controlled.length == 1) {
                let token = canvas.tokens.controlled[0];
                let actor = token.actor;
                await actor.update({
                  name: fullName,
                  token: {
                    name: fullName
                  }
                });
                await token.document.update({ name: fullName });
                ui.notifications.info('Token and Actor names updated.');
              }
              if (tokens.length) {
                tokens.forEach(async (t) => {
                  let token = t;
                  let actor = t.actor;
                  let newName = await getName(nameType, gender);

                  if (actor.type == 'character') {
                    await actor.update({
                      name: newName,
                      token: {
                        name: newName
                      }
                    });
                  }

                  await token.document.update({ name: newName });
                });
                ui.notifications.info('Token and Actor names updated.');
              }
              if (!canvas.tokens.controlled.length && focusedSheet) {
                const charSheet = focusedSheet; //document.querySelector('.ose.sheet.actor.character');
                const name = charSheet ? charSheet.querySelector('.ose.sheet.actor .window-title').innerText : 'none';
                const actor = game.actors.getName(name);
                await actor.update({
                  name: fullName,
                  token: {
                    name: fullName
                  }
                });
              }
            }
          }
        }
      });
      picker.render(true);
    }
    if (type) {
      let gdr = gender ? gender : 'all';
      let name = getName(type, gdr);
      return name;
    }
  };

  OSRH.util.getCurrencyItems = async function (actor) {
    let items = actor.items;
    let currencyList = [];
    items.forEach((i) => {
      let tags = i.system.manualTags;
      let tag = tags && tags.find((t) => t.title == 'Currency') ? true : null;
      if (tag) currencyList.push(i);
    });
    return currencyList;
  };
  OSRH.util.curConvert = async function (amt, curCur, newCur, actor) {
    const curItems = actor.items;
    const curCheck = async (type) => {
      let itemExists = actor.items.getName(type);
      let pack = game.packs.get(`${OSRH.moduleName}.${OSRH.moduleName}-items`);
      if (!itemExists) {
        let curItm = await pack.getDocument(pack.index.getName(type)._id);
        let itemData = curItm.clone();
        await actor.createEmbeddedDocuments('Item', [itemData]);
        return await actor.items.getName(type);
      } else {
        return itemExists;
      }
    };
    const curItem = await curCheck(curCur);
    const newItem = await curCheck(newCur);
    if (curItem.system.quantity.value < amt) {
      ui.notifications.warn(`Not enough ${curCur}`);
      OSRH.util.curConDiag(actor, amt);
      return;
    }
    let newVal = (curItem.system.cost * amt) / newItem.system.cost;
    if (newVal % 1 != 0) {
      ui.notifications.warn(`Can't Convert To Fractional Amounts. Please Select A Different Amount To Convert`);
      curConDiag(actor, amt);
      return;
    }
    await curItem.update({
      data: {
        quantity: {
          value: curItem.system.quantity.value - amt
        }
      }
    });
    await newItem.update({
      data: {
        quantity: {
          value: newItem.system.quantity.value + newVal
        }
      }
    });
  };

  OSRH.util.curConDiag = async function (actor, amt = 0) {
    let content = `
    <div style="display: flex; height: 75px; align-items: center; justify-content: space-around;">
     
       
     
     <div>Amount:</div>
     
     <input id="amt" type="number" value="${amt}">
     <div><b> X </b></div>
     <select id="curCur">
       <option value="null">Currency</option>
       <option value='PP'>PP</option>
       <option value='GP'>GP</option>
       <option value='EP'>EP</option>
       <option value='SP'>SP</option>
       <option value='CP'>CP</option>
     </select>
     <div> to:</div>
     <select id="newCur">
       <option value="null">Currency</option>
       <option value='PP'>PP</option>
       <option value='GP'>GP</option>
       <option value='EP'>EP</option>
       <option value='SP'>SP</option>
       <option value='CP'>CP</option>
     </select>
     </div>
    `;
    let diag = new Dialog({
      title: 'Currency Converter',
      content: content,
      buttons: {
        convert: {
          label: 'convert',
          callback: (html) => {
            // let actor = canvas.tokens.controlled[0]?.actor;
            if (!actor) ui.notifications.warn('No token Selected');
            let curCur = html.find('#curCur')[0].value;
            let newCur = html.find('#newCur')[0].value;
            let amt = parseInt(html.find('#amt')[0].value);
            if (curCur == 'null' || newCur == 'null') {
              ui.notifications.warn('Please make sure both currencies are selected.');
              OSRH.util.curConDiag(actor, amt);
              return;
            }
            OSRH.util.curConvert(amt, curCur, newCur, actor);
          }
        }
      }
    });
    diag.render(true);
  };
  OSRH.util.debounce = function (callback, wait) {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  };

  OSRH.util.setting = async function (setting, value, type) {
    if (type == 'set') {
      await game.settings.set(`${OSRH.moduleName}`, setting, value);
    }
    if (type == 'get') {
      return await game.settings.get(`${OSRH.moduleName}`, setting);
    }
  };
  OSRH.util.createActiveEffectOnTarget = async function (data, target) {
    let id = target._id ? target._id : target.id;
    if (id) {
      target = game.actors.get(id);
      let effect = await ActiveEffect.create(data, { parent: target });
      return effect;
    }
  };
  OSRH.util.setTheme = async function () {
    let index = await game.settings.get(OSRH.moduleName, 'theme');
    index = index == 'none' ? 0 : index;
    let themeData = OSRH.data.themeData[index];
    let root = document.documentElement;
    root.style.setProperty('--t1-1', themeData.c1);
    root.style.setProperty('--t1-2', themeData.c2);
    root.style.setProperty('--t1-3', themeData.c3);
    root.style.setProperty('--t1-bg', themeData.bg);
    root.style.setProperty('--t1-num', themeData.midNum);
    root.style.setProperty('--theme-btn-color', themeData.btnColor);
    root.style.setProperty('--el-button-glow', themeData.glow);
  };

  OSRH.util.dropContainer = async function (actor, html) {
    let containers = actor.items.filter((i) => i.type == 'container');
    for (let container of containers) {
      let contItems = container.system.itemIds;
      let isEquipped = await container.getFlag('world', 'equipped');
      if (isEquipped == undefined) {
        await container.setFlag('world', 'equipped', true);
        isEquipped = true;
      }
      let eqpTag = isEquipped ? `item-equipped` : `item-unequipped`;
      let title = html.find(`[data-item-id ="${container.id}"] h4[title="${container.name}"]`);
      let element = title[0].parentNode.querySelector(`.item-header .item-controls`);
      let btnEl = document.createElement('a');
      btnEl.classList.add(`item-control`, `item-toggle`, `${eqpTag}`);
      btnEl.title = 'Equip';
      btnEl.innerHTML = `<i class="fas fa-tshirt"></i>`;
      element.prepend(btnEl);
      let eqpBtn = element.querySelector(`[title="Equip"]`);
      eqpBtn.addEventListener('click', async (ev) => {
        let flag = await container.getFlag('world', 'equipped');
        if (flag) {
          eqpBtn.classList.replace(`item-equipped`, `item-unequipped`);
          await container.setFlag('world', 'equipped', false);
          for (let item of contItems) {
            let itemObj = await actor.items.get(item.id);
            await itemObj.setFlag('world', `weight`, itemObj.system.weight);
            await itemObj.update({ data: { weight: 0 } });
          }
        }
        if (!flag) {
          eqpBtn.classList.replace(`item-unequipped`, `item-equipped`);
          for (let item of contItems) {
            let itemObj = await actor.items.get(item.id);
            let weight = await itemObj.getFlag('world', `weight`);
            await itemObj.update({ data: { weight: weight } });
            await itemObj.unsetFlag(`world`, `weight`);
          }
          await container.setFlag('world', 'equipped', true);
        }
      });
    }
  };
};
