const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user in the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the mute'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to mute members!', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ That user is not in this server!', ephemeral: true });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: '❌ I cannot mute this user!', ephemeral: true });
    }

    try {
      await member.timeout(28 * 24 * 60 * 60 * 1000, reason);
      await interaction.reply(`✅ Successfully muted ${target.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error muting this user!', ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('❌ You do not have permission to mute members!');
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('❌ Please mention a user to mute!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const member = await message.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return message.reply('❌ That user is not in this server!');
    }

    if (!member.moderatable) {
      return message.reply('❌ I cannot mute this user!');
    }

    try {
      await member.timeout(28 * 24 * 60 * 60 * 1000, reason);
      message.reply(`✅ Successfully muted ${target.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error muting this user!');
    }
  }
};
