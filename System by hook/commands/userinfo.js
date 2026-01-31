const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to get info about')),

  async execute(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    const embed = {
      color: 0x0099ff,
      title: `👤 User Info: ${target.tag}`,
      thumbnail: { url: target.displayAvatarURL({ dynamic: true }) },
      fields: [
        { name: '🆔 ID', value: target.id, inline: true },
        { name: '📅 Created At', value: target.createdAt.toLocaleDateString(), inline: true },
        { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true }
      ],
      timestamp: new Date()
    };

    if (member) {
      embed.fields.push(
        { name: '🎭 Joined At', value: member.joinedAt.toLocaleDateString(), inline: true },
        { name: '📜 Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false },
        { name: '⏱️ Account Age', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
      );
    }

    await interaction.reply({ embeds: [embed] });
  },

  async executeMessage(message, args) {
    const target = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(target.id).catch(() => null);

    const embed = {
      color: 0x0099ff,
      title: `👤 User Info: ${target.tag}`,
      thumbnail: { url: target.displayAvatarURL({ dynamic: true }) },
      fields: [
        { name: '🆔 ID', value: target.id, inline: true },
        { name: '📅 Created At', value: target.createdAt.toLocaleDateString(), inline: true },
        { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true }
      ],
      timestamp: new Date()
    };

    if (member) {
      embed.fields.push(
        { name: '🎭 Joined At', value: member.joinedAt.toLocaleDateString(), inline: true },
        { name: '📜 Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false },
        { name: '⏱️ Account Age', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
      );
    }

    message.reply({ embeds: [embed] });
  }
};
