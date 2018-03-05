const moment = require('moment');
const config = require('./config');

const LOG_ENABLE = config.ConfigManager.getInstance().getValue(config.keys.KEY_LOG_ENABLE);
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

class LogUtil {

    static info(log) {
        if (!LOG_ENABLE) {
            return
        }
        const nowTimeStr = moment(new Date()).format(TIME_FORMAT);
        console.log(`[${nowTimeStr}] - INFO\t  ${log}`);
    }

    static error(log) {
        if (!LOG_ENABLE) {
            return
        }
        const nowTimeStr = moment(new Date()).format(TIME_FORMAT);
        console.log(`[${nowTimeStr}] - ERROR\t  ${log}`);
    }

    static tag(tag, log) {
        if (!LOG_ENABLE) {
            return
        }
        const nowTimeStr = moment(new Date()).format(TIME_FORMAT);
        console.log(`[${nowTimeStr}] - ${tag}\t  ${log}`);
    }
}

module.exports = LogUtil;