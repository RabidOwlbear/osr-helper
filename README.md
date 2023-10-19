# OSR-helper module

Created by RabidOwlbear.

Supprted via patreon: https://patreon.com/RabidOwlbear

An unimaginatively named module that aims to assist with light, time, and resource management. For use in games using the Foundry Vtt implementation of the 'Old School Essentials' system.
This module provides several macros found in a compendium named "OSR-helper Macros".

### Important Notice

If updating from the previous version named "OSE-helper", any macros existing in your game worlds from the previous version will no longer function. Please replace them with the included updated versions. We apologize for any inconvenience this causes.

If you have created custom light items in your world you will need to run the provided conversion macro named "Convert Light Data" located in the included macro compendium "Utility Macros" folder. This wil convert your existing light configurations, existing lights  will not function without conversion. this only needs to be run once.

You will also need to disable and/or uninstall the previous "OSE-CharacterBuilder" installation to avoid conflicts.

---

### installation

install using the following manifest url:

https://raw.githubusercontent.com/RabidOwlbear/osr-helper/master/module.json

### usage

Upon initial load a journal entry will be created using the default name of "Turn Count". This journal will be populated with several statistics reflecting number of turns elapsed this session, since that last rest was taken, and the total number of turns so far in the game. Using the provided "OSE-helper Dungeon Turn (base)" macro the Referee can advance the game time in standard 10 minute turn intervals. The "Turn Count" journal will be updated to reflect the current counts.

The provided "OSR-helper reset session count" will reset the session count to zero.
The provided "OSR-helper reset all counts" macro will reset all counts.
The provided "OSR-helper Rest" macro will reset the turns since last rest count to zero.

---

### Turn Tracker
![turn tracker image](./images/doc/turn-tracker-doc-01.webp)

On the main tab of the tracker the current dungeon turn counts  and dungeon level is desplayed. 
The dungeon level may be increased by pressing one of the arrow buttons on either side. 
The party may rest my using the rest button located in the bottom left corner of the application. 
The dungeon turn may be advanced by clicking the button in the bottom right corner.
The session turn count may be reset using the button in the upper left corner of the application.
The total turn count may be reset by clicking the button in the top right corner. This will open a dialog warning that this change cannot be undone. Click the reset button to reset or close to return to the tracker.

On the config tab (only visible to GM users) The GM may alter the dungeon turn settings. This replaces the dungeon turn settings in the game options. 
- Checking the roll encounters box will roll for encounters based on the frequency determined in the field below.
- The frequency (in turns) determines how often an encounter roll will be performed.
- Checking the Roll for reaction checkbox will roll on the determined reaction table whenever an encounter roll is rolled.
- The roll target input determines the success chance for an encounter roll. The encounter roll is a 1d6 roll under roll.
- The reaction table inout is used to select a table for reaction rolls. The select will list the name of all tables in the game world.
- The Lvl inputs are used to set the encounter table per dungeon level. When an encounter is rolled it will use the current dungeon level to find the correct encounter table. If the dungeon level is 9 or greater the level 8 encounter table will be used.


When the advance dungeon turn button is used, the Turn Tracker will advance the game time by 10 minutes and update the turn counts by one. It will then check the rest count. At 3 turns since last rest a chat message will be created warning the players that they need to rest, at +5 turns the warning becomes red. If the players progress beyond 1 hour without rest, the chat message will then include the relevant penalties, repeating this added text every 5 subsequent turns.

The Tracker will roll any encounter and reaction tables as defined in the config tab.

---

### Custom Lights

##### OSE and Hyperborea systems:
Custom light sources can be created by checking the **Enable Light Item Settings Config.** setting in the ose helper module settings. This setting will add a wrench icon to item display for any item with a "Light" tag applied to it in the characters inventory. (The tag needs to be capitalized in order to function correctly.) Note: this feature will be phased out in future versions, and is not available in all systems.

The wrench icon (number 1. in image below) will also be added to the header of the item details window, allowing for lights to be configured from the item sidebar tab, or inside compendiums. 

![light configuration panel image](./images/doc/lights-doc-01.webp)

1. Configuration icon: Click this to open the light item configuration panel.
2. Light Configuration Panel: Here you can define the custom light properties and duration.
3. Close: Closes the configuration panel without saving.
4. Update: Updates the light configuration data.

![light configuration panel image](./images/doc/lights-doc-03.webp)

Light durations should be a positive number, or "inf" for infinite light duration. (see above)

To activate a light, a player needs access to the provided "Light Toggle " macro. 

To use, a player token must be selected.

When clicked:
- if a light is already lit on the selected token, the light will be extinguished.
- if no light is currently lit, a dialog will be created containing a dropdown populated with the names and quantities of all items in the selected token actors inventory that contain a "Light" tag.
- once a light source is selected, clicking "Light On" with change the selected token's light settings to match tose contained in the selected light source's configuration settings.

note: Several light items have been provided in the OSR-helper Items compendium.
If the macro has been used to light a light source, the light can be extinguished by clicking the macro again, preserving any remaning duration until lit again by clicking the Light On macro and selecting the corresponding light type.

##### Other Systems:

In systems other than those listed above light items may be configured using the item config button added to the title bar of relevant items. This menu may be used to set the item type, and open the light configuration panel described above.

![light configuration panel image](./images/doc/item-config.webp)

1. Item Config Button: Click this item to open the OSRH item Config window.
2. Item type Select: Select the Item type here. May be set to Light, Ration and None. This setting eables light or ration tracking ofr this item.
3. Light Item Configuration: This button only appears when light is selected as the item type. Clicking it will open the light item configuration for this item.

Each time game world time advances, all lit light sources will be checked against their duration, if the duration is exceeded the tight source will be extinguished, and the total quantity for that item will be decremented by 1. If the item quantity is reduced to zero the item will be deleted from the actor's invetory.

---

### Ration Report

The OSR-helper Ration Report macro

When clicked this macro will generate a report detailing all rations currently held by all tracked Player and Retainer actors seprated by name, listing items held and their quantities, color coded.
Total number of days worth of rations for the entire tracked group(assuming the party pools resources) is also profided in a color coded display.

---

### Custom Effects

A 'custom effect' system has been implementd and can be accessed via an  icon located on the character portrait secton of the character sheet when moused over (number 1 in the image below).

At this time Active Effects are only enable in the OSE game system. This will be addressed in a future update.

#### Active Effects List

![light configuration panel image](./images/doc/effects-doc-02.webp)


1. Active Effects List Icon: Click here to open the Active Effects List panel. This icon will only appear on 'character' type actor sheets.
2. Active Effect List: all current active effects related to this actor will be displayed here.
3. Actor Created Effects: Active Effects created by this actor are displayed here. Each effect will display its name, taget, duration, and a button to delete the effect. Clicking the name of the effect will expand the entry revealing the applied effects and the effect description(if any).
4. Other Created Effects: Active effects created by other actors are displayed here. Each effect will display its name, actor created by, and duration. Each entry can be expanded as above.
5. Close: Closes the panel.
6. New: Opens a New Active Effect panel.

#### New Active Effect

7. Presets: This list will be populated by presets created by the GM. To use a preset simply select one from the list. Its information will then be populated to the fields of the effect form. Click create to apply the effect. Presets can be created by th GM by filling out the active effect form and clicking the save button at the bottom of the form.
8. Icon: an icon for the effect can be selected from thsi dropdown, the name of the icon and its color are displayed.
9. Name (required): Active effect name.
10. Description: active effect description.
11. Target: Selecting 'self' will apply the created active effect to the actor the active effect list was opened from. Selecting target will apply the created active effect to the actor associated with the current targeted single token.
12. Attributes: Changes to abilitiy scores are applied here. The fields accept positive and negative  number values.
13. Saves: Changes to saves are applied here. The fields accept positive and negative number values.
14. Combat Bonus: changes to thac0/attack bonus, melee, and ranged attacks are applied here. This input will assumes a positve number is a bonus, and a negative value is a penalty and will multply the value entered by -1 automatically as required by the selected game system thac0 setting.
15. Armor Bonus: changes to ac/aac are applied here. This input will assumes a positve number is a bonus, and a negative value is a penalty and will multply the value entered by -1 automatically as required by the selected game system armor class setting.
16. Hp: changes to hp current and max values are applied here.
17. Duration (required): The duration of the effect is entered here. The duration will be set as the selected duration type, minutes or seconds.
18. Reset: Clicking here will reset all number inputs to 0 and clear all text fields.
19. Save: this button will only appear for the GM. This button will save the current effect data as a named preset in the presets dropdown, allowing for quick reuse. At this time anyone creating an active effect will be able to apply a defined preset.
20. Create: Clicking here will create a new active effect with the inputted effects on the selected target (number 9. image above).
21. Active Effect Icons: Upon active effect creation an icon will be applied to the targeted actors token. This icon will be removed when the active effect expires.

Effects may also be created uing the provided 'render new active effect form' macro while selecting or targeting a single token.

Effects created by/placed on monster actors my be viewed by using the provided "Render Active Effect List" while selecting an actor token.

Each time the game world time updates all active effect's duration will be checked, and any expired effects will be removed.

---

#### Managing Effect presets

![light configuration panel image](./images/doc/effects-doc-03.webp)

1. Manage Custom Effects: this button will only be visible for the GM. When clickedf it will open the preset management window (see picture above, left).
The Preset Management panel will display all currently saved active effect presets. Presetc can be deleted using the red x buttons (see 3. below). Clicking on the name of a custom effect will expand its entry to show more details about the effect.
2. Import/Export Custom Preset Lists: Clcking the export Custom Presets button will open a file save dialog allowing the GM to save their custom presets for backup or import into another game world. The Import Custom Preset button will open a file open dialog where a GM can select a previously save custom presets JSON file for import. When a valid file is selected the GM will be prompted to Merge or Replace the existinng presets. Selecting merge will add any custom effects not currently existing into the game world's saved custom presets, selecting Replace will replace all curent saved presets with the presets contained in the file imported.
3. Delete Preset: Clicking this button will delete the custom effect preset.
4. Save custom preset button, only visible for GM user. Saves defined preset to the custom effects list.

---

#### Effect Form Themes

Color themes have been added for the active effect forms. The theme can be changed in the module settings.

---

## Travel Calculator

This macro opens a window displaying the active party members and their individual travel rates, and a base rate determined by the slowest party member.
Selecting a terrain type will update the displayed travel rates.
The Navigation Check button will roll a d6 and apply the terrain modifier and any bonus from the bonus field and output the results to a chat message.
The Forage check will roll a d6 plus any modifier in the bonus field and output the results to a chat message.

## Character vs Monster reaction roll.

This macro opens a dialog listing all characters in the party sheet, and their charisma modifier. Selecting an actor and clicking the roll button will roll for reaction adding the characters charisma modifier to the roll. Useful for social encounters.
To use, edit the macro variable tableName with the name of the monster reaction roll table you wish to use.

## Random Name

This macro opens a dialog containing name type options. After selecting both options, and clicking the pick button, a random name will be generated and sent to chat via message.
If a single token is selected when the macro is run, the random name will be applied to the token and associated actor sheet.
If whisper is checked, the created chat message will be whispered to the user that initiated the macro.

## Currency Converter

The module adds a currency converter icon(stack of coins) to the character sheet inventory tab treasure header. CLicing the icon will open a diallog that will allow for converting once currency type to another. 
to use:
- click the Currenc Converter icon
- enter an amount into the amount field
- select initial currency from the dropdown to the right of the amount
- select a currency to convert to from the rightmost dropdown
- click convert
If the actor does not posses a currency item for the type of currency being converted to or from, one will be created in the actors inventory.

## Equipable containers

To enable this feature, check the box  on the corresponding module setting. This will add a button to container items in character inventories that when clicked will equip or unequp the container. when unequipped all items contained in the container will have their weight properties set to zero. When the container is re-equipped the contained items will have their weight restored to the original value. This feature is experimental.
