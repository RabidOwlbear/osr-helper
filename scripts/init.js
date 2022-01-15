Hooks.once('init', async function () {
  //add settings

  game.settings.register('OSE-helper', 'timeJournalName', {
    name: 'Name Of Journal Entry',
    hint: 'Name Of Journal Entry To Use For Time Keeping',
    scope: 'world',
    type: String,
    default: 'Turn Count',
    config: true
  });
  game.settings.register('OSE-helper', 'restMessage', {
    name: 'Enable rest status chat messages',
    hint: 'Enables rest status chat messages',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register('OSE-helper', 'whisperRest', {
    name: 'Whisper rest status messages',
    hint: 'Whispers rest status messages',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register('OSE-helper', 'tokenLightDefault', {
    name: 'Update default token settings on creation.',
    hint: 'Enables Owlbear preferred default token light settings.',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });

  //stores world time after last turn advance
  game.settings.register('OSE-helper', 'lastTick', {
    name: 'lastTick',
    scope: 'world',
    type: Object,
    default: {
      lastTick: game.time.worldTime
    },
    config: false
  });
  //
  game.settings.register('OSE-helper', 'userData', {
    name: 'userData',
    scope: 'client',
    type: Object,
    default: {
      actors: {},
      lastTick: game.time.worldTime
    },
    config: false
  });
  //
  //custom effect data obj
  game.settings.register('OSE-helper', 'customEffects', {
    name: 'effectData',
    scope: 'world',
    type: Object,
    default: {},
    config: false
  });

  //stores turn count data

  game.settings.register('OSE-helper', 'turnData', {
    name: 'turnData',
    scope: 'world',
    type: Object,
    default: {
      proc: 0,
      procCount: 0,
      rest: 0,
      restWarnCount: 0,
      session: 0,
      total: 0,
      journalName: game.settings.get('OSE-helper', 'timeJournalName')
    },
    config: false
  });

  //ration settings
  game.settings.register('OSE-helper', 'trackRations', {
    name: 'Track Rations Use',
    hint: 'Track Rations Use',
    scope: 'client',
    type: Boolean,
    default: false,
    config: true,
    // onChange: () => console.log('user?', game.user)
  });

  game.settings.register('OSE-helper', 'rationData', {
    name: 'rationData',
    scope: 'world',
    type: Object,
    default: {
      proc: 0,
      procCount: 0,
      rest: 0,
      restWarnCount: 0,
      session: 0,
      total: 0,
      journalName: game.settings.get('OSE-helper', 'timeJournalName')
    },
    config: false
  });

  game.settings.register('OSE-helper', 'centerHotbar', {
    name: 'Center Hotbar',
    hint: 'Center The macro Hotbar',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
    onChange: () => OSEH.util.centerHotbar()
  });
  //split to ose-helper eventually
  game.settings.register('OSE-helper', 'classTypeList', {
    name: 'classTypeList',
    scope: 'world',
    type: Array,
    default: [],
    config: false
  });

  //namespace
  window.OSEH = window.OSEH || {};
  OSEH.gameVersion = game.version ? game.version : game.data.version;
});

//update proc data if changed
Hooks.on('updateSetting', async () => {
  const turnData = game.settings.get('OSE-helper', 'turnData');

  const newName = game.settings.get('OSE-helper', 'timeJournalName');
  const oldName = turnData.journalName;
  const journal = await game.journal.getName(oldName);

  if (newName != oldName) {
    turnData.journalName = newName;
    await journal.update({ name: newName });
  }
  //turn journal update
  if (game.user.role >= 4) {
    game.settings.set('OSE-helper', 'turnData', turnData);
  }
});

Hooks.once('ready', async () => {
  //const lightData = game.settings.get('OSE-helper', 'lightData');
  const turnData = game.settings.get('OSE-helper', 'turnData');
  const jName = game.settings.get('OSE-helper', 'timeJournalName');

  //update turn proc

  turnData.journalName = jName;
  game.settings.set('OSE-helper', 'turnData', turnData);

  //set hook to update light timer durations
  Hooks.on('updateWorldTime', async () => {
    await OSEH.util.oseTick();
    OSEH.util.oseHook('OSE-helper Time Updated');
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
    console.log('create actor fired');
    if (game.settings.get('OSE-helper', 'tokenLightDefault') && game.user.role >= 4) {
      if (actor.data.type == 'character') {
        console.log('new character');
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
      console.log('round up');
      OSEH.util.resetMonsterAttacks();
    }
  }
});

// //effect report
// Hooks.on('renderuserEffectReport', ())
Hooks.on('renderOseActorSheet', (actor, html) => {
  const modBox = html.find(`[class="modifiers-btn"]`);
  modBox.append(
    `<a class="ose-effect-list ose-icon" id ="ose-effect-list" title="Show Active Effects"><i class="fas fa-list"></i></a>`
  );
  // modBox.on('click', '.ose-add-effect', (event) => {
  //   new newCustomEffect(actor.object.id, game.user).render(true);
  // });
  modBox.on('click', '.ose-effect-list', (event) => {
    // console.log('effectList actor', actor);
    OSEH.ce.effectList(actor.object);
  });
  //   modBox.on('click', '.ose-delete-effect', (event) => {
  //     oseDeleteEffect();
  //   });
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
    // console.log('game paused');
    let newState = game.paused ? false : true;
    game.togglePause(newState, true);
  }
});
