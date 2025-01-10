const fs = require('fs');
const sharp = require('sharp');
const LogUtil = require('./log');

sharp.concurrency(1);
sharp.cache(false);


function createSharp(ext) {
    const sharpInstance = sharp();
    switch (ext) {
        case '.heic':
            return sharpInstance.heif({
                compression: 'hevc',
                chromaSubsampling: '4:2:0',
            });
        case '.avif':
            return sharpInstance.avif({
                chromaSubsampling: '4:2:0',
            });
        case '.webp':
            return sharpInstance.webp({
                smartSubsample: true,
                effort: 6
            });
        default:
            return sharpInstance;
    }
}

module.exports = (targetExts, inputImagePath) => {
    const input = fs.createReadStream(inputImagePath);
    targetExts.forEach(ext => {
        const outputImagePath = inputImagePath + ext;
        const output = fs.createWriteStream(outputImagePath);  // 输出流
        input
            .pipe(createSharp(ext))
            .pipe(output)
            .on('finish', () => {
                LogUtil.info(`Converted ${inputImagePath} to ${outputImagePath}.`);
            })
            .on('error', (err) => {
                LogUtil.error(`Failed to converting ${inputImagePath} to ${outputImagePath}!`);
            })
            .on('close', () => {
                if (global.gc) {
                    global.gc();
                }
            });
        ;
    });
}