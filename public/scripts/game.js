
define(['crafty', 'jquery',
        './Circle',
    ], function(Crafty, $) {
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

    Crafty.scene("Main", function () {
        console.log("MAIN");
        Crafty.background("#EEEEEE");

        var shrink1 = Crafty.e("2D, Canvas, Circle, Tween")
            .attr({ z: 1 })
            .circle(width/2, height/2, width * 1.5)
            .fillcolor("#EEEEEE")
            .tween({radius: 20}, 2000);

        var shrink2 = Crafty.e("2D, Canvas, Circle, Tween")
            .attr({ z: 0 })
            .fillcolor("#111111")
            .circle(width/2, height/2, width * 1.5);

        var tweenEnd = function() {
            var ender = (this === shrink1 ? shrink1 : shrink2);
            var starter = (this === shrink1 ? shrink2 : shrink1);

            ender.z = 0;
            ender.radius = width * 1.5;

            starter.z = 1;
            starter.tween({radius: 20}, 2000);
        };

        shrink1.bind("TweenEnd", tweenEnd);
        shrink2.bind("TweenEnd", tweenEnd);

        var shape = Crafty.e("2D, Canvas, Circle")
            .attr({ z: 1000 })
            .circle(width/2, height/2, 20)
            .fillcolor("#EEEEEE");
    });
    
    Crafty.scene("Load");
});
