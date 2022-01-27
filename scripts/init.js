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

  game.settings.registerMenu('OSE-helper', 'dungeonTurnSettings', {
    name: 'Dungeon Turn Settings.',
    label: 'Dungeon Turn Settings',
    icon: 'fas fa-wrench',
    scope: 'world',
    type: DungTurnConfig,
    config: true,
    restricted: true,
  })

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
    config: true
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

  game.settings.register('OSE-helper', 'dungeonTurnData', {
    name: 'dungeonTurnData',
    scope: 'world',
    type: Object,
    default: {
      proc: 0,
      rTable: 'none',
      eTable: 'none', 
      rollTarget: 0,
      rollEnc: false,
      rollReact: false,
    },
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
  const oldName = turnData?.journalName;
  const journal = await game.journal.getName(oldName);
  
  if (oldName && newName != oldName) {
    console.log('journal name changed')
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
Hooks.on('renderOseActorSheet', (actor, html) => {
  const modBox = html.find(`[class="modifiers-btn"]`);
  modBox.append(
    `<a class="ose-effect-list ose-icon" id ="ose-effect-list" title="Show Active Effects"><i class="fas fa-list"></i></a>`
  );
  // modBox.on('click', '.ose-add-effect', (event) => {
  //   new newCustomEffect(actor.object.id, game.user).render(true);
  // });
  modBox.on('click', '.ose-effect-list', (event) => {
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
    let newState = game.paused ? false : true;
    game.togglePause(newState, true);
  }
});


class DungTurnConfig extends FormApplication {
  constructor() {
    super();
    
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.baseApplication = 'dungeonTurnConfig';
    options.id = "dungTurnConfig";
    options.template = "modules/OSE-helper/templates/dungeon-turn-config.html";
    options.height = 300;
    options.width = 400;
    // options.left = 500;
    // options.top = 100;
    options.baseApplication = FormApplication;
    return options;
}
// async getData(options) { 
//   return {}
// }
activateListeners(html) {
  super.activateListeners(html);
  let close = html.find('#submit')

  close.on('click', ()=>{
    console.log('clicked', this); 
    this.close(true)
  })
  
}
// async _updateObject(event,formData){
//   console.log(event, formData)
// }

async _onSubmit(event, a, b, c) {
  
    super._onSubmit(event, { preventRefresh: true });
    let data = {
      proc: parseInt(event.target[2].value),
      rTable: event.target[1].value,
      eTable: event.target[0].value, 
      rollTarget:  parseInt(event.target[3].value),
      rollEnc:  event.target[4].checked,
      rollReact:  event.target[5].checked,
    }

  console.log(data)
  await game.settings.set('OSE-helper', 'dungeonTurnData', data)
}

async _updateObject() {}

}
Hooks.on(`renderDungTurnConfig`,async (ev,html)=>{
  console.log(ev,html)
  const data = await game.settings.get('OSE-helper', 'dungeonTurnData');
  // console.log(encTable.value, data)
  document.getElementById('enc-table').value = data.eTable;
  document.getElementById('react-table').value = data.rTable;
  document.getElementById('proc').value = data.proc;
  document.getElementById('roll-target').value = data.rollTarget;
  document.getElementById('roll-enc').checked = data.rollEnc;
  document.getElementById('roll-react').checked = data.rollReact;
  // encTable.value = data.eTable;

  // reactTable.value = data.rTable;
  // proc.value = data.proc;
  // rollTarget.value = data.rollTarget;

} )