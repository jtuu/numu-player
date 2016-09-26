const chalk = require("chalk");
const chalkColors = [
	//"black",
	"red",
	"green",
	"yellow",
	"blue",
	"magenta",
	"cyan",
	//"white",
	//"gray"
];
const STRINGS = {
	TAG_WS: chalk.magenta("WS"),
	TAG_HTTP: chalk.magenta("HTTP"),
	TAG_FFMPEG: chalk.magenta("FFMPEG"),
	JOINED: chalk.green("joined"),
	LEFT: chalk.yellow("left"),
	DISCONNECTED: chalk.red("disconnected"),
	ERROR: chalk.red("error"),
	STARTED: chalk.cyan("started"),
	SUCCEEDED: chalk.green("succeeded"),
	FAILED: chalk.red("failed")
};


function getColor(n){
  return chalkColors[n % chalkColors.length];
}

function colorize(str){
  return chalk[getColor(([...str].reduce((sum, chr) => sum + chr.charCodeAt(0) , 0) || 0))](str)
}

function rainbowize(str){
  return chalk.bold([...str].map((chr, idx) => chalk[getColor(idx)](chr)).join(""));
}

function log(msg){
	let d = new Date();
	console.log(`[${chalk.gray(d.toJSON())}]${msg}`);
}

function randomNick() {
	return `Guest#${String(Math.random()).substr(-5)}`;
}

const logPadmax = 27;

function logWs(socket, msg, ...rest) {
	if (!(rest.length && rest[0] instanceof Error)) {
		rest = JSON.stringify(rest);
	}
	const nick = socket.nick || "noname";
	const address = socket.conn.remoteAddress;
	const pad = Math.max(logPadmax - nick.length - address.length, 0);
	log(`[${STRINGS.TAG_WS}][${chalk.bold(colorize(nick))}/${colorize(address)}] ${" ".repeat(pad)}${chalk.bold(msg)} ${rest}`);
}

function logHttp(req, res, msg, ...rest){
  if (!(rest.length && rest[0] instanceof Error)) {
		rest = JSON.stringify(rest);
	}
  const address = req.connection.remoteAddress;
  const pad = Math.max(logPadmax - 1 - address.length, 0);
  log(`[${STRINGS.TAG_HTTP}][${chalk.bold(address)}] ${" ".repeat(pad)}${chalk.bold(msg)} ${rest}`)
}

function logFfmpeg(fileInfo, msg, ...rest){
	if (!(rest.length && rest[0] instanceof Error)) {
		rest = JSON.stringify(rest);
	}
	const {filename} = fileInfo;
	const pad = Math.max(logPadmax - 1 - filename.length, 0);
	log(`[${STRINGS.TAG_FFMPEG}][${chalk.bold(filename)}] ${" ".repeat(pad)}${chalk.bold(msg)} ${rest}`);
}

function getAllPropertyNames(obj) {
  var props = [];
  do {
		props = props.concat(Object.getOwnPropertyNames(obj));
  } while (obj = Object.getPrototypeOf(obj));
  return props;
}

function transformObjKeys(obj, transform){
	const keys = Object.keys(obj), newObj = {};
	var key, n = keys.length;
	while(n--){
		key = keys[n];
		newObj[transform.call(key)] = obj[key];
	}
	return newObj;
}

module.exports = {
  chalkColors,
  colorize,
  rainbowize,
  log,
  logWs,
  logHttp,
	randomNick,
	getAllPropertyNames,
	logFfmpeg,
	transformObjKeys,
	STRINGS
}
