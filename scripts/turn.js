game.Gametime.advanceClock(600);
const jName = 'Turn Count';
const rTableName = 'Wandering Monster Table: Level 2';
const table = game.tables.entities.find((t) => t.name === rTableName);
const theRoll = await new Roll('1d6').roll();
const rollTarget = 2;
const skip = 2;

const data = game.settings.get('OSE-helper', 'turnData');

// async function setFlags(jEntry, scope, arr) {
//   for (let obj of arr) {
//     await jEntry.setFlag(scope, obj.key, obj.val);
//   }
//   return console.log('_____Flags Set_____');
// }
// function flagObj(a = 0, b = 0, c = 0, d = 0) {
//   return [
//     {
//       key: 'count',
//       val: a
//     },
//     {
//       key: 'tCount',
//       val: b
//     },
//     {
//       key: 'sCount',
//       val: c
//     },
//     {
//       key: 'skC',
//       val: d
//     }
//   ];
// }
// async function countJournalInit(journalName) {
//   let entry = game.journal.entities.find((j) => j.name === journalName);
//   if (!entry) {
//     entry = await JournalEntry.create({
//       content: ``,
//       name: `Turn Count`
//     });

//     await setFlags(entry, 'world', flagObj());

//     ui.notifications.notify('Journal entry "Turn Count" created.');
//     entry = game.journal.entities.find((j) => j.name === journalName);
//   }
//   return Promise.resolve(entry);
// }
async function updateFlags(jEntry) {
  //assign flag value to variables

  let rc = jEntry.getFlag('world', 'count');
  let sc = jEntry.getFlag('world', 'sCount');
  let tc = jEntry.getFlag('world', 'tCount');
  let skC = jEntry.getFlag('world', 'skC');
  //increment turn count
  rc++;
  sc++;
  tc++;
  skC++;
  //update flags
  await setFlags(jEntry, 'world', flagObj(rc, tc, sc, skC));

  console.log(`final sCount:${jEntry.getFlag('world', 'sCount')}\n final tCount: ${jEntry.getFlag('world', 'tCount')}`);
  restMsg(rc);
  return Promise.resolve(jEntry);
}
function incrementTurnData() {
  const data = game.settings.get('OSE-helper', 'turnData');
  data.procCount++;
  rest++;
  session++;
  total++;
}
async function rollFunc(count) {
  const jEntry = game.journal.entities.find((j) => j.name === jName);
  console.log('rolled', count, jEntry);
  let gm = game.users.contents.filter((u) => u.data.role == 4).map((u) => u.id);
  if (count >= skip) {
    await jEntry.setFlag('world', 'skC', 0);
    if (theRoll.result > rollTarget) {
      let content = {
        flavor: "<span style='color: green'>No Monsters!</span>",
        whisper: gm
      };

      await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
        ChatMessage.create(content);
      });
    } else {
      let message = await tableFunc(table);

      await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
        ChatMessage.create(message);
      });
    }
  }
}

//table
async function tableFunc(table) {
  console.log('tabFunc');
  let roll = await table.roll();

  let chatData = {
    flavor: `<span style='color: red'>${tableFlavor()}</span>`,
    user: game.user._id,
    roll: roll,
    speaker: ChatMessage.getSpeaker(),
    content: `<br/>${roll.results[0].data.text}<br/><br/>`,
    whisper: game.users.entities.filter((u) => u.data.role == 4).map((u) => u._id)
  };

  chatData.content += await reactFunc();

  return chatData;
}
async function reactFunc() {
  const reactTable = game.tables.entities.find((t) => t.name === 'Monster Reaction Roll');
  console.log('react', reactTable);
  let reactRoll = await reactTable.roll();
  let retStr = `They look ${reactRoll.results[0].data.text}.`;
  return retStr;
}
//write to journal
function updateJournal(jEntry) {
  console.log(jEntry, 'updoooooot');
  let entry = jEntry;
  let rc = jEntry.getFlag('world', 'count');
  let sc = jEntry.getFlag('world', 'sCount');
  let tc = jEntry.getFlag('world', 'tCount');
  let count = jEntry.getFlag('world', 'skC');
  if (rc > 5) {
    let jContent = `<h1>Turn Count</h1><br><p>Session Count: ${sc}</p><p> Total Count: ${tc}</p><p>Turns Since Last Rest: <span style="color: red">${rc}</span></p>`;
    jEntry.update({ content: jContent });
    return Promise.resolve(count, entry);
  } else if (rc > 3) {
    let jContent = `<h1>Turn Count</h1><br><p>Session Count: ${sc}</p><p> Total Count: ${tc}</p><p>Turns Since Last Rest: <span style="color: orangered">${rc}</span></p>`;
    jEntry.update({ content: jContent });
    return Promise.resolve(count, entry);
  } else {
    let jContent = `<h1>Turn Count</h1><br><p>Session Count: ${sc}</p><p> Total Count: ${tc}</p><p>Turns Since Last Rest: ${rc}</p>`;
    jEntry.update({ content: jContent });
    return Promise.resolve(count, entry);
  }
}
function restMsg(rc) {
  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: ''
  };
  if (rc > 5) {
    chatData.content = '<p style="color: red">You Must Rest!</p>';
    ChatMessage.create(chatData);
  } else if (rc > 3) {
    chatData.content = '<p style="color: orangered">You Must Rest Soon!</p>';
    ChatMessage.create(chatData);
  } else {
    return;
  }
}
//random text generator
function tableFlavor() {
  let flavorArr = [
    '<span style="color: DeepPink">What is THIS!!!</span>',
    '<span style="color: DeepPink">What is that I hear?</span>',
    '<span style="color: DeepPink">Something is Coming!</span>',
    '<span style="color: DeepPink">What was THAT!?!</span>',
    '<span style="color: DeepPink">LISTEN! Do you smell something?!?</span>'
  ];
  let index = Math.floor(Math.random() * flavorArr.length);
  console.log(index);
  console.log(flavorArr[index]);
  return flavorArr[index];
}
//function calls
await countJournalInit(jName).then(updateFlags).then(updateJournal).then(rollFunc);
