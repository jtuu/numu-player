import socket from "../socket";
import {browserHistory} from "react-router";
const {ACTION_TYPE} = require("../../common/constants.json");
import store from "../store";

export const changeOwnNick = (oldNick: string, newNick: string) => {
  socket.emit(ACTION_TYPE.OWN_NICK_CHANGE, newNick);
  return {
    type: ACTION_TYPE.OWN_NICK_CHANGE,
    user: {
      new: newNick,
      old: oldNick
    }
  };
};

export const gotDisconnected = () => {
  return {
    type: ACTION_TYPE.DISCONNECTED
  };
};

export const joinRoom = (room: string, nick?: string) => {
  socket.emit(ACTION_TYPE.JOIN_ROOM, {room, nick});
  return {
    type: ACTION_TYPE.JOIN_ROOM,
    room
  };
}

export const resetRoomState = () => {
  return {
    type: ACTION_TYPE.RESET_ROOM_STATE
  };
};

export const leaveRoom = (room: string) => {
  socket.emit(ACTION_TYPE.LEAVE_ROOM, room);
  return {
    type: ACTION_TYPE.LEAVE_ROOM,
    room
  };
}

export const addChatMessage = (message: ChatMessageProps) => {
  return {
    type: ACTION_TYPE.ADD_CHAT_MESSAGE,
    message
  };
}

export const sendChatMessage = (message: ChatMessageProps) => {
  socket.emit(ACTION_TYPE.ADD_CHAT_MESSAGE, message);
  store.dispatch(addChatMessage(message));
  return {
    type: ACTION_TYPE.SEND_CHAT_MESSAGE,
    message
  };
}
