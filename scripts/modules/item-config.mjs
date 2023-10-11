export class OSRHItemConfig extends FormApplication {
  constructor(item = null, ration) {
    super();
    let itemType = item?.flags?.["osr-helper"]?.itemType;
    this.item = item;
    
    this.itemType = itemType ? itemType : 'none';
    // this.isLight = this.itemType === 'light' ? true : false;
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
      // dragDrop: [
      //   {
      //     dragSelector: '.item',
      //     dropSelector: '.items'
      //   }
      // ],
      template: `modules/osr-helper/templates/item-config-form.hbs`
    });
  }

  getData() {
    console.log(this.dispRation)
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
      // game.items.get(this.item._id)
      // console.log(item)
      new OSRH.lightConfig(item).render(true)
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
      console.log('select change',select.value, this.item,)
      let item = await OSRH.util.getItem(this.item);
      // if(this.item.actor && this.item.actor.prototypeToken.actorLink) {
      //   let actor = await game.actors.get(this.item.actor._id);
      //   item = await actor.items.get(this.item._id);
      // }else if(this.item.actor){
      //  item = await this.item.actor.items.get(this.item._id);
      // }else{
      //   item = await game.items.get(this.item._id);
      // };
      await item.setFlag('osr-helper', 'itemType', select.value);
      // console.log(item, select.value)
      this.itemType = select.value;
      // this.item = item;
      // this.render(true);
    })

  }
  _updateObject(){

  }
}
