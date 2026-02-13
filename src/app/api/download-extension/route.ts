import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { Readable } from 'stream';

export async function GET() {
    try {
        // Create a ZIP archive
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Files to include in the extension
        const extensionFiles = [
            { path: 'extension/manifest.json', name: 'manifest.json' },
            { path: 'extension/content.js', name: 'content.js' },
            { path: 'extension/content.css', name: 'content.css' },
            { path: 'extension/popup.html', name: 'popup.html' },
            { path: 'extension/popup.js', name: 'popup.js' },
        ];

        // Add files to the archive
        const fs = require('fs');
        const path = require('path');

        extensionFiles.forEach(file => {
            const filePath = path.join(process.cwd(), file.path);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: file.name });
            }
        });

        // Add icons directory
        const iconsPath = path.join(process.cwd(), 'extension/icons');
        if (fs.existsSync(iconsPath)) {
            archive.directory(iconsPath, 'icons');
        }

        // Finalize the archive
        archive.finalize();

        // Convert archive to buffer
        const chunks: Buffer[] = [];
        archive.on('data', (chunk: Buffer) => chunks.push(chunk));

        await new Promise<void>((resolve, reject) => {
            archive.on('end', () => resolve());
            archive.on('error', (err: Error) => reject(err));
        });

        const buffer = Buffer.concat(chunks);

        // Return the ZIP file
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="sentinel-prime-extension.zip"',
            },
        });
    } catch (error) {
        console.error('Extension download error:', error);
        return NextResponse.json(
            { error: 'Failed to generate extension package' },
            { status: 500 }
        );
    }
}
