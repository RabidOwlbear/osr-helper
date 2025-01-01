export const registerRations = () => {
  OSRH.ration = OSRH.ration || {};

  /* 
data: {
  character: array containing player character names to be checked,
  retainer: array containing the names of all active retainers to be checked.
  whisper: boolean true send message via whisper
}
*/



  OSRH.ration.eat = async function (actorId=null) {
    const tags = false//OSRH.systemData.tags;
    const qPath = OSRH.systemData.paths.itemQty;
    let actor
    if(!actorId){
      if(OSRH.util.singleSelected()){
        actor = canvas.tokens.controlled[0].actor
      }else{
        actor = await game.actors.find((a) => a.id == actorId)
      }
    }

    let rationOptions = '';
    actor.items.map(i=>{
      let isRat = i.flags?.['osr-helper']?.itemType === 'ration'
      // if(tags) {
      //   isRat = i.system.tags.find(t=>t.title === 'Ration') ? true : false
      // }
      // else {
      //   isRat = i.flags?.['osr-helper']?.itemType === 'ration'
      // };
      if(isRat){
        rationOptions += `<option value="${i.name}">${i.name}: ${OSRH.util.getNestedValue(i , qPath)}</option>`
      }
    })
    
   
    let dialogTemplate = `
    <h1> ${game.i18n.localize("OSRH.ration.pickType")}</h1>
    <div style="display:flex">
    <div  style="flex:1"><select id="ration">${rationOptions}</select></div>
    </div>`;
    new Dialog({
      title: game.i18n.localize("OSRH.ration.eatRation"),
      content: dialogTemplate,
      buttons: {
        rollAtk: {
          label: game.i18n.localize("OSRH.ration.eatRation"),
          callback: async function(html){
            
            let item = actor.items.getName(html.find('#ration')[0].value);
            let itemQty = OSRH.util.getNestedValue(item, qPath) - 1;
            if (itemQty <= 0) {
              await item.delete();
            } else {
              await item.update({[qPath ]: itemQty})
            }
          }
        },
        close: {
          label: game.i18n.localize("OSRH.customEffect.close"),
        }
      }
    }).render(true);
  };
  OSRH.RationConfig = class RationConfig extends FormApplication {
    constructor(item = null) {
      super();
      
      this.item = item;
      this.rationData = item?.flags?.["osr-helper"]?.rationData || OSRH.data.defaultRationSettings;
      this.rationData.name = item.name;

    }
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        title: 'OSRH Ration Config',
        classes: ['osrh', 'ration-config'],
        top: 120,
        left: 60,
        width: 250,
        height: 150,
        template: `modules/osr-helper/templates/ration-config-form.hbs`
      });
    }
  
    getData() {
      let context = super.getData();
      let rationData = this.rationData;
      let trackExp = typeof rationData !== 'undefined' ? this.rationData?.trackExpiration : true
      context.name = this.rationData?.namel;
      context.trackExpiration = trackExp;//this.rationData?.trackExpiration || true;
      context.rationDuration = this.rationData?.duration?.value || 7;
      context.durationType = this.rationData?.duration?.type || 'day'

      return context;
    }
    async activateListeners(html) {
      const durInp = html.find('#duration')[0];
      const durType = html.find('#duration-type')[0];
      const trackExpiration = html.find('#track-expiration')[0];
      const saveBtn = html.find('.save-btn')[0];
      durType.value = this.rationData.duration.type
      durInp.value = OSRH.util.convertFromSeconds(this.rationData.duration.value, this.rationData.duration.type);

      durInp.addEventListener('change', ev=>{
        ev.preventDefault();
        this.rationData.duration.value = Math.floor(OSRH.CONST.timeInc[durType.value] * parseInt(durInp.value));
      })
      durType.addEventListener('change', ev=>{
        ev.preventDefault();
        let newDur = OSRH.util.convertTime(this.rationData.duration.value, durType.value);
        durInp.value = newDur;
        this.rationData.duration.type = durType.value;


      })
      trackExpiration.addEventListener('change', ev=>{
        ev.preventDefault();
        this.rationData.trackExpiration = trackExpiration.checked;
      })
      saveBtn.addEventListener('click', ev=>{
        ev.preventDefault();
        this.item.setFlag('osr-helper', 'rationData', this.rationData);

        this.close()
      })
  
    }
    _updateObject(){
  
    }
  }
  OSRH.ration.handlePartyRations= async function(dur, durType){
    let sec = Math.floor(dur * OSRH.CONST.timeInc[durType])
    const party = OSRH.util.getPartyActors()?.party;
    let partyRations = []
    if(party){
      for(let p of party){
        partyRations = partyRations.concat(OSRH.util.getOSRHItems(p, 'ration'));
      }
    }
    if(partyRations.length){
      partyRations.map(async r=>{
        let data = await r.getFlag('osr-helper', 'rationData');
        if(!data){
          return
        }
        if(data.trackExpiration){
          let newDur = data.duration.value - sec
          if(newDur <= 0){
            const itemName = r.name
            console.log('Item', itemName,'in actor', r.parent.name, 'has expired')
            data.duration.value = 0;
            data.trackExpiration = false;
            
            await r.setFlag('osr-helper', 'rationData', data);
            await r.update({name: `${itemName} - Expired`});
         
          }else{
            data.duration.value = newDur;
            await r.setFlag('osr-helper', 'rationData', data);
          }
        }
        

      })
    }
  }


};