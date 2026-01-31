const { EmbedBuilder } = require('discord.js');
const { getUserCoins, addCoins } = require('../utils/coins');

async function executeAddCoins(message, args, isDeveloper) {
  if (!isDeveloper) {
    return message.reply('❌ المبرمج فقط من يستطيع إستخدام هذا الأمر!');
  }

  if (args.length < 2) {
    return message.reply('❌ الاستخدام الصحيح: +addc @منشن عدد_العملات أو +addc ايدي_الشخص عدد_العملات');
  }

  let targetUser;
  let coinsAmount;

  if (message.mentions.users.size > 0) {
    targetUser = message.mentions.users.first();
    coinsAmount = parseInt(args[1]);
  } else {
    const userId = args[0];
    targetUser = await message.client.users.fetch(userId).catch(() => null);
    coinsAmount = parseInt(args[1]);
  }

  if (!targetUser) {
    return message.reply('❌ لم أستطع العثور على المستخدم!');
  }

  if (isNaN(coinsAmount) || coinsAmount <= 0) {
    return message.reply('❌ يجب أن يكون عدد العملات رقماً صحيحاً موجباً!');
  }

  try {
    const newBalance = addCoins(targetUser.id, coinsAmount);
    const userData = getUserCoins(targetUser.id);

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('✅ تم إضافة عملات بنجاح')
      .setDescription(`تم إضافة **${coinsAmount.toLocaleString()}** عملة للمستخدم ${targetUser}`)
      .addFields(
        { name: 'المستخدم', value: targetUser.tag, inline: true },
        { name: 'العملات المضافة', value: `${coinsAmount.toLocaleString()}`, inline: true },
        { name: 'الرصيد الجديد', value: `${newBalance.toLocaleString()} عملة`, inline: true },
        { name: 'بواسطة', value: message.author.tag, inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Add coins command error:', error);
    message.reply('❌ حدث خطأ في إضافة العملات!');
  }
}

module.exports = {
  executeAddCoins
};
