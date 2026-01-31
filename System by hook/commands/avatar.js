const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to get avatar from')),

  async execute(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const avatar = target.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = {
      color: 0x0099ff,
      title: `🖼️ ${target.tag}'s Avatar`,
      image: { url: avatar },
      timestamp: new Date()
    };

    await interaction.reply({ embeds: [embed] });
  },

  async executeMessage(message, args) {
    const target = message.mentions.users.first() || message.author;
    const avatar = target.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = {
      color: 0x0099ff,
      title: `🖼️ ${target.tag}'s Avatar`,
      image: { url: avatar },
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
};
