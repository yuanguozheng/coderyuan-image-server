# coderyuan-image-server

A simple image server by using Node.js!



## Features:

### Image Trasmit Service:

Parsing HTTP request's headers, according to **Accepts**, response a PNG/JPG/GIF image or WebP image (if file existed) automaticly.

#### Chrome:

![](art/chrome.png)

#### Firefox:

![](art/firefox.png)


### Image Upload Service:

The server provides a HTTP API to POST an image file with AccessToken. At the same, you can set whether or not attaching a watermark and converting to WebP format.

All the configs in the **[config.yml](config.yml)**

If you don't want to create a page to upload, you can use **cURL**, like: 
```bash
curl -F "image=@IMG_20171122_212957.jpg" http://localhost:18001/?accessToken=000
```
After uploading, server will response:
````json
{
    "status":0,
    "data":
    {
        "url":"http://localhost:18000/1520529341826.jpg"   // The full URL to fetch image.
    }
}
````


## Run:

#### 1. Clone

```bash
git clone https://github.com/yuanguozheng/coderyuan-image-server && cd coderyuan-image-server
```

#### 2. Install Dependencies

Use ```yarn``` or ```npm install```

#### 3. Start

```npm start```


If the server has been launched normally, the terminal will get:

```
[2018-03-09 00:47:01.046] - INFO	  Resolver service has been started, port: 18000
[2018-03-09 00:47:01.050] - INFO	  Uploader service has been started, port: 18001
```