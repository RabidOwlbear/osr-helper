export class OSRHItemConfig extends FormApplication {
  constructor(item = null, ration) {
    super();
    let itemType = item?.flags?.["osr-helper"]?.itemType;
    this.item = item;
    
    this.itemType = itemType ? itemType : 'none';
    this.dispRation = ration
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: 'OSRH Item Config',
      classes: ['osrh', 'item-config'],
      top: 120,
      left: 60,
      width: 250,
      height: 110,
      template: `modules/osr-helper/templates/item-config-form.hbs`
    });
  }

  getData() {
    let context = super.getData();
    

    context.isLight = this.itemType === 'light';
    context.dispRation = this.dispRation;
    return context;
  }
  async activateListeners(html) {

    const select = html.find('#item-type')[0];
    const configBtn = html.find('.light-config')[0];
    const closeBtn = html.find(".close-btn")[0];
    configBtn.addEventListener('click', async (ev)=>{
      ev.preventDefault();
      let item = await OSRH.util.getItem(this.item)
      new OSRH.lightConfig(item).render(true, {top:this.position.top, left:this.position.left})
      this.close()
    })
    closeBtn.addEventListener('click', ev=>{
      ev.preventDefault();
      this.close()
    })

    select.addEventListener('change', async (ev)=>{
      ev.preventDefault();
      
      if(select.value === 'light'){
        configBtn.classList.remove('hidden');
      } else {
        configBtn.classList.add('hidden');
      }
      let item = await OSRH.util.getItem(this.item);
     
      await item.setFlag('osr-helper', 'itemType', select.value);
      this.itemType = select.value;

    })

  }
  _updateObject(){

  }
}
