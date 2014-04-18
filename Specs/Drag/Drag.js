/*
---
name: Drag
requires: [Core/Events, Core/Options, Core/Element.Event, Core/Element.Style, Core/Element.Dimensions, MooTools.More]
provides: [Drag]
...
*/
(function(){
    new Element('p', {
        'html': 'MooTools Drag test. This paragraph is needed for the test!'
    }).inject($(document.body));

    var parentContainer = new Element('div', {
        id: 'container',
        styles: {
            width: '200px',
            height: '200px',
            background: 'red',
            margin: '20px',
        }
    }).inject($(document.body));

    new Element('div', {
        id: 'drag',
        styles: {
            width: '31px',
            height: '31px',
            background: 'blue',
            position: 'relative'
        }
    }).inject(parentContainer);

    var dragSize = $('drag').getSize();
    var containerSize = $('container').getSize();
    var windowSize = window.getSize();
    var corners = [{
        x: 0,
        y: 0
    }, {
        x: 0,
        y: windowSize.y
    }, {
        x: windowSize.x,
        y: 0
    }, {
        x: windowSize.x,
        y: windowSize.y
    }];

    // check if drag box stays inside the container's border
    function borderPolice(container, drag) {
        var clean = true;
        if (drag.x < container.x || (drag.x + dragSize.x) > (container.x + containerSize.x)) clean = false;
        if (drag.y < container.y || (drag.y + dragSize.y) > (container.y + containerSize)) clean = false;
        return clean;
    }

    // function to format for Syn
    function getCoord(pos){
        return {
            pageX: pos.x,
            pageY: pos.y
        };
    }

    describe('Drag', function(){

        it('should drag the box inside the parent without crossing the border', function(){
            var borderFlag = true;
            var theDrag = new Drag.Move('drag', {
                container: 'container',
                includeMargins: false,
                onDrag: function () {
                    var containerPosition = this.container.getPosition();
                    var dragPosition = this.element.getPosition();
                    // check if drag element keeps inside the container
                    if (!borderPolice(containerPosition, dragPosition)) borderFlag = false;
                }
            });
            var cI = 0;
            // drag the element from its center to the 4 corners of the screen
            var walkThru = setInterval(function () {
                var nextCorner = corners[cI];
                Syn.drag({
                    from: getCoord($('drag').getPosition()),
                    to: getCoord(nextCorner)
                }, 'drag');
                cI++;
                if (cI == corners.length) clearInterval(walkThru);
            }, 100);

            waits(800);

            runs(function(){
                expect(borderFlag).toBeTruthy();
            });

        });
    });
})();