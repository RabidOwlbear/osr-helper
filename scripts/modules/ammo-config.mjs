export class AmmoItemConfig extends FormApplication {
  constructor(item) {
    super();
    this.item = item;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'OSRH Ammunition Config',
      classes: ['osrh', 'ammo-config'],
      top: 120,
      left: 60,
      width: 250,
      height: 160,
      template: `modules/osr-helper/templates/ammo-config-form.hbs`
    });
  }

  async getData() {
    let context = super.getData();
    let ammoData = await this._getAmmoFlag()
    context.trackAmmo = ammoData?.trackAmmo
    context.ammoName = ammoData?.items?.[0] || '';
    // context.nameInputs = this._initNames(ammoData.itemNames);
    return context;
  }
  async activateListeners(html) {
    const addItemName = html.find('#add-name-btn')[0]
    const saveBtn = html.find('#save-btn')[0];
    const trackAmmo = html.find('#track-ammo')[0];
    let nameInputs = html.find('.item-name');
    // const nameInpCont = html.find('.name-inputs')[0];
    const nameRows = html.find('.name-row')
    //name row delete listener
    nameRows.map(i=>{
      let nameRow = nameRows[i]
      
      let btn = nameRow.querySelector('.name-del');
      btn?.addEventListener('click', ev=>{
        ev.preventDefault();
        nameRow?.remove()
      })
    })

    nameInputs.map(inp=>{
      let input = nameInputs[inp];
      input.addEventListener('blur', ev=>{
        ev.preventDefault();
        if(!input.value || input.value === ''){
          ui.notifications.warn(game.i18n.localize("OSRH.notification.invalidItemName"));
          input.focus()
        }
      })
    })
    saveBtn.addEventListener('click',async  ev=>{
      nameInputs = html.find('.item-name');
      ev.preventDefault();
      let nameArr = []
      nameInputs.map(i=>{
        let inp = nameInputs[i]
        nameArr.push(inp.value);
      });
      if(this._validateNameInputs(nameArr)){
        await this._setAmmoFlag(trackAmmo.checked, nameArr);
        this.close()
      }
      
    })


  
  }
  _validateNameInputs(arr){
    let isValid = true
    for(let i of arr){
      isValid = i.length > 0;
      if(!isValid){
        ui.notifications.warn(game.i18n.localize("OSRH.util.notification.ammoNameRequiredAll"));
        return isValid;
      }
    }
    return isValid
  }

  _getAmmoFlag = async function (){
    return await this.item.getFlag('osr-helper', 'ammunition')
  }
  _setAmmoFlag = async function (checked, nameArr){
    let data = {
      trackAmmo: checked,
      items: nameArr
    }
    await this.item.setFlag('osr-helper', 'ammunition', data);
    
  }
  _setHeight(){

  }
  _initNames(arr=false){
    if(!arr || !arr.length){
      return  `<input class="item-name" type="text">`
    }
    let retVal = `<input class="item-name" type="text" value="${arr.shift()}">`
    for(let name of arr){
      retVal += `<div class="name-row">
      <input class="item-name" type="text" value="${name}">
      <a class="name-del"><i class="fa-solid fa-square-minus"></i></a>
      </div>`
    }
    return retVal
  }
  _addNameRow(contEl){
    const nameInp = document.createElement('input');
    nameInp.type = 'text';
    nameInp.classList.add('item-name');
    const nameRow = document.createElement('div');
    const delBtn = document.createElement('a');
    const icon = document.createElement('i');
    nameRow.classList.add('name-row'); 
    icon.classList.add('fa-solid','fa-square-minus')
   
    delBtn.appendChild(icon)
    nameRow.appendChild(nameInp);
    nameRow.appendChild(delBtn)
    delBtn.addEventListener('click', ev=>{
      ev.preventDefault();
      delBtn.parentElement.remove();
    })
    contEl?.appendChild(nameRow)
  }
}
