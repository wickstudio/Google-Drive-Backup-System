import axios from 'axios';
import { config } from './config';
import logger from './logger';

export class DiscordService {
    private webhookUrl: string | undefined;

    constructor() {
        this.webhookUrl = config.discordWebhookUrl;
    }

    public async send(title: string, description: string, color: 'success' | 'error' | 'info'): Promise<void> {
        if (!this.webhookUrl || this.webhookUrl.trim() === "") return;

        const colorMap = {
            success: 0x00FF00, // Green
            error: 0xFF0000,   // Red
            info: 0x0099FF,    // Blue
        };

        const payload = {
            embeds: [{
                title: title,
                description: description,
                color: colorMap[color],
                footer: {
                    text: 'Wick Backup System',
                },
                timestamp: new Date().toISOString(),
            }]
        };

        try {
            await axios.post(this.webhookUrl, payload);
            logger.debug('Discord notification sent.');
        } catch (error) {
            logger.warn('Failed to send Discord notification:', error);
        }
    }
}