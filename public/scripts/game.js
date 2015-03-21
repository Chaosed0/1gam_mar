
define(['crafty', 'jquery',
        './Circle',
    ], function(Crafty, $) {
    var self = this;
    var map;
    
    var width = 800;
    var height = 600;
    var gameElem = document.getElementById('game');

    Crafty.init(width, height, gameElem);  			  		
    Crafty.background("#FFFFFF");

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

        var shape = Crafty.e("2D, Canvas, Circle")
            .attr({x: width/2, y: height/2 })
            .circle(0, 0, 20, "#000000");
    });
    
    Crafty.scene("Load");
});
