Hooks.once('init', async function () {
  //CONFIG.debug.hooks = true;
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
  game.settings.register('OSE-helper', 'lightData', {
    name: 'lightData',
    scope: 'world',
    type: Object,
    default: {
      actors: {},
      lastTick: game.time.worldTime
    },
    config: false
  });
  //random encounter interval
  // await game.settings.register('OSE-helper', 'randomEncounterInt', {
  //   name: 'Random Encounter Interval',
  //   hint: 'How often to roll for random encounters. Set to zero to disable.',
  //   scope: 'world',
  //   type: Number,
  //   default: 0,
  //   config: true
  // });
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
  console.log(game.settings.get('OSE-helper', 'turnData'), 'td');
});
//update proc data if changed
Hooks.on('updateSetting', async () => {
  const turnData = game.settings.get('OSE-helper', 'turnData');
  //turnData.proc = game.settings.get('OSE-helper', 'randomEncounterInt');
  //console.log(turnData);
  const newName = game.settings.get('OSE-helper', 'timeJournalName');
  const oldName = turnData.journalName;
  const journal = await game.journal.getName(oldName);
  //console.log(journal);
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
  const lightData = game.settings.get('OSE-helper', 'lightData');
  const turnData = game.settings.get('OSE-helper', 'turnData');
  const jName = game.settings.get('OSE-helper', 'timeJournalName');

  //update turn proc
  //turnData.proc = game.settings.get('OSE-helper', 'randomEncounterInt');
  turnData.journalName = jName;
  game.settings.set('OSE-helper', 'turnData', turnData);
  //console.log(turnData, 'ready turnData');

  if (!lightData.lastTick) {
    //console.log('no lastTick');
    lightData.lastTick = game.time.worldTime;
  }
  Hooks.on('updateWorldTime', async () => {
    tick();
  });
  await countJournalInit(jName);
  console.log('OSE-helper ready');
});

async function countJournalInit(journalName) {
  let entry = game.journal.getName(journalName);
  //console.log(entry);
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
