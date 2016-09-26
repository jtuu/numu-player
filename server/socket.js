const socketio = require("socket.io");
const db = require("./mongo");
const chalk = require("chalk");
const {
	logWs,
	randomNick,
	getAllPropertyNames,
	STRINGS
} = require("./utils");
const {
	ACTION_TYPE
} = require("../common/constants");

//used as a proxy handler to extend the socket.io socket-object
class ExtendedSocket {
	constructor() {}

	get(obj, prop) {
		return (prop in obj) ? obj[prop] : this[prop];
	}

	set(obj, prop, val) {
		this[prop] = obj[prop] = val;
		return true;
	}

	leaveAllRooms() {
		this.currentRoom = null;
		for (let roomName in this.rooms) {
			this.log(STRINGS.LEFT, roomName);
			this.leave(roomName);
		}
	}

	changeRoomTo(newRoomName) {
		this.leaveAllRooms();
		this.join(newRoomName);
		this.currentRoom = newRoomName;
	}

	log(message, ...rest) {
		logWs(this, message, ...rest);
	}

	broadcastToRoom(event, msg) {
		this.broadcast.to(this.currentRoom).emit(event, msg);
	}

	get user() {
		return {
			nick: this.nick
		}
	}
}

class SocketServer {
	constructor(app) {
		this.ns = {};
		this.ns.global = socketio(app, {
			path: "/api/ws"
		});
		this.ns.chat = this.ns.global.of("/chat");
		this.ns.misc = this.ns.global.of("/misc");
		this.ns.player = this.ns.global.of("/player");

		//holds the currently connected extended sockets
		this.sockets = new Set();

		this.setupChatNs();
		this.setupMiscNs();
		this.setupPlayerNs();
	}

	getSocketsInRoom(room) {
		return Array.from(this.sockets).filter(s => s.currentRoom === room);
	}

	//gets the full current state of a room:
	//users, chat history, playlist, etc.
	getRoomState(room) {
		//get stuff from db
		//(this will also create a new room if it doesnt exist yet)
		return db.getState(room).then(data => {
			if (data && data.value && data.value.state) {
				if (data.value.state.chat && data.value.state.chat.messages) {
					for (let [idx, msg] of data.value.state.chat.messages.entries()) {
						msg.id = idx;
						msg.history = true; //flag messages as being history
					}
				}
				return data.value.state;
			} else {
				return {
					chat: {}
				};
			}
		}).then(state => {
			state.chat.users = this.getSocketsInRoom(room).map((s, i) => {
				return {
					id: i,
					nick: s.nick
				};
			});
			state.name = room;
			return state;
		});
	}

	//set up the chat API
	setupChatNs() {
		this.ns.chat.on("connection", baseSocket => {
			const socket = new Proxy(baseSocket, new ExtendedSocket()); //extend socket

			socket.log(chalk.cyan("connected"));
			this.sockets.add(socket);

			//socket wants to join a room
			socket.on(ACTION_TYPE.JOIN_ROOM, ({
				room,
				nick
			}) => {
				socket.changeRoomTo(room);

				if (nick) {
					socket.nick = nick;
				}

				//give the socket a random name if it doesnt have any yet
				if (!socket.nick) {
					socket.nick = randomNick();
					socket.emit(ACTION_TYPE.OWN_NICK_CHANGE, {
						user: {
							new: socket.nick
						}
					});
				}

				//send the initial state of the room
				this.getRoomState(room).then(state => {
					socket.emit(ACTION_TYPE.ROOM_STATE, {
						state
					});
				}).catch(err => console.error(err));

				//tell others
				socket.broadcastToRoom(ACTION_TYPE.ENTERED_ROOM, {
					user: socket.user
				});

				socket.log(chalk.green("joined"), room);
			});

			//socket wants to leave a room
			socket.on(ACTION_TYPE.LEAVE_ROOM, ({room}) => {
				socket.broadcastToRoom(ACTION_TYPE.LEFT_ROOM, {
					user: socket.user
				});
				socket.leaveAllRooms();
			});

			//socket sent a chat message
			socket.on(ACTION_TYPE.ADD_CHAT_MESSAGE, message => {
				db.addChatMessage(socket.currentRoom, message).catch(console.error.bind());
				socket.broadcastToRoom(ACTION_TYPE.ADD_CHAT_MESSAGE, {
					message
				});
			});

			socket.on(ACTION_TYPE.OWN_NICK_CHANGE, nick => {
				socket.broadcastToRoom(ACTION_TYPE.NICK_CHANGE, {
					user: {
						old: socket.nick,
						new: nick
					}
				});
				socket.nick = nick;
			});

			socket.on("disconnect", () => {
				socket.broadcastToRoom(ACTION_TYPE.LEFT_ROOM, {
					user: socket.user
				});
				this.sockets.delete(socket);
				socket.log(STRINGS.DISCONNECTED);
			});

			socket.on("error", err => {
				socket.log(STRINGS.ERROR, err);
			});
		});
	}

	setupMiscNs() {
		this.ns.misc.on("connection", baseSocket => {
			const socket = new Proxy(baseSocket, new ExtendedSocket());

			socket.on(ACTION_TYPE.JOIN_ROOM, ({
				room
			}) => {
				switch (room) {
					case "roomlist":
						socket.log(STRINGS.JOINED, room);
						socket.changeRoomTo(room);
						socket.emit(ACTION_TYPE.ROOMLIST, {
							rooms: this.getRooms()
						});
						break;
					default:
						break;
				}
			});

			socket.on(ACTION_TYPE.LEAVE_ROOM, ({
				room
			}) => {
				switch (room) {
					case "roomlist":
						socket.log(STRINGS.LEFT, room);
						socket.leaveAllRooms();
						break;
					default:
						break;
				}
			});
		});
		setInterval(() => this.ns.misc.to("roomlist").emit(ACTION_TYPE.ROOMLIST, {
			rooms: this.getRooms()
		}), 5000);
	}

	setupPlayerNs(){
		this.ns.player.on("connection", baseSocket => {
			const socket = new Proxy(baseSocket, new ExtendedSocket());

			socket.on(ACTION_TYPE.JOIN_ROOM, ({room}) => {
				socket.changeRoomTo(room);
			});

			socket.on(ACTION_TYPE.PLAY_SONG, songId => {
				console.log("play")
				db.playSong(socket.currentRoom, songId).catch(console.error.bind());
				socket.broadcastToRoom(ACTION_TYPE.PLAY_SONG, {song: {id: songId}});
			});

			socket.on(ACTION_TYPE.PAUSE_PLAYER, () => {
				console.log("pause")
				db.pausePlayer(socket.currentRoom).catch(console.error.bind());
				socket.broadcastToRoom(ACTION_TYPE.PAUSE_PLAYER, {});
			});

			socket.on(ACTION_TYPE.RESUME_PLAYER, () => {
				console.log("resume")
				db.resumePlayer(socket.currentRoom).catch(console.error.bind());
				socket.broadcastToRoom(ACTION_TYPE.RESUME_PLAYER, {});
			});

			socket.on(ACTION_TYPE.STOP_PLAYER, () => {
				console.log("stop")
				db.stopPlayer(socket.currentRoom).catch(console.error.bind());
				socket.broadcastToRoom(ACTION_TYPE.STOP_PLAYER, {});
			});

			socket.on(ACTION_TYPE.SEEK_SONG, seconds => {
				console.log("seek", seconds)
				db.seekSong(socket.currentRoom, seconds).catch(console.error.bind());
				socket.broadcastToRoom(ACTION_TYPE.SEEK_SONG, {seconds});
			});

			socket.on(ACTION_TYPE.LEAVE_ROOM, ({room}) => {
				socket.leaveAllRooms();
			});
		});
	}

	getRooms() {
		const rooms = new Set();
		this.sockets.forEach(s => s.currentRoom ? rooms.add(s.currentRoom) : null);
		return Array.from(rooms).map((name, id) => ({
			name,
			id
		}));
	}
}

module.exports = SocketServer;
