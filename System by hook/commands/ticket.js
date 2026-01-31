const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

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

async function createTicket(interaction) {
  const guild = interaction.guild;
  const member = interaction.member;
  
  const settings = loadSettings();
  const serverSettings = settings[guild.id] || {};
  const categoryId = serverSettings.ticketCategory;
  
  const ticketNumber = Math.floor(Math.random() * 10000);
  const channelName = `ticket-${ticketNumber}`;

  const existingTicket = guild.channels.cache.find(
    channel => channel.name.startsWith('ticket-') && 
    channel.topic && channel.topic.includes(member.id)
  );

  if (existingTicket) {
    return interaction.reply({
      content: `❌ لديك تيكت مفتوح بالفعل: ${existingTicket}`,
      ephemeral: true
    });
  }

  try {
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId,
      topic: `تيكت للعضو: ${member.user.tag} (${member.id})`,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: member.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels
          ]
        }
      ]
    });

    const now = Math.floor(Date.now() / 1000);
    const ticketRoleId = config.tickets?.ticketRoleId;
    const roleMention = ticketRoleId ? `<@&${ticketRoleId}>` : '';

    const welcomeEmbed = new EmbedBuilder()
      .setAuthor({ 
        name: guild.name, 
        iconURL: guild.iconURL() 
      })
      .setTitle(`🎫 تيكت رقم: ${ticketNumber}`)
      .setDescription(
        `تم إنشاء تيكتك بنجاح. سيتم الرد عليك في أقرب وقت ممكن.\n\n` +
        `> <t:${now}:f>`
      )
      .setColor(0xFFFFFF)
      .setThumbnail(member.user.displayAvatarURL({ size: 128 }));

    const claimButton = new ButtonBuilder()
      .setCustomId('claim_ticket')
      .setLabel('✅ استلام التذكرة')
      .setStyle(ButtonStyle.Primary);

    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('🗑️ إغلاق التيكت')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

    await ticketChannel.send(`${member} - ${roleMention}`);
    await ticketChannel.send({
      embeds: [welcomeEmbed],
      components: [row]
    });

    await interaction.reply({
      content: `✅ تم إنشاء تيكتك: ${ticketChannel}`,
      ephemeral: true
    });

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ حدث خطأ أثناء إنشاء التيكت!',
      ephemeral: true
    });
  }
}

async function claimTicket(interaction) {
  const channel = interaction.channel;
  const member = interaction.member;
  
  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({
      content: '❌ هذا الأمر يعمل فقط في قنوات التيكتات!',
      ephemeral: true
    });
  }

  const ticketRoleId = config.tickets?.ticketRoleId;
  if (ticketRoleId && !member.roles.cache.has(ticketRoleId)) {
    return interaction.reply({
      content: '❌ ليس لديك الصلاحية لاستلام التذاكر!',
      ephemeral: true
    });
  }

  if (channel.topic && channel.topic.includes('Claimed by:')) {
    return interaction.reply({
      content: '❌ هذه التذكرة تم استلامها بالفعل!',
      ephemeral: true
    });
  }

  try {
    await channel.setTopic(`${channel.topic} | Claimed by: ${member.user.id}`);

    const claimEmbed = new EmbedBuilder()
      .setAuthor({ 
        name: channel.guild.name, 
        iconURL: channel.guild.iconURL() 
      })
      .setTitle('✅ تم استلام التذكرة')
      .setDescription(`تم استلام التذكرة بواسطة ${member}`)
      .setColor(0xFFFFFF)
      .setTimestamp();

    await interaction.reply({
      embeds: [claimEmbed]
    });

    if (ticketRoleId) {
      await channel.send(`<@&${ticketRoleId}>`);
    }

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ حدث خطأ أثناء استلام التذكرة!',
      ephemeral: true
    });
  }
}

async function closeTicket(interaction) {
  const channel = interaction.channel;
  const member = interaction.member;
  
  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({
      content: '❌ هذا الأمر يعمل فقط في قنوات التيكتات!',
      ephemeral: true
    });
  }

  if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    if (!channel.topic || !channel.topic.includes(member.id)) {
      return interaction.reply({
        content: '❌ يمكنك فقط إغلاق التيكتات الخاصة بك أو تحتاج صلاحية إدارة القنوات!',
        ephemeral: true
      });
    }
  }

  try {
    const closeEmbed = new EmbedBuilder()
      .setTitle('🗑️ إغلاق التيكت')
      .setDescription('سيتم حذف هذا التيكت خلال 5 ثوانٍ...')
      .setColor(0xFFFFFF);

    await interaction.reply({
      embeds: [closeEmbed]
    });

    const ticketLogChannelId = config.tickets?.ticketLogChannelId;
    if (ticketLogChannelId) {
      const logChannel = await channel.guild.channels.fetch(ticketLogChannelId).catch(() => null);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setAuthor({ 
            name: channel.guild.name, 
            iconURL: channel.guild.iconURL() 
          })
          .setTitle('🗑️ تم إغلاق تيكت')
          .addFields(
            { name: '📌 القناة', value: channel.name, inline: true },
            { name: '👤 تم الإغلاق بواسطة', value: member.user.tag, inline: true },
            { name: '📅 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setColor(0xFFFFFF)
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }
    }

    setTimeout(async () => {
      try {
        await channel.delete('تم إغلاق التيكت');
      } catch (error) {
        console.error('خطأ في حذف التيكت:', error);
      }
    }, 5000);

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ حدث خطأ أثناء إغلاق التيكت!',
      ephemeral: true
    });
  }
}

module.exports = {
  createTicket,
  claimTicket,
  closeTicket
};
