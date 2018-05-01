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

	it('should return true if the whole set match the query', async function () {
		let result = await page.evaluate(function () {
			return $('span').is('.ticket');
		});

		expect(result).to.be.true;
	});
});

describe('.has()', function () {
	it('should return true if any of the children match the query', async function () {
		let result = await page.evaluate(function () {
			return $('.container').has('.active');
		});

		expect(result).to.be.true;
	});

	it('should return false if none of the children match the query', async function () {
		let result = await page.evaluate(function () {
			return $('.container').has('.pink');
		});

		expect(result).to.be.false;
	});

	it('should work with nodes', async function () {
		let result = await page.evaluate(function () {
			var node = document.querySelector('.active');
			return $('.container').has(node);
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
			return $('.container').children().size();
		});

		expect(result).to.be.equal(3);
	});
});

describe('.hasClass()', function () {
	it('should return true if the whole set has the class', async function () {
		let result = await page.evaluate(function () {;
			return $('.container').hasClass('container')
		});

		expect(result).to.be.true;
	});
});

describe('.addClass()', function () {
	it('should add a class to a set', async function () {
		let result = await page.evaluate(function () {;
			$('#list').children().addClass('mark');

			return document.querySelectorAll('.mark').length
		});

		expect(result).to.be.equal(5);
	});
});

describe('.removeClass()', function () {
	it('should remove a class from a set', async function () {
		let result = await page.evaluate(function () {;
			$('.container').children().removeClass('ticket');

			return document.querySelectorAll('.ticket').length
		});

		expect(result).to.be.equal(0);
	});
});

describe('.toggleClass()', function () {
	it('should toggle a class on a set', async function () {
		let result = await page.evaluate(function () {;
			$('.container').toggleClass('x');

			return document.querySelectorAll('.x').length
		});

		expect(result).to.be.equal(1);
	});
});