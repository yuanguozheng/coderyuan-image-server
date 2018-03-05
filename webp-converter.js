const CWebp = require('cwebp').CWebp;
const LogUtil = require('./log');

class WebPConverter {

    static convertToWebP(input, output) {
        const encoder = CWebp(input);
        encoder.write(output, (err) => {
            if (err) {
                LogUtil.error(err);
            }
        });
    }
}

module.exports = WebPConverter;