const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(`🏓 Pong!\n⏱️ Latency: ${latency}ms\n🌐 API Latency: ${apiLatency}ms`);
  },

  async executeMessage(message, args) {
    const sent = await message.reply('Pinging...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);

    sent.edit(`🏓 Pong!\n⏱️ Latency: ${latency}ms\n🌐 API Latency: ${apiLatency}ms`);
  }
};
