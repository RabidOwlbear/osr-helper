

export const registerCustomEffectList = () => {
  OSRH.ce = OSRH.ce || {};

  OSRH.ce.customEffectList = class customEffectList extends Application {
    constructor(actorId = null, user = game.user) {
      super();
      this.user = user;
      //if not gm user
      if (!actorId == null) {
        this.actorId = actorId;
        this.actor = OSRH.util.GetActorById(actorId);
        this.actorName = this.actor.name;
      }
    }
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        baseApplication: 'customEffectList',
        classes: ['form', 'custom-effect-list'],
        popOut: true,
        template: `modules/${OSRH.moduleName}/templates/customEffectList.hbs`,
        id: 'customEffectList',
        title: game.i18n.localize("OSRH.customEffect.currentActiveEffects"),
        width: 600
      });
    }

    activateListeners(html) {
      super.activateListeners(html);

      html.find('#newEffect')[0].addEventListener('click', () => {
        this.renderNewEffect(html);
      });
      html.find('#effectListClose')[0].addEventListener('click', () => {
        this.close();
      });
    }
    async _updateObject(event, formData) {
      console.log('submit to Zod');
    }

    async renderEffectList(html) {
            const effectListDiv = html.find('#effectList')[0];
      const effectObj = this.user.getFlag(`${OSRH.moduleName}`, 'effectData');
      const keys = Object.keys(effectObj);
      if (keys.length) {
        const sortedList = keys.sort((a, b) => {
          return parseInt(effectObj[a].duration) > parseInt(effectObj[b].duration) ? 1 : -1;
        });
        let HTMLcontent = ``;

        for (let key of sortedList) {
          let effect = effectObj[key];

          const colorClass =
            effect.duration > 10 ? (effect.duration > 20 ? 'effect-green' : 'effect-orange') : 'effect-red';
          HTMLcontent += `<div class="fx-sb mb ${colorClass}">
        <div class="effect-list-div pl"><b>${effect.name}</b>:</div>
        <div class="fx sb pr" id="effect-item-dur">
          <div class="effect-time-div fx sb">
            <div><b>${game.i18n.localize("OSRH.customEffect.timeLeft")}: </b></div>
            <div id='effect-duration'>${effect.duration}</div>
          </div>
          <input type="radio" name="effectList" id="${key}" value="${effect.name}" />
        </div>
      </div>
      `;
        }
        effectListDiv.innerHTML = HTMLcontent;

        let inputs = html.find('input[name="effectList"]');
        for (let input of inputs) {
          input.addEventListener('input', () => {
            this.renderEffectDesc(html, effectObj[input.id]);
          });
        }
      }
    }
    async renderEffectDesc(html, effect) {
      const detailContainer = html.find('#effectDetails')[0];
      let descHtml = await renderTemplate(`modules/${OSRH.moduleName}/templates/customEffectListDescription.hbs`, {
        name: effect.name,
        duration: effect.duration,
        description: effect.description,
        target: effect.data.target,
        whisper: effect.data.whisperTarget
      });

      detailContainer.innerHTML = descHtml;
      html.find('#deleteEffect')[0].addEventListener('click', () => {
        this.deleteEffect(effect._id);
        this.render();
      });
    }

    async deleteEffect(id) {
      let effectData = this.user.getFlag(`${OSRH.moduleName}`, 'effectData');

      delete effectData[id];

      await this.user.unsetFlag(`${OSRH.moduleName}`, 'effectData');
      await this.user.setFlag(`${OSRH.moduleName}`, 'effectData', effectData);
    }

    clearText(field) {
      if (field.defaultValue == field.value) {
        field.value = ``;
      } else if (field.value == ``) {
        field.value = field.defaultValue;
      }
    }

    async addEffect(html) {
      const newEffectBtn = html.find('#newEffect')[0];
      const containerDiv = html.find('#effectDetails')[0];
      OSRH.util.oseHook(`${OSRH.moduleName}newEffectBtnToggle`, [newEffectBtn]);
      const formData = {
        _id: randomID(16),
        name: html.find('#effectName')[0].value,
        target: html.find('#targetName')[0].value,
        targetCheck: html.find('#targetCheck')[0].checked,
        description: html.find('#effectDesc')[0].value,
        duration: html.find('#effectDuration')[0].value
      };
      if (formData.name == '') {
        ui.notifications.warn(game.i18n.localize("OSRH.util.notification.enterEffectName"));
        return;
      }
      if (formData.description == '') {
        ui.notifications.warn(game.i18n.localize("OSRH.util.notification.enterEffectDescrip"));
        return;
      }
      if (formData.duration <= 0) {
        ui.notifications.warn(game.i18n.localize("OSRH.util.notification.enterEffectDuration"));
        return;
      }
      let effectData = await this.user.getFlag(`${OSRH.moduleName}`, 'effectData');
      effectData[formData._id] = {
        _id: formData._id,
        name: formData.name,
        duration: formData.duration,
        description: formData.description,
        data: {
          target: formData.target,
          whisperTarget: formData.targetCheck,
          actorId: this.actorId,
          userId: this.user.id
        }
      };

      this.user.setFlag(`${OSRH.moduleName}`, 'effectData', effectData);
      containerDiv.innerHTML = '';
      this.render();

      const msgTemplate = await renderTemplate(`modules/${OSRH.moduleName}/templates/customEffectChatMsgA.hbs`, {
        name: formData.name,
        duration: formData.duration,
        description: formData.description,
        target: formData.target,
        whisper: formData.targetCheck
      });
      oseChatMessage(effectData[formData._id], this.user.id, msgTemplate);
    }

    async renderNewEffect(html) {
      const newEffectBtn = html.find('#newEffect')[0];

      const containerDiv = html.find('#effectDetails')[0];
      const template = await renderTemplate(`modules/${OSRH.moduleName}/templates/newEffectForm.hbs`, {});
      containerDiv.innerHTML = template;
      const subBtn = html.find('#newEffectSub')[0];
      const cancelBtn = html.find('#newEffectCancel')[0];

      let inputs = html.find('input');
      for (let input of inputs) {
        input.addEventListener('focus', () => {
          this.clearText(input);
        });
        input.addEventListener('blur', () => {
          this.clearText(input);
        });
      }
      OSRH.util.oseHook('${OSRH.moduleName} newEffectBtnToggle', [newEffectBtn]);

      cancelBtn.addEventListener('click', () => {
        OSRH.util.oseHook('${OSRH.moduleName} newEffectBtnToggle', [newEffectBtn]);
        containerDiv.innerHTML = '';
      });
      subBtn.addEventListener('click', (event) => {
        this.addEffect(html);
      });
    }
  };

  OSRH.ce.effectList = async (actor = null, user = game.user) => {
    const id = actor == null ? null : actor.id;
    let list = new OSRH.ce.customEffectList(id, user);
    list.shop = list;
    list.render(true);
    //refresh window if time advances
    Hooks.on(`${OSRH.moduleName} Time Updated`, async () => {
      if (list.rendered) {
        await list.close();
        await list.render(true);
      }
    });
  };

  // window.customEffectList = customEffectList;

  Hooks.on(`${OSRH.moduleName} newEffectBtnToggle`, (...args) => {
    OSRH.util.toggleButton(args[0]);
  });

  async function oseListUserEffects() {
    let options = '';
    const userList = await game.users.contents.filter((user) => {
      let flag = user.getFlag(`${OSRH.moduleName}`, 'effectData');
      if (flag) {
        return true;
      } else return false;
    });
    for (let user of game.users.contents) {
      // options += `<option value="${user.id}" name="${user.name}">${user.name}</option>`
      options += `<option value="${user.id}" name="${user.name}">
      ${user.name}</option>`;
    }

    const template = `
  <h1> Choose User Effect list </h1>
  <div style="display:flex">
    <div  style="flex:1"><select id="selectedUser">${options}</select></div>
    </div>`;

    new Dialog({
      title: game.i18n.localize("OSRH.customEffect.userEffectSelect"),
      content: template,
      buttons: {
        getList: {
          label: 'Get List',
          callback: (html) => {
            const selected = html.find('#selectedUser')[0].value;

            OSRH.ce.effectList(null, game.users.get(selected));
          }
        }
      }
    }).render(true);
  }
};
