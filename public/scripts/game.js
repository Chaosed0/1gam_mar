
define(['crafty', 'jquery', './Util',
        './Circle',
        './Shape',
    ], function(Crafty, $, u) {

    const initialTweenTime = 2500;
    const defaultEasingFunc = "linear";
    const colors = ["#AAFFAA", "#AAAAFF", "#FFAAAA", "#FFFFAA"];

    var self = this;
    
    var width = $(window).width();
    var height = $(window).height();
    var gameElem = document.getElementById('game');

    var lost = false;
    var lostTime = 0;
    var points = 0;

    var curColor = colors[0];

    /* Crafty doesn't have this for some reason */
    Crafty.keys.COLON = 186;

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

        if (sides === 3) {
            shape.x = - width * 2;
            shape.y = - height * 2;
            shape.w = width * 5;
            shape.h = height * 5;
        } else {
            shape.x = - width;
            shape.y = - height;
            shape.w = width * 3;
            shape.h = height * 3;
        }
    }

    var randomColor = function(shape) {
        var prevColor = curColor;
        while (curColor === prevColor) {
            curColor = u.randomElem(colors);
        }

        randomShape(shape);
    }

    var circleShape = function(shape) {
        shape.sides(7);
        shape.fillcolor(curColor);
        shape.x = - width;
        shape.y = - height;
        shape.w = width * 3;
        shape.h = height * 3;
    }

    Crafty.scene("Main", function () {
        console.log("MAIN");
        Crafty.background("#AAAAAA");

        var tweenTime = initialTweenTime;

        var shrink1 = Crafty.e("2D, Canvas, Shape, Tween")
            .fillcolor(curColor);

        var shrink2 = Crafty.e("2D, Canvas, Shape, Tween")
            .fillcolor(curColor);

        randomShape(shrink1);
        randomShape(shrink2);
        
        var playerDimensions = { x: width/2 - 20, y: height/2 - 20, w: 40, h: 40}; 

        var playerShape = Crafty.e("2D, Canvas, Shape, Tween")
            .attr(playerDimensions)
            .sides(3)
            .fillcolor(curColor);
        playerShape.z = 1000;

        var tweenToPlayer = function(shape, time, easingFunc) {
            if (time === undefined) {
                time = tweenTime;
            }

            if (easingFunc === undefined) {
                easingFunc = defaultEasingFunc;
            }

            shape.tween(playerDimensions, time, easingFunc);
        }

        var tweenEnd = function() {
            var ender = (this === shrink1 ? shrink1 : shrink2);
            var starter = (this === shrink1 ? shrink2 : shrink1);

            if (ender.sides() !== playerShape.sides() ||
                    starter.fillcolor() !== playerShape.fillcolor()) {
                /* Lose */
                lost = true;
                lostTime = (new Date()).getTime();
                ender.visible = false;
                playerShape.tween({ x: width/2, y: height/2, w: 0, h: 0 }, 1000);
            } else {
                /* Success */
                points++;

                ender.z = 0;
                if (points%4 == 0) {
                    randomColor(ender);
                    tweenTime = Math.max(500, tweenTime - 200);
                } else {
                    randomShape(ender);
                }

                starter.z = 1;
                tweenToPlayer(starter);

                playerShape.attr({ x: width/2 - 30, y: height/2 - 30, w: 60, h: 60});
                tweenToPlayer(playerShape, tweenTime/10, "linear");
            }
        };

        shrink1.bind("TweenEnd", tweenEnd);
        shrink2.bind("TweenEnd", tweenEnd);

        /* Total hack to destroy Crafty's HashMap.refresh() callback, which performs
         * really horribly on larger entities
         * This has the side effect of making collisions totally unusable, which
         * shouldn't be a problem for this game */
        shrink1.unbind("Move");
        shrink2.unbind("Move");

        /* Start one of the shapes tweening toward the player */
        tweenToPlayer(shrink1);
        shrink1.z = 1;
        shrink2.z = 0;

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
                    case Crafty.keys.COLON:
                        playerShape.fillcolor(colors[3]);
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
