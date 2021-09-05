async function dungeonTurn(data) {
  //console.log(data, 'dt start');
  const turnData = await incrementTurnData();

  if (data.tableRoll) {
    //if tableRoll is true
    if (turnData.proc > 0) {
      //and random monsters are active
      if (turnData.procCount >= turnData.proc) {
        //if number of turns since last random monster roll is greater than or equal to the random check interval
        turnData.procCount = 0; //resest number of turns since last random check
        await game.settings.set('OSE-helper', 'turnData', turnData); //update settings data
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
          //if no reactTable provided, return chat data

          //return chatdata plus reactTable result
          if (reactRoll) {
            const reactTable = game.tables.entities.find((t) => t.name === tableName);
            let reactRoll = await reactTable.roll();
            let rollResult = `They look ${reactRoll.results[0].data.text}.`;
            chatData.content += rollResult;
          }
          await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
            ChatMessage.create(message);
          });
        }
      }
    }
  }
  oseTimePlus(10, 'minute'); //increment ganme time
  restMsg(turnData.rest); //generfate chat message regarding rest status
  updateJournal(); //update turn count journal
}

// async function randomMonsterRoll(data) {
//   const { rollTarget } = data;
//   //const data = await game.settings.get('OSE-helper', 'turnData');
//   const theRoll = await new Roll('1d6').roll();
//   //const jEntry = game.journal.entities.find((j) => j.name === jName);
//   //console.log('rolled', theRoll);
//   let gm = game.users.contents.filter((u) => u.data.role == 4).map((u) => u.id);

//   if (theRoll.result > rollTarget) {
//     let content = {
//       flavor: "<span style='color: green'>No Monsters!</span>",
//       whisper: gm
//     };

//     await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
//       ChatMessage.create(content);
//     });
//   } else {
//     let message = await tableFunc(data);

//     await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
//       ChatMessage.create(message);
//     });
//   }
// }

//table
// async function tableFunc(data) {
//   const { tableName, reactTable, reactRoll } = data;
//   const table = game.tables.getName(tableName);
//   //console.log('tabFunc');
//   let roll = await table.roll(table);

//   let chatData = {
//     flavor: `<span style='color: red'>${tableFlavor()}</span>`,
//     user: game.user._id,
//     roll: roll,
//     speaker: ChatMessage.getSpeaker(),
//     content: `<br/>${roll?.results[0]?.data?.text}<br/><br/>`,
//     whisper: game.users.entities.filter((u) => u.data.role == 4).map((u) => u._id)
//   };

//   //if no reactTable provided, return chat data
//   if (!reactRoll) return chatData;

//   //return chatdata plus reactTable result
//   chatData.content += await reactFunc(reactTable);

//   return chatData;
// }
// async function reactFunc(tableName) {
//   const reactTable = game.tables.entities.find((t) => t.name === tableName);
//   //console.log('react', reactTable);
//   let reactRoll = await reactTable.roll();
//   let retStr = `They look ${reactRoll.results[0].data.text}.`;
//   return retStr;
// }

//
/*
async function dungeonTurn(data) {
  //console.log(data, 'dt start');
  const turnData = await incrementTurnData();
  //console.log(turnData, 'dt data');
  //console.log(turnData.proc, turnData.procCount);
  if (data.tableRoll) {
    if (turnData.proc > 0) {
      if (turnData.procCount >= turnData.proc) {
        // console.log('boom');
        // let theRoll = await new Roll('1d6').roll({ async: true });
        //console.log('proc!', theRoll);
        turnData.procCount = 0;
        await game.settings.set('OSE-helper', 'turnData', turnData);
        randomMonsterRoll(data);
      }
    }
  }
  oseTimePlus(10, 'minute');
  restMsg(turnData.rest);
  updateJournal();
}


async function randomMonsterRoll(data) {
  const { rollTarget } = data;
  //const data = await game.settings.get('OSE-helper', 'turnData');
  const theRoll = await new Roll('1d6').roll();
  //const jEntry = game.journal.entities.find((j) => j.name === jName);
  //console.log('rolled', theRoll);
  let gm = game.users.contents.filter((u) => u.data.role == 4).map((u) => u.id);

  if (theRoll.result > rollTarget) {
    let content = {
      flavor: "<span style='color: green'>No Monsters!</span>",
      whisper: gm
    };

    await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
      ChatMessage.create(content);
    });
  } else {
    let message = await tableFunc(data);

    await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
      ChatMessage.create(message);
    });
  }
}

//table
async function tableFunc(data) {
  const { tableName, reactTable, reactRoll } = data;
  const table = game.tables.getName(tableName);
  //console.log('tabFunc');
  let roll = await table.roll(table);

  let chatData = {
    flavor: `<span style='color: red'>${tableFlavor()}</span>`,
    user: game.user._id,
    roll: roll,
    speaker: ChatMessage.getSpeaker(),
    content: `<br/>${roll?.results[0]?.data?.text}<br/><br/>`,
    whisper: game.users.entities.filter((u) => u.data.role == 4).map((u) => u._id)
  };

  //if no reactTable provided, return chat data
  if (!reactRoll) return chatData;

  //return chatdata plus reactTable result
  chatData.content += await reactFunc(reactTable);

  return chatData;
}
async function reactFunc(tableName) {
  const reactTable = game.tables.entities.find((t) => t.name === tableName);
  //console.log('react', reactTable);
  let reactRoll = await reactTable.roll();
  let retStr = `They look ${reactRoll.results[0].data.text}.`;
  return retStr;
}
*/
