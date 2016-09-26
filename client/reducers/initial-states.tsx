const {PLAYER_STATUS: PLAYER_STATUS} = require("../../common/constants.json");

export default {
	account: {
		name: "Not logged in",
		isInRoom: false
	},
	user: {
		nick: ""
	},
	users: [],
	messages: [],
	get chat(): ChatState {
		return {
			users: this.users,
			messages: this.messages
		}
	},
	song: {
		status: "waiting",
		progress: 0,
		tags: {}
	},
	order: [],
	songs: {},
	roomlist: [],
	get player(): PlayerState {
		return {
			status: PLAYER_STATUS.STOPPED,
			songs: this.songs,
			order: this.order
		}
	},
	get room(): RoomState {
		return {
			player: this.player,
			chat: this.chat
		}
	}
};
