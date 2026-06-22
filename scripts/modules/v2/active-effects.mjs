import { OSRHApp } from './base/osr-app.mjs';
export class OSRActiveEffectsAppV2 extends OSRHApp {
  //{actor = null, displayAll = false}
  constructor(options) {
    const actor = options?.actor || null;
    const displayAll = options?.displayAll || false;
    super();
    this.actor = actor;
    this.displayAll = displayAll;
  }

  static DEFAULT_OPTIONS = {
    id: 'OSRH-active-effect-app',
    position: {
      width: 500,
      height: 630,
    },
    classes: ['osrh', 'application', 'osr-active-effects', 'v2'],
    tag: 'osrh-app', // The default is "div"
    tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.window-content', initial: 'list' }],
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: '' //localization string
    },
    // dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.drop' }],
    actions: {}
  };
  static PARTS = {
    nav: {
      template: 'modules/osr-helper/templates/active-effect/v2/nav.hbs'
    },
    list: {
      template: 'modules/osr-helper/templates/active-effect/v2/fx-list-tab-v2.hbs'
    },
    create: {
      template: 'modules/osr-helper/templates/active-effect/v2/create-effect-tab-v2.hbs'
    }
  };
  async _prepareContext(options) {
    let selfEffectData = [];
    let otherEffectData = [];
    let isGM = game.user.isGM;
    let effectData = await game.settings.get(`${OSRH.moduleName}`, 'effectData');
    const effectPresets = await this.getEffectPresets();
    let context = await super._prepareContext(options);
    context = foundry.utils.mergeObject(context, {});
    effectPresets.map((e) => {
      if (e.icon === 'none') e.icon = '-Icon-';
      const icon = OSRH.data.effectIcons.find((i) => i.name === e?.icon);
      e.iconColor = icon.color;
      e.iconText = icon.textColor;
      e.iconPath = icon.path;
    });
    if (this.displayAll) {
      const list = await this.listAllEffects(effectData);
      context = {
        isGM,
        displayAll: true,
        list: list,
        selfEffects: [],
        otherEffects: [],
        iconList: OSRH.data.effectIcons,
        effectPresets,
        tabs: this._getTabs(options.parts)
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
      context = foundry.utils.mergeObject(context,{
        isGM,
        displayAll: false,
        list: null,
        iconList: OSRH.data.effectIcons,
        effectPresets
      });
      let selfEffectsTemplate = await this.effectListGetData(selfEffectData, 'self');
      let otherEffectsTemplate = await this.effectListGetData(otherEffectData, 'other');
      context.otherEffects = otherEffectsTemplate;
      context.selfEffects = selfEffectsTemplate;
      context.tabs = this._getTabs(options.parts);
    }
    if (this.displayAll) {
      context.noFX = !context.list?.length;
    } else {
      context.noFX = false;
      if (selfEffectData.length === 0 && otherEffectData.length === 0) {
        context.noFX = true;
      }
    }
    return context;
  }
  _onRender(context, options) {
    this._forceTabInit(context.tabs);
    const html = this.element;
    let deleteBtnArr = [...html.querySelectorAll('.delete-btn')];
    const addEffectBtn = html.querySelector('#add-effect-btn');
    const savePresetBtn = html.querySelector('#save-preset');
    const effectCont = html.querySelector('.effect-cont');
    const applyEffectBtn = html.querySelector('#apply-effect');
    const effectName = html.querySelector('#effect-name');
    const durationInp = html.querySelector('#duration-value');
    const numInputs = [...html.querySelectorAll('.num-inp')];
    const effectPresetEls = [...html.querySelectorAll('.effect-preset')];
    const deletePresetBtns = [...html.querySelectorAll('.delete-preset')];
    const applyPresetEls = [...html.querySelectorAll('.select-preset')];
    const managePresets = html.querySelector('#manage-presets');
    const selectPresetBtns = [...html.querySelectorAll('.select-preset')];
    // apply effect
    const presetDelBtns = [...html.querySelectorAll('.delete-preset')];
    applyEffectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.applyEffect(html);
    });
    managePresets?.addEventListener('click', (e) => {
      e.preventDefault();
      presetDelBtns.map((b) => {
        this.toggleHidden(b);
      });
      selectPresetBtns.map((bt) => {
        this.toggleHidden(bt);
      });
    });
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
    savePresetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.saveEffectPreset(html);
    });
    numInputs.forEach((i) => {
      this.numInputListener(i, true);
    });
    effectPresetEls.forEach((ep) => {
      const hiddenEl = ep.querySelector('.detail-cont');
      const nameEl = ep.querySelector('.name');
      nameEl.addEventListener('click', (e) => {
        e.preventDefault();
        if (hiddenEl.classList.contains('hidden')) {
          hiddenEl.classList.remove('hidden');
        } else {
          hiddenEl.classList.add('hidden');
        }
      });
    });
    applyPresetEls.map((el) => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = e.target.closest('.effect-preset').dataset.id;
        const presets = await this.getEffectPresets();
        const preset = presets.find((p) => p.id === id);
        this.applyPreset(html, preset);
      });
    });
    deletePresetBtns.map((bt) => {
      bt.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.target.closest('.effect-preset').dataset.id;
        this.deleteEffectPreset(id);
      });
    });
  }

  _getTabs(parts, tabs=['list', 'create']) {
    const tabGroup = 'primary';
    const intialTab = this.options.tabs[0].initial;
    const tabData = {};
    // Default tab for first time it's rendered this session
    if (!this.tabGroups.primary) this.tabGroups.primary = intialTab;
    for (let part of parts) {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'osr-helper.partySheet.tab.'
      };
      //move to constructor

      switch (part) {
        case 'nav':
          break;
        case 'list':
          tab.id = 'list';
          tab.label += 'list';
          break;
        case 'create':
          tab.id = 'create';
          tab.label += 'create';
          break;
      }
      // This is what turns on a single tab
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      if (tabs.includes(part)) {
        tabData[part] = tab;
      }
    }
    return tabData;
  }

  // functions
  toggleHidden(el) {
    if (el.classList.contains('hidden')) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }
  async getEffectPresets() {
    return await foundry.utils.deepClone(game.settings.get('osr-helper', 'effectPresets'));
  }
  numInputListener(el, gto = false) {
    el.addEventListener('change', (e) => {
      e.preventDefault();
      if (isNaN(el.value) || el.value % 1) {
        ui.notifications.warn(game.i18n.localize('OSRH.notification.addValidWholeNumber'));
        el.value = '0';
        return;
      }
      //greather than one
      if (gto) {
        const intParent = el.closest('.label-group');
        const intEl = intParent.querySelector('#duration-type');
        if (parseInt(el.value) <= 0 && intEl.value != 'infinite') {
          ui.notifications.warn(game.i18n.localize('OSRH.notification.greaterThanZero'));
          el.value = '0';
          return;
        }
      }
    });
  }
  async effectListGetData(data, type) {
    let retArr = [];
    if (data.length) {
      await data.forEach(async (e) => {
        let tActor = await fromUuid(e.target);
        // tActor = tActor.collectionName == 'tokens' ? (tActor = tActor.actor) : tActor;
        let eCreator = e.createdBy?.includes('.') ? await fromUuid(e.createdBy) : await game.actors.get(e.createdBy);
        if (eCreator) {
          let isInf = e.isInf;
          let effect = await tActor.getEmbeddedDocument('ActiveEffect', e.effectId);
          let interval = effect.flags['data'].interval;
          let duration = isInf ? 'inf' : interval == 'hours' ? Math.round(effect.duration.remaining / 3600) : interval == 'minutes' ? Math.round(effect.duration.remaining / 60) : effect.duration.remaining;
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
    if (!effectData.length) {
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
    const targetEl = html.querySelector('#effect-target');
    const userTargets = [...game.user.targets];
    const target = [];
    if (targetEl.value === 'target' && !userTargets.length) {
      ui.notifications.warn(game.i18n.localize('OSRH.util.notification.noTarget'));
      return;
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
    const listEl = html.querySelector('#effect-cont');
    const descripEl = html.querySelector('#effect-description');
    const nameEl = html.querySelector('#effect-name');
    const durationEl = html.querySelector('#duration-value');
    const intervalEl = html.querySelector('#duration-type');
    const iconSelect = html.querySelector('#icon-select');
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
      const option = html.querySelector(`.effect-option[value="${path}"]`);
      const value = parseInt(eff.querySelector('.mod-input').value);
      const change = { key: path, value };
      const flag = { name: option.dataset.display, value };
      effectData.changes.push(change);
      effectData.flags.data.effects.push(flag);
    });

    if (this.validateEffectObject(effectData)) {
      for (let i = 0; i < target.length; i++) {
        await OSRH.socket.executeAsGM('gmCreateEffect', target[i], effectData, creatorId);
        this.render();
      } //i.document.actor.uuid
    }
  }
  applyPreset(html, data) {
    const targetEl = html.querySelector('#effect-target');
    const descripEl = html.querySelector('#effect-description');
    const nameEl = html.querySelector('#effect-name');
    const durationEl = html.querySelector('#duration-value');
    const intervalEl = html.querySelector('#duration-type');
    const iconSelect = html.querySelector('#icon-select');
    const effectCont = html.querySelector('.effect-cont');
    effectCont.innerHTML = '';
    targetEl.value = this.displayAll ? 'target' : data.target;
    descripEl.value = data.description;
    nameEl.value = data.name;
    durationEl.value = data.duration;
    intervalEl.value = data.interval;
    iconSelect.value = data.icon;
    for (let change of data.changes) {
      this.addEffectRow(effectCont, change);
    }
  }
  addEffectRow(el, data = null) {
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
    if (data) {
      select.value = data.path;
      numInp.value = data.value;
    }
    newRow.appendChild(select);
    newRow.appendChild(modGroup);
    newRow.appendChild(delBtn);
    el.appendChild(newRow);
  }

  async saveEffectPreset(html) {
    const effectCont = html.querySelector('.effect-cont');
    const effectEls = [...effectCont.querySelectorAll('.effect-row')];
    const target = html.querySelector('#effect-target');
    const effectName = html.querySelector('#effect-name');
    const durationInp = html.querySelector('#duration-value');
    const durationType = html.querySelector('#duration-type');
    const description = html.querySelector('#effect-description');
    const iconSelect = html.querySelector('#icon-select');
    const effectObj = {
      id: foundry.utils.randomID(16),
      name: effectName.value,
      icon: iconSelect.value,
      duration: parseInt(durationInp.value),
      description: description.value,
      target: target.value,
      interval: durationType.value,
      changes: []
    };
    effectEls.map((el) => {
      const selecteEl = el.querySelector('.effect-select');
      const selectedEl = selecteEl.querySelector(`[value="${selecteEl.value}"]`);
      const valueInp = el.querySelector('.mod-input');
      effectObj.changes.push({
        path: selecteEl.value,
        label: selectedEl.dataset.display,
        value: parseInt(valueInp.value)
      });
    });
    if (!this.validateEffectObject(effectObj)) {
      return;
    } else {
      await OSRH.socket.executeAsGM('handleEffectPreset', 'add', effectObj);
      // const effectPresets = await foundry.utils.deepClone(game.settings.get('osr-helper', 'effectPresets'));
      // effectPresets.push(effectObj)
      // await game.settings.set('osr-helper', 'effectPresets', effectPresets);
      this.render();
    }
  }
  async deleteEffectPreset(id) {
    await OSRH.socket.executeAsGM('handleEffectPreset', 'delete', id);
    this.render();

    // const presets = foundry.utils.deepClone(await this.getEffectPresets()).filter(i=>i.id !== id);

    // await game.settings.set('osr-helper', 'effectPresets', presets);
  }
  validateEffectObject(obj) {
    if (obj.icon === 'none') {
      ui.notifications.warn(game.i18n.localize('OSRH.notification.chooseIcon'));
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
    if (!obj.changes.length) {
      ui.notifications.warn(game.i18n.localize('OSRH.notification.pleaseAddEffect'));
      return false;
    }
    return true;
  }
}
