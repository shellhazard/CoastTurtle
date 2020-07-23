process.env.TZ = "Pacific/Palau"

const schedule = require('node-schedule')

const utils = require("./utils.js")
const update = require("./update.js")
const config = require("../config.json");

exports = module.exports = {}

exports.initAnnouncements = function(client) {
	// Announcer events
	let events = []
	for (let e in config.events) {
		let event = config.events[e]
		// Schedule announcement
		let job = schedule.scheduleJob(
			event.rule, 
			async function(){ await exports.announce(client, event, false) }
		)
		events[event.name] = job;

		// Get the date of the next invocation
		let date = utils.subtractMinutes(job.nextInvocation(), 5)
		// Schedule preannouncement
		let jobpre = schedule.scheduleJob(
			utils.subtractMinutes(job.nextInvocation(), 5),
			async function(){ await exports.announce(client, event, true) }
		)
	}
	return events;
}

exports.announce = async function(client, event, pre) {
	let chan = await client.channels.get(config.eventChannelId)
	if (pre) { await chan.send(`The **${event.name}** will be open in **5 minutes.**`); return; }
	await chan.send(`**Can now register for the ${event.name}.**`)
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
	await chan.send(`
	__**${date}**__
	\`\`\`
	${result.trim()}
	\`\`\`
	`)
	return true;

}

