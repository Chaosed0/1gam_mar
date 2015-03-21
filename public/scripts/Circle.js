
define(['crafty', './Util'], function(Crafty, u) {

    var draw = function(e) {
        if (!this._radius) {
            return;
        }

        if (!e.type === "canvas") {
            e.destroy();
            console.log("Circle doesn't support anything other than canvas!");
        }

        e.ctx.beginPath();

        if (this._strokecolor) {
            e.ctx.strokeStyle = this._strokecolor;
        }

        e.ctx.arc(this._center.x, this._center.y, this._radius, 0, 2 * Math.PI);

        e.ctx.stroke();

        if (this._fillcolor) {
            e.ctx.fillStyle = this._fillcolor;
            e.ctx.fill();
        }
    }

    Crafty.c("Circle", {
        _strokecolor: "#000000",
        _fillcolor: null,
        _radius: null,
        _center: null,
        ready: false,

        init: function() {
            Object.defineProperty(this, 'radius', {
                set: function (v) {
                    this._radius = v;
                    this._resetPos();
                    this.trigger("Invalidate");
                },
                get: function () {
                    return this._radius;
                },
                configurable: true,
                enumerable: true
            });

            this.ready = true;
            this.bind("Draw", draw);
            this.trigger("Invalidate");
        },

        remove: function() {
            this.trigger("Invalidate");
            this.unbind("Draw", draw);
        },

        circle: function(x, y, radius) {
            this._radius = radius;
            this._center = {x: x, y: y};

            this._resetPos();

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

        _resetPos: function() {
            /* Multiply by a bit, the dirty rectangle doesn't quite catch everything */
            this.x = this._center.x - this.radius*1.1;
            this.y = this._center.y - this.radius*1.1;
            this.w = this.radius * 2.2;
            this.h = this.radius * 2.2;
        },
    });
});
