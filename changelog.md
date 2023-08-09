# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.25]
### changes
- Fixed issue preventing light item config menu from opening.
- Fixed an issue preventing macros in the macro bar from being deleted.

## [0.4.24]
### changes
- fixed error with light alpha input displaying an incorrect value if the value is set to 0.
- renamed the "alpha" input on the light item config menu to "Color Itensity" to better indicate setting the input is for.

## [0.4.22] 2023-6-22
### changes
- module now creates folder to organize included compendiums on intial world load.
- added setting for compendium folder name.
- added setting to control whether included compendium packs are grouped into a folder. Defaults to true.
- added support for the Hyperborea game system for fvtt.

### fixes
- fixed some irregularities with the hide foreign language packs feature. Hidden packs should now remain hidden after the compendium tab is refreshed.

## [0.4.19] 2023-6-22
### fixes
- Fixed template errors resulting in broken localization on the new active effect form.

## [0.4.15] 2023-6-19
### fixes
- Fixed error with currency converter
- Fixed bug preventing light item quantities from being decremented correctly when the light expired.
### added
- finalized Spanish localization. Ammunition tracking should now work with localized items from item shop. Thanks again patron Malecho for providing translations.

## [0.4.15] 2023-6-6
### added
- improved Spanish language localization courtesy of patron Malecho. Thank you very much for the assistance.

## [0.3.8] 2022-4-12
### added
- Infinite light item duration. To set a light item's duration to infinite set the durtation value to 'inf'.

## [0.3.8] 2022-4-12
### added
- Custom Effect Preset management.
- world Custom Effect Preset import/export 

### changed
- updated the custom effects preset data model. This change requires the one time use of the provided "Update Saved Effects" macro to update existing saved custom effects.


## [0.3.7] 2022-4-9
### added
- added support for equipable container items in character actor inventories.

### changed
- updated compatible version to reflect latest foundry version.

## [0.3.6] 2022-4-7
### added

- Aded changelog.
- Added custom effect presets.
- Added color themes for active effects forms

### changed
- Changed center hotbar to work better with other modules that change visual appearance.
- Updated Readme.md with updated documentation.
- Udated module version compatability in module.json.
