import * as React from "react";
import {render} from "react-dom";
import {Router, Route, browserHistory, IndexRoute} from "react-router";
import App from "./components/app";
import Home from "./components/home";
import Root from "./containers/root";
import store from "./store";
import socket from "./socket";
import {joinRoom, resetRoomState, gotDisconnected} from "./actions";

render(
  <Root store={store} history={browserHistory} />,
  document.getElementById("app-root")
);

function isObject(o): boolean{
  return Object.prototype.toString.call(o) === "[object Object]";
}

socket.on("connect", () => {
  const state = store.getState();
  if(state.account.isInRoom){
    store.dispatch(joinRoom(state.room.lastRoom, state.account.name));
  }
});

socket.on("disconnect", () => {
  const state = store.getState();
  if(state.account.isInRoom){
    store.dispatch(resetRoomState());
    store.dispatch(gotDisconnected());
  }
});

socket.on("*", (eventName, value) => {
  if(isObject(value)){
    store.dispatch(
      Object.assign({type: eventName}, value)
    );
  }else{
    console.warn("Received an event that could not be dispatched", eventName, value);
  }
});

window["store"] = store;
