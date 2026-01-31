const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement to the channel')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The announcement message')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You do not have permission to make announcements!', ephemeral: true });
    }

    const announcement = interaction.options.getString('message');

    const embed = {
      color: 0xff0000,
      title: '📢 Announcement',
      description: announcement,
      timestamp: new Date(),
      footer: { text: `Announced by ${interaction.user.tag}` }
    };

    await interaction.reply({ content: '✅ Announcement sent!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed] });
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ You do not have permission to make announcements!');
    }

    const announcement = args.join(' ');
    if (!announcement) {
      return message.reply('❌ Please provide an announcement message!');
    }

    const embed = {
      color: 0xff0000,
      title: '📢 Announcement',
      description: announcement,
      timestamp: new Date(),
      footer: { text: `Announced by ${message.author.tag}` }
    };

    message.delete();
    message.channel.send({ embeds: [embed] });
  }
};
