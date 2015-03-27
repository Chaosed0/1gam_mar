
define(['crafty', 'jquery', './Util',
        './Circle',
        './Shape',
    ], function(Crafty, $, u) {

    const initialTweenTime = 2500;
    const tutorialTweenTime = 1500;
    const defaultEasingFunc = "linear";
    const colors = ["#AAFFAA", "#AAAAFF", "#FFAAAA"];

    var self = this;
    
    var width = $(window).width();
    var height = $(window).height();
    var gameElem = document.getElementById('game');

    var playerDimensions = { x: width/2 - 20, y: height/2 - 20, w: 40, h: 40}; 

    var tutorial = true;
    var lost = false;
    var lostTime = 0;
    var points = 0;

    var curColor = colors[0];

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

    var tutorialFlow = function(shape1, shape2, text, playerShape) {
        var fraction = 0.7;
        var sidesToKey = {
            3: "A",
            4: "S",
            5: "D",
            6: "F",
            7: "Space",
        }

        var partialTween = function(shape, fraction, time) {
            var finalWidth = (shape.w - playerDimensions.w) * (1-fraction);
            var finalHeight = (shape.w - playerDimensions.h) * (1-fraction);
            var end = {
                x: playerDimensions.x - finalWidth/2,
                y: playerDimensions.y - finalWidth/2,
                w: finalWidth,
                h: finalHeight,
            };
            tweenTo(shape, end, time);
        };

        var tweenEnd2 = function() {
            var ender = this;
            var starter = (this === shape1 ? shape2 : shape1);

            if (ender.sides() !== playerShape.sides() ||
                    starter.fillcolor() !== playerShape.fillcolor()) {
                ender.visible = false;
                Crafty.trigger("Lose");
            } else {
                if (ender.sides >= 7) {
                    /* No more shapes to teach, start on colors */
                } else {
                    ender.z = 0;
                    ender.sides(ender.sides()+2);
                    ender.enclose(width, height);
                    ender.unbind("TweenEnd", tweenEnd2);

                    starter.z = 1;
                    starter.bind("TweenEnd", tweenEnd1);
                    partialTween(starter, fraction, tutorialTweenTime*fraction);
                    Crafty.trigger("Score");
                }
            }
        }

        var continueTween = function(ender) {
            text.visible = false;
            tweenTo(ender, playerDimensions, tutorialTweenTime*(1-fraction));
            ender.bind("TweenEnd", tweenEnd2);
        }

        var tweenEnd1 = function() {
            var ender = this;

            ender.unbind("TweenEnd", tweenEnd1);
            text.text(sidesToKey[ender.sides()]);
            text.visible = true;
            var keydown = function() {
                Crafty.unbind("KeyDown", keydown);
                continueTween(ender);
            }
            Crafty.bind("KeyDown", keydown);
        }

        shape1.bind("TweenEnd", tweenEnd1);
        partialTween(shape1, fraction, tutorialTweenTime*fraction);
    }

    var normalFlow = function(shape1, shape2, playerShape) {
        var tweenTime = initialTweenTime;
        var tweenEnd = function() {
            var ender = (this === shape1 ? shape1 : shape2);
            var starter = (this === shape1 ? shape2 : shape1);

            if (ender.sides() !== playerShape.sides() ||
                    starter.fillcolor() !== playerShape.fillcolor()) {
                /* Lose */
                ender.visible = false;
                Crafty.trigger("Lose");
            } else {
                /* Success */
                ender.z = 0;
                if (points%4 == 0) {
                    randomColor(ender);
                    tweenTime = Math.max(500, tweenTime - 200);
                } else {
                    randomShape(ender);
                }

                starter.z = 1;
                tweenToPlayer(starter);

                Crafty.trigger("Score");
            }
        };

        shape1.bind("TweenEnd", tweenEnd);
        shape2.bind("TweenEnd", tweenEnd);

        /* Start one of the shapes tweening toward the player */
        tweenToPlayer(shape1);
    }

    Crafty.scene("Main", function () {
        console.log("MAIN");
        Crafty.background("#AAAAAA");

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

        var tutorialText = Crafty.e("2D, Canvas, Text")
            .attr({ x: width / 2 - 200, y: height / 2 - 200, z: 2000 })
            .textFont({ size: '30px', weight: 'bold' });
        tutorialText.visible = false;

        var playerShape = Crafty.e("2D, Canvas, Shape, Tween")
            .attr(playerDimensions)
            .sides(3)
            .fillcolor(curColor);
        playerShape.z = 1000;

        /* Total hack to destroy Crafty's HashMap.refresh() callback, which performs
         * really horribly on larger entities
         * This has the side effect of making collisions totally unusable, which
         * shouldn't be a problem for this game */
        shape1.unbind("Move");
        shape2.unbind("Move");

        tutorialFlow(shape1, shape2, tutorialText, playerShape);

        Crafty.bind("Score", function() {
            points++;
            playerShape.attr({ x: width/2 - 30, y: height/2 - 30, w: 60, h: 60});
            tweenTo(playerShape, playerDimensions, 300, "linear");
        });

        Crafty.bind("Lose", function() {
            lost = true;
            lostTime = (new Date()).getTime();
            playerShape.tween({ x: width/2, y: height/2, w: 0, h: 0 }, 1000);
        });

        var keyDownHandler = function(e) {
            if (lost) {
                if ((new Date).getTime() - lostTime > 500) {
                    lost = false;
                    Crafty.scene("Main");
                }
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
