# OSE-helper module

created by Grim.

An unimaginatively named module that aims to assist with light, time, and resource management. For use in games using the Old School Essentials system for FoundryVTT.
This module provides several macros found in a compendium named "OSE-helper Macros".

### installation

install using the following manifest url:

https://raw.githubusercontent.com/RabidOwlbear/OSE-helper/master/module.json

### usage

Upon initial load a journal entry will be created using the default name of "Turn Count". This journal will be populated with several statistics reflecting number of turns elapsed this session, since that last rest was taken, and the total number of turns so far in the game. Using the provided "OSE-helper Dungeon Turn (base)" macro the Referee can advance the game time in standard 10 minute turn intervals. The "Turn Count" journal will be updated to reflect the current counts.

The provided "OSE-helper reset session count" will reset the session count to zero.
The provided "OSE-helper reset all counts" macro will reset all counts.
The provided "OSE-helper Rest" macro will reset the turns since last rest count to zero.

---

### Using the OSE-helper Dungeon Turn Macro

To set the options for the dungeon turn macro navigate to the OSE helper settings in module settings.
Clicking the dungeon tirn settings button will open a settings window with the following options:

- Encounter Table Name: Enter the name of the encounter table you wish to roll on here, case sensitive.
- Reaction Table Name: Enter the name of the reaction table you wish to roll on here, case sensitive.
- How often to roll for encounter: How often to roll for encounter. Example: if set to 2 a an encounter check would be rolled every 2nd turn.
- Target to roll below to trigger table roll: Target number to roll under to trigger a table roll.
- Roll For Encounters: If checked encounter rolls will be made using the defined options.
- Roll for Reaction: If checked, when an encounter table is rolled, a roll will be made on the provided reaction table.

When used, the Dungeon Turn macro will advance the game time by 10 minutes and update the turn counts by one. It will then check the rest count,. At 3 turns since last rest a chat message will be created warning the players that they need to rest, at +5 turns the worning becomes red. If the players progress beyond 1 hour without rest, the chat message will then include the relevant penalties, repeating this added text every 5 subsequent turns.

The macro will also check to see if random encounter rolls are active, if so itt will check to see if the number of turns since the last roll is greater than the proc interval (see above), if it is, the macro will roll on the provided table, and if set, roll for reaction on the provided table.

---

### Player Lights

To activate a light, a player needs access to the "OSE-helper Light On " macro. To use a player token must be selected. When clicked the macro will check for the existence of the corresponding light type item on the characters sheet, if it exists, and has and uses left it will light that light item updating the selected token light settings.
note: Several light items have been provided in the OSE-helper Items compendium.
If the macro has been used to light a light source, the light can be extinguished by clicking the macro again, preserving any remaning duration until lit again by clicking the Light On macro and selecting the corresponding light type.

If a player has a light source that is currently lit, each time the game time updates the elapsed time is subtracted from that lights duration.
if the light duration is 0 the light is extinguished and the item count for that light type is reduced by one. If the light type has no more uses it is deleted, in the case of lanterns, only the oil item is deleted.

---

### Ration Report

The OSE-helper Ration Report macro

When clicked this macro will generate a report detailing all rations currently held by all tracked Player and Retainer actors seprated by name, listing items held and their quantities, color coded.
Total number of days worth of rations for the entire tracked group(assuming the party pools resources) is also profided in a color coded display.

---

### Custom Effect Reminders

A 'custom effect' system has been implementd and can be accessed via a collection of icons located on the character portrait secton of the character sheet when moused over.

- Show Active Effects pops up a widow detailing all active custom effects.
- Add Custom Effect pops up a form for creating a new custom effect. Once created a chat message detailing the custom effect will be whispered to the player and they effects target(if selected).
- Remove Custom Effect pops up a dialog with a drop down selector for deleting an effect early.

When a custom effect expires, a chat message is whispered to the player and the target(if selected) notifying that an effect has expired.

---

## Travel Calculator

This macro opens a window displaying the active party members and their individual travel rates, and a base rate determined by the slowest party member.
Selecting a terrain type will update the displayed travel rates.
The Navigation Check button will roll a d6 and apply the terrain modifier and any bonus from the bonus field and output the results to a chat message.
The Forage check will roll a d6 plus any modifier in the bonus field and output the results to a chat message.

## Character vs Monster reaction roll.

This macro opnes a dialog listing all characters in the party sheet, and their charisma modifier. Selecting an actor and clicking the roll button will roll for reaction adding the characters charisma modifier to the roll. Useful for social encounters.
