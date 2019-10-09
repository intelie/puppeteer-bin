# Chromium Exporter

CLI that makes use of the [Chrome Dev Tools Protocol](https://chromedevtools.github.io/devtools-protocol/)
to export a HTML file as an image or as PDF document.

### Chromium
This tool should work with any version of Chromium above 70, [here](https://github.com/intelie/puppeteer-bin/tree/master/chrome-linux) you can find a [special](https://medium.com/@marco.luethy/running-headless-chrome-on-aws-lambda-fa82ad33a9eb)
(<b>--headless only</b>) build of Chromium 74 with a drastically decrease in bundle size (linux based systems only).

#### NodeJS Client
Makes use of the NodeJS implementation of the protocol, [Puppeteer](https://github.com/GoogleChrome/puppeteer),
to create a CLI that export a HTML file as an image or as PDF document.

##### Usage:
```
node puppeteer-export.js --type=PORTABLE_DOCUMENT_FORMAT --source=/path/to/source.html --dest=/path/to/dest.pdf --format=A4 --width=400 --height=200 --executablePath=/opt/google/chrome/chrome

--type=PORTABLE_DOCUMENT_FORMAT: {String} media type can be IMAGE or PORTABLE_DOCUMENT_FORMAT
--source=/path/to/source.html: {Path} path of HTML input file
--dest=/path/to/dest.pdf: {Path} destination file
--format=A4: {String} paper size format, PORTABLE_DOCUMENT_FORMAT only, priority over --width and --height
--width=400: {String} width of the new file, can be in: px, cm or in
--height=200: {String} height of the new file, can be in: px, cm or in
--executablePath: {Path} path pointing to a Chromium executable.
```

##### Build
One of the limitations with this client is that it requires NodeJS intalled in the machine.
You can use [pkg](https://github.com/zeit/pkg) to port a NodeJS app to MACOS, Linux or Windows.
One of the drawbacks of this approach is the bundle size (~46MB + app size itself).

Usage:

Open the terminal and type: 

```pkg wrapper.js --output=puppeteer --target=node10```

Now you have a executable called <i>puppeteer</i> that dont requires
NodeJS to work.

The new usage is:

```./puppeteer ./puppeteer-export.js --type=IMAGE --source=/path/to/source.html --dest=/path/to/dest.png --width=300px --height=200px --executablePath=/path/to/chromium```

Same as before just replace `node puppeteer-export.js` for `./puppeteer`.

##### Pack for Live
Open the terminal and type:
```./pack.sh 1.0```
It will generate a dist folder with a zip file containing all resources.


#### Golang Client
You can use https://github.com/raff/godet or https://github.com/mafredri/cdp implementations of the protocol to get rid of Puppeteer and build the same CLI in Golang thus reducing the bundle size.

#### Java Client
Ideal solution https://github.com/webfolderio/cdp4j
