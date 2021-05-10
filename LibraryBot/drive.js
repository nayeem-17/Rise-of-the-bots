const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
require('dotenv').config()

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const credentials = require('./credentials.json');
let token;
// Load client secrets from a local file.
const callbackMake = async(callback, params) => {
        let result;
        result = await authorize(credentials, callback, params);
        return result;
    }
    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */

const authorize = async(credentials, callback, params) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    let result;
    // Check if we have previously stored a token.
    try {
        if (fs.existsSync(TOKEN_PATH)) {
            token = require('./token.json');
            oAuth2Client.setCredentials(token);
            result = await callback(oAuth2Client, params);
            // console.log(result);
        } else {
            return getAccessToken(oAuth2Client, callback, params);
        }
    } catch (error) {
        console.log(error);
    }
    return result;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback, id) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    let result;
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            result = callback(oAuth2Client, id);
            console.log(result);
        });
    });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listFolders(auth, params) {
    const id = params.id;
    let drive = google.drive({ version: 'v3', auth });
    let files;
    await drive.files.list({
        "q": `'${id}' in parents`,
        "fields": "files(name,id,mimeType,parents,md5Checksum,size)"
    }).then(res => {
        files = res.data.files;
    }).catch(err => {
        console.log('The API returned an error: ' + err);
    });
    return files;
}

const download = async(auth, params) => {
    const { fileId, filename } = params;

    let dest = fs.createWriteStream('./resources/' + filename);
    const drive = google.drive({ version: 'v3', auth });
    let progress = 0;
    await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })
        .then(async res => {
            await res.data
                .on('end', () => {
                    console.log('Done downloading file.');
                })
                .on('error', err => {
                    console.error('Error downloading file.');
                })
                .on('data', d => {
                    progress += d.length;
                    if (process.stdout.isTTY) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Downloaded ${progress} bytes`);
                    }
                })
                .pipe(dest);
        });
    console.log('helo helo *_*');
}


exports.getList = async(id) => {
    let result;
    await callbackMake(listFolders, { id }).then(res => {
            result = res;
        })
        // console.log(result);
    return result;

}
exports.downloadPdf = async(fileId, filename) => {
        await callbackMake(download, { fileId, filename });
    }
    //    "md5Checksum": "35de1d1753261e9141fdcccc6daa6875"