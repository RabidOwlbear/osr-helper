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
  await game.settings.register('OSE-helper', 'randomEncounterInt', {
    name: 'Random Encounter Interval',
    hint: 'How often to roll for random encounters. Set to zero to disable.',
    scope: 'world',
    type: String,
    default: 0,
    config: true
  });
  //stores turn count data
  game.settings.register('OSE-helper', 'turnData', {
    name: 'turnData',
    scope: 'world',
    type: Object,
    default: {
      turn: {
        proc: game.settings.get('OSE-helper', 'randomEncounterInt'),
        procCount: 0,
        rest: 0,
        session: 0,
        total: 0
      }
    },
    config: false
  });
});

Hooks.once('ready', async () => {
  const data = game.settings.get('OSE-helper', 'lightData');
  //get journal

  if (!data.lastTick) {
    console.log('no lastTick');
    data.lastTick = game.time.worldTime;
  }
  Hooks.on('updateWorldTime', async () => {
    tick();
  });
  console.log('OSE-helper ready');
});

async function countJournalInit(journalName) {
  let entry = game.journal.getName(journalName);
  console.log(entry);
  if (!entry) {
    entry = await JournalEntry.create({
      content: ``,
      name: `${journalName}`
    });
    console.log(`OSE-helper: no count journal found.
    Journal entry named ${journalName} created.`);
  }
  return entry;
}
