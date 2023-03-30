export class OSRHTurnTracker extends FormApplication {
  constructor() {
    super();
    this.turnData = deepClone(game.settings.get('osr-helper', 'turnData'));
    this.tableNames = game.tables.contents.map((i) => i.name);
    // this.dungeonTurnData = game.settings.get('osr-helper', 'dungeonTurnData');
    this.isGM = game.user.isGM;
    this.settingsChanged = false;
    // if(!this.dungeonTurnData.lvl)this.dungeonTurnData.lvl = 1;
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['osrh', 'turn-tracker'],
      template: `modules/${OSRH.moduleName}/templates/turn-tracker.hbs`,
      id: `turn-tracker`,
      title: `Turn Tracker`,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.tab-content', initial: 'main' }],
      width: 300,
      height: 470
    });
  }
  getData() {
    const context = super.getData();
    context.isGM = this.isGM;
    context.turnData = this.turnData;
    context.tableNames = this.tableNames;
    context.DTData = this.dungeonTurnData;
    return context;
  }

  activateListeners(html) {
    if (this.isGM) {
      const advanceTurn = html.find('#turn-advance-btn')[0];
      const restBtn = html.find('#rest-btn')[0];
      const encSelectEls = html.find('.enc-select');
      const saveSettings = html.find('#save-settings')[0];
      const encRoll = html.find('#encounter-roll')[0];
      const reactRoll = html.find('#react-roll')[0];
      const reactTable = html.find('#react-table')[0];
      const encFreq = html.find('#encounter-freq')[0];
      const rollTarget = html.find('#encounter-target')[0];
      const dungeonLvl = html.find('#d-level')[0];
      const resetSession = html.find('#reset-session-btn')[0];
      const resetTotal = html.find('#reset-total-btn')[0];
      const dLvlUp = html.find('#d-lvl-up')[0];
      const dLvlDn = html.find('#d-lvl-dn')[0];
      for (let i = 0; i < encSelectEls.length; i++) {
        const el = encSelectEls[i];
        el.value = this.turnData.eTables[i];
        el.addEventListener('change', (e) => {
          this.settingsChanged = true;
          this.turnData.eTables = this.getEncounterTables(html);
          if (saveSettings.classList.contains('hidden')) saveSettings.classList.remove('hidden');
        });
      }

      encRoll.addEventListener('change', (e) => {
        this.showSaveBtn(saveSettings);
      });
      reactRoll.addEventListener('change', (e) => {
        this.showSaveBtn(saveSettings);
      });
      reactTable.value = this.turnData.rTable;
      reactTable.addEventListener('change', (e) => {
        this.showSaveBtn(saveSettings);
      });
      encFreq.addEventListener('change', (e) => {
        this.showSaveBtn(saveSettings);
      });
      rollTarget.addEventListener('change', (e) => {
        this.showSaveBtn(saveSettings);
      });
      dungeonLvl.addEventListener('change', (e) => {
        this.showSaveBtn(saveSettings);
      });
      restBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await OSRH.turn.rest();
        OSRH.socket.executeForEveryone('refreshTurnTracker');
      });
      dLvlUp.addEventListener('click', (e) => {
        this.turnData.lvl++;
        dungeonLvl.value = this.turnData.lvl;
        this.showSaveBtn(saveSettings);
      });
      dLvlDn.addEventListener('click', (e) => {
        this.turnData.lvl--;
        if (this.turnData.lvl <= 0) this.turnData.lvl = 1;
        dungeonLvl.value = this.turnData.lvl;
        this.showSaveBtn(saveSettings);
      });
      advanceTurn.addEventListener('click', async (e) => {
        e.preventDefault();
        await OSRH.turn.dungeonTurn();
        this.turnData = await game.settings.get('osr-helper', 'turnData');
        this.render(true);
        OSRH.socket.executeForEveryone('refreshTurnTracker');
      });
      resetSession.addEventListener('click', async (e) => {
        await OSRH.turn.resetSessionCount();
        this.turnData = await game.settings.get('osr-helper', 'turnData');
        OSRH.socket.executeForEveryone('refreshTurnTracker');
      });
      saveSettings.addEventListener('click', async (e) => {
        await this.updateTurnData(html);
        OSRH.socket.executeForEveryone('refreshTurnTracker');
        ui.notifications.notify('Dungeon Turn Settings Updated.');
      });
      resetTotal.addEventListener('click', (e) => {
        let app = new Dialog({
          title: 'WARNING',
          content: '<p>WARNING! This will reset all turn counts. This action cannot be undone.</p>',
          buttons: {
            one: {
              icon: '<i class=`fas fa-check`></i>',
              label: 'Reset',
              callback: async () => {
                await OSRH.turn.resetAllCounts();
                OSRH.socket.executeForEveryone('refreshTurnTracker');
              }
            },
            two: {
              icon: '<i class=`fas fa-times`></i>',
              label: 'Close',
              callback: function () {
                app.close();
              }
            }
          },
          default: 'two'
        }).render(true);
      });
    }
    // handle tracker animation
    if(this.turnData.rSprite){
      this.handleRestAnimation(this.turnData.walkCount,html)
    }else{
      this.updateAnimation(this.turnData.walkCount, html);
    }
    
  }
  showSaveBtn(btn) {
    this.settingsChanged = true;
    if (btn.classList.contains('hidden')) btn.classList.remove('hidden');
  }
  hideSaveBtn(btn) {
    this.settingsChanged = false;
    if (!btn.classList.contains('hidden')) btn.classList.add('hidden');
  }
  async refreshCounts(refresh = false) {
    this.turnData = deepClone(await game.settings.get('osr-helper', 'turnData'));
    // this.dungeonTurnData = await game.settings.get('osr-helper', 'dungeonTurnData');
    if (refresh) this.render(true);
  }
  getEncounterTables(html) {
    let selectEls = [...html.find('.enc-select')];
    return selectEls.map((el) => el.value).map((i) => (i == '' ? null : i));
  }
  async updateTurnData(html) {
    const encRoll = html.find('#encounter-roll')[0];
    const reactRoll = html.find('#react-roll')[0];
    const reactTable = html.find('#react-table')[0];
    const encFreq = html.find('#encounter-freq')[0];
    const rollTarget = html.find('#encounter-target')[0];
    const dungeonLvl = html.find('#d-level')[0];
    const encTables = this.getEncounterTables(html);
    const saveSettings = html.find('#save-settings')[0];
    this.turnData.eTables = encTables;
    this.turnData.rollEnc = encRoll.checked;
    this.turnData.rollReact = reactRoll.checked;
    this.turnData.rTable = reactTable.value;
    this.turnData.proc = parseInt(encFreq.value);
    this.turnData.rollTarget = parseInt(rollTarget.value);
    this.turnData.lvl = parseInt(dungeonLvl.value);
    await game.settings.set('osr-helper', 'turnData', this.turnData);
    this.hideSaveBtn(saveSettings);
  }
  updateAnimation(frame, html){
    const frames = [...html.find('.sprite')];
    frames.map(i=>i.classList.add('hidden'));
    console.log(frames[0].id, `bg-${frame}`)
    let lastIdx = frame - 1  == 0 ? 5 :frame -1;
    let curFrame = frames.find(f=>f.id === `bg-${frame}`);
    let lastFrame = frames.find(j=>j.id === `bg-${lastIdx}`);
    console.log(curFrame, lastFrame)
    lastFrame?.classList?.add('hidden');
    curFrame?.classList?.remove('hidden');

  }
  handleRestAnimation(frame, html){
    
    const restFrame = html.find(`#bg-0`)[0];
    const lastFrame = html.find(`#bg-${frame}`)[0];
    const coords = [[0,55], [150,5],[260,100],[100,210],[0,140]];
    restFrame.style.top = `${coords[frame - 1][0]}px`;
    restFrame.style.left = `${coords[frame - 1][1]}px`;
    console.log(restFrame,coords[frame - 1][0],coords[frame - 1][1])
    restFrame.classList.remove('hidden');
    lastFrame.classList.add('hidden');
  }
}
