const client = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/numu";
const ex = module.exports = {};
const {
	MAX_SERVER_CHAT_HISTORY,
	PLAYER_STATUS
} = require("../common/constants");

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
			},
			player: {
				order: [],
				songs: []
			}
		},
		date_created: new Date(),
		date_last_visited: new Date()
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
		"state.player.songs": fileInfo,
		"state.player.order": fileInfo.id
	}
}));

ex.updateFileInfo = (room, fileInfo) => conn.then(db => db.rooms.update({
	room,
	"state.player.songs.filename": fileInfo.filename
}, {
	$set: {
		"state.player.songs.$": fileInfo
	}
}));

ex.deleteFileInfo = (room, fileName) => conn.then(db => db.rooms.update({
	room
}, {
	$pull: {
		"state.player.songs": {
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

ex.playSong = (room, songId) => conn.then(db => db.rooms.update({
	room
}, {
	$set: {
		"state.player.current_song_id": songId,
		"state.player.status": PLAYER_STATUS.PLAYING,
		"state.player.current_song_start_date": new Date(),
		"state.player.current_song_offset": 0
	},
	$unset: {
		"state.player.current_song_paused_at": ""
	}
}));

ex.pausePlayer = (room) => conn.then(db => db.rooms.update({
	room
}, {
	$set: {
		"state.player.status": PLAYER_STATUS.PAUSED,
		"state.player.current_song_paused_at": new Date()
	}
}));

ex.resumePlayer = (room) => conn.then(db => db.rooms.findOne({
	room
}).then(result => {
	return db.rooms.update({
		_id: result._id
	}, {
		$set: {
			"state.player.status": PLAYER_STATUS.PLAYING
		},
		$inc: {
			"state.player.current_song_offset": result.state.player.current_song_paused_at ? new Date() - result.state.player.current_song_paused_at : 0
		},
		$unset: {
			"state.player.current_song_paused_at": ""
		}
	})
}));

ex.stopPlayer = (room) => conn.then(db => db.rooms.update({
	room
}, {
	$set: {
		"state.player.status": PLAYER_STATUS.STOPPED
	},
	$unset: {
		"state.player.current_song_id": "",
		"state.player.current_song_paused_at": "",
		"state.player.current_song_start_date": "",
		"state.player.current_song_offset": ""
	}
}));

ex.seekSong = (room, seconds) => conn.then(db => db.rooms.update({room}, {
	$set: {
		"state.player.current_song_start_date": new Date(),
		"state.player.current_song_offset": -seconds * 1000
	}
}))
