import chat from "./chat";
import player from "./player";
const {ACTION_TYPE} = require("../../common/constants.json");
import initialStates from "./initial-states";

const room = (state = initialStates.room, action) => {
  switch(action.type){
    case ACTION_TYPE.ROOM_STATE: {
			state = initialStates.room;
      return Object.assign({}, state, {chat: chat(state.chat, action)}, {player: player(state.player, action)}, {name: action.state.name});
    }
		case ACTION_TYPE.LEAVE_ROOM:
		case ACTION_TYPE.RESET_ROOM_STATE: {
			return Object.assign({}, initialStates.room, {lastRoom: state.name});
		}
		case ACTION_TYPE.DISCONNECTED:
		case ACTION_TYPE.ADD_CHAT_MESSAGE:
		case ACTION_TYPE.NICK_CHANGE:
		case ACTION_TYPE.OWN_NICK_CHANGE:
		case ACTION_TYPE.ENTERED_ROOM:
		case ACTION_TYPE.LEFT_ROOM: {
			return Object.assign({}, state, {chat: chat(state.chat, action)});
		}
		case ACTION_TYPE.SONG_UPLOAD_BEGIN:
		case ACTION_TYPE.SONG_UPLOAD_END:
		case ACTION_TYPE.SONG_TRANSCODE_BEGIN:
		case ACTION_TYPE.SONG_TRANSCODE_END:
		case ACTION_TYPE.SONG_UPLOAD_PROGRESS:
		case ACTION_TYPE.SONG_TRANSCODE_PROGRESS:
    case ACTION_TYPE.SONG_METADATA:
    case ACTION_TYPE.PLAY_SONG:
    case ACTION_TYPE.PAUSE_PLAYER:
    case ACTION_TYPE.RESUME_PLAYER:
    case ACTION_TYPE.STOP_PLAYER:
    case ACTION_TYPE.RESET_PLAYER:
    case ACTION_TYPE.SEEK_SONG: {
			return Object.assign({}, state, {player: player(state.player, action)});
		}
    default: {
      return state;
    }
  }
};

export default room;
