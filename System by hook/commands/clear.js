const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a specified number of messages')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You do not have permission to delete messages!', ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ Please provide a number between 1 and 100!', ephemeral: true });
    }

    try {
      await interaction.channel.bulkDelete(amount, true);
      await interaction.reply(`✅ Successfully deleted ${amount} messages!`);
      setTimeout(() => interaction.deleteReply(), 3000);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error deleting messages!', ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ You do not have permission to delete messages!');
    }

    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❌ Please provide a number between 1 and 100!');
    }

    try {
      await message.channel.bulkDelete(amount, true);
      message.reply(`✅ Successfully deleted ${amount} messages!`).then(msg => {
        setTimeout(() => msg.delete(), 3000);
      });
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error deleting messages!');
    }
  }
};
