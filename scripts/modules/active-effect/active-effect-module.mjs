export function registerOsrActiveEffectModule() {
  OSRH.effect.app = class OSRActiveEffectsApp extends Application {
    constructor(actor = null, displayAll = false) {
      super();
      this.actor = actor;
      this.displayAll = displayAll;
    }
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        title: 'Active Effects',
        id: 'OSRH-active-effect-app',
        classes: ['osrh', 'application', 'osr-active-effects'],
        top: 120,
        left: 60,
        width: 500,
        height: 600,
        tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.tab-content', initial: 'active-fx' }],
        template: `modules/osr-helper/templates/active-effect/active-effect-app.hbs`
      });
    }
    async getData() {
      let selfEffectData = [];
      let otherEffectData = [];
      let isGM = game.user.isGM;
      let effectData = await game.settings.get(`${OSRH.moduleName}`, 'effectData');
      const effectPresets = await this.getEffectPresets();
      let context
      // get effect icon data
      effectPresets.map(e=>{
        if(e.icon === 'none')e.icon = '-Icon-'
        const icon = OSRH.data.effectIcons.find(i=>i.name === e?.icon);
        e.iconColor = icon.color;
        e.iconText = icon.textColor;
        e.iconPath = icon.path;
      })
      if (this.displayAll) {
        const list = await this.listAllEffects(effectData);
        context = {
          isGM,
          displayAll: true,
          list: list,
          selfEffects: [],
          otherEffects: [],
          iconList: OSRH.data.effectIcons,
          effectPresets
        };        
      } else {
        
        selfEffectData = effectData.filter((e) => {
          // shim for uuid change
          let id = e.createdBy?.includes('.') ? this.actor.uuid : this.actor.id;
          return e.createdBy === id;
        });
        otherEffectData = effectData.filter((e) => {
          // shim for uuid change
          let id = e.createdBy?.includes('.') ? this.actor.uuid : this.actor.id;
          return e.target == this.actor.uuid && id != e.createdBy;
        });
        let selfEffectsTemplate = await this.effectListGetData(selfEffectData, 'self');
        let otherEffectsTemplate = await this.effectListGetData(otherEffectData, 'other');
        context = {
          isGM,
          displayAll: false,
          list: null,
          selfEffects: selfEffectsTemplate,
          otherEffects: otherEffectsTemplate,
          iconList: OSRH.data.effectIcons,
          effectPresets
        };
        
      }
      if(this.displayAll){
        context.noFX = !context.list?.length;
      }else{
        context.noFX = false
        if(selfEffectData.length === 0 && otherEffectData.length === 0){
          context.noFX = true
        }
      }
      return context;
    }
    activateListeners(html) {
      let deleteBtnArr = html.find('.delete-btn');
      const addEffectBtn = html.find('#add-effect-btn')[0];
      const savePresetBtn = html.find('#save-preset')[0]
      const effectCont = html.find('.effect-cont')[0];
      const applyEffectBtn = html.find('#apply-effect')[0];
      const effectName = html.find('#effect-name')[0];
      const durationInp = html.find('#duration-value')[0];
      const numInputs = [...html.find('.num-inp')]
      const effectPresetEls = [...html.find('.effect-preset')];
      const deletePresetBtns = [...html.find('.delete-preset')];
      const applyPresetEls = [...html.find('.select-preset')];
      const managePresets = html.find('#manage-presets')[0];
      const selectPresetBtns = [...html.find('.select-preset')];
      // apply effect
      const presetDelBtns = [...html.find('.delete-preset')];
      applyEffectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.applyEffect(html);
      });
      managePresets?.addEventListener('click', e=>{
        e.preventDefault();
        presetDelBtns.map(b=>{
          this.toggleHidden(b)
        })
        selectPresetBtns.map(bt=>{
          this.toggleHidden(bt)
        })
      })
      // delete buttons
      for (let b of deleteBtnArr) {
        b.addEventListener('click', async (ev) => {
          ev.preventDefault();
          // await OSRH.effect.deleteEffect(b.id, this);
          await OSRH.socket.executeAsGM('deleteEffect', b.id);
          this.render();
        });
      }
      addEffectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.addEffectRow(effectCont);
      });
      savePresetBtn.addEventListener('click', e=>{
        e.preventDefault();
        this.saveEffectPreset(html)
        
      })
      numInputs.forEach(i=>{
        this.numInputListener(i, true)
      })
      effectPresetEls.forEach(ep=>{
        const hiddenEl = ep.querySelector('.detail-cont');
        const nameEl = ep.querySelector('.name');
        nameEl.addEventListener('click', (e)=>{
          e.preventDefault();
          if(hiddenEl.classList.contains('hidden')){
            hiddenEl.classList.remove('hidden');
          } else {
            hiddenEl.classList.add('hidden');
          }
        })
      })
      applyPresetEls.map(el=>{
        el.addEventListener('click', async e=>{
          e.preventDefault();
          const id = e.target.closest('.effect-preset').dataset.id;
          const presets = await this.getEffectPresets();
          const preset = presets.find(p=>p.id===id);
          this.applyPreset(html, preset)
        })
      })
      deletePresetBtns.map(bt=>{
        bt.addEventListener('click', e=>{
          e.preventDefault();
          const id = e.target.closest('.effect-preset').dataset.id;
          this.deleteEffectPreset(id)
        })
      })
    }
    
    // functions
    toggleHidden(el){
      if(el.classList.contains('hidden')){
        el.classList.remove('hidden')
      }else{
        el.classList.add('hidden')
      }
    }
    async getEffectPresets(){
      return await foundry.utils.deepClone(game.settings.get('osr-helper', 'effectPresets'));
    }
    numInputListener(el, gto = false){
      el.addEventListener('change', e=>{
        e.preventDefault();
        if(isNaN(el.value) || el.value % 1){
          ui.notifications.warn(game.i18n.localize("OSRH.notification.addValidWholeNumber"));
          el.value = '0'
          return;
        }
        //greather than one
        if(gto){
          const intParent = el.closest('.label-group');
          const intEl = intParent.querySelector('#duration-type')
          if(parseInt(el.value) <= 0 && intEl.value != 'infinite'){
            ui.notifications.warn(game.i18n.localize("OSRH.notification.greaterThanZero"));
            el.value = '0'
            return;
          }
        }
      })
    }
    async effectListGetData(data, type) {
      let retArr = [];
      if (data.length) {
        data.forEach(async (e) => {
          let tActor = await fromUuid(e.target);
          // tActor = tActor.collectionName == 'tokens' ? (tActor = tActor.actor) : tActor;
          let eCreator = e.createdBy?.includes('.') ? await fromUuid(e.createdBy) : await game.actors.get(e.createdBy);
          if (eCreator) {
            let isInf = e.isInf;
            let effect = await tActor.getEmbeddedDocument('ActiveEffect', e.effectId);
            let interval = effect.flags['data'].interval;
            let duration = isInf
              ? 'inf'
              : interval == 'hours'
              ? Math.round(effect.duration.remaining / 3600)
              : interval == 'minutes'
              ? Math.round(effect.duration.remaining / 60)
              : effect.duration.remaining;
            // let durObj = effect.duration;
            let entryData = {
              name: effect.name,
              creator: eCreator.name,
              effectId: e.effectId,
              target: tActor.name,
              durType: isInf ? '' : interval == 'minutes' ? 'min.' : interval == 'hours' ? 'hr.' : 'sec.',
              isInf: isInf,
              duration: duration, //isInf ? 'inf' :  effect.flags['data'].interval == 'minutes' ? effect.duration.remaining / 60 :  effect.duration.remaining,
              descrip: effect.flags['data'].details,
              list: ``,
              targetImg: tActor.img,
              delBtn: type == 'self' ? true : game.user.isGM ? true : false
            };
            for (let change of effect.flags.data.effects) {
              let displayStr = `${change.name}: ${change.value}`;
              let listItem = `<li title="${displayStr}">${displayStr}</li>`;
              entryData.list += listItem;
            }

            retArr.push(entryData);
          }
        });
      }
      return retArr;
    }
    async listAllEffects(effectData) {
      // const effectData = await game.settings.get('osr-helper', 'effectData');
      const actorList = [];
      const retData = [];
      if(!effectData.length){
        return [];
      }
      effectData.map((i) => {
        if (!actorList.includes(i.target)) {
          actorList.push(i.target);
        }
      });

      for (let i = 0; i < actorList.length; i++) {
        const uuid = actorList[i];
        const selfFx = await effectData.filter((i) => i.target == uuid && i.createdBy == uuid);
        const otherFx = await effectData.filter((i) => i.target == uuid && i.createdBy != uuid);
        const actor = await fromUuid(actorList[i]);
        const selfData = await this.effectListGetData(selfFx, 'self');
        const otherData = await this.effectListGetData(otherFx, 'other');
        let actorObj = {
          name: actor.name,
          uuid: actorList[i],
          self: selfData,
          other: otherData
        };
        retData.push(actorObj);
      }

      return retData;
    }
    async applyEffect(html) {
      const targetEl = html.find('#effect-target')[0];
      const userTargets = [...game.user.targets];
      const target = [];
      if(targetEl.value === 'target' && !userTargets.length){
        ui.notifications.warn(game.i18n.localize("OSRH.util.notification.noTarget"));
        return
      }
      if (userTargets.length && targetEl.value === 'target') {
        userTargets.map((t) => target.push(t.document.actor.uuid));
      } else {
        target.push(this.actor.uuid);
      }
      
      const durVal = {
        hours: 3600,
        minutes: 60,
        seconds: 1,
        infinite: 0
      };
      const listEl = html.find('#effect-cont')[0];
      const descripEl = html.find('#effect-description')[0];
      const nameEl = html.find('#effect-name')[0];
      const durationEl = html.find('#duration-value')[0];
      const intervalEl = html.find('#duration-type')[0];
      const iconSelect = html.find('#icon-select')[0];
      const duration = parseInt(durationEl.value) * durVal[intervalEl.value];
      const effects = [...listEl.querySelectorAll('.effect-row')];
      const iconName = iconSelect.value;
      const iconObj = OSRH.data.effectIcons.find((i) => i.name == iconName);
      const creatorId = this.displayAll ? game.user.uuid : this.actor.uuid;
      const effectData = {
        name: nameEl.value,
        icon: iconObj.path,
        iconName: iconObj.name,
        tint: iconObj.color,
        mode: 2,
        priority: 0,
        changes: [],
        duration: {
          startTime: game.time.worldTime,
          seconds: duration
        },
        flags: {
          data: {
            isInf: intervalEl.value == 'infinite',
            name: nameEl.value,
            details: descripEl.value,
            interval: intervalEl.value,
            effects: []
          }
        }
      };
      effects.map((eff) => {
        const selectEl = eff.querySelector('.effect-select');
        const path = selectEl?.value;
        const option = html.find(`.effect-option[value="${path}"]`)[0];
        const value = parseInt(eff.querySelector('.mod-input').value);
        const change = { key: path, value };
        const flag = { name: option.dataset.display, value };
        effectData.changes.push(change);
        effectData.flags.data.effects.push(flag);
      });

      if (this.validateEffectObject(effectData)) {
        for (let i = 0; i < target.length; i++) {
          await OSRH.socket.executeAsGM('gmCreateEffect', target[i], effectData, creatorId);
          this.render()
        } //i.document.actor.uuid
      }
    }
    applyPreset(html, data){
      const targetEl = html.find('#effect-target')[0];
      const descripEl = html.find('#effect-description')[0];
      const nameEl = html.find('#effect-name')[0];
      const durationEl = html.find('#duration-value')[0];
      const intervalEl = html.find('#duration-type')[0];
      const iconSelect = html.find('#icon-select')[0];
      const effectCont = html.find('.effect-cont')[0];
      effectCont.innerHTML = '';
      targetEl.value = this.displayAll ? 'target' : data.target;
      descripEl.value = data.description;
      nameEl.value = data.name;
      durationEl.value = data.duration;
      intervalEl.value = data.interval;
      iconSelect.value = data.icon;
      for(let change of data.changes){
        this.addEffectRow(effectCont, change)
      }
    }
    addEffectRow(el, data=null) {
      const systemData = OSRH.data.effectData[game.system.id];
      const newRow = document.createElement('div');
      newRow.classList.add('effect-row');
      const select = document.createElement('select');
      select.classList.add('effect-select');
      select.title = game.i18n.localize('OSRH.effect.selectEffect');
      let selectInnerHTML = ``;
      for (let category of systemData) {
        selectInnerHTML += `
        <option class="dark-option" value ='null'> -- <b>${category.label}</b> --</option>`;
        for (let subOption of category.contents) {
          selectInnerHTML += `
          <option class="effect-option" data-category="${category.label}" data-display="${subOption.label}" value ='${subOption.path}'>${subOption.label} </option>`;
        }
      }
      select.innerHTML = selectInnerHTML;
      const modGroup = document.createElement('div');
      modGroup.classList.add('label-group');
      modGroup.innerHTML = `
      <label>${game.i18n.localize('OSRH.effect.mod')}:&nbsp;</label>
      <input type="text" class="mod-input num-inp" value="0">
      `;
      const numInp = modGroup.querySelector('.num-inp');
      this.numInputListener(numInp);
      const delBtn = document.createElement('a');
      delBtn.classList.add('del-effect-row');
      delBtn.innerHTML = `<i class="fa-solid fa-delete-left"><i>`;
      delBtn.addEventListener('click', (e) => {
        e.preventDefault;
        newRow.remove();
      });
      if(data){
        select.value = data.path;
        numInp.value = data.value;
      }
      newRow.appendChild(select);
      newRow.appendChild(modGroup);
      newRow.appendChild(delBtn);
      el.appendChild(newRow);
    }

    async saveEffectPreset(html) {
      const effectCont = html.find('.effect-cont')[0];
      const effectEls = [...effectCont.querySelectorAll('.effect-row')];
      const target = html.find('#effect-target')[0];
      const effectName = html.find('#effect-name')[0];
      const durationInp = html.find('#duration-value')[0];
      const durationType = html.find('#duration-type')[0];
      const description = html.find('#effect-description')[0];
      const iconSelect = html.find('#icon-select')[0];
      const effectObj = {
        id: randomID(16),
        name: effectName.value,
        icon: iconSelect.value,
        duration: parseInt(durationInp.value),
        description: description.value,
        target: target.value,
        interval: durationType.value,
        changes: []
      };
      effectEls.map(el=>{
        const selecteEl = el.querySelector('.effect-select');
        const selectedEl = selecteEl.querySelector(`[value="${selecteEl.value}"]`);
        const valueInp = el.querySelector('.mod-input');
        effectObj.changes.push({
          path: selecteEl.value,
          label: selectedEl.dataset.display,
          value: parseInt(valueInp.value)
        });   
      });
      if(!this.validateEffectObject(effectObj)){
        return
      }else{

        await OSRH.socket.executeAsGM('handleEffectPreset', 'add', effectObj);
        // const effectPresets = await foundry.utils.deepClone(game.settings.get('osr-helper', 'effectPresets'));
        // effectPresets.push(effectObj)
        // await game.settings.set('osr-helper', 'effectPresets', effectPresets);
        this.render()
      }
    }
    async deleteEffectPreset(id){
      await OSRH.socket.executeAsGM('handleEffectPreset', 'delete', id);
      this.render()

      // const presets = foundry.utils.deepClone(await this.getEffectPresets()).filter(i=>i.id !== id);

      // await game.settings.set('osr-helper', 'effectPresets', presets);
    }
    validateEffectObject(obj) {
      if(obj.icon === 'none'){
        ui.notifications.warn(game.i18n.localize("OSRH.notification.chooseIcon"));
        return false;
      }
      if (obj.name === '') {
        ui.notifications.warn(game.i18n.localize('OSRH.util.notification.enterEffectName'));
        return false;
      }
      if (obj.duration.seconds <= 0 && !obj.flags.data.isInf) {
        ui.notifications.warn(game.i18n.localize('OSRH.util.notification.enterEffectDuration'));
        return false;
      }
      if(!obj.changes.length){
        ui.notifications.warn(game.i18n.localize("OSRH.notification.pleaseAddEffect"));
        return false
      }
      return true;
    }
  };

  OSRH.effect.renderEffectApp = (actor, displayAll = false) => {
    let open = fxOpen();
    if(open){
      ui.notifications.warn('already open, re-rendering')
      open.render()
    }else{
      new OSRH.effect.app(actor, displayAll).render(true);
    }

    
  };
  
  OSRH.effect.handleEffectPreset = async (type, data)=>{
    const presets = foundry.utils.deepClone(await game.settings.get('osr-helper', 'effectPresets'))
    if(type == 'add'){
      presets.push(data);
      await game.settings.set('osr-helper', 'effectPresets', presets);
    }
    if(type == 'delete'){
      let id = data;
      const newPresets = presets.filter(i=>i.id !== id);
      await game.settings.set('osr-helper', 'effectPresets', newPresets);
    }
  }
  OSRH.effect.renderGlobalEffectApp = function (){
    if(game.user.isGM){
      OSRH.effect.renderEffectApp(null, true);
    }
  }
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
        if (actor.collectionName == 'tokens') actor = actor.actor;
        let activeEffect = await actor.getEmbeddedDocument('ActiveEffect', effect.effectId);
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
  OSRH.effect.gmCreateEffect = async function (target, effectData, creatorId) {
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
    OSRH.socket.executeForEveryone('refreshEffectLists');
    return true
  };
  OSRH.effect.refreshEffectLists = async function () {
    let openEffectLists = Object.values(ui.windows).filter((i) => i.id.includes(`OSRH-active-effect-app`));
    if (openEffectLists.length) {
      openEffectLists.forEach((e) => e.render());
    }
  };
  OSRH.effect.deleteAll = async function (type){
    if(type === 'effects'){
      await game.settings.set('osr-helper', 'effectData', []);
    }
    if(type === 'presets'){
      await game.settings.set('osr-helper', 'effectPresets', []);
    }
  }
  
}
function fxOpen(){
  let isOpen = false
  let app
  const keys = Object.keys(ui.windows);
  keys.map(k=>{
    isOpen = ui.windows[k].options.classes.includes('osr-active-effects')
    if(isOpen)app = ui.windows[k]
  })
  return isOpen ? app : isOpen
}

// export const handleEffectPreset = async (type, data)=>{
//   const presets = foundry.utils.deepClone(await game.settings.get('osr-helper', 'effectPresets'))
//   if(type == 'add'){
//     presets.push(data);
//     await game.settings.set('osr-helper', 'effectPresets', presets);
//   }
//   if(type == 'delete'){
//     let id = data;
//     const newPresets = presets.filter(i=>i.id !== id);
//     await game.settings.set('osr-helper', 'effectPresets', newPresets);
//   }
// }