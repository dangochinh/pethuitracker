import { Firestore } from '@google-cloud/firestore';
import path from 'path';
import fs from 'fs';

let firestoreInstance = null;

function parseCredentials() {
    let credentials;
    const raw = process.env.GOOGLE_CREDENTIALS;

    if (raw) {
        try {
            credentials = JSON.parse(raw);
            if (typeof credentials === 'string') credentials = JSON.parse(credentials);
        } catch (e) {
            const emailMatch = raw.match(/"client_email"\s*:\s*(?:\\")?"([^\\"]+)(?:\\")?"/);
            const keyMatch = raw.match(/"private_key"\s*:\s*(?:\\")?"([^"]+)(?:\\")?"/);
            const projMatch = raw.match(/"project_id"\s*:\s*(?:\\")?"([^\\"]+)(?:\\")?"/);

            if (emailMatch && keyMatch) {
                credentials = {
                    project_id: projMatch ? projMatch[1] : 'vietlotrawdata',
                    client_email: emailMatch[1],
                    private_key: keyMatch[1].replace(/\\n/g, '\n')
                };
            }
        }
    }

    if (!credentials) {
        // Local file fallback
        const possiblePaths = [
            path.join(process.cwd(), '../VietlottDashboard/scraper/credentials.json'),
            path.join(process.cwd(), 'credentials.json'),
            path.join(process.cwd(), '../scraper/credentials.json'),
        ];
        const found = possiblePaths.find(p => fs.existsSync(p));
        if (found) {
            credentials = JSON.parse(fs.readFileSync(found, 'utf8'));
        }
    }

    if (!credentials) {
        throw new Error('No Google Credentials found in environment or local file.');
    }

    return credentials;
}

export function getFirestore() {
    if (!firestoreInstance) {
        const creds = parseCredentials();
        firestoreInstance = new Firestore({
            projectId: creds.project_id || 'vietlotrawdata',
            credentials: {
                client_email: creds.client_email,
                private_key: creds.private_key,
            },
        });
    }
    return firestoreInstance;
}

export default getFirestore;
