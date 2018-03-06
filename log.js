const moment = require('moment');
const config = require('./config');

const LOG_ENABLE = config.ConfigManager.getInstance().getValue(config.keys.KEY_LOG_ENABLE);
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

/**
 * An util for print formatted log. (like Log on Java)
 */
class LogUtil {

    /**
     * Print info-level log.
     * 
     * @param {*} log 
     */
    static info(log) {
        if (!LOG_ENABLE) {
            return
        }
        const nowTimeStr = moment(new Date()).format(TIME_FORMAT);
        console.log(`[${nowTimeStr}] - INFO\t  ${log}`);
    }

    /**
     * Print error-level log.
     * 
     * @param {*} log 
     */
    static error(log) {
        if (!LOG_ENABLE) {
            return
        }
        const nowTimeStr = moment(new Date()).format(TIME_FORMAT);
        console.log(`[${nowTimeStr}] - ERROR\t  ${log}`);
    }

    /**
     * Print custom tag log.
     * 
     * @param {string} tag Your custom tag
     * @param {*} log 
     */
    static tag(tag, log) {
        if (!LOG_ENABLE) {
            return
        }
        const nowTimeStr = moment(new Date()).format(TIME_FORMAT);
        console.log(`[${nowTimeStr}] - ${tag}\t  ${log}`);
    }
}

module.exports = LogUtil;