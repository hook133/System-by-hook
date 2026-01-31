const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands'),

  async execute(interaction) {
    const helpEmbed = {
      color: 0x0099ff,
      title: '🤖 Bot Commands',
      description: 'Here are all available commands:',
      fields: [
        { name: '🔒 Moderation', value: '`/ban`, `/unban`, `/kick`, `/mute`, `/unmute`' },
        { name: '🔐 Channel Management', value: '`/lock`, `/unlock`, `/slowmode`' },
        { name: '🧹 Utilities', value: '`/clear`, `/ping`, `/help`, `/userinfo`' },
        { name: 'ℹ️ Prefix Commands', value: 'Use `+` prefix: `+ban`, `+kick`, `+lock`, `+unlock`, `+clear`, `+ping`, `+help`' }
      ],
      timestamp: new Date(),
      footer: { text: 'Use /help for more info' }
    };

    await interaction.reply({ embeds: [helpEmbed] });
  },

  async executeMessage(message, args) {
    const helpEmbed = {
      color: 0x0099ff,
      title: '🤖 Bot Commands',
      description: 'Here are all available commands:',
      fields: [
        { name: '🔒 Moderation', value: '`+ban`, `+unban`, `+kick`, `+mute`, `+unmute`' },
        { name: '🔐 Channel Management', value: '`+lock`, `+unlock`, `+slowmode`' },
        { name: '🧹 Utilities', value: '`+clear`, `+ping`, `+help`, `+userinfo`' },
        { name: 'ℹ️ Usage', value: 'Example: `+ban @user reason`' }
      ],
      timestamp: new Date(),
      footer: { text: 'Prefix: +' }
    };

    message.reply({ embeds: [helpEmbed] });
  }
};
