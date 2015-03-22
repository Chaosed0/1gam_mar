
define(['crafty', 'jquery', './Util',
        './Circle',
        './Shape',
    ], function(Crafty, $, u) {
    var self = this;
    var map;
    
    var width = 800;
    var height = 600;
    var gameElem = document.getElementById('game');

    Crafty.init(width, height, gameElem);  			  		

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
            shape.x = - width * 1.5;
            shape.y = - height * 1.5;
            shape.w = width * 4;
            shape.h = height * 4;
        } else if (sides < 7) {
            shape.x = - width;
            shape.y = - height;
            shape.w = width * 3;
            shape.h = height * 3;
        } else {
            shape.x = - width / 2;
            shape.y = - height / 2;
            shape.w = width * 2;
            shape.h = height * 2;
        }
    }

    Crafty.scene("Main", function () {
        console.log("MAIN");
        Crafty.background("#AAAAAA");

        var shrink1 = Crafty.e("2D, Canvas, Shape, Tween")
            .fillcolor("#AAAAAA")
            .tween({x: width/2 - 20, y: height/2 - 20, w: 40, h: 40}, 2000, "EaseInOut");

        var shrink2 = Crafty.e("2D, Canvas, Shape, Tween")
            .fillcolor("#666666");

        randomShape(shrink1);
        randomShape(shrink2);

        var tweenEnd = function() {
            var ender = (this === shrink1 ? shrink1 : shrink2);
            var starter = (this === shrink1 ? shrink2 : shrink1);

            ender.z = 0;
            randomShape(ender);

            starter.z = 1;
            starter.tween({x: width/2 - 20, y: height/2 - 20, w: 40, h: 40}, 2000, "easeInQuad");
        };

        shrink1.bind("TweenEnd", tweenEnd);
        shrink2.bind("TweenEnd", tweenEnd);

        var shape = Crafty.e("2D, Canvas, Shape")
            .attr({ x: width/2 - 20, y: height/2 - 20, w: 40, h: 40, z: 1000 })
            .sides(3)
            .fillcolor("#EEEEEE");

        var keyDownHandler = function(e) {
            var sides = shape.sides();
            if (e.key === Crafty.keys.LEFT_ARROW) {
                if (sides > 3) {
                    shape.sides(sides-1);
                }
            } else if (e.key === Crafty.keys.RIGHT_ARROW) {
                if (sides < 8) {
                    shape.sides(sides+1);
                }
            }

            console.log(shape.sides());
        }

        Crafty.bind("KeyDown", keyDownHandler);
    });

    Crafty.scene("Load");
});
