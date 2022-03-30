import { registerLight } from './modules/light.js';
import { registerLightModule } from './modules/lightModule.js';
import { registerTurn } from './modules/turn.js';
import { registerRations } from './modules/rations.js';
import { registerUtil } from './modules/util.js';
import { registerData } from './data/oseHelperData.js';
import { registerCustomEffectList } from './modules/customEffectList.js';
import { registerReports } from './modules/reports.js';
import { registerNameData } from './data/nameData.js';
import { registerSettings } from './modules/settingsModule.js';
import { registerEffectModule } from './modules/effectModule.js';
//namespace
window.OSEH = window.OSEH || {
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
  console.log('init');
  await registerSettings();

  // import modules
  registerLight();
  registerTurn();
  registerRations();
  registerUtil();
  registerData();
  registerCustomEffectList();
  registerReports();
  registerNameData();
  registerLightModule();
  registerEffectModule();
  OSEH.gameVersion = game.version ? game.version : game.data.version;
  Hooks.call('OSE-helper.registered');
});
Hooks.once('socketlib.ready', () => {
  console.log('SL ready');

  Hooks.once('OSE-helper.registered', () => {
    OSEH.socket = socketlib.registerModule('OSE-helper');
    console.log('reg');
    OSEH.socket.register('lightCheck', OSEH.light.lightCheck);
    OSEH.socket.register('updateTokens', OSEH.light.updateTokens);
    OSEH.socket.register('setting', OSEH.util.setting);
    OSEH.socket.register('decrementLightItem', OSEH.light.decrementLightItem);
    OSEH.socket.register('clearExpiredEffects', OSEH.effect.clearExpired);
    OSEH.socket.register('renderNewEffectForm', OSEH.effect.renderNewEffectForm);
    OSEH.socket.register('createActiveEffectOnTarget', OSEH.util.createActiveEffectOnTarget);
    // OSEH.socket.register('deleteEffect', OSEH.effect.deleteEffect)
    OSEH.socket.register('deleteAll', OSEH.effect.deleteAll);
    OSEH.socket.register('effectHousekeeping', OSEH.effect.housekeeping);
    OSEH.socket.register('gmCreateEffect', OSEH.effect.gmCreateEffect);
    OSEH.socket.register('deleteEffect', OSEH.effect.delete);
    OSEH.socket.register('refreshEffectLists', OSEH.effect.refreshEffectLists);
  });
});
//update proc data if changed
Hooks.on('updateSetting', async () => {
  const turnData = game.settings.get('OSE-helper', 'turnData');

  const newName = game.settings.get('OSE-helper', 'timeJournalName');
  const oldName = turnData?.journalName;
  const journal = await game.journal.getName(oldName);

  if (oldName && newName != oldName) {
    console.log('journal name changed');
    turnData.journalName = newName;
    await journal.update({ name: newName });
  }
  //turn journal update
  OSEH.socket.executeAsGM('setting', 'turnData', turnData, 'set');
  // if (game.user.role >= 4) {
  //   game.settings.set('OSE-helper', 'turnData', turnData);

  // }
});

Hooks.once('ready', async () => {
  //const lightData = game.settings.get('OSE-helper', 'lightData');
  const turnData = game.settings.get('OSE-helper', 'turnData');
  const jName = game.settings.get('OSE-helper', 'timeJournalName');

  //update turn proc

  turnData.journalName = jName;
  // game.settings.set('OSE-helper', 'turnData', turnData);
  OSEH.socket.executeAsGM('setting', 'turnData', turnData, 'set');

  //set hook to update light timer durations
  Hooks.on('updateWorldTime', async () => {
    await OSEH.util.oseTick();
    console.log('time');
    OSEH.socket.executeAsGM('lightCheck');
    // OSEH.socket.executeAsGM('clearExpiredEffects')
    // OSEH.util.debounce(, 300);
    OSEH.util.oseHook('OSE-helper Time Updated');
  });

  Hooks.on('OSE-helper Time Updated', () => {
    if (game.user.isGM) OSEH.socket.executeAsGM('effectHousekeeping');
  });
  //check for count journal
  await OSEH.util.countJournalInit(jName);
  console.log('OSE-helper ready');

  //check for userflags

  for (let user of game.users.contents) {
    const lightFlag = await user.getFlag('OSE-helper', 'lightData');
    const effectFlag = await user.getFlag('OSE-helper', 'effectData');
    if (!lightFlag) {
      await user.setFlag('OSE-helper', 'lightData', {});
    }
    if (!effectFlag) {
      await user.setFlag('OSE-helper', 'effectData', {});
    }
  }

  Hooks.on('createActor', async (actor) => {
    if (game.settings.get('OSE-helper', 'tokenLightDefault') && game.user.role >= 4) {
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
  OSEH.util.centerHotbar();
});

//reset monster actions hook

Hooks.on('updateCombat', (combat) => {
  if (combat.current && combat.current.round && combat.previous && combat.previous.round) {
    if (combat.current.round - combat.previous.round == 1) {
      OSEH.util.resetMonsterAttacks();
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
    // OSEH.ce.effectList(actor.object);
    let pos = { x: e.pageX + 100, y: e.pageY - 200 };
    // check window for instances of form
    if (Object.values(ui.windows).filter((i) => i.id == `activeEffectList.${actor.object.id}`).length == 0) {
      new OSEH.effect.ActiveEffectList(actor.object, pos).render(true);
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
    OSEH.util.curConDiag(actor.object);
  });

  //  lightItemSettings
  if (await game.settings.get('OSE-helper', 'enableLightConfig')) {
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
        let itemConfig = await item.getFlag('OSE-helper', 'lightItemData');
        console.log(item, itemConfig);
        if (Object.values(ui.windows).filter((i) => i.id.includes(`light-item-config.${item.id}`)).length == 0) {
          new OSEH.light.ItemSettingsForm(item).render(true);
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

    let newList = itemList.concat(OSEH.data.helperItems);

    if (!curData.find((i) => i.header == 'OSE Helper')) {
      curData.push({
        header: 'OSE Helper',
        data: OSEH.data.helperItems,
        options: [
          {
            name: 'OSE Helper Items',
            source: 'oseHelper',
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
  const data = await game.settings.get('OSE-helper', 'dungeonTurnData');
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
  if ((await game.settings.get('OSE-helper', 'enableLightConfig')) && isLight) {
    let item = sheetObj.item;
    let el = document.createElement('a');
    el.addEventListener('click', async (ev) => {
      ev.preventDefault();
      let itemConfig = await item.getFlag('OSE-helper', 'lightItemConfig');
      console.log(item, itemConfig);
      if (Object.values(ui.windows).filter((i) => i.id.includes(`light-item-config`)).length == 0) {
        new OSEH.light.ItemSettingsForm(item).render(true);
      }
    });
    let target = html.find('.header-button.configure-sheet');
    el.innerHTML = `<a title="OSEH Light Item Config"><i class="fas fa-wrench"></i></a>`;
    target.before(el);
  }
});
// remove once ose combat time advancement fixed
Hooks.on('deleteCombat', () => {
  OSEH.socket.executeAsGM('lastRound', 0, 'set');
  // if(game.user.isGM){
  //   game.settings.set('OSE-helper', 'lastRound', 0)
  // }
});

Hooks.on('updateCombat', async (combat, details) => {
  if (game.user.isGM && (await game.settings.get('OSE-helper', 'combatTimeAdvance'))) {
    console.log('update combat', details);
    let lastRound = await game.settings.get('OSE-helper', 'lastRound');
    let round = details.round;
    console.log(round, lastRound);
    if (round && round > lastRound) {
      game.time.advance(10);
      await game.settings.set('OSE-helper', 'lastRound', round);
      // OSEH.socket.executeAsGM('setting','lastRound', round, 'set');
    }
    if (round && round < lastRound) {
      game.time.advance(-10);
      await game.settings.set('OSE-helper', 'lastRound', round);
      // OSEH.socket.executeAsGM('setting','lastRound', round, 'set');
    }
  }
});
