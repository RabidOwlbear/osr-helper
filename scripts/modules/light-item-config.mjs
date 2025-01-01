export class lightConfig extends FormApplication {
  constructor(item = null){
    super();
    this.html;
    this.item = item;
    const flag = this.item?.getFlag(`${OSRH.moduleName}`, 'lightItemData');
    this.lightFlag = flag ? flag : null
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'Light Item Config',
      classes: ['osrh', 'light-item-config'],
      top: 120,
      left: 60,
      width: 300,
      height: 625,
      dragDrop: [
        {
          dragSelector: '.item',
          dropSelector: '.items'
        }
      ],
      template: `modules/osr-helper/templates/light-config-form.hbs`
    });
  }
  
  getData() {
    let flag = this.item?.getFlag(`${OSRH.moduleName}`, 'lightItemData');
    let context = super.getData();
    // Send data to the template
    context = foundry.utils.mergeObject(context, {
      startItem: this.item ? true : false,
      img: this.item?.img || null,
      name: this.item?.name ? this.item.name : '',
      dim: flag?.dim ? flag.dim : 30,
      bright: flag?.bright ? flag.bright : 10,
      color: flag?.color ? flag.color : '#ff7b24',
      dur: flag?.duration ? flag.duration : 60,
      alpha: flag?.alpha ? flag.alpha : flag?.alpha === 0 ? 0 :0.5,
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
      attenuation: flag?.attenuation ? flag.attenuation : 0.5,
    });
    return context
  }
 activateListeners(html) {
  this.html = html;
  super.activateListeners(html);
  const updateBtn = html.find('#update-btn')[0];
  const closeBtn = html.find('#close-btn')[0];
  let inputsA = html.find('.light-config-input.type-a');
  let inputsB = html.find('.light-config-input.type-b')
  
  let anim = html.find(`option.animation[value="${this?.lightFlag?.animation}"]`)[0];
  let coloration = html.find(`option.coloration[value="${this?.lightFlag?.coloration}"]`)[0];
  if(anim)anim.selected = true;
  if(coloration)coloration.selected = true;


  closeBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    this.close();
  });
  // update button
  updateBtn.addEventListener('click', async (ev) => {
    let inputs = html.find('.light-config-input');
    let formData = {};
    for (let i of inputs) {
      if (i.id === 'duration' && i.value === 'inf') {
        formData[i.id] = i.value;
        continue;
      }
      let value =
        i.type == 'color'
          ? i.value
          : i.id == 'alpha'
          ? parseFloat(i.value)
          : i.id == 'luminosity'
          ? parseFloat(i.value)
          : i.id == 'attenuation'
          ? parseFloat(i.value)
          : i.id == 'animation'
          ? i.value
          : parseInt(i.value);
      formData[i.id] = value;
      if(i.id == 'animation' && i.value == 'none') value = null;

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
      if(input.dataset.alert && ev.target.value <= 0)ev.target.value = 1;
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
 async _onDrop(event){
  const data = TextEditor.getDragEventData(event);
  const itemTypes = OSRH.systemData[game.system.id].lightItemTypes
  if(data.type === 'Item'){
    const item = await fromUuid(data.uuid);
    if( !item || !itemTypes.includes(item.type)){ 
      const types = itemTypes.join(', ')
      ui.notifications.warn(`Invalid Item Type. Valid Item Types Include ${types}`).
      return
    }else{
      this.item = item
      const pCont =this.html[0].querySelector('#portrait-cont');
      const imgEl = this.html[0].querySelector('.item-image');
      const nameEl = this.html[0].querySelector(".item-name");
      const dropzone = this.html[0].querySelector(".dropzone");
      // hide dropzone
      // dropzone.style.display = 'none';
      // unhide portrait cont
      // pCont.classList.add('portrait-cont');
      // imgEl.src = item.img;
      // nameEl.innerText = item.name
      new OSRH.lightConfig(this.item).render(true,{top:this.position.top, left: this.position.left});
      this.close();
    }

    

  }
  

}
_onDragStart(event){
  try {
    const data = event.target.dataset
          const dragData = {
      uuid: data.uuid,
      type: 'Actor'
    }
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  } catch{
    return false
  }
    return true
}
}
