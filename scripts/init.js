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
  //stores  active player light data
  // game.settings.register('OSE-helper', 'lightData', {
  //   name: 'lightData',
  //   scope: 'world',
  //   type: Object,
  //   default: {
  //     actors: {},
  //     lastTick: game.time.worldTime
  //   },
  //   config: false
  // });
  //delete

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
    onChange: () => console.log('user?', game.user)
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
  console.log(game.settings.get('OSE-helper', 'turnData'), 'td');
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

  // if (!lightData.lastTick) {
  //   lightData.lastTick = game.time.worldTime;
  // }
  //set hook to update light timer durations
  Hooks.on('updateWorldTime', async () => {
    oseTick();
  });

  //check for count journal
  await countJournalInit(jName);
  console.log('OSE-helper ready');

  //check for userflags

  for (let user of game.users.contents) {
    const flag = await user.getFlag('OSE-helper', 'lightData');
    if (!flag) {
      await user.setFlag('OSE-helper', 'lightData', {});
    }
  }
});

async function countJournalInit(journalName) {
  let entry = game.journal.getName(journalName);

  if (!entry) {
    entry = await JournalEntry.create({
      content: ``,
      name: `${journalName}`
    });
    updateJournal();
    console.log(`OSE-helper: no count journal found.
    Journal entry named ${journalName} created.`);
  }
  return entry;
}
