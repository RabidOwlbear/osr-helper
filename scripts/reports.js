Hooks.on('ready', () => {
  OSEH.report = OSEH.report || {};

  OSEH.report.ration = async function () {
    let actorObj = OSEH.util.getPartyActors();
    const Rations = [];
    for (let key in OSEH.data.food) {
      Rations.push(OSEH.data.food[key]);
    }
    
    let totalRations = 0;
    const { characters, retainer } = actorObj;

    const msgData = {
      characters: '',
      retainers: ''
    };
    const style = (qty) => {
      if (qty <= 1) return 'color: red';
      if (qty <= 2) return 'color: orangered';
      return 'color: green';
    };
    for (let key in actorObj) {
      for (let actor of actorObj[key]) {
        let actorRations = '';
        for (let type of Rations) {
          let ration = actor.data.items.getName(type);
          if (ration) {
            const qty = ration.data.data.quantity.value;
            const rStyle = style(qty);
            totalRations += qty;
            actorRations += `<li style="margin-left:10px;"><span style="${rStyle} ">${type}: ${ration.data.data.quantity.value}</span></li>`;
          }
        }
        
        if (actorRations == '') actorRations = '<span style="color: red">None</span>';
        
        msgData[key] += `<div style="margin-left: 10px;"><p><b> ${actor.name}</b>:</p><ul> ${actorRations} </ul></div>`;
      }
    }
    const daysLeft = Math.floor(totalRations / characters.length);
    let contents = `
  <details >
    <summary><strong>Ration Report</strong></summary>
    <br>
    <div style="border-bottom: 2px solid black; padding-bottom: 10px;"><b>Total Days left</b>: <span style="padding-left: 10px; ${style(
      daysLeft
    )}"><b>${daysLeft}</b></span></div>
    <br>
    <h3><b>Character Rations</b></h3>
    <div>
      ${msgData.characters} 
    </div>
    <h3><b>Retainer Rations</b></h3>
    <div>
      ${msgData.retainers}
    </div>
    </div>
  </details>`;
    ChatMessage.create({ content: contents, whisper: [game.user.id] });
  };

  OSEH.report.travelCalc = async function () {

    const initMod = 1;

    function partyHtml(actorObj, mod = 1) {
      // type == 'characters' ? type : type == 'retainers' ? type : null;
      let templateData = ``;
      
        for (let actor of actorObj) {
          let nameStr = actor.name.length >= 20 ? actor.name.slice(0, 19) + `...` : actor.name;
          templateData += `
        <div class="actor-div fx sb plr5">
            <div class="of-hide w140">${nameStr}</div>
            <div>${Math.floor(actor.data.data.movement.base / 5 * mod)} mi</div>
        </div>`;
        }
      
      return templateData
    }
    function getTravelData(mod){
      oseActive = game.modules.get('old-school-essentials')?.active;
      console.log(oseActive)
      encButtonTemplate = `    
        <h4>Encounter Roll</h4>
        <div class="btn-spcr"></div>
        <button type="button" id="enc-btn">Roll</button>`

      let encBtnHtml = oseActive ? encButtonTemplate : `<div style="height: 125px"></div>`
      const partyObj = OSEH.util.getPartyActors();
      let slowest = partyObj.party[0]?.data.data.movement.base;
      //find slowest rate
      partyObj.party.forEach((a) => {
        let rate = a.data.data.movement.base;
        if (slowest > rate) slowest = rate;
      });
      //convert to miles
      const convertedRate = Math.floor(slowest / 5 * mod);
      return { 
          baseRate: convertedRate, 
          html: {
            encButton: encBtnHtml,
            characters: partyHtml(partyObj.characters, mod), 
            retainers: partyHtml(partyObj.retainers, mod)},
          }
         
    }

    class travelReport extends Application {
      constructor(data) {
        /* 
        data: {
          baseRate: rate,
          templateData: 
        }
        
        */
        super();
        this.data = {
          baseRate: data.baseRate,
          tData: {
            baseRate: data.baseRate,
            characters: data.html.characters,
            retainers: data.html.retainers ,
            encButton: data.html.encButton,
          }
        };
        this.terrainMod = {
          trail: 1.5,
          road: 1.5,
          clear: 1,
          city: 1,
          grassland: 1,
          forest: 0.6,
          mud: 0.6,
          snow: 0.6,
          hill: 0.6,
          desert: 0.6,
          brokenLand: 0.6,
          mountain: 0.5,
          swamp: 0.5,
          jungle: 0.5,
          ice: 0.5,
          glacier: 0.5,
        };
        this.lostMod = {
          grassland: 1,
          clear: 1,
          swamp: 3,
          jungle: 3,
          desert: 3,
          allElse: 2,
        }

      }
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ['application', 'testApp'],
          popOut: true,
          template: 'modules/OSE-helper/templates/travel-report.html',
          id: 'oseTravelReport',
          title: 'Adventure ahoy!',
          width: 400,
        });
      }
      getData() {
        // Send data to the template
        return this.data.tData;
      }
      activateListeners(html) {
        super.activateListeners(html);
        const terrain = html.find(`[type="radio"][checked]`)[0].value
        
        const radioInputs = html.find('[name="terrain"]');
        const lostBtn = html.find('#nav-check')[0];
        const forageBtn = html.find('#forage-check')[0];
        const encBtn = html.find('#enc-btn')[0];
        const closeBtn = html.find('#close-btn')[0];
        closeBtn.addEventListener('click', ()=>{ this.close()})
        if(encBtn){
          encBtn.addEventListener('click', (ev)=>{
            console.log('test')
            this.rollEnc()
            
          })
        }
        lostBtn.addEventListener('click', (ev)=>{
          this.lostRoll()})
          forageBtn.addEventListener('click', (ev)=>{
            this.forageCheck()
          })
        for (let input of radioInputs) {
          
          input.addEventListener('input', (ev) => {
            const html = document.querySelector('[type="radio][checked]');
            const mod = this.terrainMod[ev.srcElement.value];
            // const modRate = Math.floor(this.data.baseRate * this.terrainMod[ev.srcElement.value]);
            this.updatePartyDist(mod);
          });
        }

      }

      async lostRoll(){
        const radio = document.querySelector(`[name=terrain]:checked`).value;
        const bonus = document.querySelector(`#nav-bonus`)
        
        if(radio == 'road' || radio == 'trail'){
          ui.notifications.warn('Cannot get lost on roads or trails')
          return
        }
        let roll = await new Roll(`1d6 + ${bonus.value}`).evaluate()
        let target = this.lostMod[radio] || 2;
        console.log(roll, target)
        if(roll.total <= target){
          roll.toMessage({
            whisper: [game.user],
            flavor: `
            <h3>Navigation Check: ${radio}</h3>
            <span style="color: red">The party got lost.</span>`
          })
        } else {
          roll.toMessage({
            whisper: [game.user],
            flavor: `
            <h3>Navigation Check: ${radio}</h3>
            The party found their way.
            `
          })
        }
        console.log('fired')
        bonus.value = 0

      }
      rollEnc(){
        OSE.util.wildEncounter()
      }
      async forageCheck(){
        const modEl = document.getElementById('forage-bonus')
        const mod = parseInt(modEl.value);
        const terrain = document.querySelector(`[name=terrain]:checked`).value
        let roll = await new Roll(`1d6 + ${mod}`).evaluate();
        
        if(roll.total <= 3){
          roll.toMessage({
            whisper: [game.user],
            flavor: `
            <h3>Forage check: ${terrain}</h3>
            <div><span style="color: red"><b>Foraging unsuccessful.</b></span></div>
            `
          })
        }else{
          roll.toMessage({
            whisper: [game.user],
            flavor: `
            <h3>Forage check: ${terrain}</h3>
            <div><span style="color: green"><b>Foraging successful.</b></span></div>
            `
          })
        }
        modEl.value = 0
      }

      updatePartyDist(mod) {
        const rateEl = document.getElementById('BTR');
        const charEl = document.getElementById('character-list');
        const retEl = document.getElementById('retainer-list');
        const upData = getTravelData(mod)
        

        rateEl.innerText = upData.baseRate;
        charEl.innerHTML = upData.html.characters;
        retEl.innerHTML = upData.html.retainers;
      }
    }
    new travelReport(getTravelData(initMod)).render(true);
  };
});
