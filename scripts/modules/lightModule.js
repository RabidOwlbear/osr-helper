export const registerLightModule = async function () {

  OSRH.light.lightToggle = async function (uuid =null, tokenId) {
    if(!uuid){
      if(OSRH.util.singleSelected()){
        uuid = canvas.tokens.controlled[0]?.actor.uuid
      }else{
        return
      }
    }
    
    let actor = await fromUuid(uuid);
    actor = actor.collectionName === 'tokens' ? actor.actor : actor;

    let lightItems = await OSRH.light.getLightItems(actor.id);
    // actor.items.filter((i) => {
    //   let tags = i.system.manualTags;
    //   if (tags && tags.find((t) => t.value == 'Light')) return i;
    // });
    const lightData = foundry.utils.deepClone(await game.settings.get(`${OSRH.moduleName}`, 'lightData'));
    let actorLightData = lightData[actor.id];

    // check for light already lit
    if (actorLightData?.lightLit) {
      let activeLight = actorLightData.lights.find((i) => i.isOn);
      activeLight.isOn = false;
      actorLightData.lightLit = false;
      let elapsed = game.time.worldTime - activeLight.start;
      activeLight.duration = activeLight.duration - elapsed
      if(activeLight.duration === 'inf'){
        actorLightData.lights = actorLightData.lights.filter(i=>i.id != activeLight.id)
      }
      let settingData = {
        setting: 'lightData',
        value: lightData,
        type: 'set'
      };
      await OSRH.socket.executeAsGM('setting', 'lightData', lightData, 'set');
      await OSRH.light.updateTokens(actor.uuid, {
        dim: 0,
        bright: 0,
        color: activeLight.color,
        alpha: activeLight.alpha
      });

      return;
    }
    // get path to quantity value
    let qtyPath = OSRH.systemData?.paths?.itemQty;
    let lightOptions = '';
    for (let light of lightItems) {
      let qty = OSRH.util.getNestedValue(light, qtyPath)
      lightOptions += `<option value="${light.id}">${light.name}: ${qty}</option>`;
    }
    if (lightOptions == '') {
      ui.notifications.error('No Light Items Found');
      return;
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
        lightOn: {
          label: 'Light On',
          callback: async (html) => {
            const itemID = html.find('#lightType')[0].value;
            const item = await actor.items.get(itemID);
            const lightItemData = item.getFlag(`${OSRH.moduleName}`, 'lightItemData');
            //if no actorId found, creat actor id and light type
            if (!actorLightData) {
              lightData[actor.id] = {
                lightLit: true,
                id: actor.id,
                uuid: actor.uuid,
                lights: [
                  {
                    id: randomID(16),
                    name: item.name,
                    actorId: actor.id,
                    itemId: item.id,
                    tokenId: tokenId,
                    isOn: true,
                    start: game.time.worldTime,
                    duration: lightItemData.duration === 'inf' ? 'inf' : lightItemData.duration * 60,
                    data: lightItemData
                  }
                ]
              };
              actorLightData = lightData[actor.id];

             
              let settingData = {
                setting: 'lightData',
                value: lightData,
                type: 'set'
              };
              await OSRH.socket.executeAsGM('setting', 'lightData', lightData, 'set');
              await OSRH.socket.executeAsGM('updateTokens', actor.uuid, lightItemData);
              return;
            }
            // if light exists in lightData

            if (!actorLightData.lightLit && actorLightData?.lights.find((i) => i.itemId == item.id)) {
              let itemObj = actorLightData.lights.find((i) => i.itemId == item.id);
              itemObj.isOn = true;
              actorLightData.lightLit = true;

              // itemObj.duration = itemObj.duration - Math.floor(game.time.worldTime - itemObj.start);

              itemObj.start = game.time.worldTime;
              
              let settingData = {
                setting: 'lightData',
                value: lightData,
                type: 'set'
              };
              await OSRH.socket.executeAsGM('setting', 'lightData', lightData, 'set');
              await OSRH.light.updateTokens(actor.uuid, lightItemData);
              return;
            }

            if (!actorLightData?.lights.find((i) => i.itemId == item.id)) {
              //
              actorLightData.lightLit = true;
              actorLightData.lights.push({
                id: randomID(16),
                name: item.name,
                actorId: actor.id,
                itemId: item.id,
                tokenId: tokenId,
                isOn: true,
                start: game.time.worldTime,
                duration: lightItemData.duration === 'inf' ? 'inf' : lightItemData.duration * 60,
                data: lightItemData
              });
              let settingData = {
                setting: 'lightData',
                value: lightData,
                type: 'set'
              };
              await OSRH.socket.executeAsGM('setting', 'lightData', lightData, 'set');
              await OSRH.light.updateTokens(actor.uuid, lightItemData);
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

  OSRH.light.lightCheck =  async function () {
    let lightData = foundry.utils.deepClone( await game.settings.get(`${OSRH.moduleName}`, 'lightData'));
    let curTime = game.time.worldTime;
    let expired = [];
    for (let actorId in lightData) {
      let id = actorId;
      let dataObj = lightData[id];
      let lights = dataObj.lights.filter((i) => i.isOn);
      for (let light of lights) {
        let { start, duration, data } = light;
        if (duration === 'inf') {
          continue;
        }
        start = curTime < start ? curTime : start;
        let elapsed = curTime - start;
        let dimLight = duration - elapsed == 600 * data.warn ? true : false;
        if (dimLight) {
          let lData = {
            dim: data.dim * 0.7,
            bright: data.bright,
            color: data.color,
            alpha: data.alpha,
            animation: data.animation,
            bgCont: data.bgCont,
            bgSat: data.bgSat,
            bgShadow: data.bgShadow,
            coloration: data.coloration,
            intensity: data.intensity,
            luminosity: data.luminosity,
            speed: data.speed
          };
           OSRH.light.updateTokens(dataObj.uuid, lData);
        }
        if (elapsed >= duration) {
          dataObj.lightLit = false;
          dataObj.lights =  dataObj.lights.filter((i) => i.id != light.id);
          let lData = {
            dim: 0,
            bright: 0,
            color: data.color,
            alpha: data.alpha,
            animation: data.animation,
            bgCont: data.bgCont,
            bgSat: data.bgSat,
            bgShadow: data.bgShadow,
            coloration: data.coloration,
            intensity: data.intensity,
            luminosity: data.luminosity,
            speed: data.speed
          };
           OSRH.light.updateTokens(dataObj.uuid, lData);
          OSRH.light.decrementLightItem(dataObj.uuid, light.itemId);
          if (!dataObj.lights.length) delete lightData[actorId];
        }
      }
    }
     await game.settings.set(`${OSRH.moduleName}`, 'lightData', lightData);
  };

  OSRH.light.decrementLightItem = async function (uuid, itemId) {
    let actor = await fromUuid(uuid);
    let qtyPath = OSRH.systemData.paths.itemQty;
    actor = actor?.collectionName === 'tokens' ? actor.actor : actor;
    let item = await actor.items.get(itemId);
    let itemQty = OSRH.util.getNestedValue(item, qtyPath)
    if (itemQty > 0) {
      itemQty = itemQty - 1;
      await item.update({ [qtyPath]: itemQty });
      
    }
    if (itemQty <= 0) {
      await actor.deleteEmbeddedDocuments('Item', [itemId]);
    }
  };

  OSRH.light.ItemSettingsForm = class ItemSettingsForm extends FormApplication {
    constructor(item) {
      super(item, { id: `light-item-config.${item.id}`, title: `OSRH Light Item Config - ${item.name}` });
      this.item = item;
      this.lightFlag = this.item.getFlag(`${OSRH.moduleName}`, 'lightItemData');
    }

    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['form', `light-item-config`, 'themed'],
        popOut: true,
        height: 540,
        width: 300,
        template: `modules/${OSRH.moduleName}/templates/light-item-config-form.hbs`
      });
    }

    getData() {
      let flag = this.item.getFlag(`${OSRH.moduleName}`, 'lightItemData');
      // Send data to the template
      return {
        name: this.item.name ? this.item.name : ItemName,
        dim: flag?.dim ? flag.dim : 30,
        bright: flag?.bright ? flag.bright : 10,
        color: flag?.color ? flag.color : '#ff7b24',
        dur: flag?.duration ? flag.duration : 60,
        alpha: flag?.alpha ? flag.alpha : flag?.alpha === 0 ? 0 :0.5,
        alert: flag?.alert ? flag.alert : 1,
        angle: flag?.angle ? flag.angle : 360,
        warn: flag?.warn ? flag.warn : 3,
        animation: flag?.animation ? flag.animation : 'flame',
        speed: flag?.speed ? flag.speed : 3,
        intensity: flag?.intensity ? flag.intensity : 5,
        coloration: flag?.coloration ? flag.coloration : '1',
        luminosity: flag?.luminosity ? flag.luminosity : 0.4,
        bgSat: flag?.bgSat ? flag.bgSat : 0,
        bgCont: flag?.bgCont ? flag.bgCont : 0,
        bgShadow: flag?.bgShadow ? flag.bgShadow : 0
      };
    }

    activateListeners(html) {
      super.activateListeners(html);
      const updateBtn = html.find('#update-btn')[0];
      const closeBtn = html.find('#close-btn')[0];
      let inputsA = html.find('.light-config-input.type-a');
      let inputsB = html.find('.light-config-input.type-b')
      let animation = html.find('#animation');
      let anim = html.find(`option.animation[value="${this?.lightFlag?.animation}"]`)[0];
      let coloration = html.find(`option.coloration[value="${this?.lightFlag?.coloration}"]`)[0];
      if(anim)anim.selected = true;
      if(coloration)coloration.selected = true;


      closeBtn.addEventListener('click', (ev) => {
        this.close();
      });
      // update button
      updateBtn.addEventListener('click', async (ev) => {
        let inputs = html.find('.light-config-input');
        let formData = {};
        for (let i of inputs) {
          if (i.id === 'duration' && i.value === 'inf') {
            formData[i.id] = i.value;
            continue;
          }
          let value =
            i.type == 'color'
              ? i.value
              : i.id == 'alpha'
              ? parseFloat(i.value)
              : i.id == 'luminosity'
              ? parseFloat(i.value)
              : i.id == 'animation'
              ? i.value
              : parseInt(i.value);
          formData[i.id] = value;
          if(i.id == 'animation' && i.value == 'none') value = null;

        }
        ev.preventDefault();
        updateBtn.blur();

        await this.item.setFlag(`${OSRH.moduleName}`, 'lightItemData', formData);
        ui.notifications.info('Light Item Data Updated');
        this.close();
      });
      // numberInput qol
      for (let input of inputsA) {
        input.addEventListener('blur', (ev) => {
          if (!ev.target.value) ev.target.value = 0;
          ev.target.value = ev.target.value < 0 ? 0 : ev.target.value;
        });
      }
      for (let input of inputsB) {
        input.addEventListener('blur', (ev) => {
          if (!ev.target.value) ev.target.value = 0;
          if (ev.target.value < 0) ev.target.value = 0;
          if (ev.target.value > 1 && ev.target.id != 'speed' && ev.target.id != 'intensity') ev.target.value = 1;
          if (ev.target.id != 'speed' || ev.target.id != 'intensity') {
            if (ev.target.value > 10) ev.target.value = 10;
          }
        });
      }
    }

    async _updateObject(event, formData, a, b) {}
  };

  OSRH.light.updateTokens = async function (uuid, lightData, lastTurn = false) {

    let actor = await fromUuid(uuid);
    game.scenes.map((s) => {
      if (s.tokens.size) {
        s.tokens.forEach(async (t) => {
          if (t.actor && t.actor.uuid == uuid) {
            let data = {
              light: {
                bright: lightData.bright,
                dim: lightData.dim,
                angle: lightData.angle ? lightData.angle: 360,
                color: lightData.color,
                alpha: lightData.alpha,
                gradual: true,
                animation: {
                  type: lightData.animation ? lightData.animation : 'flame',
                  speed: lightData.speed,
                  intensity: lightData.intensity
                },
                coloration: lightData.coloration,
                contrast: lightData.bgCont,
                luminosity: lightData.luminosity,
                attenuation: lightData.attenuation || 0.5,
                saturation: lightData.saturation,
                shadows: lightData.bgShadow
              }
            };

            await t.update(data);
          }
        });
      }
    });
  };

  OSRH.light.turnsRemaining =  async function (actorId) {
    if(!actorId){
      if(OSRH.util.singleSelected()){
        actorId = canvas.tokens.controlled[0]?.actor.id
      }else{
        return
      }
    }
    let lightData = await game.settings.get(`${OSRH.moduleName}`, 'lightData')?.[actorId]?.lights.filter((i) => i.isOn)?.[0];
    if (lightData) {
      let elapsed = game.time.worldTime - lightData.start;
      let tRem;
      let color;
      let turn;
      if(lightData.duration == 'inf'){
        tRem = game.i18n.localize("OSRH.effect.infinite");
        color= 'green';
        turn = game.i18n.localize("OSRH.light.chat.turns");
      }else{
        let warnVal  = lightData.data.warn <=0 ? lightData.data.alert + 2 : lightData.data;
       let remaining = lightData.duration - elapsed;
       tRem = Math.floor(remaining / 600);
       color = tRem <= lightData.data.alert ? 'red' : tRem <= warnVal? 'orangeRed' : 'green';
       turn = tRem == 1 ? game.i18n.localize("OSRH.light.chat.turn") : game.i18n.localize("OSRH.light.chat.turns");
      }
      // let remaining = lightData.duration - elapsed;
      // let tRem = Math.floor(remaining / 600);
      // let color = tRem <= lightData.data.alert ? 'red' : tRem <= lightData.data.warn ? 'orangeRed' : 'green';
      // let turn = tRem == 1 ? game.i18n.localize("OSRH.light.chat.turn") : game.i18n.localize("OSRH.light.chat.turns");
      let chatData = {
        content: '',
        whisper: [game.user.id]
      };
      chatData.content = `<div class="osrh-report-msg"><h3>${lightData.name} ${game.i18n.localize("OSRH.light.chat.turnsLeft")}</h3>
      <p style="color: ${color}">${game.i18n.localize("OSRH.light.chat.the")} ${lightData.name} ${game.i18n.localize("OSRH.light.chat.has")} ${tRem} ${turn} ${game.i18n.localize("OSRH.light.chat.remaining")}</p></div>`;

      ChatMessage.create(chatData);

      return;
    }

    ui.notifications.warn(game.i18n.localize("OSRH.util.notification.noLightLit"));
  };

  OSRH.light.osrLightOff = async function (actorId) {
    console.log('lightOff')
    const data = {
      brightLight: 0,
      dimLight: 0,
      lightAlpha: 0.5
    };
    //loop through active game scenes
    OSRH.util.updateTokens(actorId, data);
  };
  OSRH.light.getLightItems = async function (actorId) { 
    let actor = await game.actors.get(actorId);
    if(!actor.prototypeToken.actorLink){
      actor = await canvas.tokens.controlled[0].document.actor
    }
    if(!actor){
      console.log('no actor found')
      return
    }
    // determine system
    const system = game.system.id;
    const tags = false//OSRH.systemData.tags;
    let lightItems = actor.items.filter((i) => {
      let isLight = i.flags["osr-helper"]?.itemType === 'light';
      if(isLight) return i
    });
    // if(tags){
    //   lightItems = actor.items.filter((i) => {
    //     let tags = i.system.manualTags;
    //     if (tags && tags.find((t) => t.value == 'Light')) return i;
    //   });
    // } else {
    //   lightItems = actor.items.filter((i) => {
    //     let isLight = i.flags["osr-helper"]?.itemType === 'light';
    //     if(isLight) return i
    //   });
    // }
    return lightItems
  }
};
