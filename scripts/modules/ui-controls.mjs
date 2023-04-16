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
    element.style.position = 'relative';
    // create control container
    const uiEl = document.createElement('div');
    uiEl.id = 'osrh-ui-control';
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
          controlBtn.classList.add('osrh-controls-open')
        }
      } else {
        let finished = await btnCont.animate(animationIn, animOptions).finished;
        if (finished.playState === 'finished') {
          game.user.setFlag('osr-helper', 'uiControlOpen', false)
          btnCont.classList.add('osrh-control-closed');
          controlBtn.classList.remove('osrh-controls-open')
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
        console.log(amt)
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
      console.log('true', )
      btnCont.classList.remove('osrh-control-closed');
      controlBtn.classList.add('osrh-controls-open')
    }
  },
  controlOptions: [
    {
      id: 'turnTracker',
      label: 'Turn Tracker',
      gm: false,
      function: 'util.renderTurnTracker',
      img: 'modules/osr-helper/images/icons/turn-tracker-64.png'
      // img: 'icons/magic/time/clock-stopwatch-white-blue.webp'
    },
    {
      id: 'dungeonTurn',
      label: 'Dungeon Turn',
      gm: true,
      function: 'turn.dungeonTurn',
      img: 'modules/osr-helper/images/icons/clock-64.png'
      // img: 'icons/magic/time/clock-stopwatch-white-blue.webp'
    },
    {
      id: 'dungeonRest',
      label: 'Rest',
      gm: true,
      function: 'turn.rest',
      img: 'modules/osr-helper/images/icons/tent-64.png'
    },
    {
      id: 'showTurnCount',
      label: 'Show Turn Count',
      gm: true,
      function: 'turn.showTurnCount',
      img: 'modules/osr-helper/images/icons/show-turn-64.png'
    },
    {
      id: 'resetSessionCount',
      label: 'Reset Session Count',
      gm: true,
      function: 'turn.resetSessionCount',
      img: 'modules/osr-helper/images/icons/reset-session-64.png'
    },
    {
      id: 'actorItemReport',
      label: 'Actor Item Report',
      gm: true,
      function: 'report.actorItem',
      img: 'modules/osr-helper/images/icons/actor-item-report-64.png'
    },
    {
      id: 'light',
      label: 'Light Toggle',
      gm: false,
      function: 'light.lightToggle',
      img: 'modules/osr-helper/images/icons/torch-64.png'
    },
    {
      id: 'lightTurnsRemaining',
      label: 'Light Turns Remaining',
      gm: false,
      function: 'light.turnsRemaining',
      img: 'modules/osr-helper/images/icons/light-time-64.png'
    },
    {
      id: 'eatRation',
      label: 'Eat Ration',
      gm: false,
      function: 'ration.eat',
      img: 'modules/osr-helper/images/icons/turkey-leg-64.png'
    },
    {
      id: 'rationReport',
      label: 'Ration Report',
      gm: true,
      function: 'report.ration',
      img: 'modules/osr-helper/images/icons/ration-report-64.png'
    },
    {
      id: 'travelCalc',
      label: 'Travel Calculator',
      gm: true,
      function: 'report.travelCalc',
      img: 'modules/osr-helper/images/icons/travel-calc-64.png'
    },
    {
      id: 'attack',
      label: 'Attack',
      gm: false,
      function: 'util.attack',
      img: 'modules/osr-helper/images/icons/attack-64.png'
    }
  ]
};
