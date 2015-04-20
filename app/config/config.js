/**
 * Configuration
 * User: Gyula Szalai <gyszalai@gmail.com>
 * Date: 17/04/2015
 */

var path = require('path');

rootPath = path.normalize(__dirname + '/../..');

module.exports = {
    development: {
        appRoot: rootPath,
        db: '/home/gyszalai/tmp/albatekergo/development/trainingDays.db',
        app: {
            name: 'Albatekergő - Development'
        }
    },
    test: {
        appRoot: rootPath,
        db: '/home/gyszalai/tmp/albatekergo/test/trainingDays.db',
        app: {
            name: 'Albatekergő - Test'
        }
    },
    production: {
        appRoot: rootPath,
        db: '/home/gyszalai/tmp/albatekergo/production/trainingDays.db',
        app: {
            name: 'Albatekergő - Production'
        }
    }
}