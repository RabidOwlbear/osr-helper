const oseTime = {};
//increments game-worldtime by input amount
async function oseTimePlus(amt, inc, turn = false) {
  const increments = {
    minute: 60,
    hour: 3600,
    turn: 600
  };
  if (turn) {
    await incrementTurnData();
  }
  game.time.advance(amt * increments[inc]);
}
//resets
function resetData(name) {
  let data;
  switch (name) {
    case 'lightData':
      data = {
        actors: {},
        lastTick: game.time.worldTime
      };
      break;
    case 'turnData':
      data = {
        procCount: 0,
        rest: 0,
        restWarnCount: 0,
        session: 0,
        total: 0,
        journalName: game.settings.get('OSE-helper', 'timeJournalName')
      };
      break;
    default:
      console.error("OSE-helper: resetData('name') error: Name not found");
      return;
  }

  game.settings.set('OSE-helper', `${name}`, data);
}
async function oseResetSessionCount() {
  const data = await game.settings.get('OSE-helper', 'turnData');
  data.session = 0;
  await game.settings.set('OSE-helper', 'turnData', data);
  updateJournal();
}
async function oseResetAllCounts() {
  const data = await game.settings.get('OSE-helper', 'turnData');
  data.session = 0;
  data.procCount = 0;
  data.rest = 0;
  data.total = 0;
  await game.settings.set('OSE-helper', 'turnData', data);
  updateJournal();
}
//increments turn data and updates setting
async function incrementTurnData() {
  const data = await game.settings.get('OSE-helper', 'turnData');
  data.rest++;
  data.session++;
  data.total++;
  data.procCount++;
  await game.settings.set('OSE-helper', 'turnData', data);
  return game.settings.get('OSE-helper', 'turnData');
}

//dungeonTurn: advances one turn, checks if proc is enabled, if so checks if turns elapsed >= proc, if so, roll inputed table,
/*
{
  proc: number          random table roll turn interval, set to 0 to skip all rolls and only advance the turn count
  rollTarget: number,   roll under this number on a d6 to trigger a random table roll
  tableName: string,    name of roll Table to use for random monster rolls set to 'none' to disable
  tableRoll: boolean,   true: rolls on provided table. false: skips table roll
  reactTable: string,   set to 'none' to disable reaction table roll
  reactRoll: boolean    true: rolls on provided reaction table after rolling random encounter table , false: skips reaction roll
}


*/
async function dungeonTurn(data) {
  const turnData = await incrementTurnData();
  restMsg(turnData.rest); //generfate chat message regarding rest status
  if (data.tableRoll) {
    //if tableRoll is true
    //and random monsters are active
    if (turnData.procCount >= data.proc) {
      //if number of turns since last random monster roll is greater than or equal to the random check interval
      turnData.procCount = 0; //resest number of turns since last random check
      await game.settings.set('OSE-helper', 'turnData', turnData); //update settings data <--------
      const theRoll = await new Roll('1d6').roll();
      const gm = game.users.contents.filter((u) => u.data.role == 4).map((u) => u.id);

      if (theRoll.result > data.rollTarget) {
        const content = {
          flavor: "<span style='color: green'>No Monsters!</span>",
          whisper: gm
        };

        await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
          ChatMessage.create(content);
        });
      } else {
        const table = game.tables.getName(data.tableName);
        const roll = await table.roll(table);
        const message = {
          flavor: `<span style='color: red'>${tableFlavor()}</span>`,
          user: game.user._id,
          roll: roll,
          speaker: ChatMessage.getSpeaker(),
          content: `<br/>${roll?.results[0]?.data?.text}<br/><br/>`,
          whisper: gm
        };

        if (data.reactRoll) {
          const reactTable = game.tables.entities.find((t) => t.name === data.reactTable);
          let reactRoll = await reactTable.roll();
          let rollResult = `They look ${reactRoll.results[0].data.text}.`;
          message.content += rollResult;
        }
        await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
          ChatMessage.create(message);
        });
      }
    }
  }
  oseTimePlus(10, 'minute'); //increment ganme time
  updateJournal(); //update turn count journal
}

//write to journal
async function updateJournal() {
  const turnData = game.settings.get('OSE-helper', 'turnData');
  const entry = game.journal.getName(game.settings.get('OSE-helper', 'timeJournalName'));
  if (turnData.rest > 5) {
    let jContent = `<h1>Turn Count</h1><br><p>Session Count: ${turnData.session}</p><p> Total Count: ${turnData.total}</p><p>Turns Since Last Rest: <span style="color: red">${turnData.rest}</span></p>`;
    await entry.update({ content: jContent });
    return;
  } else if (turnData.rest > 3) {
    let jContent = `<h1>Turn Count</h1><br><p>Session Count: ${turnData.session}</p><p> Total Count: ${turnData.total}</p><p>Turns Since Last Rest: <span style="color: orangered">${turnData.rest}</span></p>`;
    await entry.update({ content: jContent });
    return;
  } else {
    let jContent = `<h1>Turn Count</h1><br><p>Session Count: ${turnData.session}</p><p> Total Count: ${turnData.total}</p><p>Turns Since Last Rest: ${turnData.rest}</p>`;
    await entry.update({ content: jContent });
    return;
  }
}

async function restMsg(rc) {
  const turnData = await game.settings.get('OSE-helper', 'turnData');
  console.log('rest msg', rc);
  let chatData = {
    content: ''
  };

  if (rc > 5) {
    let content = '<p style="color: red">You Must Rest!</p>';
    let penalty = `<p style ="color: firebrick">All Players suffer a penalty of –1 to hit and damage rolls until they have rested for one turn.</p>`;
    turnData.restWarnCount++;

    if (rc == 6) {
      content += penalty;
    }
    if (turnData.restWarnCount >= 5) {
      content += penalty;
      turnData.restWarnCount = 0;
    }
    game.settings.set('OSE-helper', 'turnData', turnData);
    chatData.content = content;
    ChatMessage.create(chatData);
    return;
  }
  if (rc > 3) {
    chatData.content = '<p style="color: orangered">You Must Rest Soon!</p>';
    ChatMessage.create(chatData);
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
  // console.log(index);
  //console.log(flavorArr[index]);
  return flavorArr[index];
}

//rest function
async function oseRest() {
  const data = game.settings.get('OSE-helper', 'turnData');
  data.rest = 0;
  data.restWarnCount = 0;
  data.session++;
  data.total++;
  await game.settings.set('OSE-helper', 'turnData', data);
  updateJournal();
  ChatMessage.create({
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: '<span style="color: green"> You Feel Rested! </span>'
  });
  oseTimePlus(10, 'minute');
}
//function calls
async function oseShowTurnCount() {
  const data = await game.settings.get('OSE-helper', 'turnData');
  let style = '';
  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: ''
  };
  if (data.rest > 5) {
    style = '<span style ="color: red">';
  } else if (data.rest > 3) {
    style = '<span style ="color: orangered">';
  } else {
    style = '<span>';
  }
  chatData.content = `<h1>Turn Count</h1><br><p>Session Count: ${data.session}</p><p> Total Count: ${data.total}</p><p>Turns Since Last Rest: ${style}${data.rest}</span></p>`;
  ChatMessage.create(chatData);
}

async function oseLightTurnRemaining(name) {
  const lightData = game.settings.get('OSE-helper', 'lightData');
  const actorId = game.actors.getName(name).id;
  if (lightData.actors[actorId].lightLit) {
    let chatData = {
      content: '',
      whisper: [game.user._id]
    };
    let type, turnsLeft;
    for (let lightType in lightData.actors[actorId]) {
      if (lightData.actors[actorId]?.[lightType]?.isOn) {
        type = lightType;
        turnsLeft = lightData.actors[actorId][lightType].duration / 10;
      }
    }

    if (type == 'torch') {
      let color = `green`;
      if (turnsLeft <= 3) {
        color = 'orangered';
      }
      if (turnsLeft <= 1) {
        color = 'red';
      }
      const turn = turnsLeft == 1 ? 'turn' : 'turns';
      chatData.content = `<h3>Torch Turns Left</h3><p style="color: ${color}">The torch has ${turnsLeft} ${turn} remaining</p>`;

      ChatMessage.create(chatData);
      return;
    }
    if (type == 'lantern') {
      let color = `green`;
      if (turnsLeft <= 6) {
        color = 'orangered';
      }
      if (turnsLeft <= 3) {
        color = 'red';
      }
      const turn = turnsLeft == 1 ? 'turn' : 'turns';
      chatData.content = `<h3>Torch Turns Left</h3><p style="color: ${color}">The torch has ${turnsLeft} ${turn} remaining</p>`;

      ChatMessage.create(chatData);
      return;
    }
  }
  ui.notifications.error('No Light Lit!');
}
