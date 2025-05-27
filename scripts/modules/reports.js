export const registerReports = () => {
  OSRH.report = OSRH.report || {};

  OSRH.report.actorItem = async function (actor=null) {
    let turnData = game.settings.get('osr-helper', 'turnData');
    if(!actor){
      if(OSRH.util.singleSelected()){
        actor = canvas.tokens.controlled[0].actor
      }else{
        return
      }
    }
    const systemData = OSRH.systemData
    const lightItems = OSRH.util.getOSRHItems(actor, 'light');
    const rationItems = OSRH.util.getOSRHItems(actor, 'ration');
    // const Rations = [];
    // const Lights = [];
    let totalRations = 0;

    // for (let key in OSRH.data.food) {
    //   Rations.push(key);
    // }
    // for (let key in OSRH.data.lightSource) {
    //   Lights.push(key);
    // }

    const msgData = {
      food: '',
      light: ''
    };

    // for (let name of Rations) {
    for (let ration of rationItems) {
      let rationData = ration.getFlag('osr-helper', 'rationData');
      let expText = turnData.global.trackRationExp ? `<div>- ${game.i18n.localize("OSRH.report.expires")}: ${OSRH.util.convertTime(rationData.duration.value, rationData.duration.type)} 
      ${rationData.duration.type}</div> `:'';
      let actorItem = '';
      // let ration = actor.items.getName(OSRH.data.food[name]);

        const rationQty = OSRH.util.getNestedValue(ration, systemData.paths.itemQty)//ration.system.quantity.value;

        totalRations += rationQty;
        let style = 'color: green';
        if (rationQty <= 2) style = 'color: orangered';
        if (rationQty <= 1) style = 'color: red';
        actorItem += `<li><div style="${style}">${ration.name/*OSRH.data.food[name]*/}: ${rationQty}</div></li>`;
        msgData.food += `<div>${ration.name}: <span style="${style}">${rationQty}</span></div>${expText}`
        //`<div><p> ${ration.name/*OSRH.data.food[name]*/}:</p><ul>` + actorItem + `</ul></div>`;
    }
    // for (let name of Lights) {
      for (let light of lightItems) {
      let actorItem = '';

      // let light = actor.items.getName(OSRH.data.lightSource[name].name);
      if (light) {
        const lightQty = OSRH.util.getNestedValue(light, systemData.paths.itemQty)//light.system.quantity.value;

        let style = 'color: green';
        if (lightQty <= 2) style = 'color: orangered';
        if (lightQty <= 1) style = 'color: red';
        actorItem += `<li>${light.name}: <span style="${style}">${lightQty}</span></li>`;
        msgData.light += `<div>${light.name}: <span style="${style}">${lightQty}</span></div>`
        //`<div><p> ${light.name/*OSRH.data.lightSource[name].name*/}:</p><ul>` + actorItem + `</ul></div>`;
      };
    }
    let ratStyle = 'color: green;';
    if (totalRations <= 3) ratStyle = 'color: orangeRed;';
    if (totalRations <= 1) ratStyle = 'color: red;';

    const rationText = totalRations <= 0 ? `<ul><li><span style="color: red;">${game.i18n.localize("OSRH.report.none")}</span></li></ul>` : msgData.food;
    const lightText = msgData.light == '' ? `<ul><li><span style="color: red;">${game.i18n.localize("OSRH.report.none")}</span></li></ul>` : msgData.light;
    let contents = `
    <div class="osrh-report-msg">
      <details >
      <summary><strong>${game.i18n.localize("OSRH.report.suppliesReport")}</strong></summary>
      <br>
      <div >
        <br>
        <div style="${ratStyle}">${game.i18n.localize("OSRH.report.daysRations")}: ${totalRations}</div>
        <br>
        <h3>${game.i18n.localize("OSRH.report.charRations")}:</h3>
        <div>
          ${rationText}
        </div>
        <h3>${game.i18n.localize("OSRH.report.charLightSource")}:</h3>
        <div>
          ${lightText}
        </div>
      </div>
      </details>
    </div>
    `;
    ChatMessage.create({ content: contents, whisper: [game.user.id] });
  };

  OSRH.report.ration = async function () {
    let actorObj = OSRH.util.getPartyActors();
    let turnData = game.settings.get('osr-helper', 'turnData')
    const systemData = OSRH.systemData
    const Rations = [];
    for (let key in OSRH.data.food) {
      Rations.push(OSRH.data.food[key]);
    }

    let totalRations = 0;

    const msgData = {
      characters: '',
      retainers: ''
    };
    const style = (qty) => {
      let color = qty <= 2 ? 'color: orangered' : qty <= 1 ? 'color: red' : 'color: green';
      return color;
    };

    for (let partyMember of actorObj.party) {
      let type = partyMember?.system?.retainer?.enabled ? 'retainers' : "characters";
      let actorRations = '';
      let rationItems = OSRH.util.getOSRHItems(partyMember,'ration');
      
      for (let ration of rationItems){//(let type of Rations) {
        // let ration = partyMember.items.getName(type);
        //if (ration) {
          let rationData = ration.getFlag('osr-helper', 'rationData');
          let expText = turnData?.global?.trackRationExp ? `<div>${game.i18n.localize("OSRH.report.expires")}: ${OSRH.util.convertTime(rationData.duration.value, rationData.duration.type)} 
          ${rationData.duration.type}</div> `:'';
          const qty = OSRH.util.getNestedValue(ration, systemData.paths.itemQty)//ration.system.quantity.value;
          const rStyle = style(qty);
          totalRations += qty;
          actorRations += `
          <li style="margin-left:10px;"><div style="${rStyle} ">${ration.name}: ${qty} </div>${expText}</li>
          `;
        //}
      }

      if (actorRations == '') actorRations = '<span style="color: red">None</span>';

      msgData[
        type
      ] += `<div style="margin-left: 10px;"><p><b> ${partyMember.name}</b>:</p><ul> ${actorRations} </ul></div>`;
    }
    const daysLeft = Math.floor(totalRations / actorObj.party.length);
    let contents = `
    <div class="osrh-report-msg">
  <details >
    <summary><strong>${game.i18n.localize("OSRH.report.rationReport")}</strong></summary>
    <br>
    <div style="border-bottom: 2px solid black; padding-bottom: 10px;"><b>${game.i18n.localize("OSRH.report.totaldaysleft")}</b>: <span style="padding-left: 10px; ${style(
      daysLeft
    )}"><b>${daysLeft}</b></span></div>
    <br>
    <h3><b>${game.i18n.localize("OSRH.report.charRations")}</b></h3>
    <div>
      ${msgData.characters} 
    </div>
    <h3><b>${game.i18n.localize("OSRH.report.retainerRations")}</b></h3>
    <div>
      ${msgData.retainers}
    </div>
    </div>
  </details>
    </div>
    `;
    ChatMessage.create({ content: contents, whisper: [game.user.id] });
  };

  OSRH.report.TravelReport = class travelReport extends Application {
    constructor() {
      super();
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
        glacier: 0.5
      };
      this.lostMod = {
        grassland: 1,
        clear: 1,
        swamp: 3,
        jungle: 3,
        desert: 3,
        allElse: 2
      };
      this.systemData = OSRH.systemData;
    }
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['application', 'testApp'],
        popOut: true,
        template: `modules/${OSRH.moduleName}/templates/travel-report.hbs`,
        id: 'osrTravelReport',
        title: game.i18n.localize("OSRH.report.travelTitle"),
        width: 400
      });
    }
    getData() {
      const context = super.getData();
      // Send data to the template
      const partyObj = OSRH.util.getPartyActors();
      // get slowest
      let slowest;

      if (partyObj.party.length) {
        slowest = parseInt(OSRH.util.getNestedValue(partyObj.party[0], this.systemData.paths.encMov))//partyObj.party[0].system.movement.base;
        partyObj.party.forEach((a) => {
          let rate = parseInt(OSRH.util.getNestedValue(a, this.systemData.paths.encMov))//a.system.movement.base;
          if (slowest > rate) slowest = rate;
        });
      }

      //convert to miles
      context.baseRate = Math.floor((slowest * this.systemData.baseMovMod) / 5);
      context.ose = game.modules.get('old-school-essentials')?.active || false;
      context.characters = this.partyData(partyObj.characters);
      context.retainers = this.partyData(partyObj.retainers);
      context.retainer = partyObj.retainers;
      
      return context; //this.data.tData;
    }
    activateListeners(html) {
      super.activateListeners(html);
      const terrain = html.find(`[type="radio"][checked]`)[0].value;

      const radioInputs = html.find('[name="terrain"]');
      const lostBtn = html.find('#nav-check')[0];
      const forageBtn = html.find('#forage-check')[0];
      const encBtn = html.find('#enc-btn')[0];
      const closeBtn = html.find('#close-btn')[0];
      closeBtn.addEventListener('click', () => {
        this.close();
      });
      if (encBtn) {
        encBtn.addEventListener('click', (ev) => {
          this.rollEnc();
        });
      }
      lostBtn.addEventListener('click', (ev) => {
        this.lostRoll();
      });
      forageBtn.addEventListener('click', (ev) => {
        this.forageCheck();
      });
      for (let input of radioInputs) {
        input.addEventListener('input', (ev) => {
          const html = document.querySelector('[type="radio][checked]');
          const mod = this.terrainMod[ev.srcElement.value];
          // const modRate = Math.floor(this.data.baseRate * this.terrainMod[ev.srcElement.value]);
          this.updatePartyDist(mod);
        });
      }
    }
    partyData(actorObj, mod = 1) {
      let data = [];
      for (let actor of actorObj) {
        let mov = parseInt(OSRH.util.getNestedValue(actor, this.systemData.paths.encMov)) * this.systemData.baseMovMod;

        data.push({
          name: actor.name.length >= 20 ? actor.name.slice(0, 19) + `...` : actor.name,
          distance: Math.floor((mov / 5) * mod)
        });
      }
      return data;
    }
    async lostRoll() {
      const radio = document.querySelector(`[name=terrain]:checked`).value;
      const bonus = document.querySelector(`#nav-bonus`);
      const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
      if (radio == 'road' || radio == 'trail') {
        ui.notifications.warn(game.i18n.localize("OSRH.report.cantGetLost"));
        return;
      }
      let roll = await new Roll(`1d6 + ${bonus.value}`).evaluate({ async: true });
      let target = this.lostMod[radio] || 2;

      if (roll.total <= target) {
        let data = {
          whisper: [game.user],
          flavor: `
          <h3>${game.i18n.localize("OSRH.report.navCheck")}: ${radio}</h3>
          <span style="color: red">${game.i18n.localize("OSRH.report.navCheckFail")}</span>`
        };
        await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
        ChatMessage.create(data);
      } else {
        let data = {
          whisper: [game.user],
          flavor: `
          <h3>${game.i18n.localize("OSRH.report.navCheck")}: ${radio}</h3>
          ${game.i18n.localize("OSRH.report.navCheckSuccess")}
          `
        };
        await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
        ChatMessage.create(data);
      }

      bonus.value = 0;
    }
    rollEnc() {
      OSE.util.wildEncounter();
    }
    async forageCheck() {
      const modEl = document.getElementById('forage-bonus');
      const mod = parseInt(modEl.value);
      const terrain = document.querySelector(`[name=terrain]:checked`).value;
      const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
      let roll = await new Roll(`1d6 + ${mod}`).roll({ async: true });
      if (roll.total <= 3) {
        let cData = {
          user: game.user.id,
          whisper: gm,
          roll: roll,
          flavor: `
          <h3>${game.i18n.localize("OSRH.report.forageCheck")}: ${terrain}</h3>
          <div><span style="color: red"><b>${game.i18n.localize("OSRH.report.forageFail")}</b></span></div>
          `
        };
        await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
        ChatMessage.create(cData);
      } else {
        let cData = {
          user: game.user.id,
          whisper: gm,
          roll: roll,
          flavor: `
          <h3>${game.i18n.localize("OSRH.report.forageCheck")}: ${terrain}</h3>
          <div><span style="color: green"><b>${game.i18n.localize("OSRH.report.forageSuccess")}</b></span></div>
          `
        };
        await game?.dice3d?.showForRoll(roll, game.user, false, gm, false);
        ChatMessage.create(cData);
      }
      modEl.value = 0;
    }

    async updatePartyDist(mod) {
      const rateEl = document.getElementById('BTR');
      const charEl = document.getElementById('character-list');
      const retEl = document.getElementById('retainer-list');
      const upData = await this.getTravelData(mod);

      rateEl.innerText = upData.baseRate;
      charEl.innerHTML = upData.html.characters;
      retEl.innerHTML = upData.html.retainers;
    }
    async getTravelData(mod) {
      const partyObj = OSRH.util.getPartyActors();
      let slowest = parseInt(OSRH.util.getNestedValue(partyObj.party[0], this.systemData.paths.encMov));
      partyObj.party.forEach((a) => {
        let rate = OSRH.util.getNestedValue(a, this.systemData.paths.encMov)
        if (slowest > rate) slowest = rate;
      });
      // let slowest = partyObj.party[0]?.system.movement.base;
      // //find slowest rate
      // partyObj.party.forEach((a) => {
      //   let rate = a.system.movement.base;
      //   if (slowest > rate) slowest = rate;
      // });
      //convert to miles
      const convertedRate = Math.floor((slowest / 5) * mod);
      let retData = {
        baseRate: convertedRate,
        data: {
          characters: this.partyData(partyObj.characters, mod),
          retainers: this.partyData(partyObj.retainers, mod)
        },
        html: {}
      };
      retData.html.characters = await renderTemplate('modules/osr-helper/templates/travel-report-character-list.hbs', {actors: retData.data.characters});
      retData.html.retainers = await renderTemplate('modules/osr-helper/templates/travel-report-character-list.hbs', {actors: retData.data.retainers});
      return retData;
    }
  };
  OSRH.report.travelCalc = function(){
    new OSRH.report.TravelReport().render(true)
  }
};
