// import { XpAwardSheet } from "./xp-award.mjs";
// import { CoinAwardSheet } from "./coin-award.mjs";
const OSRHParty = {
  gridSize: 5,
  sheet: null,
  formation: null,//formation?.active ? formation.data : null,
  dragBuffer: null
}
export class OSRHPartySheet extends FormApplication {
  constructor(party, formation) {
    super();
    this.gridSize = OSRHParty.gridSize;
    this.party = party
    this.formation = formation; //? formation :this._defaultFormationData(OSRHParty.gridSize);
    this.start;
    this.tempForm = null;
  }
  static async init(){
    const party = OSRH.util.getPartyActors().party
    const formation = await OSRHPartySheet.defaultFormationData(OSRHParty.gridSize);
    OSRHParty.sheet = new OSRHPartySheet(party, formation);
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
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
  static renderPartySheet(options){
    OSRHParty.sheet.render(true, { focus: true, ...options} )
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
    context.formationGrid = this._generateGrid(OSRHParty.gridSize);

    return context;
  }
  activateListeners(html) {
    const deleteBtns = html.find('.delete-btn');
    const markerDeletBtns = html.find('.marker-del');
    const portraits = html.find('.portrait');
    const dragPartyBtn = html.find('.drag-party-btn')[0];
    // delete event listener
    deleteBtns.map((b) => {
      deleteBtns[b].addEventListener('click', async (e) => {
        e.preventDefault();
        let uuid = e.target.closest('.item').dataset.uuid;
        await this._unsetPartyFlag(uuid);
        this.render()
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
  }
  async _onDrop(event) {
    const dragData = TextEditor.getDragEventData(event);
    if (dragData.type != 'Actor' || !dragData.uuid) {
      return;
    }
    const actor = await fromUuid(dragData.uuid);
    const party = OSRH.util.getPartyActors()
    // party list drop
    if (event.target.id === 'party-list') {
      if(!OSRH.systemData.partyTypes.includes(actor.type)){
        return
      }
      if (OSRH.systemData.partySheet) {
        if (!actor.flags[game.system.id] || !actor.flags[game.system.id]?.party) {
          await actor.setFlag(game.system.id, 'party', true);
          await game.settings.set('osr-helper', 'currentFormation', { active: false, data: null} );
          const formation = await OSRHPartySheet.defaultFormationData(OSRHParty.gridSize);
          this.formation = formation;
          if(game.system.id === 'ose'){
            if(!actor.flags[game.system.id])actor.flags[game.system.id]= {}
            actor.flags[game.system.id].party = true;
            if(!this.formation.pool.filter(i=>i.uuid ===actor.uuid).length){
            this.formation.pool.push({ uuid: actor.uuid, img: actor.img, name: actor.name})
          }
          }
        }
      } else {
        if (!actor.flags?.['osr-helper']?.party?.active) {
          
          // actor.flags['osr-helper'] = { party: { active: true } };
          await actor.setFlag('osr-helper', 'party', { active: true });
          await game.settings.set('osr-helper', 'currentFormation', { active: false, data: null} );
          this.formation = await OSRHPartySheet.defaultFormationData(OSRHParty.gridSize);
        }
      }
      // OSRHParty.sheet.render();
      Hooks.call('renderOSRHPartySheet')
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
      game.settings.set('osr-helper', 'currentFormation', { active: true, data: this.formation} );
      this.render();
    }

    return true;
  }
  _onDragStart(event) {
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
        this.tempForm = deepClone(this.formation)
        let offsets = this._getPartyoffsets(this.tempForm);
        let hook = Hooks.once('createToken', async (a, b, c) => {
          const leadToken = a; 
          if(leadToken.baseActor.uuid == leader){const scene = game.scenes.current;
          const size = scene.grid.size;
          const tokenDocs = []
          for(let actor of offsets){
            const actorObj = await fromUuid(actor.uuid);
            let tDoc = await actorObj.getTokenDocument();
            tDoc = await tDoc.toObject();
            tDoc.x = leadToken?.x + (actor.offX * size);
            tDoc.y = leadToken?.y + (actor.offY * size);
            tDoc.actorlink = true;
            tokenDocs.push(tDoc);
          }
          if(tokenDocs.length)scene.createEmbeddedDocuments('Token', tokenDocs);}
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
    
    let newParty = this.party.filter(i=>i.uuid != uuid);
    this.party = newParty;
    //this._defaultFormationData(this.gridSize);
    
    // this.formation.pool = this.formation.pool.filter(i=>i.uuid != uuid);
    let scope = OSRH.systemData.partySheet ? game.system.id : 'osr-helper';
    const actor = await fromUuid(uuid);
    delete actor.flags[scope].party;
    await actor.unsetFlag(scope, 'party');
    await game.settings.set('osr-helper', 'currentFormation', { active: false, data: null} );
    this.formation = await OSRHPartySheet.defaultFormationData(OSRHParty.gridSize);
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
        let cellData = this.formation.grid[r][c];
        let leadCell = lead[0]== r && lead[1]== c ? 'leader' : '';
        let marker = cellData.uuid
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
      data.pool.push({ uuid: p.uuid, img: p.img, name: p.name});
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
  _markerDelete(r, c) {
    let cellData = this.formation.grid[r][c];
    this.formation.pool.push({ uuid: cellData.uuid, img: cellData.img, name: cellData.name});
    this.formation.grid[r][c] = { uuid: null, img: null, start: cellData.start};
    game.settings.set('osr-helper', 'currentFormation', { active: true, data: this.formation} );
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
    
    let data = formation;//this.tempForm;
    let leader = data.grid[data.lead[0]][data.lead[1]].uuid;
    let party = [];
    for (let r =0; r < data.grid.length; r++) {
      let row = data.grid[r]
      for (let c = 0; c < row.length; c++) {
        let cell = row[c]
        if (r == data.lead[0] && c == data.lead[1]) {
        }else{
          if (cell.uuid) {
            let offY = r - data.lead[0]
            let offX = c - data.lead[1]
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
    return party
  }

  static async defaultFormationData(size) {
    const data = {
      lead: [2, 2],
      pool: [],
      grid: []
    };
    const currentFormation = await game.settings.get('osr-helper', 'currentFormation');
    if(currentFormation.active){
      return currentFormation.data
    }else{
      const party = OSRH.util.getPartyActors().party;
      party.map((p) => {
        data.pool.push({ uuid: p.uuid, img: p.img, name: p.name});
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
  
  _blankGrid(){
    const grid = [];
    const blankObj = { uuid: null, img: null, name: null }
    for(let i = 0; i < OSRHParty.gridSize; i++){
      let row = []
      for(let r = 0; r < OSRHParty.gridSize; r++){
        row.push(blankObj);
      }
      grid.push(row)
    }
    return grid
  }
 async _rotateFormation(){
    let gridL = OSRHParty.gridSize;
    const curGrid = this.formation.grid;
    const newGrid = []
    for(let i =0; i<gridL;i++){
      newGrid.push([])
    }
    for(let r=0; r < gridL; r++){
      let idx = gridL - r;
      for(let c = 0; c < gridL; c++){
        let i = idx - 1;
        newGrid[c][i] = {uuid: curGrid[r][c].uuid, img: curGrid[r][c].img, name: curGrid[r][c].name}
      }
    }
    this.formation.grid = newGrid;
    await game.settings.set('osr-helper', 'currentFormation', { active: true, data: this.formation} )
    this.render();
  }
}
