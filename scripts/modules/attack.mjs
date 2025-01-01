
export class OSRHAttack extends FormApplication {
  
  constructor(actor) {
    super();
    this.actor = actor;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'Attack',
      classes: ['osrh', 'light-item-config'],
      top: 120,
      left: 60,
      width: 400,
      height: 166,
      template: `modules/osr-helper/templates/attack-form.hbs`
    });
  }
  getData() {
    let context = super.getData();
    context.atkOptions = this._getAttackOptions(this.actor);
    return context;
  }
  activateListeners(html) {
    const closeBtn = html.find('#close-btn')[0];
    const attackBtn = html.find('#attack-btn')[0];
    closeBtn.addEventListener('click', ev=>{
      ev.preventDefault()
      this.close()
    })
    attackBtn.addEventListener('click', async ev=>{
      ev.preventDefault();
      await this._attack(html);
      this.close();
    })
  }

  _getAttackOptions(selectedActor){
    let actorWeapons = selectedActor?.items.filter((item) => item.type == 'weapon');
    let actorSpells = selectedActor?.items.filter((item) => {
      if (item.type == 'spell') return true;
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
    return atkOptions
  }
  async _attack(html) {
    let selected = html.find('#weapon')[0];
            let skipCheck = html.find('#skip')[0]?.checked;
            let ammoCheck = html.find(`#ammoCheck`)[0]?.checked;
            let weapon = this.actor.items.find((i) => i.id == selected.value);
            let ammoData = ammoCheck ? await weapon.getFlag('osr-helper', 'ammunition'): null;
            
            if (ammoCheck && ammoData?.trackAmmo) {
              let ammo = this.actor.items.find((i) => i.name == ammoData.items[0]);
              if(!ammo){
                ui.notifications.warn(game.i18n.localize('OSRH.util.notification.noAmmo'));
                return
              }
              let ammoQty = OSRH.util.getNestedValue(ammo, OSRH.systemData.paths.itemQty)//ammo?.system.quantity.value;
              if (ammoQty > 0) {
                switch(OSRH.systemData.id){
                  case 'dcc':
                    await weapon.parent.rollWeaponAttack(weapon.id, {showModifierDialog: skipCheck ? false: true})
                    break;
                  case 'basicfantasyrpg':
                    await bfrpgroll(weapon, this.actor, weapon.system.range.value)
                    break;
                  default:
                    await weapon.roll({ skipDialog: skipCheck });
                }
                
                //delete ammo object if quantity is 0 or less
                if (ammoQty - 1 == 0) {
                  ammo.delete();
                } else {
                  await ammo.update({[OSRH.systemData.paths.itemQty] : ammoQty - 1});
                }
              } else {
                ui.notifications.warn(game.i18n.localize('OSRH.util.notification.noAmmo'));
              }
            }
             else {
              switch(OSRH.systemData.id){
                case 'dcc':
                  await weapon.parent.rollWeaponAttack(weapon.id, {showModifierDialog: skipCheck ? false: true})
                  break;
                case 'wwn':
                  await weapon.rollWeapon({ skipDialog: skipCheck })
                  break;
                case 'basicfantasyrpg':
                  await bfrpgroll(weapon, this.actor, weapon.system.range.value)
                  break;
                default:
                  await weapon.roll({ skipDialog: skipCheck });
              }
            }
  }
}

const bfrpgroll = (item, actor, type)=>{
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
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;

}
