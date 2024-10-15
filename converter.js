const fs = require('fs');
const sharp = require('sharp');
const LogUtil = require('./log');
const { GCProfiler } = require('v8');

sharp.concurrency(1);
sharp.cache(false);


function createSharp(ext) {
    const sharpInstance = sharp();
    switch (ext) {
        case '.heic':
            return sharpInstance.heif({
                compression: 'hevc'
            });
        case '.avif':
            return sharpInstance.avif();
        case '.webp':
            return sharpInstance.webp();
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
                LogUtil.info(`转换 ${inputImagePath} 为 ${outputImagePath}`);
            })
            .on('error', (err) => {
                LogUtil.error(`转换 ${inputImagePath} 为 ${outputImagePath} 失败`);
            })
            .on('close', () => {
                if (global.gc) {
                    global.gc();
                }
            });
        ;
    });
}