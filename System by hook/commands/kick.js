const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to kick members!', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ That user is not in this server!', ephemeral: true });
    }

    if (!member.kickable) {
      return interaction.reply({ content: '❌ I cannot kick this user!', ephemeral: true });
    }

    try {
      await member.kick(reason);
      await interaction.reply(`✅ Successfully kicked ${target.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error kicking this user!', ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('❌ You do not have permission to kick members!');
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('❌ Please mention a user to kick!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return message.reply('❌ That user is not in this server!');
    }

    if (!member.kickable) {
      return message.reply('❌ I cannot kick this user!');
    }

    try {
      await member.kick(reason);
      message.reply(`✅ Successfully kicked ${target.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error kicking this user!');
    }
  }
};
