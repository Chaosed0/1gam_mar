
define(['crafty'], function(Crafty) {

    var draw = function(e) {
        if(!e.type === "canvas") {
            e.destroy();
            console.log("Shape doesn't support anything other than canvas");
        }

        e.ctx.beginPath();

        if (this._type === "RegularPolygon") {
            var angle = -Math.PI / 2;
            var radius = Math.min(this._w, this._h)/2;
            var sides = this._data;

            for(var i = 0; i < sides; i++) {
                var p = {x: this.x + this._w/2, y: this.y + this._h/2};
                p.x += Math.cos(angle) * radius;
                p.y += Math.sin(angle) * radius;

                if(i === 0) {
                    e.ctx.moveTo(p.x, p.y);
                } else {
                    e.ctx.lineTo(p.x, p.y);
                }

                angle += (2 * Math.PI / sides);
            }
        } else if (this._type === "Circle") {
            var radius = Math.min(this._w, this._h)/2;
            e.ctx.arc(this.x + this.w/2, this.y + this.h/2, radius, 0, 2 * Math.PI);
        }

        e.ctx.closePath();

        if (this._fillcolor) {
            e.ctx.fillStyle = this._fillcolor;
            e.ctx.fill();
        }

        if (this._strokecolor) {
            e.ctx.strokeStyle = this._strokecolor;
            e.ctx.stroke();
        }
    }

    Crafty.c("Shape", {
        _type: null,
        _data: null,
        _strokecolor: '#000000',
        _fillcolor: null,
        ready: false,

        init: function() {
            this.ready = true;
            this.bind("Draw", draw);
            this.trigger("Invalidate");
        },

        remove: function() {
            this.unbind("Draw", draw);
            this.trigger("Invalidate");
        },

        regularpolygon: function(sides) {
            this._type = "RegularPolygon";
            this._data = sides;
            return this;
        },

        circle: function() {
            this._type = "Circle";
            this._data = null;
            return this;
        },

        strokecolor: function(color) {
            this._strokecolor = color;
            this.trigger("Invalidate");
            return this;
        },

        fillcolor: function(color) {
            this._fillcolor = color;
            this.trigger("Invalidate");
            return this;
        },
    });
});
