const pg = require("pg");
const config = {
	user: "admin",
	database: "numu-player",
	password: "password",
	port: 5432,
	max: 10,
	idleTimeoutMillis: 30000
};
const pool = new pg.Pool(config);
const db = {};

db.saveFileInfo = (room, fileInfo) => {
	return new Promise((resolve, reject) => {
		pool.query(`insert into files (
      room,
      filename,
      orig_filename,
      mimetype,
      bytesize
    ) values ($1, $2, $3, $4, $5)`, [
			room,
			fileInfo.filename,
			fileInfo.originalname,
			fileInfo.mimetype,
			fileInfo.size
		], (err, result) => {
			if (err) return reject(err);
			resolve(result);
		});
	});
}

db.getFilesInRoom = (room) => {
	return new Promise((resolve, reject) => {
		pool.query("select * from files where room = $1", [room], (err, result) => {
			if (err) return reject(err);
			resolve(result.rows);
		})
	})
}

module.exports = db;
