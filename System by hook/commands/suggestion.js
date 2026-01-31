const { AttachmentBuilder, ChannelType } = require('discord.js');
const { renderSuggestionCard } = require('../utils/renderSuggestion');
const config = require('../config.json');

async function handleSuggestion(message) {
  try {
    if (message.author.bot) return;
    if (message.channel?.type === ChannelType.DM) return;

    const suggestionsChannelId = config.suggestions?.suggestionsChannelId;
    if (!suggestionsChannelId) return;

    if (message.channelId !== suggestionsChannelId) return;

    const content = message.content?.trim() || '';
    const suggestion = content;
    if (!suggestion) {
      await message.delete().catch(() => {});
      return;
    }

    const author = message.author;
    const username = author.globalName || author.username;
    const avatarUrl = author.displayAvatarURL({ extension: 'png', size: 256 });

    await message.delete().catch(() => {});

    const pngBuffer = await renderSuggestionCard({
      username,
      avatarUrl,
      suggestion,
      backgroundUrl: config.suggestions?.backgroundUrl || '',
      width: 1000,
      height: 400,
    });

    const attachment = new AttachmentBuilder(pngBuffer, { name: 'suggestion.png' });

    await message.channel.send({ files: [attachment] });
  } catch (err) {
    console.error('Error handling suggestion:', err);
  }
}

module.exports = { handleSuggestion };
