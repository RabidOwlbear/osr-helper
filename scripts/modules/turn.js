export const registerTurn = () => {
  OSRH.turn = OSRH.turn || {};

  const osrTime = {};
  //increments game-worldtime by input amount
  OSRH.turn.timePlus = async function (amt, inc, turn = false, turnType = null) {
    const increments = {
      minute: 60,
      hour: 3600,
      turn: 600
    };
    if (turn && turnType) {
      await OSRH.turn.incrementTurnData(turnType, true);
    }
    game.time.advance(amt * increments[inc]);
  };
  //resets
  OSRH.turn.resetData = async function (name) {
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
          journalName: await game.settings.get(`${OSRH.moduleName}`, 'timeJournalName')
        };
        break;
      default:
        console.error(`${OSRH.moduleName}: resetData('name') error: Name not found`);
        return;
    }

    await game.settings.set(`${OSRH.moduleName}`, `${name}`, data);
  };

  OSRH.turn.resetSessionCount = async function (type = null) {
    const data = deepClone(await game.settings.get(`${OSRH.moduleName}`, 'turnData'));
    if (type) {
      data[type].session = 0;
    }
    await game.settings.set(`${OSRH.moduleName}`, 'turnData', data);
    OSRH.turn.updateJournal();
  };

  OSRH.turn.resetAllCounts = async function (type = null) {
    const data = deepClone(await game.settings.get(`${OSRH.moduleName}`, 'turnData'));
    if (type) {
      data[type].session = 0;
      data[type].procCount = 0;
      data[type].rest = 0;
      data[type].total = 0;
    } else {
      data.dungeon.session = 0;
      data.dungeon.procCount = 0;
      data.dungeon.rest = 0;
      data.dungeon.total = 0;
      data.travel.session = 0;
      data.travel.procCount = 0;
      data.travel.rest = 0;
      data.travel.total = 0;
    }
    await game.settings.set(`${OSRH.moduleName}`, 'turnData', data);
    await OSRH.turn.updateJournal();
    return true;
  };
  //increments turn data and updates setting
  OSRH.turn.incrementTurnData = async function (type, set = false, turnData = false) {
    let data = turnData ? turnData : await deepClone(game.settings.get(`${OSRH.moduleName}`, 'turnData'));
    if (type == 'dungeon') {
      data.dungeon.rest++;
      data.dungeon.session++;
      data.dungeon.total++;
      data.dungeon.procCount++;
      // tracker animation count
      data.dungeon.walkCount++;
      data.dungeon.rSprite = false;
      // reset walk count
      if (data.dungeon.walkCount > 5) data.dungeon.walkCount = 1;
    }
    if (type == 'travel') {
      data.travel.session++;
      data.travel.total++;
      data.travel.rest++;
      data.travel.procCount++;
    }

    if (set) {
      await game.settings.set(`${OSRH.moduleName}`, 'turnData', data);
    }
    return data;
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
    let turnMsg = await game.settings.get(`${OSRH.moduleName}`, 'dungeonTurnNotificiation');
    const data = deepClone(await game.settings.get(`${OSRH.moduleName}`, 'turnData'));
    const encTableName = data.dungeon.eTables[data.dungeon.lvl - 1];
    let encTable = null;
    let reactTable = null;

    if (data.dungeon.lvl > data.dungeon.eTables.length)
      encTableName = data.dungeon.eTables[data.dungeon.eTables.length - 1];
    if (encTableName === 'none') {
    } else {
      encTable = game.tables.getName(encTableName);
      reactTable = await game.tables.getName(data.dungeon.rTable);
      // checks
      if (data.dungeon.rollEnc && !encTable) {
        ui.notifications.error('Encounter Table Not Found');
        return;
      }
      if (data.dungeon.rollReact && !reactTable) {
        ui.notifications.error('Reaction Table Not Found');
        return;
      }
    }
    const turnData = await OSRH.turn.incrementTurnData('dungeon', false, data);
    if (await game.settings.get(`${OSRH.moduleName}`, 'restMessage')) {
      OSRH.turn.restMsg(turnData.dungeon.rest, 'dungeon', data); //generate chat message regarding rest status
    }
    if (turnData.dungeon.rollEnc && encTableName !== 'none') {
      //if tableRoll is true
      //and random monsters are active

      if (turnData.dungeon.procCount >= turnData.dungeon.proc) {
        //if number of turns since last random monster roll is greater than or equal to the random check interval
        turnData.dungeon.procCount = 0; //resest number of turns since last random check

        // await game.settings.set(`${OSRH.moduleName}`, 'turnData', turnData); //update settings data <--------
        const theRoll = await new Roll('1d6').evaluate({ async: true });
        const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);

        if (theRoll.result > turnData.dungeon.rollTarget) {
          const content = {
            flavor: "<span style='color: green'>No Monsters!</span>",
            whisper: gm
          };

          await game?.dice3d?.showForRoll(theRoll, game.user, false, gm, false);
          ChatMessage.create(content);
        } else {
          const roll = await encTable.roll({ async: true });
          let content = ``;
          for (let res of roll.results) {
            if (!res.documentCollection.length) {
              content += `<br/>${res.text}<br/>`;
            } else {
              content += `<br/>@${res.documentCollection}[${res.text}]<br/>`;
            }
            content += `<br>`;
          }
          if (roll.roll._evaluated) {
            const message = {
              flavor: `<span style='color: red'>${OSRH.util.tableFlavor()}</span>`,
              user: game.user.id,
              roll: roll.roll,
              speaker: ChatMessage.getSpeaker(),
              content: content,
              whisper: gm
            };

            await game?.dice3d?.showForRoll(theRoll, game.user, false, gm, false);
            if (turnData.dungeon.rollReact) {
              reactTable = game.tables.getName(turnData.dungeon.rTable);
              let reactRoll = await reactTable.roll({ async: true });
              let rollResult = `They look ${reactRoll.results[0].text}.`;
              message.content += rollResult;
              await game?.dice3d?.showForRoll(reactRoll.roll, game.user, false, gm, false);
            }
            ChatMessage.create(message);
          }
        }
      }
    }
    OSRH.turn.timePlus(10, 'minute'); //increment game time
    await game.settings.set(`${OSRH.moduleName}`, 'turnData', turnData); //update settings data <--------
    await OSRH.turn.updateJournal(); //update turn count journal
    if (turnMsg) ui.notifications.notify('Dungeon turn Advanced.');
    OSRH.turn.refreshTurnTracker(turnData);
    return true;
  };

  OSRH.turn.travelTurn = async function () {
    let turnMsg = await game.settings.get(`${OSRH.moduleName}`, 'dungeonTurnNotificiation');
    let turnData = deepClone(await game.settings.get(`${OSRH.moduleName}`, 'turnData'));
    let travelData = turnData.travel;
    const encTableName = travelData.eTable;
    let encTable;
    let reactTable;
    if (encTableName === 'none') {
    } else {
      encTable = await game.tables.getName(encTableName);
      reactTable = await game.tables.getName(travelData.rTable);
      // checks
      if (travelData.rollEnc && !encTable) {
        ui.notifications.error('Encounter Table Not Found');
        return;
      }
      if (travelData.rollReact && !reactTable) {
        ui.notifications.error('Reaction Table Not Found');
        return;
      }
    }

    turnData = deepClone(await OSRH.turn.incrementTurnData('travel'));
    travelData = turnData.travel;
    if (await game.settings.get(`${OSRH.moduleName}`, 'restMessage')) {
      OSRH.turn.restMsg(turnData.travel.rest, 'travel'); //generate chat message regarding rest status
    }
    if (travelData.rollEnc && encTableName !== 'none') {
      if (travelData.proc && travelData.proc > 0) {
        const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
        for (let i = 0; i < travelData.proc; i++) {
          const theRoll = await new Roll('1d6').evaluate({ async: true });

          if (theRoll.result > travelData.rollTarget) {
            const content = {
              flavor: `<h3>Encounter ${i + 1}</h3><span style='color: green'>No Monsters!</span>`,
              whisper: gm
            };

            await game?.dice3d?.showForRoll(theRoll, game.user, false, gm, false);
            ChatMessage.create(content);
          } else {
            const roll = await encTable.roll({ async: true });
            if (roll.roll._evaluated) {
              let content = ``;
              for (let res of roll.results) {
                if (!res.documentCollection.length) {
                  content += `<br/>${res.text}<br/>`;
                } else {
                  content += `<br/>@${res.documentCollection}[${res.text}]<br/>`;
                }
                content += `<br>`;
              }
              const message = {
                flavor: `<h3>Encounter ${i + 1}</h3><span style='color: red'>${OSRH.util.tableFlavor()}</span>`,
                user: game.user.id,
                roll: roll.roll,
                speaker: ChatMessage.getSpeaker(),
                content: content,
                whisper: gm
              };

              await game?.dice3d?.showForRoll(theRoll, game.user, false, gm, false);
              if (travelData.rollReact) {
                reactTable = await game.tables.getName(travelData.rTable); //game.tables.find((t) => t.name === data.rTable);
                let reactRoll = await reactTable.roll({ async: true });
                let rollResult = `They look ${reactRoll.results[0].text}.`;
                message.content += rollResult;
                await game?.dice3d?.showForRoll(reactRoll.roll, game.user, false, gm, false);
              }
              ChatMessage.create(message);
            }
          }
        }
      }
    }

    OSRH.turn.timePlus(travelData.duration, 'hour'); //increment game time
    await OSRH.turn.updateJournal(); //update turn count journal
    if (turnMsg) ui.notifications.notify('Travel turn Advanced.');
    OSRH.turn.refreshTurnTracker();
    return true;
  };

  OSRH.turn.refreshTurnTracker = function () {
    Object.keys(ui.windows).map((i) => {
      let app = ui.windows[i];
      if (app.options.id === 'turn-tracker') {
        app.refreshCounts(true);
      }
    });
  };

  //write to journal
  OSRH.turn.updateJournal = async function (entry = null) {
    const turnData = deepClone(await game.settings.get(`${OSRH.moduleName}`, 'turnData'));
    const journalName = await game.settings.get(`${OSRH.moduleName}`, 'timeJournalName');
    if (!entry) {
      entry = (await game.journal.getName(journalName)) || (await OSRH.util.countJournalInit(journalName));
    }
    const page = await entry.pages.find((p) => p.name == journalName);
    let jContent = ``;
    if (turnData.dungeon.rest > 5) {
      jContent += `
      <h2>Dungeon Turns</h2>
      <br>
      <p>Session Count: ${turnData.dungeon.session}</p>
      <p> Total Count: ${turnData.dungeon.total}</p>
      <p>Turns Since Last Rest: <span style="color: red">${turnData.dungeon.rest}</span></p>`;
    } else if (turnData.dungeon.rest > 3) {
      jContent += ` <h2>Dungeon Turns</h2>
      <br>
      <p>Session Count: ${turnData.dungeon.session}</p>
      <p> Total Count: ${turnData.dungeon.total}</p>
      <p>Turns Since Last Rest: <span style="color: orangered">${turnData.dungeon.rest}</span></p>`;
    } else {
      jContent += ` 
      <h2>Dungeon Turns</h2>
      <br>
      <p>Session Count: ${turnData.dungeon.session}</p>
      <p> Total Count: ${turnData.dungeon.total}</p>
      <p>Turns Since Last Rest: ${turnData.dungeon.rest}</p>`;
    }
    if (turnData.travel.rest > 5) {
      jContent += `
      <h2>Travel Turns</h2>
      <br>
      <p>Session Count: ${turnData.travel.session}</p>
      <p> Total Count: ${turnData.travel.total}</p>
      <p>Turns Since Last Rest: <span style="color: red">${turnData.travel.rest}</span></p>`;
    } else if (turnData.travel.rest > 3) {
      jContent += `
      <h2>Travel Turns</h2>
      <br>
      <p>Session Count: ${turnData.travel.session}</p>
      <p> Total Count: ${turnData.travel.total}</p>
      <p>Turns Since Last Rest: <span style="color: orangered">${turnData.travel.rest}</span></p>`;
    } else {
      jContent += `
      <h2>Travel Turns</h2>
      <br><p>Session Count: ${turnData.travel.session}</p>
      <p> Total Count: ${turnData.travel.total}</p>
      <p>Turns Since Last Rest: ${turnData.travel.rest}</p>`;
    }
    await page.update({ text: { content: jContent } });
    return;
  };

  OSRH.turn.restMsg = async function (count, type, data = false) {
    const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
    const whisper = await game.settings.get(`${OSRH.moduleName}`, 'whisperRest');
    const turnData = data ? data : deepClone(await game.settings.get(`${OSRH.moduleName}`, 'turnData'));
    let chatData = {
      user: game.user.id,
      content: ''
    };
    if (whisper) {
      chatData.whisper = gm;
    }
    if (count > 5) {
      let content = '<p style="color: red">You Must Rest!</p>';
      let penalty = `<p style ="color: firebrick">All Players suffer a penalty of -1 to hit and damage rolls until they have rested for one turn.</p>`;
      turnData[type].restWarnCount++;

      if (count == 6) {
        content += penalty;
      }
      if (turnData[type].restWarnCount >= 5) {
        content += penalty;
        turnData[type].restWarnCount = 0;
      }
      
      await game.settings.set(`${OSRH.moduleName}`, 'turnData', turnData);
      chatData.content = content;
      ChatMessage.create(chatData);
      return;
    }
    if (count > 3) {
      chatData.content = '<p style="color: orangered">You Must Rest Soon!</p>';
      ChatMessage.create(chatData);
      return;
    }
  };

  //rest function
  OSRH.turn.rest = async function (type = 'dungeon') {
    const whisper = await game.settings.get(`${OSRH.moduleName}`, 'whisperRest');
    const data = deepClone(await game.settings.get(`${OSRH.moduleName}`, 'turnData'));
    const gm = game.users.contents.filter((u) => u.role == 4).map((u) => u.id);
    if (type === 'dungeon') {
      data.dungeon.rest = 0;
      data.dungeon.restWarnCount = 0;
      data.dungeon.session++;
      data.dungeon.total++;
      data.dungeon.rSprite = true;
    }
    if (type === 'travel') {
      data.travel.rest = 0;
      data.travel.restWarnCount = 0;
      data.travel.session++;
      data.travel.total++;
    }
    
    await game.settings.set(`${OSRH.moduleName}`, 'turnData', data);
    await OSRH.turn.updateJournal();
    const chatData = {
      content: '<span style="color: green"> You Feel Rested! </span>'
    };
    if (whisper) {
      chatData.whisper = gm;
    }

    await ChatMessage.create(chatData);
    let dur = type == 'travel' ? data.travel.duration : 10;
    let inc = type == 'travel' ? 'hour' : 'minute';
    OSRH.turn.timePlus(dur, inc);
    OSRH.socket.executeForEveryone('refreshTurnTracker')
  };

  //function calls
  OSRH.turn.showTurnCount = async function (type = null) {
    const data = deepClone(await game.settings.get(`${OSRH.moduleName}`, 'turnData'));
    let dStyle = '';
    let tStyle = '';
    let chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content: ''
    };
    dStyle = data.dungeon.rest > 5 ? 'style = "color: red"' : data.dungeon.rest > 3 ? 'style = "color: orangered"' : '';
    tStyle = data.travel.rest > 5 ? 'style = "color: red"' : data.travel.rest > 3 ? 'style = "color: orangered"' : '';

    chatData.content = ``;
    if (type == 'dungeon' || type === null) {
      chatData.content += `<h2>Dungeon Turn Count</h2><br><p>Session Count: ${data.dungeon.session}</p><p> Total Count: ${data.dungeon.total}</p><p>Turns Since Last Rest: <span ${dStyle}>${data.dungeon.rest}</span></p>
    <br>`;
    }
    if (type == 'travel' || type === null) {
      chatData.content += `<h2>Travel Turn Count</h2><br><p>Session Count: ${data.travel.session}</p><p> Total Count: ${data.travel.total}</p><p>Turns Since Last Rest: <span ${tStyle}>${data.travel.rest}</span></p>`;
    }
    ChatMessage.create(chatData);
  };

  OSRH.turn.lightTurnRemaining = function (actorId) {
    let lightData;
    for (let user of game.users.contents) {
      if (user.flags[`${OSRH.moduleName}`].lightData[actorId]) {
        let flag = user.getFlag(`${OSRH.moduleName}`, 'lightData');
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
