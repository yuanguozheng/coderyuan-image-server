class BrowserUtils {

    static isSafari(userAgent) {
        return /Safari/.test(userAgent) && /Version/.test(userAgent) && !/Chrome|Edg/.test(userAgent);
    }

    static isSupportHeic(userAgent) {
        if (/iPhone|iPad/.test(userAgent)) {
            // detect iOS Version
            const iosVersion = BrowserUtils._parseVersion(userAgent, 'OS');
            return iosVersion && parseFloat(iosVersion) >= 11;
        } else if (/Macintosh/.test(userAgent)) {
            // detect macOS Version
            const macVersion = BrowserUtils._parseVersion(userAgent, 'Mac OS X');
            return macVersion && parseFloat(macVersion) >= 10.13;
        }
        return false;
    }

    static _parseVersion(userAgent, platform) {
        const regex = new RegExp(`${platform}\\s+([\\d_\\.]+)`);
        const match = userAgent.match(regex);
        if (match && match[1]) {
            return match[1].replace(/_/g, '.');
        }
        return null;
    }
}

module.exports = BrowserUtils;