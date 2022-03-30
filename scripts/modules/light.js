export const registerLight = () => {
  OSEH.light = OSEH.light || {};

  OSEH.light.lightOn = async function (actorId) {
    let lightData = null;
    let userObj;
    //check for actors in all non gm user slots before writing flag to gm user
    if (game.user.role == 4) {
      for (let user of game.users.contents) {
        if (user.data.flags[`${OSEH.moduleName}`].lightData[actorId]) {
          lightData = await user.getFlag(`${OSEH.moduleName}`, 'lightData');
          userObj = user;
        }
      }
      if (lightData == null) {
        lightData = {};
        userObj = game.user;
      }
    } else {
      lightData = game.user.getFlag(`${OSEH.moduleName}`, 'lightData');
      userObj = game.user;
    }

    const actor = await game.actors.find((a) => a.id == actorId);

    if (lightData?.[actorId]?.lightLit) {
      for (let type in lightData?.[actorId]) {
        if (typeof lightData?.[actorId][type] == 'object') {
          lightData[actorId][type].isOn = false;
        }
      }
      lightData[actorId].lightLit = false;
      await userObj.unsetFlag(`${OSEH.moduleName}`, 'lightData');
      await userObj.setFlag(`${OSEH.moduleName}`, 'lightData', lightData);
      OSEH.light.oseLightOff(actorId);
      return;
    }

    let lightOptions = '';

    for (let type in OSEH.data.lightSource) {
      const item = actor.data.items.getName(OSEH.data.lightSource[type].name);
      if (item) {
        lightOptions += `<option value="${type}">${item.name}: ${item.data.data.quantity.value}</option>`;
      }
    }

    if (lightOptions == '') {
      ui.notifications.error('No Light Items Found');
      return;
    }

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

            if (lightData?.[actorId]?.[itemType]?.isOn == false) {
              //if data contains actorId.type.isOn = false set isOn to true
              lightData[actorId].lightLit = true;
              lightData[actorId][itemType].isOn = true;
              userObj.setFlag(`${OSEH.moduleName}`, 'lightData', lightData);
              OSEH.util.updateTokens(actorId, OSEH.data.lightSource[itemType]);
              return;
            }
            if (!lightData?.[actorId]) {
              //if no actorId found, creat actor id and light type

              lightData[actorId] = {
                lightLit: true,
                [itemType]: {
                  isOn: true,
                  duration: OSEH.data.lightSource[itemType].duration
                }
              };

              userObj.setFlag(`${OSEH.moduleName}`, 'lightData', lightData);
              OSEH.util.updateTokens(actorId, OSEH.data.lightSource[itemType]);
              return;
            }
            if (!lightData[actorId][itemType]) {
              lightData[actorId].lightLit = true;
              lightData[actorId][itemType] = {
                isOn: true,
                duration: OSEH.data.lightSource[itemType].duration
              };
              userObj.setFlag(`${OSEH.moduleName}`, 'lightData', lightData);
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
    const data = {
      brightLight: 0,
      dimLight: 0,
      lightAlpha: 0.5
    };
    //loop through active game scenes
    OSEH.util.updateTokens(actorId, data);
  };
  // async function updateTokens(actorId, bl, dl) {}
};
