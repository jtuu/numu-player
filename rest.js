const router = require("express").Router();
const multer = require("multer");
const upload = multer({
	dest: "uploads/"
});
const db = require("./db");
const transcode = require("./transcode");
const io = require("./server").socket.publicNS;

router.get("/:room/playlist", sendPlaylist);
router.post("/:room/song", upload.single("song"), handleFileUpload);

function sendPlaylist(req, res) {
	const room = req.params.room;
	if (room) {
		db.getFilesInRoom(room).then(files => {
			res.json(files);
		}).catch(err => {
			console.error(err);
			res.status(500).send();
		});
	} else {
		res.status(400).send();
	}
}

function handleFileUpload(req, res) {
	const fileInfo = req.file,
		room = req.params.room;
	if (fileInfo && room) {
		db.saveFileInfo(room, fileInfo).then(() => {
			res.status(200).send();
			const transcoder = transcode("uploads/", fileInfo.filename);
			transcoder.proc.on("progress", prog => {
				io.to(room).emit("transcodeProgress#" + fileInfo.filename, prog.percent);
			});
			return transcoder.promise;
		}).then(() => {
			io.to(room).emit("newSong", fileInfo.filename);
		}).catch(err => {
			console.error(err);
			res.status(500).send();
		});
	} else {
		res.status(400).send();
	}
}

module.exports = router;
