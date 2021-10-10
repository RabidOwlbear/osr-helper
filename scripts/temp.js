Hooks.on('renderOseActorSheet', (actor, html) => {
  // console.log('actor id', actor, actor.object.id);
  const modBox = html.find(`[class="modifiers-btn"]`);
  modBox.append(`<a class="ose-effect-list ose-helper-icon" title="Show Active Effects"><i class="fas fa-list"></i></a>
    <a class="ose-add-effect ose-helper-icon" title="Add Effect"><i class="fas fa-hand-sparkles"></i></a>
    <a class="ose-delete-effect ose-helper-icon" title="Delete Active Effect"><i class="fas fa-ban"></i></a>`);
  if (!game.actors.getName(actor.object.name).getFlag('OSE-helper', 'classSelected')) {
    modBox.append(
      `<a class="ose-helper-icon ose-choose-class" title="Choose A Class"><i class="fas fa-user-shield"></i></a>`
    );
  }
  modBox.on('click', '.ose-add-effect', (event) => {
    new CustomEffectForm(actor.object.id, game.user).render(true);
  });
  modBox.on('click', '.ose-effect-list', (event) => {
    generateEffectReport(game.user.id);
  });
  modBox.on('click', '.ose-delete-effect', (event) => {
    oseDeleteEffect();
  });
  modBox.on('click', '.ose-choose-class', (event) => {
    oseClassDialog(actor.object);
  });
});

async function OseHelperAddItem(itemName, compName, actor) {
  const compendium = await game.packs.get(compName);
  const index = await compendium.getIndex();
  const entry = await index.find((e) => e.name == itemName);
  console.log('entry', entry, entry._id, entry.id);
  const entity = await compendium.getDocument(entry._id);

  const newEntity = await entity.clone();
  console.log('entity', entity, newEntity);
  actor.createEmbeddedDocuments('Item', [newEntity.data]);
}
async function OseAddClassAbilitiesA(compName, actor) {
  console.log(compName);
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  const compendium = await game.packs.get(compName);
  for (let abil of compendium.index.contents) {
    const id = abil._id;
    const entity = await compendium.getDocument(id);

    const newEntity = await entity.clone();
    await sleep(500);
    //console.log('entity', entity, newEntity);
    await actor.createEmbeddedDocuments('Item', [entity.data]);
  }
}
async function OseAddClassAbilities(className, actor) {
  console.log(className);
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  const compendium = await game.packs.get('Old-School-Essentials.ose abilities');
  console.log(compendium);
  for (let abil of compendium.index.contents) {
    const ability = await compendium.getDocument(abil._id);
    //console.log('ability', ability);
    if (ability.data.data.requirements == className) {
      console.log('ability', ability.data.name);
      await sleep(500);
      //console.log('entity', entity, newEntity);
      await actor.createEmbeddedDocuments('Item', [ability.data]);
    }
  }
}
async function oseClassDialog(actor) {
  let dialogTemplate = `<h1>Choose Class Type</h1>
  
    <div id="class-radio" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <input type="radio" id="classRad1" name="classRad" value="basic" checked>
        <label for="classRad1">Basic</label>
      </div>
      <div>
        <input type="radio" id="classRad2" name="classRad" value="advanced">
        <label for="classRad1">Advanced</label>
      </div>
      <div style="display: flex; align-items: center;">
        <label for="rollHp">Roll Starting Hp?</label>
        <input type="checkbox" id="rollHp" name="rollHp" checked>
      </div>
  `;
  new Dialog({
    title: 'Choose Class Type',
    content: dialogTemplate,
    buttons: {
      chooseType: {
        label: 'Select Class Type',
        callback: async (html) => {
          const classType = html.find("input[type='radio'][name='classRad']:checked")[0].value;
          const rollHp = html.find(`input[type='checkbox']`)[0].checked;
          console.log(classType, rollHp);
          oseChooseClass(actor, classType, rollHp);
        }
      }
      // ,
      // close: {
      //   label: 'Close'
      // }
    }
  }).render(true);
}

async function oseChooseClass(actor, type, rollHp) {
  let classOptions = `<option value="default">Class - Prime | Requirements</option>`;
  for (let oseClass in oseClasses[type]) {
    const obj = oseClasses[type][oseClass];
    classOptions += `<option value="${obj.name}" name ="${oseClass.name}">${obj.menu} - ${obj.req}</option>`;
  }
  let dialogTemplate = `
  <h1> Choose Character Class </h1>
  <div style="display:flex">
  <div ><select id="characterClass">${classOptions}</select></div>
    `;
  //console.log(classOptions);
  new Dialog({
    title: 'Choose Class',
    content: dialogTemplate,
    buttons: {
      back: {
        label: 'Back',
        callback: () => {
          oseClassDialog(actor);
        }
      },
      chooseClass: {
        label: 'Select Class',
        callback: async (html) => {
          console.log(html.find('#characterClass')[0].selectedOptions);

          const className = html.find('#characterClass')[0].value;
          const compName = `Old-School-Essentials.` + className + ' abilities';
          const classObj = oseClasses[type][className];
          console.log('select data', compName, className, type, rollHp, classObj);

          if (className == 'default') {
            ui.notifications.warn('Please Choose A Class');
            oseChooseClass(actor, type, rollHp);
          } else {
            let updateData = {
              data: {
                details: {
                  class: classObj.menu,
                  title: classObj.title,
                  xp: {
                    next: classObj.xp
                  },
                  description: classObj.description,
                  notes: classObj.notes
                },
                saves: {
                  death: {
                    value: classObj.saves[0]
                  },
                  wand: {
                    value: classObj.saves[1]
                  },
                  paralysis: {
                    value: classObj.saves[2]
                  },
                  breath: {
                    value: classObj.saves[3]
                  },
                  spell: {
                    value: classObj.saves[4]
                  }
                },
                languages: {
                  value: classObj.languages
                },
                spells: {
                  enabled: false
                }
              }
            };
            if (rollHp) {
              let hd = classObj.hd;
              console.log('<----------------', className, hd);
              let hp = Math.floor(Math.random() * hd + 1);
              updateData.data.hp = {
                hd: `1d${hd}`,
                value: hp,
                max: hp
              };
            }

            if (classObj.spellCaster) {
              console.log('spell caster');
              updateData.data.spells = { enabled: true };
              console.log('after', updateData);
              if (classObj.spellSlot) {
                updateData.data.spells[1] = { max: classObj.spellSlot };
              }
            }
            console.log('updata', updateData);
            await actor.update(updateData);
            OseAddClassAbilities(className, actor);
            await actor.setFlag('OSE-helper', 'classSelected', true);
            oseChooseAlignment(actor);
          }
        }
      }
    }
  }).render(true);
}
function oseChooseAlignment(actor) {
  let dialogTemplate = `
  <h2>Choose Alignment</h2>
  <div style="display: flex; justify-content: center">
    <select id="oseAlignment">
      <option id="lawful" name="lawful">Lawful</option>
      <option id="neutral" name="neutral">Neutral</option>
      <option id="chaotic" name="chaotic">Chaotic</option>
    </select>
  </div>`;
  new Dialog({
    title: 'Choose Class',
    content: dialogTemplate,
    buttons: {
      chooseAlignment: {
        label: 'Choose Alignment',
        callback: async (html) => {
          const selected = html.find('#oseAlignment')[0].value;
          await actor.update({
            data: {
              details: {
                alignment: selected
              }
            }
          });
          oseClassComplete();
        }
      }
    }
  }).render(true);
}
function oseClassComplete() {
  new Dialog({
    title: 'Class Selection Complete',
    content: `<h2>Class Selection Complete</h2>
    <p>Character setup complete.</p>
    <p>Don't forget to set your Bonus XP% on the character sheet tweaks menu!</p>`,
    buttons: {
      close: {
        label: 'Close'
      }
    }
  }).render(true);
}
function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
/*
{
  str
}
*/
async function oseBonusXp(actor, reqObj) {
  const scores = actor.data.data.scores;

  console.log(scores);
}

