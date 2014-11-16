/*
---
name: Scroller Tests
requires: [Core/Events, Core/Options, Core/Element.Event, Core/Element.Dimensions, MooTools.More]
provides: [Scroller.Tests]
...
*/
describe('Scroller', function(){
	var inner = new Element('div', {
		id: 'myScroll',
		styles: {
			width: 300,
			height: 200,
			overflow: 'scroll'
		}
	});
	inner.inject($(document.body));
	var wrapper = new Element('div', {
		styles: {
			width: 600,
			height: 400
		}
	}).inject(inner);

	var myScroller = new Scroller('myScroll', {
		area: Math.round(window.getWidth() / 10)
	});

	it('should initialize', function(){
		expect(myScroller.element).toEqual(inner);
	});
	it('should be error free', function(){
		var error;
		try{
			myScroller.scroll();
		}catch(e){
			error = e;
		}
		expect(error).toBe(undefined);
	});
});
