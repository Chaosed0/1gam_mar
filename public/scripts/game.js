
define(['crafty', 'jquery', './Util',
        './Circle',
        './Shape',
        './Expires',
    ], function(Crafty, $, u) {

    const initialTweenTime = 4000;
    const initialGapTime = 1000;
    const tutorialTweenTime = 1500;
    const defaultEasingFunc = "linear";
    const colors = ["#FFAAAA", "#AAFFAA", "#AAAAFF"];

    var self = this;
    
    var width = $(window).width();
    var height = $(window).height();
    var gameElem = document.getElementById('game');

    var playerRect = { x: width/2 - 20, y: height/2 - 20, w: 40, h: 40}; 
    var tutorial = false;
    var lostTime = 0;

    var curColor = colors[colors.length-1];

    Crafty.init(width, height, gameElem);  			  		
    Crafty.viewport.clampToEntities = false;

    Crafty.scene("Load", function() {

        console.log("LOAD");
        
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({ w:width, h: 20, x: 0, y: height/2 })
                .text("Loading...")
                .css({ "text-align": "center" });

        var assets = { }
        
        //Preload assets first
        Crafty.load(assets, function() {
            Crafty.scene("Main");		
        });
    });

    var playerRectClone = function() {
        return {
            x: playerRect.x,
            y: playerRect.y,
            w: playerRect.w,
            h: playerRect.h
        }
    }

    var randomShape = function(shape) {
        var sides = Math.floor(u.getRandom(3, 7));
        shape.sides(sides);
        shape.fillcolor(curColor);
        shape.enclose(width, height);
    }

    var circleShape = function(shape) {
        shape.sides(7);
        shape.fillcolor(curColor);
        shape.enclose(width, height);
    }

    var randomColor = function(shape) {
        var prevColor = curColor;
        while (curColor === prevColor) {
            curColor = u.randomElem(colors);
        }

        randomShape(shape);
    }

    var tweenTo = function(shape, end, time, easingFunc) {
        if (easingFunc === undefined) {
            easingFunc = defaultEasingFunc;
        }

        shape.tween(end, time, easingFunc);
    }

    var tutorialFlow = function(text, playerShape) {
        var fraction = 0.7;
        var sidesToKey = {
            3: "A",
            4: "S",
            5: "D",
            6: "F",
            7: "Space",
        }
        var colorToKey = {
            0: "J",
            1: "K",
            2: "L",
        };

        var shape1 = Crafty.e("2D, Canvas, Shape, Tween")
            .fillcolor(curColor)
            .sides(3)
            .enclose(width, height);
        shape1.z = 1;

        var shape2 = Crafty.e("2D, Canvas, Shape, Tween")
            .fillcolor(curColor)
            .sides(4)
            .enclose(width, height);
        shape2.z = 0;

        /* Total hack, etc, etc */
        shape1.unbind("Move");
        shape2.unbind("Move");

        var teachingColors = false;
        var tutorialSides = 3;
        var tutorialColor = 0;

        var partialTween = function(shape, fraction, time) {
            var finalWidth = (shape.w - playerRect.w) * (1-fraction);
            var finalHeight = (shape.h - playerRect.h) * (1-fraction);
            var end = {
                x: playerRect.x - finalWidth/2,
                y: playerRect.y - finalHeight/2,
                w: playerRect.w + finalWidth,
                h: playerRect.h + finalHeight,
            };
            tweenTo(shape, end, time);
        };

        var tweenEnd2 = function() {
            var ender = this;
            var starter = (this === shape1 ? shape2 : shape1);
            ender.unbind("TweenEnd", tweenEnd2);

            if (ender.sides() !== playerShape.sides() ||
                    ender.fillcolor() !== playerShape.fillcolor()) {
                ender.visible = false;
                Crafty.trigger("Lose");
            } else {
                if (tutorialColor >= colors.length) {
                    /* No more colors to teach - it's the end of the tutorial */
                    shape1.destroy();
                    shape2.destroy();
                    Crafty.trigger("TutorialEnd");
                } else {
                    ender.sides(tutorialSides+2);
                    ender.z = 0;
                    ender.enclose(width, height);

                    if (tutorialSides < 7) {
                        tutorialSides++;
                    } else {
                        teachingColors = true;
                        tutorialColor++;
                    }

                    if (ender.sides() > 7) {
                        /* No more shapes to teach, change to colors */
                        ender.sides(7);
                        ender.fillcolor(colors[tutorialColor]);
                    }

                    starter.z = 1;
                    starter.bind("TweenEnd", tweenEnd1);
                    partialTween(starter, fraction, tutorialTweenTime*fraction);
                }

                Crafty.trigger("Score");
            }
        }

        var continueTween = function(ender) {
            text.visible = false;
            tweenTo(ender, playerRectClone(), tutorialTweenTime*(1-fraction));
            ender.bind("TweenEnd", tweenEnd2);
        }

        var tweenEnd1 = function() {
            var ender = this;

            ender.unbind("TweenEnd", tweenEnd1);
            text.visible = true;

            if (!teachingColors) {
                text.text(sidesToKey[ender.sides()]);
            } else {
                text.text(colorToKey[tutorialColor-1]);
            }

            var keydown = function() {
                Crafty.unbind("KeyDown", keydown);
                continueTween(ender);
            }
            Crafty.bind("KeyDown", keydown);
        }

        shape1.bind("TweenEnd", tweenEnd1);
        partialTween(shape1, fraction, tutorialTweenTime*fraction);
    }

    var normalFlow = function(playerShape) {
        const numShapes = 15;
        var shapes = new Array(numShapes);
        var curShape = 0;
        var closestShape = 0;

        var tweenTime = initialTweenTime;
        var gapTime = initialGapTime;
        var timer = Crafty.e("Expires");

        /* Function called when any shape's tween ends */
        var tweenEnd = function() {
            var ender = this;
            u.assert(shapes[closestShape] === ender);

            if (ender.sides() !== playerShape.sides() ||
                    ender.fillcolor() !== playerShape.fillcolor()) {
                /* Lose */
                ender.visible = false;
                /* Stop all tweens */
                timer.destroy();
                for (var i = 0; i < numShapes; i++) {
                    shapes[i].unbind("TweenEnd");
                    shapes[i].cancelTween(playerRectClone());
                }
                /* Trigger loss */
                Crafty.trigger("Lose");
            } else {
                /* Put this shape behind the last shape */
                ender.z = shapes[((closestShape-1)+numShapes)%numShapes].z-1;

                /* Give this shape a new color or change its number of sides, depending */
                if ((closestShape+numShapes)%4 == 0) {
                    randomColor(ender);
                    ender.sides(7);
                    gapTime = Math.max(500, tweenTime - 200);
                } else {
                    randomShape(ender);
                }

                /* Add to score counter */
                Crafty.trigger("Score");
            }

            closestShape = (closestShape+1)%numShapes;
        };

        /* Initialize shapes */
        for (var i = 0 ; i < numShapes; i++) {
            var shape = Crafty.e("2D, Canvas, Shape, Tween");
            shape.z = -i;

            if (i%4 === 0) {
                randomColor(shape);
                shape.sides(7);
            } else {
                randomShape(shape);
            }
            shape.bind("TweenEnd", tweenEnd);

            /* Total hack to destroy Crafty's HashMap.refresh() callback, which performs
             * really horribly on larger entities
             * This has the side effect of making collisions totally unusable, which
             * shouldn't be a problem for this game */
            shape.unbind("Move");

            /* Add this shape to the list */
            shapes[i] = shape;
        }

        function nextTween() {
            tweenTo(shapes[curShape], playerRectClone(), tweenTime);
            curShape = (curShape+1)%numShapes;
            console.log(curShape);
        }

        /* Start the first shape tweening toward the player */
        nextTween();
        
        /* After some time, tween the next shape */
        timer.expires(gapTime, 1000)
            .bind("Expired", function() {
                /* Start the next shape tweening toward the player */
                nextTween();
            });
    }

    Crafty.scene("Main", function () {
        console.log("MAIN");
        Crafty.background("#AAAAAA");

        var points = 0;
        var lost = false;

        var tutorialText = Crafty.e("2D, Canvas, Text")
            .attr({ x: width / 2 - 200, y: height / 2 - 200, z: 2000 })
            .textFont({ size: '30px', weight: 'bold' });
        tutorialText.visible = false;

        var playerShape = Crafty.e("2D, Canvas, Shape, Tween")
            .attr(playerRectClone())
            .sides(7)
            .fillcolor(curColor);
        playerShape.z = 1000;

        if (tutorial) {
            tutorialFlow(tutorialText, playerShape);
        } else {
            normalFlow(playerShape);
        }

        Crafty.bind("Score", function() {
            if (!tutorial) {
                points++;
            }

            playerShape.attr({ x: width/2 - 30, y: height/2 - 30, w: 60, h: 60});
            tweenTo(playerShape, playerRectClone(), 300, "linear");
        });

        Crafty.bind("Lose", function() {
            lost = true;
            lostTime = (new Date()).getTime();
            playerShape.tween({ x: width/2, y: height/2, w: 0, h: 0 }, 1000);
        });

        Crafty.bind("TutorialEnd", function() {
            points = 0;
            tutorial = false;
            normalFlow(playerShape);
        });

        var keyDownHandler = function(e) {
            if (lost && (new Date).getTime() - lostTime > 500) {
                lost = false;
                Crafty.unbind("Score");
                Crafty.unbind("Lose");
                Crafty.unbind("TutorialEnd");
                Crafty.scene("Main");
            } else {
                var sides = playerShape.sides();
                switch (e.key) {
                    case Crafty.keys.LEFT_ARROW:
                        playershape.sides(Math.max(3, sides-1));
                        break;
                    case Crafty.keys.RIGHT_ARROW:
                        playerShape.sides(Math.min(7, sides+1));
                        break;
                    case Crafty.keys.A:
                        playerShape.sides(3);
                        break;
                    case Crafty.keys.S:
                        playerShape.sides(4);
                        break;
                    case Crafty.keys.D:
                        playerShape.sides(5);
                        break;
                    case Crafty.keys.F:
                        playerShape.sides(6);
                        break;
                    case Crafty.keys.J:
                        playerShape.fillcolor(colors[0]);
                        break;
                    case Crafty.keys.K:
                        playerShape.fillcolor(colors[1]);
                        break;
                    case Crafty.keys.L:
                        playerShape.fillcolor(colors[2]);
                        break;
                    case Crafty.keys.SPACE:
                        playerShape.sides(7);
                        break;
                    default:
                        break;
                }
            }
        }

        Crafty.bind("KeyDown", keyDownHandler);
    });

    Crafty.scene("Load");
});
