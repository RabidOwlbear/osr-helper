import { OSRHApp } from "./base/osr-app.mjs";

export class OSRHItemConfigV2 extends OSRHApp{

  constructor(options) {
    // const {items, ration} = options; //item = null, ration
    super();
    let itemType = options.item?.flags?.["osr-helper"]?.itemType;
    this.item = options.item;
    this.itemType = itemType ? itemType : 'none';
    this.dispRation = options.ration
  }
  static DEFAULT_OPTIONS = {
    id: 'osrh-app',
    position: {
      width: 300,
      height: 200
    },
    classes: ['osrh', 'item-config', 'v2'],
    tag: 'osrh-app', // The default is "div"
    // tabs: [{ navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'main' }],
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: 'OSRH Item Config' //localization string
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.drop' }],
    actions: {}
  };
  static PARTS = {
    main: {
      template: 'modules/osr-helper/templates/item-config-form.hbs'
    }
  };
  async _prepareContext(options) {
    let context = await super._prepareContext(options);
    context = foundry.utils.mergeObject(context, {});
    context.isLight = this.itemType === 'light';
    context.isRation = this.itemType === 'ration';
    context.dispRation = this.dispRation;
    context.dispAmmo = this.item.type === 'weapon';

    return context;
  }
  _onRender(context, options) {
    this.dragDrop.forEach((d) => d.bind(this.element));
    this._forceTabInit(context.tabs);
    const html = this.element;
    const select = html.querySelector('#item-type');
    const lightConfigBtn = html.querySelector('.light-config');
    const rationConfigBtn = html.querySelector('.ration-config');
    const ammoConfigBtn = html.querySelector('.ammo-config');
    const closeBtn = html.querySelector(".close-btn");
    let item = this.item
    lightConfigBtn.addEventListener('click', async (ev)=>{
      ev.preventDefault();
      //await OSRH.util.getItem(this.item)
      new OSRH.V2.lightConfig({item}).render(true, {top:this.position.top, left:this.position.left})
      this.close()
    })
    rationConfigBtn.addEventListener('click', async (ev)=>{
      ev.preventDefault();
      // let item = await OSRH.util.getItem(this.item);
      new OSRH.V2.rationConfig({item}).render(true, {top:this.position.top, left:this.position.left})
      this.close()
    })
    if(ammoConfigBtn){
      ammoConfigBtn.addEventListener('click', async (ev)=>{
        ev.preventDefault();
        let appOptions = {
          top:this.position.top, 
          left:this.position.left
        }
        let item = await OSRH.util.getItem(this.item);
        new OSRH.V2.AmmoConfig({item}).render(true, appOptions);
        this.close()
      })
    }
    if(this.itemType){
      select.value = this.itemType;
    }
    closeBtn.addEventListener('click', ev=>{
      ev.preventDefault();
      this.close()
    })

    select.addEventListener('change', async (ev)=>{
      ev.preventDefault();
      select.value === 'light' ? lightConfigBtn.classList.remove('hidden') : lightConfigBtn.classList.add('hidden');
      select.value === 'ration' ? rationConfigBtn.classList.remove('hidden') : rationConfigBtn.classList.add('hidden');
      let item = this.item//await OSRH.util.getItem(this.item);
      let itemType = select.value
      if(itemType == 'light' && !this.item.flags?.['osr-helper']?.lightItemData){        
        let lightData = foundry.utils.deepClone(OSRH.data.defaultLightSettings);
        lightData.name = item.name
        await item.setFlag('osr-helper', 'lightItemData', lightData)
      }
      if(itemType == 'ration' && !this.item.flags?.['osr-helper']?.rationData){        
        let rationData = OSRH.data.defaultRationSettings;
        rationData.name = item.name;
        await item.setFlag('osr-helper', 'rationData', rationData);
      }
      await item.setFlag('osr-helper', 'itemType', itemType);
      this.itemType = select.value;

    })
  }
}