const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You do not have permission to lock channels!', ephemeral: true });
    }

    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false
      });
      await interaction.reply('🔒 Channel has been locked!');
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error locking the channel!', ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ You do not have permission to lock channels!');
    }

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });
      message.reply('🔒 Channel has been locked!');
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error locking the channel!');
    }
  }
};
