
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
        var shapeTypes = ["RegularPolygon", "Circle"];
        var type = u.randomElem(shapeTypes);

        if (type === "RegularPolygon") {
            var sides = 3;
            shape.regularpolygon(3);

            shape.x = - width * 1.5;
            shape.y = - height * 1.5;
            shape.w = width * 4;
            shape.h = height * 4;
        } else if (type === "Circle") {
            shape.circle();
            shape.x = - width / 2;
            shape.y = - height / 2;
            shape.w = width * 2;
            shape.h = height * 2;
        }
    }

    Crafty.scene("Main", function () {
        console.log("MAIN");
        Crafty.background("#EEEEEE");

        var shrink1 = Crafty.e("2D, Canvas, Shape, Tween")
            .attr({ x: - width * 1.5, y: - height * 1.5, w: width * 4, h: height * 4, z: 1 })
            .regularpolygon(3)
            .fillcolor("#EEEEEE")
            .tween({x: width/2 - 20, y: height/2 - 20, w: 40, h: 40}, 2000);

        var shrink2 = Crafty.e("2D, Canvas, Shape, Tween")
            .attr({ x: - width * 1.5, y: - height * 1.5, w: width * 4, h: height * 4, z: 0 })
            .regularpolygon(3)
            .fillcolor("#111111");

        var tweenEnd = function() {
            var ender = (this === shrink1 ? shrink1 : shrink2);
            var starter = (this === shrink1 ? shrink2 : shrink1);

            ender.z = 0;
            randomShape(ender);

            starter.z = 1;
            starter.tween({x: width/2 - 20, y: height/2 - 20, w: 40, h: 40}, 2000);
        };

        shrink1.bind("TweenEnd", tweenEnd);
        shrink2.bind("TweenEnd", tweenEnd);

        var shape = Crafty.e("2D, Canvas, Shape")
            .attr({ x: width/2 - 20, y: height/2 - 20, w: 40, h: 40, z: 1000 })
            .regularpolygon(3)
            .fillcolor("#EEEEEE");
    });

    Crafty.scene("Load");
});
