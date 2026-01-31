const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to ban members!', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ That user is not in this server!', ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: '❌ I cannot ban this user!', ephemeral: true });
    }

    try {
      await member.ban({ reason });
      await interaction.reply(`✅ Successfully banned ${target.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error banning this user!', ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('❌ You do not have permission to ban members!');
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('❌ Please mention a user to ban!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return message.reply('❌ That user is not in this server!');
    }

    if (!member.bannable) {
      return message.reply('❌ I cannot ban this user!');
    }

    try {
      await member.ban({ reason });
      message.reply(`✅ Successfully banned ${target.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error banning this user!');
    }
  }
};
