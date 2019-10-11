/**
 * See: https://github.com/intelie/puppeteer-bin
 *
 * Uses Chromium web browser to perform actions such as generate
 * a screenshot or create a pdf.
 *
 * Usage: node puppeteer-export.js --type=PORTABLE_DOCUMENT_FORMAT --source=/path/to/source.html --dest=/path/to/dest.pdf --format=A4 --width=400 --height=200
 *
 * Global puppeteerOptions:
 *
 * --type=(PORTABLE_DOCUMENT_FORMAT|IMAGE): Creates a PDF|IMAGE version from HTML file:
 *      Options:
 *          --source: {Path} HTML file to be converted to PDF.
 *          --dest  : {Path} Where the new PDF file should be saved.
 *          --format: {String} Print paper size (A0, A1, A2, A3, A4, Legal, ...)
 *                    defaults to A4 if no {width} or {height} are provided.
 *                    This option override {widht} and {height}.
 *          --width : {Number} Width of the PDF in pixels. Is overridden by {format}.
 *          --height: {Number} Height of the PDF in pixels. Is overridden by {format}.
 *          --executablePath: {Path} Path to a chromium executable.
 *
*/

var puppeteer = require('puppeteer');
var fs = require('fs');
var path = require('path');
var { promisify } = require('util');
var A4_WIDTH = {
    portrait: 794,
    landscape: 1123
}
async function checkArugments () {

    const possibleTypes = ['PORTABLE_DOCUMENT_FORMAT', 'IMAGE'];
    const args = {
        type: undefined,
        source: undefined,
        dest: undefined,
        format: undefined,
        width: undefined,
        height: undefined,
        executablePath: undefined,
        orientation: undefined
    };

    // Getting arguments
    for (const argKey of Object.keys(args)) {
        for (const argEntry of process.argv) {
            if (argEntry.startsWith(`--${argKey}`)) {
                const [key, value] = argEntry.split("=");

                args[argKey] = value;
            }
        }
    }

    if ((!args.width || !args.height) && args.format === undefined) args.format = 'A4'

    // Testing for required arguments
    if (possibleTypes.indexOf(args.type) === -1 || !args.source || !args.dest) throw 'Wrong arguments provided. Args: ' + JSON.stringify(args);

    // Testing for file access permissions
    const fileAccess = promisify(fs.access);

    if (false) {
        args.source = __dirname + '/' + args.source;
        args.dest = __dirname + '/' + args.dest;
    }

    try {
        await fileAccess(args.source);
        await fileAccess(path.dirname(args.dest));
    } catch (err) {
        console.log(err);
        throw 'The source/destination file/path does not exist or you dont have the right permissions';
    }

    return args;
}

const getDimensions = `(function(){
    const h = document.querySelector('.widget-exporter-printable-element').offsetHeight;
    const w = document.querySelector('.widget-exporter-printable-element').offsetWidth;

    return [w, h];
})()`

const getElementRealHeight = `(function(){
    function determineElementHeight (element, height) {
        var h = Math.max(element.offsetHeight, element.scrollHeight)

        if (h > height) height = h

        var arr = element.children || []
        if (element === undefined || arr.length !== 1) return height

        return determineElementHeight(element.firstElementChild, height)
    }

    var el = document.querySelector('.widget-content')

    if (!el) return null

    var scrollHolder = el.querySelector('.widget-scroll-content')

    var finalHeight = 0

    if (scrollHolder) finalHeight = Math.max(scrollHolder.offsetHeight, scrollHolder.scrollHeight)
    else finalHeight = determineElementHeight(el, 0)

    var headerHeight = document.querySelector('.widget-container').offsetHeight - el.offsetHeight

    return (finalHeight + headerHeight)
})()`

function PortableDocumentFormat(args) {
    return async function (page) {
        const [width, height] = await page.evaluate(getDimensions);
        const __height = await page.evaluate(getElementRealHeight);
        const orientation = args.orientation === 'landscape' ? 'landscape' : 'portrait'
        const paperWidth = A4_WIDTH[orientation]

        const options = {
            path: args.dest,
            width: parseFloat(width || args.width) + 10 * 2 + 'px',
            height: parseFloat(__height || height || args.height) + 16 * 2 + 'px',
            format: args.format === 'WYSIWYG' ? undefined : args.format,
            scale: (args.format === 'A4' && width > paperWidth) ? (paperWidth / width) : undefined,
            printBackground: true,
            landscape: orientation === 'landscape',
            margin: {
                top: '0.25cm',
                bottom: '0.25cm',
                left: '0.25cm',
                right: '0.25cm'
            }
        }

        console.log('Printing with options: ' + JSON.stringify(options));

        await page.pdf(options);
    }
}

function PortableNetworkGraphics(args) {
    return async function (page) {
        const [width, height] = await page.evaluate(getDimensions);
        const __height = await page.evaluate(getElementRealHeight);

        const options = {
            path: args.dest,
            type: 'png',
            omitBackground: true,
            clip: {
                x: 0,
                y: 0,
                width: parseFloat(width || args.width),
                height: parseFloat(__height || height || args.height)
            }
        }

        console.log('Printing with options: ' + JSON.stringify(options));

        await page.screenshot(options)
    }
}

async function start() {
    try {
        const args = await checkArugments();

        if (args.type === 'PORTABLE_DOCUMENT_FORMAT')
            await exportHtmlTo(args.source, PortableDocumentFormat(args), args.executablePath);
        else if (args.type === 'IMAGE')
            await exportHtmlTo(args.source, PortableNetworkGraphics(args), args.executablePath);

        process.exitCode = 0;

        return 0;

    } catch (err) {
        console.error(err);
        process.exitCode = 1;

        throw err;
    }
}

async function exportHtmlTo (source, _export, executablePath = undefined) {
    let browser = null;

    try {

        browser = await puppeteer.launch({
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--window-size=1920,1080', '--no-sandbox', '--font-render-hinting=medium'],
            executablePath: executablePath
        });

        const page = await browser.newPage();

        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto('file://' + source, { waitUntil: 'networkidle0' });
        await page.evaluate(`(function () {
            document.querySelector('body').classList.add('puppeteer-print');
        })()`);
        await _export(page);
        await browser.close();

        return 0;

    } catch (err) {
        if (browser !== null) await browser.close();

        throw err;
    }
}

start();
