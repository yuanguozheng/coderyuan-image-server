# coderyuan-image-server

一个使用 Node.js 开发的图片服务器！可以根据浏览器的不同，实现同一个 URL，返回 WebP/AVIF 格式或者 PNG/JPG/GIF格式的图片数据！

[English](README.md)

## 环境要求:

**操作系统**: Linux 或 macOS，暂不支持 Windows.

**libvips**:

macOS：

    brew install vips

Linux：
   
建议使用源码的方式进行安装。
   
请根据 libvips 官方的文档进行操作：https://www.libvips.org/install.html

如果 libvips 没有正确安装或缺少 HEIC、AVIF 格式的支持，将无法进行图片转换！

## 功能:

### 图片传输服务：

coderyuan-image-server 会解析 HTTP 请求头中的**accepts**字段, 根据是否有**image/webp**这项，来自动决定返回 PNG/JPG/GIF 格式的图片流数据，还是返回体积非常小的 WebP/AVIF 格式图片数据（前提是指定的目录中存在 WebP/AVIF 格式图片）。

#### Chrome浏览器中的效果:

![](art/chrome.png)

#### Firefox浏览器中的效果:

![](art/firefox.png)

### Safari:

![](art/safari.png)

### Edge:

![](art/edge.png)

### 图片上传服务：

coderyuan-image-server 提供带 AccessToken 的图片上传服务，支持将你提交的符合配置要求的图片，存入指定的服务器目录。同时，你也可以根据参数，指定是否添加你指定的水印图片、是否自动转换成 WebP 格式。

所有的配置，都保存在 **[config.yml](config.yml)** 文件中

你可以写个提交页面来上传图片，或者是使用 **cURL** 命令，示例： 
```bash
curl -F "image=@IMG_20171122_212957.jpg" http://localhost:18001/?accessToken=000&nomark=0   # 设置nomark=1（默认0）代表不添加水印
```
上传完成后，服务器会根据你配置的host，返回图片的访问链接：
````json
{
    "status":0,
    "data":
    {
        "url":"http://localhost:18000/1520529341826.jpg"
    }
}
````

## 运行方法:

#### 1. Clone

```bash
git clone https://github.com/yuanguozheng/coderyuan-image-server && cd coderyuan-image-server
```

#### 2. 安装全局的 Node.js 依赖

```bash
npm i -g node-addon-api node-gyp
```

#### 3. 安装依赖

可以使用 ```yarn``` 或 ```npm install```

#### 4. 运行

```npm start``` 或者使用 ```forever start app.js``` 来使用守护进程运行


如果运行正常，终端将输出：

```
[2018-03-09 00:47:01.046] - INFO	  Resolver service has been started, port: 18000
[2018-03-09 00:47:01.050] - INFO	  Uploader service has been started, port: 18001
```

运行起来以后，配置一下 nginx 做反向代理，就可以正常访问了！