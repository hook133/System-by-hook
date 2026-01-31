const { getUserCoins, canClaimDaily, getNextDailyTime, claimDaily } = require('../utils/coins');
const config = require('../config.json');

async function executeCoins(message) {
  try {
    const userData = getUserCoins(message.author.id);
    const canClaim = canClaimDaily(message.author.id);
    const nextDaily = getNextDailyTime(message.author.id);

    const dailyStatus = canClaim ? '✅ متاحة الآن' : `⏱️ بعد ${nextDaily}`;
    
    await message.reply(`💰 **${message.author}** رصيدك الحالي: **${userData.coins.toLocaleString()}** عملة\n\n🎁 الهدية اليومية: ${dailyStatus}\n💎 قيمة الهدية: ${config.coins.dailyReward} عملة`);
  } catch (error) {
    console.error('Coins command error:', error);
    message.reply('❌ حدث خطأ في عرض محفظتك!');
  }
}

async function executeDaily(message) {
  try {
    const result = claimDaily(message.author.id);

    if (!result.success) {
      const nextDaily = getNextDailyTime(message.author.id);
      const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('⏱️ الهدية اليومية')
        .setDescription(result.message)
        .addFields(
          { name: 'الوقت المتبقي', value: nextDaily, inline: true }
        )
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('🎉 تم استلام الهدية اليومية!')
      .setDescription(`مبروك **${message.author}**! لقد استلمت هديتك اليومية.`)
      .addFields(
        { name: 'الهدية', value: `${result.coins} عملة`, inline: true },
        { name: 'رصيدك الجديد', value: `${result.total.toLocaleString()} عملة`, inline: true }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Daily command error:', error);
    message.reply('❌ حدث خطأ في استلام الهدية اليومية!');
  }
}

module.exports = {
  executeCoins,
  executeDaily
};
