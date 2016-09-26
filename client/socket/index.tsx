import SocketContainer from "./socket";
import store from "../store";
import {joinRoom, resetRoomState, gotDisconnected} from "../actions";

export const chat = SocketContainer.createNs("chat");
export const misc = SocketContainer.createNs("misc");
export const player = SocketContainer.createNs("player");

function isObject(o): boolean{
  return Object.prototype.toString.call(o) === "[object Object]";
}

function dispatch(eventName, value){
  if(isObject(value)){
    store.dispatch(
      Object.assign({type: eventName}, value)
    );
  }else{
    console.warn("Received an event that could not be dispatched", eventName, value);
  }
}

//if the client or server disconnects we need to
//rejoin rooms when we reconnect
chat.on("connect", () => {
  const state = store.getState();
  if(state.account.isInRoom){
    store.dispatch(joinRoom(state.room.lastRoom, state.account.name));
  }
});

//reset state if we get disconnected
chat.on("disconnect", () => {
  const state = store.getState();
  if(state.account.isInRoom){
    store.dispatch(resetRoomState());
    store.dispatch(gotDisconnected());
  }
});

//dispatch all events to store
chat.on("*", dispatch);
misc.on("*", dispatch);
player.on("*", dispatch);
