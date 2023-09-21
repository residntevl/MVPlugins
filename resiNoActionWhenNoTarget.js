//=============================================================================
// Resi - No Action When No Target
// resiNoActionWhenNoTarget.js
// Version: 1.00
//=============================================================================
//=============================================================================
/*:
* @plugindesc This plugin allows for modifying how many steps a player takes until an encounter occurs.
* @help
* 
* When the target selected by an actor is dead, their action will not go through, effectively wasting their turn.
*
* Terms of use: 
* - Free to use in commercial/noncommercial games, just credit me.
*/
//=============================================================================

// Game will attempt to choose a new target with this function.
_resi_Game_Unit_prototype_smoothTarget = Game_Unit.prototype.smoothTarget;
Game_Unit.prototype.smoothTarget = function(index) {
    _resi_Game_Unit_prototype_smoothTarget.call(this, index);
    if (index < 0) {
        index = 0;
    }
    var member = this.members()[index];
    // Determine whether or not the target is Alive.
    return (member && member.isAlive() ? member : false);
};