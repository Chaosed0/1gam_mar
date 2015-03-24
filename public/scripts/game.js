
define(['crafty', 'jquery', './Util',
        './Circle',
        './Shape',
    ], function(Crafty, $, u) {

    const defaultTweenTime = 2000;
    const defaultEasingFunc = "easeInQuad";

    var self = this;
    
    var width = $(window).width();
    var height = $(window).height();
    var gameElem = document.getElementById('game');

    var lost = false;
    var lostTime = 0;

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
        var sides = Math.floor(u.getRandom(3, 8));
        shape.sides(sides);

        if (sides === 3) {
            shape.x = - width * 2;
            shape.y = - height * 2;
            shape.w = width * 5;
            shape.h = height * 5;
        } else if (sides < 7) {
            shape.x = - width;
            shape.y = - height;
            shape.w = width * 3;
            shape.h = height * 3;
        } else {
            shape.x = - width;
            shape.y = - height;
            shape.w = width * 3;
            shape.h = height * 3;
        }
    }

    Crafty.scene("Main", function () {
        console.log("MAIN");
        Crafty.background("#AAAAAA");

        var shrink1 = Crafty.e("2D, Canvas, Shape, Tween")
            .fillcolor("#AAAAAA");

        var shrink2 = Crafty.e("2D, Canvas, Shape, Tween")
            .fillcolor("#AAAAAA");

        randomShape(shrink1);
        randomShape(shrink2);
        
        var playerDimensions = { x: width/2 - 20, y: height/2 - 20, w: 40, h: 40}; 

        var playerShape = Crafty.e("2D, Canvas, Shape, Tween")
            .attr(playerDimensions)
            .sides(3)
            .fillcolor("#AAAAAA");
        playerShape.z = 1000;

        var tweenToPlayer = function(shape, time, easingFunc) {
            if (time === undefined) {
                time = defaultTweenTime;
            }

            if (easingFunc === undefined) {
                easingFunc = defaultEasingFunc;
            }

            shape.tween(playerDimensions, time, easingFunc);
        }

        var tweenEnd = function() {
            var ender = (this === shrink1 ? shrink1 : shrink2);
            var starter = (this === shrink1 ? shrink2 : shrink1);

            if (ender.sides() != playerShape.sides()) {
                /* Lose */
                lost = true;
                lostTime = (new Date()).getTime();
                Crafty.pause();
            } else {
                /* Success */
                ender.z = 0;
                randomShape(ender);

                starter.z = 1;
                tweenToPlayer(starter);

                playerShape.attr({ x: width/2 - 30, y: height/2 - 30, w: 60, h: 60});
                tweenToPlayer(playerShape, 300, "linear");
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
                    Crafty.pause();
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
