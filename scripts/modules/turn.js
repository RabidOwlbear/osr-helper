export const registerTurn = () => {
  OSRH.turn = OSRH.turn || {};

  const osrTime = {};
  //increments game-worldtime by input amount
  OSRH.turn.timePlus = async function (amt, inc, turn = false) {
    const increments = {
      minute: 60,
      hour: 3600,
      turn: 600
    };
    if (turn) {
      await OSRH.turn.incrementTurnData();
    }
    game.time.advance(amt * increments[inc]);
  };
  //resets
  OSRH.turn.resetData = function (name) {
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
          journalName: game.settings.get(`${OSRH.moduleName}`, 'timeJournalName')
        };
        break;
      default:
        console.error(`${OSRH.moduleName}: resetData('name') error: Name not found`);
        return;
    }

    game.settings.set(`${OSRH.moduleName}`, `${name}`, data);
  };

  OSRH.turn.resetSessionCount = async function () {
    const data = await game.settings.get(`${OSRH.moduleName}`, 'turnData');
    data.session = 0;
    await game.settings.set(`${OSRH.moduleName}`, 'turnData', data);
    OSRH.turn.updateJournal();
  };

  OSRH.turn.resetAllCounts = async function () {
    const data = await game.settings.get(`${OSRH.moduleName}`, 'turnData');
    data.session = 0;
    data.procCount = 0;
    data.rest = 0;
    data.total = 0;
    await game.settings.set(`${OSRH.moduleName}`, 'turnData', data);
    OSRH.turn.updateJournal();
  };
  //increments turn data and updates setting
  OSRH.turn.incrementTurnData = async function () {
    const data = await game.settings.get(`${OSRH.moduleName}`, 'turnData');
    data.rest++;
    data.session++;
    data.total++;
    data.procCount++;
    await game.settings.set(`${OSRH.moduleName}`, 'turnData', data);
    return game.settings.get(`${OSRH.moduleName}`, 'turnData');
  };
  OSRH.turn.rollReact = async function (type, mod = false, cMod = null) {
    let rollMod = 0;
    if (mod) {
      if (cMod) {
        rollMod = parseInt(cMod);
      } else {
        if (!OSRH.util.singleSelected()) return;
        rollMod = canvas.tokens.controlled[0].actor.system.scores.cha.mod || 0;
      }
    }
    let roll = new Roll('2d6+@mod', { mod: rollMod }).evaluate({ async: false });
    //  game.dice3d.showForRoll(roll)

    let tRoll = roll.total; //Math.floor(Math.random() * 6 + 1) +  Math.floor(Math.random() * 6 + 1) + rollMod;
    let tables = {
      monster: [
        { val: 0, text: 'Monster Attacks!' },
        { val: 4, text: 'Monster is aggressive! roll again in one round with a penalty of - 4 to the roll' },
        { val: 8, text: 'Monster is cautious; roll again in one round' },
        { val: 10, text: 'Monster is neutral; roll again in one round with a bonus of +4 to the roll' },
        { val: 12, text: 'Monster is friendly!' }
      ],
      npc: [
        { val: 0, text: 'Depart in anger!' },
        { val: 6, text: 'Negotiate' },
        { val: 9, text: 'Offer to buy or sell information.' }
      ]
    };
    let getResultText = (res, table) => {
      let result;
      if (res >= table[table.length - 1].val) {
        result = table[table.length - 1];
      } else {
        let results = table.filter((i) => i.val <= res);
        result = results[results.length - 1];
      }

      return result.text;
    };
    let result = getResultText(tRoll, tables[type]);
    const tType = type == 'npc' ? 'NPC' : 'Monster';
    let modTxt = mod ? `+ ${rollMod}` : ``;
    let content = `
    <h3 style="text-align: center;">Reaction Roll: ${tType}</h3>
    <div>
    <div><b>Roll Formula:</b> 2d6 ${modTxt}</div>
    <div><b>Roll Result:</b> ${roll.total}</div>
    <div><b>${tType} Reaction:</b></div>
    <p>${result}</p>
    </div>
  `;

    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      roll: roll,
      content: content,
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };
    ChatMessage.create(chatData);
  };
  OSRH.turn.dungeonTurn = async function () {
    let turnMsg = game.settings.get(`${OSRH.moduleName}`, 'dungeonTurnNoticiation');
    const data = await game.settings.get(`${OSRH.moduleName}`, 'dungeonTurnData');
    const encTable = game.tables.getName(data.eTable);
    let reactTable = await game.tables.getName(data.rTable);
    // checks
    if (data.rollEnc && !encTable) {
      ui.notifications.error('Encounter Table Not Found');
      return;
    }
    if (data.rollReact && !reactTable) {
      ui.notifications.error('Reaction Table Not Found');
      return;
    }

    const turnData = await OSRH.turn.incrementTurnData();
    turnData.proc = data.proc;
    if (game.settings.get(`${OSRH.moduleName}`, 'restMessage')) {
      OSRH.turn.restMsg(turnData.rest); //generate chat message regarding rest status
    }

    if (data.rollEnc) {
      //if tableRoll is true
      //and random monsters are active
      if (turnData.procCount >= data.proc) {
        //if number of turns since last random monster roll is greater than or equal to the random check interval
        turnData.procCount = 0; //resest number of turns since last random check
        await game.settings.set(`${OSRH.moduleName}`, 'turnData', {});
        await game.settings.set(`${OSRH.moduleName}`, 'turnData', turnData); //update settings data <--------
        const theRoll = await new Roll('1d6').evaluate({ async: true });
        const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);

        if (theRoll.result > data.rollTarget) {
          const content = {
            flavor: "<span style='color: green'>No Monsters!</span>",
            whisper: gm
          };

          await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {
            ChatMessage.create(content);
          });
        } else {
          const roll = await encTable.roll({ async: true });
          const message = {
            flavor: `<span style='color: red'>${OSRH.util.tableFlavor()}</span>`,
            user: game.user.id,
            roll: roll.roll,
            speaker: ChatMessage.getSpeaker(),
            content: `<br/>${roll?.results[0]?.text}<br/><br/>`,
            whisper: gm
          };
          await game.dice3d.showForRoll(theRoll, game.user, false, gm, false).then(() => {});
          if (data.rollReact) {
            reactTable = game.tables.find((t) => t.name === data.rTable);
            let reactRoll = await reactTable.roll({ async: true });
            let rollResult = `They look ${reactRoll.results[0].text}.`;
            message.content += rollResult;
            await game.dice3d.showForRoll(reactRoll.roll, game.user, false, gm, false);
          }
          ChatMessage.create(message);
        }
      }
    }
    OSRH.turn.timePlus(10, 'minute'); //increment ganme time
    OSRH.turn.updateJournal(); //update turn count journal
    if(turnMsg)ui.notifications.notify('Dungeon turn Advanced.');
  };

  //write to journal
  OSRH.turn.updateJournal = async function (entry=null) {
    const turnData =  game.settings.get(`${OSRH.moduleName}`, 'turnData');
    const journalName = game.settings.get(`${OSRH.moduleName}`, 'timeJournalName');
    if(!entry) {
      entry = await game.journal.getName(journalName) || await OSRH.util.countJournalInit(journalName);
    }
    const page = await entry.pages.find((p) => p.name == journalName);
    if (turnData.rest > 5) {
      let jContent = `<br><p>Session Count: ${turnData.session}</p><p> Total Count: ${turnData.total}</p><p>Turns Since Last Rest: <span style="color: red">${turnData.rest}</span></p>`;
      await page.update({ text: { content: jContent } });
      return;
    } else if (turnData.rest > 3) {
      let jContent = `<br><p>Session Count: ${turnData.session}</p><p> Total Count: ${turnData.total}</p><p>Turns Since Last Rest: <span style="color: orangered">${turnData.rest}</span></p>`;
      await page.update({ text: { content: jContent } });
      return;
    } else {
      let jContent = `<br><p>Session Count: ${turnData.session}</p><p> Total Count: ${turnData.total}</p><p>Turns Since Last Rest: ${turnData.rest}</p>`;
      await page.update({ text: { content: jContent } });
      return;
    }
  };

  OSRH.turn.restMsg = function (rc) {
    const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
    const whisper = game.settings.get(`${OSRH.moduleName}`, 'whisperRest');
    const turnData = game.settings.get(`${OSRH.moduleName}`, 'turnData');
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
      game.settings.set(`${OSRH.moduleName}`, 'turnData', turnData);
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
  OSRH.turn.rest = function () {
    const whisper = game.settings.get(`${OSRH.moduleName}`, 'whisperRest');
    const data = game.settings.get(`${OSRH.moduleName}`, 'turnData');
    const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
    data.rest = 0;
    data.restWarnCount = 0;
    data.session++;
    data.total++;
    game.settings.set(`${OSRH.moduleName}`, 'turnData', data);
    OSRH.turn.updateJournal();
    const chatData = {
      content: '<span style="color: green"> You Feel Rested! </span>'
    };
    if (whisper) {
      chatData.whisper = gm;
    }

    ChatMessage.create(chatData);
    OSRH.turn.timePlus(10, 'minute');
  };
  //function calls
  OSRH.turn.showTurnCount =  function () {
    const data =  game.settings.get(`${OSRH.moduleName}`, 'turnData');
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

  OSRH.turn.lightTurnRemaining =  function (actorId) {
    let lightData;
    for (let user of game.users.contents) {
      if (user.flags[`${OSRH.moduleName}`].lightData[actorId]) {
        let flag =  user.getFlag(`${OSRH.moduleName}`, 'lightData');
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
      if (turnsLeft <= OSRH.data.lightSource[type].warn) {
        color = 'orangered';
      }
      if (turnsLeft <= OSRH.lightSource[type].alert) {
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
