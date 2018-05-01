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

	it('should select by id', async function () {
		let result = await page.evaluate(() => $('#list').set.length);
		expect(result).to.equal(1);
	});

	it('should select by tag', async function () {
		let result = await page.evaluate(() => $('body').set.length);
		expect(result).to.equal(1);
	});

	it('should select by class', async function () {
		let result = await page.evaluate(() => $('.text').set.length);
		expect(result).to.equal(1);
	});

	it('should select by tag & class', async function () {
		let result = await page.evaluate(() => $('p.text').set.length);
		expect(result).to.equal(1);
	});

	it('should select in context', async function () {
		let result = await page.evaluate(() => $('li', '#list').set.length);
		expect(result).to.equal(5);
	});

	it('should create new nodes', async function () {
		let result = await page.evaluate(() =>
			$('<div>').set[0] instanceof Element);

		expect(result).to.be.true;
	});
});

describe('.get()', function () {
	it('should return the correct item', async function () {
		let result = await page.evaluate(function () {
			return $('li').get(0) === document.querySelector('li:first-child');
		});

		expect(result).to.be.true;
	});
});

describe('.size()', function () {
	it('should return the correct size', async function () {
		let result = await page.evaluate(() => $('li').size());

		expect(result).to.equal(5);
	});
});

// describe('.first()', function () {
// 	it('should return the first item', async function () {
// 		let result = await page.evaluate(function () {
// 			return $('li').first() === document.querySelector('li:first-child');
// 		});

// 		expect(result).to.be.true;
// 	});
// });

// describe('.last()', function () {
// 	it('should return the last item', async function () {
// 		let result = await page.evaluate(function () {
// 			return $('li').last() === document.querySelector('li:last-child');
// 		});

// 		expect(result).to.be.true;
// 	});
// });