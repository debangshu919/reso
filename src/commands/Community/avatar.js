const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Displays the avatar of the user")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The user to show the avatar of")
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.options.getUser("user")) {
            const avatarEmbed = new EmbedBuilder()
                .setColor(0x4dc0f9)
                .setDescription(`**${interaction.user.username}**'s avatar`)
                .setImage(
                    `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}?size=2048`
                )
                .setTimestamp();

            await interaction.reply({ embeds: [avatarEmbed] });
            return;
        }
        const user = interaction.options.getUser("user");
        const avatarEmbed = new EmbedBuilder()
            .setColor(0x4dc0f9)
            .setDescription(`**${user.username}**'s avatar`)
            .setImage(
                `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=2048`
            )
            .setTimestamp();

        await interaction.reply({ embeds: [avatarEmbed] });
    },
};
