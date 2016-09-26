const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const {transformObjKeys} = require("./utils");

const targetBitrate = "192k";

const base = ffmpeg()
	.noVideo()
	.audioBitrate(targetBitrate)
	.audioCodec("libmp3lame")
	.audioChannels(2)
	.addOption("-map_metadata", 0)
	.addOption("-id3v2_version", 3)
	.addOption("-write_xing", 0)
	.format("mp3");

function transcode(dir, filename) {
	const proc = base.clone();

	proc.input(dir + filename).output(path.resolve(`${__dirname}/../dist/transcoded/${filename}.mp3`));
	return {
		proc,
		promise: new Promise((resolve, reject) => {
			proc.on("error", err => {
				proc.kill();
				reject(err);
			});
			proc.on("end", (stdout, stderr) => {
				resolve();
			});
			proc.run();
		})
	}
}

function getMetadata(dir, filename) {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(dir + filename, (err, metadata) => {
			if (err) return reject(err);

			resolve({
				duration: metadata.format.duration | 0,
				bitrate: metadata.format.bit_rate | 0,
				tags: transformObjKeys(metadata.format.tags, String.prototype.toLowerCase)
			});
		});
	});
}

module.exports = {
	getMetadata,
	transcode
};
