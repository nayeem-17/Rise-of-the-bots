const { getList, downloadPdf } = require("./drive");
const bookFolderId = process.env.FOLDER_ID;
const path = require('path')
const fs = require('fs');
const crypto = require('crypto');
const MAX_FILE_SIZE = 52428800 //bytes

let count = 0;
let mainList = { folders: [], files: [] };

exports.menuCallback = async ctx => {

    let inline_keyboard_data = [];

    if (mainList.folders.length == 0) {
        count++;
        console.log('calling api for the ' + count + ' times!!!');
        const data = await getList(bookFolderId);
        data.map(file => {
            let temp = {};
            temp.type = 'folder';
            temp.parent = bookFolderId;
            temp.id = file.id;
            temp.name = file.name;
            mainList.folders.push(temp);
        });
        console.log(mainList.folders.pop());
    }

    mainList.folders.map(file => {

        if (file.parent == bookFolderId) {
            let temp = {};
            temp.text = file.name;
            temp.callback_data = 'folder ' + file.id;
            inline_keyboard_data.push([temp]);
        }

    });

    ctx.deleteMessage();
    ctx.telegram.sendMessage(ctx.chat.id, " *The menu of files* ", {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: inline_keyboard_data
        }
    });
}

exports.query_callback = async(ctx) => {

    const data = ctx.callbackQuery.data.split(' ');

    if (data[0] == 'folder') {
        let inline_keyboard_data = [];

        // let's check if exists in json file or not!!!
        const drive_id = data[1];
        let result = [];

        // check for folders
        mainList.folders.map(folder => {
            if (folder.parent == drive_id) {
                result.push(folder);
            }
        });
        // check for files
        mainList.files.map(file => {
            if (file.parent == drive_id) {
                result.push(file);
            }
        });

        console.log(result.length);

        if (result.length == 0) {
            count++;
            console.log('calling api for the ' + count + ' times!!!')
            const listData = await getList(data[1]);


            listData.map(file => {
                let temp = {};
                temp.type = null;
                if (file.mimeType.includes('folder')) temp.type = 'folder';
                else temp.type = 'file';
                temp.parent = data[1];
                temp.id = file.id;
                temp.hash = file.md5Checksum;
                temp.name = file.name;
                file.type = temp.type;
                if (temp.type == 'folder') {
                    mainList.folders.push(temp);
                    result.push(temp);
                } else {
                    temp.telegram_id = null;
                    if (file.size <= MAX_FILE_SIZE) {
                        mainList.files.push(temp)
                        result.push(temp);
                    } else {
                        console.log('Skipping file, filename--> ' + file.name);
                    }
                };
                return file;
            })
        }

        result.map(res => {
            let temp = {};
            temp.text = res.name;
            if (res.type == 'folder') temp.callback_data = 'folder ' + res.id;
            else temp.callback_data = 'file ' + res.id;
            inline_keyboard_data.push([temp]);

        });

        let temp = {
            text: '<< BACK TO MENU ',
            callback_data: 'menu'
        }

        inline_keyboard_data.push([temp]);
        ctx.deleteMessage();
        ctx.telegram.sendMessage(ctx.chat.id, " *The menu of files* ", {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: inline_keyboard_data
            }
        });

    } else if (data[0] == 'file') {

        await mainList.files.map(async(file) => {
            if (file.id == data[1]) {
                if (file.telegram_id != null) {
                    ctx.deleteMessage();
                    ctx.telegram.sendChatAction(ctx.chat.id, "upload_document");
                    ctx.telegram.sendDocument(ctx.chat.id, file.telegram_id)
                        .catch(err => {
                            console.log(err);
                        }).then(res => {
                            console.log('Successfully sent!!!');
                        });
                } else {
                    count++;
                    console.log('calling api for the ' + count + ' times!!!');
                    ctx.telegram.sendMessage(ctx.chat.id, 'Wait for it....')
                    await downloadPdf(file.id + '', file.name);
                    await isDownloaded(file)
                    console.log('mama *_*');
                    ctx.deleteMessage();

                    ctx.telegram.sendChatAction(ctx.chat.id, "upload_document");
                    ctx.telegram.sendDocument(ctx.chat.id, {
                        source: "resources/" + file.name,
                        filename: file.name
                    }).catch(async err => {
                        await deleteFIle(file.name);
                        console.log(err);
                    }).then(async res => {
                        file.telegram_id = res.document.file_id;
                        await deleteFIle(file.name);
                    });

                }
            }
            return file;
        });

    } else {
        ctx.telegram.sendMessage(ctx.chat.id, 'yo man! \'sup');
    }
}

const isDownloaded = async(file) => {
    let isDone = true;

    await sleep(5000);

    while (isDone) {
        fs.createReadStream('resources/' + file.name)
            .pipe(
                crypto
                .createHash('md5')
                .setEncoding('hex')
            ).on('finish', function() {
                if (file.hash == this.read())
                    isDone = false;
                console.log(this.read()) //the hash
            });
        await sleep(2000);
    }
    return true;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const deleteFIle = async(filename) => {

    const filePath = path.join('resources', filename);

    await fs.unlink(filePath, (err) => {
        if (err && err.code == 'ENOENT') {
            // file doens't exist
            console.info("File doesn't exist, won't remove it.");
        } else if (err) {
            // other errors, e.g. maybe we don't have enough permission
            console.error("Error occurred while trying to remove file");
        } else {
            console.info(`removed`);
        }
    });
}