const { token } = require(`./config.json`);
const { Client} = require(`discord.js`);
const client = new Client({
    intents: ["Guilds", "GuildMessages", "GuildMembers", "GuildPresences"]
});
const fs = require(`fs`);
const HonBotData = require(`./HonBotStats.json`);
let HonBotStats = HonBotData;

client.once(`ready`, () => {
    console.log(`Ready!`);
    fetchHonBotStatus();
});

client.login(token);

client.on(`presenceUpdate`, (oldPresence, newPresence) => {
    if (newPresence.user.id !== "266744954922074112" || newPresence.guild.id !== "654384410396852227") return; //check for HonBot and in specific server
    if (oldPresence === null) { // Case if this bot comes online when HonBot is offline and HonBot just came online
        if (newPresence.status === "online") {
            load();
            HonBotStats.Online = true;
            HonBotStats.DowntimeSeconds += (Date.now() - HonBotStats.lastUpdate)/1000;
            HonBotStats.lastUpdate = Date.now();
            save(HonBotStats);
        }
        return;
    }
    if (oldPresence.status === "offline" && newPresence.status === "online") { //HonBot has come online
        load();
        HonBotStats.Online = true;
        HonBotStats.DowntimeSeconds += (Date.now() - HonBotStats.lastUpdate)/1000;
        HonBotStats.lastUpdate = Date.now();
        save(HonBotStats);
        return;
    }
    if (oldPresence.status === "online" && newPresence.status === "offline") { //HonBot has gone offline
        load();
        HonBotStats.Online = false;
        HonBotStats.UptimeSeconds += (Date.now() - HonBotStats.lastUpdate)/1000;
        HonBotStats.lastUpdate = Date.now();
        save(HonBotStats);
        return;
    }
});

client.on(`messageCreate`, msg => {
    if (msg.author.bot) return;
    if (!msg.member.permissions.has("Administrator")) return; //Admin only command
    if (msg.mentions.users.size === 1) {
        if (msg.mentions.users.has("1025959300335673364")) { // HDD bot ID
            load();
            if (HonBotStats.Online) { //update stats so uptime percentage is recent
                HonBotStats.UptimeSeconds += (Date.now() - HonBotStats.lastUpdate)/1000;
                HonBotStats.lastUpdate = Date.now();
                save(HonBotStats);
            }
            else { //still updating stats
                HonBotStats.DowntimeSeconds += (Date.now() - HonBotStats.lastUpdate)/1000;
                HonBotStats.lastUpdate = Date.now();
                save(HonBotStats);
            }
            let message = ``;
            if (HonBotStats.Online) {
                message = `HonBot is currently online!`
            }
            else {
                message = `HonBot is currently offline!`
            }
            msg.channel.send(`${message}\nHonBot's uptime percentage is ${(100*HonBotStats.UptimeSeconds/(HonBotStats.UptimeSeconds + HonBotStats.DowntimeSeconds)).toPrecision(4)}%!`);
        }
    }
});

function load() {
    HonBotStats = JSON.parse(fs.readFileSync(`./HonBotStats.json`));
    return;
}

function save(data) {
    fs.writeFileSync(`./HonBotStats.json`, JSON.stringify(data, null, 4));
    return;
}

function fetchHonBotStatus() {
    client.guilds.cache.get("654384410396852227").members.fetch({user: '266744954922074112', withPresences: true, force: true})
        .then(HonBot => {
            if (HonBot.presence === null) {
                load();
                HonBotStats.Online = false;
                HonBotStats.lastUpdate = Date.now();
                save(HonBotStats);
                return;
            }
            if (HonBot.presence.status === "online") {
                load();
                HonBotStats.Online = true;
                HonBotStats.lastUpdate = Date.now();
                save(HonBotStats);
                return;
            }
        })
        .catch((err) => {
            console.log(`Error in function fetchHonBotStatus:\n${err}`)
        });
    return;
}