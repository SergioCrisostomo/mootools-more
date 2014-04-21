/*
---
name: Drag
requires: [Core/Events, Core/Options, Core/Element.Event, Core/Element.Style, Core/Element.Dimensions, MooTools.More]
provides: [Drag]
...
*/
(function () {

    var windowSize = window.getSize();
    var suiteDone = false;
    var testArea = new Element('div', {
        styles: {
            width: '100%',
            height: '100%'
        }
    });
    // check if drag box stays inside the container's border
    function borderPolice(container, drag, dragSize, containerSize) {
        var clean = true;
        if (drag.x < container.x || (drag.x + dragSize.x) > (container.x + containerSize.x)) clean = false;
        if (drag.y < container.y || (drag.y + dragSize.y) > (container.y + containerSize.y)) clean = false;
        return clean;
    }

    // function to format for Syn
    function getCoord(pos) {
        return {
            pageX: pos.x,
            pageY: pos.y
        };
    }

    function dragCenterPos(el) {
        var dragPos = el.getPosition();
        var dragSize = el.getSize();
        return {
            x: dragPos.x + Math.round(dragSize.x / 2),
            y: dragPos.y + Math.round(dragSize.y / 2)
        }
    }

    function containerData(el) {
        var pos = el.getPosition();
        var size = el.getSize();
        var center = {
            x: pos.x + Math.round(size.x / 2),
            y: pos.y + Math.round(size.y / 2)
        }
        return {
            position: pos,
            size: size,
            center: center
        };
    }
    
    function returnPosition(els){
        return els.map(function(el){ return el.element.getPosition(); });
    }

    function dragAround(center, dragMe) {
        var size = dragMe.getSize();
        var points = [
            center, {
                x: 0 + size.x,
                y: 0 + size.y
            },
            center, {
                x: 0 + size.x,
                y: windowSize.y - size.y
            },
            center, {
                x: windowSize.x - size.x,
                y: 0 + size.x
            },
            center, {
                x: windowSize.x - size.x,
                y: windowSize.y - size.x
            },
            center
        ];
        var originalPosition = [dragMe.getPosition().x, dragMe.getPosition().y];
        var cI = 0;
        // drag the element from its center to the 4 corners of the screen
        var walkThru = setInterval(function () {
            var dragTo = points[cI];
            Syn.drag({
                from: getCoord(dragCenterPos(dragMe)),
                to: getCoord(dragTo),
                duration: 50
            }, dragMe);
            cI++;
            if (cI == points.length) {
                clearInterval(walkThru);
                if (dragMe.getPosition().x != originalPosition[0] || dragMe.getPosition().y != originalPosition[1]) suiteDone = true;
                else suiteDone = 0;
            }
        }, 80);
    }

    describe('Drag', function () {

        it('should be able to drag the colored boxes around. The links should let you enable and disable dragging', function () {
            suiteDone = false;
            var environment = $(document.body);

            // add elements
            new Element('a', {
                'id': 'enable',
                'html': 'Enable drag '
            }).inject(environment);

            new Element('a', {
                'id': 'disable',
                'html': 'Disable drag'
            }).inject(environment);
          
            for (var i = 0; i < 3; i++){
                var color = [0,0,0];
                color[i] = 9;
                new Element('div', {
                    id: 'box' + i,
                    styles: {
                        width: '31px',
                        height: '31px',
                        background: '#' + color.join(''),
                        position: 'relative'
                    }
                }).inject(environment);
            }
            
            var draggers = [$('box0').makeDraggable(), $('box1').makeDraggable({
                modifiers: {x: 'right', y: 'bottom'},
                invert: true
            }), $('box2').makeDraggable()];
            $('enable').addEvent('click', function(){
                draggers.each(function(drag){ drag.attach(); });
            });
            $('disable').addEvent('click', function(){
                draggers.each(function(drag){ drag.detach(); });
            });
            
            // js
            var container = containerData($(document.body));
            draggers.each(function(el){ dragAround(container.center, el.element); });
            waits(1000);

            runs(function () {
                if(suiteDone){
                    $('disable').fireEvent('click');
                    draggers.each(function(el){ dragAround({x: 100, y: 100}, el.element); });
                } else throw 'disable drag did not fire';
            });
            waits(1000);

            runs(function () {
                expect(!suiteDone).toBeTruthy();
                $('enable').fireEvent('click');
                draggers.each(function(el){ dragAround({x: 200, y: 200}, el.element); });
            });

            waits(1000);
            runs(function () {
                expect(suiteDone).toBeTruthy();
                environment.empty();
            });
        });

        it('should drag the box inside the parent without crossing the border', function () {
            suiteDone = false;
            var environment = testArea.clone();
            environment.inject($(document.body));
            // add elements
            new Element('p', {
                'html': 'MooTools Drag test. This paragraph is needed for the test!'
            }).inject(environment);

            var parentContainer = new Element('div', {
                id: 'container',
                styles: {
                    width: '200px',
                    height: '200px',
                    background: 'red',
                    margin: '20px'
                }
            }).inject(environment);

            new Element('div', {
                id: 'drag',
                styles: {
                    width: '31px',
                    height: '31px',
                    background: 'blue',
                    position: 'relative'
                }
            }).inject(parentContainer);

            // js
            var container = containerData($('container'));
            var dragEl = $('drag');
            var dragSize = dragEl.getSize();
            var borderFlag = true;
            var theDrag = new Drag.Move('drag', {
                container: 'container',
                includeMargins: false,
                onDrag: function () {
                    var containerPosition = this.container.getPosition();
                    var dragPosition = this.element.getPosition();
                    // check if drag element keeps inside the container
                    if (!borderPolice(containerPosition, dragPosition, dragSize, container.size)) borderFlag = false;
                }
            });

            dragAround(container.center, dragEl);
            waits(1000);
            runs(function () {
                expect(suiteDone && borderFlag).toBeTruthy();
                environment.destroy();
            });
        });

        it('should be able to drag the dark blue box to be flush within the lighter blue box\'s edges', function () {
            suiteDone = false;
            var environment = testArea.clone();
            environment.inject($(document.body));
            // add elements
            new Element('p', {
                'html': 'MooTools Drag test. This paragraph is needed for the test!'
            }).inject(environment);

            var parentContainer = new Element('div', {
                id: 'big_drag',
                styles: {
                    'border-top': '5px solid black',
                    'border-left': '2px solid black',
                    'border-right': '8px solid black',
                    'border-bottom': '1px solid black',
                    'width': '150px',
                    'padding': '5px',
                    'padding-top': '30px',
                    'position': 'relative'
                }
            }).inject(environment);

            var wrap = new Element('div', {
                id: 'wrap',
                styles: {
                    'width': '150px',
                        'height': '150px',
                        'background-color': '#bcd'
                }
            }).inject(parentContainer);

            new Element('div', {
                id: 'drag',
                styles: {
                    width: '31px',
                    height: '31px',
                    'background-color': '#567'
                }
            }).inject(wrap);
            // js
            var container = containerData($('wrap'));
            var dragEl = $('drag');
            var dragSize = dragEl.getSize();
            var borderFlag = true;
            var theDrag = new Drag.Move('drag', {
                container: 'wrap',
                stopPropagation: true,
                onDrag: function () {
                    var containerPosition = this.container.getPosition();
                    var dragPosition = this.element.getPosition();
                    // check if drag element keeps inside the container
                    if (!borderPolice(containerPosition, dragPosition, dragSize, container.size)) borderFlag = false;
                }
            });

            dragAround(container.center, dragEl);
            waits(1000);
            runs(function () {
                expect(suiteDone && borderFlag).toBeTruthy();
                environment.destroy();
            });
        });
    });
})();
