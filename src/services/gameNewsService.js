import { logger } from '../utils/logger.js';

/**
 * Publishes a game news message to the configured Discord channel.
 * @param {Client} client - Discord.js client instance
 * @param {Object} payload - Game news payload
 * @param {string} payload.game - Game title (required)
 * @param {string} payload.title - News title (required)
 * @param {string} payload.message - News message (required)
 * @param {string} [payload.url] - Optional URL to include
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function publishGameNews(client, payload) {
  try {
    const gameNewsChannelId = process.env.GAME_NEWS_CHANNEL_ID;

    if (!gameNewsChannelId) {
      logger.error('GAME_NEWS_CHANNEL_ID is not configured');
      return { success: false, error: 'Channel not configured' };
    }

    // Validate and trim payload
    const game = String(payload.game ?? '').trim();
    const title = String(payload.title ?? '').trim();
    const message = String(payload.message ?? '').trim();
    const url = String(payload.url ?? '').trim();

    // Check required fields
    if (!game || !title || !message) {
      return { success: false, error: 'game, title and message are required' };
    }

    // Build Discord message
    let content = `🎮 **${game}**\n\n`;
    content += `## ${title}\n`;
    content += message;

    if (url) {
      content += `\n\n🔗 ${url}`;
    }

    // Fetch channel and send message
    const channel = await client.channels.fetch(gameNewsChannelId);

    if (!channel || typeof channel.send !== 'function') {
      logger.error('Game news channel could not be fetched or is not a text channel');
      return { success: false, error: 'Channel error' };
    }

    await channel.send(content);

    logger.info(
      `Game news published: ${game} - ${title}`,
    );

    return { success: true };
  } catch (error) {
    logger.error('Game news error:', error);
    return { success: false, error: 'Failed to publish' };
  }
}
