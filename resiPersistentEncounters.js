//=============================================================================
// Resi - Persistent Encounter Rate
// resiPersistentEncounters.js
// Version: 1.00
//=============================================================================

//=============================================================================
/*:
* @plugindesc This plugin overrides the default functionality of how encounters
* are designed to work.
* @help
* By default, the encounter rate is declared every time you:
* - Load your game
* - Transfer the player (on the same map or to a new map)
* - Disable and then Re-enable Encounters
* What this plugin does is keep the rate until which you encounter a battle
* persistent in these instances:
* - Loading a save does not reset the encounter rate
* - Transferring the player on the same map will not reset the encounter rate
* - Disabling and Enabling Encounters will not reset the encounter rate
* I've included options for you to configure how persistent you want the
* encounter rate to be. As well as an option to have encounter rate persist
* through ANY map changes.
* 
* Note: Loading the same save while in game will persist encounter rate 
* even if the option is turned off to prevent save scumming from players.
* Otherwise, the encounter rate will change between saves and on loading
* from the main menu.
* 
* Terms of use: 
* - Free to use in commercial/noncommercial games, just credit me.
* 
* @author Resi (ResidntEvl)
* 
* @param Persist Through Loads
* @type boolean
* @on YES
* @off NO
* @desc Prevent encounters from resetting on loading a game.
* @default true

* @param Persist Through Same Transfer
* @type boolean
* @on YES
* @off NO
* @desc Prevent encounters from resetting on changing the player's position on the same map.
* @default true
* 
* @param Persist Through Transfer
* @type boolean
* @on YES
* @off NO
* @desc Prevent encounters from resetting on transferring map.
* @default false
* 
* @param Persist Through Encounter Change
* @type boolean
* @on YES
* @off NO
* @desc Prevent encounters from resetting on disabling and enabling the encounters through the event command.
* @default true
*/
//=============================================================================

var Resi = Resi || {};
Resi.Params = Resi.Params || {};
Resi.Parameters = PluginManager.parameters('resiPersistentEncounters');

Resi.Params.persistThroughLoads = String(Resi.Parameters['Persist Through Loads']);
Resi.Params.persistThroughLoads = eval(Resi.Params.persistThroughLoads);
Resi.Params.persistThroughSameTransfer = String(Resi.Parameters['Persist Through Same Transfer']);
Resi.Params.persistThroughSameTransfer = eval(Resi.Params.persistThroughSameTransfer);
Resi.Params.persistThroughTransfer = String(Resi.Parameters['Persist Through Transfer']);
Resi.Params.persistThroughTransfer = eval(Resi.Params.persistThroughTransfer);
Resi.Params.persistThroughEncounterChange = String(Resi.Parameters['Persist Through Encounter Change']);
Resi.Params.persistThroughEncounterChange = eval(Resi.Params.persistThroughEncounterChange);

// Add StepCounter Variable
_resi_Game_Party_prototype_initialize = Game_Party.prototype.initialize;
Game_Party.prototype.initialize = function () {
    _resi_Game_Party_prototype_initialize.call(this);
    this._stepCounter = 0;
};
// Custom Function to allow for calling steps by player
Game_Party.prototype.stepCounter = function () {
    return this._stepCounter;
};

// Reset the Step Counter (for map changes)
Game_Party.prototype.resetStepCounter = function () {
    this._stepCounter = 0;
}

// Add increase to stepCounter through this function
_resi_Game_Party_prototype_increaseSteps = Game_Party.prototype.increaseSteps;
Game_Party.prototype.increaseSteps = function () {
    _resi_Game_Party_prototype_increaseSteps.call(this);
    this._stepCounter++;
};

// Plans to use this
_resi_Game_Player_prototype_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function () {
    _resi_Game_Player_prototype_initMembers.call(this);
    this._persistLoad = 0;
};

// Reset stepCounter variable tied to player
_resi_Game_Player_prototype_executeEncounter = Game_Player.prototype.executeEncounter;
Game_Player.prototype.executeEncounter = function () {
    //_resi_Game_Player_prototype_executeEncounter.call(this);
    if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
        $gameParty.resetStepCounter();
        this.makeEncounterCount();
        var troopId = this.makeEncounterTroopId();
        if ($dataTroops[troopId]) {
            BattleManager.setup(troopId, true, false);
            BattleManager.onEncounter();
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

_resi_Game_Player_prototype_reserveTransfer = Game_Player.prototype.reserveTransfer;
Game_Player.prototype.reserveTransfer = function(mapId, x, y, d, fadeType) {
    _resi_Game_Player_prototype_reserveTransfer.call(this, mapId, x, y, d, fadeType)
    if ($gamePlayer._persistLoad === 2) {
    }
};

// performTransfer is called in many instances, especially on map reload and scene load.
_resi_Game_Player_prototype_performTransfer = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function () {
    
    //_resi_Game_Player_prototype_performTransfer.call(this);
    // 2 is refresh
    if (this.isTransferring()) {
        this.setDirection(this._newDirection);
        if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
            $gameMap.setup(this._newMapId);
            this._needsMapReload = false;
            if (!Resi.Params.persistThroughTransfer && this._persistLoad < 2) {
                $gameParty.resetStepCounter();
                this.makeEncounterCount();
            }
        } else {
            // If we're on the same map as we were before when updates are called
            // DO NOT refresh steps until encounter
            if (!Resi.Params.persistThroughSameTransfer && this._persistLoad < 2) {
                $gameParty.resetStepCounter();
                this.makeEncounterCount();
            }
        }
        this.locate(this._newX, this._newY);
        this.refresh();
        this.clearTransferInfo();
    }
    if (this._persistLoad === 2) {

    }
};

// Remove encounter count
Game_Player.prototype.locate = function (x, y) {
    Game_Character.prototype.locate.call(this, x, y);
    this.center(x, y);
    if (this.isInVehicle()) {
        this.vehicle().refresh();
    }
    this._followers.synchronize(x, y, this.direction());
};

// Change Encounter Disable
Game_Interpreter.prototype.command136 = function () {
    if (this._params[0] === 0) {
        $gameSystem.disableEncounter();
    } else {
        $gameSystem.enableEncounter();
    }
    if (!Resi.Params.persistThroughEncounterChange) {
        $gameParty.resetStepCounter();
        $gamePlayer.makeEncounterCount();
    }
    return true;
};

_resi_Scene_Load_prototype_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function () {
    _resi_Scene_Load_prototype_onLoadSuccess.call(this);
    if (!Resi.Params.persistThroughLoads) {
        $gamePlayer._persistLoad = 2;
    }
};

_resi_Scene_Map_prototype_onMapLoaded = Scene_Map.prototype.onMapLoaded
Scene_Map.prototype.onMapLoaded = function () {
    _resi_Scene_Map_prototype_onMapLoaded.call(this);
    this.afterLoadPersist();
};

// Custom Function
Scene_Map.prototype.afterLoadPersist = function() {
    if ($gamePlayer._persistLoad === 2) {
        $gameParty.resetStepCounter();
        $gamePlayer.makeEncounterCount();
        $gamePlayer._persistLoad = 0;
    }
}
