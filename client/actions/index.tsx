import {chat, misc, player} from "../socket";
import {browserHistory} from "react-router";
const {ACTION_TYPE} = require("../../common/constants.json");
import store from "../store";
const baseUrl = `${window.location.protocol}//${window.location.host}`

export const changeOwnNick = (oldNick: string, newNick: string) => {
  chat.emit(ACTION_TYPE.OWN_NICK_CHANGE, newNick);
  return {
    type: ACTION_TYPE.OWN_NICK_CHANGE,
    user: {
      new: newNick,
      old: oldNick
    }
  };
};

export const subscribeRoomlist = () => {
  misc.emit(ACTION_TYPE.JOIN_ROOM, {room: "roomlist"});
};

export const unsubscribeRoomlist = () => {
  misc.emit(ACTION_TYPE.LEAVE_ROOM, {room: "roomlist"});
};

export const gotDisconnected = () => {
  return {
    type: ACTION_TYPE.DISCONNECTED
  };
};

export const joinRoom = (room: string, nick?: string) => {
  chat.emit(ACTION_TYPE.JOIN_ROOM, {room, nick});
  player.emit(ACTION_TYPE.JOIN_ROOM, {room});
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
  chat.emit(ACTION_TYPE.LEAVE_ROOM, {room});
  chat.emit(ACTION_TYPE.LEAVE_ROOM, {room});
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
  chat.emit(ACTION_TYPE.ADD_CHAT_MESSAGE, message);
  store.dispatch(addChatMessage(message));
  return {
    type: ACTION_TYPE.SEND_CHAT_MESSAGE,
    message
  };
}

export const uploadSong = (room, ownNick, file) => {
  const formData = new FormData();
  formData.append("song", file);

  const req = new XMLHttpRequest();
  req.open("POST", `${baseUrl}/api/room/${encodeURIComponent(room)}/song?identity=${encodeURIComponent(ownNick)}`);
  req.send(formData);
  return {
    type: ACTION_TYPE.NOOP
  };
}

export const playSong = ({id}) => {
  player.emit(ACTION_TYPE.PLAY_SONG, id);
  return {
    type: ACTION_TYPE.PLAY_SONG,
    song: {
      id
    }
  };
};

export const pausePlayer = () => {
  player.emit(ACTION_TYPE.PAUSE_PLAYER);
  return {
    type: ACTION_TYPE.PAUSE_PLAYER
  };
};

export const resumePlayer = () => {
  player.emit(ACTION_TYPE.RESUME_PLAYER);
  return {
    type: ACTION_TYPE.RESUME_PLAYER
  };
};

export const stopPlayer = () => {
  player.emit(ACTION_TYPE.STOP_PLAYER);
  return {
    type: ACTION_TYPE.STOP_PLAYER
  };
};

export const resetPlayer = () => {
  return {
    type: ACTION_TYPE.RESET_PLAYER
  };
};

export const seekSong = (seconds: number) => {
  player.emit(ACTION_TYPE.SEEK_SONG, seconds);
  return {
    type: ACTION_TYPE.SEEK_SONG,
    seconds
  };
};

export const unsetSeek = () => {
  return {
    type: ACTION_TYPE.UNSET_SEEK
  };
}
