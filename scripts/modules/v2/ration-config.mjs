import { OSRHApp } from './base/osr-app.mjs';

export class RationConfigV2 extends OSRHApp {
  constructor(options) {
    super(options);
    this.item = options.item;
    this.rationData = options.item?.flags?.['osr-helper']?.rationData || OSRH.data.defaultRationSettings;
    this.rationData.name = options.item.name;
  }

  static DEFAULT_OPTIONS = {
    id: 'osrh-app',
    position: {
      width: 250,
      height: 200,
    },
    classes: ['osrh', 'ration-config', 'v2'],
    tag: 'osrh-app', // The default is "div"
    // tabs: [{ navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'main' }],
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: '' //localization string
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.drop' }],
    actions: {}
  };
  static PARTS = {
    main: {
      template: 'modules/osr-helper/templates/ration-config-form.hbs'
    }
  };
  async _prepareContext(options) {
    let context = await super._prepareContext(options);
    context = foundry.utils.mergeObject(context, {});
    let rationData = this.rationData;
    let trackExp = typeof rationData !== 'undefined' ? this.rationData?.trackExpiration : true;
    context.name = this.rationData?.namel;
    context.trackExpiration = trackExp;
    context.rationDuration = this.rationData?.duration?.value || 7;
    context.durationType = this.rationData?.duration?.type || 'day';

    return context;
  }
  _onRender(context, options) {
    super._onRender(context);
    const html = this.element;
    const durInp = html.querySelector('#duration');
    const durType = html.querySelector('#duration-type');
    const trackExpiration = html.querySelector('#track-expiration');
    const saveBtn = html.querySelector('.save-btn');
    durType.value = this.rationData.duration.type;
    durInp.value = OSRH.util.convertFromSeconds(this.rationData.duration.value, this.rationData.duration.type);

    durInp.addEventListener('change', (ev) => {
      ev.preventDefault();
      this.rationData.duration.value = Math.floor(OSRH.CONST.timeInc[durType.value] * parseInt(durInp.value));
    });
    durType.addEventListener('change', (ev) => {
      ev.preventDefault();
      let newDur = OSRH.util.convertTime(this.rationData.duration.value, durType.value);
      durInp.value = newDur;
      this.rationData.duration.type = durType.value;
    });
    trackExpiration.addEventListener('change', (ev) => {
      ev.preventDefault();
      this.rationData.trackExpiration = trackExpiration.checked;
    });
    saveBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.item.setFlag('osr-helper', 'rationData', this.rationData);

      this.close();
    });
  }
}
