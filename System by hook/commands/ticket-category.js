const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', 'data', 'ticketSettings.json');

function loadSettings() {
  if (!fs.existsSync(settingsPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (error) {
    console.error('Error loading ticket settings:', error);
    return {};
  }
}

function saveSettings(settings) {
  const dataDir = path.dirname(settingsPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-category')
    .setDescription('تحديد فئة التيكتات')
    .addChannelOption(option =>
      option.setName('category')
        .setDescription('الفئة التي ستفتح فيها التيكتات')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const category = interaction.options.getChannel('category');
    
    const settings = loadSettings();
    if (!settings[interaction.guildId]) {
      settings[interaction.guildId] = {};
    }
    
    settings[interaction.guildId].ticketCategory = category.id;
    saveSettings(settings);
    
    await interaction.reply({
      content: `✅ تم تحديد فئة التيكتات: ${category.name}`,
      ephemeral: true
    });
  },

  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ تحتاج صلاحية إدارة القنوات لاستخدام هذا الأمر!');
    }

    const category = message.mentions.channels.first();
    if (!category || category.type !== ChannelType.GuildCategory) {
      return message.reply('❌ يرجى تحديد فئة (Category) صحيحة!\nمثال: `+ticket-category @فئة`');
    }

    const settings = loadSettings();
    if (!settings[message.guildId]) {
      settings[message.guildId] = {};
    }
    
    settings[message.guildId].ticketCategory = category.id;
    saveSettings(settings);
    
    message.reply(`✅ تم تحديد فئة التيكتات: ${category.name}`);
  }
};
