define("Critter", ["jquery"], function ($) {

    var Critter = function () {
        var getColorIntensityValue = function (hexRep, percentage) {
            var hexValue = (Math.floor(parseInt(hexRep.substring(0, 2), 16) * percentage)).toString(16);
            if (hexValue == "0") {
                hexValue = "00";
            }
            return hexValue;
        }

        this.setColorIntensityLevel = function (critter) {
            if (critter.hasEnergyLevelChanged) {
                var energyPercentage = critter.currentEnergy / critter.totalEnergy;
                var red = getColorIntensityValue(critter.initialColor.substring(1, 3), energyPercentage);
                var green = getColorIntensityValue(critter.initialColor.substring(3, 5), energyPercentage);
                var blue = getColorIntensityValue(critter.initialColor.substring(5, 7), energyPercentage);
                var adjustedHexValue = "#" + red + green + blue;
                critter.color = adjustedHexValue;
            }
        }
    }

    var instance = null;
    Critter.getInstance = function () {
        if (null == instance) {
            instance = new Critter();
        }
        return instance;
    };
    return Critter;
});