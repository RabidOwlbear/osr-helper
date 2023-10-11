export async function registerSystemData(){

  OSRH.systemData = {
    "dcc": {
      tags: false,
      lightItemTypes: ['weapon','equipment', 'armor'],
      rationItemTypes: ['equipment'],
      itemSheetHook:"renderItemSheet",
      characterSheetHook:"renderActorSheet",
      paths: {
        itemQty: "system.quantity"
      }
    },
    "ose": {
      tags: true,
      lightItemTypes: ['weapon','item', 'armor'],
      rationItemTypes: ['item'],
      itemSheetHook:"renderItemSheet",
      characterSheetHook:"renderActorSheet",
      paths: {
        itemQty: "system.quantity.value"
      }
    },
    "wwn": {
      tags: false,
      lightItemTypes: ['weapon','item', 'armor'],
      rationItemTypes: ['item'],
      itemSheetHook:"renderItemSheet",
      characterSheetHook:"renderActorSheet",
      paths: {
        itemQty: "system.quantity"
      }
    },
    "bfs": {
      tags: true,
      lightItemTypes: ['weapon','item', 'armor'],
      rationItemTypes: ['item'],
      itemSheetHook:"renderItemSheet",
      characterSheetHook:"renderActorSheet",
      paths: {
        itemQty: "system.quantity.value"
      }
    },
    "hyperborea": {
      tags: true,
      lightItemTypes: ['weapon','item', 'armor'],
      rationItemTypes: ['item'],
      itemSheetHook:"renderItemSheet",
      characterSheetHook:"renderActorSheet",
      paths: {
        itemQty: "system.quantity.value"
      }
    }
  }


}
