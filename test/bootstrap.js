const fs = require('fs'),
	path = require('path'),
	puppeteer = require('puppeteer');

before (async function () {
	global.browser = await puppeteer.launch({ timeout: 10000 });
	global.page = await browser.newPage();
	await page.goto('file://' + path.resolve(__dirname, 'index.html'));
	await page.evaluate(fs.readFileSync(path.resolve(__dirname,
		'../dist/domster.js'), 'utf8'));
});

after (function () {
	browser.close();
});