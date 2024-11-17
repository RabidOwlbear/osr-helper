export async function registerSystemData() {
  switch (game.system.id) {
    case 'dcc':
      OSRH.systemData = {
        id: 'dcc',
        tags: false,
        partySheet: false,
        lightItemTypes: ['weapon', 'equipment', 'armor'],
        rationItemTypes: ['equipment'],
        itemSheetHook: 'renderItemSheet',
        characterSheetHook: 'renderActorSheet',
        partyTypes: ['Player', 'NPC'],
        baseMovMod: 4,
        effects: true,
        spellDamage: true,
        paths: {
          weaponDamage: 'system.damage',
          itemQty: 'system.quantity',
          encMov: 'system.attributes.speed.base',
          hp: {
            val: 'system.attributes.hp.value',
            max: 'system.attributes.hp.max'
          },
          ac: 'system.attributes.ac.value'
        }
      };
      break;

    case 'ose':
      OSRH.systemData = {
        id: 'ose',
        tags: true,
        partySheet: true,
        lightItemTypes: ['weapon', 'item', 'armor'],
        rationItemTypes: ['item'],
        itemSheetHook: 'renderItemSheet',
        characterSheetHook: 'renderActorSheet',
        partyTypes: ['character'],
        baseMovMod: 3,
        effects: true,
        spellDamage: true,
        paths: {
          weaponDamage: 'system.damage',
          itemQty: 'system.quantity.value',
          encMov: 'system.movement.encounter',
          hp: {
            val: 'system.hp.value',
            max: 'system.hp.max'
          },
          ac: game.settings.get('ose', 'ascendingAC') ? 'system.aac.value' : 'system.ac.value'
        }
      };
      break;

    case 'ose-dev':
      OSRH.systemData = {
        id: 'ose-dev',
        tags: true,
        partySheet: true,
        lightItemTypes: ['weapon', 'item', 'armor'],
        rationItemTypes: ['item'],
        itemSheetHook: 'renderItemSheet',
        characterSheetHook: 'renderActorSheet',
        partyTypes: ['character'],
        baseMovMod: 3,
        effects: true,
        spellDamage: true,
        paths: {
          weaponDamage: 'system.damage',
          itemQty: 'system.quantity.value',
          encMov: 'system.movement.encounter',
          hp: {
            val: 'system.hp.value',
            max: 'system.hp.max'
          },
          ac: game.settings.get('ose', 'ascendingAC') ? 'system.aac.value' : 'system.ac.value'
        }
      };
      break;

    case 'wwn':
      OSRH.systemData = {
        id: 'wwn',
        tags: false,
        partySheet: true,
        lightItemTypes: ['weapon', 'item', 'armor'],
        rationItemTypes: ['item'],
        itemSheetHook: 'renderItemSheet',
        characterSheetHook: 'renderActorSheet',
        partyTypes: ['character'],
        baseMovMod: 4,
        effects: true,
        spellDamage: true,
        paths: {
          weaponDamage: 'system.damage',
          itemQty: 'system.quantity',
          encMov: 'system.movement.base',
          hp: {
            val: 'system.hp.value',
            max: 'system.hp.max'
          },
          ac: 'system.aac.value'
        }
      };
      break;

    case 'bfs':
      OSRH.systemData = {
        id: 'bfs',
        tags: true,
        partySheet: true,
        lightItemTypes: ['weapon', 'item', 'armor'],
        rationItemTypes: ['item'],
        itemSheetHook: 'renderItemSheet',
        characterSheetHook: 'renderActorSheet',
        partyTypes: ['character'],
        baseMovMod: 3,
        effects: false,
        paths: {
          weaponDamage: 'system.damage',
          itemQty: 'system.quantity.value',
          encMov: 'system.movement.encounter',
          hp: {
            val: 'system.hp.value',
            max: 'system.hp.max'
          },
          ac: 'system.ac.value'
        }
      };
      break;

    case 'hyperborea':
      OSRH.systemData = {
        id: 'hyperborea',
        tags: false,
        partySheet: true,
        lightItemTypes: ['weapon', 'item', 'armor'],
        rationItemTypes: ['item'],
        itemSheetHook: 'renderItemSheet',
        characterSheetHook: 'renderActorSheet',
        partyTypes: ['character'],
        baseMovMod: 3,
        effects: true,
        spellDamage: false,
        paths: {
          weaponDamage: 'system.damage',
          itemQty: 'system.quantity.value',
          encMov: 'system.movement.base',
          hp: {
            val: 'system.hp.value',
            max: 'system.hp.max'
          },
          ac: 'system.ac.value'
        }
      };
      break;
    case 'basicfantasyrpg':
      OSRH.systemData = {
        id: 'basicfantasyrpg',
        tags: false,
        partySheet: true,
        lightItemTypes: ['weapon', 'item', 'armor'],
        rationItemTypes: ['item'],
        itemSheetHook: 'renderItemSheet',
        characterSheetHook: 'renderActorSheet',
        partyTypes: ['character'],
        baseMovMod: 3,
        effects: true,
        spellDamage: true,
        paths: {
          weaponDamage: 'system.damage.value',
          itemQty: 'system.quantity.value',
          encMov: 'system.move.value',
          hp: {
            val: 'system.hitPoints.value',
            max: 'system.hitPoints.max'
          },
          ac: 'system.armorClass.value'
        }
      };
      break;
    default:
      OSRH.systemData = null;
  }
}
