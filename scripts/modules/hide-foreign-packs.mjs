export const hideForeignPacks = () => {
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  Hooks.on('changeSidebarTab', async (tab) => {
    if (await game.settings.get(`${OSRH.moduleName}`, 'hideForeignPacks')) {
      hfp(tab);
    }
  });
  Hooks.on('renderSidebarTab', async (tab) => {
    await sleep(200);
    if (await game.settings.get(`${OSRH.moduleName}`, 'hideForeignPacks')) {
      hfp(tab);
    }
  });
};

function hfp(tab) {
  if (tab?._element[0]?.id === 'compendium') {
    const lis = document.querySelectorAll('li.compendium');
    const osrPacks = [...lis].filter((li) => {
      const send = li.dataset.entryId.includes('osr-helper');
      return send ? send : false;
    });
    if (osrPacks.length) {
      if (OSRH.lang.includes(game.i18n.lang)) {
        const langstring = `(${game.i18n.lang})`;
        osrPacks.forEach((p) => {
          const title = p.querySelector('h3.compendium-name').innerText;
          if (title.includes('(') && !title.includes(langstring)) {
            p.style.display = 'none';
          }
        });
      } else {
        const langs = OSRH.lang.filter(i=>i != `en`);
        osrPacks.forEach((p) => {
          const title = p.querySelector('h3.compendium-name').innerText;
          for (let lang of langs) {
            if (title.includes(`(${lang})`)) {
              p.style.display = 'none';
            }
          }
          
        });
      }
    }
  }
}