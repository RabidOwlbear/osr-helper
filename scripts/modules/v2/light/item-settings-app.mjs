import { OSRHApp } from "../base/osr-app.mjs";

export class ItemSettingsFormV2 extends OSRHApp {
  constructor(options) {
    super(options);
    // super(item, { id: `light-item-config.${item.id}`, title: `OSRH Light Item Config - ${item.name}` });
    this.item = options.item;
    this.lightFlag = this.item.getFlag(`osr-helper`, 'lightItemData');
  }

  static DEFAULT_OPTIONS = {
    id: 'osrh-app',
    position: {
      width: 300,
      height: 580
    },
    classes: ['form', `light-item-config`, 'themed'],
    tag: 'osrh-app', // The default is "div"
    // tabs: [{ navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'main' }],
    window: {
      icon: 'fas fa-gear', // You can now add an icon to the header
      title: '' //localization string
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.drop' }],
    actions: {}
  };
  static PARTS = {
    main: {
      template: `modules/osr-helper/templates/light-item-config-form.hbs`
    }
  };
  async _prepareContext(options) {
    let flag = this.item.getFlag(`${OSRH.moduleName}`, 'lightItemData')
    let context = await super._prepareContext(options);
    context = foundry.utils.mergeObject(context, {
      name: this.item.name ? this.item.name : ItemName,
      dim: flag?.dim ? flag.dim : 30,
      bright: flag?.bright ? flag.bright : 10,
      color: flag?.color ? flag.color : '#ff7b24',
      dur: flag?.duration ? flag.duration : 60,
      alpha: flag?.alpha ? flag.alpha : flag?.alpha === 0 ? 0 :0.5,
      alert: flag?.alert ? flag.alert : 1,
      angle: flag?.angle ? flag.angle : 360,
      warn: flag?.warn ? flag.warn : 3,
      animation: flag?.animation ? flag.animation : 'flame',
      speed: flag?.speed ? flag.speed : 3,
      intensity: flag?.intensity ? flag.intensity : 5,
      coloration: flag?.coloration ? flag.coloration : '1',
      luminosity: flag?.luminosity ? flag.luminosity : 0.4,
      bgSat: flag?.bgSat ? flag.bgSat : 0,
      bgCont: flag?.bgCont ? flag.bgCont : 0,
      bgShadow: flag?.bgShadow ? flag.bgShadow : 0
    });

    return context;
  }
  _onRender(context, options) {
    this._forceTabInit(context.tabs);
    const html = this.element;
    const updateBtn = html.querySelector('#update-btn');
    const closeBtn = html.querySelector('#close-btn');
    let inputsA = [...html.querySelectorAll('.light-config-input.type-a')];
    let inputsB = [...html.querySelectorAll('.light-config-input.type-b')];
    let animation = [...html.querySelectorAll('#animation')];
    let anim = html.querySelector(`option.animation[value="${this?.lightFlag?.animation}"]`);
    let coloration = html.querySelector(`option.coloration[value="${this?.lightFlag?.coloration}"]`);
    if(anim)anim.selected = true;
    if(coloration)coloration.selected = true;

    closeBtn.addEventListener('click', (ev) => {
        this.close();
      });
      // update button
      updateBtn.addEventListener('click', async (ev) => {
        let inputs = html.find('.light-config-input');
        let formData = {};
        for (let i of inputs) {
          if (i.id === 'duration' && i.value === 'inf') {
            formData[i.id] = i.value;
            continue;
          }
          let value =
            i.type == 'color'
              ? i.value
              : i.id == 'alpha'
              ? parseFloat(i.value)
              : i.id == 'luminosity'
              ? parseFloat(i.value)
              : i.id == 'animation'
              ? i.value
              : parseInt(i.value);
          formData[i.id] = value;
          if(i.id == 'animation' && i.value == 'none') value = null;

        }
        ev.preventDefault();
        updateBtn.blur();

        await this.item.setFlag(`${OSRH.moduleName}`, 'lightItemData', formData);
        ui.notifications.info('Light Item Data Updated');
        this.close();
      });
      // numberInput qol
      for (let input of inputsA) {
        input.addEventListener('blur', (ev) => {
          if (!ev.target.value) ev.target.value = 0;
          ev.target.value = ev.target.value < 0 ? 0 : ev.target.value;
        });
      }
      for (let input of inputsB) {
        input.addEventListener('blur', (ev) => {
          if (!ev.target.value) ev.target.value = 0;
          if (ev.target.value < 0) ev.target.value = 0;
          if (ev.target.value > 1 && ev.target.id != 'speed' && ev.target.id != 'intensity') ev.target.value = 1;
          if (ev.target.id != 'speed' || ev.target.id != 'intensity') {
            if (ev.target.value > 10) ev.target.value = 10;
          }
        });
      }
  }
  // _getTabs(parts) {
  //   const tabGroup = 'primary';
  //   const intialTab = this.options.tabs[0].initial;
  //   const tabData = {};
  //   // Default tab for first time it's rendered this session
  //   if (!this.tabGroups.primary) this.tabGroups.primary = intialTab;
  //   for (let part of parts) {
  //     const tab = {
  //       cssClass: '',
  //       group: tabGroup,
  //       // Matches tab property to
  //       id: '',
  //       // FontAwesome Icon, if you so choose
  //       icon: '',
  //       // Run through localization
  //       label: 'osr-helper.partySheet.tab.'
  //     };
  //     //move to constructor
     
  //     switch (part) {
  //       case 'main':
  //         tab.id = 'main';
  //         tab.label += 'main';
  //         break;
  //     }
  //     // This is what turns on a single tab
  //     if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
  //     if (tabs.includes(part)) {
  //       tabData[part] = tab;
  //     }
  //   }
  //   return tabData;
  // }
  // _forceTabInit(tabData) {
  //   const tabEls = [...this.element.querySelectorAll('.tab')];
  //   const tabInitialized = tabEls.filter((i) => i.classList.contains('active')).length > 0;
  //   if (!tabInitialized) {
  //     for (let property in tabData) {
  //       if (tabData[property]?.cssClass === 'active') {
  //         const tabId = tabData[property].id;
  //         const tabEl = tabEls.find((i) => i.classList.contains(tabId));
  //         if (tabEl && !tabEl.classList.contains('active')) {
  //           tabEl.classList.add('active');
  //         }
  //       }
  //     }
  //   }
  // }
}