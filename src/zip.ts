import fs from 'fs-extra';
import archiver from 'archiver';
import path from 'path';
import logger from './logger';
import moment from 'moment';

export class ArchiverService {
    public async createZip(sourcePaths: string[], compression: number): Promise<string> {
        const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
        const fileName = `backup_${timestamp}.zip`;
        const outputPath = path.join(process.cwd(), fileName);

        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', {
                zlib: { level: compression }
            });

            output.on('close', () => {
                const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
                logger.info(`Archive created: ${fileName} (${sizeMB} MB)`);
                resolve(outputPath);
            });

            archive.on('warning', (err) => {
                if (err.code === 'ENOENT') {
                    logger.warn('Archiver warning:', err);
                } else {
                    reject(err);
                }
            });

            archive.on('error', (err) => reject(err));

            archive.pipe(output);

            for (const sourcePath of sourcePaths) {
                if (!fs.existsSync(sourcePath)) {
                    logger.warn(`Skipping missing path: ${sourcePath}`);
                    continue;
                }

                const stats = fs.statSync(sourcePath);
                const baseName = path.basename(sourcePath);

                if (stats.isDirectory()) {
                    archive.directory(sourcePath, baseName);
                } else {
                    archive.file(sourcePath, { name: baseName });
                }
            }

            archive.finalize();
        });
    }
}