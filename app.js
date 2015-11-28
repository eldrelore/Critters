requirejs.config({
    baseUrl: "js",
    paths: {
        "jquery": "lib/jquery-2.1.1.min",
        "Game": "Game",
        "Critter": "Critter",
        "Board": "Board",
        "Events": "Events"
    }
});
define(["jquery", "Game", "Critter", "Events", "Board"], function ($, Game, Critter, Events, Board) {
    console.log("starting...");
    var game = Game.getInstance();
});