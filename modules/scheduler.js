process.env.TZ = "Pacific/Palau"

const schedule = require('node-schedule')

const utils = require("./utils.js")
const update = require("./update.js")
const config = require("../config.json");

exports = module.exports = {}

exports.scheduled_events = []

exports.initAnnouncements = function(client) {
	// Announcer events
	for (let e in config.events) {
		let event = config.events[e]
		// Schedule announcement
		let job = schedule.scheduleJob(
			event.rule, 
			async function(){ await exports.announce(client, event, false) }
		)
		exports.scheduled_events[event.name] = job;

		// Schedule preannouncement
		let jobpre = schedule.scheduleJob(
			utils.subtractMinutes(job.nextInvocation(), 5),
			async function(){ await exports.announce(client, event, true) }
		)
	}
	return exports.scheduled_events;
}

exports.announce = async function(client, event, pre) {
	let chan = await client.channels.get(config.eventChannelId)
	if (pre) { await chan.send(`The **${event.name}** will be open in **5 minutes.**`); return; }
	await chan.send(`**Can now register for the ${event.name}.**`)
	// Reschedule preannouncement
	exports.schedulePreAnnouncement(client, event)
}

exports.schedulePreAnnouncement = function(client, event) {
	let job = exports.scheduled_events[event.name]

	// Schedule preannouncement
	let jobpre = schedule.scheduleJob(
		utils.subtractMinutes(job.nextInvocation(), 5),
		async function(){ await exports.announce(client, event, true) }
	)
}

exports.initUpdateChecker = function(client) {
	let job = schedule.scheduleJob(
		config.updateRule, 
		async function(){ await exports.postUpdate(client) }
	)
}

exports.postUpdate = async function(client) {
	let result = await update.checkUpdate()
	if (!result) return false;
	let chan = await client.channels.get(config.updateChannelId)
	let date = ""+new Date()
	let body = `
	__**${date}**__
	
	${result.trim()}
	`
	let msgs = utils.chunkSubstr(body, 1800)
	for (let m in msgs) await chan.send(msgs[m])
	return true;
}

