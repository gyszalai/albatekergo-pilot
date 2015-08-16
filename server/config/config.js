/**
 * Configuration
 * User: Gyula Szalai <gyszalai@gmail.com>
 * Date: Date: 2015-05-01
 */

var path = require('path');

rootPath = path.normalize(__dirname + '/../..');

module.exports = {
    development: {
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        appRoot: rootPath,
        dbRoot: '/home/gyszalai/tmp/albatekergo/development',
        app: {
            name: 'Albatekergő - Development'
        }
    },
    test: {
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        appRoot: rootPath,
        dbRoot: '/home/gyszalai/tmp/albatekergo/test',
        app: {
            name: 'Albatekergő - Test'
        }
    },
    production: {
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        appRoot: rootPath,
        dbRoot: '/home/gyszalai/tmp/albatekergo/production',
        app: {
            name: 'Albatekergő - Production'
        }
    }
};