// Used https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3 by eslachance as a base

// Force timezone
process.env.TZ = "Pacific/Palau"

const Discord = require("discord.js");

const scheduler = require("./modules/scheduler.js");
const utils = require("./modules/utils.js");

// Load config
const config = require("./config.json");
const token = require("./token.json").token;

// Initialize bot client
const client = new Discord.Client();

const prefix = 

// Bot events
client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    console.log(""+new Date())
    client.user.setActivity(`World of Prandis`);
});

client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

client.on("message", async message => {
    // If the message was sent by the bot
    if (message.author.bot) return;
    
    const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
    const prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : '!!';

    // If the message does not include our prefix
    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    await commandHandler(prefix, message, command, args)
});

// Command handler
commandHandler = async(prefix, message, command, args) => {
    if (command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms.`);
    }
    if (command === "time") {
        let date = ""+new Date()
        await message.channel.send(`It should be ${date} for the server right now.`)
    }
    if (command === "checkupdate") {
        let didUpdate = await scheduler.postUpdate(client)
        if (didUpdate) { await message.channel.send("New update notice posted."); }
        else { await message.channel.send("No new update notice found.") }
    }
    if (command === "next" || command === "when") {
        if (!args[0]) { await message.channel.send("No event name specified."); return; }
        else {
            let name = args.join(" ").toLowerCase()
            let minutes = null;
            for (let e in scheduled_events) {
                if (e.toLowerCase().startsWith(name)) {
                    let minutes = utils.minutesUntilDate(scheduled_events[e].nextInvocation())
                    await message.channel.send(`It should be ${minutes} minutes until ${e}.`)
                    return;
                }
            }
            await message.channel.send(`No matching event found.`)
        }
    }
    /* if (command === "invite") {
        await message.channel.send('https://discordapp.com/api/oauth2/authorize?client_id=735872380370419733&permissions=8&scope=bot');
    } */
}

// Log in bot
client.login(token);

// Initialize schedulers
const scheduled_events = scheduler.initAnnouncements(client)
scheduler.initUpdateChecker(client)

