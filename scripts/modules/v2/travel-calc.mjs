import { OSRHApp } from './base/osr-app.mjs';
export class TravelCalculatorV2 extends OSRHApp {
  constructor() {
    super();
    this.terrainMod = {
      trail: 1.5,
      road: 1.5,
      clear: 1,
      city: 1,
      grassland: 1,
      forest: 0.6,
      mud: 0.6,
      snow: 0.6,
      hill: 0.6,
      desert: 0.6,
      brokenLand: 0.6,
      mountain: 0.5,
      swamp: 0.5,
      jungle: 0.5,
      ice: 0.5,
      glacier: 0.5
    };
    this.lostMod = {
      grassland: 1,
      clear: 1,
      swamp: 3,
      jungle: 3,
      desert: 3,
      allElse: 2
    };
    this.systemData = OSRH.systemData;
  }
  static DEFAULT_OPTIONS = {
    id: 'osrTravelReport',
    position: {
      width: 400,
      height: 650
    },
    classes: ['application', 'testApp', 'v2'],
    tag: 'osrh-app', // The default is "div"
    // tabs: [{ navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'main' }],
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: '' //localization string
    },
    actions: {}
  };
  static PARTS = {
    main: {
      template: `modules/osr-helper/templates/travel-report.hbs`
    }
  };
  async _prepareContext(options) {
    let context = await super._prepareContext(options);
    context = foundry.utils.mergeObject(context, {});
    const partyObj = OSRH.util.getPartyActors();
    // get slowest
    let slowest;

    if (partyObj.party.length) {
      slowest = parseInt(OSRH.util.getNestedValue(partyObj.party[0], this.systemData.paths.encMov)); //partyObj.party[0].system.movement.base;
      partyObj.party.forEach((a) => {
        let rate = parseInt(OSRH.util.getNestedValue(a, this.systemData.paths.encMov)); //a.system.movement.base;
        if (slowest > rate) slowest = rate;
      });
    }

    //convert to miles
    context.baseRate = Math.floor((slowest * this.systemData.baseMovMod) / 5);
    context.ose = game.modules.get('old-school-essentials')?.active || false;
    context.characters = this.partyData(partyObj.characters);
    context.retainers = this.partyData(partyObj.retainers);
    context.retainer = partyObj.retainers;

    return context;
  }
  _onRender(context, options) {
    super._onRender(context, options);
    const html = this.element;
    const terrain = html.querySelector(`[type="radio"][checked]`).value;
    const radioInputs = [...html.querySelectorAll('[name="terrain"]')];
    const lostBtn = html.querySelector('#nav-check');
    const forageBtn = html.querySelector('#forage-check');
    const encBtn = html.querySelector('#enc-btn');
    const closeBtn = html.querySelector('#close-btn');
    closeBtn.addEventListener('click', () => {
      this.close();
    });
    if (encBtn) {
      encBtn.addEventListener('click', (ev) => {
        this.rollEnc();
      });
    }
    lostBtn.addEventListener('click', (ev) => {
      this.lostRoll();
    });
    forageBtn.addEventListener('click', (ev) => {
      this.forageCheck();
    });
    for (let input of radioInputs) {
      input.addEventListener('input', (ev) => {
        // const html = document.querySelector('[type="radio][checked]');
        const mod = this.terrainMod[ev.srcElement.value];
        // const modRate = Math.floor(this.data.baseRate * this.terrainMod[ev.srcElement.value]);
        this.updatePartyDist(mod);
      });
    }
  }
  partyData(actorObj, mod = 1) {
    let data = [];
    for (let actor of actorObj) {
      let mov = parseInt(OSRH.util.getNestedValue(actor, this.systemData.paths.encMov)) * this.systemData.baseMovMod;

      data.push({
        name: actor.name.length >= 20 ? actor.name.slice(0, 19) + `...` : actor.name,
        distance: Math.floor((mov / 5) * mod)
      });
    }
    return data;
  }
  async lostRoll() {
    const radio = document.querySelector(`[name=terrain]:checked`).value;
    const bonus = document.querySelector(`#nav-bonus`);
    const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
    if (radio == 'road' || radio == 'trail') {
      ui.notifications.warn(game.i18n.localize('OSRH.report.cantGetLost'));
      return;
    }
    let roll = await new Roll(`1d6 + ${bonus.value}`).evaluate();
    let target = this.lostMod[radio] || 2;

    if (roll.total <= target) {
      let data = {
        whisper: [game.user],
        flavor: `
          <h3>${game.i18n.localize('OSRH.report.navCheck')}: ${radio}</h3>
          <span style="color: red">${game.i18n.localize('OSRH.report.navCheckFail')}</span>`
      };
      await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
      ChatMessage.create(data);
    } else {
      let data = {
        whisper: [game.user],
        flavor: `
          <h3>${game.i18n.localize('OSRH.report.navCheck')}: ${radio}</h3>
          ${game.i18n.localize('OSRH.report.navCheckSuccess')}
          `
      };
      await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
      ChatMessage.create(data);
    }

    bonus.value = 0;
  }
  rollEnc() {
    OSE.util.wildEncounter();
  }
  async forageCheck() {
    const modEl = document.getElementById('forage-bonus');
    const mod = parseInt(modEl.value);
    const terrain = document.querySelector(`[name=terrain]:checked`).value;
    const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
    let roll = await new Roll(`1d6 + ${mod}`).evaluate();
    if (roll.total <= 3) {
      let cData = {
        user: game.user.id,
        whisper: gm,
        roll: roll,
        flavor: `
          <h3>${game.i18n.localize('OSRH.report.forageCheck')}: ${terrain}</h3>
          <div><span style="color: red"><b>${game.i18n.localize('OSRH.report.forageFail')}</b></span></div>
          `
      };
      await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
      ChatMessage.create(cData);
    } else {
      let cData = {
        user: game.user.id,
        whisper: gm,
        roll: roll,
        flavor: `
          <h3>${game.i18n.localize('OSRH.report.forageCheck')}: ${terrain}</h3>
          <div><span style="color: green"><b>${game.i18n.localize('OSRH.report.forageSuccess')}</b></span></div>
          `
      };
      await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
      ChatMessage.create(cData);
    }
    modEl.value = 0;
  }

  async updatePartyDist(mod) {
    const rateEl = document.getElementById('BTR');
    const charEl = document.getElementById('character-list');
    const retEl = document.getElementById('retainer-list');
    const upData = await this.getTravelData(mod);

    rateEl.innerText = upData.baseRate;
    charEl.innerHTML = upData.html.characters;
    retEl.innerHTML = upData.html.retainers;
  }
  async getTravelData(mod) {
    const partyObj = OSRH.util.getPartyActors();
    let slowest = parseInt(OSRH.util.getNestedValue(partyObj.party[0], this.systemData.paths.encMov));
    partyObj.party.forEach((a) => {
      let rate = OSRH.util.getNestedValue(a, this.systemData.paths.encMov);
      if (slowest > rate) slowest = rate;
    });
    //convert to miles
    const convertedRate = Math.floor((slowest / 5) * mod);
    let retData = {
      baseRate: convertedRate,
      data: {
        characters: this.partyData(partyObj.characters, mod),
        retainers: this.partyData(partyObj.retainers, mod)
      },
      html: {}
    };
    retData.html.characters = await renderTemplate('modules/osr-helper/templates/travel-report-character-list.hbs', { actors: retData.data.characters });
    retData.html.retainers = await renderTemplate('modules/osr-helper/templates/travel-report-character-list.hbs', { actors: retData.data.retainers });
    return retData;
  }
}
