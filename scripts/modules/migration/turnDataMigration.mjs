export async function migrateTurnData() {
  let turnData = foundry.utils.deepClone(await game.settings.get('osr-helper', 'turnData'));
  const dungeonTurnData = await game.settings.get('osr-helper', 'dungeonTurnData');
  let hasDungeon = turnData.hasOwnProperty('dungeon');
  let hasTravel = turnData.hasOwnProperty('travel');
  let hasEncTable = turnData.hasOwnProperty('eTable');
  let hasEncTables = turnData.hasOwnProperty('eTables');
  let hasGlobal = turnData.hasOwnProperty('global')
  let newData;
 
  if (hasDungeon && hasTravel) {
    return;
  }
  if (!hasEncTable && dungeonTurnData) {
    turnData = foundry.utils.mergeObject(turnData, dungeonTurnData);
    turnData.eTables = [dungeonTurnData.eTable, 'none', 'none', 'none', 'none', 'none', 'none', 'none'];
    turnData.lvl = 1;
    turnData.walkCount = 1;
    turnData.rSprite = false;

    hasEncTables = true;
  }

  if (!hasDungeon && hasEncTables) {
    newData = {
      journalName: turnData.journalName,
      dungeon: {
        lvl: turnData.lvl,
        proc: turnData.proc,
        procCount: turnData.procCount,
        eTables: turnData.eTables,
        rSprite: turnData.rSprite,
        rTable: turnData.rTable,
        rest: turnData.rest,
        restWarnCount: turnData.restWarnCount,
        rollEnc: turnData.rollEnc,
        rollReact: turnData.rollReact,
        rollTarget: turnData.rollTarget,
        session: turnData.session,
        total: turnData.total,
        walkCount: 1
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
    };
    if(!hasGlobal){
      newData.global = { trackRationExp: false }
    }
    await game.settings.set('osr-helper', 'turnData', newData);
    ui.notifications.notify('Turn Data Successcully Migrated.');
  }
}
