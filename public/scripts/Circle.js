
define(['crafty', './Util'], function(Crafty, u) {

    var draw = function(e) {
        if (!this._circle) {
            return;
        }

        if (!e.type === "canvas") {
            e.destroy();
            console.log("Circle doesn't support anything other than canvas!");
        }

        e.ctx.beginPath();

        console.log(this.x + this._circle.x, this.y + this._circle.y, this._circle.radius);
        e.ctx.strokeStyle = this._color;
        e.ctx.arc(this.x + this._circle.x, this.y + this._circle.y,
                this._circle.radius, 0, 2 * Math.PI);

        e.ctx.stroke();

        if (this._color) {
            e.ctx.fillStyle = this._color;
            e.ctx.fill();
        }
    }

    Crafty.c("Circle", {
        _circle: null,
        _color: null,
        ready: false,

        init: function() {
            this.ready = true;
            this.bind("Draw", draw);
            this.trigger("Invalidate");
        },

        remove: function() {
            this.trigger("Invalidate");
            this.unbind("Draw", draw);
        },

        circle: function() {
            if (arguments.length < 3) {
                this._circle = arguments[0];
                if (arguments.length > 1) {
                    this._color = arguments[1];
                }
            } else if (arguments.length >= 3) {
                this._circle = new Crafty.circle(arguments[0], arguments[1], arguments[2]);
                if (arguments.length > 3) {
                    this._color = arguments[3];
                }
            } else {
                u.assert(false, "Wrong number of arguments passed to Circle component");
            }

            this.x = this.x + this._circle.x - this._circle.radius;
            this.y = this.y + this._circle.y - this._circle.radius;
            this.w = this._circle.radius*2;
            this.h = this._circle.radius*2;
        }
    });
});
