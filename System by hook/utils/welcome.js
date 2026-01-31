const { EmbedBuilder, AuditLogEvent } = require('discord.js');

async function sendWelcome(member, config) {
  try {
    const channelId = config.welcome?.welcomeChannelId;
    if (!channelId) return;

    const channel = await member.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    if (member.user.bot) return;

    await channel.send(`${member} You are our ${member.guild.memberCount} member!`);

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setAuthor({
        name: `${member.user.username}.`,
        iconURL: member.user.displayAvatarURL({ size: 128 })
      })
      .setDescription(
        `Welcome\n\n` +
        `• Be friendly, respect everyone\n\n` +
        `• Enjoy your stay in ${member.guild.name}`
      )
      .setTimestamp();

    const imageUrl = config.welcome?.imageUrl;
    if (imageUrl) embed.setImage(imageUrl);

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Welcome message error:', error);
  }
}

async function sendJoinLeaveLog(member, config, type) {
  try {
    let channelId;

    if (type === 'join') {
      channelId = config.welcome?.joinLogChannelId;
    } else if (type === 'leave') {
      channelId = config.welcome?.leaveLogChannelId;
    }

    if (!channelId) return;

    const channel = await member.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    if (type === 'join') {
      const auditLogs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberAdd, limit: 1 });
      const log = auditLogs.entries.first();
      let inviter = null;

      if (log && log.target.id === member.user.id) {
        inviter = await member.guild.members.fetch(log.executor.id).catch(() => null);
      }

      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setAuthor({
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL({ size: 128 })
        })
        .setTitle('👋 Member Joined')
        .setDescription(`**Member:** <@${member.user.id}>\n**Account Created:** ${new Date(member.user.createdAt).toLocaleDateString()}\n**Inviter:** ${inviter ? `<@${inviter.id}>` : 'Unknown'}`)
        .addFields(
          { name: 'Total Members', value: `${member.guild.memberCount}`, inline: true },
          { name: 'User ID', value: member.user.id, inline: true }
        )
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } else if (type === 'leave') {
      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setAuthor({
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL({ size: 128 })
        })
        .setTitle('👋 Member Left')
        .setDescription(`**Member:** <@${member.user.id}>\n**Account Created:** ${new Date(member.user.createdAt).toLocaleDateString()}`)
        .addFields(
          { name: 'Total Members', value: `${member.guild.memberCount}`, inline: true },
          { name: 'User ID', value: member.user.id, inline: true }
        )
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Join/Leave log error:', error);
  }
}

module.exports = {
  sendWelcome,
  sendJoinLeaveLog
};
