Hooks.on('ready', () => {
  OSEH.light = OSEH.light || {};

  OSEH.light.lightOn = async function (actorId) {
    let lightData = null;
    let userObj;
    //check for actors in all non gm user slots before writing flag to gm user
    if (game.user.role == 4) {
      console.log('gm');
      for (let user of game.users.contents) {
        console.log(user, user.data.flags['OSE-helper'].lightData);
        if (user.data.flags['OSE-helper'].lightData[actorId]) {
          console.log('light data', user.getFlag('OSE-helper', 'lightData'));
          lightData = await user.getFlag('OSE-helper', 'lightData');
          userObj = user;
          console.log('actor found', user, lightData);
        }
      }
      if (lightData == null) {
        console.log('user not found');
        lightData = {};
        userObj = game.user;
      }
    } else {
      lightData = game.user.getFlag('OSE-helper', 'lightData');
      userObj = game.user;
    }

    const actor = await game.actors.find((a) => a.id == actorId);
    console.log(lightData, userObj, actor, '<-----------------');
    if (lightData?.[actorId]?.lightLit) {
      // console.log('light lit');
      console.log('light lit');
      for (let type in lightData?.[actorId]) {
        if (typeof lightData?.[actorId][type] == 'object') {
          // // console.log('object', lightData?.[actorId][type]);
          lightData[actorId][type].isOn = false;
          // // console.log('object', lightData?.[actorId][type]);
        }
      }
      lightData[actorId].lightLit = false;
      await userObj.unsetFlag('OSE-helper', 'lightData');
      await userObj.setFlag('OSE-helper', 'lightData', lightData);
      OSEH.light.oseLightOff(actorId);
      return;
    }

    let lightOptions = '';

    for (let type in OSEH.data.lightSource) {
      // // console.log(type, OSEH.data.lightSource[type].name);
      const item = actor.data.items.getName(OSEH.data.lightSource[type].name);
      if (item) {
        // // console.log('item', item);
        lightOptions += `<option value="${type}">${item.name}: ${item.data.data.quantity.value}</option>`;
      }
    }

    if (lightOptions == '') {
      ui.notifications.error('No Light Items Found');
      return;
    }
    // // console.log(lightOptions);
    let dialogTemplate = `
  <h1> Pick a Light Type </h1>
  <div style="display:flex">
    <div  style="flex:1"><select id="lightType">${lightOptions}</select></div>
    </div>`;

    new Dialog({
      title: 'Light on',
      content: dialogTemplate,
      buttons: {
        rollAtk: {
          label: 'Light On',
          callback: async (html) => {
            const itemType = html.find('#lightType')[0].value;
            const item = actor.items.getName(OSEH.data.lightSource[itemType].name);
            // // console.log(item);
            if (lightData?.[actorId]?.[itemType]?.isOn == false) {
              //if data contains actorId.type.isOn = false set isOn to true
              lightData[actorId].lightLit = true;
              lightData[actorId][itemType].isOn = true;
              userObj.setFlag('OSE-helper', 'lightData', lightData);
              OSEH.util.updateTokens(actorId, OSEH.data.lightSource[itemType]);
              return;
            }
            if (!lightData?.[actorId]) {
              console.log(lightData, actorId, '<---- no type found');
              //if no actorId found, creat actor id and light type
              // // console.log('no actor or type found');
              lightData[actorId] = {
                lightLit: true,
                [itemType]: {
                  isOn: true,
                  duration: OSEH.data.lightSource[itemType].duration
                }
              };
              // console.log(lightData), 'lightData no id';
              userObj.setFlag('OSE-helper', 'lightData', lightData);
              OSEH.util.updateTokens(actorId, OSEH.data.lightSource[itemType]);
              return;
            }
            if (!lightData[actorId][itemType]) {
              lightData[actorId].lightLit = true;
              lightData[actorId][itemType] = {
                isOn: true,
                duration: OSEH.data.lightSource[itemType].duration
              };
              userObj.setFlag('OSE-helper', 'lightData', lightData);
              OSEH.util.updateTokens(actorId, OSEH.data.lightSource[itemType]);
              return;
            }
          }
        },
        close: {
          label: 'Close'
        }
      }
    }).render(true);
  };

  OSEH.light.lightOff = async function (actorId) {
    //loop through active game scenes
    OSEH.util.updateTokens(actorId, 0, 0);
  };
  OSEH.light.oseLightOff = async function (actorId) {
    console.log('lightOff triggered');
    // console.log('light off');
    const data = {
      
        brightLight: 0,
        dimLight: 0,
        lightAlpha: 0.5
      
    };
    //loop through active game scenes
    OSEH.util.updateTokens(actorId, data);
  };
  // async function updateTokens(actorId, bl, dl) {}
});
