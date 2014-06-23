/*
---
name: String.Extras Tests
requires: [More/String.Extras]
provides: [String.Extras.Tests]
...
*/
describe('String.standardize', function(){

	it('should map special characters into standard ones', function(){
		expect('También jugué al fútbol con Martín.'.standardize()).toEqual('Tambien jugue al futbol con Martin.');
		expect('Enchanté. Très bien, merci.'.standardize()).toEqual('Enchante. Tres bien, merci.');
		expect('Jak się masz?'.standardize()).toEqual('Jak sie masz?');
	});

});

describe('String.repeat', function(){

	it('should repeat the given string a number of times', function(){
		expect('ha'.repeat(5)).toEqual('hahahahaha');
		expect('ha'.repeat(0)).toEqual('');
	});

});

describe('String.pad', function(){

	it('should work with both numbers and strings', function(){
		expect('1'.pad(2, 0, 'left')).toEqual('01');
		expect('1'.pad(2, '0', 'left')).toEqual('01');
	});

	it('should fill the string with the supplied pad string to left, right or both to reach a given number of characters', function(){
		expect('Alien'.pad(10, ' ', 'right')).toEqual('Alien     ');
		expect('Alien'.pad(10, '-=', 'left')).toEqual('-=-=-Alien');
		expect('Alien'.pad(10, '_', 'both')).toEqual('__Alien___');
		expect('Alien'.pad(6, '___', 'right')).toEqual('Alien_');
	});

});

describe('String.stripTags', function () {

    var testStrings = [{
        tag: 'img',
        str: '<img src="test.png" />',
        stripped: '',
        contentsTrue: '<img src="test.png" />'
    }, {
        tag: 'img',
        str: '<img src="test.png" >',
        stripped: '',
        contentsTrue: '<img src="test.png" >'
    }, {
        tag: 'h1',
        str: '<h1>Header 1</h1>',
        stripped: 'Header 1',
        contentsTrue: '<h1>Header 1</h1>'
    }, {
        tag: 'br',
        str: 'Line<br />next line<br/>',
        stripped: 'Linenext line',
        contentsTrue: '<br /><br/>'
    }, {
        tag: 'span',
        str: '<span>some text</span>',
        stripped: 'some text',
        contentsTrue: '<span>some text</span>'
    }, {
        tag: '',
        str: '<b>test<a>another</a><br><hr/><div>thing</div></b>',
        stripped: 'testanotherthing',
        contentsTrue: '<br><hr/><b>test<a>another</a><div>thing</div></b>'
    },{
        tag: '',
        str: '<b>This</b> is a <i>phrase </i><br/><div>and</div> this <b>should not be stripped</b>',
        stripped: 'This is a phrase and this should not be stripped',
        contentsTrue: '<br/><b>This</b><i>phrase </i><div>and</div><b>should not be stripped</b>'
    }, {
        tag: '',
        str: 'i like cookies',
        stripped: 'i like cookies',
        contentsTrue: ''
    }, {
        tag: '',
        str: '1 < 5 5 > 1',
        stripped: '1 < 5 5 > 1',
        contentsTrue: ''
    }];

    testStrings.each(function (testStr) {
        it('should remove desired tags, and only them, from an html string', function () {
            var result = testStr.str.stripTags(testStr.tag);
            expect(result).toEqual(testStr.stripped);
        });
    });

    testStrings.each(function (testStr) {
        it('should retrieve a array with the stripped contents', function () {
            var results = testStr.str.stripTags(testStr.tag, true);
            expect(results.join('')).toEqual(testStr.contentsTrue);
        });
    });

});

describe('String.truncate', function(){

	it('it should truncate a string at 10 chars and add ...', function(){
		expect("Just MooTooling'".truncate(10)).toEqual('Just MooTo…');
	});

	it('it should another trail, instead of the usual dots', function(){
		expect("Just MooTooling'".truncate(10, '--')).toEqual('Just MooTo--');
		expect("Just MooTooling'".truncate(10, null)).toEqual('Just MooTo');
	});

	it('should truncate a string nicely after the last given char, for example a space', function(){
		expect("Just MooTooling'".truncate(10, '--', ' ')).toEqual('Just--');
		expect("Just MooTooling'".truncate(10, null, ' ')).toEqual('Just');
	});

});

describe('String.ms', function(){

	it('should convert seconds to milliseconds', function(){
		expect('5s'.ms()).toEqual(5000);
	});

	it('should convert minutes to milliseconds', function(){
		expect('2m'.ms()).toEqual(12e4);
	});

	it('should convert hours to milliseconds', function(){
		expect('3h'.ms()).toEqual(108e5);
	});

	it('should keep milliseconds as milliseconds', function(){
		expect('250ms'.ms()).toEqual(250);
	});

	it('should treat no unit as milliseconds', function(){
		expect('100'.ms()).toEqual(100);
	});

	it('should return NaN for unknown units', function(){
		jasmine.Matchers.prototype.toBeNaN = function(){
			return isNaN(this.actual);
		};
		expect('30q'.ms()).toBeNaN();
	});

});
