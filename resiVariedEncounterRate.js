//=============================================================================
// Resi - Varied Encounter Rate
// resiVariedEncounterRate.js
// Version: 1.00
//=============================================================================

//=============================================================================
/*:
* @plugindesc This plugin allows for modifying how many steps a player takes until an encounter occurs.
* @help
* In RPG Maker MV, the encounter rate goes down by 1 every time the player moves
* until 0, then an encounter happens. There are unique circumstances to decrease
* or increase how many steps are required until an encounter, but these are not
* common.
* 
* This plugin is simple in nature and uses region IDs to modify the steps until encounter.
* Through the plugin parameters you can set which Region IDs modify encounter steps and
* whether or not there's a flat increase/decrease immediately and any potential multiplicative 
* modifiers (how it works with Encounter Half) when a player steps onto a region tile set by you.
*
* The above mentioned unique circumstances are as follows:
* - If the player is in a bush tile, the encounter rate goes down by 2 every step.
* - If the player has encounter half tag (given through equipment), the encounter rate
* goes down by * 0.5 every step.
* - If the player is in a Ship, the encounter rate goes down by * 0.5 every step.
*
* These effects stack in the order they appear. If the player has Encounter Half and
* is on a Ship, the value will be multiplied by 0.5 twice, meaning the encounter rate goes
* down to 0.25. These special effects do not repeat though. Say, for instance, there are multiple 
* instances of Encounter Half it is only applied once and never again.
*
* It would be possible however, for a plugin creator, to place notetags onto States
* or equipments to modify how many steps until an encounter should occur.
*
* Terms of use: 
* - Free to use in commercial/noncommercial games, just credit me.
* 
* @author Resi (ResidntEvl)
*
* @param Region One
* @desc Region ID that will be used to modify the steps until encounter
* @default 1
*
* @param Region One Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region One Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*
* @param Region Two
* @type number
* @desc Region ID that will be used to modify the steps until encounter
* @default 2
*
* @param Region Two Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region Two Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*
* @param Region Three
* @type number
* @desc Region ID that will be used to modify the steps until encounter
* @default 3
*
* @param Region Three Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region Three Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*
* @param Region Four
* @type number
* @desc Region ID that will be used to modify the steps until encounter
* @default 4
*
* @param Region Four Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region Four Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*
* @param Region Five
* @type number
* @desc Region ID that will be used to modify the steps until encounter
* @default 5
*
* @param Region Five Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region Five Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*
* @param Region Six
* @type number
* @desc Region ID that will be used to modify the steps until encounter
* @default 6
*
* @param Region Six Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region Six Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*
* @param Region Seven
* @type number
* @desc Region ID that will be used to modify the steps until encounter
* @default 7
*
* @param Region Seven Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region Seven Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*
* @param Region Eight
* @type number
* @desc Region ID that will be used to modify the steps until encounter
* @default 8
*
* @param Region Eight Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region Eight Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*
* @param Region Nine
* @type number
* @desc Region ID that will be used to modify the steps until encounter
* @default 9
*
* @param Region Nine Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region Nine Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*
* @param Region Ten
* @type number
* @desc Region ID that will be used to modify the steps until encounter
* @default 10
*
* @param Region Ten Modifier
* @type number
* @min -999
* @max 999
* @desc The amount of steps to add/subtract to the total required to get an encounter when they first step on this ID
* @default 0
*
* @param Region Ten Multiplier
* @type number
* @decimals 2
* @desc Multiplicative value to the end result. Lower is slower, higher is faster.
* @default 1.00
*/
//=============================================================================

// I should be aliasing the functions but it calls the functions itself so any re-write is doubled.
var Resi = Resi || {};
Resi.Params = Resi.Params || {};
Resi.Parameters = PluginManager.parameters('resiVariedEncounterRate');

_resi_Game_Player_prototype_initMembersTwo = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function () {
    _resi_Game_Player_prototype_initMembersTwo.call(this);
    this._regionTile = 0;
};

_resi_Game_Player_prototype_updateNonmoving = Game_Player.prototype.updateNonmoving;
// Runs when the player is moving and has stopped
Game_Player.prototype.updateNonmoving = function (wasMoving) {
    // Code is run when the player is not inside of an event
    //_resi_Game_Player_prototype_updateNonmoving.call(this);
    if (!$gameMap.isEventRunning()) {
        if (wasMoving) {
            $gameParty.onPlayerWalk();
            this.checkEventTriggerHere([1, 2]);
            if ($gameMap.setupStartingEvent()) {
                return;
            }
        }
        if (this.triggerAction()) {
            return;
        }
        // If player was Moving, updateEncounterCount
        if (wasMoving) {
            // Check the previous tile the player was on
            this._oldRegionTile = this._regionTile;
            // Also get the new tile they are on
            this._regionTile = this.regionId(this._x, this._y);
            this.updateEncounterCount();
        } else {
            $gameTemp.clearDestination();
        }
    }
};

_resi_Game_Player_prototype_updateEncounterCount = Game_Player.prototype.updateEncounterCount;
Game_Player.prototype.updateEncounterCount = function () {
    //_resi_Game_Player_prototype_updateEncounterCount.call(this);
    if (this.canEncounter()) {
        var array = [Number(Resi.Parameters['Region One']), Number(Resi.Parameters['Region Two']), Number(Resi.Parameters['Region Three']), Number(Resi.Parameters['Region Four ']), Number(Resi.Parameters['Region Five']), Number(Resi.Parameters['Region Six']), Number(Resi.Parameters['Region Seven']), Number(Resi.Parameters['Region Eight']), Number(Resi.Parameters['Region Nine']), Number(Resi.Parameters['Region Ten'])];
        var arrayMod = [Number(Resi.Parameters['Region One Modifier']), Number(Resi.Parameters['Region Two Modifier']), Number(Resi.Parameters['Region Three Modifier']), Number(Resi.Parameters['Region Four Modifier']), Number(Resi.Parameters['Region Five Modifier']), Number(Resi.Parameters['Region Six Modifier']), Number(Resi.Parameters['Region Seven Modifier']), Number(Resi.Parameters['Region Eight Modifier']), Number(Resi.Parameters['Region Nine Modifier']), Number(Resi.Parameters['Region Ten Modifier'])];
        var index = array.indexOf(this._regionTile);
        // Check if this is the first time the player has entered this Region ID
        if (array.includes(this._regionTile) && this._regionTile !== this._oldRegionTile) {
            // A value has to be returned, so we should modify the encounterCount here instead
            this._encounterCount += arrayMod[index];
        }
        this._encounterCount -= this.encounterProgressValue();
    }
};

_resi_Game_Player_prototype_encounterProgressValue = Game_Player.prototype.encounterProgressValue;
Game_Player.prototype.encounterProgressValue = function () {
    //_resi_Game_Player_prototype_encounterProgressValue.call(this);

    // value refers to the number in which the ._encounterCount variable should be modified by
    // By default the value is 1 unless the player is in the BUSH TAG tiles, then it is 2.
    // The value further gets modified if the party has special flags
    // If the player has Special Flag Half Encounter, the value is modified by 0.5
    // If the player is in a ship, the value is modified by 0.5
    var value = $gameMap.isBush(this.x, this.y) ? 2 : 1;
    var array = [Number(Resi.Parameters['Region One']), Number(Resi.Parameters['Region Two']), Number(Resi.Parameters['Region Three']), Number(Resi.Parameters['Region Four ']), Number(Resi.Parameters['Region Five']), Number(Resi.Parameters['Region Six']), Number(Resi.Parameters['Region Seven']), Number(Resi.Parameters['Region Eight']), Number(Resi.Parameters['Region Nine']), Number(Resi.Parameters['Region Ten'])];
    //var arrayMod = [Number(Resi.Parameters['Region One Modifier']), Number(Resi.Parameters['Region Two Modifier']), Number(Resi.Parameters['Region Three Modifier']), Number(Resi.Parameters['Region Four Modifier']), Number(Resi.Parameters['Region Five Modifier']), Number(Resi.Parameters['Region Six Modifier']), Number(Resi.Parameters['Region Seven Modifier']), Number(Resi.Parameters['Region Eight Modifier']), Number(Resi.Parameters['Region Nine Modifier']), Number(Resi.Parameters['Region Ten Modifier'])];
    var arrayMult = [Number(Resi.Parameters['Region One Multiplier']), Number(Resi.Parameters['Region Two Multiplier']), Number(Resi.Parameters['Region Three Multiplier']), Number(Resi.Parameters['Region Four Multiplier']), Number(Resi.Parameters['Region Five Multiplier']), Number(Resi.Parameters['Region Six Multiplier']), Number(Resi.Parameters['Region Seven Multiplier']), Number(Resi.Parameters['Region Eight Multiplier']), Number(Resi.Parameters['Region Nine Multiplier']), Number(Resi.Parameters['Region Ten Multiplier'])];
    // Check if player is on a defined Region ID
    if (array.includes(this._regionTile)) {
        // Determine the index inside of the array where this RegionID is
        var index = array.indexOf(this._regionTile);
        if (index >= 0) {
            if (arrayMult[index] < 0.10) {
                value *= 0.10;
            } else {
                value *= arrayMult[index];
            }
        }
    } else {
        value = 1;
    }
    if ($gameParty.hasEncounterHalf()) {
        value *= 0.5;
    }
    if (this.isInShip()) {
        value *= 0.5;
    }
    return value;
};