export const registerEffectModule = async function () {
  OSRH.effect = OSRH.effect || {};

  OSRH.effect.renderNewEffectForm = async function () {
    if (OSRH.util.singleSelected()) {
      let actor = canvas.tokens.controlled[0].actor;

      let vh = document.documentElement.clientHeight;
      let vw = document.documentElement.clientWidth;
      let pos = { x: vw / 2 - 150, y: vh / 2 - 250 };
      if (Object.values(ui.windows).filter((i) => i.id.includes(`activeEffectList`)).length == 0) {
        new OSRH.effect.ActiveEffectList(actor, pos, game.user.isGM).render(true);
      }
    }
  };
  OSRH.effect.NewActiveEffectForm = class NewActiveEffectForm extends FormApplication {
    constructor(actor, actorId, pos, effectList = false) {
      super(pos, { id: `new-active-effect.${actorId}`, top: pos.y, left: pos.x });
      this.actor = actor;
      this.actorId = actorId;
      this.effectList = effectList;
      this.pos = pos;
    }
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['form', 'osrh-new-active-effect-form'],
        popOut: true,
        height: 600,
        top: 0,
        left: 0,
        width: 310,
        template: `modules/${OSRH.moduleName}/templates/new-active-effect-form.hbs`,
        id: 'new-active-effect',
        title: game.i18n.localize('OSRH.effect.newEffectTitle') //'OSRH New Active Effect'
      });
    }
    async getData() {
      let isGM = game.user.isGM;
      let savedEffects = await game.settings.get(OSRH.moduleName, 'savedEffects');
      let retObj = {
        effectPresets: [],
        iconList: OSRH.data.effectIcons,
        isGM
      };
      if (Object.keys(savedEffects).length) {
        for (let key in savedEffects) {
          let effectData = savedEffects[key];
          retObj.effectPresets.push({
            name: effectData.name,
            duration: effectData.duration,
            id: effectData.id
          });
        }
      }
      return retObj;
    }
    activateListeners(html) {
      const createBtn = html.find('#create-btn')[0];
      const resetBtn = html.find('#reset-btn')[0];
      const saveBtn = html.find('#save-btn')[0];
      let nameField = html.find('input#name')[0];
      let descrip = html.find('textarea#descrip')[0];
      let durationField = html.find('input#duration')[0];
      let numInputs = html.find('input[type="number"]');
      const presetSel = html.find('#preset-select')[0];
      for (let i of numInputs) {
        i.addEventListener('focus', (ev) => {
          i.value = '';
        });
        i.addEventListener('blur', (ev) => {
          if (!parseInt(i.value)) {
            i.value = 0;
          }
        });
      }
      presetSel.addEventListener('change', async (ev) => {
        ev.preventDefault();
        OSRH.effect.applyEffectPreset.call(this, ev);
      });
      if (saveBtn)
        saveBtn.addEventListener('click', async (ev, data) => {
          ev.preventDefault();
          if (nameField.value == '') {
            ui.notifications.warn(game.i18n.localize('OSRH.util.notification.enterEffectName'));
            return;
          }
          let savedFx = await game.settings.get(OSRH.moduleName, 'savedEffects');
          for (let key in savedFx) {
            if (savedFx[key].name == nameField.value) {
              ui.notifications.warn(game.i18n.localize('OSRH.util.notification.nameInUse'));
              return;
            }
          }
          OSRH.effect.saveEffect.call(this, ev, data);
        });

      createBtn.addEventListener('click', (ev) => {
        let userTargets = game.user.targets;
        let targetInp = html.find('[name="target"]:checked')[0].id;
        let interval = html.find('[name="interval"]:checked')[0].id;
        if (targetInp == 'targeted' && userTargets.size <= 0 /*!= 1*/) {
          ev.preventDefault();

          ui.notifications.warn(game.i18n.localize("OSRH.util.notification.targetOneActor"));
        }
        if (nameField.value == '') {
          ev.preventDefault();
          ui.notifications.warn(game.i18n.localize('OSRH.util.notification.enterEffectName'));
        }

        if (parseInt(durationField.value) == 0 && interval != 'infinite') {
          ev.preventDefault();
          ui.notifications.warn(game.i18n.localize('OSRH.util.notification.enterEffectDuration'));
        }
      });
      resetBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        nameField.value = '';
        descrip.value = '';
        durationField = '';
        for (let input of numInputs) {
          input.value = 0;
        }
      });
    }
    async _updateObject(ev, formData) {
      let userTargets = game.user.targets;
      let targetInp = ev.target.querySelector('[name="target"]:checked').id;
      let targets = [];
      if (targetInp == 'self') {
        targets.push(this.actor.uuid);
      } else {
        userTargets.every((i) => {
          const uuid = i.document.actor.uuid
          //filter duplicate uuid's
          if(!targets.includes(uuid)){
          targets.push(uuid);
          }
          return true;
        });
      }
      // let target = targetInp == 'self' ? actor.uuid : game.user.targets.first()?.actor?.uuid;
      let interval = ev.target.querySelector('[name="interval"]:checked').id;
      const iconName = formData.icon;
      const iconObj = OSRH.data.effectIcons.find((i) => i.name == iconName);
      let effectData = {
        name: '',
        icon: iconObj.path,
        iconName: iconObj.name,
        tint: iconObj.color,
        mode: 2,
        priority: 0,
        flags: {
          data: {
            isInf: false,
            name: '',
            details: '',
            effects: []
          }
        },
        changes: [],
        duration: {
          startTime: 0,
          seconds: 0
        }
      };

      for (let input in formData) {
        const pairs = input.split('.');

        let type = pairs[0];
        let attrib = pairs.length > 1 ? pairs[1] : null;
        let value = formData[input];

        effectData.duration.startTime = game.time.worldTime;

        if (type == 'name') {
          effectData.flags['data'].name = value;
          effectData.name = value;
        }
        if (type == 'descrip') {
          effectData.flags['data'].details = value;
        }
        if (type == 'thac0' && value != 0) {
          // effectData.icon = `icons/svg/sword.svg`;
          // effectData.tint = '#a03300';
          let aac = await game.settings.get('ose', 'ascendingAC');
          effectData.changes.push({
            key: aac ? `system.thac0.bba` : `system.thac0.value`,
            value: aac ? parseInt(value) : parseInt(value * -1),
            priority: 1
          });
          effectData.flags['data'].effects.push({
            name: aac ? 'attack bonus' : 'thacO',
            value: aac ? parseInt(value) : parseInt(value * -1)
          });
        }
        if (type == 'atkmod' && value != 0) {
          // effectData.icon = `icons/svg/combat.svg`;
          // effectData.tint = '#aa5000';
          effectData.changes.push({
            key: `system.thac0.mod.${attrib}`,
            value: parseInt(value),
            priority: 1
          });
          effectData.flags['data'].effects.push({
            name: `attack mod ${attrib}`,
            value: parseInt(value)
          });
        }
        if (type == 'ac' && value != 0) {
          let aac = await game.settings.get('ose', 'ascendingAC');
          // effectData.icon = `icons/svg/combat.svg`;
          // effectData.tint = '#aa5000';
          effectData.changes.push({
            key: aac ? `system.aac.mod` : `system.ac.mod`,
            value: parseInt(value),
            priority: 1
          });
        }
        if (type == 'hp' && value != 0) {
          // effectData.icon = `icons/svg/heal.svg`;
          // effectData.tint = '#aa0000';
          effectData.changes.push({
            key: `system.hp.${attrib}`,
            value: parseInt(value),
            priority: 1
          });
          effectData.flags['data'].effects.push({
            name: `hp ${attrib}`,
            value: parseInt(value)
          });
        }
        if (type === 'init') {
          effectData.changes.push({
            key: `system.initiative.mod`,
            value: parseInt(value),
            priority: 1
          });
        }
        if (type == 'attribute' && value != 0) {
          // effectData.icon = `icons/svg/book.svg`;
          // effectData.tint = '#005bbf';
          effectData.changes.push({
            key: `system.scores.${attrib}.value`,
            value: parseInt(value),
            priority: 1
          });
          effectData.flags['data'].effects.push({
            name: `attribute ${attrib}`,
            value: parseInt(value)
          });
        }
        if (type == 'saves' && value != 0) {
          // effectData.icon = `icons/svg/dice-target.svg`;
          // effectData.tint = '#ccaa4a';
          effectData.changes.push({
            key: `system.saves.${attrib}.value`,
            value: parseInt(value) * -1,
            priority: 1
          });
          effectData.flags['data'].effects.push({
            name: `saves ${attrib}`,
            value: parseInt(value)
          });
        }
        if ((type == 'duration' && value > 0) || (type == 'duration' && interval == 'infinite')) {
          // effectData.icon = `icons/svg/sun.svg`;
          // effectData.tint = '#b3eaf8';
          effectData.flags['data'].interval = interval;
          effectData.flags['data'].isInf = interval == 'infinite' ? true : false;
          effectData.duration.seconds = interval == 'minutes' ? Math.floor(value * 60) : Math.floor(value);
        }
      }
      // multi target
      
      for(let i = 0; i<targets.length;i++){
        await OSRH.socket.executeAsGM('gmCreateEffect', targets[i], effectData, this.actor.uuid)
      }

      // if (this.effectList) this.effectList.render();
      OSRH.socket.executeAsGM('effectHousekeeping');
    }
  };

  // OSRH.effect.clearExpired = async function () {
  //   let activeEffects = foundry.utils.deepClone(await game.settings.get(`${OSRH.moduleName}`, 'effectData'));
  //   for (let e of activeEffects) {
  //     let actor = await e.targetActorId.contains('.') ? fromUuid(e.target) : game.actors.get(e.targetActorId);
  //     let type = await game.actors.get(e.targetActorId).type;
  //     if (type == `monster`) {
  //       for (let scene of game.scenes) {
  //         let actor = await scene.tokens.get(e.targetToken).actor;
  //         let effect = await actor.getEmbeddedDocument('ActiveEffect', e.effectId);
  //         if (effect?.duration?.remaining <= 0) {
  //           await actor.deleteEmbeddedDocuments('ActiveEffect', [e.effectId]);
  //           activeEffects = activeEffects.filter((obj) => obj.effectId != effect.id);
  //         }
  //       }
  //     } else {
  //       let actor = await game.actors.get(e.targetActorId);
  //       let effect = await actor.getEmbeddedDocument('ActiveEffect', e.effectId);
  //       if (effect.duration.remaining <= 0) {
  //         await actor.deleteEmbeddedDocuments('ActiveEffect', [e.effectId]);
  //         activeEffects = activeEffects.filter((obj) => obj.effectId != effect.id);
  //       }
  //     }
  //   }

  //   await OSRH.socket.executeAsGM('setting', 'effectData', activeEffects, 'set');
  // };

  OSRH.effect.ActiveEffectList = class ActiveEffectList extends FormApplication {
    constructor(actor, pos, isGM = false) {
      super(pos, { id: `activeEffectList.${actor.id}`, top: pos.y, left: pos.x });
      this.actor = actor;
      this.pos = pos;
      this.isGM = isGM;
      this.actorUUID = actor.uuid
    }
    static get defaultOptions() {
      let options = {
        classes: ['form', `osrh-active-effect-list`],
        popOut: true,
        height: 600,
        width: 400,
        top: 0,
        left: 0,
        template: `modules/${OSRH.moduleName}/templates/active-effect-list.hbs`,
        // id: 'activeEffectList',
        title: game.i18n.localize('OSRH.effect.activeEffectListTitle')
      };

      return foundry.utils.mergeObject(super.defaultOptions, options);
    }
    async getData() {
      let selfEffectData = [];
      let otherEffectData = [];
      let gmEffectsData = [];
      let isGM = game.user.isGM;
      
      
      if (this.isGM) {
        gmEffectsData = game.settings
          .get(`${OSRH.moduleName}`, 'effectData')
          .filter((e) => e.target == this.actor.uuid);
      } else {
       console.log('no gm')
        let effectData = game.settings.get(`${OSRH.moduleName}`, 'effectData')
        selfEffectData = effectData.filter((e) =>{ 
           // shim for uuid change
            let id = e.createdBy.includes('.') ? this.actor.uuid : this.actor.id
            return e.createdBy === id
          });

        otherEffectData = game.settings
          .get(`${OSRH.moduleName}`, 'effectData')
          .filter((e) => {
            // shim for uuid change
            let id = e.createdBy.includes('.') ? this.actor.uuid : this.actor.id
            e.target == this.actor.uuid && id != e.createdBy});
      }
      let selfEffectsTemplate = await OSRH.effect.effectListGetData(selfEffectData, 'self');
      let otherEffectsTemplate = await OSRH.effect.effectListGetData(otherEffectData, 'other');
      let gmEffectsTemplate = await OSRH.effect.effectListGetData(gmEffectsData, 'gm');

      return {
        gmList: gmEffectsTemplate,
        selfEffects: selfEffectsTemplate,
        otherEffects: otherEffectsTemplate
      };
    }
    activateListeners(html) {
      let newBtn = html.find('#new-btn')[0];
      let effectItems = html.find('.active-effect');
      let deleteBtnArr = html.find('.delete-btn');
      // delete buttons
      for (let b of deleteBtnArr) {
        b.addEventListener('click', async (ev) => {
          ev.preventDefault();
          // await OSRH.effect.deleteEffect(b.id, this);
          await OSRH.socket.executeAsGM('deleteEffect', b.id, this);
          this.render();
        });
      }
      for (let entry of effectItems) {
        let name = entry.querySelector('.effect-name');
        let details = entry.querySelector('.details-cont');
        name.addEventListener('click', (ev) => {
          if (details.style.display == 'none') {
            details.style.display = 'flex';
          } else {
            details.style.display = 'none';
          }
        });
      }
      // new effect button
      newBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        // OSRH.socket.executeAsGM('renderNewEffectForm', this.actor, this)
        let pos = { x: this.position.left + 400, y: this.position.top };
        if (Object.values(ui.windows).filter((i) => i.id == `new-active-effect.${this.actor.id}`).length == 0) {
          new OSRH.effect.NewActiveEffectForm(this.actor, this.actor.id, pos, this).render(true);
        }
      });
    }
    async _updateObject(ev, formData) {}
  };


  OSRH.effect.deleteAll = async function (target) {
    let actor = await fromUuid(target);
    if (actor.collectionName == 'tokens') actor = actor.actor;
    // let actor = await game.actors.getName("Sara Penn");
    // actor = canvas.tokens.controlled[0].actor
    for (let effect of actor.effects.contents) {
      await effect.delete();
    }
  };
  OSRH.effect.delete = async function (effectId) {
    let effectData = foundry.utils.deepClone(await game.settings.get(`${OSRH.moduleName}`, 'effectData')).filter(
      (e) => e.effectId == effectId
    )[0];

    let actor = await fromUuid(effectData.target);
    if (actor.collectionName == 'tokens') actor = actor.actor;
    let effect = await actor.effects.get(effectId);
    effect.delete();
    let activeEffectData = foundry.utils.deepClone(await game.settings.get(`${OSRH.moduleName}`, 'effectData')).filter(
      (e) => e.effectId != effectId
    );
    await game.settings.set(`${OSRH.moduleName}`, 'effectData', activeEffectData);
    OSRH.socket.executeForEveryone('refreshEffectLists');
  };

  OSRH.effect.housekeeping = async function () {
    let effectData = foundry.utils.deepClone(await game.settings.get(`${OSRH.moduleName}`, 'effectData'));

    for (let effect of effectData) {
      if (!effect?.isInf) {
        //get actor from uuid
        let actor = await fromUuid(effect.target);
        //if token get token actor
        // if (actor.collectionName == 'tokens') actor = actor.actor;
        // let activeEffect = await actor.getEmbeddedDocument('ActiveEffect', effect.effectId);
        if (activeEffect.duration.remaining <= 0) {
          effectData = effectData.filter((e) => e.effectId != activeEffect.id);
          await actor.deleteEmbeddedDocuments('ActiveEffect', [effect.effectId]);
          // await activeEffect.delete()
        }
      }
    }
    await game.settings.set(`${OSRH.moduleName}`, 'effectData', effectData);
    OSRH.socket.executeForEveryone('refreshEffectLists');
  };
  OSRH.effect.refreshEffectLists = async function () {
    let openEffectLists = Object.values(ui.windows).filter((i) => i.id.includes(`activeEffectList`));
    if (openEffectLists.length) {
      openEffectLists.forEach((e) => e.render());
    }
  };
  OSRH.effect.gmCreateEffect = async function (target, effectData, creatorId) {
    console.log('create effect data',target, effectData, creatorId)
    let actor = await fromUuid(target);
    // if (actor.collectionName == 'tokens') actor = actor.actor;
    let e = await ActiveEffect.create(effectData, { parent: actor });
    let activeEffectData = foundry.utils.deepClone(await game.settings.get(`${OSRH.moduleName}`, 'effectData'));
    activeEffectData.push({
      isInf: effectData.flags['data'].isInf,
      effectId: e.id,
      targetActor: actor,
      createdBy: creatorId,
      target: target
    });
    await game.settings.set(`${OSRH.moduleName}`, 'effectData', activeEffectData);
    return true
  };

  OSRH.effect.effectListGetData = async function (data, type) {
    let retArr = [];
    if (data.length) {
      data.forEach(async (e) => {
        let tActor = await fromUuid(e.target);
        let eCreator =  e.createdBy.includes('.') ? await fromUuid(e.createdBy) : await game.actors.get(e.createdBy);
        if (eCreator) {
          let isInf = e.isInf;
          tActor = tActor.collectionName == 'tokens' ? (tActor = tActor.actor) : tActor;
          let effect = await tActor.getEmbeddedDocument('ActiveEffect', e.effectId);
          let durObj = effect.duration;
          let entryData = {};
          entryData.name = effect.name;
          entryData.effectId = e.effectId;
          entryData.target =
            type == 'self' ? tActor.name : type == 'other' ? eCreator.name : type == 'gm' ? eCreator.name : tActor.name;
          entryData.createdBy = eCreator.name;
          entryData.durType = isInf ? '' : effect.flags['data'].interval == 'minutes' ? 'min.' : 'sec.';
          let elapsed = game.time.worldTime - durObj.startTime;
          let interval = effect.flags['data'].interval;
          let timeLeft = isInf
            ? 'inf'
            : interval == 'minutes'
            ? Math.floor((durObj.seconds - elapsed) / 60)
            : Math.floor(durObj.seconds - elapsed);
          entryData.duration = timeLeft;
          entryData.descrip = effect.flags['data'].details;
          entryData.list = ``;
          for (let change of effect.changes) {
            let keyData = change.key.split('.');
            let type = keyData[1] == 'thac0' && keyData[2] == 'mod' ? `attack mod` : keyData[1];
            let attrib = keyData[1] == 'thac0' && keyData[2] == 'mod' ? keyData[3] : keyData[2];
            let listItem = `<li>${type} - ${attrib}: ${change.value}</li>`;
            entryData.list += listItem;
          }

          retArr.push(entryData);
        }
      });
    }
    return retArr;
  };
  // rewrite
  OSRH.effect.saveEffect = async function (ev) {
    ev.preventDefault();
    let effectObj = {
      id: randomID(16)
    };
    let numInputs = this.element[0].querySelectorAll('input[type="number"]');
    let target = this.element[0].querySelector(`[type="radio"][name="target"]:checked`);
    let durInt = this.element[0].querySelector(`[type="radio"][name="interval"]:checked`);
    let nameEl = this.element[0].querySelector('#name');
    let descripEl = this.element[0].querySelector('#descrip');
    let icon = this.element[0].querySelector('#icon-select').value;
    let presetSel = this.element[0].querySelector('#preset-select');

    effectObj.name = nameEl.value;
    effectObj.icon = icon;
    // effectObj.data = {};
    for (let input of numInputs) {
      effectObj[input.id] = parseInt(input.value);
    }
    effectObj[nameEl.id] = nameEl.value;
    effectObj[descripEl.id] = descripEl.value;
    effectObj.target = target.id;
    effectObj.durInt = durInt.id;
    effectObj.icon = icon;
    let savedFx = foundry.utils.deepClone(await game.settings.get(OSRH.moduleName, 'savedEffects'));
    savedFx[effectObj.id] = effectObj;
    await game.settings.set(OSRH.moduleName, 'savedEffects', savedFx);
    presetSel.innerHTML += `
    <option value="">${effectObj.name}</option>
    `;
    ui.notifications.notify(game.i18n.localize('OSRH.util.notification.effectPresetSaved'));
    this.render();
  };
  OSRH.effect.applyEffectPreset = async function (ev) {
    const savedFx = foundry.utils.deepClone(await game.settings.get(OSRH.moduleName, 'savedEffects'));
    let fxData = savedFx[ev.srcElement.value];
    let iconObj = OSRH.data.effectIcons.find((i) => i.name == fxData.name);
    if (fxData) {
      let inputKeys = Object.keys(fxData).filter((k) => {
        let discard = ['target', 'durInt', 'icon'];
        if (!discard.includes(k)) {
          return k;
        }
      });
      for (let key of inputKeys) {
        let el = this.element[0].querySelector(`#${key}`);
        if (el) el.value = fxData?.[key];
      }

      const targetInp = this.element[0].querySelector(`#${fxData.target}`);
      targetInp.checked = true;
      const iconInp = this.element[0].querySelector(`#icon-select [value="${fxData.icon}"]`);
      iconInp.selected = true;
      const durIntInp = this.element[0].querySelector(`input#${fxData.durInt}`);
      durIntInp.checked = true;
    }
  };

  OSRH.effect.manageCustomPresets = class manageCustomPresets extends FormApplication {
    constructor() {
      super();
    }
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['form, del-preset'],
        baseApplication: `ManageCustomEffects`,
        popOut: true,
        height: 400,
        width: 300,
        template: `modules/${OSRH.moduleName}/templates/manage-preset-form.hbs`,
        id: 'manage-preset-form',
        title: game.i18n.localize('OSRH.effect.ManagePresets')
      });
    }
    async getData() {
      let savedFx = await game.settings.get(OSRH.moduleName, 'savedEffects');
      let retObj = {
        effectList: []
      };
      for (let key in savedFx) {
        retObj.effectList.push(savedFx[key]);
      }
      return retObj;
    }
    activateListeners(html) {
      let effectDelBtns = html.find(`a[class="delete-btn"]`);
      let xprtBtn = html.find('#xprt')[0];
      let imprtBtn = html.find('#imprt')[0];
      xprtBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        let setting = await game.settings.get(OSRH.moduleName, `savedEffects`);
        let data = JSON.stringify(setting);
        let xport = 'data:export/plain;charset=utf-8, ' + encodeURIComponent(data);
        let filename = 'saved-effects.json';
        let alink = document.createElement('a');
        alink.href = xport;
        alink.setAttribute('download', filename);
        alink.click();
      });

      imprtBtn.addEventListener('click', async (e) => {
        const input = document.createElement('input');
        const form = this;
        input.type = 'file';
        input.addEventListener('change', async function (e) {
          let file = this.files[0];
          if (file.type != 'application/json') {
            ui.notifications.warn(game.i18n.localize('OSRH.util.notification.selectValidJsonFile'));
            return;
          }
          let fr = new FileReader();
          fr.onload = async function (e) {
            let content = e.target.result;
            let parsed = JSON.parse(content);
            if (!parsed) {
              ui.notifications.warn(game.i18n.localize('OSRH.util.notification.invalidJson'));
              return;
            }
            new Dialog({
              title: 'Import Type',
              content: ``,
              buttons: {
                replace: {
                  label: 'Replace',
                  callback: async () => {
                    await game.settings.set(OSRH.moduleName, 'savedEffects', parsed);
                    new OSRH.effect.manageCustomPresets().render(true);
                  }
                },
                merge: {
                  label: 'Merge',
                  callback: async () => {
                    const orig = foundry.utils.deepClone(await game.settings.get(OSRH.moduleName, `savedEffects`));
                    let merged = foundry.utils.mergeObject(orig, parsed);
                    await game.settings.set(OSRH.moduleName, 'savedEffects', merged);
                    new OSRH.effect.manageCustomPresets().render(true);
                  }
                }
              }
            }).render(true);
            form.render();
            return game.i18n.localize('OSRH.effect.settingsUpdated');
          };
          fr.readAsText(file);
        });
        input.click();
      });
      for (let btn of effectDelBtns) {
        btn.addEventListener(`click`, async (ev) => {
          ev.preventDefault();
          const savedFx = foundry.utils.deepClone(await game.settings.get(OSRH.moduleName, 'savedEffects'));
          delete savedFx[btn.id];
          await game.settings.set(OSRH.moduleName, 'savedEffects', savedFx);
          this.render();
        });
      }
    }
    async _updateObject(ev, formData) {}
  };
};
