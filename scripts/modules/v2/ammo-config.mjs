import { OSRHApp } from "./base/osr-app.mjs";
export class AmmoConfigV2 extends OSRHApp{
   constructor(options) {
    super();
    this.item = options.item;
  }

  static DEFAULT_OPTIONS = {
    id: 'osrh-ammo-config',
    position: {
      width: 250,
      height: 180
    },
    classes: ['osrh', 'ammo-config', 'v2'],
    tag: 'osrh-app', // The default is "div"
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: 'Ammo Config' //localization string
    },

    actions: {}
  };
  static PARTS = {
    main: {
      template: 'modules/osr-helper/templates/ammo-config-form.hbs'
    }
  };
  async _prepareContext(options) {
    let context = await super._prepareContext(options);
    context = foundry.utils.mergeObject(context, {});
    let ammoData = await this._getAmmoFlag()
    context.trackAmmo = ammoData?.trackAmmo
    context.ammoName = ammoData?.items?.[0] || '';
    return context;
  }
  _onRender(context, options) {
    const html = this.element;
    const addItemName = html.querySelector('#add-name-btn');
    const saveBtn = html.querySelector('#save-btn');
    const trackAmmo = html.querySelector('#track-ammo');
    let nameInputs = [...html.querySelectorAll('.item-name')];
    // const nameInpCont = html.find('.name-inputs')[0];
    const nameRows = [...html.querySelectorAll('.name-row')]
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

      let input = inp;
      input.addEventListener('blur', ev=>{
        ev.preventDefault();
        if(!input.value || input.value === ''){
          ui.notifications.warn(game.i18n.localize("OSRH.notification.invalidItemName"));
          input.focus()
        }
      })
    })
    saveBtn.addEventListener('click',async  ev=>{
      nameInputs = [...html.querySelectorAll('.item-name')];
      ev.preventDefault();
      let nameArr = []
      nameInputs.map(i=>{
        let inp = i
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