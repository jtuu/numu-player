const fs = require("fs");
const router = require("express").Router();
const progressStream = require("progress-stream");
const multer = require("multer");
const uploadDir = "uploads/";
const upload = multer({
	dest: uploadDir,
	storage: multer.diskStorage({
		destination: function(req, file, cb) {
			cb(null, uploadDir);
		},
		filename: function(req, file, cb) {
			cb(null, req.fileId);
		}
	})
});
const uuid = require("node-uuid");
const db = require("./mongo");
const {
	transcode,
	getMetadata
} = require("./ffmpeg");
const playerNs = require("./index").socket.ns.player;
const {
	ACTION_TYPE,
	FILE_PROCESS_STATUS,
	FILE_STATUS
} = require("../common/constants");
const {
	logFfmpeg,
	STRINGS
} = require("./utils");

router.post("/room/:room/song", getProgress, handleFileUpload);

function getProgress(req, res, next) {
	const uploader = req.query.identity || "somebody";
	const filesize = req.get("content-length") || req.query.filesize || NaN;
	var fileProgress = null;

	var fileId = uuid.v4({
		rng: uuid.nodeRNG
	});
	req.fileId = fileId;

	playerNs.in(req.params.room).emit(ACTION_TYPE.SONG_UPLOAD_BEGIN, {
		song: {
			id: fileId,
			uploader,
			status: FILE_STATUS.UPLOADING
		}
	});

	//if we dont know the full filesize before the upload has finished
	//then we cant know the progress
	if (isFinite(filesize)) {
		fileProgress = progressStream({
			length: filesize,
			time: 1000 //progress emit interval in ms
		}, progress => {
			playerNs.in(req.params.room).emit(ACTION_TYPE.SONG_UPLOAD_PROGRESS, {
				song: {
					id: fileId,
					progress: Math.ceil(progress.percentage),
					status: FILE_STATUS.UPLOADING
				}
			});
		});

		fileProgress.fileId = fileId;
		fileProgress.headers = req.headers; //multer needs the headers
		req.pipe(fileProgress); //start measuring the progress
	}

	//pass the stream to multer
	upload.single("song")(fileProgress || req, res, err => {
		if (err) {
			playerNs.in(req.params.room).emit(ACTION_TYPE.SONG_UPLOAD_END, {
				song: {
					id: fileId
				},
				result: FILE_PROCESS_STATUS.FAILED
			});
			res.status(500).send();
			return;
		}
		req.file = req.file || fileProgress.file;
		req.file.id = req.fileId;
		req.file.uploader = uploader;
		next();
	});
}

function handleFileUpload(req, res) {
	const fileInfo = req.file,
		room = req.params.room;

	if (fileInfo && room) {
		res.status(200).send();

		getMetadata(uploadDir, fileInfo.filename).then(metadata => {
			Object.assign(fileInfo, metadata);
			playerNs.in(room).emit(ACTION_TYPE.SONG_METADATA, {
				song: fileInfo
			});
			return db.saveFileInfo(room, fileInfo);
		}).then(() => {
			playerNs.in(room).emit(ACTION_TYPE.SONG_UPLOAD_END, {
				song: {
					id: fileInfo.id,
					status: FILE_STATUS.WAITING
				},
				result: FILE_PROCESS_STATUS.SUCCESS
			});
			const transcoder = transcode(uploadDir, fileInfo.filename);
			playerNs.in(room).emit(ACTION_TYPE.SONG_TRANSCODE_BEGIN, {
				song: {
					id: fileInfo.id,
					status: FILE_STATUS.TRANSCODING
				}
			});
			transcoder.proc.on("progress", progress => {
				playerNs.in(room).emit(ACTION_TYPE.SONG_TRANSCODE_PROGRESS, {
					song: {
						id: fileInfo.id,
						progress: Math.ceil(progress.percent),
						status: FILE_STATUS.TRANSCODING
					}
				});
			});
			logFfmpeg(fileInfo, STRINGS.STARTED, fileInfo);
			return transcoder.promise;
		}).then(() => {
			logFfmpeg(fileInfo, STRINGS.SUCCEEDED);
			playerNs.in(room).emit(ACTION_TYPE.SONG_TRANSCODE_END, {
				song: {
					id: fileInfo.id,
					status: FILE_STATUS.DONE
				},
				result: FILE_PROCESS_STATUS.SUCCESS
			});

			fileInfo.progress = 100;
			fileInfo.status = FILE_STATUS.DONE;
			db.updateFileInfo(room, fileInfo);
		}).catch(err => {
			console.error(err);
			res.status(500).send();

			playerNs.in(room).emit(ACTION_TYPE.SONG_TRANSCODE_END, {
				song: {
					id: fileInfo.id
				},
				result: FILE_PROCESS_STATUS.FAILED
			});

			deleteFile(room, fileInfo.filename).then(() => logFfmpeg(fileInfo, STRINGS.FAILED, fileInfo))
				.catch(err => console.error("Error when deleting file", err));
		});
	} else {
		playerNs.in(req.params.room).emit(ACTION_TYPE.SONG_UPLOAD_END, {
			song: {
				id: fileId
			},
			result: FILE_PROCESS_STATUS.FAILED
		});
		res.status(400).send();
	}
}

function deleteFile(room, fileName) {
	return new Promise((resolve, reject) => {
		resolve(db.deleteFileInfo(room, fileName));
	}).then(() => {
		fs.unlink(`${uploadDir}/${fileName}`, err => {
			if (err) return Promise.reject(err);
			return Promise.resolve();
		});
	});
}

module.exports = router;
