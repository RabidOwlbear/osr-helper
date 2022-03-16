export const registerRations = () => {
  OSEH.ration = OSEH.ration || {};

  OSEH.ration.rationTrackingInit = async function () {
    const foldernames = ['Active Characters', 'Active Retainers'];
    const actorIds = [];
    for (let name of foldernames) {
      let folder = game.folders.getName(name);
      if (!folder) {
        folder = await Folder.create({
          name: name,
          type: 'Actor',
          // parent: 'OMbaST8BhMtHx2zT',
          color: '#006688'
        });
        console.log(`OSE-helper: No ${name} Folder Found.
    Folder Named ${name} Created.`);
      }

      //folder = game.folders.getName(folderName);
      for (let actor of folder.content) {
        actorIds.push(actor?.id);
      }
    }

    return actorIds;
  };

  OSEH.ration.checkRations = async function (arr) {
    for (let id of arr) {
      const actor = game.actors.find((a) => a.id == id);
    }
  };


  /* 
data: {
  character: array containing player character names to be checked,
  retainer: array containing the names of all active retainers to be checked.
  whisper: boolean true send message via whisper
}
*/



  OSEH.ration.eat = async function (actorId) {
    const actor = await game.actors.find((a) => a.id == actorId);
    let rationOptions = '';
    for (let type in OSEH.data.food) {
      const item = actor.data.items.getName(OSEH.data.food[type]);
      if (item) {
        rationOptions += `<option value="${item.name}">${item.name}: ${item.data.data.quantity.value}</option>`;
      }
    }

    let dialogTemplate = `
  <h1> Pick a Ration Type </h1>
  <div style="display:flex">
    <div  style="flex:1"><select id="ration">${rationOptions}</select></div>
    </div>`;
    new Dialog({
      title: 'Eat Ration',
      content: dialogTemplate,
      buttons: {
        rollAtk: {
          label: 'Eat Ration',
          callback: async (html) => {
            let item = actor.items.getName(html.find('#ration')[0].value);
            let itemQty = item.data.data.quantity.value - 1;
            if (itemQty <= 0) {
              await item.delete();
            } else {
              await item.update({
                data: {
                  quantity: {
                    value: itemQty
                  }
                }
              });
            }
          }
        },
        close: {
          label: 'Close'
        }
      }
    }).render(true);
  };
};