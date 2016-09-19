const client = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/numu";
const ex = module.exports = {};
const {MAX_SERVER_CHAT_HISTORY} = require("../common/constants");

const conn = new Promise((res, rej) => {
	client.connect(url, (err, db) => {
		if (err) return rej(err);

		db.rooms = db.collection("rooms");
		res(db);
	});
});

ex.getState = (room) => conn.then(db => db.rooms.findAndModify({
	room
}, {}, {
	$setOnInsert: {
		room,
		state: {
			chat: {
				messages: []
			}
		}
	}
}, {
	new: true,
	upsert: true,
	fields: {
		_id: 0,
		state: 1
	}
}));

ex.saveFileInfo = (room, fileInfo) => conn.then(db => db.rooms.update({
	room
}, {
	$addToSet: {
		"state.files": fileInfo
	}
}));

ex.updateFile = (room, fileInfo) => conn.then(db => db.rooms.update({
	room,
	"state.files.filename": fileInfo.filename
}, fileInfo));

ex.deleteFileInfo = (room, fileName) => conn.then(db => db.rooms.update({
	room
}, {
	$pull: {
		"state.files": {
			filename: fileName
		}
	}
}));

ex.addChatMessage = (room, message) => conn.then(db => db.rooms.update({
	room
}, {
	$push: {
		"state.chat.messages": {
			$each: [message],
			$slice: -MAX_SERVER_CHAT_HISTORY
		}
	}
}));
