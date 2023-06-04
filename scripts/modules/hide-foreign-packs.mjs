// export function hideCompendium(defaultLang, tabDirectory) {
//   console.log(tabDirectory)
//   if (tabDirectory.tabName == "compendium") {
//       let comps = tabDirectory.element[0].getElementsByClassName("pack-title");
//       console.log(comps)
//       let hiddingKeys = [];

//       switch (defaultLang) {
//           case "en":
//               hiddingKeys = ["(fr)", "(de)"]
//               break;
//           case "de":
//               hiddingKeys = ["(fr)", "(en)"]

//               break;
//           case "fr":
//               hiddingKeys = ["(en)", "(de)"]
//               break;
//           default:
//               hiddingKeys = ["(en)", "(de)", "(fr)"]

//       }

//       for (let key of hiddingKeys) {
//           for (let comp of comps) {
//               let indexForeign = comp.innerText.indexOf(key);
//               if (indexForeign !== -1) {
//                   comp.parentElement.style.display = "none";
//               }
//           }

//       }
//   }

// }

export const hideForeignPacks = () => {
  const hideThis = 'OSR-helper Items'; //'(es)'
  Hooks.on('changeSidebarTab', async  (tab) => {
    if(await game.settings.get(`${OSRH.moduleName}`, 'hideForeignPacks')){
      if (tab._element[0].id === 'compendium') {
        const langList = ['en', 'es'];
        const curLang = game.i18n.lang;
        const hideList = langList.filter((i) => i != curLang);
        console.log(hideList);
        const packs = tab._element[0].getElementsByClassName('compendium-name');
  
        const osrhPacks = [];
        for (let pack of packs) {
          const osrPack = pack.innerText.indexOf('OSR-helper');
          if (osrPack != -1) {
            osrhPacks.push(pack);
          }
        }
        for (let lang of hideList) {
          for (let pack of osrhPacks) {
            console.log(pack.innerText, pack.innerText.indexOf('OSR-helper'));
            let indexLang = pack.innerText.indexOf(`(${lang})`);
            if (indexLang !== -1) {
              //change to equal
              console.log('hide', pack.innerText);
              pack.parentElement.style.display = 'none';
            }
          }
        }
      }
    }

  });
};
