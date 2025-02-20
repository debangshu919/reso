const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
function convertTime(ms, formatted = false) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (formatted) {
        return hours > 0
            ? `${hours}h ${minutes}m ${seconds}s`
            : `${minutes}m ${seconds}s`;
    }
    return { hours, minutes, seconds };
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song')
        .addStringOption(option => option
            .setName('search')
            .setDescription('The song to play')
            .setRequired(true)
        ),

    async execute(interaction, client) {
        try {
            const search = interaction.options.getString('search');
            const { channel } = interaction.member.voice;

            if (!channel) {
                return interaction.reply({
                    content: `**You need to be in a voice channel to use this command!**`,
                    flags: MessageFlags.ephemeral
                })
            };

            if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Connect)) {
                return interaction.reply({
                    content: `**I don't have permission to join your voice channel!**`,
                    flags: MessageFlags.ephemeral
                });
            };
            await interaction.deferReply();

            const player = await client.manager.createPlayer({
                guildId: interaction.guild.id,
                voiceId: channel.id,
                textId: interaction.channel.id,
                volume: 100,
                deaf: true,
            });

            const res = await player.search(search, { requester: interaction.user });

            if (!res.tracks.length) {
                return interaction.editReply(`No results found!`);
            }

            if (res.type === "PLAYLIST") {
                for (let track of res.tracks) {
                    player.queue.add(track);
                }
                if (!player.playing && !player.paused) {
                    player.play();
                }

                const embed = new EmbedBuilder()
                    .setColor("#FED0FF")
                    .setTitle("🎵 Playlist Added")
                    .setDescription(`**[${res.playlistName}](${search})**\n\n**Tracks Queued:** **${res.tracks.length}**\n**Total Duration:** \`${convertTime(res.tracks[0].length + player.queue.durationLength, true)}\``)
                    .setFooter({ text: "Enjoy your music! 🎧" });

                return interaction.editReply({ content: '', embeds: [embed] });

            } else {
                player.queue.add(res.tracks[0]);
                if (!player.playing && !player.paused) {
                    player.play();
                }

                const embed = new EmbedBuilder()
                    .setColor("#FED0FF")
                    .setTitle("🎵 Song Added")
                    .setDescription(`**[${res.tracks[0].title}](${res.tracks[0].uri})**\n\n**Duration:** \`${convertTime(res.tracks[0].length, true)}\``)
                    .setThumbnail(`${res.tracks[0].thumbnail}`)
                    .setFooter({ text: "Playing now!" })
                    .setTimestamp();

                return interaction.editReply({ content: '', embeds: [embed] });

            }

        } catch (error) {
            console.error(error);
            return interaction.editReply(`**An error occurred while trying to play the song!**`);
        }
    }
}