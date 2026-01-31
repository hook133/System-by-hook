const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { securityData, isDeveloper, initGuildData, createBackups, restoreRoles, restoreChannels } = require('../../utils/security');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('إدارة النسخ الاحتياطي')
    .setDefaultMemberPermissions(0)
    .addSubcommand(s => s.setName('create').setDescription('إنشاء نسخة احتياطية'))
    .addSubcommand(s => s.setName('restore').setDescription('استعادة النسخة الكاملة'))
    .addSubcommand(s => s.setName('restore-roles').setDescription('استعادة الرولات'))
    .addSubcommand(s => s.setName('restore-channels').setDescription('استعادة الاتشانلات'))
    .addSubcommand(s => s.setName('info').setDescription('معلومات النسخة الاحتياطية')),

  async execute(interaction) {
    if (!isDeveloper(interaction.user.id)) {
      return interaction.reply({ content: '❌ هذه الأوامر للمطورين فقط.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    const subcommand = interaction.options.getSubcommand();
    const guildData = securityData.guilds[interaction.guild.id];

    try {
      if (subcommand === 'create') {
        await createBackups(interaction.guild);
        await interaction.editReply('✅ تم إنشاء نسخة احتياطية جديدة بنجاح.');

      } else if (subcommand === 'restore-roles') {
        const count = await restoreRoles(interaction.guild, guildData);
        await interaction.editReply(`✅ تمت محاولة استعادة الرتب. تم إنشاء ${count} رتبة جديدة.`);

      } else if (subcommand === 'restore-channels') {
        const count = await restoreChannels(interaction.guild, guildData);
        await interaction.editReply(`✅ تمت محاولة استعادة القنوات. تم إنشاء ${count} قناة جديدة.`);

      } else if (subcommand === 'restore') {
        await interaction.editReply('⏳ جارٍ استعادة الرتب...');
        const rolesCount = await restoreRoles(interaction.guild, guildData);
        await interaction.editReply(`⏳ تم استعادة ${rolesCount} رتبة. جارٍ استعادة القنوات...`);
        const channelsCount = await restoreChannels(interaction.guild, guildData);
        await interaction.editReply(`✅ تمت محاولة الاستعادة الكاملة.\n- الرتب الجديدة: ${rolesCount}\n- القنوات الجديدة: ${channelsCount}`);

      } else if (subcommand === 'info') {
        const embed = new EmbedBuilder()
          .setTitle('ℹ️ معلومات النسخة الاحتياطية')
          .setDescription(`تحتوي النسخة الاحتياطية الحالية على:\n- **${guildData.backups.roles.length}** رتبة\n- **${guildData.backups.channels.length}** قناة`)
          .setColor(0xFFFFFF)
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error(`Backup/Restore error:`, error);
      await interaction.editReply(`❌ حدث خطأ أثناء تنفيذ الأمر: ${error.message}`);
    }
  }
};
