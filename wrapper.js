/**
 * This should work just like node: node ./jsfile-to-drive-puppeteer.js
 * 
 */

var fs_ = require('fs');
var { promisify: promisify_ } = require('util');

require('puppeteer');
require('path');

async function main() {

    try {
        const fileAccess = promisify_(fs_.access);

        await fileAccess(process.argv[2]);

        const code = fs_.readFileSync(process.argv[2], 'utf8');

        try {
            eval(code);
            return 0;
        } catch(err) {
            console.error(err, -1);

            process.exitCode = 1;
            process.exit(1);
        }

    } catch (err) {
        console.error('Input file '+ process.argv[2] +' seems not to exist!\n' + err.toString(), -1);

        process.exitCode = 1;
        process.exit(1);
    }

}

main();
