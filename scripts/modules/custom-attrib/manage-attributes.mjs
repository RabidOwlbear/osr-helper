export class ManageCustomAttributes extends FormApplication {
  constructor(actor) {
    super();
    this.actor = actor;
    this.attributes = actor.flags?.[OSRH.moduleName]?.customAttributes;
  }
  static get defaultOptions() {
    returnfoundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize('OSRH.manageAttributes.title'), //'OSRH Custom Attribute Config',
      classes: ['osrh', 'manage-attributes'],
      id: 'OSRHManageAttributes',
      top: 120,
      left: 60,
      width: 350,
      height: 165,
      template: `modules/osr-helper/templates/custom-attribute/manage-attributes-form.hbs`
    });
  }
  async getData() {
    const context = super.getData();
    const attributes = this.actor.flags?.[OSRH.moduleName]?.customAttributes;
    context.maxAttrib = attributes?.length >= 6;
    context.attributes = attributes ? attributes : [];
    context.hasAttrib = context.attributes.length > 0;

    return context;
  }
  activateListeners(html) {
    const nameEls = [...html.find('.name')];
    const addBtn = html.find('.add-btn')[0];
    const delBtns = [...html.find('.delete-btn')];

    addBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const coord = { top: this.options.top, left: this.options.left };
      const blankAttrib = {
        id: randomID(),
        name: '',
        abbr: '',
        value: 0,
        items: []
      };

      new OSRH.CustomAttributeEdit(blankAttrib, this.actor._id, coord).render(true, { top: this.options.top, left: this.options.left });
      this.close()
    });

    nameEls.map((name) => {
      name.addEventListener('click', (e) => {
        e.preventDefault();
        const contEl = e.target.closest('.attrib-cont');
        const coord = { top: this.options.top, left: this.options.left };
        const attrib = this.attributes.find((i) => i.id == e.target.dataset.id);
        new OSRH.CustomAttributeEdit(attrib, this.actor._id, coord).render(true, coord);//{ top: e.y + 30, left: e.x });
        this.close();
      });
    });

    delBtns.map((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const position = { top: this.options.top, left: this.options.left };
        const actor = await game.actors.get(this.actor._id);
        const itemId = e.target.closest('.attrib-cont')?.dataset?.id;
        const newList = await foundry.utils.deepClone(this.attributes).filter((i) => i.id !== itemId);
        if (newList.length === 1 && newList[0].id === itemId) newList = [];
        await actor.setFlag(OSRH.moduleName, 'customAttributes', newList);
        const actorObj = Object.values(ui.windows).find((i) => i.id.includes(actor.id));
        if (actorObj) {
          await actorObj.close();
          actor.sheet.render(true);
        }
        // this.close()
        new OSRH.ManageCustomAttributes(actor).render(true, position);
      });
    });
    // this._handleItemDisplay(html);
  }
  _addAttribute(event) {
    const attrib = {
      id: randomID(),
      name: '',
      abbr: '',
      value: 0,
      items: []
    };
    new OSRH.CustomAttributeEdit(attrib, this.actor._id).render(true, { top: event.y + 75, left: event.x });
    this.close();
  }
  _deleteAttribute() {}
}
