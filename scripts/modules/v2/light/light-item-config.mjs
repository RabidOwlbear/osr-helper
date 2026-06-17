import { OSRHApp } from '../base/osr-app.mjs';

export class LightConfigV2 extends OSRHApp {
  // options:
  // {
  //    item: <Item object>,
  // }
  constructor(options) {
    super(options);
    this.dragDrop = this._createDragDropHandlers();
    this.html;
    this.item = options?.item;
    const flag = this.item?.getFlag(`${OSRH.moduleName}`, 'lightItemData');
    this.lightFlag = flag ? flag : null;
  }

  static DEFAULT_OPTIONS = {
    id: 'osrh-app',
    position: {
      width: 300,
      height: 625
    },
    classes: ['osrh', 'light-item-config', 'v2'],
    tag: 'osrh-app', // The default is "div"
    // tabs: [{ navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'main' }],
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: 'Light Item Config' //localization string
    },
    dragDrop: [{ dragSelector: '.item', dropSelector: '.items' }],
    actions: {}
  };
  static PARTS = {
    main: {
      template: `modules/osr-helper/templates/light-config-form.hbs`
    }
  };
  async _prepareContext(options) {
    let flag = this.item?.getFlag(`${OSRH.moduleName}`, 'lightItemData');
    let context = await super._prepareContext(options);
    context = foundry.utils.mergeObject(context, {
      startItem: this.item ? true : false,
      img: this.item?.img || null,
      name: this.item?.name ? this.item.name : '',
      dim: flag?.dim ? flag.dim : 30,
      bright: flag?.bright ? flag.bright : 10,
      color: flag?.color ? flag.color : '#ff7b24',
      dur: flag?.duration ? flag.duration : 60,
      alpha: flag?.alpha ? flag.alpha : flag?.alpha === 0 ? 0 : 0.5,
      alert: flag?.alert ? flag.alert : 1,
      angle: flag?.angle ? flag.angle : 360,
      warn: flag?.warn ? flag.warn : flag?.warn === 0 ? 0 : 3,
      animation: flag?.animation ? flag.animation : 'flame',
      speed: flag?.speed ? flag.speed : 3,
      intensity: flag?.intensity ? flag.intensity : 5,
      coloration: flag?.coloration ? flag.coloration : '1',
      luminosity: flag?.luminosity ? flag.luminosity : 0.4,
      bgSat: flag?.bgSat ? flag.bgSat : 0,
      bgCont: flag?.bgCont ? flag.bgCont : 0,
      bgShadow: flag?.bgShadow ? flag.bgShadow : 0,
      attenuation: flag?.attenuation ? flag.attenuation : 0.5
    });

    return context;
  }
  _onRender(context, options) {
    this.dragDrop.forEach((d) => d.bind(this.element));
    this._forceTabInit(context.tabs);
    const html = this.element;
    this.html = html;

    const updateBtn = html.querySelector('#update-btn');
    const closeBtn = html.querySelector('#close-btn');
    let inputsA = html.querySelectorAll('.light-config-input.type-a');
    let inputsB = html.querySelectorAll('.light-config-input.type-b');

    let anim = html.querySelector(`option.animation[value="${this?.lightFlag?.animation}"]`);
    let coloration = html.querySelector(`option.coloration[value="${this?.lightFlag?.coloration}"]`);
    if (anim) anim.selected = true;
    if (coloration) coloration.selected = true;
    closeBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.close();
    });
    // update button
    updateBtn.addEventListener('click', async (ev) => {
      let inputs = [...html.querySelectorAll('.light-config-input')];
      let formData = {};
      for (let i of inputs) {
        if (i.id === 'duration' && i.value === 'inf') {
          formData[i.id] = i.value;
          continue;
        }
        let value = i.type == 'color' ? i.value : i.id == 'alpha' ? parseFloat(i.value) : i.id == 'luminosity' ? parseFloat(i.value) : i.id == 'attenuation' ? parseFloat(i.value) : i.id == 'animation' ? i.value : parseInt(i.value);
        formData[i.id] = value;
        if (i.id == 'animation' && i.value == 'none') value = null;
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
        if (input.dataset.alert && ev.target.value <= 0) ev.target.value = 1;
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
  _onDragStart(event) {
    try {
      const data = event.target.dataset;
      const dragData = {
        uuid: data.uuid,
        type: 'Actor'
      };
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    } catch {
      return false;
    }
    return true;
  }
  async _onDrop(event) {
    const data = Math.floor(game.version) < 13 ? TextEditor.getDragEventData(event) : foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const itemTypes = OSRH.systemData.lightItemTypes;
    if (data.type === 'Item') {
      const item = await fromUuid(data.uuid);
      if (!item || !itemTypes.includes(item.type)) {
        const types = itemTypes.join(', ');
        ui.notifications.warn(`Invalid Item Type. Valid Item Types Include ${types}`).return;
      } else {
        this.item = item;
        const pCont = this.html.querySelector('#portrait-cont');
        const imgEl = this.html.querySelector('.item-image');
        const nameEl = this.html.querySelector('.item-name');
        const dropzone = this.html.querySelector('.dropzone');
        new OSRH.V2.lightConfig({ item: this.item }).render(true, { top: this.position.top, left: this.position.left });
        // new OSRH.lightConfig(this.item).render(true, { top: this.position.top, left: this.position.left });
        this.close();
      }
    }
  }
}
