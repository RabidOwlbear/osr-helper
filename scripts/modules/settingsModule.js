export const registerSettings = async function (){

  class DungTurnConfig extends FormApplication {
    constructor() {
      super();
      
    }
    static get defaultOptions() {
      const options = super.defaultOptions;
      options.baseApplication = 'dungeonTurnConfig';
      options.id = "dungTurnConfig";
      options.template = "modules/OSE-helper/templates/dungeon-turn-config.html";
      options.height = 300;
      options.width = 400;
      // options.left = 500;
      // options.top = 100;
      options.baseApplication = FormApplication;
      return options;
  }
  // async getData(options) { 
  //   return {}
  // }
  activateListeners(html) {
    super.activateListeners(html);
    let close = html.find('#submit')
  
    close.on('click', ()=>{
      
      this.close(true)
    })
    
  }
  
  async _onSubmit(event) {
    
      super._onSubmit(event, { preventRefresh: true });
      let data = {
        proc: parseInt(event.target[2].value),
        rTable: event.target[1].value,
        eTable: event.target[0].value, 
        rollTarget:  parseInt(event.target[3].value),
        rollEnc:  event.target[4].checked,
        rollReact:  event.target[5].checked,
      }
  
    
    await game.settings.set('OSE-helper', 'dungeonTurnData', data)
  }
  
  async _updateObject() {}
  
  }

  game.settings.register('OSE-helper', 'timeJournalName', {
    name: 'Name Of Journal Entry',
    hint: 'Name Of Journal Entry To Use For Time Keeping',
    scope: 'world',
    type: String,
    default: 'Turn Count',
    config: true
  });

  game.settings.register('OSE-helper', 'restMessage', {
    name: 'Enable rest status chat messages',
    hint: 'Enables rest status chat messages',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register('OSE-helper', 'whisperRest', {
    name: 'Whisper rest status messages',
    hint: 'Whispers rest status messages',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register('OSE-helper', 'tokenLightDefault', {
    name: 'Update default token settings on creation.',
    hint: 'Enables Owlbear preferred default token light settings.',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register('OSE-helper', 'combatTimeAdvance', {
    name: 'Advance game time 10 seconds each combat round.',
    hint: 'Advances the game time 10 seconds each time a combat round advances',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.registerMenu('OSE-helper', 'dungeonTurnSettings', {
    name: 'Dungeon Turn Settings.',
    label: 'Dungeon Turn Settings',
    icon: 'fas fa-wrench',
    scope: 'world',
    type: DungTurnConfig,
    config: true,
    restricted: true,
  })

  //stores world time after last turn advance
  game.settings.register('OSE-helper', 'lastTick', {
    name: 'lastTick',
    scope: 'world',
    type: Object,
    default: {
      lastTick: game.time.worldTime
    },
    config: false
  });

  game.settings.register('OSE-helper', 'userData', {
    name: 'userData',
    scope: 'client',
    type: Object,
    default: {
      actors: {},
      lastTick: game.time.worldTime
    },
    config: false
  });

  //custom effect data obj
  game.settings.register('OSE-helper', 'customEffects', {
    name: 'effectData',
    scope: 'world',
    type: Object,
    default: {},
    config: false
  });
  game.settings.register('OSE-helper', 'lightData', {
    name: 'lightData',
    scope: 'world',
    type: Object,
    default: {},
    config: false
  });
  game.settings.register('OSE-helper', 'effectData', {
    name: 'effectData',
    scope: 'world',
    type: Array,
    default: [],
    config: false
  });

  //stores turn count data

  game.settings.register('OSE-helper', 'turnData', {
    name: 'turnData',
    scope: 'world',
    type: Object,
    default: {
      proc: 0,
      procCount: 0,
      rest: 0,
      restWarnCount: 0,
      session: 0,
      total: 0,
      journalName: game.settings.get('OSE-helper', 'timeJournalName')
    },
    config: false
  });

  //ration settings
  game.settings.register('OSE-helper', 'trackRations', {
    name: 'Track Rations Use',
    hint: 'Track Rations Use',
    scope: 'client',
    type: Boolean,
    default: false,
    config: true
  });

  game.settings.register('OSE-helper', 'rationData', {
    name: 'rationData',
    scope: 'world',
    type: Object,
    default: {
      proc: 0,
      procCount: 0,
      rest: 0,
      restWarnCount: 0,
      session: 0,
      total: 0,
      journalName: game.settings.get('OSE-helper', 'timeJournalName')
    },
    config: false
  });

  game.settings.register('OSE-helper', 'centerHotbar', {
    name: 'Center Hotbar',
    hint: 'Center The macro Hotbar',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
    onChange: () => OSEH.util.centerHotbar()
  });
  //split to ose-helper eventually
  game.settings.register('OSE-helper', 'classTypeList', {
    name: 'classTypeList',
    scope: 'world',
    type: Array,
    default: [],
    config: false
  });

  game.settings.register('OSE-helper', 'dungeonTurnData', {
    name: 'dungeonTurnData',
    scope: 'world',
    type: Object,
    default: {
      proc: 0,
      rTable: 'none',
      eTable: 'none', 
      rollTarget: 0,
      rollEnc: false,
      rollReact: false,
    },
    config: false
  });
  
  game.settings.register('OSE-helper', 'enableLightConfig', {
    name: 'Enable Light Item Settings Config.',
    hint: 'Adds icon to Items tagged with "Light" that allows for configuration of custom light options.',
    scope: 'world',
    type: Boolean,
    default: false,
    config: true
  })
  game.settings.register('OSE-helper', 'effectPresets', {
    name: 'effectPresets',
    scope: 'world',
    type: Array,
    default: [],
    config: false
  });
// ---------------remove once ose system fixed to accomodate time advance on game round advance
  game.settings.register('OSE-helper', 'lastRound', {
    name: 'lastRound',
    scope: 'world',
    type: Number,
    default: 0,
    config: false
  });
  // --------------

}