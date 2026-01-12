import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs-extra';
import path from 'path';
import logger from './logger';
import { prompt } from 'enquirer';

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

export class DriveAuth {
    private client: OAuth2Client | null = null;

    public async getClient(): Promise<OAuth2Client> {
        if (this.client) return this.client;

        if (!fs.existsSync(CREDENTIALS_PATH)) {
            logger.error(`Credentials missing: ${CREDENTIALS_PATH}`);
            throw new Error('credentials.json missing');
        }

        const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
        const keys = JSON.parse(content);
        
        const key = keys.installed || keys.web;
        if (!key) {
            throw new Error('Invalid credentials structure.');
        }

        const { client_secret, client_id, redirect_uris } = key;
        
        this.client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        if (fs.existsSync(TOKEN_PATH)) {
            const token = await fs.readFile(TOKEN_PATH, 'utf-8');
            this.client.setCredentials(JSON.parse(token));
        } else {
            await this.getNewToken();
        }

        if (!this.client) throw new Error("Auth client init failed.");

        return this.client;
    }

    private async getNewToken(): Promise<void> {
        if (!this.client) throw new Error("Client not initialized");

        const authUrl = this.client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        logger.info('Action Required: Authorize App');
        logger.info(authUrl);

        try {
            const response = await prompt<{ code: string }>({
                type: 'input',
                name: 'code',
                message: 'Enter code or full redirect URL:',
            });

            let code = response.code.trim();
            if (code.startsWith('http')) {
                try {
                    const urlObj = new URL(code);
                    const extracted = urlObj.searchParams.get('code');
                    if (extracted) code = extracted;
                } catch (e) {}
            }

            const { tokens } = await this.client.getToken(code);
            this.client.setCredentials(tokens);
            
            await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
            logger.info(`Token saved.`);
        } catch (error) {
            logger.error('Token retrieval failed:', error);
            throw error;
        }
    }
}