/**
 * logに関する関数群
 */
const fs = require('fs');
const ini = require('ini');
const {shapDatetime} = require('../change-datetime-type/toDatetime');

// 設定ファイルの読み込み
const config = ini.parse(fs.readFileSync('../../config/config.ini', 'utf-8'));

// ログフォルダのパス
const LOG_FOLDER_PATH = config.Log.path;
// ログ1ファイルの最大サイズ
const MAX_LOG_SIZE = 1024 * 1024 * Number(config.Log.maxsize);

writeLog("test");

function writeLog(message){
    // 現在時刻を取得
    const now = new shapDatetime();
    const timestamp = now.getDateTime;
    const timestampForFileName = now.getDateTimeForFileName;
    
    // ログメッセージ
    const logmsg = `[${timestamp}] ${message}\n`;

    // ログフォルダーがなければ作成
    if(!fs.existsSync(LOG_FOLDER_PATH)){
        fs.mkdirSync(LOG_FOLDER_PATH);
    }

    // ログフォルダー内のファイルを取得
    const logFiles = fs.readdirSync(LOG_FOLDER_PATH);
    // ログフォルダー内にファイルがあれば
    if(logFiles.length > 0){
        // ログフォルダー内のファイルを日付順にソート
        logFiles.sort();
        // ログフォルダーの中で最新のファイルを取得
        const latestLogFile = logFiles[logFiles.length - 1];
        // ログフォルダーの中で最新のファイルのサイズを取得
        const latestLogFileSize = fs.statSync(`${LOG_FOLDER_PATH}/${latestLogFile}`).size;
        //　ログファイルのサイズが最大サイズを超えていたら、新しいファイルを作成
        if(latestLogFileSize > MAX_LOG_SIZE){
            fs.appendFile(`${LOG_FOLDER_PATH}/${timestampForFileName}.log`, logmsg, (err) => {
                if(err){
                    console.error("ログの書き込みに失敗しました。", err);
                }
            });
        }else{
            fs.appendFile(`${LOG_FOLDER_PATH}/${latestLogFile}`, logmsg, (err) => {
                if(err){
                    console.error("ログの書き込みに失敗しました。", err);
                }
            });
        }
    }else{
        fs.appendFile(`${LOG_FOLDER_PATH}/${timestampForFileName}.log`, logmsg, (err) => {
            if(err){
                console.error("ログの書き込みに失敗しました。", err);
            }
        });
    }
}



module.exports = {
    writeLog
}