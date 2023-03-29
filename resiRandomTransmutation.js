//=============================================================================
// Resi - Random Transmutation
// resiRandomTransmutation.js
// Version: 1.00
//=============================================================================

//=============================================================================
/*:
* @plugindesc This plugin allows you randomly transmute items from one to another.
* @help
* To begin using this plugin, you must declare each potential transmutable item
* with a category and a rarity. This is done by placing the following into the 
* item's notetags.
*
* <Menu Category: name> or <Category: name>
* <Rarity: rarity>
*
* The categories are defined by you as you see fit.
* The rarities are a set of a rarities as defined in this plugin's settings. 
* By default they are: 
*
* Common, Uncommon, Rare, Super Rare, and Uber Rare.
* You may change them to suit your liking, but there may only be 5 maximum.
*
* To utilize the transmutation plugin, you must create an event with both a 
* Select Item Command and a Plugin Command.
* The Select Item Command must use the same Variable declared as your input 
* variable in the plugin's settings.
* The Plugin Command to start the transmutation process is:
*
* Transmute
*
* That should be all that is required to start utilizing this plugin. If you
* have any questions, please reach out to me, thank you.
* 
* Terms of use: 
* - Free to use in commercial/noncommercial games, just credit me.
* 
* @author Resi (ResidntEvl)
* 
* @param Input Item Variable
* @type number
* @min 0
* @max 9999
* @desc The item to be transmuted will be stored inside of a variable. Make sure this matches Select Item Command.
* @default 0
*
* @param Output Item Variable
* @type number
* @min 0
* @max 9999
* @desc The item received will be stored inside of a variable.
* @default 0
*
* @param Output Amount
* @type number
* @min 0
* @max 9999
* @desc How many items received through an output?
* @default 1
* 
* @param Show Messages
* @type boolean
* @on YES
* @off NO
* @desc Show a message to the player when they have transmuted an item? Set this to False if you wish to handle this yourself.
* @default false
*
* @param Transmutation Message
* @type text
* @desc If Show Messages is true, this will be the message shown to the player when transmutation is complete.
* @default You transmuted INPUT into OUTPUT!
*
* @param No Item Message
* @type text
* @desc If Show Messages is true, this will be the message shown to the player when they do not choose an item.
* @default No item was chosen.
*
* @param Cannot Transmute Message
* @type text
* @desc If Show Messages is true, this will be the message shown to the player when a selected item does not have any categories.
* @default This item cannot be transmuted.
*
* @param Rarities
* @type text[]
* @desc Your item rarities, up to five in total.
* @default ["Common","Uncommon","Rare","SuperRare","UberRare"]
*
* @param Rarities Chance
* @type text[]
* @desc The chance for a specific rarity, from lowest to highest, to be selected when transmuting. This is a weighted chance.
* @default ["70","35","15","7","4"]
*
* @param Play Sounds
* @type boolean
* @on YES
* @off NO
* @desc Play sounds to indicate transmutation is taking place.
* @default false
*
* @param Output Sound
* @type file
* @dir audio/se
* @require 1
* @desc Sound to play when receiving the item.
* @default Twine
*
* @param No Choice Sound
* @type file
* @dir audio/se
* @require 1
* @desc Sound to play when no item is chosen.
* @default Buzzer1
*/
//=============================================================================
var Resi = Resi || {};
Resi.Params = Resi.Params || {};
Resi.Parameters = PluginManager.parameters('resiRandomTransmutation');
Resi.RandTrans = {};

Resi.Params.showMessages = String(Resi.Parameters['Show Messages']);
Resi.Params.showMessages = eval(Resi.Params.showMessages);
Resi.Params.playSounds = String(Resi.Parameters['Play Sounds']);
Resi.Params.playSounds = eval(Resi.Params.playSounds);

Resi.RandTrans.Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
    Resi.RandTrans.Game_Interpreter_pluginCommand.call(this, command, args)
    if (command.toLowerCase() === 'transmute') {
        this.beginTransmute();
    }
}

Game_Interpreter.prototype.beginTransmute = function () {
    var sound = {
        name: "",
        volume: 90,
        pitch: 100,
        pan: 0
    };
    let regVar = /\s+/g;
    let inputVariable = $gameVariables.value(Number(Resi.Parameters['Input Item Variable']))
    let outputVariable = $gameVariables.value(Number(Resi.Parameters['Output Item Variable']))
    let item = $dataItems[inputVariable];
    let outputItem;
    let itemPool = [];
    let common = [];
    let uncommon = [];
    let rare = [];
    let superRare = [];
    let uberRare = [];
    let j;
    let cat;
    let itemCategory = [];
    let itemRarity;
    if (inputVariable === 0) {
        // item does not exist
        if (Resi.Params.playSounds) {
            //console.log(String(Resi.Parameters['No Choice Sound']))
            sound.name = String(Resi.Parameters['No Choice Sound']);
            AudioManager.playSe(sound);
        }
        if (Resi.Params.showMessages) {
            $gameMessage.add(String(Resi.Parameters['No Item Message']));
        }
        return;
    } else {
        if (item.meta["Category"] === undefined && item.meta["Menu Category"] === undefined) {
            if (Resi.Params.playSounds) {
                sound.name = String(Resi.Parameters['No Choice Sound']);
                AudioManager.playSe(sound);
            }
            if (Resi.Params.showMessages) {
                $gameMessage.add(String(Resi.Parameters['Cannot Transmute Message']));
            }
            return;
        } else {
            // Category
            if (item.meta["Menu Category"] === undefined) {
                cat = "Category";
            // Menu Category
            } else if (item.meta["Category"] === undefined) {
                cat = "Menu Category"
            // Category is default
            } else {
                cat = "Menu Category";
            }
            // Push all shared items to array
            for (let i = 1; i < $dataItems.length; ++i) {
                // Make sure the item has a category
                if ($dataItems[i].meta["Menu Category"] !== undefined || $dataItems[i].meta["Category"] !== undefined) {
                    j = $dataItems[i].meta[`${cat}`].replace(regVar, '').split(',');
                    if (j.some(r => item.meta[`${cat}`].replace(regVar, '').split(',').includes(r))) {
                        itemPool.push(i);
                    }
                }
            }
            var rarities = JSON.parse(Resi.Parameters['Rarities']);
            console.log(rarities);
            // Get Item's Rarity. If it does not have a rarity, default to common.
            if (item.meta["Rarity"] !== undefined) {
                itemRarity = item.meta["Rarity"].replace(regVar, '').split(',');
            } else {
                item.meta["Rarity"] = [rarities[0]];
                itemRarity = item.meta["Rarity"];
            }
            console.log(itemPool);
            j = 0;
            // Separate item pool into rarities
            for (i = 1; i < itemPool.length; ++i) {
                // Make sure the item has a rarity
                if ($dataItems[itemPool[i]].meta["Rarity"] !== undefined) {
                    j = $dataItems[itemPool[i]].meta["Rarity"].replace(regVar, '').split(',');
                    if (j[0].toLowerCase() === rarities[0].toLowerCase()) {
                        common.push(itemPool[i]);
                    }
                    if (j[0].toLowerCase() === rarities[1].toLowerCase()) {
                        uncommon.push(itemPool[i]);
                    }
                    if (j[0].toLowerCase() === rarities[2].toLowerCase()) {
                        rare.push(itemPool[i]);
                    }
                    if (j[0].toLowerCase() === rarities[3].toLowerCase()) {
                        superRare.push(itemPool[i]);
                    }
                    if (j[0].toLowerCase() === rarities[4].toLowerCase()) {
                        uberRare.push(itemPool[i]);
                    }
                }
            }
            // With all this in mind, let's roll for the item
            console.log(common);
            this.rollForTrans(item, common, uncommon, rare, superRare, uberRare, itemRarity, inputVariable, outputVariable, rarities, sound);
        }
    }

}

Game_Interpreter.prototype.rollForTrans = function (item, common, uncommon, rare, superRare, uberRare, itemRarity, inputVariable, outputVariable, rarities, sound) {
    // Take item from player
    $gameParty.loseItem(item, 1);
    var poolTotals = 0;
    var chanceTable = JSON.parse(Resi.Parameters['Rarities Chance'])
    for (var i = 0; i < chanceTable.length; ++i) {
        poolTotals += Number(chanceTable[i]);
    }
    console.log(poolTotals);
    //weighted roll
    var outputItem;
    var poolChoice;
    var poolRng = Math.floor(Math.random() * poolTotals + 1);
    var poolWeight = 0;
    for (i = 0; i < chanceTable.length; ++i) {
        console.log(poolWeight);
        poolWeight += Number(chanceTable[i]);
        console.log(poolRng)
        console.log(poolWeight);
        if (poolRng <= poolWeight) {
            poolChoice = rarities[i].toLowerCase();
            break;
        }
    }
    console.log(poolChoice);
    // common pool
    if (poolChoice === rarities[0].toLowerCase()) {
        outputItem = this.getItemFromPool(common);
    }
    // uncommon pool
    if (poolChoice === rarities[1].toLowerCase()) {
        if (uncommon.length > 0 ) {
            outputItem = this.getItemFromPool(uncommon);
        } else {
            outputItem = this.getItemFromPool(common);
        }
    }
    // rare pool
    if (poolChoice === rarities[1].toLowerCase()) {
        if (rare.length > 0 ) {
            outputItem = this.getItemFromPool(rare);
        } else if (uncommon.length > 0) {
            outputItem = this.getItemFromPool(uncommon);
        } else {
            outputItem = this.getItemFromPool(common);
        }
    }
    // super rare pool
    if (poolChoice === rarities[1].toLowerCase()) {
        if (superRare.length > 0 ) {
            outputItem = this.getItemFromPool(superRare);
        } else if (rare.length > 0) {
            outputItem = this.getItemFromPool(rare);
        } else if (uncommon.length > 0) {
            outputItem = this.getItemFromPool(uncommon);
        } else {
            outputItem = this.getItemFromPool(common);
        }
    }
    // uber rare pool
    if (poolChoice === rarities[1].toLowerCase()) {
        if (uberRare.length > 0) {
            outputItem = this.getItemFromPool(uberRare);
        } else if (superRare.length > 0 ) {
            outputItem = this.getItemFromPool(superRare);
        } else if (rare.length > 0) {
            outputItem = this.getItemFromPool(rare);
        } else if (uncommon.length > 0) {
            outputItem = this.getItemFromPool(uncommon);
        } else {
            outputItem = this.getItemFromPool(common);
        }
    }

    // Give player the item
    console.log(outputItem);
    $gameVariables.setValue(outputVariable, outputItem.id)
    $gameParty.gainItem(outputItem, Number(Resi.Parameters['Reward Amount']));
    // Play Sound plus message
    if (Resi.Params.playSounds) {
        sound.name = String(Resi.Parameters['Output Sound']);
        AudioManager.playSe(sound);
    }
    if (Resi.Params.showMessages) {
        let text = String(Resi.Parameters['Transmutation Message']);
        let textOut = text.replace(/INPUT/g, item.name);
        textOut = textOut.replace(/OUTPUT/g, outputItem.name);
        $gameMessage.add(textOut);
    }
    return false;
}

Game_Interpreter.prototype.getItemFromPool = function (pool) {
    return $dataItems[pool[Math.floor(Math.random() * pool.length)]];
}

Resi.RandTrans.Game_Interpreter_setupItemChoice =
    Game_Interpreter.prototype.setupItemChoice;
Game_Interpreter.prototype.setupItemChoice = function (params) {
    Resi.RandTrans.Game_Interpreter_setupItemChoice.call(this, params)
    $gameMessage.setItemChoice(Number(Resi.Parameters['Input Item Variable']), 1);
};
