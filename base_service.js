const express = require('express');
const config = require('./config');
const LogUtil = require('./log');

class BaseService {

    constructor() {
        this.app = express();
    }

    startServer() {
        this.app.use("/", (req, res) => {
            this.handleRequest(req, res);
        });
        this.app.use((err, req, res, next) => {
            LogUtil.error(err); 
            res.status(500).send('Internal Server Error');
        });
        let hostname = config.ConfigManager.getInstance().getValue(config.keys.KEY_BIND_HOSTNAME);
        if (!hostname) {
            hostname = '0.0.0.0';
        }
        const port = this.getServerPort();
        this.app.listen(port, hostname, (err) => {
            if (err) {
                LogUtil.error(err);
            } else {
                LogUtil.info(`${this.getServiceName()} service has been started, port: ${port}`);
            }
        });
    }

    getServiceName() {
        return '';
    }

    getServerPort() {
        return 80;
    }

    /**
     * abstract method for handling express request
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     */
    handleRequest(req, res) {
    }
}

module.exports = BaseService;