export class CustomAttributeEdit extends FormApplication {
  constructor(attrib, actorId, managerCoord = false) {
    super();
    this.attrib = attrib;
    this.actorId = actorId;
    this.managerCoord = managerCoord;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize('OSRH.attribConfig.title'), //'OSRH Custom Attribute Config',
      classes: ['osrh', 'attribute-config'],
      id: 'OSRHAttributeConfig',
      top: 120,
      left: 60,
      width: 350,
      height: 165,
      template: `modules/osr-helper/templates/custom-attribute/attribute-config-form.hbs`,
      dragDrop: [
        {
          dragSelector: '.item',
          dropSelector: '.items'
        }
      ]
    });
  }
  async getData() {
    const items = [];
    for (let item of this.attrib.items) {
      const obj = await fromUuid(item.uuid);
      items.push(obj);
    }
    const context = super.getData();
    context.name = this.attrib.name;
    context.abbr = this.attrib.abbr;
    context.items = items;
    context.noItems = this.attrib.items.length ? false : true;
    return context;
  }
  activateListeners(html) {
    const deleteItemBtns = [...html.find('.delete-item')];
    const abbrInp = html.find('#abbreviation')[0];
    const attribNameInp = html.find('#attrib-name')[0];
    const saveBtn = html.find('#save-btn')[0];

    deleteItemBtns.map((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const atribEl = e.target.closest('.atrib-item');
        const uuid = atribEl.id;
        const id = atribEl.dataset.id;
        let newList = [];
        newList = this.attrib.items.filter((i) => i.uuid != uuid);
        if (newList.length == 1 && newList[0].uuid === uuid) newList = [];
        this.attrib.items = newList;
        this.render();
      });
    });
    abbrInp.addEventListener('change', (e) => {
      e.preventDefault();
      this.attrib.abbr = abbrInp.value.slice(0, 3).toUpperCase();
      if (this.attrib.abbr.length < 3 || this.attrib.abbr.length > 3) {
        ui.notifications.warn(game.i18n.localize('OSRH.util.notification.abbrLengthWarn'));
      }
    });
    attribNameInp.addEventListener('change', (e) => {
      e.preventDefault();
      this.attrib.name = attribNameInp.value;
    });
    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await this._saveAttribute();
    });
  }
  async _onDrop(event) {
    const dragData = TextEditor.getDragEventData(event);
    if (dragData.type != 'Item' || !dragData.uuid) {
      return;
    }
    const item = await fromUuid(dragData.uuid);
    if (
      item?.parent?._id !== this.actorId ||
      item.type != 'ability' ||
      item.system.roll === '' ||
      !item.system.roll.includes('d')
    ) {
      ui.notifications.warn(game.i18n.localize('OSRH.util.notification.itemAbilDropWarn'));
      return;
    }
    const exists = this.attrib.items.find((i) => i.uuid == dragData.uuid);
    if (!exists) {
      this.attrib.items.push({ uuid: dragData.uuid, id: dragData.item._id });
      this.render();
    }
  }
  async _saveAttribute() {
    const actor = await game.actors.get(this.actorId);
    let flagData = await foundry.utils.deepClone(actor.flags?.[OSRH.moduleName]?.customAttributes);
    if(!flagData)flagData = [];
    const existing = flagData.find((i) => i.id === this.attrib.id);
    if (!this.attrib.name.length) {
      ui.notifications.warn(game.i18n.localize('OSRH.util.notification.invalidAttribName'));
      return;
    }
    if (!this.attrib.abbr.length == 3) {
      ui.notifications.warn(game.i18n.localize('OSRH.util.notification.abbrLengthWarn'));
      return;
    }
    if (existing) {
      existing.name = this.attrib.name;
      existing.abbr = this.attrib.abbr;
      existing.items = this.attrib.items;
    } else {
      flagData.push(this.attrib);
    }
    await actor.setFlag(OSRH.moduleName, 'customAttributes', flagData);
    const actorObj = Object.values(ui.windows).find((i) => i.id.includes(actor.id));
    if (actorObj) {
      await actorObj.close();
      actor.sheet.render(true);
    }
    let options;
    if (this.managerCoord) {
      options = { top: this.managerCoord.top, left: this.managerCoord.left };
    } else {
      options = {};
    }
    new OSRH.ManageCustomAttributes(actor).render(true, options);
    this.close();
  }
  _validateAttribData() {
    let isValid = true;
    if (this.attribute.name.length < 1) isValid = false;
    if (this.attribute.abbr.length < 3 || this.attribute.abbr.length > 3) isValid = false;
    return isValid;
  }

  async _showAttribBar() {
    return await game.settings.get(`${OSRH.moduleName}`, 'displaycustomAttrib');
  }
}
