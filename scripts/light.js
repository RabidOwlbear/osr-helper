async function oseLightOn(actorId) {
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
    oseLightOff(actorId);
    return;
  }

  let lightOptions = '';

  for (let type in oseLight) {
    // // console.log(type, oseLight[type].name);
    const item = actor.data.items.getName(oseLight[type].name);
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
          const item = actor.items.getName(oseLight[itemType].name);
          // // console.log(item);
          if (lightData?.[actorId]?.[itemType]?.isOn == false) {
            //if data contains actorId.type.isOn = false set isOn to true
            lightData[actorId].lightLit = true;
            lightData[actorId][itemType].isOn = true;
            userObj.setFlag('OSE-helper', 'lightData', lightData);
            oseUpdateTokens(actorId, oseLight[itemType]);
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
                duration: oseLight[itemType].duration
              }
            };
            // console.log(lightData), 'lightData no id';
            userObj.setFlag('OSE-helper', 'lightData', lightData);
            oseUpdateTokens(actorId, oseLight[itemType]);
            return;
          }
          if (!lightData[actorId][itemType]) {
            lightData[actorId].lightLit = true;
            lightData[actorId][itemType] = {
              isOn: true,
              duration: oseLight[itemType].duration
            };
            userObj.setFlag('OSE-helper', 'lightData', lightData);
            oseUpdateTokens(actorId, oseLight[itemType]);
            return;
          }
        }
      },
      close: {
        label: 'Close'
      }
    }
  }).render(true);
}

async function oseUpdateTokens(actorId, lightData, lastTurn = false) {
  // // console.log(lightData, actorId);
  //loop through active game scenes
  for (let scene of game.scenes.contents) {
    //loop through tokens contaioned in scene
    scene.data.tokens.contents.forEach(async (t) => {
      //if token actorId == actorId set light settings to off
      if (t?.actor?.id == actorId) {
        let dim = lightData.dimLight;
        if (lastTurn) dim = dim * 0.7;
        // // console.log(t);
        const data = {
          brightLight: lightData.brightLight,
          dimLight: dim,
          lightColor: lightData.color,
          lightAlpha: lightData.lightAlpha
        };
        if (t.data.lightAnimation.type == 'BlitzAlternate Torch') {
          // console.log('blitz alternate torch');

          const flagData = {
            secondaryColor: lightData.secondaryColor,
            ratioDamper: 1,
            blurStrength: 20,
            alterTranslation: true,
            alterAlpha: true
          };
          await t.setFlag('CommunityLighting', 'customProperties', flagData);
        }
        // console.log('token found', data);
        await t.update(data);
      }
    });
  }
}

async function lightOff(actorId) {
  //loop through active game scenes
  updateTokens(actorId, 0, 0);
}
async function oseLightOff(actorId) {
  // console.log('light off');
  const data = {
    brightLight: 0,
    dimLight: 0,
    color: '',
    lightAlpha: 0.16
  };
  //loop through active game scenes
  oseUpdateTokens(actorId, data);
}
async function updateTokens(actorId, bl, dl) {}
function singleSelected() {
  if (canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1) {
    ui.notifications.error('Please select a single token');
    return false;
  }
  return true;
}
