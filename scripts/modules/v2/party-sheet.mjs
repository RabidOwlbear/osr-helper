import { OSRHApp } from "./base/osr-app.mjs";
export class OSRHPartySheetV2 extends OSRHApp{
  // #dragDrop;
  constructor(options) {
    super(options);
    this.dragDrop = this.#createDragDropHandlers();
    this.gridSize = options.gridSize;
    this.party = options.party;
    this.formation = options.formation; 
    this.start;
    this.tempForm = null;
    this.isEditable = game.user.isGM;
  }

  static DEFAULT_OPTIONS = {
    id: 'OSRH-party-sheet',
    position: {
      width: 300,
      height: 400
    },
    classes: ['osrh', 'application', 'party-sheet', 'v2'],
    tag: 'osrh-app', // The default is "div"
    tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.window-content', initial: 'party' }],
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: 'Party Sheet', //localization string,
      position:{
        top: 120,
        left: 60,
      }
    },
    dragDrop: [
      { dragSelector: '.item', dropSelector: '.items' },
      { dragSelector: '.marker', dropSelector: '.formation-grid' },
      { dragSelector: '.party-drag' },
    ],
    actions: {}
  };
  static PARTS = {
    nav: {
      template: `modules/osr-helper/templates/v2/party-sheet/nav.hbs`
    },
    party: {
      template: `modules/osr-helper/templates/v2/party-sheet/party-tab.hbs`
    },
    formation: {
      template: `modules/osr-helper/templates/v2/party-sheet/formation-tab.hbs`
    },
    config: {
      template: `modules/osr-helper/templates/v2/party-sheet/config-tab.hbs`
    }
  };
  async _prepareContext(options) {
    let context = await super._prepareContext(options);
    const party = OSRH.util.getPartyActors().party;
    context = foundry.utils.mergeObject(context, {});
    context.tabs = this._getTabs(options.parts);
    context.party = [];
    party.map((p) => {
      context.party.push({
        uuid: p.uuid,
        img: p.img,
        name: p.name,
        hp: OSRH.util.getNestedValue(p, OSRH.systemData.paths.hp.val),
        hpMax: OSRH.util.getNestedValue(p, OSRH.systemData.paths.hp.max),
        ac: OSRH.util.getNestedValue(p, OSRH.systemData.paths.ac)
      });
    });
    context.pool = this.formation?.pool;
    context.formationGrid = this._generateGrid(this.gridSize);

    return context;
  }
  _onRender(context, options) {
    this.dragDrop.forEach((d) => d.bind(this.element));
    this._forceTabInit(context.tabs);
    const html = this.element;
    const deleteBtns = [...html.querySelectorAll('.delete-btn')];
    const markerDeletBtns = [...html.querySelectorAll('.marker-del')];
    const portraits = [...html.querySelectorAll('.portrait')];
    const dragPartyBtn = html.querySelector('.drag-party-btn');
    const gridSize = html.querySelector('#grid-size');
        // delete event listener
    deleteBtns.map((b) => {
      b.addEventListener('click', async (e) => {
        e.preventDefault();
        let uuid = e.target.closest('.item').dataset.uuid;
        await this._unsetPartyFlag(uuid);
        this.render();
      });
    });

    // open sheet listener
    portraits.map(async (p) => {
      p.addEventListener('click', async (e) => {
        e.preventDefault();
        const actor = await fromUuid(e.target.closest('.party-actor').dataset.uuid);
        actor.sheet.render(true);
      });
    });

    // test persist
    dragPartyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._rotateFormation();
    });

    markerDeletBtns.map((m) => {
      m.addEventListener('click', (e) => {
        e.preventDefault();
        let coord = e.target.closest('.grid-cell').dataset;
        let row = coord.row;
        let cell = coord.cell;
        this._markerDelete(row, cell, coord);
      });
    });
    gridSize.value = this.gridSize;
    gridSize.addEventListener('change', function(){this._changeGridSize(parseInt(gridSize.value))}.bind(this));
  }
  _getTabs(parts, tabs=['party','formation','config',]) {
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
        case 'nav':
          tab.id = 'nav';
          tab.label += 'nav';
          break;
        case 'party':
          tab.id = 'party';
          tab.label += 'party';
          break;
        case 'formation':
          tab.id = 'formation';
          tab.label += 'formation';
          break;
        case 'config':
          tab.id = 'config';
          tab.label += 'config';
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

  static async init(size = null) {
    const settingData = await game.settings.get('osr-helper', 'currentFormation');
    // shim for existing setting data 
    if(!settingData.gridSize && settingData?.data?.grid?.length){
      settingData.gridSize = settingData.data.grid.length
    }
    const gridSize = size ? size: settingData?.gridSize;
    const party = OSRH.util.getPartyActors().party;
    const formation = await OSRH.V2.partySheet.defaultFormationData(gridSize);

    OSRH.party.sheet = new OSRH.V2.partySheet({party, formation, gridSize});
  }
  static renderPartySheet(options) {
    OSRH.party.sheet.render(true, { focus: true, ...options });
  }
  static async reset(size=5){
    const options = [5,7,9,11]
    //size must be odd number
    if(!game.user.isGM){
      ui.notifications.warn(game.i18n.localize("OSRH.notification.gmWarn"));
    }else{if (Number.isInteger(size) && options.includes(size)){
      const party = OSRH.util.getPartyActors().party;
    const formation = await OSRHPartySheetV2.defaultFormationData(size, true);
    await game.settings.set('osr-helper', 'currentFormation', {active: false, data: formation, gridSize: size});
    OSRH.party.sheet = new OSRHPartySheet(party, formation, size);
    }else{
      ui.notifications.warn(game.i18n.localize("OSRH.notification.gridSizeWarn"))
    }}
  }
   async _setPartyFlag(uuid) {
    const actor = await fromUuid(uuid);
    let scope = OSRH.systemData.partySheet ? game.system.id : 'osr-helper';
    await actor.setFlag(scope, 'party', true);
    return true;
  }
  async _unsetPartyFlag(uuid) {
    if (!game.user.isGM) {
      return;
    }
    let newParty = this.party.filter((i) => i.uuid != uuid);
    this.party = newParty;
    //this._defaultFormationData(this.gridSize);

    // this.formation.pool = this.formation.pool.filter(i=>i.uuid != uuid);
    let scope = OSRH.systemData.partySheet ? game.system.id : 'osr-helper';
    const actor = await fromUuid(uuid);
    delete actor.flags[scope].party;
    await actor.unsetFlag(scope, 'party');
    await game.settings.set('osr-helper', 'currentFormation', { active: false, data: null, gridSize: this.gridSize });
    this.formation = await OSRHPartySheetV2.defaultFormationData(this.gridSize);
    this.render();
    return true;
  }
  _getFormationData(el) {
    let cells = [...el.querySelectorAll('.grid-cell')];
    const leadCell = el.querySelector('.leader');
    const leadUuid = leadCell.querySelector('.marker')?.dataset?.uuid;
    let filledCells = [];
    for (let i = 0; i < this.gridSize; i++) {
      let cells = el.querySelectorAll('.grid-cell[data-row="1"]');
    }

    const data = {
      leader: leadUuid
    };

    return data;
  }
  _generateGrid(size) {
    const lead = this.formation?.lead;
    let grid = ``;
    for (let r = 0; r < size; r++) {
      let rowHtml = ``;
      for (let c = 0; c < size; c++) {
        let cellData = this.formation.grid?.[r]?.[c];
        let leadCell = lead[0] == r && lead[1] == c ? 'leader' : '';
        let marker = cellData?.uuid
          ? `
        <div class="marker">
        <img src="${cellData.img}" class="marker marker-lg round-shadow" data-uuid="${cellData.uuid}" title="${cellData.name}">
        <a class="marker-del"><i class="fa-solid fa-circle-xmark"></i></a>
        </div>`
          : '';
        rowHtml += `<div class="grid-cell ${leadCell} formation-drop" data-type="grid-cell" data-row="${r}"data-cell="${c}">${marker}</div>`;
      }
      grid += `<div class="grid-row" data-row="${r}">${rowHtml}</div>`;
    }

    return grid;
  }
  _defaultFormationData(size) {
    const data = {
      lead: [0, 2],
      pool: [],
      grid: []
    };
    this.party.map((p) => {
      data.pool.push({ uuid: p.uuid, img: p.img, name: p.name });
    });
    for (let r = 0; r < size; r++) {
      let row = [];
      for (let c = 0; c < size; c++) {
        row.push({ uuid: null, img: null, name: null });
      }
      data.grid.push(row);
    }
    return data;
  }
  _markerDelete(r, c) {
    if (!game.user.isGM) {
      return;
    }
    let cellData = this.formation.grid[r][c];
    this.formation.pool.push({ uuid: cellData.uuid, img: cellData.img, name: cellData.name });
    this.formation.grid[r][c] = { uuid: null, img: null, start: cellData.start };
    game.settings.set('osr-helper', 'currentFormation', { active: true, data: this.formation, gridSize: this.gridSize});
    this.render();
  }
  _testPersist() {
    let grid = this.formation.grid;
    grid[0][0].uuid = 'testUuid';
    grid[0][0].img = 'assets/DCC%200-Level%20Tokens/DCC_0-level_Cobbler_Female_280px.png';
    grid[0][2].start = false;
    grid[2][0].start = true;
    this.render();
  }
  _getPartyoffsets(formation) {
    let data = formation; //this.tempForm;
    let leader = data.grid[data.lead[0]][data.lead[1]].uuid;
    let party = [];
    for (let r = 0; r < data.grid.length; r++) {
      let row = data.grid[r];
      for (let c = 0; c < row.length; c++) {
        let cell = row[c];
        if (r == data.lead[0] && c == data.lead[1]) {
        } else {
          if (cell.uuid) {
            let offY = r - data.lead[0];
            let offX = c - data.lead[1];
            party.push({
              r: r,
              c: c,
              offX,
              offY,
              uuid: cell.uuid
            });
          }
        }
      }
    }
    return party;
  }

  static async defaultFormationData(size, reset=false) {
    
    const center = (size -1) / 2;
    const data = {
      lead: [center, center],
      pool: [],
      grid: []
    };
    const currentFormation = await game.settings.get('osr-helper', 'currentFormation');
    if (!reset && currentFormation.active) {
      return currentFormation.data;
    } else {
      const party = OSRH.util.getPartyActors().party;
      party.map((p) => {
        data.pool.push({ uuid: p.uuid, img: p.img, name: p.name });
      });
      const centerIdx = Math.round(size / 2) - 1;
      for (let r = 0; r < size; r++) {
        let row = [];
        for (let c = 0; c < size; c++) {
          row.push({ uuid: null, img: null, name: null });
        }
        data.grid.push(row);
      }
      return data;
    }
  }

  _blankGrid() {
    const grid = [];
    const blankObj = { uuid: null, img: null, name: null };
    for (let i = 0; i < this.gridSize; i++) {
      let row = [];
      for (let r = 0; r < this.gridSize; r++) {
        row.push(blankObj);
      }
      grid.push(row);
    }
    return grid;
  }
  async _rotateFormation() {
    if (!game.user.isGM) {
      return;
    }
    let gridL = this.gridSize;
    const curGrid = this.formation.grid;
    const newGrid = [];
    for (let i = 0; i < gridL; i++) {
      newGrid.push([]);
    }
    for (let r = 0; r < gridL; r++) {
      let idx = gridL - r;
      for (let c = 0; c < gridL; c++) {
        let i = idx - 1;
        newGrid[c][i] = { uuid: curGrid[r][c].uuid, img: curGrid[r][c].img, name: curGrid[r][c].name };
      }
    }
    this.formation.grid = newGrid;
    await game.settings.set('osr-helper', 'currentFormation', { active: true, data: this.formation, gridSize: this.gridSize });
    this.render();
  }
  async _changeGridSize(size){
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const formation = await OSRHPartySheetV2.defaultFormationData(size);
    const top = this.position.top;
    const left = this.position.left;
    this.gridSize = size;
    this.formation = formation;
    const  flagData ={ 
      active: false,
      gridSize: size,
      data: formation
    }
    this.close();
    await game.settings.set('osr-helper', 'currentFormation', flagData);

    
    await OSRHPartySheetV2.init(size);
    await sleep(300)
    OSRHPartySheetV2.renderPartySheet({top, left})

  }

  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this)
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this)
      };
      // return new foundry.applications.ux.DragDrop.implementation(d);
      return OSRH.util.dragDropHandler(d);
    });
  }
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }
  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }
  _onDragOver(event) {}
  async _onDrop(event) {
    if (!game.user.isGM) {
      return;
    }
    const dragData = Math.floor(game.version) < 13 ? TextEditor.getDragEventData(event) : 
    foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    if (dragData.type != 'Actor' || !dragData.uuid) {
      return;
    }
    const actor = await fromUuid(dragData.uuid);
    const party = OSRH.util.getPartyActors();
    // party list drop
    if (!OSRH.systemData.partyTypes.includes(actor.type)) {
      return;
    }
    if (OSRH.systemData.partySheet) {
      if (!actor.flags[game.system.id] || !actor.flags[game.system.id]?.party) {
        await actor.setFlag(game.system.id, 'party', true);
        await game.settings.set('osr-helper', 'currentFormation', { active: false, data: null, gridSize: this.gridSize});
        const formation = await OSRHPartySheetV2.defaultFormationData(this.gridSize);
        this.formation = formation;
        if (game.system.id === 'ose') {
          if (!actor.flags[game.system.id]) actor.flags[game.system.id] = {};
          actor.flags[game.system.id].party = true;
          if (!this.formation.pool.filter((i) => i.uuid === actor.uuid).length) {
            this.formation.pool.push({ uuid: actor.uuid, img: actor.img, name: actor.name });
          }
        }
      }
    } else {
      if (!actor.flags?.['osr-helper']?.party?.active) {
        // actor.flags['osr-helper'] = { party: { active: true } };
        await actor.setFlag('osr-helper', 'party', { active: true });
        await game.settings.set('osr-helper', 'currentFormation', { active: false, data: null, gridSize: this.gridSize});
        this.formation = await OSRHPartySheetV2.defaultFormationData(this.gridSize);
      }
    }

    // grid drop
    if (event.target.dataset.type == 'grid-cell') {
      const grid = this.formation.grid;
      let pool = this.formation.pool;
      const cellEl = event.target;
      let cellData = grid[cellEl.dataset.row][cellEl.dataset.cell];
      const existing = cellData.uuid;
      cellData.uuid = dragData.uuid;
      cellData.img = actor.img;
      cellData.name = actor.name;
      this.formation.pool = pool.filter((i) => i.uuid != dragData.uuid);
      if (dragData.origin) {
        this.formation.grid[dragData.origin.row][dragData.origin.cell] = {
          uuid: null,
          img: null
        };
      }
      await game.settings.set('osr-helper', 'currentFormation', { active: true, data: this.formation, gridSize: this.gridSize});
    }
    Hooks.call('renderOSRHPartySheet');
    return true;
  }
  _onDragStart(event) {
    if (!game.user.isGM) {
      return;
    }
    if (event.target.classList.contains('party-drag')) {
      try {
        const data = this.formation;
        let leader = data.grid[data.lead[0]][data.lead[1]].uuid;
        if (!leader) {
          ui.notifications.warn('Please place a party member in the lead square on the formation grid.');
          return;
        }

        const dragData = {
          uuid: leader,
          type: 'Actor'
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        this.tempForm = foundry.utils.deepClone(this.formation);
        let offsets = this._getPartyoffsets(this.tempForm);
        let hook = Hooks.once('createToken', async (a, b, c) => {
          const leadToken = a;
          if (leadToken.baseActor.uuid == leader) {
            const scene = game.scenes.current;
            const size = scene.grid.size;
            const tokenDocs = [];
            for (let actor of offsets) {
              const actorObj = await fromUuid(actor.uuid);
              let tDoc = await actorObj.getTokenDocument();
              tDoc = await tDoc.toObject();
              tDoc.x = leadToken?.x + actor.offX * size;
              tDoc.y = leadToken?.y + actor.offY * size;
              tDoc.actorlink = true;
              tokenDocs.push(tDoc);
            }
            if (tokenDocs.length) scene.createEmbeddedDocuments('Token', tokenDocs);
          }
          this.tempForm = null;
        });
        setTimeout(() => {
          Hooks.off('createToken', hook);
        }, 3000);
      } catch {
        return false;
      }
      return true;
    }
    if (event.target.classList.contains('marker')) {
      const cell = event.target.closest('.grid-cell');
      try {
        const data = event.target.dataset;
        const dragData = {
          uuid: data.uuid,
          type: 'Actor',
          origin: { row: cell.dataset.row, cell: cell.dataset.cell }
        };
        if(!dragData.uuid) return
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      } catch {
        return false;
      }
      return true;
    }

    try {
      const data = event.target.dataset;
      const dragData = {
        uuid: data.uuid,
        type: 'Actor'
      };
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    } catch {
      return false;
    }
    return true;
  }
}