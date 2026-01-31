const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You do not have permission to unlock channels!', ephemeral: true });
    }

    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null
      });
      await interaction.reply('🔓 Channel has been unlocked!');
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error unlocking the channel!', ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ You do not have permission to unlock channels!');
    }

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null
      });
      message.reply('🔓 Channel has been unlocked!');
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error unlocking the channel!');
    }
  }
};
