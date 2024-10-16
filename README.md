# coderyuan-image-server

A simple image server by using Node.js!

[中文文档](README_cn.md)

## Requirements

**OS**

Linux or macOS, not support Windows.

**libvips**

macOS

    brew install vips

Linux

Building from sources is suggested.
   
Please follow the documents on libvips officical site. https://www.libvips.org/install.html

Image converting will not available while libvips has not been installed or lacking some format support.

## Features

### Image Transmit Service

Parsing HTTP request's headers, according to **Accepts**, response a PNG/JPG/GIF image or WebP/HEIC/AVIF image (if file existed) automaticly.

#### Chrome

![](art/chrome.png)

#### Firefox

![](art/firefox.png)

### Safari

![](art/safari.png)

### Edge

![](art/edge.png)

### Image Upload Service

The server provides a HTTP API to POST an image file with AccessToken. At the same time, you can set whether or not attaching a watermark and converting to WebP format.

All the configs in the **[config.yml](config.yml)**

If you don't want to create a page to upload, you can use **cURL**, like: 
```bash
curl -F "image=@IMG_20171122_212957.jpg" http://localhost:18001/?accessToken=000&nomark=0   # nomark=1 if you don't want to attach water mark.
```
After uploading, server will response:
````json
{
    "status":0,
    "data":
    {
        "url":"http://localhost:18000/1520529341826.jpg"
    }
}
````
Field **URL** means the full URL for fetching image.


## Run

### 1. Clone

```bash
git clone https://github.com/yuanguozheng/coderyuan-image-server && cd coderyuan-image-server
```

### 2. Install Dependencies

Use ```yarn``` or ```npm install```

### 3. Test for codecs

`node tools/codec_test.js`

```
$ node tools/codec_test.js
Test for JPG to HEIC, AVIF and WebP conversion...
WebP converted successfully!
AVIF converted successfully!
HEIC converted successfully!
```

### 4. Start

```npm start```


If the server has been launched normally, the terminal will get:

```
[2018-03-09 00:47:01.046] - INFO	  Resolver service has been started, port: 18000
[2018-03-09 00:47:01.050] - INFO	  Uploader service has been started, port: 18001
```

After running server, you can config reverse proxy for nginx to access by your domain!

## Configurations

All supported configurations are save in `config.yml`, you can modify it to fit your needs as described in the comments.

Recommended configuration items to modify when using for the first time:

### `img_dir`

The absolute or relative path for saving or fetching images. Must be changed for your own environment.

### `access_token`

The access token for uploading images. For security reasons, you should change it to a random string.

### `watermark_path`

The path for watermark image. Need to change it to your own watermark image.

### `image_server_url_prefix`

The URL prefix for fetching images. If you are using nginx to reverse proxy, it should be the same as your domain name.

## License

MIT
