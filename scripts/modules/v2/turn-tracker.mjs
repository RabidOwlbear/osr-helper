import { OSRHApp } from './base/osr-app.mjs';

export class OSRHTurnTrackerV2 extends OSRHApp {
  constructor() {
    super();
    this.systemData = OSRH.systemData;
    this.tableNames = game.tables.contents.map((i) => i.name);
    this.isGM = game.user.isGM;
    this.settingsChanged = false;
    this.terrainMod = OSRH.CONST.terrainMod;
    this.lostMod = OSRH.CONST.lostMod;
  }

  static DEFAULT_OPTIONS = {
    id: 'turn-tracker',
    position: {
      width: 300,
      height: 480
    },
    classes: ['app', 'osrh','v2', 'turn-tracker'],
    tag: 'osrh-app',
    tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.window-content', initial: 'dungeon' }],
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: 'Turn Tracker' //localization string
    },
    dragDrop: [{ dragSelector: '.item', dropSelector: '.dropEl' }],
    actions: {}
  };
  static PARTS = {
    header: {
      template: `modules/osr-helper/templates/v2/turn-tracker/header.hbs`,
    },
    dungeon: {
      template: `modules/osr-helper/templates/v2/turn-tracker/dungeon-turn.hbs`,
    },
    travel: {
      template: `modules/osr-helper/templates/v2/turn-tracker/travel-turn.hbs`,
    },
    dungeonConfig: {
      template: `modules/osr-helper/templates/v2/turn-tracker/dungeon-config.hbs`,
    },
    travelConfig: {
      template: `modules/osr-helper/templates/v2/turn-tracker/travel-config.hbs`,
    },
    globalConfig: {
      template: `modules/osr-helper/templates/v2/turn-tracker/global-config.hbs`,
    },

  };
  async _prepareContext(options) {
    this.turnData = foundry.utils.deepClone(await game.settings.get('osr-helper', 'turnData'));
    let context = await super._prepareContext(options);
    context = foundry.utils.mergeObject(context, {});
    const partyObj = OSRH.util.getPartyActors();
    const tMod = this.terrainMod[this.turnData.travel.terrain];
    context.baseRate = Math.floor(this.getBaseRate(partyObj) * tMod);
    context.characters = this.partyData(partyObj.characters, tMod);
    context.retainers = this.partyData(partyObj.retainers, tMod);
    context.isGM = this.isGM;
    context.turnData = this.turnData;
    context.tableNames = this.tableNames;
    context.DTData = this.dungeonTurnData;
    context.tabs = this._getTabs(options.parts);
    return context;
  }
  _onRender(context, options) {
    this._forceTabInit(context.tabs);
    const html = this.element;
    const advanceDungeonTurn = html.querySelector('#dungeon-turn-advance-btn');
    const advanceTravelTurn = html.querySelector('#travel-turn-advance-btn');
    const terrainSelect = html.querySelector('#terrain');
    const dRestBtn = html.querySelector('#d-rest-btn');
    const tRestBtn = html.querySelector('#t-rest-btn');
    const forageCheck = html.querySelector('#forage-check');
    const navCheck = html.querySelector('#navigation-check');
    const encSelectEls = [...html.querySelectorAll('.d-enc-select')];
    const saveSettings = [...html.querySelectorAll('.save-settings')];
    const dEncRoll = html.querySelector('#d-encounter-roll');
    const dReactRoll = html.querySelector('#d-react-roll');
    const dReactTable = html.querySelector('#d-react-table');
    const dEncFreq = html.querySelector('#d-encounter-freq');
    const dRollTarget = html.querySelector('#d-encounter-target');
    const tEncFreq = html.querySelector('#t-encounter-freq');
    const tRollTarget = html.querySelector('#t-encounter-target');
    const tReactTable = html.querySelector('#travel-react-table');
    const tEncTable = html.querySelector('#travel-enc-table');
    const dungeonLvl = html.querySelector('#d-level');
    const resetSession = html.querySelector('#reset-session-btn');
    const resetTotal = html.querySelector('#reset-total-btn');
    const dLvlUp = html.querySelector('#d-lvl-up');
    const dLvlDn = html.querySelector('#d-lvl-dn');
    const trackRationExp = html.querySelector(`#track-ration-expiration`);

    if (this.isGM) {
      terrainSelect.value = this.turnData.travel.terrain;
      // this.updatePartyDist(html, this.terrainMod[terrainSelect.value]);

      for (let i = 0; i < encSelectEls.length; i++) {
        const el = encSelectEls[i];
        el.value = this.turnData.dungeon.eTables[i];
        el.addEventListener('change', (e) => {
          this.settingsChanged = true;
          this.turnData.dungeon.eTables = this.getEncounterTables(html);
          this.showSaveBtn(html);
        });
      }
      terrainSelect.addEventListener('change', (e) => {
        this.updatePartyDist(html, this.terrainMod[e.target.value]);
        const chance = this.getTerrainChance(html);
        this.turnData.travel.rollTarget = chance;
        tRollTarget.value = chance;

        this.showSaveBtn(html);
      });
      dEncRoll.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      dReactRoll.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      dReactTable.value = this.turnData.dungeon.rTable;
      tReactTable.value = this.turnData.travel.rTable;
      tEncTable.value = this.turnData.travel.eTable;
      dReactTable.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      tReactTable.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      tEncTable.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      dEncFreq.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      dRollTarget.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      tEncFreq.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      tRollTarget.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      dungeonLvl.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      trackRationExp.addEventListener('change', (e) => {
        this.showSaveBtn(html);
      });
      dRestBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await OSRH.turn.rest('dungeon');
        OSRH.socket.executeForEveryone('refreshTurnTracker');
      });
      tRestBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await OSRH.turn.rest('travel');
        OSRH.socket.executeForEveryone('refreshTurnTracker');
      });
      dLvlUp.addEventListener('click', (e) => {
        this.turnData.dungeon.lvl++;
        dungeonLvl.value = this.turnData.dungeon.lvl;
        this.showSaveBtn(html);
      });
      dLvlDn.addEventListener('click', (e) => {
        this.turnData.dungeon.lvl--;
        if (this.turnData.dungeon.lvl <= 0) this.turnData.dungeon.lvl = 1;
        dungeonLvl.value = this.turnData.dungeon.lvl;
        this.showSaveBtn(html);
      });
      advanceDungeonTurn.addEventListener('click', async (e) => {
        e.preventDefault();
        await OSRH.turn.dungeonTurn();
        this.turnData = await game.settings.get('osr-helper', 'turnData');
        this.render(true);
        OSRH.socket.executeForEveryone('refreshTurnTracker');
      });
      advanceTravelTurn.addEventListener('click', async (e) => {
        await OSRH.turn.travelTurn();
        this.turnData = await game.settings.get('osr-helper', 'turnData');
        this.render(true);
        OSRH.socket.executeForEveryone('refreshTurnTracker');
      });
      resetSession.addEventListener('click', async (e) => {
        let tab = this.getActiveTab(html);

        if (tab === 'dungeon') await OSRH.turn.resetSessionCount('dungeon');
        if (tab === 'travel') await OSRH.turn.resetSessionCount('travel');

        this.turnData = await game.settings.get('osr-helper', 'turnData');
        OSRH.socket.executeForEveryone('refreshTurnTracker');
      });
      for (let btn of saveSettings) {
        btn.addEventListener('click', async (e) => {
          await this.updateTurnData(html);
          OSRH.socket.executeForEveryone('refreshTurnTracker');
          ui.notifications.notify(game.i18n.localize('OSRH.util.notification.dungeonTurnSettingsUpdated'));
        });
      }
      resetTotal.addEventListener('click', (e) => {
        let tab = this.getActiveTab(html);
        let app = new Dialog({
          title: game.i18n.localize('OSRH.turnTracker.warning'),
          content: `<p>${game.i18n.localize('OSRH.turnTracker.turnResetWarning')}</p>`,
          buttons: {
            one: {
              icon: '<i class=`fas fa-check`></i>',
              label: game.i18n.localize('OSRH.newEffectForm.Reset'),
              callback: async () => {
                await OSRH.turn.resetAllCounts(tab);
                OSRH.socket.executeForEveryone('refreshTurnTracker');
              }
            },
            two: {
              icon: '<i class=`fas fa-times`></i>',
              label: game.i18n.localize('OSRH.customEffect.close'),
              callback: function () {
                app.close();
              }
            }
          },
          default: 'two'
        }).render(true);
      });

      forageCheck.addEventListener('click', (e) => {
        this.forageCheck(html);
      });
      navCheck.addEventListener('click', (e) => {
        this.lostRoll(html);
      });
    }

    // handle tracker animation
    if (this.turnData.dungeon.rSprite) {
      this.handleRestAnimation(this.turnData.dungeon.walkCount, html);
    } else {
      this.updateAnimation(this.turnData.dungeon.walkCount, html);
    }
  }

  _getTabs(parts, tabs = ['dungeon', 'travel', 'dungeonConfig', 'travelConfig', 'globalConfig']) {
    const tabGroup = 'primary';
    const intialTab = this.options.tabs[0].initial;
    const tabData = {};
    // Default tab for first time it's rendered this session
    if (!this.tabGroups.primary) {
      this.tabGroups.primary = intialTab;}
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
        case 'header':
          break;
        case 'dungeon':
          tab.id = 'dungeon';
          tab.label += 'dungeon';
          break;
        case 'travel':
          tab.id = 'travel';
          tab.label += 'travel';
          break;
        case 'dungeonConfig':
          tab.id = 'dungeonConfig';
          tab.label += 'dungeonConfig';
          break;
        case 'travelConfig':
          tab.id = 'travelConfig';
          tab.label += 'travelConfig';
          break;
        case 'globalConfig':
          tab.id = 'globalConfig';
          tab.label += 'globalConfig';
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

  getTerrainChance(html) {
    const terrain = html.querySelector('#terrain').value;
    const terrainEls = [...html.querySelectorAll('option.terrainOpt')];
    const data = terrainEls.find((i) => i.value === terrain).dataset;
    return parseInt(data.target);
  }
  getActiveTab(html) {
    let a = html.querySelector('.nav-tab.active');
    return a?.dataset.tab;
  }
  showSaveBtn(html) {
    const btnArr = [...html.querySelectorAll('.save-settings')];
    this.settingsChanged = true;
    for (let btn of btnArr) {
      if (btn.classList.contains('hidden')) btn.classList.remove('hidden');
    }
  }
  hideSaveBtn(btnArr) {
    this.settingsChanged = false;
    for (let btn of btnArr) {
      if (!btn.classList.contains('hidden')) btn.classList.add('hidden');
    }
  }
  async refreshCounts(refresh = false) {
    this.turnData = foundry.utils.deepClone(await game.settings.get('osr-helper', 'turnData'));
    // this.dungeonTurnData = await game.settings.get('osr-helper', 'dungeonTurnData');
    if (refresh) this.render(true);
  }
  getEncounterTables(html) {
    let selectEls = [...html.querySelector('.d-enc-select')];
    return selectEls.map((el) => el.value).map((i) => (i == '' ? null : i));
  }
  async updateTurnData(html) {
    const dEncRoll = html.querySelector('#d-encounter-roll');
    const dReactRoll = html.querySelector('#d-react-roll');
    const tEncRoll = html.querySelector('#d-encounter-roll');
    const tReactRoll = html.querySelector('#d-react-roll');
    const tEncTable = html.querySelector('#travel-enc-table');
    const tReactTable = html.querySelector('#travel-react-table');
    const dReactTable = html.querySelector('#d-react-table');
    const dEncFreq = html.querySelector('#d-encounter-freq');
    const tEncFreq = html.querySelector('#t-encounter-freq');
    const tRollTarget = html.querySelector('#t-encounter-target');
    const dRollTarget = html.querySelector('#d-encounter-target');
    const dungeonLvl = html.querySelector('#d-level');
    const trackRationExp = html.querySelector('#track-ration-expiration');
    const encTables = this.getEncounterTables(html);
    const saveSettings = [...html.querySelectorAll('.save-settings')];
    const terrainSelect = html.querySelector('#terrain');
    this.turnData = foundry.utils.deepClone(await game.settings.get('osr-helper', 'turnData'));
    this.turnData.travel.terrain = terrainSelect.value;
    this.turnData.travel.eTable = tEncTable.value;
    this.turnData.travel.rollEnc = tEncRoll.checked;
    this.turnData.travel.rollReact = tReactRoll.checked;
    this.turnData.travel.rTable = tReactTable.value;
    this.turnData.travel.proc = parseInt(tEncFreq.value);
    this.turnData.travel.rollTarget = parseInt(tRollTarget.value);

    this.turnData.dungeon.eTables = encTables;
    this.turnData.dungeon.rollEnc = dEncRoll.checked;
    this.turnData.dungeon.rollReact = dReactRoll.checked;
    this.turnData.dungeon.rTable = dReactTable.value;
    this.turnData.dungeon.proc = parseInt(dEncFreq.value);
    this.turnData.dungeon.rollTarget = parseInt(dRollTarget.value);
    this.turnData.dungeon.lvl = parseInt(dungeonLvl.value);
    this.turnData.global ? (this.turnData.global.trackRationExp = trackRationExp.checked) : (this.turnData.global = { trackRationExp: trackRationExp.checked });

    await game.settings.set('osr-helper', 'turnData', this.turnData);
    this.hideSaveBtn(saveSettings);
  }
  // animation
  updateAnimation(frame, html) {
    const frames = [...html.querySelectorAll('.sprite')];
    frames.map((i) => i.classList.add('hidden'));

    let lastIdx = frame - 1 == 0 ? 5 : frame - 1;
    let curFrame = frames.find((f) => f.id === `bg-${frame}`);
    let lastFrame = frames.find((j) => j.id === `bg-${lastIdx}`);

    lastFrame?.classList?.add('hidden');
    curFrame?.classList?.remove('hidden');
  }
  handleRestAnimation(frame, html) {
    const restFrame = html.querySelector(`#bg-0`);
    const lastFrame = html.querySelector(`#bg-${frame}`);
    const coords = [
      [0, 55],
      [150, 5],
      [260, 100],
      [100, 210],
      [0, 140]
    ];
    restFrame.style.top = `${coords[frame - 1][0]}px` || coords[0][0];
    restFrame.style.left = `${coords[frame - 1][1]}px` || coords[0][1];
    restFrame.classList.remove('hidden');
    lastFrame.classList.add('hidden');
  }
  // travel turn
  getBaseRate(partyObj) {
    let slowest;
    if (partyObj.party.length) {
      slowest = parseInt(OSRH.util.getNestedValue(partyObj.party[0], this.systemData.paths.encMov)); //partyObj.party[0].system.movement.base;
      partyObj.party.forEach((a) => {
        let rate = OSRH.util.getNestedValue(a, this.systemData.paths.encMov); //a.system.movement.base;

        if (slowest > rate) slowest = rate;
      });
    }

    return Math.floor(parseInt(slowest * this.systemData.baseMovMod) / 5);
  }
  partyData(actorObj, mod = 1) {
    let data = [];
    for (let actor of actorObj) {
      let mov = parseInt(OSRH.util.getNestedValue(actor, this.systemData.paths.encMov)) * this.systemData.baseMovMod;
      data.push({
        name: actor.name.length >= 35 ? actor.name.slice(0, 30) + `...` : actor.name,
        distance: Math.round((mov / 5) * mod),
        img: actor.img
        // controlled: actor.ownership[game.user.id] >= 3,
      });
    }
    return data;
  }
  async lostRoll(html) {
    const terrain = html.querySelector(`#terrain`).value;
    const bonus = html.querySelector(`#nav-bonus`);
    const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
    if (terrain == 'road' || terrain == 'trail') {
      ui.notifications.warn(game.i18n.localize('OSRH.report.cantGetLost'));
      return;
    }
    let roll = await new Roll(`1d6 + ${bonus.value}`).evaluate();
    let target = this.lostMod[terrain] || 2;

    if (roll.total <= target) {
      let data = {
        whisper: [game.user],
        flavor: `
        <h3>${game.i18n.localize('OSRH.report.navCheck')}: ${terrain}</h3>
        <span style="color: red">${game.i18n.localize('OSRH.report.navCheckFail')}</span>`
      };
      await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
      ChatMessage.create(data);
    } else {
      let data = {
        whisper: [game.user],
        flavor: `
        <h3>${game.i18n.localize('OSRH.report.navCheck')}: ${terrain}</h3>
        ${game.i18n.localize('OSRH.report.navCheckSuccess')}
        `
      };
      await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
      ChatMessage.create(data);
    }

    bonus.value = 0;
  }
  async forageCheck(html) {
    const modEl = html.querySelector('#forage-bonus');
    const mod = parseInt(modEl.value);
    const terrain = html.querySelector(`#terrain`).value;
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
  async updatePartyDist(html, mod) {
    const rateEl = html.querySelector('#base-travel-rate');
    const charEl = html.querySelector('#character-list');
    const retEl = html.querySelector('#retainer-list');
    const upData = await this.getTravelData(mod);
    rateEl.innerText = `${upData.baseRate} mi`;
    charEl.innerHTML = upData.html.characters;
    retEl.innerHTML = upData.html.retainers;
  }
  async getTravelData(mod) {
    const partyObj = OSRH.util.getPartyActors();
    let slowest = this.getBaseRate(partyObj);
    //convert to miles
    const convertedRate = Math.round(slowest * mod);
    let retData = {
      baseRate: convertedRate,
      data: {
        characters: this.partyData(partyObj.characters, mod),
        retainers: this.partyData(partyObj.retainers, mod)
      },
      html: {}
    };
    retData.html.characters = await renderTemplate('modules/osr-helper/templates/travel-turn-actor-list.hbs', {
      header: 'Characters',
      actors: retData.data.characters
    });
    retData.html.retainers = await renderTemplate('modules/osr-helper/templates/travel-turn-actor-list.hbs', {
      header: 'Retainers',
      actors: retData.data.retainers
    });
    return retData;
  }
}

const terrainData = {
  systems: ['ose', 'basicfantasyrpg'],
  ose: {
    trail: 1.5,
    road: 1.5,
    clear: 1,
    city: 1,
    grassland: 1,
    forest: 0.66,
    mud: 0.66,
    snow: 0.66,
    hill: 0.66,
    desert: 0.66,
    brokenLand: 0.66,
    mountain: 0.5,
    swamp: 0.5,
    jungle: 0.5,
    ice: 0.5,
    glacier: 0.5
  },
  basicfantasyrpg: {
    trail: 1,
    road: 1.33,
    clear: 1,
    city: 1,
    grassland: 1,
    forest: 0.66,
    mud: 0.66,
    snow: 0.66,
    hill: 0.66,
    desert: 0.66,
    brokenLand: 0.66,
    mountain: 0.33,
    swamp: 0.33,
    jungle: 0.33,
    ice: 0.33,
    glacier: 0.33
  }
};
