

class newCustomEffect extends FormApplication {
  constructor(actorId, user) {
    super();
    this.user = user;
    this.actorId = actorId;
    this.actorName = oseGetActorById(actorId).name;
    this.effectId = randomID(16);
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form', 'osehForm'],
      popOut: true,
      template: `modules/OSE-helper/templates/newCustomEffect.html`,
      id: 'NewEffectForm',
      title: 'Add Custom Effect'
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
  async _updateObject(event, formData) {
    console.log('formData', formData, this);
    const effectId = this.effectId;
    console.log('effectId', effectId);
    let effectData = await this.user.getFlag('OSE-helper', 'effectData');
    effectData[effectId] = {
      _id: effectId,
      name: formData.effectName,
      duration: formData.effectDuration,
      description: formData.effectDesc,
      data: {
        target: formData.targetName,
        whisperTarget: formData.targetCheck,
        actorId: this.actorId,
        userId: this.user.id
      }
    };
    console.log('effectData', effectData);

    game.user.setFlag('OSE-helper', 'effectData', effectData);
    const msgContent = `<h3 style="color:green;">Custom Effect Created!</h3>
    <div>Custom effect named ${effectData[effectId].name} has been created.</div>
    <div>Duration : ${effectData[effectId].duration} minutes</div>
    <div>Description: ${effectData[effectId].description}</div>
    <div>Target: ${effectData[effectId].data.target}</div>
    <div>Whisper updates to target: ${effectData[effectId].data.whisperTarget}</div>`;
    oseChatMessage(effectData[effectId], game.user.id, msgContent);

    // }
  }
}
window.newCustomEffect = newCustomEffect;

async function oseDeleteEffect() {
  const user = game.user;
  const effectData = user.getFlag('OSE-helper', 'effectData');
  console.log('effectData', effectData);
  let activeEffects = '';
  //if no effects, return
  if (!Object.keys(effectData).length) {
    ui.notifications.warn('No Active Effects');
    return;
  }
  for (let effect in effectData) {
    console.log('effect', effect, effectData[effect]);
    activeEffects += `<option value="${effect}" name="${effectData[effect].name}">
      ${effectData[effect].name}: ${effectData[effect].duration} Minutes Left</option>`;
  }

  let dialogTemplate = `
  <h1> Choose Effect To Cancel </h1>
  <div style="display:flex">
    <div  style="flex:1"><select id="selectedEffect">${activeEffects}</select></div>
    </div>`;
  new Dialog({
    title: 'Remove Effect',
    content: dialogTemplate,
    buttons: {
      removeEffect: {
        label: 'Remove Effect',
        callback: async (html) => {
          const effectId = html.find('#selectedEffect')[0].value;
          const effectName = effectData[effectId].name;
          const whisperArray = [game.user.id];
          console.log(whisperArray);
          let msgContent = `<h3 style="color: red">Effect Deleted!</h3>
          <div>Custom Effect named ${effectName} has been deleted.</div>`;
          console.log('before osechat', effectData);
          oseChatMessage(effectData[effectId], user.id, msgContent);
          delete effectData[html.find('#selectedEffect')[0].value];
          await user.unsetFlag('OSE-helper', 'effectData');
          await game.user.setFlag('OSE-helper', 'effectData', effectData);
        }
      },
      close: {
        label: 'Close'
      }
    }
  }).render(true);
}

function generateEffectReport(userId) {
  const user = game.users.contents.find((u) => u.id == userId);
  const effectData = user.getFlag('OSE-helper', 'effectData');
  let msgContent = '<h3>Custom Effect Report</h3>';
  if (!Object.keys(effectData).length) {
    ui.notifications.warn('No Active Effects');
    return;
  }
  for (let effectId in effectData) {
    let effect = effectData[effectId];
    console.log('effect', effect);
    msgContent += `
    <div>
    <h4>${effect.name}</h4>
    <div>Duration : ${effect.duration} minutes.</div>
    <div>Description: ${effect.description}</div>
    <div>Target: ${effect.data.target}</div>
    <div>Whisper updates to target: ${effect.data.whisperTarget}</div>
    </div>
    <br/>`;
  }
  //console.log(msgContent);
  let options = {
    title: 'Custom Effect Report',
    content: msgContent,
    buttons: {
      close: {
        label: 'Close'
      }
    }
  };

  new Dialog(options).render(true);
}
