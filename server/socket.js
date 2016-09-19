const socketio = require("socket.io");
const db = require("./mongo");
const chalk = require("chalk");
const {
	logWs,
	randomNick,
	getAllPropertyNames
} = require("./utils");
const {
	ACTION_TYPE
} = require("../common/constants");

//prepared strings
const STRINGS = {
	JOINED: chalk.green("joined"),
	LEFT: chalk.yellow("left"),
	DISCONNECTED: chalk.red("disconnected"),
	ERROR: chalk.red("error")
}

//used as a proxy handler to extend the socket.io socket-object
function extendedSocket() {
	return {
		get: function(o, p) {
			return (p in o) ? o[p] : this[p];
		},
		set: function(o, p, v) {
			this[p] = o[p] = v;
			return true;
		},
		leaveAllRooms: function() {
			Object.keys(this.rooms).forEach(roomName => {
				this.log(STRINGS.LEFT, roomName);
				this.leave(roomName);
			});
		},
		changeRoomTo: function(newRoomName) {
			this.leaveAllRooms();
			this.join(newRoomName);
			this.currentRoom = newRoomName;
		},
		log: function(message, ...rest) {
			logWs(this, message, ...rest);
		},
		broadcastToRoom(event, msg) {
			this.broadcast.to(this.currentRoom).emit(event, msg);
		},
		get user() {
			return {
				nick: this.nick
			}
		}
	};
}

class SocketServer {
	constructor(app) {
		this.ns = {};
		this.ns.global = socketio(app, {
			path: "/api/ws"
		});
		this.ns.public = this.ns.global.of("/public");

		//holds the currently connected extended sockets
		this.sockets = new Set();

		this.setupPublicNs();
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
					data.value.state.chat.messages.forEach((msg, idx) => {
						msg.id = idx;
						msg.history = true; //flag messages as being history
					});
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

	//set up the public WS API
	setupPublicNs() {
		this.ns.public.on("connection", baseSocket => {
			const socket = new Proxy(baseSocket, extendedSocket()); //extend socket

			socket.log(chalk.cyan("connected"));
			this.sockets.add(socket);

			//socket wants to join a room
			socket.on(ACTION_TYPE.JOIN_ROOM, ({room, nick}) => {
				socket.changeRoomTo(room);

				if(nick){
					socket.nick = nick;
				}

				//give the socket a random name if it doesnt have any yet
				if (!socket.nick) {
					socket.nick = randomNick();
					socket.emit(ACTION_TYPE.OWN_NICK_CHANGE, {user: {
						new: socket.nick
					}});
				}

				//send the initial state of the room
				this.getRoomState(room).then(state => {
					socket.emit(ACTION_TYPE.ROOM_STATE, {
						state
					});
				}).catch(err => console.error(err));

				//tell others
				socket.broadcastToRoom(ACTION_TYPE.ENTERED_ROOM, {user: socket.user});

				socket.log(chalk.green("joined"), room);
			});

			//socket wants to leave a room
			socket.on(ACTION_TYPE.LEAVE_ROOM, room => {
				socket.broadcastToRoom(ACTION_TYPE.LEFT_ROOM, {user: socket.user});
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
				socket.broadcastToRoom(ACTION_TYPE.LEFT_ROOM, {user: socket.user});
				this.sockets.delete(socket);
				socket.log(STRINGS.DISCONNECTED);
			});

			socket.on("error", err => {
				socket.log(STRINGS.ERROR, err);
			});
		});
	}
}

module.exports = SocketServer;
