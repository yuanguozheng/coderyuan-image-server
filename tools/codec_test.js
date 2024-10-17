const sharp = require('sharp');

const testImage = '/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAKAAD/7gAOQWRvYmUAZMAAAAAB/9sAhAAUEBAZEhknFxcnMiYfJjIuJiYmJi4+NTU1NTU+REFBQUFBQUREREREREREREREREREREREREREREREREREREREARUZGSAcICYYGCY2JiAmNkQ2Kys2REREQjVCRERERERERERERERERERERERERERERERERERERERERERERERERET/wAARCAAKAAoDASIAAhEBAxEB/8QAYQAAAwAAAAAAAAAAAAAAAAAAAwQGAQEAAAAAAAAAAAAAAAAAAAAAEAABAQUECwAAAAAAAAAAAAABAgAREjIDMVFhE/AhcYHRUoIzQ1MUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwAKF0ULGSKAVEn6HkAAQiLLNwMT4dcV4ZvNHsqdh9nj5tuDSFKdEtonl34Nf8NOlg//2Q==';

const testImageBuffer = Buffer.from(testImage, 'base64');
console.log("Test for JPG to HEIC, AVIF and WebP conversion...");

sharp(testImageBuffer).heif({ compression: 'hevc' }).toBuffer().then(data => {
    console.log("HEIC converted successfully!");
}).catch(e => {
    console.log("Error: " + e.message);
});

sharp(testImageBuffer).avif().toBuffer().then(data => {
    console.log("AVIF converted successfully!");
}).catch(e => {
    console.log("Error: " + e.message);
});

sharp(testImageBuffer).webp().toBuffer().then(data => {
    console.log("WebP converted successfully!");
}).catch(e => {
    console.log("Error: " + e.message);
});