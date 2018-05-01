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
	it('should return a specific node in a set', async function () {
		let result = await page.evaluate(function () {
			return $('li').get(0) === document.querySelector('li:first-child');
		});

		expect(result).to.be.true;
	});
});

describe('.size()', function () {
	it('should return the count of a set', async function () {
		let result = await page.evaluate(() => $('li').size());

		expect(result).to.equal(5);
	});
});

describe('.is()', function () {
	it('should return true if there is a set', async function () {
		let result = await page.evaluate(function () {
			return $('span').is();
		});

		expect(result).to.be.true;
	});

	it('should return false if there is no set', async function () {
		let result = await page.evaluate(function () {
			return $('template').is();
		});

		expect(result).to.be.false;
	});

	it('should return true if a set match the query', async function () {
		let result = await page.evaluate(function () {
			return $('span').is('.ticket');
		});

		expect(result).to.be.true;
	});
});

describe('.first()', function () {
	it('should return the first node of a set', async function () {
		let result = await page.evaluate(function () {
			return $('li').first().get(0) === document.querySelector('li:first-child');
		});

		expect(result).to.be.true;
	});
});

describe('.last()', function () {
	it('should return the last node of a set', async function () {
		let result = await page.evaluate(function () {
			return $('li').last().get(0) === document.querySelector('li:last-child');
		});

		expect(result).to.be.true;
	});
});

describe('.children()', function () {
	it('should return the children of a node', async function () {
		let result = await page.evaluate(function () {
			return $('.container').children().size()
		});

		expect(result).to.be.equal(3);
	});
});