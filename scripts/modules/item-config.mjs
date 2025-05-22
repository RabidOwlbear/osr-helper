export class OSRHItemConfig extends FormApplication {
  constructor(item = null, ration) {
    super();
    let itemType = item?.flags?.["osr-helper"]?.itemType;
    this.item = item;
    this.itemType = itemType ? itemType : 'none';
    this.dispRation = ration
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'OSRH Item Config',
      classes: ['osrh', 'item-config'],
      top: 120,
      left: 60,
      width: 250,
      height: 130,
      template: `modules/osr-helper/templates/item-config-form.hbs`
    });
  }

  getData() {
    let context = super.getData();
    context.isLight = this.itemType === 'light';
    context.isRation = this.itemType === 'ration';
    context.dispRation = this.dispRation;
    context.dispAmmo = this.item.type === 'weapon';
    return context;
  }
  async activateListeners(html) {

    const select = html.find('#item-type')[0];
    const lightConfigBtn = html.find('.light-config')[0];
    const rationConfigBtn = html.find('.ration-config')[0];
    const ammoConfigBtn = html.find('.ammo-config')[0];
    const closeBtn = html.find(".close-btn")[0];
    lightConfigBtn.addEventListener('click', async (ev)=>{
      ev.preventDefault();
      let item = this.item//await OSRH.util.getItem(this.item)
      new OSRH.lightConfig(item).render(true, {top:this.position.top, left:this.position.left})
      this.close()
    })
    rationConfigBtn.addEventListener('click', async (ev)=>{
      ev.preventDefault();
      // let item = await OSRH.util.getItem(this.item);
      new OSRH.RationConfig(this.item).render(true, {top:this.position.top, left:this.position.left})
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
        //set app size
        // let ammoFlag = await item.getFlag('osr-helper', 'ammunition');
        // if(ammoFlag?.itemNames.length){
        //   appOptions.height = Math.floor(150 + (ammoFlag.itemNames.length * 20))
        // }
        new OSRH.AmmoConfig(this.item).render(true, appOptions);
        this.close()
      })
    }
    
    closeBtn.addEventListener('click', ev=>{
      ev.preventDefault();
      this.close()
    })

    select.addEventListener('change', async (ev)=>{
      ev.preventDefault();
      select.value === 'light' ? lightConfigBtn.classList.remove('hidden') : lightConfigBtn.classList.add('hidden');
      select.value === 'ration' ? rationConfigBtn.classList.remove('hidden') : rationConfigBtn.classList.add('hidden');
      // select.value === 'ammo' ? ammoConfigBtn.classList.remove('hidden') : ammoConfigBtn.classList.add('hidden');
      // if(select.value === 'light'){
      //   configBtn.classList.remove('hidden');
      // } else {
      //   configBtn.classList.add('hidden');
      // }
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
  _updateObject(){

  }
}
