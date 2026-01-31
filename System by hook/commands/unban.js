const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to unban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the unban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to unban members!', ephemeral: true });
    }

    try {
      const bans = await interaction.guild.bans.fetch();
      const bannedUser = bans.find(ban => ban.user.id === target.id);

      if (!bannedUser) {
        return interaction.reply({ content: '❌ That user is not banned!', ephemeral: true });
      }

      await interaction.guild.bans.remove(target.id, reason);
      await interaction.reply(`✅ Successfully unbanned ${target.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error unbanning this user!', ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('❌ You do not have permission to unban members!');
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('❌ Please mention a user to unban!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.find(ban => ban.user.id === target.id);

      if (!bannedUser) {
        return message.reply('❌ That user is not banned!');
      }

      await message.guild.bans.remove(target.id, reason);
      message.reply(`✅ Successfully unbanned ${target.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error unbanning this user!');
    }
  }
};
