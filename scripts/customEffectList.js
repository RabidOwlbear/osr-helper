Hooks.on('rendercustomEffectList', (CEL, html, form) => {
  console.log('customEffectList', CEL, 'html', html, 'formData', form);
  CEL.renderEffectList(html);
});

Hooks.on('ready', () => {
  OSEH.ce = OSEH.ce || {};

  OSEH.ce.customEffectList = class customEffectList extends Application {
    constructor(actorId = null, user = game.user) {
      super();
      this.user = user;
      //if not gm user
      if (!actorId == null) {
        this.actorId = actorId;
        this.actor = OSEH.util.GetActorById(actorId);
        this.actorName = this.actor.name;
      }
    }
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        baseApplication: 'customEffectList',
        classes: ['form', 'custom-effect-list'],
        popOut: true,
        template: `modules/OSE-helper/templates/customEffectList.html`,
        id: 'customEffectList',
        title: 'Currently Active Effects',
        width: 650
      });
    }

    activateListeners(html) {
      super.activateListeners(html);
      console.log('init htmml', html);
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
      console.log('effectL:ist', this, html);
      const effectListDiv = html.find('#effectList')[0];
      const effectObj = this.user.getFlag('OSE-helper', 'effectData');
      const keys = Object.keys(effectObj);
      if (keys.length) {
        const sortedList = keys.sort((a, b) => {
          console.log(
            'list stuff',
            typeof effectObj[a].duration,
            typeof effectObj[b].duration,
            parseInt(effectObj[a].duration) > parseInt(effectObj[b].duration)
          );
          return parseInt(effectObj[a].duration) > parseInt(effectObj[b].duration) ? 1 : -1;
        });
        let HTMLcontent = ``;
        console.log('sortedList', sortedList);
        for (let key of sortedList) {
          let effect = effectObj[key];
          console.log('effect', effect);
          const colorClass =
            effect.duration > 10 ? (effect.duration > 20 ? 'effect-green' : 'effect-orange') : 'effect-red';
          HTMLcontent += `<div class="fx-sb mb ${colorClass}">
        <div class="effect-list-div pl"><b>${effect.name}</b>:</div>
        <div class="fx sb pr" id="effect-item-dur">
          <div class="effect-time-div fx sb">
            <div><b>Time Left: </b></div>
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
      console.log('clicked, yo', effect);
      const detailContainer = html.find('#effectDetails')[0];
      let descHtml = await renderTemplate('modules/OSE-helper/templates/customEffectListDescription.html', {
        name: effect.name,
        duration: effect.duration,
        description: effect.description,
        target: effect.data.target,
        whisper: effect.data.whisperTarget
      });
      console.log(descHtml, effect);
      detailContainer.innerHTML = descHtml;
      html.find('#deleteEffect')[0].addEventListener('click', () => {
        this.deleteEffect(effect._id);
        this.render();
      });
    }

    async deleteEffect(id) {
      let effectData = this.user.getFlag('OSE-helper', 'effectData');
      console.log(effectData);
      delete effectData[id];
      console.log(effectData);
      await this.user.unsetFlag('OSE-helper', 'effectData');
      await this.user.setFlag('OSE-helper', 'effectData', effectData);
    }

    clearText(field) {
      console.log('event', field);
      if (field.defaultValue == field.value) {
        field.value = ``;
      } else if (field.value == ``) {
        field.value = field.defaultValue;
      }
    }

    async addEffect(html) {
      const newEffectBtn = html.find('#newEffect')[0];
      const containerDiv = html.find('#effectDetails')[0];
      OSEH.util.oseHook('OSE-helper newEffectBtnToggle', [newEffectBtn]);
      const formData = {
        _id: randomID(16),
        name: html.find('#effectName')[0].value,
        target: html.find('#targetName')[0].value,
        targetCheck: html.find('#targetCheck')[0].checked,
        description: html.find('#effectDesc')[0].value,
        duration: html.find('#effectDuration')[0].value
      };
      if (formData.name == '') {
        ui.notifications.warn('Please enter an effect name.');
        return;
      }
      if (formData.description == '') {
        ui.notifications.warn('Please enter an effect description.');
        return;
      }
      if (formData.duration <= 0) {
        ui.notifications.warn('Please enter an effect duration.');
        return;
      }
      let effectData = await this.user.getFlag('OSE-helper', 'effectData');
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
      console.log(formData, effectData, this.user);
      this.user.setFlag('OSE-helper', 'effectData', effectData);
      containerDiv.innerHTML = '';
      this.render();

      const msgTemplate = await renderTemplate('modules/OSE-helper/templates/customEffectChatMsgA.html', {
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

      console.log(html);
      const containerDiv = html.find('#effectDetails')[0];
      const template = await renderTemplate('modules/OSE-helper/templates/newEffectForm.html', {});
      containerDiv.innerHTML = template;
      const subBtn = html.find('#newEffectSub')[0];
      const cancelBtn = html.find('#newEffectCancel')[0];

      let inputs = html.find('input');
      for (let input of inputs) {
        //console.log(input);
        input.addEventListener('focus', () => {
          this.clearText(input);
        });
        input.addEventListener('blur', () => {
          this.clearText(input);
        });
      }
      OSEH.util.oseHook('OSE-helper newEffectBtnToggle', [newEffectBtn]);
      console.log(subBtn);
      console.log(html);
      cancelBtn.addEventListener('click', () => {
        OSEH.util.oseHook('OSE-helper newEffectBtnToggle', [newEffectBtn]);
        containerDiv.innerHTML = '';
      });
      subBtn.addEventListener('click', (event) => {
        console.log(event, html);
        this.addEffect(html);
      });
    }
  };

  OSEH.ce.effectList = async (actor = null, user = game.user) => {
    const id = actor == null ? null : actor.id;
    let list = new OSEH.ce.customEffectList(id, user);
    list.shop = list;
    list.render(true);
    //refresh window if time advances
    Hooks.on('OSE-helper Time Updated', async () => {
      console.log('hook fired', list, list.render);
      if (list.rendered) {
        console.log('LIST OPEN');
        await list.close();
        await list.render(true);
      }
    });
  };

  // window.customEffectList = customEffectList;

  Hooks.on('OSE-helper newEffectBtnToggle', (...args) => {
    console.log('ARRRRRRRRRRGGGGSSS', args);
    OSEH.util.toggleButton(args[0]);
  });

  async function oseListUserEffects() {
    let options = '';
    const userList = await game.users.contents.filter((user) => {
      let flag = user.getFlag('OSE-helper', 'effectData');
      if (flag) {
        return true;
      } else return false;
    });
    for (let user of game.users.contents) {
      console.log(user);
      // options += `<option value="${user.id}" name="${user.name}">${user.name}</option>`
      options += `<option value="${user.id}" name="${user.name}">
      ${user.name}</option>`;
    }
    console.log('options', options);
    const template = `
  <h1> Choose User Effect list </h1>
  <div style="display:flex">
    <div  style="flex:1"><select id="selectedUser">${options}</select></div>
    </div>`;
    console.log(template);
    new Dialog({
      title: 'User Effect Select',
      content: template,
      buttons: {
        getList: {
          label: 'Get List',
          callback: (html) => {
            const selected = html.find('#selectedUser')[0].value;
            console.log('selected', selected);
            OSEH.ce.effectList(null, game.users.get(selected));
          }
        }
      }
    }).render(true);
  }
});
