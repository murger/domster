const fs = require('fs'),
	path = require('path'),
	pti = require('puppeteer-to-istanbul'),
	puppeteer = require('puppeteer');

before (async function () {
	global.browser = await puppeteer.launch({ timeout: 10000 });
	global.page = await browser.newPage();
	await Promise.all([page.coverage.startJSCoverage()]);
	await page.goto('file:' + path.resolve(__dirname, 'index.html'));
	await page.addScriptTag({ path: 'src/core.js' });
});

after (async function () {
	const [coverage] = await Promise.all([page.coverage.stopJSCoverage()]);
	browser.close();
	pti.write(coverage);

	// Sanitise paths
	let out = '.nyc_output/out.json';
	fs.readFile(out, 'utf8', function (err, data) {
		if (err) return console.log(err);
		var result = data.replace(/\.nyc_output\/js/g, 'src');
		fs.writeFile(out, result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});
});