export const registerSettings = async function () {

  game.settings.register(`${OSRH.moduleName}`, 'timeJournalName', {
    name: 'Name Of Journal Entry',
    hint: 'Name Of Journal Entry To Use For Time Keeping',
    scope: 'world',
    type: String,
    default: 'Turn Count',
    config: true
  });

  game.settings.register(`${OSRH.moduleName}`, 'displayControlUi', {
    name: 'Display UI button tray.',
    hint: 'Adds a collapseable group of module control buttons above the macro hotbar.',
    scope: 'client',
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register(`${OSRH.moduleName}`, 'restMessage', {
    name: 'Enable rest status chat messages',
    hint: 'Enables rest status chat messages',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register(`${OSRH.moduleName}`, 'whisperRest', {
    name: 'Whisper rest status messages',
    hint: 'Whispers rest status messages',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register(`${OSRH.moduleName}`, 'tokenLightDefault', {
    name: 'Update default token settings on creation.',
    hint: 'Enables Owlbear preferred default token light settings.',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register(`${OSRH.moduleName}`, 'combatTimeAdvance', {
    name: 'Combat Time Advance.',
    hint: 'Advances the game time 10 seconds each time a combat round advances',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register(`${OSRH.moduleName}`, 'dungeonTurnNotificiation', {
    name: 'Dungeon Turn Notification',
    hint: 'Displays a UI notification when the Dungeon Turn macro is used.',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
  //stores world time after last turn advance
  game.settings.register(`${OSRH.moduleName}`, 'lastTick', {
    name: 'lastTick',
    scope: 'world',
    type: Object,
    default: {
      lastTick: game.time.worldTime
    },
    config: false
  });

  game.settings.register(`${OSRH.moduleName}`, 'userData', {
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
  game.settings.register(`${OSRH.moduleName}`, 'customEffects', {
    name: 'effectData',
    scope: 'world',
    type: Object,
    default: {},
    config: false
  });
  game.settings.register(`${OSRH.moduleName}`, 'lightData', {
    name: 'lightData',
    scope: 'world',
    type: Object,
    default: {},
    config: false
  });
  
  game.settings.register(`${OSRH.moduleName}`, 'effectData', {
    name: 'effectData',
    scope: 'world',
    type: Array,
    default: [],
    config: false
  });

  //stores turn count data

  game.settings.register(`${OSRH.moduleName}`, 'turnData', {
    name: 'turnData',
    scope: 'world',
    type: Object,
    default: {
      journalName: game.settings.get(`${OSRH.moduleName}`, 'timeJournalName'),
      dungeon: {  
        eTables: ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
        rTable: 'none',
        lvl: 1,
        walkCount: 1,
        rSprite: false,
        proc: 0,
        procCount: 0,
        rollEnc: false,
        rollReact: false,
        rollTarget: 0,
        rest: 0,
        restWarnCount: 0,
        session: 0,
        total: 0,
      },
      travel: {
        session: 0,
        total: 0,
        rest: 0,
        rollEnc: false,
        rollReact: false,
        rTable: 'none',
        eTable: 'none',
        proc: 0,
        procCount: 0,
        rollTarget: 2,
        restWarnCount: 0,
        terrain: 'clear',
        duration: 24
      }
      
    },
    config: false
  });
  // stores saved custom effects
  game.settings.register(`${OSRH.moduleName}`, 'savedEffects', {
    name: 'savedEffects',
    scope: 'world',
    type: Object,
    default: {},
    config: false
  });

  //ration settings
  game.settings.register(`${OSRH.moduleName}`, 'trackRations', {
    name: 'Track Rations Use',
    hint: 'Track Rations Use',
    scope: 'client',
    type: Boolean,
    default: false,
    config: true
  });

  game.settings.register(`${OSRH.moduleName}`, 'rationData', {
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
      journalName: game.settings.get(`${OSRH.moduleName}`, 'timeJournalName')
    },
    config: false
  });

  game.settings.register(`${OSRH.moduleName}`, 'centerHotbar', {
    name: 'Center Hotbar',
    hint: 'Center The macro Hotbar',
    scope: 'client',
    type: Boolean,
    default: true,
    config: true,
    onChange: () => OSRH.util.centerHotbar()
  });
  //split to ose-helper eventually
  game.settings.register(`${OSRH.moduleName}`, 'classTypeList', {
    name: 'classTypeList',
    scope: 'world',
    type: Array,
    default: [],
    config: false
  });

  game.settings.register(`${OSRH.moduleName}`, 'dungeonTurnData', {
    name: 'dungeonTurnData',
    scope: 'world',
    type: Object,
    default: {
      proc: 0,
      rTable: 'none',
      eTable: 'none',
      rollTarget: 0,
      rollEnc: false,
      rollReact: false
    },
    config: false
  });

  game.settings.register(`${OSRH.moduleName}`, 'enableLightConfig', {
    name: 'Enable Light Item Config.',
    hint: 'Adds icon to Items tagged with "Light" that allows for configuration of custom light options.',
    scope: 'world',
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register(`${OSRH.moduleName}`, 'effectPresets', {
    name: 'effectPresets',
    scope: 'world',
    type: Array,
    default: [],
    config: false
  });

  game.settings.register(`${OSRH.moduleName}`, 'theme', {
    name: 'Theme',
    hint: 'Select theme for  effect forms',
    type: String,
    choices: {
      0: OSRH.data.themeData[0].name,
      1: OSRH.data.themeData[1].name,
      2: OSRH.data.themeData[2].name,
      3: OSRH.data.themeData[3].name,
      4: OSRH.data.themeData[4].name,
      5: OSRH.data.themeData[5].name
    },
    default: 'none',
    scope: 'client',
    config: true,
    onChange: () => {
      OSRH.util.setTheme();
    }
  });

  game.settings.register(`${OSRH.moduleName}`, 'enableEquippableContainers', {
    name: 'Enable Equippable Containers',
    hint: `When enabled container items are equippable. This feature only works if "complete" encumbrance is selected in game settings.`,
    scope: 'world',
    type: Boolean,
    default: false,
    config: true
  });

  // ---------------remove once ose system fixed to accomodate time advance on game round advance
  game.settings.register(`${OSRH.moduleName}`, 'lastRound', {
    name: 'lastRound',
    scope: 'world',
    type: Number,
    default: 0,
    config: false
  });
  // --------------
};
