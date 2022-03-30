export const registerEffectModule = async function () {
  OSEH.effect = OSEH.effect || {};

  OSEH.effect.renderNewEffectForm = async function () {
    if (OSEH.util.singleSelected()) {
      let actor = canvas.tokens.controlled[0].actor;

      let vh = document.documentElement.clientHeight;
      let vw = document.documentElement.clientWidth;
      let pos = { x: vw / 2 - 150, y: vh / 2 - 250 };
      if (Object.values(ui.windows).filter((i) => i.id.includes(`activeEffectList`)).length == 0) {
        new OSEH.effect.ActiveEffectList(actor, pos, game.user.isGM).render(true);
      }
    }
  };
  OSEH.effect.NewActiveEffectForm = class NewActiveEffectForm extends FormApplication {
    constructor(actor, actorId, pos, effectList = false) {
      super(pos, { id: `new-active-effect.${actorId}`, top: pos.y, left: pos.x });
      this.actor = actor;
      this.actorId = actorId;
      this.effectList = effectList;
      this.pos = pos;
    }
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ['form', 'oseh-new-active-effect-form'],
        popOut: true,
        height: 520,
        top: 0,
        left: 0,
        width: 300,
        template: `modules/${OSEH.moduleName}/templates/new-active-effect-form.html`,
        id: 'new-active-effect',
        title: 'OSEH New Active Effect'
      });
    }
    getData() {}
    activateListeners(html) {
      const createBtn = html.find('#create-btn')[0];
      const resetBtn = html.find('#reset-btn')[0];
      let nameField = html.find('input#name')[0];
      let descrip = html.find('textarea#descrip')[0];
      let durationField = html.find('input#duration')[0];
      let saves = {};
      let saveInputs = html.find('.saves-cont input');
      let numInputs = html.find('input[type="number"]');
      for (let i of numInputs) {
        i.addEventListener('focus', (ev) => {
          i.value = '';
        });
        i.addEventListener('blur', (ev) => {
          console.log(i, parseInt(i.value));
          if (!parseInt(i.value)) {
            i.value = 0;
          }
        });
      }
      createBtn.addEventListener('click', (ev) => {
        console.log('clicked');
        let userTargets = game.user.targets;
        let targetInp = html.find('[name="target"]:checked')[0].id;
        if (targetInp == 'targeted' && userTargets.size != 1) {
          ev.preventDefault();

          ui.notifications.warn('Please target one actor.');
        }
        if (nameField.value == '') {
          ev.preventDefault();
          ui.notifications.warn('Please Enter An Efect Name');
        }
        console.log(durationField.value);
        if (parseInt(durationField.value) == 0) {
          ev.preventDefault();
          ui.notifications.warn('Please Enter An Efect Duration');
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
      // ev.preventDefault();
      console.log(close);
      let userTargets = game.user.targets;
      let targetInp = ev.target.querySelector('[name="target"]:checked').id;
      let actor = this.actor;
      // let target = targetInp == 'self' ? actor : userTargets.first()?.actor;
      let target = targetInp == 'self' ? actor.uuid : game.user.targets.first()?.actor?.uuid;
      // let target = game.user.targets.first() ? game.user.targets.first()?.actor?.uuid : actor.uuid;
      let interval = ev.target.querySelector('[name="interval"]:checked').id;
      let effectData = {
        label: '',
        icon: 'icons/svg/circle.svg',
        tint: '#00baa1',
        mode: 2,
        priority: 0,
        flags: {
          data: {
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
          effectData.label = value;
        }
        if (type == 'descrip') {
          effectData.flags['data'].details = value;
        }
        if (type == 'thac0' && value != 0) {
          effectData.icon = `icons/svg/sword.svg`;
          effectData.tint = '#a03300';
          let aac = await game.settings.get('ose', 'ascendingAC');
          effectData.changes.push({
            key: aac ? `data.thac0.bba` : `data.thac0.value`,
            value: aac ? parseInt(value) : parseInt(value * -1),
            priority: 1
          });
          effectData.flags['data'].effects.push({
            name: aac ? 'attack bonus' : 'thacO',
            value: aac ? parseInt(value) : parseInt(value * -1)
          });
        }
        if (type == 'atkmod' && value != 0) {
          effectData.icon = `icons/svg/combat.svg`;
          effectData.tint = '#aa5000';
          effectData.changes.push({
            key: `data.thac0.mod.${attrib}`,
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
          effectData.icon = `icons/svg/combat.svg`;
          effectData.tint = '#aa5000';
          effectData.changes.push({
            key: aac ? `data.aac.mod` : `data.ac.mod`,
            value: parseInt(value),
            priority: 1
          });
        }
        if (type == 'hp' && value != 0) {
          effectData.icon = `icons/svg/heal.svg`;
          effectData.tint = '#aa0000';
          effectData.changes.push({
            key: `data.hp.${attrib}`,
            value: parseInt(value),
            priority: 1
          });
          effectData.flags['data'].effects.push({
            name: `hp ${attrib}`,
            value: parseInt(value)
          });
        }
        if (type == 'attribute' && value != 0) {
          effectData.icon = `icons/svg/book.svg`;
          effectData.tint = '#005bbf';
          effectData.changes.push({
            key: `data.scores.${attrib}.value`,
            value: parseInt(value),
            priority: 1
          });
          effectData.flags['data'].effects.push({
            name: `attribute ${attrib}`,
            value: parseInt(value)
          });
        }
        if (type == 'saves' && value != 0) {
          effectData.icon = `icons/svg/dice-target.svg`;
          effectData.tint = '#ccaa4a';
          effectData.changes.push({
            key: `data.saves.${attrib}.value`,
            value: parseInt(value) * -1,
            priority: 1
          });
          effectData.flags['data'].effects.push({
            name: `saves ${attrib}`,
            value: parseInt(value)
          });
        }
        if (type == 'duration' && value > 0) {
          effectData.flags['data'].interval = interval;
          effectData.duration.seconds = interval == 'minutes' ? Math.floor(value * 60) : Math.floor(value);
        }
      }

      await OSEH.socket.executeAsGM('gmCreateEffect', target, effectData, this.actorId);

      // if (this.effectList) this.effectList.render();
      OSEH.socket.executeAsGM('effectHousekeeping');
    }
  };

  OSEH.effect.clearExpired = async function () {
    let activeEffects = deepClone(await game.settings.get(`${OSEH.moduleName}`, 'effectData'));
    for (let e of activeEffects) {
      let type = await game.actors.get(e.targetActorId).data.type;
      if (type == `monster`) {
        console.log('monster');
        for (let scene of game.scenes) {
          let actor = await scene.tokens.get(e.targetToken).actor;
          let effect = await actor.getEmbeddedDocument('ActiveEffect', e.effectId);
          if (effect?.duration?.remaining <= 0) {
            await actor.deleteEmbeddedDocuments('ActiveEffect', [e.effectId]);
            activeEffects = activeEffects.filter((obj) => obj.effectId != effect.id);
          }
        }
      } else {
        let actor = await game.actors.get(e.targetActorId);
        let effect = await actor.getEmbeddedDocument('ActiveEffect', e.effectId);
        if (effect.duration.remaining <= 0) {
          await actor.deleteEmbeddedDocuments('ActiveEffect', [e.effectId]);
          activeEffects = activeEffects.filter((obj) => obj.effectId != effect.id);
        }
      }
    }
    // await game.settings.set(`${OSEH.moduleName}`, 'effectData', activeEffects);
    OSEH.socket.executeAsGM('setting', 'effectData', activeEffects, 'set');
  };

  OSEH.effect.ActiveEffectList = class ActiveEffectList extends FormApplication {
    constructor(actor, pos, isGM = false) {
      console.log(pos);
      super(pos, { id: `activeEffectList.${actor.id}`, top: pos.y, left: pos.x });
      this.actor = actor;
      this.pos = pos;
      this.isGM = isGM;
    }
    static get defaultOptions() {
      let options = {
        classes: ['form', `oseh-active-effect-list`],
        popOut: true,
        height: 600,
        width: 400,
        top: 0,
        left: 0,
        template: `modules/${OSEH.moduleName}/templates/active-effect-list.html`,
        // id: 'activeEffectList',
        title: 'OSEH Active Effect List'
      };
      console.log(options);
      return mergeObject(super.defaultOptions, options);
    }
    async getData() {
      let selfEffectData = [];
      let otherEffectData = [];
      let gmEffectsData = [];
      if (this.isGM) {
        gmEffectsData = await game.settings.get(`${OSEH.moduleName}`, 'effectData').filter((e) => e.target == this.actor.uuid);
      } else {
        selfEffectData = await game.settings
          .get(`${OSEH.moduleName}`, 'effectData')
          .filter((e) => e.createdBy == this.actor.id);

        otherEffectData = await game.settings
          .get(`${OSEH.moduleName}`, 'effectData')
          .filter((e) => e.target == this.actor.uuid && this.actor.id != e.createdBy);
      }

      let selfEffectsTemplate = [];
      let otherEffectsTemplate = [];
      let gmEffectsTemplate = [];
      if (selfEffectData.length) {
        selfEffectData.forEach(async (e) => {
          // let tActor = await game.actors.get(e.targetActorId);
          let tActor = await fromUuid(e.target);
          if (tActor.collectionName == 'tokens') tActor = tActor.actor;

          let effect = await tActor.getEmbeddedDocument('ActiveEffect', e.effectId);
          let entryData = {};

          let durObj = effect.data.duration;
          entryData.name = effect.data.label;
          entryData.effectId = e.effectId;
          entryData.target = tActor.name;
          entryData.durType = effect.data.flags['data'].interval == 'minutes' ? 'min.' : 'sec.';
          let elapsed = game.time.worldTime - durObj.startTime;
          let timeLeft =
            effect.data.flags['data'].interval == 'minutes'
              ? Math.floor((durObj.seconds - elapsed) / 60)
              : Math.floor(durObj.seconds - elapsed);
          entryData.duration = timeLeft;
          entryData.descrip = effect.data.flags['data'].details;
          entryData.list = ``;
          for (let change of effect.data.changes) {
            let keyData = change.key.split('.');

            let type = keyData[1] == 'thac0' && keyData[2] == 'mod' ? `attack mod` : keyData[1];
            let attrib = keyData[1] == 'thac0' && keyData[2] == 'mod' ? keyData[3] : keyData[2];

            let listItem = `<li>${type} - ${attrib}: ${change.value}</li>`;

            entryData.list += listItem;
          }
          selfEffectsTemplate.push(entryData);
        });
      }
      if (otherEffectData.length) {
        otherEffectData.forEach(async (e) => {
          let tActor = await fromUuid(e.target);
          let eCreator = await game.actors.get(e.createdBy);
          if (tActor.collectionName == 'tokens') tActor = tActor.actor;

          let effect = await tActor.getEmbeddedDocument('ActiveEffect', e.effectId);
          let entryData = {};

          let durObj = effect.data.duration;
          entryData.name = effect.data.label;
          entryData.effectId = e.effectId;
          entryData.target = eCreator.name;
          entryData.durType = effect.data.flags['data'].interval == 'minutes' ? 'min.' : 'sec.';
          let elapsed = game.time.worldTime - durObj.startTime;
          let timeLeft =
            effect.data.flags['data'].interval == 'minutes'
              ? Math.floor((durObj.seconds - elapsed) / 60)
              : Math.floor(durObj.seconds - elapsed);
          entryData.duration = timeLeft;
          entryData.descrip = effect.data.flags['data'].details;
          entryData.list = ``;
          for (let change of effect.data.changes) {
            let keyData = change.key.split('.');

            let type = keyData[1] == 'thac0' && keyData[2] == 'mod' ? `attack mod` : keyData[1];
            let attrib = keyData[1] == 'thac0' && keyData[2] == 'mod' ? keyData[3] : keyData[2];

            let listItem = `<li>${type} - ${attrib}: ${change.value}</li>`;

            entryData.list += listItem;
          }
          otherEffectsTemplate.push(entryData);
        });
      }
      if (gmEffectsData.length) {
        gmEffectsData.forEach(async (e) => {
          let tActor = await fromUuid(e.target);
          let eCreator = await game.actors.get(e.createdBy);
          if (tActor.collectionName == 'tokens') tActor = tActor.actor;

          let effect = await tActor.getEmbeddedDocument('ActiveEffect', e.effectId);
          let entryData = {};

          let durObj = effect.data.duration;
          entryData.name = effect.data.label;
          entryData.effectId = e.effectId;
          entryData.target = eCreator.name;
          entryData.durType = effect.data.flags['data'].interval == 'minutes' ? 'min.' : 'sec.';
          let elapsed = game.time.worldTime - durObj.startTime;
          let timeLeft =
            effect.data.flags['data'].interval == 'minutes'
              ? Math.floor((durObj.seconds - elapsed) / 60)
              : Math.floor(durObj.seconds - elapsed);
          entryData.duration = timeLeft;
          entryData.descrip = effect.data.flags['data'].details;
          entryData.list = ``;
          for (let change of effect.data.changes) {
            let keyData = change.key.split('.');

            let type = keyData[1] == 'thac0' && keyData[2] == 'mod' ? `attack mod` : keyData[1];
            let attrib = keyData[1] == 'thac0' && keyData[2] == 'mod' ? keyData[3] : keyData[2];

            let listItem = `<li>${type} - ${attrib}: ${change.value}</li>`;

            entryData.list += listItem;
          }
          gmEffectsTemplate.push(entryData);
        });
      }
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
          // await OSEH.effect.deleteEffect(b.id, this);
          await OSEH.socket.executeAsGM('deleteEffect', b.id, this);
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
        // OSEH.socket.executeAsGM('renderNewEffectForm', this.actor, this)
        let pos = { x: this.position.left + 400, y: this.position.top };
        if (Object.values(ui.windows).filter((i) => i.id == `new-active-effect.${this.actor.id}`).length == 0) {
          new OSEH.effect.NewActiveEffectForm(this.actor, this.actor.id, pos, this).render(true);
        }
      });
    }
    async _updateObject(ev, formData) {}
  };

  OSEH.effect.deleteEffect = async function (activeEffectId, effectList) {
    console.log('fired');
    let activeEffectData = await game.settings.get(`${OSEH.moduleName}`, 'effectData');

    let effectData = activeEffectData.filter((e) => e.effectId == activeEffectId)[0];

    let targetActor = await game.actors.get(effectData.targetActorId);

    if (targetActor?.data?.type == 'monster') {
      console.log('monster');
      let tokenArr = [];
      game.scenes.map((s) => {
        let token = s.tokens.get(effectData.targetToken);
        if (token) tokenArr.push(token);
      });
      if (tokenArr.length) {
        tokenArr.map(async (t) => {
          try {
            await t.actor.deleteEmbeddedDocuments('ActiveEffect', [activeEffectId]);
            activeEffectData = activeEffectData.filter((i) => i.effectId != activeEffectId);
            await OSEH.socket.executeAsGM('setting', 'effectData', activeEffectData, 'set');

            // effectList.render()
            return;
          } catch {
            console.error(`no active effect of id: ${activeEffectId} found on targeted token actor`);
          }
        });
      }
    } else {
      await targetActor.deleteEmbeddedDocuments('ActiveEffect', [activeEffectId]);
      activeEffectData = activeEffectData.filter((i) => i.effectId != activeEffectId);

      await OSEH.socket.executeAsGM('setting', 'effectData', activeEffectData, 'set');
      // effectList.render()
      return;
    }
  };

  OSEH.effect.deleteAll = async function (target) {
    let actor = await fromUuid(target);
    if (actor.collectionName == 'tokens') actor = actor.actor;
    // let actor = await game.actors.getName("Sara Penn");
    // actor = canvas.tokens.controlled[0].actor
    for (let effect of actor.data.effects.contents) {
      await effect.delete();
    }
  };
  OSEH.effect.delete = async function (effectId) {
    let effectData = await deepClone(game.settings.get(`${OSEH.moduleName}`, 'effectData')).filter(
      (e) => e.effectId == effectId
    )[0];

    let actor = await fromUuid(effectData.target);
    if (actor.collectionName == 'tokens') actor = actor.actor;
    let effect = await actor.effects.get(effectId);
    effect.delete();
    let activeEffectData = await deepClone(game.settings.get(`${OSEH.moduleName}`, 'effectData')).filter(
      (e) => e.effectId != effectId
    );
    await game.settings.set(`${OSEH.moduleName}`, 'effectData', activeEffectData);
    OSEH.socket.executeForEveryone('refreshEffectLists');
  };

  OSEH.effect.housekeeping = async function () {
    console.log('housekeeping', game.time.worldTime);
    let effectData = await deepClone(game.settings.get(`${OSEH.moduleName}`, 'effectData'));

    for (let effect of effectData) {
      //get actor from uuid
      let actor = await fromUuid(effect.target);

      //if token get token actor
      if (actor.collectionName == 'tokens') actor = actor.actor;

      let activeEffect = await actor.getEmbeddedDocument('ActiveEffect', effect.effectId);

      if (activeEffect.duration.remaining <= 0) {
        effectData = effectData.filter((e) => e.effectId != activeEffect.id);
        await actor.deleteEmbeddedDocuments('ActiveEffect', [effect.effectId]);
        // await activeEffect.delete()
      }
    }
    await game.settings.set(`${OSEH.moduleName}`, 'effectData', effectData);
    OSEH.socket.executeForEveryone('refreshEffectLists');
  };
  OSEH.effect.refreshEffectLists = async function () {
    let openEffectLists = Object.values(ui.windows).filter((i) => i.id.includes(`activeEffectList`));
    if (openEffectLists.length) {
      openEffectLists.forEach((e) => e.render());
    }
  };
  OSEH.effect.gmCreateEffect = async function (target, effectData, creatorId) {
    let actor = await fromUuid(target);
    if (actor.collectionName == 'tokens') actor = actor.actor;

    let e = await ActiveEffect.create(effectData, { parent: actor });

    let activeEffectData = deepClone(await game.settings.get(`${OSEH.moduleName}`, 'effectData'));
    activeEffectData.push({
      effectId: e.id,
      targetActor: actor,
      createdBy: creatorId,
      target: target
    });

    await game.settings.set(`${OSEH.moduleName}`, 'effectData', activeEffectData);
  };
};

/*
things active effects can change

attributes: data.scores.str.value, wis, dex, con, int, cha
XXXinitiative: data.initiative.value, mod , data.isSlow
saves: data.saves.breath.value, death, paralysis, spell, wand
thac0/ab: data.thac0.bba (attack bonus), data.thac0.value, 
melee/ranged bonus: data.thac0.mod.missile , melee
hp: data.hp.max, value
XXXmovement: data.movement.base, encounter (base / 3)

*/
