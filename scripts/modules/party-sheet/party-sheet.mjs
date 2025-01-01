// import { XpAwardSheet } from "./xp-award.mjs";
// import { CoinAwardSheet } from "./coin-award.mjs";
const OSRHParty = {
  gridSize: 9, //must be odd
  sheet: null,
  formation: null, //formation?.active ? formation.data : null,
  dragBuffer: null
};
export class OSRHPartySheet extends FormApplication {
  constructor(party, formation, size) {
    super();
    this.gridSize = size;
    this.party = party;
    this.formation = formation; 
    this.start;
    this.tempForm = null;
  }
  static async init(size = null) {
    const settingData = await game.settings.get('osr-helper', 'currentFormation');
    // shim for existing setting data 
    if(!settingData.gridSize && settingData?.data?.grid?.length){
      settingData.gridSize = settingData.data.grid.length
    }
    const gridSize = size ? size: settingData?.gridSize;
    const party = OSRH.util.getPartyActors().party;
    const formation = await OSRHPartySheet.defaultFormationData(gridSize);

    OSRH.party.sheet = new OSRHPartySheet(party, formation, gridSize);
  }
  static async reset(size=5){
    const options = [5,7,9,11]
    //size must be odd number
    if(!game.user.isGM){
      ui.notifications.warn(game.i18n.localize("OSRH.notification.gmWarn"));
    }else{if (Number.isInteger(size) && options.includes(size)){
      const party = OSRH.util.getPartyActors().party;
    const formation = await OSRHPartySheet.defaultFormationData(size, true);
    await game.settings.set('osr-helper', 'currentFormation', {active: false, data: formation, gridSize: size});
    OSRH.party.sheet = new OSRHPartySheet(party, formation, size);
    }else{
      ui.notifications.warn(game.i18n.localize("OSRH.notification.gridSizeWarn"))
    }}
    
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'OSRH-party-sheet',
      title: 'Party Sheet',
      classes: ['osrh', 'application', 'party-sheet'],
      top: 120,
      left: 60,
      width: 300,
      height: 400,
      dragDrop: [
        {
          dragSelector: '.item',
          dropSelector: '.items'
        },
        {
          dragSelector: '.marker',
          dropSelector: '.formation-grid'
        },
        {
          dragSelector: '.party-drag'
        }
      ],
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.tab-content',
          initial: 'party'
        }
      ],
      template: `modules/osr-helper/templates/party-sheet/party-sheet.hbs`
    });
  }
  static renderPartySheet(options) {
    OSRH.party.sheet.render(true, { focus: true, ...options });
  }
  getData() {
    const context = super.getData();
    const party = OSRH.util.getPartyActors().party; //game.actors.filter(a=>a.flags?.['osr-helper']?.party?.active);
    // this.party = party;

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
    context.pool = this.formation.pool;
    context.formationGrid = this._generateGrid(this.gridSize);

    return context;
  }
  activateListeners(html) {
    const deleteBtns = html.find('.delete-btn');
    const markerDeletBtns = html.find('.marker-del');
    const portraits = html.find('.portrait');
    const dragPartyBtn = html.find('.drag-party-btn')[0];
    const gridSize = html.find('#grid-size')[0];
    // delete event listener
    deleteBtns.map((b) => {
      deleteBtns[b].addEventListener('click', async (e) => {
        e.preventDefault();
        let uuid = e.target.closest('.item').dataset.uuid;
        await this._unsetPartyFlag(uuid);
        this.render();
      });
    });

    // open sheet listener
    portraits.map(async (p) => {
      portraits[p].addEventListener('click', async (e) => {
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
      markerDeletBtns[m].addEventListener('click', (e) => {
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
  async _onDrop(event) {
    if (!game.user.isGM) {
      return;
    }
    const dragData = TextEditor.getDragEventData(event);
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
        const formation = await OSRHPartySheet.defaultFormationData(this.gridSize);
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
        this.formation = await OSRHPartySheet.defaultFormationData(this.gridSize);
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
    this.formation = await OSRHPartySheet.defaultFormationData(this.gridSize);
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
    const lead = this.formation.lead;
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
    const formation = await OSRHPartySheet.defaultFormationData(size);
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

    
    await OSRHPartySheet.init(size);
    await sleep(300)
    OSRHPartySheet.renderPartySheet({top, left})

  }
}
