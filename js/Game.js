define("Game", ["Critter", "Events", "Board"], function (Critter, Events, Board) {

    var Game = function () {
        var chasers = [];
        var userChaser = {};
        var mouse = {
            x: 0,
            y: 0
        };

        /* TODO:
Done - 1.  add vision (and visible vision radius)
Done - 2.  modify to have user's chaser chase the mouse, not be the mouse
Done - 3. Vision part 2: only chase those you can see, otherwise pick a random direction, and go that direction.

Done -- 4.  Add energy / eating
Done -- 5.  add consume or flight, based on relative and absolute energy?
Done --x.  modify so that the other chasers chase each other.

Done -- TODO:  fix corner bug, fix why chasers won't chase user anymore.
Fixed via allowing cross-over from top to bottom/ right to left, etc.

y.  Add screen-edge-transition for the user's chaser.


6.  add random "food"?
    Does it replenish over time once placed?
    Is it totally gone when out?

7.  start adding other attributes that add up to a value.
    defenses
    attacks
    hunger over time?
    flight (z-index)
    different habitat types (cold, water, mountain, etc)?  Advantages in those areas?

8.  Graphic improvements.
9.  Come up with better winning conditions.
*/

        function drawBoard() {
            /* clear board*/
            Board.getInstance().clearScreen();
            /* draw the chasers, including the user's chaser */
            Board.getInstance().drawChasers(chasers, mouse, userChaser);
        }

        function addChasers(count) {
            for (var i = 0; i < count; i++) {
                var chaser = getNewCritter("chaser");
                chaser.initialColor = "#FF0000";
                chaser.visionColor = "#DDDDDD";
                chaser.avoidDistance = 15;
                var initialPoint = Board.getInstance().getRandomPointOnScreen();
                chaser.x = initialPoint.x;
                chaser.y = initialPoint.y;
                chasers[chasers.length + 1] = chaser;
            }
        }

        var intervalReferences;

        function startUp() {
            clearChasers();

            var events = Events.getInstance();
            events.setMouseMove(mouse);
            events.setResize();

            addUserChaser();
            addChasers(20);
            intervalReferences = setInterval(drawBoard, 10);
        }

        function addUserChaser() {
            userChaser = getNewCritter("user");
            userChaser.x = mouse.x;
            userChaser.y = mouse.y;
            userChaser.initialColor = "#0000FF";
        }

        function clearChasers() {
            chasers = [];
        }

        function getNewCritter(team) {
            var color = "#000000";
            var initialColor = "#000000";
            var radius = 5;
            var speed = 5;
            var visionRadius = 100;
            var visionColor = "#DDDDDD";
            var avoidDistance = 15;
            var currentX = 0;
            var currentY = 0;
            var totalEnergy = 100;
            var currentEnergy = Math.floor((Math.random() * totalEnergy) + 1);
            var hasEnergyLevelChanged = true;
            var newCritter = {
                "initialColor": color,
                "hasEnergyLevelChanged": hasEnergyLevelChanged,
                "color": color,
                "radius": radius,
                "x": currentX,
                "y": currentY,
                "speed": speed,
                "vision": visionRadius,
                "visionColor": visionColor,
                "avoidDistance": avoidDistance,
                "totalEnergy": totalEnergy,
                "currentEnergy": currentEnergy,
                "team":team
            };
            return newCritter;
        }
        startUp();
    }
    var instance = null;
    Game.getInstance = function () {
        if (null == instance) {
            instance = new Game();
        }
        return instance;
    };
    return Game;
});