/*
---
name: Scroller Tests
requires: [Core/Events, Core/Options, Core/Element.Event, Core/Element.Dimensions, MooTools.More]
provides: [Scroller.Tests]
...
*/
describe('Scroller', function(){

    var inner, wrapper, myScroller, body = $(document.body);

    beforeEach(function(){
        inner = new Element('div', {
            id: 'myScroll',
            styles: {
                width: 300,
                height: 200,
                overflow: 'scroll'
            }
        });
        inner.inject(body);
        wrapper = new Element('div', {
            styles: {
                width: 600,
                height: 400
            }
        }).inject(inner);

        myScroller = new Scroller('myScroll', {
            area: Math.round(window.getWidth() / 10)
        });
    });

    afterEach(function(){
        inner.destroy();
        wrapper.destroy();
        myScroller = null;
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
