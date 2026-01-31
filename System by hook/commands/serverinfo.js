const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about the server'),

  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    
    const embed = {
      color: 0x0099ff,
      title: `🏠 Server Info: ${guild.name}`,
      thumbnail: { url: guild.iconURL({ dynamic: true }) },
      fields: [
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Owner', value: owner.user.tag, inline: true },
        { name: '📅 Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🌍 Region', value: guild.preferredLocale, inline: true },
        { name: '🛡️ Verification Level', value: guild.verificationLevel, inline: true }
      ],
      timestamp: new Date()
    };

    await interaction.reply({ embeds: [embed] });
  },

  async executeMessage(message, args) {
    const guild = message.guild;
    const owner = await guild.fetchOwner();
    
    const embed = {
      color: 0x0099ff,
      title: `🏠 Server Info: ${guild.name}`,
      thumbnail: { url: guild.iconURL({ dynamic: true }) },
      fields: [
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Owner', value: owner.user.tag, inline: true },
        { name: '📅 Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🌍 Region', value: guild.preferredLocale, inline: true },
        { name: '🛡️ Verification Level', value: guild.verificationLevel, inline: true }
      ],
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
};
