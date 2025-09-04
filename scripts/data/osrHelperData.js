export const registerData = () => {
  OSRH.data = OSRH.data || {};
 
  /*
lightType: {
    name: 'string',
    dimLight: 30,
    brightLight: 10,
    duration: 60,
    color: 'hex',
    secondaryColor: 'hex',
    lightAlpha: 0.2  //light intensity
    warn: 3, number of turns at which to color text orange
    alert: 1 number of turns at which to color text red
  }
  
*/
  OSRH.data.effectIcons = [
    {
      name:`-Icon-`,
      color: '#fff',
      textColor: `#000`,
      path:`none`
    },
    {
      name:`sword`,
      color: '#fc293b',
      textColor: `#fff`,
      path:`icons/svg/sword.svg`
    },
    {
      name:`combat`,
      color: '#fcdc29',
      textColor: `#000`,
      path:`icons/svg/combat.svg`
    },
    {
      name:`heal`,
      color: '#cc000f',
      textColor: `#fff`,
      path:`icons/svg/heal.svg`
    },
    {
      name:`book`,
      color: '#005bbf',
      textColor:` #fff`,
      path:`icons/svg/book.svg`
    },
    {
      name: `dice`,
      color: '#ccaa4a',
      textColor:` #fff`,
      path:`icons/svg/dice-target.svg`
    },
    {
      name:`swirl`,
      color: '#b3eaf8',
      textColor:` #000`,
      path:`icons/svg/sun.svg`
    },
    {
      name: 'target',
      color: `#11e233`,
      textColor: `#000000`,
      path: `icons/svg/target.svg` 
    }
  ];
  OSRH.data.themeData = [
    {
      name: 'purple slide',
      c1: `#b58ed1`,
      c2: `#b3eaf8`,
      c3: `#e9ffde`,
      bg: `#a27dba`,
      lightBg: `#f1eee7`,
      dark: `#40207b`,
      text: `#000`,
      glow: `#e9ffde`,
      midNum: `30%`,
      btnColor: `#634f88`,
      btnTxt: '#f1eee7',
    },
    {
      name: 'sante fe mall',
      c1: `#7bcbcc`,
      c2: `#f8ebcf`,
      c3: `#f8d6c6`,
      bg: `#aecccc`,
      lightBg: `#f8f5e2`,
      dark: `#2f6868`,
      text: `#000`,
      glow: `#94f6f8`,
      midNum: `32%`,
      btnColor: `#d16b3c`
      ,
      btnTxt: '#f1eee7',
    },
    {
      name: 'deep blue',
      c1: `#5549b9`,
      c2: `#4f7adb`,
      c3: `#93eafb`,
      bg: `#4039c9`,
      lightBg: `#d6d2c9`,
      dark: `#091491`,
      text: `#fff`,
      glow: `#93eafb`,
      midNum: `20%`,
      btnColor: `#363d85`
      ,
      btnTxt: '#f1eee7',
    },
    {
      name: 'green slime',
      c1: `#a27dba`,
      c2: `#b2ffb5`,
      c3: `#ddffcd`,
      bg: `#7a2e6f`,
      lightBg: `#e2e7d5`,
      dark: `#472544`,
      text: `#000`,
      glow: `#ddffcd`,
      midNum: `28%`,
      btnColor: `#7a2e6f`
      ,
      btnTxt: '#e2e7d5',
    },
    {
      name: 'cotton candy',
      c1: `#ec5cda`,
      c2: `#f9b2ff`,
      c3: `#ffeaef`,
      bg: `#ec5cda`,
      lightBg: `#ebdad8`,
      dark: `#7a2e6f`,
      text: `#000`,
      glow: `#ffeaef`,
      midNum: `24%`,
      btnColor: `#ec5cda`
      ,
      btnTxt: '#ebdad8',
    },
    {
      name: 'pale sunrise',
      c1: `#fffbc0`,
      c2: `#c6fef1`,
      c3: `#eafaff`,
      bg: `#fffbfc`,
      lightBg: `#fffbfc`,
      dark: `#159b87`,
      text: `#000`,
      glow: `#88eefd`,
      midNum: `28%`,
      btnColor: `#003747`
      ,
      btnTxt: '#fffbfc',
    },
    {
      name: 'Dark',
      c1: `#353535`,
      c2: `#666666`,
      c3: `#757575`,
      bg: `#242424`,
      lightBg: `#8f8f8f`,
      dark: `#3f4f4f`,
      text: `#ddd`,
      glow: `#88fd8e`,
      midNum: `28%`,
      btnColor: `#08635b`
      ,
      btnTxt: '#fffbfc',
    },
  ]
  OSRH.data.defaultLightSettings = {
    name: '',
    dim: 30,
    bright: 10,
    color: '#ff7b24',
    dur:  60,
    alpha:0.5,
    alert:  1,
    angle:  360,
    warn:  3,
    animation: 'flame',
    speed: 3,
    intensity: 5,
    coloration: '1',
    luminosity: 0.4,
    bgSat: 0,
    bgCont: 0,
    bgShadow: 0
  };
  OSRH.data.defaultRationSettings = {
    name: '',
    trackExpiration: true,
    duration: {
      value: 604800,
      type: 'day'
    } 
  };
  OSRH.data.sheetUI = {
    actor: [
      {
        title: 'Active Effects',
        icon: 'fa-sparkles',
        app: 'active-effects'
      },
      {
        title: 'Item Report',
        icon: 'fa-file-alt',
        app: 'item-report'
      },
      ,
      {
        title: 'Currency Converter',
        icon: 'fa-coins',
        app: 'currency-converter'
      }
    ],
    item: [
      {
        title: 'Item Management',
        icon: 'fa-list-check',
        app: 'item-management'
      }
    ]
  }
}; 
export const registerLocalizedData = () =>{
  OSRH.ui.controlOptions= [
    {
      id: 'turnTracker',
      label: game.i18n.localize("OSRH.ui.turnTracker"), 
      gm: false,
      function: 'util.renderTurnTracker',
      img: 'modules/osr-helper/images/icons/turn-tracker-64.png'
      // img: 'icons/magic/time/clock-stopwatch-white-blue.webp'
    },
    {
      id: 'dungeonTurn',
      label: game.i18n.localize("OSRH.ui.dungeonTurn"), 
      gm: true,
      function: 'turn.dungeonTurn',
      img: 'modules/osr-helper/images/icons/clock-64.png'
      // img: 'icons/magic/time/clock-stopwatch-white-blue.webp'
    },
    {
      id: 'dungeonRest',
      label: game.i18n.localize("OSRH.ui.dungeonRest"), 
      gm: true,
      function: 'turn.rest',
      img: 'modules/osr-helper/images/icons/tent-64.png'
    },
    {
      id: 'showTurnCount',
      label: game.i18n.localize("OSRH.ui.showTurnCount"), 
      gm: true,
      function: 'turn.showTurnCount',
      img: 'modules/osr-helper/images/icons/show-turn-64.png'
    },
    {
      id: 'resetSessionCount',
      label: game.i18n.localize("OSRH.ui.resetSession"), 
      gm: true,
      function: 'turn.resetSessionCount',
      img: 'modules/osr-helper/images/icons/reset-session-64.png'
    },
    {
      id: 'actorItemReport',
      label: game.i18n.localize("OSRH.ui.actorItemReport"), 
      gm: false,
      function: 'report.actorItem',
      img: 'modules/osr-helper/images/icons/actor-item-report-64.png'
    },
    {
      id: 'light',
      label: game.i18n.localize("OSRH.ui.light"), 
      gm: false,
      function: 'light.lightToggle',
      img: 'modules/osr-helper/images/icons/torch-64.png'
    },
    {
      id: 'lightTurnsRemaining',
      label: game.i18n.localize("OSRH.ui.lightTurnsRemaining"), 
      gm: false,
      function: 'light.turnsRemaining',
      img: 'modules/osr-helper/images/icons/light-time-64.png'
    },
    {
      id: 'eatRation',
      label: game.i18n.localize("OSRH.ui.eatRation"), 
      gm: false,
      function: 'ration.eat',
      img: 'modules/osr-helper/images/icons/turkey-leg-64.png'
    },
    {
      id: 'rationReport',
      label: game.i18n.localize("OSRH.ui.rationReport"), 
      gm: true,
      function: 'report.ration',
      img: 'modules/osr-helper/images/icons/ration-report-64.png'
    },
    {
      id: 'travelCalc',
      label: game.i18n.localize("OSRH.ui.travelCalc"), 
      gm: true,
      function: 'report.travelCalc',
      img: 'modules/osr-helper/images/icons/travel-calc-64.png'
    },
    {
      id: 'attack',
      label: game.i18n.localize("OSRH.ui.attack"), 
      gm: false,
      function: 'util.attack',
      img: 'modules/osr-helper/images/icons/attack-64.png'
    },
    // {
    //   id: 'activeEffects',
    //   label: game.i18n.localize("OSRH.effect.activeEffects"), 
    //   gm: true,
    //   function: 'effect.renderGlobalEffectApp',
    //   img: 'modules/osr-helper/images/icons/active-effects-64.png'
    // },
    
  ]
  
  if(game.user.isGM){
    OSRH.ui.controlOptions.push({
      id: 'partySheet',
      label: game.i18n.localize("OSRH.ui.partySheet"),
      gm: true,
      function: 'util.renderPartySheet',
      img: 'modules/osr-helper/images/icons/party-sheet-64.png'
    })
    if(OSRH.systemData.effects){
      OSRH.ui.controlOptions.push({
        id: 'activeEffects',
        label: game.i18n.localize("OSRH.effect.activeEffects"), 
        gm: true,
        function: 'effect.renderGlobalEffectApp',
        img: 'modules/osr-helper/images/icons/active-effects-64.png'
      })
    }
  }
  
  OSRH.ui.labels = {
      turnTracker: game.i18n.localize("OSRH.ui.turnTracker"),
      dungeonTurn: game.i18n.localize("OSRH.ui.dungeonTurn"),
      dungeonRest: game.i18n.localize("OSRH.ui.dungeonRest"),
      showTurnCount: game.i18n.localize("OSRH.ui.showTurnCount"),
      resetSession: game.i18n.localize("OSRH.ui.resetSession"),
      actorItemReport: game.i18n.localize("OSRH.ui.actorItemReport"),
      light: game.i18n.localize("OSRH.ui.light"),
      lightTurnsRemaining: game.i18n.localize("OSRH.ui.lightTurnsRemaining"),
      eatRation: game.i18n.localize("OSRH.ui.eatRation"),
      rationReport: game.i18n.localize("OSRH.ui.rationReport"),
      travelCalc: game.i18n.localize("OSRH.ui.travelCalc"),
      attack: game.i18n.localize("OSRH.ui.attack"),
    }
  
  OSRH.data.food = {
    iron: game.i18n.localize("OSRH.food.iron"),//'Rations (iron, 7 days)',
    standard: game.i18n.localize("OSRH.food.standard"),//'Rations (standard, 7 days)',
    berries: game.i18n.localize("OSRH.food.berries"),//'Foraged Rations: Berries',
    fish: game.i18n.localize("OSRH.food.fish"),//'Foraged Rations: Fish',
    fruit: game.i18n.localize("OSRH.food.fruit"),//'Foraged Rations: Fruit',
    game: game.i18n.localize("OSRH.food.game"),//'Foraged Rations: Game',
    mushroom: game.i18n.localize("OSRH.food.mushrooms"),//'Foraged Rations: Mushrooms',
    hardTack: game.i18n.localize("OSRH.food.hardTack"),//'Hard Tack (7 days)',
    freshFood: game.i18n.localize("OSRH.food.freshFood"),//'Fresh Food (7 days)',
    oglRationsStandard: game.i18n.localize("OSRH.food.oglRationsStandard"),//'Rations, standard',
    oglRationsIron: game.i18n.localize("OSRH.food.oglRationsIron"),//'Rations, iron'
  };
  

  OSRH.data.lightSource = {
    oglLantern: {
      name: game.i18n.localize("OSRH.lightItems.oilFlask"),
      dimLight: 30,
      brightLight: 10,
      duration: 240,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 4,
      alert: 2,
      animation: 'flame'
    },
    oglTorch: {
      name: game.i18n.localize("OSRH.lightItems.torch"),
      dimLight: 30,
      brightLight: 10,
      duration: 60,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 3,
      alert: 1,
      animation: 'flame'
    },
    torch: {
      name: game.i18n.localize("OSRH.lightItems.torches"),
      dimLight: 30,
      brightLight: 10,
      duration: 60,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 3,
      alert: 1,
      animation: 'flame'
    },
    lanternOil: {
      name: game.i18n.localize("OSRH.lightItems.oilOneFlask"),
      dimLight: 30,
      brightLight: 10,
      duration: 240,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 4,
      alert: 2,
      animation: 'flame'
    },
    blueMossTorch: {
      name: game.i18n.localize("OSRH.lightItems.blueMossTorch"),
      dimLight: 20,
      brightLight: 3,
      duration: 30,
      color: '#3377ff',
      secondaryColor: '#33aaaf',
      lightAlpha: 0.5,
      warn: 2,
      alert: 1,
      animation: 'flickering light'
    },
    purpleMossTorch: {
      name: game.i18n.localize("OSRH.lightItems.purpleMossTorch"),
      dimLight: 20,
      brightLight: 3,
      duration: 30,
      color: '#8833ff',
      secondaryColor: '#8877ff',
      lightAlpha: 0.5,
      warn: 2,
      alert: 1,
      animation: 'flickering light'
    },
    greenMossTorch: {
      name: game.i18n.localize("OSRH.lightItems.greenMossTorch"),
      dimLight: 20,
      brightLight: 3,
      duration: 30,
      color: '#33bf55',
      secondaryColor: '#33f355',
      lightAlpha: 0.5,
      warn: 2,
      alert: 1,
      animation: 'flickering light'
    },
    improvisedTorch: {
      name: game.i18n.localize("OSRH.lightItems.improvTorch"),
      dimLight: 20,
      brightLight: 10,
      duration: 30,
      color: '#e5f32b',
      secondaryColor: '#a3bb2b',
      lightAlpha: 0.5,
      warn: 2,
      alert: 1,
      animation: 'flickering light'
    },
    lowQualOil: {
      name: game.i18n.localize("OSRH.lightItems.lowQualOil"),
      dimLight: 20,
      brightLight: 10,
      duration: 120,
      color: '#eac32b',
      secondaryColor: '#cccf2b',
      lightAlpha: 0.5,
      warn: 4,
      alert: 2,
      animation: 'flickering light'
    },
    standardQualOil: {
      name: game.i18n.localize("OSRH.lightItems.standardQualOil"),
      dimLight: 30,
      brightLight: 10,
      duration: 240,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 4,
      alert: 2,
      animation: 'flame'
    },
    highQualOil: {
      name: game.i18n.localize("OSRH.lightItems.highQualOil"),
      dimLight: 30,
      brightLight: 10,
      duration: 360,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.11,
      warn: 4,
      alert: 2,
      animation: 'flame'
    },
    standardTorch: {
      name: game.i18n.localize("OSRH.lightItems.standardTorch"),
      dimLight: 30,
      brightLight: 10,
      duration: 60,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 3,
      alert: 1,
      animation: 'flame'
    },
    CCcandles: {
      name: game.i18n.localize("OSRH.lightItems.candles"),
      dimLight: 5,
      brightLight: 0,
      duration: 60,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 3,
      alert: 1,
      animation: 'flame'
    }
  };

  OSRH.data.helperItems = [
    {
      source: 'osrHelper',
      type: 'light source',
      name: game.i18n.localize("OSRH.lightItems.blueMossTorch"),//'Blue Moss Torch (3)',
      cost: 1,
      maxAllowed: 1,
      qty: 3,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh001'
    },
    {
      source: 'osrHelper',
      type: 'light source',
      name: game.i18n.localize("OSRH.lightItems.purpleMossTorch"),//'Purple Moss Torch (3)',
      cost: 1,
      maxAllowed: 1,
      qty: 3,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh002'
    },
    {
      source: 'osrHelper',
      type: 'light source',
      name: game.i18n.localize("OSRH.lightItems.greenMossTorch"),//'Green Moss Torch (3)',
      cost: 1,
      maxAllowed: 1,
      qty: 3,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh003'
    },
    {
      source: 'osrHelper',
      type: 'light source',
      name: game.i18n.localize("OSRH.lightItems.lowQualOil"),//'Low Quality Oil (1 flask)',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh004'
    },
    {
      source: 'osrHelper',
      type: 'light source',
      name: game.i18n.localize("OSRH.lightItems.standardQualOil"),//'Standard Quality Oil (1 flask)',
      cost: 2,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh005'
    },
    {
      source: 'osrHelper',
      type: 'light source',
      name: game.i18n.localize("OSRH.lightItems.lowQualOil"),//'Low Quality Oil (1 flask)',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh006'
    },
    {
      source: 'osrHelper',
      type: 'light source',
      name: game.i18n.localize("OSRH.lightItems.highQualOil"),//'High Quality Oil (1 flask)',
      cost: 5,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh007'
    },
    {
      source: 'osrHelper',
      type: 'food',
      name: game.i18n.localize("OSRH.food.berries"),//'Foraged Rations: Berries',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh008'
    },
    {
      source: 'osrHelper',
      type: 'food',
      name: game.i18n.localize("OSRH.food.fish"),//'Foraged Rations: Fish',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh009'
    },
    {
      source: 'osrHelper',
      type: 'food',
      name: game.i18n.localize("OSRH.food.game"),//'Foraged Rations: Game',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh010'
    },
    {
      source: 'osrHelper',
      type: 'food',
      name: game.i18n.localize("OSRH.food.fruit"),//'Foraged Rations: Fruit',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh011'
    },
    {
      source: 'osrHelper',
      type: 'food',
      name: game.i18n.localize("OSRH.food.mushrooms"),//'Foraged Rations: Mushrooms',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh012'
    },
    {
      source: 'osrHelper',
      type: 'food',
      name: game.i18n.localize("OSRH.food.freshFood"),//'Fresh Food (7 days)',
      cost: 5,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh013'
    },
    {
      source: 'osrHelper',
      type: 'food',
      name: game.i18n.localize("OSRH.food.hardTack"),//'Hard Tack (7 days)',
      cost: 15,
      maxAllowed: 1,
      qty: 1,
      stack: false,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh014'
    }
  ];
  // update localization after item shop/character builder
  OSRH.data.ammoData = [
    {
      name: game.i18n.localize("OSRH.ammunition.shortbow"),
      ammoType: game.i18n.localize("OSRH.ammunition.arrows"), 
    },
    {
      name: game.i18n.localize("OSRH.ammunition.longbow"),
      ammoType: game.i18n.localize("OSRH.ammunition.arrows"), 
    },
    {
      name: game.i18n.localize("OSRH.ammunition.crossbow"),
      ammoType: game.i18n.localize("OSRH.ammunition.bolts"),
    },
    {
      name: game.i18n.localize("OSRH.ammunition.sling"),
      ammoType: game.i18n.localize("OSRH.ammunition.stones"),
    },
    {
      name: game.i18n.localize("OSRH.ammunition.matchlock.blunderbus"),
      ammoType: game.i18n.localize("OSRH.ammunition.pouch"),
    },
    {
      name: game.i18n.localize("OSRH.ammunition.matchlock.heavyMusket"),
      ammoType: game.i18n.localize("OSRH.ammunition.pouch"),
    },
    {
      name: game.i18n.localize("OSRH.ammunition.matchlock.musket"),
      ammoType: game.i18n.localize("OSRH.ammunition.pouch"),
    },
    {
      name: game.i18n.localize("OSRH.ammunition.matchlock.pistol"),
      ammoType: game.i18n.localize("OSRH.ammunition.pouch"),
    },
    {
      name: game.i18n.localize("OSRH.ammunition.wheelLock.blunderbuss"),
      ammoType: game.i18n.localize("OSRH.ammunition.pouch"),
    },
    {
      name: game.i18n.localize("OSRH.ammunition.wheelLock.heavyMusket"),
      ammoType: game.i18n.localize("OSRH.ammunition.pouch"),
    },
    {
      name: game.i18n.localize("OSRH.ammunition.wheelLock.pistol"),
      ammoType: game.i18n.localize("OSRH.ammunition.pouch"),
    },
    {
      name: game.i18n.localize("OSRH.ammunition.wheelLock.musket"),
      ammoType: game.i18n.localize("OSRH.ammunition.pouch"),
    },

    
  ]
}
