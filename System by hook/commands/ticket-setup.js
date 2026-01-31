const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('إعداد نظام التذاكر')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('القناة التي سيتم إرسال رسالة التذاكر فيها')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('عنوان رسالة التذاكر')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('وصف رسالة التذاكر')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('لون الإمبيد (hex code)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color') || '#0099ff';

    const now = Math.floor(Date.now() / 1000);

    const embed = new EmbedBuilder()
      .setAuthor({ 
        name: interaction.guild.name, 
        iconURL: interaction.guild.iconURL() 
      })
      .setTitle(title)
      .setDescription(`${description}\n\n> <t:${now}:f>`)
      .setColor(color)
      .setThumbnail(interaction.guild.iconURL({ size: 128 }));

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('🎫 إنشاء تيكت')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    try {
      await channel.send({
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({
        content: `✅ تم إعداد نظام التذاكر في ${channel} بنجاح!`,
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ حدث خطأ أثناء إعداد النظام!',
        ephemeral: true
      });
    }
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ تحتاج صلاحية إدارة القنوات لاستخدام هذا الأمر!');
    }

    const channel = message.mentions.channels.first() || message.channel;
    const title = args[0];
    const description = args.slice(1).join(' ');

    if (!title || !description) {
      return message.reply('❌ يرجى تحديد العنوان والوصف!\nمثال: `+ticket-setup #قناة العنوان الوصف`');
    }

    const now = Math.floor(Date.now() / 1000);

    const embed = new EmbedBuilder()
      .setAuthor({ 
        name: message.guild.name, 
        iconURL: message.guild.iconURL() 
      })
      .setTitle(title)
      .setDescription(`${description}\n\n> <t:${now}:f>`)
      .setColor(0xFFFFFF)
      .setThumbnail(message.guild.iconURL({ size: 128 }));

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('🎫 إنشاء تيكت')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    try {
      await channel.send({
        embeds: [embed],
        components: [row]
      });

      message.reply(`✅ تم إعداد نظام التذاكر في ${channel} بنجاح!`);
    } catch (error) {
      console.error(error);
      message.reply('❌ حدث خطأ أثناء إعداد النظام!');
    }
  }
};
