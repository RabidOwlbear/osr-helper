Hooks.on('ready', () => {
  OSEH.data = OSEH.data || {};

  OSEH.data.food = {
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
  OSEH.data.lightSource = {
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

  OSEH.data.helperItems = [
    {
      source: 'oseHelper',
      type: 'light source',
      name: 'Blue Moss Torch (3)',
      cost: 1,
      maxAllowed: 1,
      qty: 3,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh001'
    },
    {
      source: 'oseHelper',
      type: 'light source',
      name: 'Purple Moss Torch (3)',
      cost: 1,
      maxAllowed: 1,
      qty: 3,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh002'
    },
    {
      source: 'oseHelper',
      type: 'light source',
      name: 'Green Moss Torch (3)',
      cost: 1,
      maxAllowed: 1,
      qty: 3,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh003'
    },
    {
      source: 'oseHelper',
      type: 'light source',
      name: 'Low Quality Oil (1 flask)',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh004'
    },
    {
      source: 'oseHelper',
      type: 'light source',
      name: 'Standard Quality Oil (1 flask)',
      cost: 2,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh005'
    },
    {
      source: 'oseHelper',
      type: 'light source',
      name: 'Low Quality Oil (1 flask)',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh006'
    },
    {
      source: 'oseHelper',
      type: 'light source',
      name: 'High Quality Oil (1 flask)',
      cost: 5,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh007'
    },
    {
      source: 'oseHelper',
      type: 'food',
      name: 'Foraged Rations: Berries',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh008'
    },
    {
      source: 'oseHelper',
      type: 'food',
      name: 'Foraged Rations: Fish',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh009'
    },
    {
      source: 'oseHelper',
      type: 'food',
      name: 'Foraged Rations: Game',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh010'
    },
    {
      source: 'oseHelper',
      type: 'food',
      name: 'Foraged Rations: Fruit',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh011'
    },
    {
      source: 'oseHelper',
      type: 'food',
      name: 'Foraged Rations: Mushrooms',
      cost: 1,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh012'
    },
    {
      source: 'oseHelper',
      type: 'food',
      name: 'Fresh Food (7 days)',
      cost: 5,
      maxAllowed: 1,
      qty: 1,
      stack: true,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh013'
    },
    {
      source: 'oseHelper',
      type: 'food',
      name: 'Hard Tack (7 days)',
      cost: 15,
      maxAllowed: 1,
      qty: 1,
      stack: false,
      pack: 'OSE-helper.OSE-helper-items',
      id: 'oseh014'
    }
  ];
});
