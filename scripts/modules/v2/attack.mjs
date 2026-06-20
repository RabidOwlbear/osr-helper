import { OSRHApp } from './base/osr-app.mjs';
export class OSRHAttackV2 extends OSRHApp {
  constructor(options) {
    super();
    this.actor = options.actor;
  }

  static DEFAULT_OPTIONS = {
    id: 'osrh-app',
    position: {
      width: 400,
      height: 176
    },
    classes: ['osrh', 'light-item-config', 'attack', 'v2'],
    tag: 'osrh-app', // The default is "div"
    // tabs: [{ navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'main' }],
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: 'Attack' //localization string
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.drop' }],
    actions: {}
  };
  static PARTS = {
    main: {
      template: 'modules/osr-helper/templates/attack-form.hbs'
    }
  };
  async _prepareContext(options) {
    let context = await super._prepareContext(options);
    context = foundry.utils.mergeObject(context, {});
    context.atkOptions = this._getAttackOptions(this.actor);
    return context;
  }
  _onRender(context, options) {
    this.dragDrop.forEach((d) => d.bind(this.element));
    this._forceTabInit(context.tabs);
    const html = this.element;
    const closeBtn = html.querySelector('#close-btn');
    const attackBtn = html.querySelector('#attack-btn');
    closeBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.close();
    });
    attackBtn.addEventListener('click', async (ev) => {
      ev.preventDefault();
      await this._attack(html);
      this.close();
    });
  }

  _getAttackOptions(selectedActor) {
    let actorWeapons = selectedActor?.items.filter((item) => item.type.toLowerCase() == 'weapon');
    let actorSpells = selectedActor?.items.filter((item) => {
      if (item.type.toLowerCase() == 'spell') return true;
    });
    if (actorWeapons.length == 0 && actorSpells.length == 0) {
      ui.notifications.error(game.i18n.localize('OSRH.util.notification.noWeapon'));
      return;
    }
    let atkOptions = '';
    for (let item of actorWeapons) {
      const formula = OSRH.util.getNestedValue(item, OSRH.systemData.paths.weaponDamage);
      atkOptions += `<option value=${item.id}>${item.name} | ATK: ${formula}</option>`;
    }
    for (let item of actorSpells) {
      if (item.system?.roll != '') {
        atkOptions += `<option value=${item.id}>${item.name} | ATK: ${item.system.roll}</option>`;
      }
    }
    return atkOptions;
  }
  async _attack(html) {
    let selected = html.querySelector('#weapon');
    let skipCheck = html.querySelector('#skip')?.checked;
    let ammoCheck = html.querySelector(`#ammoCheck`)?.checked;
    let weapon = this.actor.items.find((i) => i.id == selected.value);
    let ammoData = ammoCheck ? await weapon.getFlag('osr-helper', 'ammunition') : null;

    if (ammoCheck && ammoData?.trackAmmo) {
      let ammo = this.actor.items.find((i) => i.name == ammoData.items[0]);
      if (!ammo) {
        ui.notifications.warn(game.i18n.localize('OSRH.util.notification.noAmmo'));
        return;
      }
      let ammoQty = OSRH.util.getNestedValue(ammo, OSRH.systemData.paths.itemQty); //ammo?.system.quantity.value;
      if (ammoQty > 0) {
        switch (OSRH.systemData.id) {
          case 'dcc':
            await weapon.parent.rollWeaponAttack(weapon.id, { showModifierDialog: skipCheck ? false : true });
            break;
          case 'basicfantasyrpg':
            await bfrpgroll(weapon, this.actor, weapon.system.range.value);
            break;
          case 'dolmenwood':
          const attackType = weapon.system.qualities?.includes('missile') ? 'missile' : 'melee';
          await game.dolmenwood.executeMacroAttack({
            flags: {
              dolmenwood: {
                attackConfig: {
                  weaponName: weapon.name,
                  weaponId: weapon.id,
                  actorId: this.actor.id,
                  attackType,
                  attackMode: 'normal',
                  modifierIds: [],
                  numericMod: 0,
                  rollType: null
                }
              }
            }
          });
          break;
          default:
            await weapon.roll({ skipDialog: skipCheck });
        }

        //delete ammo object if quantity is 0 or less
        if (ammoQty - 1 == 0) {
          ammo.delete();
        } else {
          await ammo.update({ [OSRH.systemData.paths.itemQty]: ammoQty - 1 });
        }
      } else {
        ui.notifications.warn(game.i18n.localize('OSRH.util.notification.noAmmo'));
      }
    } else {
      switch (OSRH.systemData.id) {
        case 'dcc':
          await weapon.parent.rollWeaponAttack(weapon.id, { showModifierDialog: skipCheck ? false : true });
          break;
        case 'wwn':
          await weapon.rollWeapon({ skipDialog: skipCheck });
          break;
        case 'basicfantasyrpg':
          await bfrpgroll(weapon, this.actor, weapon.system.range.value);
          break;
        case 'dolmenwood':
          const attackType = weapon.system.qualities?.includes('missile') ? 'missile' : 'melee';
          await game.dolmenwood.executeMacroAttack({
            flags: {
              dolmenwood: {
                attackConfig: {
                  weaponName: weapon.name,
                  weaponId: weapon.id,
                  actorId: this.actor.id,
                  attackType,
                  attackMode: 'normal',
                  modifierIds: [],
                  numericMod: 0,
                  rollType: null
                }
              }
            }
          });
          break;
        default:
          await weapon.roll({ skipDialog: skipCheck });
      }
    }
  }
}

const bfrpgroll = (item, actor, type) => {
  // Handle weapon rolls.
  let label = `<span class="chat-item-name">${game.i18n.localize('BASICFANTASYRPG.Roll')}: ${type} attack with ${item.name}</span>`;
  let rollFormula = 'd20+@ab';
  if (type === 'melee') {
    rollFormula += '+@str.bonus';
  } else if (type === 'ranged') {
    rollFormula += '+@dex.bonus';
  }
  rollFormula += '+' + item.system.bonusAb.value;
  let roll = new Roll(rollFormula, actor.getRollData());
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({
      actor: actor
    }),
    flavor: label,
    rollMode: game.settings.get('core', 'rollMode')
  });
  return roll;
};
