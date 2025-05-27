export async function migrateSavedEffects(){
  const effectList = foundry.utils.deepClone(await game.settings.get(OSRH.moduleName, 'savedEffects'));
  const savedEffectList = foundry.utils.deepClone(await game.settings.get(OSRH.moduleName, 'effectPresets'));
  const keys = Object.keys(effectList);
  if(keys.length){
    keys.map(k=>{
      savedEffectList.push(migrateEffect(effectList[k]));
    })
    game.settings.set(OSRH.moduleName, 'effectPresets', savedEffectList);
    game.settings.set(OSRH.moduleName, 'savedEffects', {});  
  }
  
}
function migrateEffect(obj){
  let paths = {
      str: {label: "Str Value", path: "system.scores.str.value"},
      int: {label: "Int Value", path: "system.scores.int.value"},
      wis: {label: "Wis Value", path: "system.scores.wis.value"},
      dex: {label: "Dex Value", path: "system.scores.dex.value"},
      con: {label: "Con Value", path: "system.scores.con.value"},
      cha: {label: "Cha Value", path: "system.scores.cha.value"},
      breath: {label: "Breath mod", path: "system.saves.breath.value"},
      death: {label: "Death mod", path: "system.saves.death.value"},
      paralysis: {label: "Paralysis mod", path: "system.saves.paralysis.value"},
      spell: {label: "Spell mod", path: "system.saves.spell.value"},
      wand: {label: "Wand mod", path: "system.saves.wand.value"},
      thac0: {label: "Thac0 Value", path: "system.thac0.value"},
      melee: {label: "Melee Mod", path: "system.thac0.mod.melee"},
      ranged: {label: "Ranged Mod", path: "system.thac0.mod.missile"},
      ac: {label: "AC Mod", path: "system.ac.mod"},
      "hp-max": {label: "HP Max", path: "system.hp.max"},
      "hp-val":  {label: "HP Value", path: "system.hp.value"},
      init: {label: "Initiative Mod", path: "system.init.mod"},
  }
  let keys = Object.keys(obj);
  let retObj = {
      id: obj.id,
      name: obj.name,
      icon: obj.icon === 'none'? 'book': obj.icon,
      duration: obj.duration,
      description: obj.descrip,
      target: obj.target == 'targeted' ? 'target': obj.target,
      interval: obj.durInt,
      changes:[]
      
  }
  keys.map(k=>{
      let keyObj = paths[k];
      if(keyObj && obj[k] != 0){
          retObj.changes.push({
              label: keyObj.label,
              path: keyObj.path,
              value: obj[k]
          })
      }
  })
  return retObj
}