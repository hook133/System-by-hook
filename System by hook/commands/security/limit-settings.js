const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { securityData, isDeveloper, initGuildData, saveData } = require('../../utils/security');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('limit-settings')
    .setDescription('إدارة حدود العقوبات على حذف الرتب والقنوات')
    .setDefaultMemberPermissions(0)
    .addSubcommand(sub => sub
      .setName('set')
      .setDescription('تعيين حد وعقوبة لنوع معين من الإجراءات')
      .addStringOption(option => option.setName('type').setDescription('نوع الإجراء الذي تريد ضبطه').setRequired(true).addChoices(
        { name: 'حذف الاتشانلات', value: 'channelDelete' },
        { name: 'حذف الرتب', value: 'roleDelete' }
      ))
      .addIntegerOption(option => option.setName('limit').setDescription('العدد المسموح به خلال ساعة قبل تطبيق العقوبة').setRequired(true).setMinValue(1))
      .addStringOption(option => option.setName('action').setDescription('الإجراء الذي سيتم اتخاذه بعد تجاوز الحد').setRequired(true).addChoices(
        { name: 'لا شيء (إشعار فقط)', value: 'none' },
        { name: 'طرد (Kick)', value: 'kick' },
        { name: 'حظر (Ban)', value: 'ban' }
      )))
    .addSubcommand(sub => sub.setName('view').setDescription('عرض الإعدادات الحالية لحدود العقوبات')),

  async execute(interaction) {
    if (!isDeveloper(interaction.user.id)) {
      return interaction.reply({ content: '❌ هذه الأوامر للمطورين فقط.', ephemeral: true });
    }

    initGuildData(interaction.guild.id);
    const guildData = securityData.guilds[interaction.guild.id];
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      const channelSettings = guildData.limits.channelDelete;
      const roleSettings = guildData.limits.roleDelete;
      const embed = new EmbedBuilder()
        .setTitle('⚙️ الإعدادات الحالية لحدود العقوبات')
        .addFields(
          { name: 'حذف الاتشانلات والفويس', value: `الحد: **${channelSettings.limit}** | العقوبة: **${channelSettings.action}**` },
          { name: 'حذف الرتب', value: `الحد: **${roleSettings.limit}** | العقوبة: **${roleSettings.action}**` }
        )
        .setColor(0xFFFFFF)
        .setFooter({ text: 'يتم احتساب الحدود خلال الساعة الأخيرة.' });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'set') {
      const type = interaction.options.getString('type');
      const limit = interaction.options.getInteger('limit');
      const action = interaction.options.getString('action');
      guildData.limits[type] = { limit, action };
      saveData();
      await interaction.reply({
        content: `✅ تم تحديث إعدادات **${type}** بنجاح.\nالحد الجديد: **${limit}** | العقوبة الجديدة: **${action}**`,
        ephemeral: true
      });
    }
  }
};
