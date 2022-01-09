Hooks.on('ready', () => {
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
        console.log(actor);
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
{
  actorName: string,
}


*/
  OSEH.ration.actorReport = async function (data) {
    console.log(data);
    const actor = game.actors.getName(data.actorName);
    const Rations = [];
    const Lights = [];

    for (let key in OSEH.data.food) {
      Rations.push(key);
    }
    for (let key in OSEH.data.lightSource) {
      Lights.push(key);
    }
    let totalRations = 0;
    const msgData = {
      food: '',
      light: ''
    };
    console.log(Rations, Lights);

    for (let name of Rations) {
      let actorItem = '';
      console.log('name', name, 'actorItem', actorItem);

      let ration = actor.data.items.getName(OSEH.data.food[name]);
      console.log(ration);
      if (ration) {
        const qty = ration.data.data.quantity.value;
        console.log(name, qty, 'name, quantity');
        totalRations += qty;
        style = 'color: green';
        if (qty <= 2) style = 'color: orangered';
        if (qty <= 1) style = 'color: red';
        actorItem += `<li><span style="${style}">${OSEH.data.food[name]}: ${qty}</span></li>`;
        msgData.food += `<div><p> ${OSEH.data.food[name]}:</p><ul>` + actorItem + `</ul></div>`;
      }
    }
    for (let name of Lights) {
      let actorItem = '';
      console.log('actor', actor, 'id', actor.id, 'name', name);

      let light = actor.data.items.getName(OSEH.data.lightSource[name].name);
      if (light) {
        const qty = light.data.data.quantity.value;
        console.log(name, qty);
        style = 'color: green';
        if (qty <= 2) style = 'color: orangered';
        if (qty <= 1) style = 'color: red';
        actorItem += `<li><span style="${style}">${OSEH.data.lightSource[name].name}: ${light.data.data.quantity.value}</span></li>`;
        msgData.light += `<div><p> ${OSEH.data.lightSource[name].name}:</p><ul>` + actorItem + `</ul></div>`;
      }
    }
    let ratStyle = 'color: green;';
    if (totalRations <= 3) ratStyle = 'color: orangeRed;';
    if (totalRations <= 1) ratStyle = 'color: red;';
    console.log(msgData);
    const rationText = totalRations <= 0 ? '<ul><li><span style="color: red;">None</span></li></ul>' : msgData.food;
    const lightText = msgData.light == '' ? '<ul><li><span style="color: red;">None</span></li></ul>' : msgData.light;
    let contents =
      `<div >
    <h2>Supplies Report</h2>
    <br>
  <div style="${ratStyle}">Total Days of Rations left: ${totalRations}</div>
  <br>
  <h3>Character Rations:</h3>
  <div>
  ` +
      rationText +
      `</div>
    <h3>Character Light Sources:</h3>
  <div>
  ` +
      lightText +
      `</div></div>`;

    ChatMessage.create({ content: contents, whisper: [game.user.id] });
  };

  /* 
data: {
  character: array containing player character names to be checked,
  retainer: array containing the names of all active retainers to be checked.
  whisper: boolean true send message via whisper
}
*/

  OSEH.ration.rationReport = async function (data) {
    const Rations = [];
    for (let key in OSEH.data.food) {
      Rations.push(OSEH.data.food[key]);
    }
    console.log('rat', Rations, data);
    let totalRations = 0;
    const { character, retainer } = data;
    //console.log('c', character, 'r', retainer);
    const msgData = {
      character: '',
      retainer: ''
    };
    console.log('before loop');
    for (let key in data) {
      console.log(key);
      for (let name of data[key]) {
        let actor = game.actors.getName(name);
        let actorRations = '';
        console.log('actor', actor, 'id', actor?.id, 'name', name, 'key', key);
        if (actor) {
          for (let type of Rations) {
            let ration = actor.data.items.getName(type);
            if (ration) {
              const qty = ration.data.data.quantity.value;
              console.log(type, qty);
              totalRations += qty;
              style = 'color: green';
              if (qty <= 2) style = 'color: orangered';
              if (qty <= 1) style = 'color: red';
              actorRations += `<li><span style="${style}">${type}: ${ration.data.data.quantity.value}</span></li>`;
            }
          }
          msgData[key] += `<div><p> ${name}:</p><ul>` + actorRations + `</ul></div>`;
        }
      }
    }
    console.log('after loop<-----', msgData);

    console.log(totalRations, character, '<---------------');
    let contents =
      `<div >
    <h2>Ration Report</h2>
  <div>Total Days left: ${Math.floor(totalRations / character.length)}</div>
  <br>
  <h3>Character Rations</h3>
  <div>
  ` +
      msgData.character +
      `</div>
    <h3>Retainer Rations</h3>
  <div>
  ` +
      msgData.retainer +
      `</div></div>`;

    if (data.whisper) {
      ChatMessage.create({ content: contents, whisper: [game.user.id] });
    } else ChatMessage.create({ content: contents, type: CONST.CHAT_MESSAGE_TYPES.EMOTE });
  };

  OSEH.ration.eat = async function (actorId) {
    const actor = await game.actors.find((a) => a.id == actorId);
    let rationOptions = '';
    for (let type in OSEH.data.food) {
      const item = actor.data.items.getName(OSEH.data.food[type]);
      if (item) {
        console.log('item', item);
        rationOptions += `<option value="${item.name}">${item.name}: ${item.data.data.quantity.value}</option>`;
      }
    }
    console.log('ratItems', rationOptions);
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
            console.log(item);
          }
        },
        close: {
          label: 'Close'
        }
      }
    }).render(true);
  };
});
