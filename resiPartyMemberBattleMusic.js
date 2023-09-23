//=============================================================================
// Resi - Party Member Specific Battle Music
// resiPartyMemberBattleMusic.js
// Version: 1.00
//=============================================================================

//=============================================================================
/*:
* @plugindesc This plugin changes the encounter music based on the second party member.

* @help
* This plugin will change the battle music whenever the 'Change Party Member' command is used.
* This plugin will not change the battle music if it is changed by another method, such as 'Change Battle BGM'. 
*
* You can re-obtain the current party member based battle music by using the plugin command:
*
* MemberMusic
*
* Terms of use: 
* - Free to use in commercial/noncommercial games, just credit me.
* 
* @author Resi (ResidntEvl)
*
* @param Music Pan
* @type number
* @max 100
* @min -100
* @desc Audio pan (left/right) of the battle theme. Max 100/Min -100
* @default 0
*
* @param Music Pitch
* @type number
* @max 150
* @min 50
* @desc Audio Pitch of the battle theme. Max 150/Min 50
* @default 100
*
* @param Music Volume
* @type number
* @max 100
* @min 0
* @desc Audio Pitch of the battle theme. Max 100/Min 0
* @default 90
*
* @param Actor ID 1 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 1 is in Party Slot 2.
* @default Battle1
*
* @param Actor ID 2 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 2 is in Party Slot 2.
* @default Battle2
*
* @param Actor ID 3 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 3 is in Party Slot 2.
* @default Battle3
*
* @param Actor ID 4 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 4 is in Party Slot 2.
* @default Battle3
*
* @param Actor ID 5 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 5 is in Party Slot 2.
* @default Battle3
*
* @param Actor ID 6 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 6 is in Party Slot 2.
* @default Battle3
*
* @param Actor ID 7 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 7 is in Party Slot 2.
* @default Battle3
*
* @param Actor ID 8 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 8 is in Party Slot 2.
* @default Battle3
*
* @param Actor ID 9 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 9 is in Party Slot 2.
* @default Battle2
*
* @param Actor ID 10 Theme
* @type file
* @dir audio/bgm/
* @require 1
* @desc Battle Theme if Actor ID 10 is in Party Slot 2.
* @default Battle3
*/
//=============================================================================
var Resi = Resi || {};
Resi.Params = Resi.Params || {};
Resi.Parameters = PluginManager.parameters('resiPartyMemberBattleMusic');

Resi.Params.bmPluginPan = Number(Resi.Parameters['Music Pan']);
Resi.Params.bmPluginPitch = Number(Resi.Parameters['Music Pitch']);
Resi.Params.bmPluginVolume = Number(Resi.Parameters['Music Volume']);
Resi.Params.bmPluginThemes = [
    String(Resi.Parameters['Actor ID 1 Theme']), String(Resi.Parameters['Actor ID 2 Theme']), String(Resi.Parameters['Actor ID 3 Theme']),
    String(Resi.Parameters['Actor ID 4 Theme']), String(Resi.Parameters['Actor ID 5 Theme']), String(Resi.Parameters['Actor ID 6 Theme']),
    String(Resi.Parameters['Actor ID 7 Theme']), String(Resi.Parameters['Actor ID 8 Theme']), String(Resi.Parameters['Actor ID 9 Theme']),
    String(Resi.Parameters['Actor ID 10 Theme'])
]

// Change Party Member
_resi_Game_Interpreter_prototype_command129 = Game_Interpreter.prototype.command129;
Game_Interpreter.prototype.command129 = function () {
    _resi_Game_Interpreter_prototype_command129.call(this);
    var actor = $gameActors.actor(this._params[0]);
    console.log(actor);
    console.log(this._params[0]);
    if (actor) {
        if (this._params[1] === 0) {  // Add
            if (this._params[2]) {   // Initialize
                $gameActors.actor(this._params[0]).setup(this._params[0]);
            }
            $gameParty.addActor(this._params[0]);
        } else {  // Remove
            $gameParty.removeActor(this._params[0]);
        }
        // Resi Code here
        // Theme will be the actor's ID minus 1 because of array indexing.
        // Actor 1 would be in Array index 0, so if Actor 1 is in slot 2 of the part ($gameParty.members()[1])
        // Then, their actorId value is subtracted by 1 to get 0, which is their battle theme as defined by
        // the plugin options. Hope this makes sense. :)
        var theme = {
            name: Resi.Params.bmPluginThemes[$gameParty.members()[1]._actorId - 1],
            volume: Resi.Params.bmPluginVolume,
            pitch: Resi.Params.bmPluginPitch,
            pan: Resi.Params.bmPluginPan
        }
        $gameSystem.setBattleBgm(theme);
    }
    return true;
};

_resi_Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _resi_Game_Interpreter_pluginCommand.call(this, command, args)
    if (command.toLowerCase() === 'membermusic') {
        var theme = {
            name: Resi.Params.bmPluginThemes[$gameParty.members()[1]._actorId - 1],
            volume: Resi.Params.bmPluginVolume,
            pitch: Resi.Params.bmPluginPitch,
            pan: Resi.Params.bmPluginPan
        }
        $gameSystem.setBattleBgm(theme);
    }
    //console.log('Changed Battle BGM to ' + theme.name);
}