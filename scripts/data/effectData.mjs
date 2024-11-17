export const registerEffectData = () => {
  OSRH.data.effectData = {
    ose: [
      {
        label: game.i18n.localize('OSRH.effect.hp'),
        contents: [
          // {
          //   label: game.i18n.localize('OSRH.effect.hitDie'),
          //   path: 'system.hp.hd'
          // },
          {
            label: game.i18n.localize('OSRH.effect.hpVal'),
            path: 'system.hp.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.hpMax'),
            path: 'system.hp.max'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.ac'),
        contents: [
          // {
          //   label: game.i18n.localize('OSRH.effect.acVal'),
          //   path: 'system.ac.value'
          // },
          {
            label: game.i18n.localize('OSRH.effect.acMod'),
            path: 'system.ac.mod'
          },
          // {
          //   label: game.i18n.localize('OSRH.effect.aacVal'),
          //   path: 'system.aac.value'
          // },
          {
            label: game.i18n.localize('OSRH.effect.aacMod'),
            path: 'system.aac.mod'
          }
        ]
      },

      {
        label: game.i18n.localize('OSRH.effect.attackBonus'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.rangedMod'),
            path: 'system.thac0.mod.missile'
          },
          {
            label: game.i18n.localize('OSRH.effect.meleeMod'),
            path: 'system.thac0.mod.melee'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.saves'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.save.death'),
            path: 'system.saves.death.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.wand'),
            path: 'system.saves.wand.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.paralysis'),
            path: 'system.saves.paralysis.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.breath'),
            path: 'system.saves.breath.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.spell'),
            path: 'system.saves.spell.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.initMod'),
            path: 'system.initiative.mod'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.abilScore'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.strVal'),
            path: 'system.scores.str.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.intVal'),
            path: 'system.scores.int.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.wisVal'),
            path: 'system.scores.wis.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.dexVal'),
            path: 'system.scores.dex.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.conVal'),
            path: 'system.scores.con.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.chaVal'),
            path: 'system.scores.cha.value'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.encumbrance'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.encumbranceMax'),
            path: 'system.encumbrance.max'
          }
        ]
      }
    ],
    wwn: [
      {
        label: game.i18n.localize('OSRH.effect.hp'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.hpVal'),
            path: 'system.hp.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.hpMax'),
            path: 'system.hp.max'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.ac'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.acMod'),
            path: 'system.ac.mod'
          },
          {
            label: game.i18n.localize('OSRH.effect.aacMod'),
            path: 'system.aac.mod'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.attackBonus'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.rangedMod'),
            path: 'system.thac0.mod.missile'
          },
          {
            label: game.i18n.localize('OSRH.effect.meleeMod'),
            path: 'system.thac0.mod.melee'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.saves'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.evasionMod'),
            path: 'system.saves.evasion.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.mentalMod'),
            path: 'system.saves.mental.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.physicalMod'),
            path: 'system.saves.physical.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.luckMod'),
            path: 'system.saves.luck.value'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.abilScore'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.strVal'),
            path: 'system.scores.str.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.intVal'),
            path: 'system.scores.int.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.wisVal'),
            path: 'system.scores.wis.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.dexVal'),
            path: 'system.scores.dex.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.conVal'),
            path: 'system.scores.con.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.chaVal'),
            path: 'system.scores.cha.value'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.strain'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.strainValue'),
            path: 'system.details.strain.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.strainMax'),
            path: 'system.details.strain.max'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.movement'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.moveBase'),
            path: 'system.movement.base'
          },
          {
            label: game.i18n.localize('OSRH.effect.moveBonus'),
            path: 'system.movement.bonus'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.newEffectForm.initiative'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.initMod'),
            path: 'system."initiative.mod"'
          }
        ]
      }
    ],
    dcc: [
      {
        label: game.i18n.localize('OSRH.effect.abilScore'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.strMod'),
            path: 'system.abilities.str.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.aglMod'),
            path: 'system.abilities.agl.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.staMod'),
            path: 'system.abilities.sta.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.perMod'),
            path: 'system.abilities.per.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.intMod'),
            path: 'system.abilities.int.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.lckMod'),
            path: 'system.abilities.lck.value'
          }
        ]
      },
      {
        label: game.i18n.localize("OSRH.newEffectForm.attributes"),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.acMod'),
            path: 'system.attributes.ac.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.actionDice'),
            path: 'attributes.actionDice.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.hp'),
            path: 'attributes.hp.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.init'),
            path: 'attributes.init.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.speed'),
            path: 'attributes.speed.value'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.abilScore'),
        contents: [
          {
            label: game.i18n.localize("OSRH.effect.frtMod"),
            path: 'saves.frt.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.refMod"),
            path: 'saves.ref.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.wilMod"),
            path: 'saves.wil.value'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.abilScore'),
        contents: [
          {
            label: game.i18n.localize("OSRH.effect.findDoors"),
            path: 'skills.findSecretDoors.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.divineAid"),
            path: 'skills.divineAid.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.turnUnholy"),
            path: 'skills.turnUnholy.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.layHands"),
            path: 'skills.layOnHands.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.sneakSilent"),
            path: 'skills.sneakSilently.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.hideShadows"),
            path: 'skills.hideInShadows.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.pickPocket"),
            path: 'skills.pickPockets.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.climbSurface"),
            path: 'skills.climbSheerSurfaces.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.pickLock"),
            path: 'skills.pickLock.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.findTrap"),
            path: 'skills.findTrap.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.disableTrap"),
            path: 'skills.disableTrap.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.forgeDocument"),
            path: 'skills.forgeDocument.value'
          },
          {
            label: game.i18n.localize("OSRH.effectdisguiseSelf"),
            path: 'skills.disguiseSelf.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.readLanguage"),
            path: 'skills.readLanguages.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.handlePoison"),
            path: 'skills.handlePoison.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.castFromScroll"),
            path: 'skills.castSpellFromScroll.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.sneakHide"),
            path: 'skills.sneakAndHide.value'
          },
          {
            label: game.i18n.localize("OSRH.effect.shieldBash"),
            path: 'skills.shieldBash.value'
          }
        ]
      }
    ],
    hyperborea: [
      {
        label: game.i18n.localize('OSRH.effect.hp'),
        contents: [
         
          {
            label: game.i18n.localize('OSRH.effect.hpVal'),
            path: 'system.hp.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.hpMax'),
            path: 'system.hp.max'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.ac'),
        contents: [
         
          {
            label: game.i18n.localize('OSRH.effect.acMod'),
            path: 'system.ac.mod'
          },
          
          {
            label: game.i18n.localize('OSRH.effect.aacMod'),
            path: 'system.aac.mod'
          }
        ]
      },

      {
        label: game.i18n.localize('OSRH.effect.attackBonus'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.rangedMod'),
            path: 'system.thac0.mod.missile'
          },
          {
            label: game.i18n.localize('OSRH.effect.meleeMod'),
            path: 'system.thac0.mod.melee'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.saves'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.save.death'),
            path: 'system.saves.death.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.wand'),
            path: 'system.saves.wand.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.paralysis'),
            path: 'system.saves.paralysis.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.breath'),
            path: 'system.saves.breath.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.spell'),
            path: 'system.saves.spell.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.initMod'),
            path: 'system.initiative.mod'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.abilScore'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.strVal'),
            path: 'system.scores.str.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.intVal'),
            path: 'system.scores.int.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.wisVal'),
            path: 'system.scores.wis.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.dexVal'),
            path: 'system.scores.dex.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.conVal'),
            path: 'system.scores.con.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.chaVal'),
            path: 'system.scores.cha.value'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.encumbrance'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.encumbranceMax'),
            path: 'system.encumbrance.max'
          }
        ]
      }
    ],
    basicfantasyrpg: [
      {
        label: game.i18n.localize('OSRH.effect.hp'),
        contents: [
         
          {
            label: game.i18n.localize('OSRH.effect.hpVal'),
            path: 'system.hitPoints.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.hpMax'),
            path: 'system.hitPoints.max'
          }
        ]
      },

      {
        label: game.i18n.localize('OSRH.effect.attackBonus'),
        contents: [
          {
            label: game.i18n.localize('BASICFANTASYRPG.AttackBonus'),
            path: 'system.attackBonus.value'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.saves'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.save.death'),
            path: 'system.saves.death.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.wand'),
            path: 'system.saves.wand.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.paralysis'),
            path: 'system.saves.paralysis.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.breath'),
            path: 'system.saves.breath.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.save.spell'),
            path: 'system.saves.spell.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.initMod'),
            path: 'system.initBonus.value'
          }
        ]
      },
      {
        label: game.i18n.localize('OSRH.effect.abilScore'),
        contents: [
          {
            label: game.i18n.localize('OSRH.effect.strVal'),
            path: 'system.abilities.str.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.intVal'),
            path: 'system.abilities.int.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.wisVal'),
            path: 'system.abilities.wis.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.dexVal'),
            path: 'system.abilities.dex.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.conVal'),
            path: 'system.abilities.con.value'
          },
          {
            label: game.i18n.localize('OSRH.effect.chaVal'),
            path: 'system.abilities.cha.value'
          }
        ]
      }
    ],
  };
};
