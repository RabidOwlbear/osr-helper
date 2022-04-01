export const registerReports = () => {
  OSRH.report = OSRH.report || {};

  OSRH.report.actorItem = async function (actor) {
    const Rations = [];
    const Lights = [];
    let totalRations = 0;

    for (let key in OSRH.data.food) {
      Rations.push(key);
    }
    for (let key in OSRH.data.lightSource) {
      Lights.push(key);
    }

    const msgData = {
      food: '',
      light: ''
    };

    for (let name of Rations) {
      let actorItem = '';
      let ration = actor.data.items.getName(OSRH.data.food[name]);

      if (ration) {
        const qty = ration.data.data.quantity.value;

        totalRations += qty;
        style = 'color: green';
        if (qty <= 2) style = 'color: orangered';
        if (qty <= 1) style = 'color: red';
        actorItem += `<li><span style="${style}">${OSRH.data.food[name]}: ${qty}</span></li>`;
        msgData.food += `<div><p> ${OSRH.data.food[name]}:</p><ul>` + actorItem + `</ul></div>`;
      }
    }
    for (let name of Lights) {
      let actorItem = '';

      let light = actor.data.items.getName(OSRH.data.lightSource[name].name);
      if (light) {
        const qty = light.data.data.quantity.value;

        style = 'color: green';
        if (qty <= 2) style = 'color: orangered';
        if (qty <= 1) style = 'color: red';
        actorItem += `<li><span style="${style}">${OSRH.data.lightSource[name].name}: ${light.data.data.quantity.value}</span></li>`;
        msgData.light += `<div><p> ${OSRH.data.lightSource[name].name}:</p><ul>` + actorItem + `</ul></div>`;
      }
    }
    let ratStyle = 'color: green;';
    if (totalRations <= 3) ratStyle = 'color: orangeRed;';
    if (totalRations <= 1) ratStyle = 'color: red;';

    const rationText = totalRations <= 0 ? '<ul><li><span style="color: red;">None</span></li></ul>' : msgData.food;
    const lightText = msgData.light == '' ? '<ul><li><span style="color: red;">None</span></li></ul>' : msgData.light;
    let contents = `
      <details >
      <summary><strong>Supplies Report</strong></summary>
      <br>
      <div >
        <br>
        <div style="${ratStyle}">Total Days of Rations left: ${totalRations}</div>
        <br>
        <h3>Character Rations:</h3>
        <div>
          ${rationText}
        </div>
        <h3>Character Light Sources:</h3>
        <div>
          ${lightText}
        </div>
      </div>
      </details>`;

    ChatMessage.create({ content: contents, whisper: [game.user.id] });
  };

  OSRH.report.ration = async function () {
    let actorObj = OSRH.util.getPartyActors();
    const Rations = [];
    for (let key in OSRH.data.food) {
      Rations.push(OSRH.data.food[key]);
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

  OSRH.report.travelCalc = async function () {
    const initMod = 1;

    function partyHtml(actorObj, mod = 1) {
      // type == 'characters' ? type : type == 'retainers' ? type : null;
      let templateData = ``;

      for (let actor of actorObj) {
        let nameStr = actor.name.length >= 20 ? actor.name.slice(0, 19) + `...` : actor.name;
        templateData += `
        <div class="actor-div fx sb plr5">
            <div class="of-hide w140">${nameStr}</div>
            <div>${Math.floor((actor.data.data.movement.base / 5) * mod)} mi</div>
        </div>`;
      }

      return templateData;
    }
    function getTravelData(mod) {
      let oseActive = game.modules.get('old-school-essentials')?.active;

      let encButtonTemplate = `    
        <h4>Encounter Roll</h4>
        <div class="btn-spcr"></div>
        <button type="button" id="enc-btn">Roll</button>`;

      let encBtnHtml = oseActive ? encButtonTemplate : `<div style="height: 125px"></div>`;
      const partyObj = OSRH.util.getPartyActors();
      let slowest = partyObj.party[0]?.data.data.movement.base;
      //find slowest rate
      partyObj.party.forEach((a) => {
        let rate = a.data.data.movement.base;
        if (slowest > rate) slowest = rate;
      });
      //convert to miles
      const convertedRate = Math.floor((slowest / 5) * mod);
      return {
        baseRate: convertedRate,
        html: {
          encButton: encBtnHtml,
          characters: partyHtml(partyObj.characters, mod),
          retainers: partyHtml(partyObj.retainers, mod)
        }
      };
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
            retainers: data.html.retainers,
            encButton: data.html.encButton
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
      }
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ['application', 'testApp'],
          popOut: true,
          template: `modules/${OSRH.moduleName}/templates/travel-report.html`,
          id: 'osrTravelReport',
          title: 'Adventure ahoy!',
          width: 400
        });
      }
      getData() {
        // Send data to the template
        return this.data.tData;
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

      async lostRoll() {
        const radio = document.querySelector(`[name=terrain]:checked`).value;
        const bonus = document.querySelector(`#nav-bonus`);
        const gm = game.users.contents.filter((u) => u.data.role == 4).map((u) => u.id);
        if (radio == 'road' || radio == 'trail') {
          ui.notifications.warn('Cannot get lost on roads or trails');
          return;
        }
        let roll = await new Roll(`1d6 + ${bonus.value}`).evaluate({ async: true });
        let target = this.lostMod[radio] || 2;

        if (roll.total <= target) {
          let data = {
            whisper: [game.user],
            flavor: `
            <h3>Navigation Check: ${radio}</h3>
            <span style="color: red">The party got lost.</span>`
          };
          game.dice3d.showForRoll(roll, game.user, false, gm, false).then(() => {
            ChatMessage.create(data);
          });
        } else {
          let data = {
            whisper: [game.user],
            flavor: `
            <h3>Navigation Check: ${radio}</h3>
            The party found their way.
            `
          };
          game.dice3d.showForRoll(roll, game.user, false, gm, false).then(() => {
            ChatMessage.create(data);
          });
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
        const gm = game.users.contents.filter((u) => u.data.role == 4).map((u) => u.id);
        let roll = await new Roll(`1d6 + ${mod}`).roll({ async: true });
        console.log(roll);
        if (roll.total <= 3) {
          let cData = {
            user: game.user,
            whisper: gm,
            roll: roll,
            flavor: `
            <h3>Forage check: ${terrain}</h3>
            <div><span style="color: red"><b>Foraging unsuccessful.</b></span></div>
            `
          };
          game.dice3d.showForRoll(roll, game.user, false, gm, false).then(() => {
            ChatMessage.create(cData);
          });
        } else {
          let cData = {
            user: game.user,
            whisper: gm,
            roll: roll,
            flavor: `
            <h3>Forage check: ${terrain}</h3>
            <div><span style="color: green"><b>Foraging successful.</b></span></div>
            `
          };
          game.dice3d.showForRoll(roll, game.user, false, gm, false).then(() => {
            ChatMessage.create(cData);
          });
        }
        modEl.value = 0;
      }

      updatePartyDist(mod) {
        const rateEl = document.getElementById('BTR');
        const charEl = document.getElementById('character-list');
        const retEl = document.getElementById('retainer-list');
        const upData = getTravelData(mod);

        rateEl.innerText = upData.baseRate;
        charEl.innerHTML = upData.html.characters;
        retEl.innerHTML = upData.html.retainers;
      }
    }

    new travelReport(getTravelData(initMod)).render(true);
  };
};
