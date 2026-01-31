const { SlashCommandBuilder } = require('discord.js');
const { setReviewChannel } = require('./review');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setreviewchannel')
    .setDescription('تعيين قناة عرض التقييمات')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('القناة التي ستعرض فيها التقييمات')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ ليس لديك صلاحية استخدام هذا الأمر!', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');

    const success = setReviewChannel(interaction.guild.id, channel.id);

    if (success) {
      await interaction.reply({ content: `✅ تم تعيين قناة التقييمات: ${channel}`, ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ حدث خطأ أثناء حفظ إعدادات القناة. يرجى المحاولة مرة أخرى.', ephemeral: true });
    }
  }
};
