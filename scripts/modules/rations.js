export const registerRations = () => {
  OSRH.ration = OSRH.ration || {};

  // OSRH.ration.rationTrackingInit = async function () {
  //   const foldernames = ['Active Characters', 'Active Retainers'];
  //   const actorIds = [];
  //   for (let name of foldernames) {
  //     let folder = game.folders.getName(name);
  //     if (!folder) {
  //       folder = await Folder.create({
  //         name: name,
  //         type: 'Actor',
  //         // parent: 'OMbaST8BhMtHx2zT',
  //         color: '#006688'
  //       });
  //       console.log(`${OSRH.moduleName}: No ${name} Folder Found.
  //   Folder Named ${name} Created.`);
  //     }

  //     //folder = game.folders.getName(folderName);
  //     for (let actor of folder.content) {
  //       actorIds.push(actor?.id);
  //     }
  //   }

  //   return actorIds;
  // };

  // OSRH.ration.checkRations = async function (arr) {
  //   for (let id of arr) {
  //     const actor = game.actors.find((a) => a.id == id);
  //   }
  // };


  /* 
data: {
  character: array containing player character names to be checked,
  retainer: array containing the names of all active retainers to be checked.
  whisper: boolean true send message via whisper
}
*/



  OSRH.ration.eat = async function (actorId=null) {
    if(!actorId){
      if(OSRH.util.singleSelected()){
        actorId = canvas.tokens.controlled[0].actor.id
      }else{
        return
      }
    }
    const actor = await game.actors.find((a) => a.id == actorId);
    let rationOptions = '';
    console.log("items", actor.items)
    for (let type in OSRH.data.food) {
      // console.log(type, OSRH.data.food[type])
      const item = actor.items.getName(OSRH.data.food[type]);
      if (item) {
        rationOptions += `<option value="${item.name}">${item.name}: ${item.system.quantity.value}</option>`;
      }
    }

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
          callback: async (html) => {
            let item = actor.items.getName(html.find('#ration')[0].value);
            let itemQty = item.system.quantity.value - 1;
            console.log('item', itemQty)
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
        },
        close: {
          label: game.i18n.localize("OSRH.customEffect.close"),
        }
      }
    }).render(true);
  };
};