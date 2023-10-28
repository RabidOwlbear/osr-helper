// import { registerLight } from './modules/light.js';
import { registerLightModule } from './modules/lightModule.js';
import { registerTurn } from './modules/turn.js';
import { registerRations } from './modules/rations.js';
import { registerUtil, intializePackFolders } from './modules/util.js';
import { registerData, registerLocalizedData } from './data/osrHelperData.js';
import { registerCustomEffectList } from './modules/customEffectList.js';
import { registerReports } from './modules/reports.js';
import { registerNameData } from './data/nameData.js';
import { registerSettings } from './modules/settingsModule.js';
import { registerEffectModule } from './modules/effectModule.js';
import { uiControls } from './modules/ui-controls.mjs';
import { OSRHTurnTracker, registerTravelConstants } from './modules/turn-tracker.mjs';
import { hideForeignPacks } from './modules/hide-foreign-packs.mjs';
import { lightConfig } from './modules/light-item-config.mjs';
import { registerSystemData } from './data/registerSystemData.mjs';
import { registerSystemHooks } from './modules/hooks/system-hooks.mjs';
import { OSRHPartySheet } from './modules/party sheet/party-sheet.mjs';
import { tagMigration } from './modules/migration/tagMigration.mjs';
window.OSRH = window.OSRH || {
  moduleName: `osr-helper`,
  ce: {},
  data: {},
  light: {},
  ration: {},
  report: {},
  turn: {},
  util: {},
  CONST: {},
  ui,
  socket: undefined
};
OSRH.lang = ['en', 'es'];
Hooks.once('init', async function () {
  //add settings
  registerData();
  registerUtil();
  await registerSettings();

  // import modules
  // registerLight();
  registerTurn();
  registerRations();

  registerReports();
  registerNameData();
  registerLightModule();

  registerTravelConstants();

  OSRH.gameVersion = game.version ? game.version : game.version;
  OSRH.TurnTracker = OSRHTurnTracker;
  OSRH.lightConfig = lightConfig;
  OSRH.partySheet = OSRHPartySheet;
  Hooks.callAll(`${OSRH.moduleName}.registered`);
});
Hooks.once('socketlib.ready', () => {
  console.log('SL ready');

  Hooks.once(`${OSRH.moduleName}.registered`, () => {
    OSRH.socket = socketlib.registerModule(`${OSRH.moduleName}`);
    OSRH.socket.register('lightCheck', OSRH.light.lightCheck);
    OSRH.socket.register('updateTokens', OSRH.light.updateTokens);
    OSRH.socket.register('setting', OSRH.util.setting);
    OSRH.socket.register('decrementLightItem', OSRH.light.decrementLightItem);

    // OSRH.socket.register('deleteEffect', OSRH.effect.deleteEffect)

    OSRH.socket.register('refreshTurnTracker', OSRH.turn.refreshTurnTracker);
  });
});
//update proc data if changed
Hooks.on('updateSetting', async (a, b, c) => {
  if (a.key === 'osr-helper.timeJournalName') {
    const newName = await game.settings.get(`${OSRH.moduleName}`, 'timeJournalName');
    const oldName = turnData?.journalName;
    const journal = await game.journal.getName(oldName);
    //turn journal update
    if (oldName && newName != oldName) {
      console.log('journal name changed');
      turnData.journalName = newName;
      await journal.update({ name: newName });
    }
  }

  if (a.key === 'osr-helper.turnData') {
    const turnData = await game.settings.get(`${OSRH.moduleName}`, 'turnData');

    console.log('Update Setting hook');
    await OSRH.socket.executeAsGM('setting', 'turnData', turnData, 'set');
  }
});
Hooks.once(`${OSRH.moduleName}.registered`, () => {});
Hooks.once('ready', async () => {
  
  registerSystemData();
  OSRH.ui = uiControls;
  if (OSRH.systemData.effects) {
    registerCustomEffectList();
    registerEffectModule();
    OSRH.socket.register('clearExpiredEffects', OSRH.effect.clearExpired);
    OSRH.socket.register('renderNewEffectForm', OSRH.effect.renderNewEffectForm);
    OSRH.socket.register('createActiveEffectOnTarget', OSRH.util.createActiveEffectOnTarget);
    OSRH.socket.register('deleteAll', OSRH.effect.deleteAll);
    OSRH.socket.register('effectHousekeeping', OSRH.effect.housekeeping);
    OSRH.socket.register('gmCreateEffect', OSRH.effect.gmCreateEffect);
    OSRH.socket.register('deleteEffect', OSRH.effect.delete);
    OSRH.socket.register('refreshEffectLists', OSRH.effect.refreshEffectLists);
  }
  
  registerLocalizedData();
  registerSystemHooks();
  OSRH.ui.addUiControls();
  await intializePackFolders();
  hideForeignPacks();

  OSRH.util.setTheme();
  const turnData = await game.settings.get(`${OSRH.moduleName}`, 'turnData');
  const jName = await game.settings.get(`${OSRH.moduleName}`, 'timeJournalName');
  //update turn proc

  if (!turnData.journalName && jName) turnData.journalName = jName;
  await OSRH.socket.executeAsGM('setting', 'turnData', turnData, 'set');
  // migrate turn data
  // migrateTurnData();
  //set hook to update light timer durations
  Hooks.on('updateWorldTime', async () => {
    console.log('time update');
    await OSRH.util.osrTick();
    await OSRH.socket.executeAsGM('lightCheck');
    OSRH.util.osrHook(`${OSRH.moduleName} Time Updated`);
  });

  Hooks.on(`${OSRH.moduleName} Time Updated`, async () => {
    if (game.user.isGM && OSRH.systemData.effects) await OSRH.socket.executeAsGM('effectHousekeeping');
  });
  //check for count journal
  await OSRH.util.countJournalInit(jName);
  console.log(`${OSRH.moduleName} ready`);

  //check for userflags

  if (game.user.id === OSRH.util.singleGM().id) {
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

    // migrate tags
    tagMigration()
  }

  Hooks.on('createActor', async (actor) => {
    if ((await game.settings.get(`${OSRH.moduleName}`, 'tokenLightDefault')) && game.user.isGM) {
      if (actor.type == 'character') {
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
  await OSRH.util.centerHotbar();
  window.addEventListener('resize', async () => {
    await OSRH.util.centerHotbar();
  });
  //add ui controls
  Hooks.on('renderHotbar', async () => {
    await OSRH.util.centerHotbar();
    OSRH.ui.addUiControls();
  });
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
Hooks.on('renderActorSheet', async (actor, html) => {
  // itemPiles accomodation
  let itemPiles = actor.flags?.['item-piles']?.data?.enabled || null;
  if (!itemPiles) {
    if (OSRH.systemData.effects) {
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
    }

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
        let tags = i.system.manualTags;
        if (tags && tags.find((t) => t.value == 'Light')) return i;
      });
      for (let item of lightItems) {
        let targetEl = html.find(`[data-item-id="${item.id}"] .item-controls`);
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
          if (Object.values(ui.windows).filter((i) => i.id.includes(`light-item-config.${item.id}`)).length == 0) {
            new OSRH.light.ItemSettingsForm(item).render(true);
          }
        });
      }
    }
    if (await game.settings.get(OSRH.moduleName, `enableEquippableContainers`)) {
      OSRH.util.initializeDroppableContainers(actor.object, html);
    }
  }
});

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

// Hooks.on('renderItemSheet', async (sheetObj, html) => {
//   const isLight = sheetObj.object.system.tags?.find((t) => t.value == 'Light');
//   if ((await game.settings.get(`${OSRH.moduleName}`, 'enableLightConfig')) && isLight) {
//     let item = sheetObj.item;
//     let el = document.createElement('a');
//     el.addEventListener('click', async (ev) => {
//       ev.preventDefault();
//       let itemConfig = await item.getFlag(`${OSRH.moduleName}`, 'lightItemConfig');
//       if (Object.values(ui.windows).filter((i) => i.id.includes(`light-item-config`)).length == 0) {
//         new OSRH.light.ItemSettingsForm(item).render(true);
//       }
//     });
//     let target = html.find('.header-button.configure-sheet');
//     el.innerHTML = `<a title="OSRH Light Item Config"><i class="fas fa-wrench"></i></a>`;
//     target.before(el);
//   }
// });
// remove once ose combat time advancement fixed
Hooks.on('deleteCombat', async () => {
  await OSRH.socket.executeAsGM('setting', 'lastRound', 0, 'set');
});

Hooks.on('updateCombat', async (combat, details) => {
  const singleGM = OSRH.util.singleGM();
  if (game.user.id === singleGM.id && (await game.settings.get(`${OSRH.moduleName}`, 'combatTimeAdvance'))) {
    let lastRound = await game.settings.get(`${OSRH.moduleName}`, 'lastRound');
    let round = details.round;
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

Hooks.on('renderNewActiveEffectForm', (form, html) => {
  if (game.user.role == 4) {
    let header = html.find('header')[0];
    let closeBtn = html.find(`header a.close`)[0];
    // <a class="light-config" title="Light Config"><i class="fa fa-wrench" style="margin-right: 5px;"></i></a>
    let btn = document.createElement('a');
    btn.title = `Manage Custom Effects`;
    btn.innerHTML = `<i class="fa fa-bars fa-xs"></i>`;
    btn.classList.add('manage-effects-btn');
    header?.insertBefore(btn, closeBtn);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      new OSRH.effect.manageCustomPresets().render(true);
    });
  }
});


