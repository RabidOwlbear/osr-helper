// import { registerLight } from './modules/light.js';
import { socket } from './modules/socket.mjs';
import { registerLightModule } from './modules/lightModule.js';
import { registerTurn } from './modules/turn.js';
import { registerRations } from './modules/rations.js';
import { registerUtil, intializePackFolders } from './modules/util.js';
import { registerData, registerLocalizedData } from './data/osrHelperData.js';
import { registerCustomEffectList } from './modules/old/customEffectList.js';
import { registerReports } from './modules/reports.js';
import { registerNameData } from './data/nameData.js';
import { registerSettings } from './modules/settingsModule.js';
// import { registerEffectModule } from './modules/effectModule.js';
import { registerEffectData } from './data/effectData.mjs';
import { registerPartials } from './data/registerPartials.mjs';
import { registerOsrActiveEffectModule } from './modules/active-effect/active-effect-module.mjs';
import { uiControls } from './modules/ui-controls.mjs';
import { OSRHTurnTracker, registerTravelConstants } from './modules/turn-tracker.mjs';
import { hideForeignPacks } from './modules/hide-foreign-packs.mjs';
import { lightConfig } from './modules/light-item-config.mjs';
import { registerSystemData } from './data/registerSystemData.mjs';
import { registerSystemHooks } from './modules/hooks/system-hooks.mjs';
import { OSRHPartySheet } from './modules/party-sheet/party-sheet.mjs';
import { AmmoItemConfig } from './modules/ammo-config.mjs';
import { tagMigration } from './modules/migration/tagMigration.mjs';
import { migrateAmmoFlag } from './modules/migration/ammoFlag.mjs';
import { migrateSavedEffects } from './modules/migration/savedEffecst.mjs';
import { CustomAttributeEdit } from './modules/custom-attrib/custom-attrib-edit.mjs';
import { ManageCustomAttributes } from './modules/custom-attrib/manage-attributes.mjs';
import { injectOSRHSheetUI } from  './modules/ui-controls.mjs';
import {
  addSheetUi,
  addcustomAttribElement,
  decrementAttribute,
  addAttribListeners
} from './modules/custom-attrib/custom-attrib-util.mjs';
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
  effect: {},
  ui,
  socket: undefined
};
OSRH.lang = ['en', 'es', 'pt-BR'];
Hooks.once('init', async function () {
  //add settings
  registerData();
  registerUtil();
  
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
  OSRH.party = {}
  OSRH.lightConfig = lightConfig;
  OSRH.partySheet = OSRHPartySheet;
  OSRH.CustomAttributeEdit = CustomAttributeEdit;
  OSRH.ManageCustomAttributes = ManageCustomAttributes;
  // OSRH.customAttributeConfig = CustomAttributeConfig;

  // OSRH.advPartySheet = PartySheetAdvanced;
  // OSRH.attack = osrhAttack;
  OSRH.AmmoConfig = AmmoItemConfig;

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

    await OSRH.socket.executeAsGM('setting', 'turnData', turnData, 'set');
  }
});
Hooks.once(`${OSRH.moduleName}.registered`, () => {});
Hooks.once('ready', async () => {
  await registerSettings();
  // no gm warning
  if (!OSRH.util.singleGM()) ui.notifications.warn(game.i18n.localize('OSRH.notification.noGmUser'));
  registerSystemData();
  OSRHPartySheet.init();
  // handlebars partials
  registerPartials();

  OSRH.ui = uiControls;
  if (OSRH.systemData.effects) {
    registerCustomEffectList();
    // registerEffectModule();
    registerOsrActiveEffectModule();
    registerEffectData();
    // OSRH.socket.register('clearExpiredEffects', OSRH.effect.clearExpired);
    // OSRH.socket.register('renderNewEffectForm', OSRH.effect.renderNewEffectForm);
    OSRH.socket.register('createActiveEffectOnTarget', OSRH.util.createActiveEffectOnTarget);
    // OSRH.socket.register('deleteAll', OSRH.effect.deleteAll);
    OSRH.socket.register('effectHousekeeping', OSRH.effect.housekeeping);
    OSRH.socket.register('gmCreateEffect', OSRH.effect.gmCreateEffect);
    OSRH.socket.register('deleteEffect', OSRH.effect.delete);
    OSRH.socket.register('refreshEffectLists', OSRH.effect.refreshEffectLists);
    OSRH.socket.register('handleEffectPreset', OSRH.effect.handleEffectPreset);
    OSRH.socket.register('deleteAllEffects', OSRH.effect.deleteAll);
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
  if (game.user.isGM) await OSRH.socket.executeAsGM('setting', 'turnData', turnData, 'set');

  // migrate turn data
  // migrateTurnData();
  //set hook to update light timer durations
  Hooks.on('updateWorldTime', async () => {
    console.log('time update');

    await OSRH.util.osrTick(); // remove
    await OSRH.socket.executeAsGM('lightCheck');
    if (game.user.isGM && OSRH.systemData.effects) await OSRH.socket.executeAsGM('effectHousekeeping');
    OSRH.util.osrHook(`${OSRH.moduleName} Time Updated`);
  });

  //check for count journal
  await OSRH.util.countJournalInit(jName);
  console.log(`${OSRH.moduleName} ready`);

  //check for userflags

  if (game.user.id === OSRH.util.singleGM()?.id) {
    // migrate tags, and flags
    tagMigration();
    migrateAmmoFlag();
    migrateSavedEffects();
  }

  Hooks.on('createActor', async (actor) => {
    if ((await game.settings.get(`${OSRH.moduleName}`, 'tokenLightDefault')) && game.user.isGM) {
      if (actor.type == 'character') {
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

Hooks.on('renderActorSheet', async (sheetEl, html, actorObj) => {
  // itemPiles accomodation
  let itemPiles = actorObj.flags?.['item-piles']?.data?.enabled || null;
  if (!itemPiles) {
    if (await game.settings.get(OSRH.moduleName, `enableEquippableContainers`)) {
      OSRH.util.initializeDroppableContainers(sheetEl.object, html);
    }

    //sheet side ui
    const sheetUiEl = addSheetUi(html[0].closest('.app'));
    if (sheetUiEl !== 'skip') {
      if (actorObj?.owner || actorObj?.isOwner) {
        const uiTab = document.createElement('div');
        const btnCont = document.createElement('div');
        uiTab.classList.add('ui-tab');
        btnCont.classList.add('btn-cont');
        const label = document.createElement('label');
        label.classList.add('mod-label');
        label.innerText = 'OSRH';
        uiTab.appendChild(label);
        //active effects
        if (OSRH.systemData.effects) {
          let aeBtn = document.createElement('a');
          let aeIcon = document.createElement('i');
          aeBtn.classList.add('sheet-ui-btn');
          aeBtn.title = game.i18n.localize('OSRH.effect.activeEffects');
          aeIcon.classList.add('fa-solid', 'fa-list');
          aeBtn.appendChild(aeIcon);
          aeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (Object.values(ui.windows).filter((i) => i.id == `activeEffectList.${actorObj.id}`).length == 0) {
              OSRH.effect.renderEffectApp(sheetEl.object);
            }
          });
          btnCont.appendChild(aeBtn);
        }
        // currency converter/attribute bar
        if (game.system.id === 'ose' && actorObj.type == 'character') {
          let ccBtn = document.createElement('a');
          let ccIcon = document.createElement('i');
          ccBtn.classList.add('sheet-ui-btn');
          ccIcon.classList.add('fa-solid', 'fa-coins');
          ccBtn.title = game.i18n.localize('OSRH.util.dialog.curencyConverter');
          ccBtn.appendChild(ccIcon);
          ccBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sheetEl.render();
            OSRH.util.curConDiag(actorObj);
          });
          // custom attrib btn
          btnCont.appendChild(ccBtn);
          if ((await game.settings.get(OSRH.moduleName, `displaycustomAttrib`)) && actorObj.prototypeToken.actorLink) {
            addcustomAttribElement(html[0].closest('.app'), actorObj);
            if (await game.settings.get(OSRH.moduleName, 'trackCustomAttrib')) {
              addAttribListeners(html, actorObj);
            }

            let caBtn = document.createElement('a');
            let caIcon = document.createElement('i');
            caBtn.classList.add('sheet-ui-btn');
            caBtn.title = game.i18n.localize('OSRH.uiControl.editCustomAttrib');
            caIcon.classList.add('fa-solid', 'fa-pen-to-square');
            caBtn.appendChild(caIcon);
            caBtn.addEventListener('click', async (e) => {
              e.preventDefault();
              if (Object.values(ui.windows).filter((i) => i.options.id == `OSRHManageAttributes`).length == 0) {
                let left = e.x - 350 > 0 ? e.x - 350 : 0;
                new OSRH.ManageCustomAttributes(actorObj).render(true, { top: e.y - 130, left: left - 15 });
              }
            });
            btnCont.appendChild(caBtn);
          }
        }
        uiTab.appendChild(btnCont);
        sheetUiEl?.appendChild(uiTab);
      }
    }
  }
});
Hooks.on('renderActorSheetV2', async (obj,html, sheet,options) => {
    injectOSRHSheetUI(html , obj, 'actor')
  })

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

Hooks.on('renderOSRHPartySheet', OSRHPartySheet.renderPartySheet);

