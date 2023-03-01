export const uiControls = {
  async addUiControls() {
    if(!game.settings.get(OSRH.moduleName, 'displayControlUi')){
      return
    }
    // animations
    const animationOut = [{ transform: 'translateX(0)' }, { transform: 'translateX(435px)' }];
    const animationIn = [{ transform: 'translateX(0)' }, { transform: 'translateX(-435px)' }];
    const animOptions = {
      duration: 200,
      iterations: 1
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
          btnCont.classList.remove('osrh-control-closed');
        }
      } else {
        let finished = await btnCont.animate(animationIn, animOptions).finished;
        if (finished.playState === 'finished') {
          btnCont.classList.add('osrh-control-closed');
        }
      }
    });
    if (game.modules.get('monks-hotbar-expansion').active) {
      const rowCount = game.settings.get('monks-hotbar-expansion', 'number-rows');
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
        if (!hotbarPage.classList.contains('collapsed')) {
          let finished = await btnCont.animate(animationDown, animOptions).finished;
          if (finished.playState === 'finished') {
            controlBtn.style.top = `0px`;
            btnMask.style.top = `0px`;
          }
        } else {
          let finished = await btnCont.animate(animationUp, animOptions).finished;
          if (finished.playState === 'finished') {
            controlBtn.style.top = `-${amt}px`;
            btnMask.style.top = `-${amt}px`;
          }
        }
      });
    }
  },
  controlOptions: [
    {
      id: 'dungeonTurn',
      label: 'Dungeon Turn',
      gm: true,
      function: 'turn.dungeonTurn',
      img: 'icons/magic/time/clock-stopwatch-white-blue.webp'
    },
    {
      id: 'dungeonRest',
      label: 'Rest',
      gm: true,
      function: 'turn.rest',
      img: 'icons/environment/wilderness/camp-improvised.webp'
    },
    {
      id: 'showTurnCount',
      label: 'Show Turn Count',
      gm: true,
      function: 'turn.showTurnCount',
      img: 'icons/sundries/books/book-embossed-jewel-gold-green.webp'
    },
    {
      id: 'resetSessionCount',
      label: 'Reset Session Count',
      gm: true,
      function: 'turn.resetSessionCount',
      img: 'icons/magic/time/arrows-circling-pink.webp'
    },
    {
      id: 'actorItemReport',
      label: 'ActorItemReport',
      gm: true,
      function: 'report.actorItem',
      img: 'icons/sundries/scrolls/scroll-writing-beige.webp'
    },
    {
      id: 'light',
      label: 'Light Toggle',
      gm: false,
      function: 'light.lightToggle',
      img: 'icons/sundries/lights/candle-unlit-yellow.webp'
    },
    {
      id: 'lightTurnsRemaining',
      label: 'Light Turns Remaining',
      gm: false,
      function: 'light.turnsRemaining',
      img: 'icons/sundries/scrolls/scroll-writing-beige.webp'
    },
    {
      id: 'eatRation',
      label: 'Eat Ration',
      gm: false,
      function: 'ration.eat',
      img: 'icons/consumables/food/cooked-chicken-turkey-leg-brown.webp'
    },
    {
      id: 'rationReport',
      label: 'Ration Report',
      gm: true,
      function: 'report.ration',
      img: 'icons/sundries/scrolls/scroll-writing-beige.webp'
    },
    {
      id: 'travelCalc',
      label: 'Travel Calculator',
      gm: true,
      function: 'report.travelCalc',
      img: 'icons/tools/navigation/map-marked-green.webp'
    },
    {
      id: 'attack',
      label: 'Attack',
      gm: false,
      function: 'util.attack',
      img: 'icons/skills/melee/weapons-crossed-poleaxes-white.webp'
    }
  ]
};
