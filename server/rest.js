const fs = require("fs");
const router = require("express").Router();
const multer = require("multer");
const uploadDir = "uploads/";
const upload = multer({
	dest: uploadDir
});
const db = require("./mongo");
const transcode = require("./transcode");
const io = require("./index").socket.publicNS;

router.post("/:room/song", upload.single("song"), handleFileUpload);

function handleFileUpload(req, res){
	const fileInfo = req.file,
		room = req.params.room;

	if(fileInfo && room){
		db.saveFileInfo(room, fileInfo).then(() => {
			res.status(200).send();

			const transcoder = transcode(uploadDir, fileInfo.filename);
			transcoder.proc.on("progress", prog => {
				io.in(room).emit("transcodeProgress#" + fileInfo.filename, prog.percent);
			});
			console.log("transcoding started", fileInfo);
			return transcoder.promise;
		}).then(() => {
			console.log("transcoding succeeded", fileInfo);
			io.in(room).emit("newSong", fileInfo);
		}).catch(err => {
			console.error(err);
			res.status(500).send();

			deleteFile(room, fileInfo.filename).then(() => console.log("transcoding failed, file deleted"))
				.catch(err => "transcoding failed, error when deleting file", err);
		});
	}else{
		res.status(400).send();
	}
}

function deleteFile(room, fileName) {
	return new Promise((resolve, reject) => {
		return db.deleteFileInfo(room, fileName);
	}).then(() => {
		fs.unlink(`${uploadDir}/${fileName}`, err => {
			if (err) return Promise.reject(err);
			return Promise.resolve();
		});
	});
}

module.exports = router;
