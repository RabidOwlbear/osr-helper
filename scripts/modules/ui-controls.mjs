import { renderTemplateHandler } from "./util.js"
import { OSRHItemConfig } from "./item-config.mjs";
import { NewActiveEffectForm } from "./old/effectModule.js";
export const uiControls = {
  async addUiControls() {
    const setting = await game.settings.get(OSRH.moduleName, 'displayControlUi')
    if( !setting ){
      return
    }
    // animations
    const animationOut = [{ transform: 'translateX(0)' }, { transform: 'translateX(435px)' }];
    const animationIn = [{ transform: 'translateX(0)' }, { transform: 'translateX(-435px)' }];
    const animOptions = {
      duration: 250,
      iterations: 1,
      easing: 'ease-out'
    };
    // get bottom ui element
    const element = document.querySelector('#hotbar');  
    // element.style.position = 'relative';
    // create control container
    const uiEl = document.createElement('div');
    uiEl.id = 'osrh-ui-control';
    uiEl.style.zIndex = '-1';
    // create control button
    const controlBtn = document.createElement('a');
    controlBtn.id = 'osrh-ui-display-btn';
    uiEl.appendChild(controlBtn);
    //create button masking container
    const btnMask = document.createElement('div');
    btnMask.id = 'osrh-control-mask';
    uiEl.appendChild(btnMask);
    // create button container
    const btnCont = document.createElement('div');
    btnCont.id = 'osrh-control-cont';
    btnCont.classList.add('osrh-control-closed');
    btnMask.appendChild(btnCont);
    // create individual control buttons
    for (let option of OSRH.ui.controlOptions) {
      let btn = document.createElement('a');
      let img = document.createElement('div');
      btn.appendChild(img);
      img.classList.add('osrh-control-btn-img');
      img.style.backgroundImage = `url(${option.img})`;
      btn.id = option.id;
      btn.title = option.label;
      btn.classList.add('osrh-control-btn');
      if (game.user.isGM) {
        btnCont.appendChild(btn);
        btn.addEventListener('click', (e) => {
          let path = option.function.split('.');
          OSRH[path[0]][path[1]]();
        });
      } else {
        if (!option.gm) {
          btnCont.appendChild(btn);
          btn.addEventListener('click', (e) => {
            let path = option.function.split('.');
            OSRH[path[0]][path[1]]();
          });
        }
      }
    }
    // add elements
    element.appendChild(uiEl);

    // add listeners
    controlBtn.addEventListener('click', async (e) => {
      if (btnCont.classList.contains('osrh-control-closed')) {
        let finished = await btnCont.animate(animationOut, animOptions).finished;
        
        if (finished.playState === 'finished') {
          game.user.setFlag('osr-helper', 'uiControlOpen', true)
          btnCont.classList.remove('osrh-control-closed');
          controlBtn.classList.add('osrh-controls-open');
          btnMask.style.display = 'inherit'
        }
      } else {
        let finished = await btnCont.animate(animationIn, animOptions).finished;
        if (finished.playState === 'finished') {
          game.user.setFlag('osr-helper', 'uiControlOpen', false)
          btnCont.classList.add('osrh-control-closed');
          controlBtn.classList.remove('osrh-controls-open')
          btnMask.style.display = 'none'
        }
      }
    });
    if (game.modules.get('monks-hotbar-expansion')?.active) {
      const rowCount = await game.settings.get('monks-hotbar-expansion', 'number-rows');
      let amt = rowCount * 50 + 20;
      const pageNum = document.querySelector('#hotbar-page-controls span.page-number');
      const hotbarPage = document.querySelector('#hotbar-page');
      if(!hotbarPage.classList.contains('collapsed')){
        controlBtn.style.top = `-${amt}px`;
        btnMask.style.top = `-${amt}px`;
      }
      
      pageNum.addEventListener('click', async (e) => {
        
        const animationUp = [{ transform: 'translateY(0)' }, { transform: `translateY(-${amt}px)` }];
        const animationDown = [{ transform: 'translateY(0)' }, { transform: `translateY(${amt}px)` }];
        let options = {
          duration: 200,
          iterations: 1,
          easing: 'ease-out'
        }
        if (!hotbarPage.classList.contains('collapsed')) {

          let finished = await uiEl.animate(animationDown, options).finished;
          if (finished.playState === 'finished') {
            controlBtn.style.top = `0px`;
            btnMask.style.top = `0px`;
          }
        } else {

          let finished = await uiEl.animate(animationUp, options).finished;
          if (finished.playState === 'finished') {
            controlBtn.style.top = `-${amt}px`;
            btnMask.style.top = `-${amt}px`;
          }
        }
      });
    }

    // if already open
    if(game.user.getFlag('osr-helper', 'uiControlOpen')){
      
      btnCont.classList.remove('osrh-control-closed');
      controlBtn.classList.add('osrh-controls-open')
    }
  },

};

export async function injectOSRHSheetUI(html, object, type) {
  const sheetUI = await game.settings.get(OSRH.moduleName, 'displayControlUi');
  const existing = html.querySelector('.osrh-control');
  if (existing || !sheetUI) return;
  const controls = html.querySelector('.controls-dropdown')
  const data = {
    handle: true,
    buttons: OSRH.data.sheetUI[type],
    roundBottom: false
  };
  data.roundBottom = data.buttons.length > 1 ? true : false;
  const template = await renderTemplateHandler(
    'modules/osr-helper/templates/ui/control-element.hbs',
    data
  );
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template;
  const elements = tempDiv.querySelectorAll('.header-control');
  elements.forEach((el) => {
    const button = el.querySelector(".ui-button")
    console.log(button)
    button.addEventListener('click', (ev) => {
      const app = ev.target.closest('.ui-button').dataset.app;
      console.log('app', app)
      switch (app) {
        case 'active-effects':
          OSRH.effect.renderEffectApp(object.document);
          break;
        case 'item-management':
          let ration =  OSRH.systemData.rationItemTypes.includes(object.document.type)
          new OSRHItemConfig(object.document, ration).render(true, { top: ev.y, left: ev.x - 125 });          
          break;
        case 'item-report':
           OSRH.report.actorItem(object.document)          
          break;
        case 'currency-converter':
           OSRH.util.curConDiag(object.document)
          break;
      }
    });
    controls.appendChild(el)
  });
}