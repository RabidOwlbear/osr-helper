const oseFood = {
  iron: 'Rations (iron, 7 days)',
  standard: 'Rations (standard, 7 days)',
  berries: 'Foraged Rations: Berries',
  fish: 'Foraged Rations: Fish',
  fruit: 'Foraged Rations: Fruit',
  game: 'Foraged Rations: Game',
  mushroom: 'Foraged Rations: Mushrooms',
  hardTack: 'Hard Tack (7 days)',
  freshFood: 'Fresh Food (7 days)'
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
const oseLight = {
  oglLantern: {
    name: 'Lantern',
    dimLight: 30,
    brightLight: 5,
    duration: 240,
    color: '#ff7b24',
    secondaryColor: '#fa9924',
    lightAlpha: 0.09,
    warn: 4,
    alert: 2
  },
  oglTorch: {
    name: 'Torch',
    dimLight: 30,
    brightLight: 5,
    duration: 60,
    color: '#ff7b24',
    secondaryColor: '#fa9924',
    lightAlpha: 0.09,
    warn: 3,
    alert: 1
  },
  torch: {
    name: 'Torches (6)',
    dimLight: 30,
    brightLight: 5,
    duration: 60,
    color: '#ff7b24',
    secondaryColor: '#fa9924',
    lightAlpha: 0.09,
    warn: 3,
    alert: 1
  },
  lanternOil: {
    name: 'Oil (1 flask)',
    dimLight: 30,
    brightLight: 5,
    duration: 240,
    color: '#ff7b24',
    secondaryColor: '#fa9924',
    lightAlpha: 0.09,
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
    lightAlpha: 0.09,
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
    lightAlpha: 0.09,
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
    lightAlpha: 0.09,
    warn: 2,
    alert: 1
  },
  improvisedTorch: {
    name: 'Improvised Torch (1)',
    dimLight: 20,
    brightLight: 5,
    duration: 30,
    color: '#e5f32b',
    secondaryColor: '#a3bb2b',
    lightAlpha: 0.09,
    warn: 2,
    alert: 1
  },
  lowQualOil: {
    name: 'Low Quality Oil (1 flask)',
    dimLight: 20,
    brightLight: 5,
    duration: 120,
    color: '#eac32b',
    secondaryColor: '#cccf2b',
    lightAlpha: 0.09,
    warn: 4,
    alert: 2
  },
  standardQualOil: {
    name: 'Standard Quality Oil (1 flask)',
    dimLight: 30,
    brightLight: 5,
    duration: 240,
    color: '#ff7b24',
    secondaryColor: '#fa9924',
    lightAlpha: 0.09,
    warn: 4,
    alert: 2
  },
  highQualOil: {
    name: 'High Quality Oil (1 flask)',
    dimLight: 30,
    brightLight: 5,
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
    brightLight: 5,
    duration: 60,
    color: '#ff7b24',
    secondaryColor: '#fa9924',
    lightAlpha: 0.09,
    warn: 3,
    alert: 1
  }
};
