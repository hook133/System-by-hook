const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for the channel')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Slowmode duration in seconds (0 to disable)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You do not have permission to set slowmode!', ephemeral: true });
    }

    const seconds = interaction.options.getInteger('seconds');

    if (seconds < 0 || seconds > 21600) {
      return interaction.reply({ content: '❌ Slowmode must be between 0 and 21600 seconds!', ephemeral: true });
    }

    try {
      await interaction.channel.setRateLimitPerUser(seconds);
      if (seconds === 0) {
        await interaction.reply('✅ Slowmode has been disabled!');
      } else {
        await interaction.reply(`✅ Slowmode has been set to ${seconds} seconds!`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error setting slowmode!', ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ You do not have permission to set slowmode!');
    }

    const seconds = parseInt(args[0]);

    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply('❌ Slowmode must be between 0 and 21600 seconds!');
    }

    try {
      await message.channel.setRateLimitPerUser(seconds);
      if (seconds === 0) {
        message.reply('✅ Slowmode has been disabled!');
      } else {
        message.reply(`✅ Slowmode has been set to ${seconds} seconds!`);
      }
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error setting slowmode!');
    }
  }
};
