const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const reviewSettingsPath = path.join(__dirname, '../data/review_settings.json');

function loadReviewSettings() {
  try {
    if (!fs.existsSync(reviewSettingsPath)) {
      fs.writeFileSync(reviewSettingsPath, JSON.stringify({ reviewChannelId: null, guildSettings: {} }, null, 2));
      return { reviewChannelId: null, guildSettings: {} };
    }
    const data = fs.readFileSync(reviewSettingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading review settings:', error);
    return { reviewChannelId: null, guildSettings: {} };
  }
}

function saveReviewSettings(settings) {
  try {
    fs.writeFileSync(reviewSettingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving review settings:', error);
    return false;
  }
}

function getReviewChannel(guildId) {
  const settings = loadReviewSettings();
  return settings.guildSettings[guildId]?.reviewChannelId || settings.reviewChannelId;
}

function setReviewChannel(guildId, channelId) {
  const settings = loadReviewSettings();
  if (!settings.guildSettings[guildId]) {
    settings.guildSettings[guildId] = {};
  }
  settings.guildSettings[guildId].reviewChannelId = channelId;
  return saveReviewSettings(settings);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('إرسال رسالة التقييم')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('القناة التي سترسل فيها رسالة التقييم')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ ليس لديك صلاحية استخدام هذا الأمر!', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rate_1')
          .setLabel(config.review.starEmoji)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('rate_2')
          .setLabel(config.review.starEmoji.repeat(2))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('rate_3')
          .setLabel(config.review.starEmoji.repeat(3))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('rate_4')
          .setLabel(config.review.starEmoji.repeat(4))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('rate_5')
          .setLabel(config.review.starEmoji.repeat(5))
          .setStyle(ButtonStyle.Primary)
      );

    const embed = new EmbedBuilder()
      .setColor(0xFFFFFF)
      .setTitle('هل تم خدمتك بشكل المطلوب؟')
      .setDescription('قيم تجربتك معنا بالضغط على عدد النجوم المناسب')
      .setFooter({ text: 'نسعد بتقييمك لخدماتنا' })
      .setTimestamp();

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ تم إرسال رسالة التقييم في ${channel}`, ephemeral: true });
  }
};

module.exports.getReviewChannel = getReviewChannel;
module.exports.setReviewChannel = setReviewChannel;
