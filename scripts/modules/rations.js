export const registerRations = () => {
  OSRH.ration = OSRH.ration || {};

  /* 
data: {
  character: array containing player character names to be checked,
  retainer: array containing the names of all active retainers to be checked.
  whisper: boolean true send message via whisper
}
*/



  OSRH.ration.eat = async function (actorId=null) {
    const tags = OSRH.systemData.tags;
    const qPath = OSRH.systemData.paths.itemQty;
    let actor
    if(!actorId){
      if(OSRH.util.singleSelected()){
        actor = canvas.tokens.controlled[0].actor
      }else{
        actor = await game.actors.find((a) => a.id == actorId)
      }
    }
    // let actor = await game.actors.find((a) => a.id == actorId);
    // const rationItems = await actor.items.find()
    console.log(actor)
    let rationOptions = '';
    actor.items.map(i=>{
      let isRat 
      if(tags) {
        isRat = i.system.tags.find(t=>t.title === 'Ration') ? true : false
      }
      else {
        isRat = i.flags?.['osr-helper']?.itemType === 'ration'
      };
      if(isRat){
        rationOptions += `<option value="${i.name}">${i.name}: ${OSRH.util.getNestedValue(i , qPath)}</option>`
      }
    })
    
    // for (let type in OSRH.data.food) {
    //   // console.log(type, OSRH.data.food[type])
    //   const item = actor.items.getName(OSRH.data.food[type]);
    //   if (item) {
    //     rationOptions += `<option value="${item.name}">${item.name}: ${item.system.quantity.value}</option>`;
    //   }
    // }

    let dialogTemplate = `
    <h1> ${game.i18n.localize("OSRH.ration.pickType")}</h1>
    <div style="display:flex">
    <div  style="flex:1"><select id="ration">${rationOptions}</select></div>
    </div>`;
    new Dialog({
      title: game.i18n.localize("OSRH.ration.eatRation"),
      content: dialogTemplate,
      buttons: {
        rollAtk: {
          label: game.i18n.localize("OSRH.ration.eatRation"),
          callback: async function(html){
            
            let item = actor.items.getName(html.find('#ration')[0].value);
            let itemQty = OSRH.util.getNestedValue(item, qPath) - 1;
            if (itemQty <= 0) {
              await item.delete();
            } else {
              await item.update({[qPath ]: itemQty})
            }
          }
        },
        close: {
          label: game.i18n.localize("OSRH.customEffect.close"),
        }
      }
    }).render(true);
  };
};
/*
async (html) => {
            let item = actor.items.getName(html.find('#ration')[0].value);
            let itemQty = item.system.quantity.value - 1;
            if (itemQty <= 0) {
              await item.delete();
            } else {
              await item.update({
                system: {
                  quantity: {
                    value: itemQty
                  }
                }
              });
            }
          }
*/