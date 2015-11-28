define("Board", ["jquery", "Critter"], function ($, Critter) {

    var Board = function () {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        var screenWidth = window.innerWidth;
        var screenHeight = window.innerHeight;
        canvas.width = screenWidth;
        canvas.height = screenHeight;
        var targetX = 10;
        var targetY = 10;
        var offsetX = 10;
        var offsetY = 10;

        /** clear screen */
        this.clearScreen = function () {
            ctx.clearRect(0, 0, screenWidth, screenHeight);
        }

        /** draw circle */
        this.drawCircle = function (paramX, paramY, radius, color) {
            var tx = paramX - offsetX;
            var ty = paramY - offsetY;
            var dist = Math.sqrt(tx * tx + ty * ty);
            var rad = Math.atan2(ty, tx);
            var angle = rad / Math.PI * 180;
            /* draw vision */

            ctx.beginPath();
            ctx.arc(paramX, paramY, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        this.drawChasers = function (chasers, mouse, userChaser) {
            var currentUserChaserPosition = mouse;
            /* draw them in this order, radii first, then center circles, so we can see behind the vision radius to the critter inside.  User first, than chasers.  */
            determineDeltaPosition(chasers, userChaser, currentUserChaserPosition, userChaser, mouse);
            Board.getInstance().drawCircle(userChaser.x, userChaser.y, userChaser.vision, userChaser.visionColor);

            /* draw all other circles.
  			  May need to provide a minimum distance from other members of flock.
   			 Speed variance may help with this. */
            for (var chaser in chasers) {
                /* get the current chaser's position */
                var currentChaserSpeed = chasers[chaser].speed;

                /* find best path to user's circle, get x and y component */
                determineDeltaPosition(chasers, chasers[chaser], userChaser, userChaser, mouse);

                /* move the circle towards the user's circle.  Draw the vision radius first */
                Board.getInstance().drawCircle(chasers[chaser].x, chasers[chaser].y, chasers[chaser].vision, chasers[chaser].visionColor);
            }

            Critter.getInstance().setColorIntensityLevel(userChaser);
            Board.getInstance().drawCircle(userChaser.x, userChaser.y, userChaser.radius, userChaser.color);
            for (var chaser in chasers) {
                var currentChaser = chasers[chaser];
                /* determine energy level, determine if chaser should be removed from array.  */
                for (var chasee in chasers) {
                    if (chasers[chaser] && chasers[chasee] && chaser != chasee) {
                        var relativePosition = getRelativePosition(chasers[chaser], chasers[chasee]);
                        if (relativePosition <= 1) {
                            consumeOtherChaser(chasers[chaser], chasers[chasee], chasee, relativePosition, userChaser);
                        }
                    }
                }

                /* we've done some removing, make sure it doesn't cause problems*/
                if (chasers[chaser]) {
                    /* allow user to consume, and then to be consumed*/
                    var userRelativePosition = getRelativePosition(userChaser, chasers[chaser]);
                    if (userRelativePosition <= 1) {
                        consumeOtherChaser(userChaser, chasers[chaser], chaser, userRelativePosition, userChaser);
                    }

                    var relativePosition = getRelativePosition(chasers[chaser], userChaser);
                    if (relativePosition <= 1) {
                        consumeOtherChaser(chasers[chaser], userChaser, -1, relativePosition, userChaser);
                    }
                    Critter.getInstance().setColorIntensityLevel(userChaser);
                    Critter.getInstance().setColorIntensityLevel(currentChaser);

                    Board.getInstance().drawCircle(currentChaser.x, currentChaser.y, currentChaser.radius, currentChaser.color);
                    /* find out if the game is over */
                    determineGameOver(userChaser, chasers);
                }
            }
        }

        function determineDeltaPosition(chasers, currentChaser, chaseePosition, userChaser, mouse) {
            var currentChaserMove = getChaserMovement(chasers, currentChaser, userChaser, mouse);
            var newPositionX = currentChaser.x + currentChaserMove.x;
            if (newPositionX < 0) {
                newPositionX = screenWidth + newPositionX;
            }
            if (newPositionX > screenWidth) {
                newPositionX = newPositionX % screenWidth;
            }
            var newPositionY = currentChaser.y + currentChaserMove.y;
            if (newPositionY < 0) {
                newPositionY = screenHeight + newPositionY;
            }
            if (newPositionY > screenHeight) {
                newPositionY = newPositionY % screenHeight;
            }
            currentChaser.x = newPositionX;
            currentChaser.y = newPositionY;
        }
        this.getRandomPointOnScreen = function () {
            var randomX = Math.floor((Math.random() * screenWidth) + 1);
            var randomY = Math.floor((Math.random() * screenHeight) + 1);
            return {
                "x": randomX,
                "y": randomY
            };
        }

        function getRelativePosition(firstPosition, secondPosition) {
            try {
                return (Math.abs(firstPosition.x - secondPosition.x) + Math.abs(firstPosition.y - secondPosition.y));
            } catch (e) {
                console.log("Error found: " + e);
            }
        }


        function isCurrentChaserHunting(currentChaser, chasee) {
            return currentChaser.currentEnergy >= chasee.currentEnergy;
        }



        function pickDirection(currentChaser) {
            var deltaX = Math.floor((Math.random() * currentChaser.speed) + 1);
            var deltaY = currentChaser.speed - deltaX;
            /* great, determined how far to go in X & Y, now determine positive or negative of each.  */
            var determinePositiveX = Math.floor((Math.random() * 2));
            var determinePositiveY = Math.floor((Math.random() * 2));
            if (determinePositiveX === 0 || currentChaser.x === screenWidth) {
                deltaX = -deltaX;
            } else {
                deltaX = Math.abs(deltaX);
            }
            if (determinePositiveY === 0 || currentChaser.y === screenHeight) {
                deltaY = -deltaY;
            } else {
                deltaY = Math.abs(deltaY);
            }
            var direction = {
                "deltaX": deltaX,
                "deltaY": deltaY
            };
            currentChaser.direction = direction;
        }

        function getRelativeSlope(currentChaser, chasee, userChaser) {
            var relativeSlope = {};
            var relativePosition = getRelativePosition(currentChaser, chasee);
            var deltaX = 0;
            var deltaY = 0;

            var singleSlope = {};
            if (relativePosition < currentChaser.vision || currentChaser == userChaser) {
                singleSlope = getSingleChaserSlope(currentChaser, chasee);
                deltaX = singleSlope.x;
                deltaY = singleSlope.y;
            } else {
                /* If you can't see it, you don't get to act on it. */
            }

            if (isCurrentChaserHunting(currentChaser, chasee)) {
                relativeSlope.x = deltaX;
                relativeSlope.y = deltaY;
            } else {
                relativeSlope.x = -deltaX;
                relativeSlope.y = -deltaY;
            }
            return relativeSlope;
        }

        function getChaserMovement(chasers, currentChaser, userChaser, mouse) {
            var compositeSlope = {
                "x": 0,
                "y": 0
            };
            var chaserCount = 0;
            /*  for each chaser in visual range, get the individual vector.
        sum those vectors.  Use the result as the slope.
        determine movement based on the sum of these parts.
    */
            if (currentChaser !== userChaser) {
                for (var chaserElement in chasers) {
                    var loopChaser = chasers[chaserElement];
                    if (loopChaser !== currentChaser) {
                        var relativeSlope = getRelativeSlope(currentChaser, loopChaser, userChaser);
                        compositeSlope.x = compositeSlope.x + relativeSlope.x;
                        compositeSlope.y = compositeSlope.y + relativeSlope.y;
                        /* only count this one if he had an effect */
                        if (relativeSlope.x != 0 || relativeSlope.y != 0) {
                            chaserCount++;
                        }
                    }
                }
                /* determine composite slope from user's chaser */
                var userRelativeSlope = getRelativeSlope(currentChaser, userChaser);
                compositeSlope.x = compositeSlope.x + userRelativeSlope.x;
                compositeSlope.y = compositeSlope.y + userRelativeSlope.y;
                /* only count this one if he had an effect */
                if (userRelativeSlope.x != 0 || userRelativeSlope.y != 0) {
                    chaserCount++;
                }
            } else {
                /* nor to move the user closer to the mouse, if that's what's going on.*/
                var userChaserSlope = getSingleChaserSlope(currentChaser, mouse);
                compositeSlope.x = compositeSlope.x + userChaserSlope.x;
                compositeSlope.y = compositeSlope.y + userChaserSlope.y;
                chaserCount++;
            }

            /* if both of those are zero, go with the current direction.  If there is no current direction, pick one.  */
            if (chaserCount > 0) {
                var deltaX = compositeSlope.x / chaserCount;
                var deltaY = compositeSlope.y / chaserCount;
                var floorX = (deltaX % 1 < .5);
                if (floorX) {
                    deltaX = Math.floor(deltaX);
                    deltaY = Math.ceil(deltaY);
                } else {
                    deltaX = Math.ceil(deltaX);
                    deltaY = Math.floor(deltaY);
                }

            } else {
                /*   if there's no current direction, pick one. */
                /* if they were going a direction before, keep going.  Otherwise pick a random direction, and go that way.  */
                if (currentChaser.direction == undefined) {
                    pickDirection(currentChaser);
                }
                deltaX = currentChaser.direction.deltaX;
                deltaY = currentChaser.direction.deltaY;
            }
            /* set changes in return object*/
            compositeSlope.x = deltaX;
            compositeSlope.y = deltaY;
            return compositeSlope;
        }

        function getSingleChaserSlope(currentChaser, chasee) {
            var speed = currentChaser.speed;
            var singleSlope = {};
            if (currentChaser.x != chasee.x) {
                var slope = Math.abs(currentChaser.y - chasee.y) / Math.abs(currentChaser.x - chasee.x);
                if (slope != 0) {
                    deltaX = (speed / (1 + slope));
                    if (currentChaser.x > chasee.x) {
                        deltaX = -deltaX;
                    }
                    deltaY = (speed / (1 + (1 / slope)));
                    if (currentChaser.y > chasee.y) {
                        deltaY = -deltaY;
                    }
                } else {
                    if (currentChaser.x > chasee.x) {
                        deltaX = -speed;
                    } else {
                        deltaX = speed;
                    }
                    deltaY = 0;
                }
            } else {
                deltaX = 0;
                if (currentChaser.y > chasee.y) {
                    deltaY = -speed;
                } else {
                    deltaY = speed;
                }
            }
            singleSlope.x = deltaX;
            singleSlope.y = deltaY;
            return singleSlope;
        }



        function consumeOtherChaser(chaser, chasee, chaseePosition, relativePosition, userChaser) {
            /* if the chaser is closer than speed to the user, game over man.  */

            chasee.currentEnergy = chasee.currentEnergy - 1;
            if (chaser.currentEnergy < chaser.total) {
                chaser.currentEnergy = chaser.currentEnergy + 1;
            }
            if (chasee != userChaser && chasee.currentEnergy <= 0) {
                chasers.pop(chaseePosition);
            }
        }

        function determineGameOver(userChaser, chasers) {
            if (userChaser.currentEnergy == 0) {
                gameOver(false);
            } else if (chasers.length == 0) {
                gameOver(true);
            }
        }

        function gameOver(userWon) {
            if (userWon) {
                alert("Congratulations, you won!");
            } else {
                alert("Game Over.  Sorry, you lost.");
            }
            clearInterval(intervalReferences);
            startUp();
        }
    }

    var instance = null;
    Board.getInstance = function () {
        if (null == instance) {
            instance = new Board();
        }
        return instance;
    };
    return Board;
});