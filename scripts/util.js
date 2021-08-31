function setLightFlag(data) {
  console.log('ding', data);
  const { actor, actorId, type, duration } = data;
  const journal = game.journal.getName(game.settings.get('OSE-helper', 'timeJournalName'));
  const flagObj = {
    [actorId]: {
      [type]: {
        isOn: true,
        actorId,
        type,
        duration,
        startTime: game.time.worldTime
      }
    }
  };
  journal.setFlag('world', 'oseLights', flagObj);
  actor.setFlag('world', 'lightLit', true);
}
function getById(type, id) {
  if (type == 'actor') {
    return game.actors.find((a) => a.id == id);
  }
  if (type == 'journal') {
    return game.journal.find((j) => j.id == id);
  }
}
function getActor() {
  if (canvas.tokens.controlled.length > 1 || canvas.tokens.controlled.length == 0) {
    ui.notifications.error('Please select a single token');
    return;
  }
  return game.actors.find((a) => a.id == canvas.tokens.controlled[0].actor.id);
}
function unSetLightFlag(data) {
  const { actor, actorId } = data;
  const journal = game.journal.getName(game.settings.get('OSE-helper', 'timeJournalName'));
  let flags = journal.data.flags.world.oseLights;
  delete flags[actorId];
  journal.unsetFlag('world', 'oseLights');
  journal.setFlag('world', 'oseLights', flags);
  actor.setFlag('world', 'lightLit', false);
}
