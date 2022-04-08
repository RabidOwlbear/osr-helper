export const registerData = () => {
  OSRH.data = OSRH.data || {};
  OSRH.data.food = {
    iron: 'Rations (iron, 7 days)',
    standard: 'Rations (standard, 7 days)',
    berries: 'Foraged Rations: Berries',
    fish: 'Foraged Rations: Fish',
    fruit: 'Foraged Rations: Fruit',
    game: 'Foraged Rations: Game',
    mushroom: 'Foraged Rations: Mushrooms',
    hardTack: 'Hard Tack (7 days)',
    freshFood: 'Fresh Food (7 days)',
    oglRationsStandard: 'Rations, standard',
    oglRationsIron: 'Rations, iron'
  };
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
      glow: `#e9ffde`,
      midNum: `30%`,
      btnColor: `#e9ffde`
    },
    {
      name: 'sante fe mall',
      c1: `#7bcbcc`,
      c2: `#f8ebcf`,
      c3: `#f8d6c6`,
      bg: `#aecccc`,
      glow: `#fbefda`,
      midNum: `32%`,
      btnColor: `#ffffff`
    },
    {
      name: 'deep blue',
      c1: `#5549b9`,
      c2: `#4f7adb`,
      c3: `#93eafb`,
      bg: `#4039c990`,
      glow: `#93eafb`,
      midNum: `20%`,
      btnColor: `#ddeeff`
    },
    {
      name: 'green slime',
      c1: `#a27dba`,
      c2: `#b2ffb5`,
      c3: `#ddffcd`,
      bg: `#a27dba`,
      glow: `#ddffcd`,
      midNum: `28%`,
      btnColor: `#ddffcd`
    },
    {
      name: 'cotton candy',
      c1: `#ec5cda`,
      c2: `#f9b2ff`,
      c3: `#ffeaef`,
      bg: `#ec5cda`,
      glow: `#ffeaef`,
      midNum: `24%`,
      btnColor: `#ffffff`
    },
    {
      name: 'pale sunrise',
      c1: `#fffbc0`,
      c2: `#c6fef1`,
      c3: `#eafaff`,
      bg: `#fffbc0`,
      glow: `#88eefd`,
      midNum: `28%`,
      btnColor: `#003747`
    },
  ]

  OSRH.data.lightSource = {
    oglLantern: {
      name: 'Oil flask',
      dimLight: 30,
      brightLight: 10,
      duration: 240,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 4,
      alert: 2
    },
    oglTorch: {
      name: 'Torch',
      dimLight: 30,
      brightLight: 10,
      duration: 60,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 3,
      alert: 1
    },
    torch: {
      name: 'Torches (6)',
      dimLight: 30,
      brightLight: 10,
      duration: 60,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 3,
      alert: 1
    },
    lanternOil: {
      name: 'Oil (1 flask)',
      dimLight: 30,
      brightLight: 10,
      duration: 240,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 4,
      alert: 2
    },
    blueMossTorch: {
      name: 'Blue Moss Torch (3)',
      dimLight: 20,
      brightLight: 3,
      duration: 30,
      color: '#3377ff',
      secondaryColor: '#33aaaf',
      lightAlpha: 0.5,
      warn: 2,
      alert: 1
    },
    purpleMossTorch: {
      name: 'Purple Moss Torch (3)',
      dimLight: 20,
      brightLight: 3,
      duration: 30,
      color: '#8833ff',
      secondaryColor: '#8877ff',
      lightAlpha: 0.5,
      warn: 2,
      alert: 1
    },
    greenMossTorch: {
      name: 'Green Moss Torch (3)',
      dimLight: 20,
      brightLight: 3,
      duration: 30,
      color: '#33bf55',
      secondaryColor: '#33f355',
      lightAlpha: 0.5,
      warn: 2,
      alert: 1
    },
    improvisedTorch: {
      name: 'Improvised Torch (1)',
      dimLight: 20,
      brightLight: 10,
      duration: 30,
      color: '#e5f32b',
      secondaryColor: '#a3bb2b',
      lightAlpha: 0.5,
      warn: 2,
      alert: 1
    },
    lowQualOil: {
      name: 'Low Quality Oil (1 flask)',
      dimLight: 20,
      brightLight: 10,
      duration: 120,
      color: '#eac32b',
      secondaryColor: '#cccf2b',
      lightAlpha: 0.5,
      warn: 4,
      alert: 2
    },
    standardQualOil: {
      name: 'Standard Quality Oil (1 flask)',
      dimLight: 30,
      brightLight: 10,
      duration: 240,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 4,
      alert: 2
    },
    highQualOil: {
      name: 'High Quality Oil (1 flask)',
      dimLight: 30,
      brightLight: 10,
      duration: 360,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.11,
      warn: 4,
      alert: 2
    },
    standardTorch: {
      name: 'Standard Torches (6)',
      dimLight: 30,
      brightLight: 10,
      duration: 60,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 3,
      alert: 1
    },
    CCcandles: {
      name: 'Candles (10)',
      dimLight: 5,
      brightLight: 0,
      duration: 60,
      color: '#ff7b24',
      secondaryColor: '#fa9924',
      lightAlpha: 0.5,
      warn: 3,
      alert: 1
    }
  };

  OSRH.data.helperItems = [
    {
      source: 'osrHelper',
      type: 'light source',
      name: 'Blue Moss Torch (3)',
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
      name: 'Purple Moss Torch (3)',
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
      name: 'Green Moss Torch (3)',
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
      name: 'Low Quality Oil (1 flask)',
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
      name: 'Standard Quality Oil (1 flask)',
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
      name: 'Low Quality Oil (1 flask)',
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
      name: 'High Quality Oil (1 flask)',
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
      name: 'Foraged Rations: Berries',
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
      name: 'Foraged Rations: Fish',
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
      name: 'Foraged Rations: Game',
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
      name: 'Foraged Rations: Fruit',
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
      name: 'Foraged Rations: Mushrooms',
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
      name: 'Fresh Food (7 days)',
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
      name: 'Hard Tack (7 days)',
      cost: 15,
      maxAllowed: 1,
      qty: 1,
      stack: false,
      pack: `${OSRH.moduleName}.${OSRH.moduleName}-items`,
      id: 'osrh014'
    }
  ];
  OSRH.data.ammoData = [
    {
      name: 'Shortbow',
      ammoType: 'Arrows (quiver of 20)', 
    },
    {
      name: 'Longbow',
      ammoType: 'Arrows (quiver of 20)', 
    },
    {
      name: 'Crossbow',
      ammoType: 'Crossbow bolts (case of 30)',
    },
    {
      name: 'Sling',
      ammoType: 'Sling Stones',
    },
    {
      name: 'Matchlock blunderbuss',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Matchlock heavy musket',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Matchlock musket',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Matchlock pistol',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Wheellock blunderbuss',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Wheellock heavy musket',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Wheellock musket',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Wheellock pistol',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Wheellock blunderbuss',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Wheellock heavy musket',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Wheellock musket',
      ammoType: 'Ammunition pouch',
    },
    {
      name: 'Wheellock pistol',
      ammoType: 'Ammunition pouch',
    },
    
  ]
};
