import {combineReducers} from "redux";
import room from "./room";
import initialStates from "./initial-states";
const {ACTION_TYPE} = require("../../common/constants.json");


const roomlist = (state = initialStates.roomlist, action) => {
	switch(action.type){
		case ACTION_TYPE.ROOMLIST: {
			return action.rooms;
		}
		default: {
			return state;
		}
	}
}

const account = (state = initialStates.account, action) => {
	switch(action.type){
		case ACTION_TYPE.OWN_NICK_CHANGE: {
			return Object.assign({}, state, {name: action.user.new});
		}
		case ACTION_TYPE.ROOM_STATE: {
			return Object.assign({}, state, {isInRoom: true});
		}
		case ACTION_TYPE.LEAVE_ROOM: {
			return Object.assign({}, state, {isInRoom: false});
		}
		default: {
			return state;
		}
	}
}

const rootReducer = combineReducers<AppState>({
  room,
	account,
	roomlist
});

export default rootReducer;
