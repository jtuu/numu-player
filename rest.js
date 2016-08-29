const fs = require("fs");
const router = require("express").Router();
const multer = require("multer");
const uploadDir = "uploads/";
const upload = multer({
	dest: uploadDir
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
		let id = null;
		db.saveFileInfo(room, fileInfo).then(newId => {
			res.status(200).send();
			id = newId;
			const transcoder = transcode(uploadDir, fileInfo.filename);
			transcoder.proc.on("progress", prog => {
				io.to(room).emit("transcodeProgress#" + fileInfo.filename, prog.percent);
			});
			return transcoder.promise;
		}).then(() => {
			io.to(room).emit("newSong", fileInfo.filename);
		}).catch(err => {
			console.error(err);
			res.status(500).send();
			if (id) {
				deleteFile(id).then(() => console.log("transcoding failed, file deleted"))
					.catch(err => "transcoding failed, error when deleting file", err);
			}
		});
	} else {
		res.status(400).send();
	}
}

function deleteFile(id) {
	return new Promise((resolve, reject) => {
		db.deleteFileInfo(id).then(filename => {
			fs.unlink(`${uploadDir}/${filename}`, err => {
				if (err) return reject(err);
				resolve();
			});
		}).catch(err => reject(err));
	});
}

module.exports = router;
