define("Events", ["jquery"], function ($) {

    var Events = function () {

        this.setMouseMove = function (mouse) {
            document.onmousemove = function (e) {
                mouse.x = e.clientX || e.pageX;
                mouse.y = e.clientY || e.pageY;
            }
        }

        var resizeEnd = function () {
            if (new Date() - rtime < delta) {
                setTimeout(resizeend, delta);
            } else {
                timeout = false;
                screenWidth = window.innerWidth;
                screenHeight = window.innerHeight;
                canvas.width = screenWidth;
                canvas.height = screenHeight;
            }
        }

        /* resize logic */
        var rtime = new Date(1, 1, 2000, 12, 00, 00);
        var timeout = false;
        var delta = 200;
        this.setResize = function () {
            window.onresize = function () {
                rtime = new Date();
                if (timeout === false) {
                    timeout = true;
                    setTimeout(resizeEnd, delta);
                }
            }
        }
    }

    var instance = null;
    Events.getInstance = function () {
        if (null == instance) {
            instance = new Events();
        }
        return instance;
    };
    return Events;
});