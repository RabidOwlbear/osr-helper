import { OSRHAttack } from './attack.mjs';
export const registerUtil = () => {
  OSRH.util.singleGM = function () {
    return game.users.filter((u) => u.active && u.isGM)[0];
  };
  OSRH.util = OSRH.util || {};
  //tick: manages light duration, turn count
  // used
  OSRH.util.osrTick = async function () {
    const singleGM = OSRH.util.singleGM();
    if (singleGM && game.user.id === singleGM.id) {
      let lastTick = await game.settings.get(`${OSRH.moduleName}`, 'lastTick');
      // await OSRH.util.osrLightTick(lastTick);
      // OSRH.util.osrEffectTick(lastTick);

      //update lightTick

      await game.settings.set(`${OSRH.moduleName}`, 'lastTick', game.time.worldTime);
    }
  };
  // delete
  OSRH.util.osrLightTick = async function (lastTick) {
    const singleGM = OSRH.util.singleGM();
    if (singleGM && game.user.id === singleGM.id) {
      //get data
      const data = {
        light: null
      };
      const curTime = game.time.worldTime;
      const elapsed = (curTime - lastTick) / 60;
      //manage light duration
      for (let user of game.users.contents) {
        data.light = user.getFlag(`${OSRH.moduleName}`, 'lightData');
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
                  // const actor = await game.actors.contents.find((a) => a.id == actorId);
                  const actor = await game.actors.get(actorId);
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
        user.unsetFlag(`${OSRH.moduleName}`, 'lightData');
        user.setFlag(`${OSRH.moduleName}`, 'lightData', data.light);
      }
    }
  };
  // delete
  OSRH.util.osrEffectTick = function (lastTick) {
    const singleGM = OSRH.util.singleGM();
    if (singleGM && game.user.id === singleGM.id) {
      const curTime = game.time.worldTime;
      const elapsed = (curTime - lastTick) / 60;
      for (let user of game.users.contents) {
        let effectData = user.getFlag(`${OSRH.moduleName}`, 'effectData');
        for (let effectId in effectData) {
          let effect = effectData[effectId];
          effect.duration -= elapsed;

          if (effect.duration <= 0) {
            const msgData = `<h3 style="color: red;"> ${game.i18n.localize('OSRH.util.notification.effectExpired')}</h3>
              <div>${game.i18n.localize('OSRH.util.notification.customEffect')} ${
              effectData[effectId].name
            } ${game.i18n.localize('OSRH.util.notification.hasExpired')}`;
            OSRH.util.ChatMessage(effectData[effectId], effectData[effectId].userId, msgData);
            delete effectData[effectId];
          }
        }

        user.unsetFlag(`${OSRH.moduleName}`, 'effectData');
        user.setFlag(`${OSRH.moduleName}`, 'effectData', effectData);
      }
    }
  };
  OSRH.util.setLightFlag = async function (data) {
    const { actor, actorId, type, duration } = data;
    const journal = game.journal.getName(await game.settings.get(`${OSRH.moduleName}`, 'timeJournalName'));
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
      ui.notifications.error(game.i18n.localize('OSRH.util.notification.singleToken'));
      return;
    }
    return game.actors.find((a) => a.id == canvas.tokens.controlled[0].actor.id);
  };

  OSRH.util.unSetLightFlag = async function (data) {
    const { actor, actorId } = data;
    const journal = game.journal.getName(await game.settings.get(`${OSRH.moduleName}`, 'timeJournalName'));
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
  // used
  OSRH.util.resetMonsterAttacks = async function () {
    for (let combatant of game.combats.active.combatants.contents) {
      const actor = combatant.actor;
      if (actor.type == 'monster') {
        for (let item of actor.items.contents) {
          if (item.type == 'weapon') {
            let count = item.system.counter.max;
            await item.update({ system: { counter: { value: count } } });
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
  // used
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
  // used
  OSRH.util.centerHotbar = async function () {
    let hotbar = document.getElementById('hotbar');
    if (!game.version > 12 && await game.settings.get(`${OSRH.moduleName}`, 'centerHotbar')) {
      document.documentElement.style.setProperty('--hotbar-center', `${window.innerWidth / 2 - 578}px`);
      hotbar.classList.add('center-hotbar');
    } else {
      hotbar.classList.remove('center-hotbar');
      // document.documentElement.style.setProperty('--hotbar-center', ''); //'220px'
    }
  };
  // used
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
  // used
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
      await OSRH.turn.updateJournal(entry);
      console.log(`OSR-helper: no count journal found.
      Journal entry named ${journalName} created.`);
    }
    return entry;
  };
  // used
  OSRH.util.singleSelected = function () {
    if (canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1) {
      ui.notifications.error(game.i18n.localize('OSRH.util.notification.singleToken'));
      return false;
    }
    return true;
  };

  //random text generator
  // used
  OSRH.util.tableFlavor = function () {
    let flavorArr = [
      `<span style="color: DeepPink">${game.i18n.localize('OSRH.util.tableFlavor.a')}</span>`,
      `<span style="color: DeepPink">${game.i18n.localize('OSRH.util.tableFlavor.b')}</span>`,
      `<span style="color: DeepPink">${game.i18n.localize('OSRH.util.tableFlavor.c')}</span>`,
      `<span style="color: DeepPink">${game.i18n.localize('OSRH.util.tableFlavor.d')}</span>`,
      `<span style="color: DeepPink">${game.i18n.localize('OSRH.util.tableFlavor.e')}</span>`
    ];
    let index = Math.floor(Math.random() * flavorArr.length);
    return flavorArr[index];
  };
  // used
  OSRH.util.getPartyActors = function () {
    const partySheet = OSRH.systemData.partySheet;
    const flagName = partySheet ? game.system.id : 'osr-helper'; // == 'ose' ? game.system.id : 'ose-dev';
    const allParty = game.actors.filter((a) => a?.flags?.[flagName]?.party);
    const retObj = {
      party: allParty,
      characters: [],
      retainers: []
    };
    for (let actor of allParty) {
      if (actor.system?.retainer?.enabled) {
        retObj.retainers.push(actor);
      } else {
        retObj.characters.push(actor);
      }
    }
    return retObj;
  };
  // used
  OSRH.util.attack = function () {
    if (!OSRH.util.singleSelected()) {
      return;
    }
    const actor = canvas.tokens.controlled[0].actor;
    let x = window.innerWidth / 2 - 300;
    let y = window.innerHeight / 2;

    new OSRHAttack(actor).render(true, { top: y, left: x });
  };

  // used
  OSRH.util.randomName = function (type = null, gender = null) {
    function getRandomItem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function getName(type, gender = 'all') {
      const nameData = OSRH.data.nameData;
      const firstObj = nameData[type] || nameData.human;
      const typeObj =
        gender == 'all'
          ? firstObj.first[Math.floor(Math.random() * firstObj.first.length)]
          : firstObj.first.find((a) => a.type == gender);
      let firstName = getRandomItem(typeObj.list);
      let lastName = firstObj.last.length > 0 ? getRandomItem(firstObj.last) : false;
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
    <h1> ${game.i18n.localize('OSRH.util.dialog.pickNameType')}</h1>
    <div style="display:flex; margin-bottom: 5px;">
      <div  style="flex:1">
        <select id="nameType">
          <option value="none">-${game.i18n.localize('OSRH.util.dialog.type')}-</option>
          ${options}
        </select>
      </div>
      <div  style="flex:1">
        <select id="gender">
          <option value="all">-${game.i18n.localize('OSRH.util.dialog.gender')}-</option>
          <option value="male">${game.i18n.localize('OSRH.util.dialog.male')}</option>
          <option value="female">${game.i18n.localize('OSRH.util.dialog.female')}</option>
          <option value="all">${game.i18n.localize('OSRH.util.dialog.all')}</option>
        </select>
      </div>
      <div>
        <label for="whisperCheck">${game.i18n.localize('OSRH.util.dialog.whislper')}</label>
        <input type ="checkbox" id="whisperCheck" checked />
      </div>
    </div>
    `;
      let prefix = [
        game.i18n.localize('OSRH.util.prefix.a'),
        game.i18n.localize('OSRH.util.prefix.b'),
        game.i18n.localize('OSRH.util.prefix.c'),
        game.i18n.localize('OSRH.util.prefix.d'),
        game.i18n.localize('OSRH.util.prefix.e'),
        game.i18n.localize('OSRH.util.prefix.f'),
        game.i18n.localize('OSRH.util.prefix.g'),
        game.i18n.localize('OSRH.util.prefix.h'),
        game.i18n.localize('OSRH.util.prefix.i')
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
                ui.notifications.warn(game.i18n.localize('OSRH.util.notification.selectOption'));
                picker.render();
                return;
              }
              if (tokens.length && tokens.length == 1) {
                let token = canvas.tokens.controlled[0];
                let actor = token.actor;
                let fullName = getName(nameType, gender);
                // chat message
                let cData = {
                  type: 1,
                  user: game.user.id,
                  content: `${getRandomItem(prefix)} ${fullName}`
                };
                if (whisper) {
                  cData.whisper = [game.user];
                }
                ChatMessage.create(cData);
                await actor.update({
                  name: fullName,
                  prototypeToken: {
                    name: fullName
                  }
                });
                await token.document.update({ name: fullName });
                ui.notifications.info(game.i18n.localize('OSRH.util.notification.tokenActorNameUpdated'));
                return;
              }
              if (tokens.length > 1) {
                tokens.forEach(async (t) => {
                  let token = t;
                  let actor = t.actor;
                  let newName = await getName(nameType, gender);

                  if (actor.type == 'character') {
                    await actor.update({
                      name: newName,
                      prototypeToken: {
                        name: newName
                      }
                    });
                  }

                  await token.document.update({ name: newName });
                  let cData = {
                    type: 1,
                    user: game.user.id,
                    content: `${getRandomItem(prefix)} ${newName}`
                  };
                  if (whisper) {
                    cData.whisper = [game.user];
                  }
                  ChatMessage.create(cData);
                  await actor.update({
                    name: newName,
                    prototypeToken: {
                      name: newName
                    }
                  });
                  await token.document.update({ name: newName });
                  ui.notifications.info(game.i18n.localize('OSRH.util.notification.tokenActorNameUpdated'));
                });
                return;
              }
              if (!canvas.tokens.controlled.length && focusedSheet) {
                const charSheet = focusedSheet; //document.querySelector('.ose.sheet.actor.character');
                const name = charSheet ? charSheet.querySelector('.ose.sheet.actor .window-title').innerText : 'none';
                const actor = game.actors.getName(name);
                let fullName = getName(nameType, gender);
                await actor.update({
                  name: fullName,
                  token: {
                    name: fullName
                  }
                });
                return;
              }
              let fullName = getName(nameType, gender);
              let cData = {
                type: 1,
                user: game.user.id,
                content: `${getRandomItem(prefix)} ${fullName}`
              };
              if (whisper) {
                cData.whisper = [game.user];
              }
              ChatMessage.create(cData);
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
      let itemExists = await actor.items.getName(type);
      // check for translated languages, default to english
      const lang = OSRH.util.langCheck;
      const packName =
        lang === 'en'
          ? `${OSRH.moduleName}.${OSRH.moduleName}-items`
          : `${OSRH.moduleName}.${OSRH.moduleName}-items-${lang}`;
      let pack = await game.packs.get(packName);
      if (!itemExists) {
        const itemId = await pack.index.getName(type)?._id;
        if (!itemId) {
          ui.notifications.warn(`${game.i18n.localize('OSRH.notification.noGpFoundActor')}`);
          return;
        }
        let curItm = await pack.getDocument();
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
      ui.notifications.warn(`${game.i18n.localize('OSRH.util.notification.notEnough')} ${curCur}`);
      OSRH.util.curConDiag(actor, amt);
      return;
    }
    let newVal = (curItem.system.cost * amt) / newItem.system.cost;
    if (newVal % 1 != 0) {
      ui.notifications.warn(game.i18n.localize('OSRH.util.notification.cantConvertFraction'));
      curConDiag(actor, amt);
      return;
    }
    await curItem.update({
      system: {
        quantity: {
          value: curItem.system.quantity.value - amt
        }
      }
    });
    await newItem.update({
      system: {
        quantity: {
          value: newItem.system.quantity.value + newVal
        }
      }
    });
  };
  // used
  OSRH.util.curConDiag = async function (actor, amt = 0) {
    let content = `
    <div style="display: flex; height: 75px; align-items: center; justify-content: space-around;">
     
       
     
     <div>${game.i18n.localize('OSRH.util.dialog.amount')}:</div>
     
     <input id="amt" type="number" value="${amt}">
     <div><b> X </b></div>
     <select id="curCur">
       <option value="null">${game.i18n.localize('OSRH.util.dialog.currency')}</option>
       <option value='${game.i18n.localize('OSRH.curency.pp')}'>${game.i18n.localize('OSRH.curency.pp')}</option>
       <option value='${game.i18n.localize('OSRH.curency.gp')}'>${game.i18n.localize('OSRH.curency.gp')}</option>
       <option value='${game.i18n.localize('OSRH.curency.ep')}'>${game.i18n.localize('OSRH.curency.ep')}</option>
       <option value='${game.i18n.localize('OSRH.curency.sp')}'>${game.i18n.localize('OSRH.curency.sp')}</option>
       <option value='${game.i18n.localize('OSRH.curency.cp')}'>${game.i18n.localize('OSRH.curency.cp')}</option>
     </select>
     <div> ${game.i18n.localize('OSRH.util.dialog.to')}:</div>
     <select id="newCur">
       <option value="null">${game.i18n.localize('OSRH.util.dialog.currency')}</option>
       <option value='${game.i18n.localize('OSRH.curency.pp')}'>${game.i18n.localize('OSRH.curency.pp')}</option>
       <option value='${game.i18n.localize('OSRH.curency.gp')}'>${game.i18n.localize('OSRH.curency.gp')}</option>
       <option value='${game.i18n.localize('OSRH.curency.ep')}'>${game.i18n.localize('OSRH.curency.ep')}</option>
       <option value='${game.i18n.localize('OSRH.curency.sp')}'>${game.i18n.localize('OSRH.curency.sp')}</option>
       <option value='${game.i18n.localize('OSRH.curency.cp')}'>${game.i18n.localize('OSRH.curency.cp')}</option>
     </select>
     </div>
    `;
    let diag = new Dialog({
      title: game.i18n.localize('OSRH.util.dialog.curencyConverter'),
      content: content,
      buttons: {
        convert: {
          label: game.i18n.localize('OSRH.util.dialog.convert'),
          callback: (html) => {
            // let actor = canvas.tokens.controlled[0]?.actor;
            if (!actor) ui.notifications.warn(game.i18n.localize('OSRH.util.notification.noTokenSelected'));
            let curCur = html.find('#curCur')[0].value;
            let newCur = html.find('#newCur')[0].value;
            let amt = parseInt(html.find('#amt')[0].value);
            if (curCur == 'null' || newCur == 'null') {
              ui.notifications.warn(game.i18n.localize('OSRH.util.notification.selectBothCurrency'));
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
  // used
  OSRH.util.setting = async function (setting, value, type) {
    if (type == 'set') {
      await game.settings.set(`${OSRH.moduleName}`, setting, value);
    }
    if (type == 'get') {
      return await game.settings.get(`${OSRH.moduleName}`, setting);
    }
  };
  // used
  OSRH.util.createActiveEffectOnTarget = async function (data, target) {
    let id = target._id ? target._id : target.id;
    if (id) {
      target = game.actors.get(id);
      let effect = await ActiveEffect.create(data, { parent: target });
      return effect;
    }
  };
  // used
  OSRH.util.setTheme = async function () {
    let index = await game.settings.get(OSRH.moduleName, 'theme');
    index = index == 'none' ? 0 : index;
    let themeData = OSRH.data.themeData[index];
    let root = document.documentElement;
    root.style.setProperty('--t1-1', themeData.c1);
    root.style.setProperty('--t1-2', themeData.c2);
    root.style.setProperty('--t1-3', themeData.c3);
    root.style.setProperty('--t1-bg', themeData.bg);
    root.style.setProperty('--t1-bg-light', themeData.lightBg);
    root.style.setProperty('--t1-dark', themeData.dark);
    root.style.setProperty('--t1-text', themeData.text);
    root.style.setProperty('--t1-num', themeData.midNum);
    root.style.setProperty('--theme-btn-color', themeData.btnColor);
    root.style.setProperty('--theme-btn-txt', themeData.btnTxt);
    root.style.setProperty('--el-button-glow', themeData.glow);
  };
  // used
  OSRH.util.addContainerControls = async function (actor, html) {
    let containers = actor.items.filter((i) => i.type == 'container');

    for (let container of containers) {
      let flag = await container.getFlag('world', 'equipped');

      if (flag == undefined) {
        await container.setFlag('world', 'equipped', true);
        flag = true;
      }
      let isEquipped = flag;
      let eqpTag = isEquipped ? `item-equipped` : `item-unequipped`;
      let titleEl = html.find(`[data-item-id ="${container.id}"] h4[title="${container.name}"]`);
      let element = titleEl[0].parentNode.querySelector(`.item-header .item-controls`);
      let btnEl = document.createElement('a');
      btnEl.classList.add(`item-control`, `item-toggle`, `${eqpTag}`);
      btnEl.title = 'Equip';
      btnEl.innerHTML = `<i class="fas fa-tshirt"></i>`;
      element.prepend(btnEl);
      let eqpBtn = element.querySelector(`[title="Equip"]`);

      eqpBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        OSRH.util.dropContainer(container.uuid, element, actor);
      });
    }
  };
  OSRH.util.dropContainer = async function (actor, html) {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    // get containers
    let containers = actor.items.filter((i) => i.type == 'container');
    // loop containers
    for (let container of containers) {
      // get contents
      let contItems = container.system.itemIds;
      // get is equipped flag
      let isEquipped = await container.getFlag('world', 'equipped');
      // if no flag, create one
      if (isEquipped == undefined) {
        await container.setFlag('world', 'equipped', true);
        isEquipped = true;
      }
      let eqpTag = isEquipped ? `item-equipped` : `item-unequipped`;
      // get htnml elements
      let title = html.find(`[data-item-id ="${container.id}"] h4[title="${container.name}"]`);
      let element = title[0].parentNode.querySelector(`.item-header .item-controls`);
      // create equip button
      let btnEl = document.createElement('a');
      btnEl.dataset.containerId = container.id;
      btnEl.classList.add(`item-control`, `item-toggle`, `${eqpTag}`);
      btnEl.title = 'Equip';
      btnEl.innerHTML = `<i class="fas fa-tshirt"></i>`;
      element.prepend(btnEl);
      // let eqpBtn = element.querySelector(`[title="Equip"]`);
      btnEl.addEventListener('click', async (ev) => {
        btnEl.disabled = true;

        let flag = await container.getFlag('world', 'equipped');
        if (flag && contItems.length) {
          btnEl.classList.replace(`item-equipped`, `item-unequipped`);
          await container.setFlag('world', 'equipped', false);
          for (let item of contItems) {
            let itemObj = await actor.items.get(item);
            let itemFlag = itemObj.getFlag('world', `weight`);
            if (itemFlag == undefined) {
              await itemObj.setFlag('world', `weight`, itemObj.system.weight);
            }

            await itemObj.update({ system: { weight: 0 } });
            await sleep(250);
          }
        }
        if (flag === false) {
          btnEl.classList.replace(`item-unequipped`, `item-equipped`);

          for (let item of contItems) {
            let itemObj = await actor.items.get(item);
            let weight = await itemObj.getFlag('world', `weight`);

            await itemObj.update({ system: { weight: weight } });
            await sleep(250);
            // await itemObj.unsetFlag(`world`, `weight`);
          }
          await container.setFlag('world', 'equipped', true);
        }
        btnEl.disabled = false;
      });
    }
  };
  // used
  OSRH.util.initializeDroppableContainers = async function (actor, html) {
    // get containers
    let containers = actor.items.filter((i) => i.type == 'container');
    // loop containers
    for (let container of containers) {
      // get contents
      let contItems = container.system.itemIds;
      // get is equipped flag
      let isEquipped = await container.getFlag('world', 'equipped');
      // if no flag, create one
      if (isEquipped == undefined) {
        await container.setFlag('world', 'equipped', true);
        isEquipped = true;
      }
      let eqpTag = isEquipped ? `item-equipped` : `item-unequipped`;
      let title = html.find(`[data-item-id ="${container.id}"] h4[title="${container.name}"]`);
      let element = title[0].parentNode.querySelector(`.item-header .item-controls`);
      // create equip button
      let btnEl = document.createElement('a');
      btnEl.dataset.containerId = container.id;
      btnEl.classList.add(`item-control`, `item-toggle`, `${eqpTag}`);
      btnEl.title = 'Equip';
      btnEl.innerHTML = `<i class="fas fa-tshirt"></i>`;
      element.prepend(btnEl);

      // add listener
      btnEl.addEventListener('click', (e) => {
        OSRH.util.handleEquipableContainer(actor, btnEl, container);
      });
    }
  };
  OSRH.util.handleEquipableContainer = async function (actor, btnEl, container) {
    btnEl.disabled = true;

    let isEquipped = await container.getFlag('world', 'equipped');
    const containerItems = actor.items.filter((i) => container.system.itemIds.includes(i.id));

    if (isEquipped && containerItems.length) {
      btnEl.classList.replace(`item-equipped`, `item-unequipped`);
      await container.setFlag('world', 'equipped', false);
      for (let item of containerItems) {
        item.setFlag('world', `weight`, item.system.weight);
        await item.update({ system: { weight: 0 } });
      }
    }
    if (isEquipped === false) {
      btnEl.classList.replace(`item-unequipped`, `item-equipped`);

      for (let item of containerItems) {
        let weight = await item.getFlag('world', `weight`);

        await item.update({ system: { weight: weight } });
      }
      await container.setFlag('world', 'equipped', true);
    }
    btnEl.disabled = false;
  };
  OSRH.util.renderTurnTracker = function () {
    new OSRH.TurnTracker().render(true);
  };
  OSRH.util.langCheck = function () {
    const curLang = game.i18n.lang;
    const langList = OSRH.lang;
    let lang = 'en';
    if (langList.includes(curLang)) {
      lang = curLang;
    }
    return lang;
  };
  OSRH.util.getNestedValue = function (obj, path) {
    path = path.split('.');
    let len = path.length;
    for (let i = 0; i < len; i++) {
      obj = obj[path[i]];
    }
    return obj;
  };
  OSRH.util.getItem = async function (item, parent) {
    let itemData = null;
    if (item) {
      //wwn
      if (item.actor && item.actor.prototypeToken.actorLink) {
        let actor = await game.actors.get(item.actor._id);
        itemData = await actor.items.get(item._id);
      } else if (item.actor) {
        itemData = await item.actor.items.get(item._id);
      } else {
        itemData = await game.items.get(item._id);
      }
    }
    return itemData;
  };
  OSRH.util.getOSRHItems = function (actor, type) {
    let tags = false; //OSRH.systemData.tags;
    // if(tags){
    //   return actor.items.filter(i=>{
    //   let itemTags = [];
    //   i.system.tags.map(t=>itemTags.push(t.value.toLowerCase()))
    //   return itemTags.includes(type, actor);
    //   })
    // }
    return actor.items.filter((i) => i.flags?.['osr-helper']?.itemType === type);
  };
  OSRH.util.renderPartySheet = function () {
    // new OSRH.partySheet().render(true);
    Hooks.call('renderOSRHPartySheet');
  };
  OSRH.util.convertToSeconds = function (duration, unit) {
    const inc = {
      minute: 60,
      turn: 600,
      hour: 3600,
      day: 86400
    };
    return Math.round(parseInt(duration) * inc[unit]);
  };
  OSRH.util.convertFromSeconds = function (seconds, unit) {
    const inc = {
      minute: 60,
      turn: 600,
      hour: 3600,
      day: 86400
    };

    return Math.floor(seconds / inc[unit]);
  };
  OSRH.util.convertTime = function (duration, type, disp = false) {
    const inc = {
      minute: 60,
      turn: 600,
      hour: 3600,
      day: 86400
    };
    let val = duration / inc[type];
    let rem = val % 1 ? true : false;
    if (disp && rem && val > 1) {
      return `${Math.floor(val)}+`;
    }
    return Math.floor(val);
    // const fn = {
    //   0: (d, u)=>Math.round(parseInt(d) * inc[u]), //'get duration in seconds'
    //   1: (d, u)=>Math.floor(d / inc[u]), //'get duration in new type from seconds'
    //   2: (d, u, nt)=>{ //'day to hours'

    //   },
    //   3: (d,u)=>{ //day to minutes
    //   }
    // }
    // fn[2]()
  };
  OSRH.util.hasPermission = function (actor, uId, pLvl) {
    return actor.ownership?.[uId] >= pLvl ? true : false;
  };
};

export const intializePackFolders = async () => {
  let singleGM = false;
  if (game.user.isGM && game.users.filter((u) => u.role == 4)[0]?.id === game.user.id) {
    singleGM = true;
  }
  if (singleGM) {
    const movePacks = await game.settings.get('osr-helper', 'makePackFolder');
    const folderName = await game.settings.get('osr-helper', 'packFolderName');
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const packnames = [
      'osr-helper-items-en',
      'osr-helper-items-es',
      'osr-helper-items-pt-br',
      'osr-helper-macros-all',
      'osr-helper-items-hyperborea-en',
      'osr-helper-items-hyperborea-es',
      'osr-helper-items-hyperborea-pt-br',
      'osr-helper-items-dcc-en',
      'osr-helper-items-dcc-es',
      'osr-helper-items-dcc-pt-br',
      'osr-helper-items-basicfantasyrpg-en'
    ];
    let folder = game.folders.getName(folderName);
    if (!folder && movePacks) {
      folder = await Folder.create([{ name: folderName, type: 'Compendium', color: '#30741d' }]);
      packnames.forEach(async (pn) => {
        const pack = await game.packs.get(`osr-helper.${pn}`);
        if (pack) await pack.setFolder(folder[0]);
      });
      await sleep(150);
      ui.sidebar.render();
    }
  }
};
export const renderTemplateHandler = async (template, data) =>{
    if(game.version >= 13){
      return await foundry.applications.handlebars.renderTemplate(template, data);
    }else{
      return await renderTemplate(template, data);
    }
  }