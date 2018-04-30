const { expect } = require('chai');

describe('Core', function () {
	it('should be an instance', async function () {
		let result = await page.evaluate(() => $() instanceof $);
		expect(result).to.be.true;
	});

	it('should return an empty set', async function () {
		let result = await page.evaluate(() => $().set);
		expect(result).to.be.an('array');
	});

	it('should select by tag', async function () {
		let result = await page.evaluate(() => $('body').set.length);
		expect(result).to.equal(1);
	});

	it('should select by class', async function () {
		let result = await page.evaluate(() => $('.x').set.length);
		expect(result).to.equal(1);
	});
});