export class OSRHTurnTracker extends FormApplication {
  constructor() {
    super();
    this.systemData = OSRH.systemData;
    this.tableNames = game.tables.contents.map((i) => i.name);
    // this.dungeonTurnData = game.settings.get('osr-helper', 'dungeonTurnData');
    this.isGM = game.user.isGM;
    this.settingsChanged = false;
    this.terrainMod = OSRH.CONST.terrainMod;
    this.lostMod = OSRH.CONST.lostMod;
    // if(!this.dungeonTurnData.lvl)this.dungeonTurnData.lvl = 1;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['osrh', 'turn-tracker'],
      template: `modules/${OSRH.moduleName}/templates/turn-tracker.hbs`,
      id: `turn-tracker`,
      title: `Turn Tracker`,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.tab-content', initial: 'dungeon' }],
      dragDrop: [
        {
          dragSelector: '.item',
          dropSelector: '.dropEl'
        }
      ],
      width: 300,
      height: 480
    });
  }
  async getData() {
    this.turnData = foundry.utils.deepClone(await game.settings.get('osr-helper', 'turnData'));
    const context = super.getData();
    const partyObj = OSRH.util.getPartyActors();

    const tMod = this.terrainMod[this.turnData.travel.terrain];
    context.baseRate = Math.floor(this.getBaseRate(partyObj) * tMod);
    context.characters = this.partyData(partyObj.characters, tMod);
    context.retainers = this.partyData(partyObj.retainers, tMod);
    context.isGM = this.isGM;
    context.turnData = this.turnData;
    context.tableNames = this.tableNames;
    context.DTData = this.dungeonTurnData;
    return context;
  }
  async _onDrop(event) {
    const dragData = TextEditor.getDragEventData(event);
    if (dragData.type === 'RollTable') {
      if (dragData.uuid.includes('Compendium')) {
        ui.notifications.warn(game.i18n.localize("OSRH.util.notification.compendiumTableWarn"));
        return;
      }
      const table = await fromUuid(dragData.uuid);
      const html = event.target.closest('.window-content');
      event.target.value = table.name;
      this.showSaveBtn({ 0: html, length: 1 });
    }
  }
  // dungeon turn
  activateListeners(html) {
    const advanceDungeonTurn = html.find('#dungeon-turn-advance-btn')[0];
    const advanceTravelTurn = html.find('#travel-turn-advance-btn')[0];
    const terrainSelect = html.find('#terrain')[0];
    const dRestBtn = html.find('#d-rest-btn')[0];
    const tRestBtn = html.find('#t-rest-btn')[0];
    const forageCheck = html.find('#forage-check')[0];
    const navCheck = html.find('#navigation-check')[0];
    const encSelectEls = html.find('.d-enc-select');
    const saveSettings = html.find('.save-settings');
    const dEncRoll = html.find('#d-encounter-roll')[0];
    const dReactRoll = html.find('#d-react-roll')[0];
    const dReactTable = html.find('#d-react-table')[0];
    const dEncFreq = html.find('#d-encounter-freq')[0];
    const dRollTarget = html.find('#d-encounter-target')[0];
    const tEncFreq = html.find('#t-encounter-freq')[0];
    const tRollTarget = html.find('#t-encounter-target')[0];
    const tReactTable = html.find('#travel-react-table')[0];
    const tEncTable = html.find('#travel-enc-table')[0];
    const dungeonLvl = html.find('#d-level')[0];
    const resetSession = html.find('#reset-session-btn')[0];
    const resetTotal = html.find('#reset-total-btn')[0];
    const dLvlUp = html.find('#d-lvl-up')[0];
    const dLvlDn = html.find('#d-lvl-dn')[0];
    const trackRationExp = html.find(`#track-ration-expiration`)[0];
    // gm only controls
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
      // saveSettings.addEventListener('click', async (e) => {
      //   await this.updateTurnData(html);
      //   OSRH.socket.executeForEveryone('refreshTurnTracker');
      //   ui.notifications.notify('Dungeon Turn Settings Updated.');
      // });
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

  getTerrainChance(html) {
    const terrain = html.find('#terrain')[0].value;
    const terrainEls = [...html.find('option.terrainOpt')];
    const data = terrainEls.find((i) => i.value === terrain).dataset;
    return parseInt(data.target);
  }
  getActiveTab(html) {
    let a = html.find('.nav-tab.active')[0];
    return a?.dataset.tab;
  }
  showSaveBtn(html) {
    const btnArr = html[0].querySelectorAll('.save-settings');
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
    let selectEls = [...html.find('.d-enc-select')];
    return selectEls.map((el) => el.value).map((i) => (i == '' ? null : i));
  }
  async updateTurnData(html) {
    const dEncRoll = html.find('#d-encounter-roll')[0];
    const dReactRoll = html.find('#d-react-roll')[0];
    const tEncRoll = html.find('#d-encounter-roll')[0];
    const tReactRoll = html.find('#d-react-roll')[0];
    const tEncTable = html.find('#travel-enc-table')[0];
    const tReactTable = html.find('#travel-react-table')[0];
    const dReactTable = html.find('#d-react-table')[0];
    const dEncFreq = html.find('#d-encounter-freq')[0];
    const tEncFreq = html.find('#t-encounter-freq')[0];
    const tRollTarget = html.find('#t-encounter-target')[0];
    const dRollTarget = html.find('#d-encounter-target')[0];
    const dungeonLvl = html.find('#d-level')[0];
    const trackRationExp = html.find('#track-ration-expiration')[0];
    const encTables = this.getEncounterTables(html);
    const saveSettings = html.find('.save-settings');
    const terrainSelect = html.find('#terrain')[0];
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
    this.turnData.global
      ? (this.turnData.global.trackRationExp = trackRationExp.checked)
      : (this.turnData.global = { trackRationExp: trackRationExp.checked });

    await game.settings.set('osr-helper', 'turnData', this.turnData);
    this.hideSaveBtn(saveSettings);
  }
  // animation
  updateAnimation(frame, html) {
    const frames = [...html.find('.sprite')];
    frames.map((i) => i.classList.add('hidden'));

    let lastIdx = frame - 1 == 0 ? 5 : frame - 1;
    let curFrame = frames.find((f) => f.id === `bg-${frame}`);
    let lastFrame = frames.find((j) => j.id === `bg-${lastIdx}`);

    lastFrame?.classList?.add('hidden');
    curFrame?.classList?.remove('hidden');
  }
  handleRestAnimation(frame, html) {
    const restFrame = html.find(`#bg-0`)[0];
    const lastFrame = html.find(`#bg-${frame}`)[0];
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
    const terrain = html.find(`#terrain`)[0].value;
    const bonus = html.find(`#nav-bonus`)[0];
    const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
    if (terrain == 'road' || terrain == 'trail') {
      ui.notifications.warn(game.i18n.localize('OSRH.report.cantGetLost'));
      return;
    }
    let roll = await new Roll(`1d6 + ${bonus.value}`).evaluate({ async: true });
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
    const modEl = html.find('#forage-bonus')[0];
    const mod = parseInt(modEl.value);
    const terrain = html.find(`#terrain`)[0].value;
    const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
    let roll = await new Roll(`1d6 + ${mod}`).roll({ async: true });
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
    const rateEl = html.find('#base-travel-rate')[0];
    const charEl = html.find('#character-list')[0];
    const retEl = html.find('#retainer-list')[0];
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
export function registerTravelConstants() {
  const hasSystem = terrainData.systems.includes(game.system.id);
  OSRH.CONST.terrainMod = terrainData[hasSystem ? game.system.id: 'ose'];
  OSRH.CONST.lostMod = {
    grassland: 1,
    clear: 1,
    swamp: 3,
    jungle: 3,
    desert: 3,
    allElse: 2
  };
  OSRH.CONST.timeInc = {
    minute: 60,
    turn: 600,
    hour: 3600,
    day: 86400
  };
}
const terrainData = {
  systems:['ose','basicfantasyrpg'],
  ose: {
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
  },
  'basicfantasyrpg': {
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
}