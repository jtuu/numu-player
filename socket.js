const socketio = require("socket.io");
const db = require("./db");

const songRequestTimeoutMillis = 5000;

function leaveAllRooms(socket) {
	Object.keys(socket.rooms).forEach(roomName => {
		socket.leave(roomName);
	});
}

function changeRoom(socket, newRoomName) {
	leaveAllRooms(socket);
	socket.join(newRoomName);
	socket.currentRoom = newRoomName;
}

function logSock(socket, msg, ...rest) {
	if (!(rest.length && rest[0] instanceof Error)) {
		rest = JSON.stringify(rest);
	}
	console.log(`[${socket.nickname}]: ${msg} ${rest}`);
}

function getCurrentSong(ns, roomName) {
	let room = ns.adapter.rooms[roomName];
	return new Promise((resolve, reject) => {
		if (room && room.length && room.sockets) {
			const randomClient = ns.sockets[Object.keys(room.sockets)[Math.random() * room.length | 0]];
			randomClient.emit("currentSongRequest", null, resolve);
			setTimeout(() => reject("Timed out"), songRequestTimeoutMillis);
		} else {
			reject("Invalid room");
		}
	});
}

function randomNick() {
	return `Guest#${String(Math.random()).substr(-5)}`;
}

module.exports = function setup(app) {
	const io = socketio(app, {
		path: "/api/ws"
	});
	const publicNS = io.of("/public");

	publicNS.on("connection", socket => {
		logSock(socket, "connected");

		socket.on("join", room => {
			socket.nickname = randomNick();
			changeRoom(socket, room);
			socket.broadcast.to(room).emit("chatJoin", socket.nickname);
			socket.emit("nickChange", {
				old: "me",
				new: socket.nickname
			});
			logSock(socket, "joined", room);
		});

		socket.on("nickChange", nick => {
			socket.broadcast.to(socket.currentRoom).emit("nickChange", {
				old: socket.nickname,
				new: nick
			});
			logSock(socket, "changed nick", socket.nickname, nick);
			socket.nickname = nick;
		});

		socket.on("currentSongRequest", () => {
			logSock(socket, "requested song");
			getCurrentSongPos(publicNS, socket.currentRoom).then(song => {
				socket.emit("currentSong", song);
			}).catch(err => socket.emit("error", err));
		});

		["play", "pause", "chatMessage", "seek"].forEach(eventName => {
			socket.on(eventName, value => {
				logSock(socket, eventName, value);
				socket.broadcast.to(socket.currentRoom).emit(eventName, value);
			});
		});

		socket.on("disconnect", () => {
			logSock(socket, "disconnected");
			socket.broadcast.to(socket.currentRoom).emit("chatQuit", socket.nickname);
		});

	});

	return {
		io,
		publicNS
	};
}
