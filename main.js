const { token } = require(`./config.json`);
const { Client} = require(`discord.js`);
const client = new Client({
    intents: ["Guilds", "GuildMessages", "GuildMembers", "GuildPresences"]
});

client.once(`ready`, () => {
    console.log(`Ready!`);
});

client.login(token);

client.on(`messageCreate`, msg => {
    if (msg.author.bot) return;
    if (!msg.member.permissions.has("Administrator")) return; //Admin only command
    if (msg.mentions.users.size != 0) {
        if (msg.mentions.users.has("1025959300335673364")) { // HDD bot ID
            msg.guild.members.fetch({user: '266744954922074112', withPresences: true, force: true}) //HonBot ID
                .then(HonBot => {
                    if (HonBot.presence == null) {
                        msg.channel.send(`HonBot seems to be offline`);
                    }
                    if (HonBot.presence?.status == "online") {
                        msg.channel.send(`HonBot appears to be online. If commands aren't working, you may be banished.`);
                    }
                })
                .catch(() => {
                    msg.channel.send(`Some Error occurred, most likely HonBot isn't in this server.`); //Super Jank but IDC
                })
        }
    }
});