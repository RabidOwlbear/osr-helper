export const registerTurn =  () => {
  OSEH.turn = OSEH.turn || {};

  const oseTime = {};
  //increments game-worldtime by input amount
  OSEH.turn.timePlus = async function (amt, inc, turn = false) {
    const increments = {
      minute: 60,
      hour: 3600,
      turn: 600
    };
    if (turn) {
      await OSEH.turn.incrementTurnData();
    }
    game.time.advance(amt * increments[inc]);
  };
  //resets
  OSEH.turn.resetData = function (name) {
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
  };

  OSEH.turn.resetSessionCount = async function () {
    const data = await game.settings.get('OSE-helper', 'turnData');
    data.session = 0;
    await game.settings.set('OSE-helper', 'turnData', data);
    OSEH.turn.updateJournal();
  };

  OSEH.turn.resetAllCounts = async function () {
    const data = await game.settings.get('OSE-helper', 'turnData');
    data.session = 0;
    data.procCount = 0;
    data.rest = 0;
    data.total = 0;
    await game.settings.set('OSE-helper', 'turnData', data);
    OSEH.turn.updateJournal();
  };
  //increments turn data and updates setting
  OSEH.turn.incrementTurnData = async function () {
   
    const data = await game.settings.get('OSE-helper', 'turnData');
    data.rest++;
    data.session++;
    data.total++;
    data.procCount++;
    await game.settings.set('OSE-helper', 'turnData', data);
    return game.settings.get('OSE-helper', 'turnData');
  };

  OSEH.turn.dungeonTurn = async function () {
    const data = await game.settings.get('OSE-helper', 'dungeonTurnData')
    const encTable = game.tables.getName(data.eTable);
    const reactTable = await game.tables.getName(data.rTable);
    // checks
    if(data.rollEnc && !encTable){
      ui.notifications.error('Encounter Table Not Found');
      return
    }
    if(data.rollReact && !reactTable){
      ui.notifications.error('Reaction Table Not Found');
      return
    }

    
    const turnData = await OSEH.turn.incrementTurnData();
    turnData.proc = data.proc
    if (game.settings.get('OSE-helper', 'restMessage')) {
      OSEH.turn.restMsg(turnData.rest); //generate chat message regarding rest status
    }
    
    if (data.rollEnc) {
      //if tableRoll is true
      //and random monsters are active
      if (turnData.procCount >= data.proc) {
        //if number of turns since last random monster roll is greater than or equal to the random check interval
        turnData.procCount = 0; //resest number of turns since last random check
        await game.settings.set('OSE-helper', 'turnData', {});
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
          const roll = await encTable.roll(encTable);
          const message = {
            flavor: `<span style='color: red'>${OSEH.util.tableFlavor()}</span>`,
            user: game.user.id,
            roll: roll,
            speaker: ChatMessage.getSpeaker(),
            content: `<br/>${roll?.results[0]?.data?.text}<br/><br/>`,
            whisper: gm
          };

          if (data.rollReact) {
            
            if (parseInt(OSEH.gameVersion) < 9) {
              reactTable = game.tables.entities.find((t) => t.name === data.rTable);
            } else {
             
            }

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
    OSEH.turn.timePlus(10, 'minute'); //increment ganme time
    OSEH.turn.updateJournal(); //update turn count journal
  };

  //write to journal
  OSEH.turn.updateJournal = async function () {
    const turnData = game.settings.get('OSE-helper', 'turnData');
    const journalName = game.settings.get('OSE-helper', 'timeJournalName');
    const entry = game.journal.getName(journalName) || (await OSEH.util.countJournalInit(journalName));
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
  };

  OSEH.turn.restMsg = async function (rc) {
    const gm = game.users.contents.filter((u) => u.data.role == 4).map((u) => u.data.id);
    const whisper = await game.settings.get('OSE-helper', 'whisperRest');
    const turnData = await game.settings.get('OSE-helper', 'turnData');
    let chatData = {
      user: game.user.id,
      content: ''
    };
    if (whisper) {
      chatData.whisper = gm;
    }
    if (rc > 5) {
      let content = '<p style="color: red">You Must Rest!</p>';
      let penalty = `<p style ="color: firebrick">All Players suffer a penalty of -1 to hit and damage rolls until they have rested for one turn.</p>`;
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
  };

  //rest function
  OSEH.turn.rest = async function () {
    const whisper = game.settings.get('OSE-helper', 'whisperRest');
    const data = game.settings.get('OSE-helper', 'turnData');
    const gm = game.users.contents.filter((u) => u.data.role == 4).map((u) => u.data.id);
    data.rest = 0;
    data.restWarnCount = 0;
    data.session++;
    data.total++;
    await game.settings.set('OSE-helper', 'turnData', data);
    OSEH.turn.updateJournal();
    const chatData = {
      content: '<span style="color: green"> You Feel Rested! </span>'
    };
    if (whisper) {
      chatData.whisper = gm;
    }

    ChatMessage.create(chatData);
    OSEH.turn.timePlus(10, 'minute');
  };
  //function calls
  OSEH.turn.showTurnCount = async function () {
    const data = await game.settings.get('OSE-helper', 'turnData');
    let style = '';
    let chatData = {
      user: game.user.id,
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
  };

  OSEH.turn.lightTurnRemaining = async function (actorId) {
    let lightData;
    for (let user of game.users.contents) {
      if (user.data.flags['OSE-helper'].lightData[actorId]) {
        let flag = await user.getFlag('OSE-helper', 'lightData');
        lightData = flag;
      }
    }

    if (lightData?.[actorId].lightLit) {
      let chatData = {
        content: '',
        whisper: [game.user.id]
      };
      let type, turnsLeft;

      for (let lightType in lightData[actorId]) {
        if (lightData[actorId]?.[lightType]?.isOn) {
          type = lightType;
          turnsLeft = lightData[actorId][lightType].duration / 10;
        }
      }

      let color = `green`;
      if (turnsLeft <= OSEH.data.lightSource[type].warn) {
        color = 'orangered';
      }
      if (turnsLeft <= OSEH.data.lightSource[type].alert) {
        color = 'red';
      }
      const turn = turnsLeft == 1 ? 'turn' : 'turns';
      const typeCap = type.charAt(0).toUpperCase() + type.slice(1);
      chatData.content = `<h3>${typeCap} Turns Left</h3><p style="color: ${color}">The ${type} has ${turnsLeft} ${turn} remaining</p>`;

      ChatMessage.create(chatData);
      return;
    }
    ui.notifications.error('No Light Lit!');
  };
};
