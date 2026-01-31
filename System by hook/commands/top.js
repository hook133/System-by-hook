const { EmbedBuilder } = require('discord.js');
const { getTopUsers, getUserXP } = require('../utils/xp');

async function executeTop(message) {
  try {
    const topUsers = getTopUsers(message.guild.id, 10);

    if (topUsers.length === 0) {
      return message.reply('❌ لا يوجد مستخدمين في التوب بعد!');
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('🏆 التوب الكتابي - أكثر 10 متفاعلين')
      .setDescription('أكثر الأعضاء تفاعلاً في السيرفر:')
      .setTimestamp();

    let description = '';
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const member = await message.guild.members.fetch(user.userId).catch(() => null);
      const userName = member ? member.user.tag : `Unknown (${user.userId})`;
      const userMention = member ? member.toString() : `Unknown (${user.userId})`;
      
      description += `${medals[i]} **${userName}**\n`;
      description += `   المستوى: **${user.level}** | الرسائل: **${user.totalMessages}**\n`;
      description += `   ${userMention}\n\n`;
    }

    embed.setDescription(description);
    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Top command error:', error);
    message.reply('❌ حدث خطأ في عرض التوب!');
  }
}

async function executeRestartTop(message, isDeveloper) {
  if (!isDeveloper) {
    return message.reply('❌ المبرمج فقط من يستطيع إستخدام هذا الأمر!');
  }

  try {
    const { resetXP } = require('../utils/xp');
    resetXP(message.guild.id);
    
    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('🔄 تم إعادة تعيين التوب')
      .setDescription(`تم إعادة تعيين جميع بيانات XP في السيرفر **${message.guild.name}**`)
      .addFields(
        { name: 'بواسطة', value: message.author.tag, inline: true },
        { name: 'الوقت', value: new Date().toLocaleString('en-US'), inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Restart top command error:', error);
    message.reply('❌ حدث خطأ في إعادة تعيين التوب!');
  }
}

module.exports = {
  executeTop,
  executeRestartTop
};
