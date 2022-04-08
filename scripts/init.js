import { registerLight } from './modules/light.js';
import { registerLightModule } from './modules/lightModule.js';
import { registerTurn } from './modules/turn.js';
import { registerRations } from './modules/rations.js';
import { registerUtil } from './modules/util.js';
import { registerData } from './data/osrHelperData.js';
import { registerCustomEffectList } from './modules/customEffectList.js';
import { registerReports } from './modules/reports.js';
import { registerNameData } from './data/nameData.js';
import { registerSettings } from './modules/settingsModule.js';
import { registerEffectModule } from './modules/effectModule.js';
//namespace
window.OSRH = window.OSRH || {
  moduleName: `osr-helper`,
  ce: {},
  data: {},
  light: {},
  ration: {},
  report: {},
  turn: {},
  util: {},
  socket: undefined
};

Hooks.once('init', async function () {
  //add settings
  registerData();
  registerUtil();
  console.log('init');
  await registerSettings();

  // import modules
  registerLight();
  registerTurn();
  registerRations();
  
  
  registerCustomEffectList();
  registerReports();
  registerNameData();
  registerLightModule();
  registerEffectModule();
  OSRH.gameVersion = game.version ? game.version : game.data.version;
  Hooks.call(`${OSRH.moduleName}.registered`);
  
});
Hooks.once('socketlib.ready', () => {
  console.log('SL ready');

  Hooks.once(`${OSRH.moduleName}.registered`, () => {
    OSRH.socket = socketlib.registerModule(`${OSRH.moduleName}`);
    console.log('reg');
    OSRH.socket.register('lightCheck', OSRH.light.lightCheck);
    OSRH.socket.register('updateTokens', OSRH.light.updateTokens);
    OSRH.socket.register('setting', OSRH.util.setting);
    OSRH.socket.register('decrementLightItem', OSRH.light.decrementLightItem);
    OSRH.socket.register('clearExpiredEffects', OSRH.effect.clearExpired);
    OSRH.socket.register('renderNewEffectForm', OSRH.effect.renderNewEffectForm);
    OSRH.socket.register('createActiveEffectOnTarget', OSRH.util.createActiveEffectOnTarget);
    // OSRH.socket.register('deleteEffect', OSRH.effect.deleteEffect)
    OSRH.socket.register('deleteAll', OSRH.effect.deleteAll);
    OSRH.socket.register('effectHousekeeping', OSRH.effect.housekeeping);
    OSRH.socket.register('gmCreateEffect', OSRH.effect.gmCreateEffect);
    OSRH.socket.register('deleteEffect', OSRH.effect.delete);
    OSRH.socket.register('refreshEffectLists', OSRH.effect.refreshEffectLists);
  });
});
//update proc data if changed
Hooks.on('updateSetting', async () => {
  const turnData = game.settings.get(`${OSRH.moduleName}`, 'turnData');

  const newName = game.settings.get(`${OSRH.moduleName}`, 'timeJournalName');
  const oldName = turnData?.journalName;
  const journal = await game.journal.getName(oldName);

  if (oldName && newName != oldName) {
    console.log('journal name changed');
    turnData.journalName = newName;
    await journal.update({ name: newName });
  }
  //turn journal update
  OSRH.socket.executeAsGM('setting', 'turnData', turnData, 'set');
  // if (game.user.role >= 4) {
  //   game.settings.set(`${OSRH.moduleName}`, 'turnData', turnData);

  // }
});

Hooks.once('ready', async () => {
  OSRH.util.setTheme()
  //const lightData = game.settings.get(`${OSRH.moduleName}`, 'lightData');
  const turnData = game.settings.get(`${OSRH.moduleName}`, 'turnData');
  const jName = game.settings.get(`${OSRH.moduleName}`, 'timeJournalName');

  //update turn proc

  turnData.journalName = jName;
  // game.settings.set(`${OSRH.moduleName}`, 'turnData', turnData);
  OSRH.socket.executeAsGM('setting', 'turnData', turnData, 'set');

  //set hook to update light timer durations
  Hooks.on('updateWorldTime', async () => {
    await OSRH.util.osrTick();
    console.log('time');
    OSRH.socket.executeAsGM('lightCheck');
    // OSRH.socket.executeAsGM('clearExpiredEffects')
    // OSRH.util.debounce(, 300);
    OSRH.util.osrHook(`${OSRH.moduleName} Time Updated`);
  });

  Hooks.on(`${OSRH.moduleName} Time Updated`, () => {
    if (game.user.isGM) OSRH.socket.executeAsGM('effectHousekeeping');
  });
  //check for count journal
  await OSRH.util.countJournalInit(jName);
  console.log(`${OSRH.moduleName} ready`);

  //check for userflags

  for (let user of game.users.contents) {
    const lightFlag = await user.getFlag(`${OSRH.moduleName}`, 'lightData');
    const effectFlag = await user.getFlag(`${OSRH.moduleName}`, 'effectData');
    if (!lightFlag) {
      await user.setFlag(`${OSRH.moduleName}`, 'lightData', {});
    }
    if (!effectFlag) {
      await user.setFlag(`${OSRH.moduleName}`, 'effectData', {});
    }
  }

  Hooks.on('createActor', async (actor) => {
    if (game.settings.get(`${OSRH.moduleName}`, 'tokenLightDefault') && game.user.role >= 4) {
      if (actor.data.type == 'character') {
        //const actor = game.actors.getName(sheet.object.name);
        await actor.update({
          token: {
            displayBars: 30,
            displayName: 30,
            bar1: { attribute: 'hp' },
            disposition: 1,
            light: {
              alpha: 0.5,
              animation: {
                intensity: 5,
                speed: 3,
                type: 'Torch'
              }
            },
            lightColor: '#ff9924',
            vision: true,
            actorLink: true
          }
        });
      }
    }
  });
  //check center hotbar
  OSRH.util.centerHotbar();
  window.addEventListener('resize', ()=>{
    OSRH.util.centerHotbar();
  })
});

//reset monster actions hook

Hooks.on('updateCombat', (combat) => {
  if (combat.current && combat.current.round && combat.previous && combat.previous.round) {
    if (combat.current.round - combat.previous.round == 1) {
      OSRH.util.resetMonsterAttacks();
    }
  }
});

// //effect report
// Hooks.on('renderuserEffectReport', ())
Hooks.on('renderOseActorSheet', async (actor, html) => {
  const modBox = html.find(`[class="modifiers-btn"]`);
  modBox.append(
    `<a class="ose-effect-list ose-icon" id ="ose-effect-list" title="Show Active Effects"><i class="fas fa-list"></i></a>`
  );

  modBox.on('click', '.ose-effect-list', (e) => {
    // active effects button
    // OSRH.ce.effectList(actor.object);
    let pos = { x: e.pageX + 100, y: e.pageY - 200 };
    // check window for instances of form
    if (Object.values(ui.windows).filter((i) => i.id == `activeEffectList.${actor.object.id}`).length == 0) {
      new OSRH.effect.ActiveEffectList(actor.object, pos).render(true);
    }
  });

  //currency converter
  let linkCont = html.find(`#treasure .item-controls`)[0];
  let el = document.createElement('a');
  let iEl = document.createElement('i');
  el.classList = 'item-control';
  el.title = 'Currency Converter';
  iEl.classList = 'fa fa-coins';
  iEl.style['margin-right'] = '5px';
  el.appendChild(iEl);
  if (linkCont) linkCont.prepend(el);
  el.addEventListener('click', (ev) => {
    ev.preventDefault();
    actor.render();
    OSRH.util.curConDiag(actor.object);
  });

  //  lightItemSettings
  if (await game.settings.get(`${OSRH.moduleName}`, 'enableLightConfig')) {
    let lightItems = actor.object.items.filter((i) => {
      let tags = i.data.data.manualTags;
      if (tags && tags.find((t) => t.value == 'Light')) return i;
    });
    for (let item of lightItems) {
      let targetEl = html.find(`[data-item-id="${item.id}"] .item-controls`);
      // console.log(item, targetEl) //<i class="fa-solid fa-wrench"></i>
      let el = document.createElement('a');
      let iEl = document.createElement('i');
      el.classList = 'light-config'; //'item-control'
      el.title = 'Light Config';
      iEl.classList = 'fa fa-wrench';
      iEl.style['margin-right'] = '5px';
      el.appendChild(iEl);
      targetEl.prepend(el);
      el.addEventListener('click', async (ev) => {
        ev.preventDefault();
        let itemConfig = await item.getFlag(`${OSRH.moduleName}`, 'lightItemData');
        console.log(item, itemConfig);
        if (Object.values(ui.windows).filter((i) => i.id.includes(`light-item-config.${item.id}`)).length == 0) {
          new OSRH.light.ItemSettingsForm(item).render(true);
        }
      });
    }
  }
});

/* 

    <a class="ose-add-effect ose-icon" title="Add Effect"><i class="fas fa-hand-sparkles"></i></a>
    <a class="ose-delete-effect ose-icon" title="Delete Active Effect"><i class="fas fa-ban"></i></a>
*/
Hooks.on('osrItemShopActive', async () => {
  const randTime = 100 + Math.floor(Math.random() * 2000);
  setTimeout(async () => {
    let curData = await game.settings.get('osrItemShop', 'sourceList');
    let itemList = await game.settings.get('osrItemShop', 'itemList');

    let newList = itemList.concat(OSRH.data.helperItems);

    if (!curData.find((i) => i.header == 'OSE Helper')) {
      curData.push({
        header: 'OSE Helper',
        data: OSRH.data.helperItems,
        options: [
          {
            name: 'OSE Helper Items',
            source: 'osrHelper',
            itemTypes: ['light source', 'food']
          }
        ]
      });
    }
    if (game.user.role >= 4) {
      await game.settings.set('osrItemShop', 'itemList', newList);
      await game.settings.set('osrItemShop', 'sourceList', curData);
      console.log('OSE Helper Items Added');
    }
  }, randTime);
});

Hooks.on('gmPleasePause', () => {
  if (game.user.role == 4) {
    let newState = game.paused ? false : true;
    game.togglePause(newState, true);
  }
});

Hooks.on(`renderDungTurnConfig`, async (ev, html) => {
  const data = await game.settings.get(`${OSRH.moduleName}`, 'dungeonTurnData');
  document.getElementById('enc-table').value = data.eTable;
  document.getElementById('react-table').value = data.rTable;
  document.getElementById('proc').value = data.proc;
  document.getElementById('roll-target').value = data.rollTarget;
  document.getElementById('roll-enc').checked = data.rollEnc;
  document.getElementById('roll-react').checked = data.rollReact;
});
Hooks.on('rendercustomEffectList', (CEL, html, form) => {
  CEL.renderEffectList(html);
});

Hooks.on('renderItemSheet', async (sheetObj, html) => {
  const isLight = sheetObj.object.data.data.tags?.find((t) => t.value == 'Light');
  if ((await game.settings.get(`${OSRH.moduleName}`, 'enableLightConfig')) && isLight) {
    let item = sheetObj.item;
    let el = document.createElement('a');
    el.addEventListener('click', async (ev) => {
      ev.preventDefault();
      let itemConfig = await item.getFlag(`${OSRH.moduleName}`, 'lightItemConfig');
      console.log(item, itemConfig);
      if (Object.values(ui.windows).filter((i) => i.id.includes(`light-item-config`)).length == 0) {
        new OSRH.light.ItemSettingsForm(item).render(true);
      }
    });
    let target = html.find('.header-button.configure-sheet');
    el.innerHTML = `<a title="OSRH Light Item Config"><i class="fas fa-wrench"></i></a>`;
    target.before(el);
  }
});
// remove once ose combat time advancement fixed
Hooks.on('deleteCombat', () => {
  OSRH.socket.executeAsGM('setting','lastRound', 0, 'set');
  // if(game.user.isGM){
  //   game.settings.set(`${OSRH.moduleName}`, 'lastRound', 0)
  // }
});

Hooks.on('updateCombat', async (combat, details) => {
  if (game.user.isGM && (await game.settings.get(`${OSRH.moduleName}`, 'combatTimeAdvance'))) {
    console.log('update combat', details);
    let lastRound = await game.settings.get(`${OSRH.moduleName}`, 'lastRound');
    let round = details.round;
    console.log(round, lastRound);
    if (round && round > lastRound) {
      game.time.advance(10);
      await game.settings.set(`${OSRH.moduleName}`, 'lastRound', round);
      // OSRH.socket.executeAsGM('setting','lastRound', round, 'set');
    }
    if (round && round < lastRound) {
      game.time.advance(-10);
      await game.settings.set(`${OSRH.moduleName}`, 'lastRound', round);
      // OSRH.socket.executeAsGM('setting','lastRound', round, 'set');
    }
  }
});
Hooks.on('renderHotbar', ()=>{

  OSRH.util.centerHotbar()
})