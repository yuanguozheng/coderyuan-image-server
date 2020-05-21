const LogUtil = require('./log');
const { exec } = require('child_process');

class WebPConverter {

    /**
     * Convert image to WebP file. (without callback)
     * 
     * @param {string} input 
     * @param {string} output 
     */
    static convertToWebP(input, output) {
        exec(`cwebp "${input}" -o "${output}"`);
    }
}

module.exports = WebPConverter;