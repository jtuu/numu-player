const {
  ACTION_TYPE,
  MAX_SERVER_CHAT_HISTORY,
  MAX_CIENT_CHAT_HISTORY,
  FILE_PROCESS_STATUS
} = require("../../common/constants.json");
import initialStates from "./initial-states";

var messageId = MAX_SERVER_CHAT_HISTORY;
var userId = 0;

function systemMessage(text){
  return {
    timestamp: new Date(),
    id: messageId++,
    text
  };
}

const chat = (state: ChatState = initialStates.chat, action) => {
  switch(action.type){
    case ACTION_TYPE.ROOM_STATE: {
      return Object.assign({}, state, {users: users(state.users, action)}, {messages: messages(state.messages, action)});
    }
		case ACTION_TYPE.DISCONNECTED:
    case ACTION_TYPE.ADD_CHAT_MESSAGE:
    case ACTION_TYPE.SONG_UPLOAD_BEGIN:
		case ACTION_TYPE.SONG_UPLOAD_END:
		case ACTION_TYPE.SONG_TRANSCODE_BEGIN:
		case ACTION_TYPE.SONG_TRANSCODE_END: {
      return Object.assign({}, state, {
        messages: messages(state.messages, action)
      });
    }
    case ACTION_TYPE.OWN_NICK_CHANGE:
    case ACTION_TYPE.NICK_CHANGE:
		case ACTION_TYPE.ENTERED_ROOM:
		case ACTION_TYPE.LEFT_ROOM: {
			return Object.assign({}, state, {
				users: users(state.users, action)
			}, {
				messages: messages(state.messages, action)
			});
		}
    default: {
      return state;
    }
  }
}

const messages = (state = initialStates.messages, action) => {
  switch(action.type){
		case ACTION_TYPE.ROOM_STATE: {
			return state.concat(action.state.chat.messages);
		}
    case ACTION_TYPE.ADD_CHAT_MESSAGE: {
      action.message.id = messageId++;
      return state.slice(-MAX_CIENT_CHAT_HISTORY).concat(action.message);
    }
		case ACTION_TYPE.ENTERED_ROOM: {
			return state.slice(-MAX_CIENT_CHAT_HISTORY).concat({
				text: `${action.user.nick} entered room`,
				timestamp: new Date(),
				id: messageId++
			});
		}
		case ACTION_TYPE.LEFT_ROOM: {
			return state.slice(-MAX_CIENT_CHAT_HISTORY).concat({
				text: `${action.user.nick} left room`,
				timestamp: new Date(),
				id: messageId++
			});
		}
		case ACTION_TYPE.NICK_CHANGE: {
			return state.concat({
				//used ["new"] instead of .new cause it broke my editor LOL, try to avoid reserved words even in prop names in the future i guess
				text: `${action.user.old} is now known as ${action.user["new"]}`,
				timestamp: new Date(),
				id: messageId++
			});
		}
		case ACTION_TYPE.DISCONNECTED: {
			return state.concat({
				text: "Lost connection to server",
				timestamp: new Date(),
				id: messageId++
			});
		}
    case ACTION_TYPE.SONG_UPLOAD_BEGIN: {
      return state.concat(systemMessage(`${action.song.uploader} started uploading a file`));
    }
		case ACTION_TYPE.SONG_UPLOAD_END: {
      if(action.result === FILE_PROCESS_STATUS.FAILED){
        return state.concat(systemMessage(`${action.song.uploader} succesfully uploaded a file`));
      }else if(action.result === FILE_PROCESS_STATUS.SUCCESS){
        return state.concat(systemMessage(`${action.song.uploader}'s file upload failed`));
      }
    }
		case ACTION_TYPE.SONG_TRANSCODE_BEGIN: {
      return state.concat(systemMessage(`Began transcoding a song uploaded by ${action.song.uploader}`));
    }
		case ACTION_TYPE.SONG_TRANSCODE_END: {
      return state.concat(systemMessage(`Finished transcoding a song uploaded by ${action.song.uploader}`));
    }
    default: {
      return state;
    }
  }
}

const users = (state = initialStates.users, action) => {
  switch(action.type){
		case ACTION_TYPE.ROOM_STATE: {
			userId = Math.max.apply(null, action.state.chat.users.map(u => u.id)) + 1;
			return state.concat(action.state.chat.users);
		}
    case ACTION_TYPE.ENTERED_ROOM: {
      action.user.id = userId++;
      return state.concat(action.user);
    }
    case ACTION_TYPE.LEFT_ROOM: {
      const idx = state.findIndex(u => u.nick === action.user.nick);
      return state.slice(0, idx).concat(state.slice(idx + 1));
    }
		case ACTION_TYPE.OWN_NICK_CHANGE:
    case ACTION_TYPE.NICK_CHANGE: {
      return [...state.map(u => user(u, action))];
    }
    default: {
      return state;
    }
  }
}

const user = (state: ChatUserProps = initialStates.user, action) => {
  switch(action.type){
		case ACTION_TYPE.OWN_NICK_CHANGE:
    case ACTION_TYPE.NICK_CHANGE: {
      if(state.nick === action.user.old){
        return Object.assign({}, state, {nick: action.user.new});
      }
      return state;
    }
    default: {
      return state;
    }
  }
}

export default chat;
