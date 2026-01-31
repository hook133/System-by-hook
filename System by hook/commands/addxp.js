const { EmbedBuilder } = require('discord.js');
const { addXP, getUserXP } = require('../utils/xp');

async function executeAddXP(message, args, isDeveloper) {
  if (!isDeveloper) {
    return message.reply('❌ المبرمج فقط من يستطيع إستخدام هذا الأمر!');
  }

  if (args.length < 2) {
    return message.reply('❌ الاستخدام الصحيح: +addxp @منشن عدد_الـxp أو +addxp ايدي_الشخص عدد_الـxp');
  }

  let targetUser;
  let xpAmount;

  if (message.mentions.users.size > 0) {
    targetUser = message.mentions.users.first();
    xpAmount = parseInt(args[1]);
  } else {
    const userId = args[0];
    targetUser = await message.client.users.fetch(userId).catch(() => null);
    xpAmount = parseInt(args[1]);
  }

  if (!targetUser) {
    return message.reply('❌ لم أستطع العثور على المستخدم!');
  }

  if (isNaN(xpAmount) || xpAmount <= 0) {
    return message.reply('❌ يجب أن يكون عدد الـ XP رقماً صحيحاً موجباً!');
  }

  try {
    const result = await addXP(targetUser.id, message.guild.id, xpAmount, message.client, true);
    const userData = getUserXP(targetUser.id, message.guild.id);

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('✅ تم إضافة XP بنجاح')
      .setDescription(`تم إضافة **${xpAmount}** XP للمستخدم ${targetUser}`)
      .addFields(
        { name: 'المستخدم', value: targetUser.tag, inline: true },
        { name: 'الـ XP المضاف', value: `${xpAmount}`, inline: true },
        { name: 'المستوى الحالي', value: `${userData.level}`, inline: true },
        { name: 'إجمالي الـ XP', value: `${userData.xp}`, inline: true },
        { name: 'بواسطة', value: message.author.tag, inline: true }
      )
      .setTimestamp();

    if (result.leveledUp) {
      embed.addFields({
        name: '🎊 ترقية!',
        value: `المستخدم ترقى من المستوى ${result.oldLevel} إلى المستوى ${result.newLevel}!`
      });
    }

    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Add XP command error:', error);
    message.reply('❌ حدث خطأ في إضافة الـ XP!');
  }
}

module.exports = {
  executeAddXP
};
