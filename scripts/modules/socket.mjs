export const socket ={
  registerSocket: function (){
    game.socket.on('module.osr-helper', OSRH.socket.HandleSocket);
  },
  HandleSocket: async function(data){
    console.log(data)
  },
  executeAsGM: async function(funcName, ...args){
    
  }


}