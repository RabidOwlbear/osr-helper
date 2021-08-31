Hooks.once('init', async function () {
  //CONFIG.debug.hooks = true;
  game.settings.register('OSE-helper', 'timeJournalName', {
    name: 'Name Of Journal Entry',
    hint: 'Name Of Journal Entry To Use For Time Keeping',
    scope: 'world',
    type: String,
    default: 'Turn Count',
    config: true
  });
  game.settings.register('OSE-helper', 'lightData', {
    name: 'lightData',
    // hint: 'Name Of Journal Entry To Use For Time Keeping',
    scope: 'world',
    type: Object,
    default: {
      actors: {},
      lastTick: game.time.worldTime
    },
    config: false
  });
  game.settings.register('OSE-helper', 'lightData', {
    name: 'timeData',
    // hint: 'Name Of Journal Entry To Use For Time Keeping',
    scope: 'world',
    type: Object,
    default: {
      turn: {
        session: 0,
        total: 0
      }
    },
    config: false
  });
});

Hooks.once('ready', async () => {
  console.log('ready hook function<--------');
  const journal = await game.journal.getName(game.settings.get('OSE-helper', 'timeJournalName'));
  console.log(journal, 'time journal');
});

Hooks.once('ready', async () => {
  console.log('--------------------------------->BOOOOOM!');
  const data = game.settings.get('OSE-helper', 'lightData');
  //get journal

  if (!data.lastTick) {
    console.log('no lastTick');
    data.lastTick = game.time.worldTime;
  }
  Hooks.on('updateWorldTime', async () => {
    tick();
  });
  //add journal to light class prototype
});

async function countJournalInit(journalName) {
  console.log(journalName, 'init<---------------------------------------------------------');
  let entry = game.journal.getName(journalName);
  console.log(entry);
  if (!entry) {
    entry = await JournalEntry.create({
      content: ``,
      name: `${journalName}`
    });
  }
  return entry;
}
