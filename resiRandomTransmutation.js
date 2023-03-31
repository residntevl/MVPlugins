//=============================================================================
// Resi - Random Transmutation
// resiRandomTransmutation.js
// Version: 1.02
//=============================================================================

//=============================================================================
/*:
* @plugindesc This plugin allows you randomly transmute items from one to another.
* @help
*
* HOW TO USE THIS PLUGIN
* 
* First, assign the appropriate notetags to your items in the database.
* Second, create an event with the Select Item command. Make sure the 
* Variable option matches the one declared in the Plugin Parameters. 
* Third, use one of the corresponding Plugin Commands defined below to allow 
* the transmutation to take place. 
* Fourth, enjoy your new item! 
*
* ITEM NOTETAGS
* 
* These tags go into the Note box for items in the database. 
* 
* <Category: x, y, z> or <Menu Category: x, y, z>
* Item category defined by you, separate multiple categories with a comma. 
*
* <Rarity: name>
* Item rarity corresponding to the ones defined in the Plugin Parameters.
*
* <No Transmute>
* Items that cannot be used as an input nor can be output.
*
* Note! If do not give an item a rarity, it cannot be an output item.
* If used as an input item, its rarity will be declared as the lowest.
* 
* PLUGIN COMMANDS 
*
* Transmute
* Basic random transmutation, creates item pools that match the input item 
* category and separates the pools by rarity.
*
* Transmute ForcePool rarity
* Basic random transmutation, but after pools are created, a specific pool 
* will be chosen from by declared rarity. If the pool has no eligible output 
* items the next highest rarity will be selected. If no pool is eligible the 
* input item will not be used. 
*
* Transmute ForceItem ID
* Forces the output to be the item ID declared. This ignores all notetags.
* 
* Transmute ForceItemPool ID ID ID etc
* Forces the output to be a pool of the item IDs declared. 
* This ignores all notetags. 
*
* UPDATES:
*
* 1.01
*
* - Added <No Transmute> tag which prevents an item from being an output
*
* 1.02
*
* - <No Transmute> tag also now prevents an item from being an input
* - Added plugin command to force a rarity pool
* - Added plugin command to force a specific item
* - Added plugin command to force a specific set of items
* - Updated documentation
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
        let forcePool = false;
        let forceItem = false;
        let forceItemPool = false;
        let rarities = JSON.parse(Resi.Parameters['Rarities']);
        let infoText = `Map - ${this._mapId}. ${$dataMapInfos[this._mapId].name}\nEvent ID - ${this._eventId}`
        if (args.length > 0) {
            if (args[0].toLowerCase() === "forcepool") {
                // rarities = rarities.forEach(el => rarities[el].toLowerCase);
                for (let i = 0; i < rarities.length; ++i) {
                    rarities[i] = rarities[i].toLowerCase();
                }
                forcePool = args[1].toLowerCase();
                if (!rarities.includes(forcePool)) {
                    this.transmutationMessage(true, false, false, `ERROR! ERROR!\nThe rarity defined by the developer does not exist.\n${infoText}`);
                    return false;
                } else {
                    this.beginTransmute(forcePool, forceItem, forceItemPool)
                }
            } else if (args[0].toLowerCase() === "forceitem") {
                // We're only going to look at the first item here.
                // Make sure we can determine the output item can exist.
                if ($dataItems[Number(args[1])] === undefined) {
                    this.transmutationMessage(true, false, false, `ERROR! ERROR!\nThe Output Item defined by the developer does not exist!\n${infoText}`);
                } else {
                    forceItem = $dataItems[Number(args[1])];
                    this.beginTransmute(forcePool, forceItem, forceItemPool)
                }
            } else if (args[0].toLowerCase() === 'forceitempool') {
                // Remove first argument because it's not a number
                args.splice(0, 1);
                forceItemPool = args;
                // Make sure the dev inserted IDs
                if (forceItemPool.length > 0) {
                    // forceItemPool = forceItemPool.forEach(el => Number(forceItemPool[el]));
                    // remove any numbers that do not exist as items to prevent bugs
                    // Or, if the item is not a number
                    for (let i = 0; i < forceItemPool.length; ++i) {
                        forceItemPool[i] = Number(forceItemPool[i]);
                        if ($dataItems[forceItemPool[i]] === undefined || forceItemPool[i] === NaN) {
                            console.log(`Removed forceItemPool ID ${forceItemPool[i]} from the pool - ITEM DOES NOT EXIST.`);
                            forceItemPool.splice(i, 1);
                        }
                    }
                    if (forceItemPool.length === 0) {
                        this.transmutationMessage(true, false, false, `ERROR! ERROR!\nThe Forced Item Pool defined does not have any items in it!\n${infoText}`);
                    } else {
                        this.beginTransmute(forcePool, forceItem, forceItemPool);
                    }
                } else {
                    this.transmutationMessage(true, false, false, `ERROR! ERROR!\nThe Forced Item Pool defined does not have any items in it!\n${infoText}`);
                }
            }
        } else {
            // Add if statements to check for args such as forcePool, customPool, and customOutput
            this.beginTransmute(forcePool, forceItem, forceItemPool);
        }
    }
}

Game_Interpreter.prototype.transmutationMessage = function (showMsg, playSound, sound, msg) {
    if (showMsg) {
        $gameMessage.add(msg);
    }
    if (playSound) {
        AudioManager.playSe(sound);
    }
}

Game_Interpreter.prototype.beginTransmute = function (forcePool, forceItem, forceItemPool) {
    let sound = {
        name: "",
        volume: 90,
        pitch: 100,
        pan: 0
    };
    let regVar = /\s+/g;
    let inputVariable = $gameVariables.value(Number(Resi.Parameters['Input Item Variable']))
    let outputVariable = $gameVariables.value(Number(Resi.Parameters['Output Item Variable']))
    let rarities = JSON.parse(Resi.Parameters['Rarities']);
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
        // Item does not exist
        sound.name = String(Resi.Parameters['No Choice Sound']);
        this.transmutationMessage(Resi.Params.showMessages, Resi.Params.playSounds, sound, String(Resi.Parameters['No Item Message']));
        return;
    } else if (item.meta["No Transmute"] !== undefined) {
        sound.name = String(Resi.Parameters['No Choice Sound'])
        this.transmutationMessage(Resi.Params.showMessages, Resi.Params.playSounds, sound, String(Resi.Parameters['Cannot Transmute Message']));
    } else if (forceItem || forceItemPool) {
        this.rollForTrans(item, common, uncommon, rare, superRare, uberRare, outputVariable, rarities, sound, forcePool, forceItem, forceItemPool);
    } else {
        if (item.meta["Category"] === undefined && item.meta["Menu Category"] === undefined) {
            sound.name = String(Resi.Parameters['No Choice Sound'])
            this.transmutationMessage(Resi.Params.showMessages, Resi.Params.playSounds, sound, String(Resi.Parameters['Cannot Transmute Message']));
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
            // Get Item's Rarity. If it does not have a rarity, default to common.
            // - Make it so that rarity input matters toward output pool rarity weight
            if (item.meta["Rarity"] !== undefined) {
                itemRarity = item.meta["Rarity"].replace(regVar, '').split(',');
            } else {
                item.meta["Rarity"] = [rarities[0]];
                itemRarity = item.meta["Rarity"];
            }
            j = 0;
            // Separate item pool into rarities
            for (i = 1; i < itemPool.length; ++i) {
                // Make sure the item has a rarity
                if ($dataItems[itemPool[i]].meta["Rarity"] !== undefined) {
                    j = $dataItems[itemPool[i]].meta["Rarity"].replace(regVar, '').split(',');
                    if ($dataItems[itemPool[i]].meta["No Transmute"] === undefined) {
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
            }
            // With all this in mind, let's roll for the item
            // ForcePool Code goes here
            this.rollForTrans(item, common, uncommon, rare, superRare, uberRare, outputVariable, rarities, sound, forcePool, forceItem);
        }
    }

}

Game_Interpreter.prototype.rollForTrans = function (item, common, uncommon, rare, superRare, uberRare, outputVariable, rarities, sound, forcePool, forceItem, forceItemPool) {
    // Take item from player
    $gameParty.loseItem(item, 1);
    let outputItem;
    let poolChoice;
    if (forceItem) {
        outputItem = forceItem;
        this.transmutationGiveItem(outputVariable, item, outputItem, sound);
    } else if (forceItemPool) {
        outputItem = this.getItemFromPool(forceItemPool);
        this.transmutationGiveItem(outputVariable, item, outputItem, sound);
    } else {
        let poolTotals = 0;
        let chanceTable = JSON.parse(Resi.Parameters['Rarities Chance'])
        for (let i = 0; i < chanceTable.length; ++i) {
            poolTotals += Number(chanceTable[i]);
        }
        //weighted roll
        let poolRng = Math.floor(Math.random() * poolTotals + 1);
        let poolWeight = 0;
        if (forcePool) {
            poolChoice = forcePool;
        } else {
            for (i = 0; i < chanceTable.length; ++i) {
                poolWeight += Number(chanceTable[i]);
                if (poolRng <= poolWeight) {
                    poolChoice = rarities[i].toLowerCase();
                    break;
                }
            }
        }
        // common pool
        // This code probably needs a bit of a cleanup
        if (poolChoice === rarities[0].toLowerCase()) {
            // if no items in the common pool exist, just return the player's item
            if (common.length === 0) {
                common.push(item.id)
            }
            outputItem = this.getItemFromPool(common);
        }
        // uncommon pool
        if (poolChoice === rarities[1].toLowerCase()) {
            if (uncommon.length > 0) {
                outputItem = this.getItemFromPool(uncommon);
            } else {
                outputItem = this.getItemFromPool(common);
            }
        }
        // rare pool
        if (poolChoice === rarities[2].toLowerCase()) {
            if (rare.length > 0) {
                outputItem = this.getItemFromPool(rare);
            } else if (uncommon.length > 0) {
                outputItem = this.getItemFromPool(uncommon);
            } else {
                outputItem = this.getItemFromPool(common);
            }
        }
        // super rare pool
        if (poolChoice === rarities[3].toLowerCase()) {
            if (superRare.length > 0) {
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
        if (poolChoice === rarities[4].toLowerCase()) {
            if (uberRare.length > 0) {
                outputItem = this.getItemFromPool(uberRare);
            } else if (superRare.length > 0) {
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
        this.transmutationGiveItem(outputVariable, item, outputItem, sound);
        return false;
    }

}

Game_Interpreter.prototype.transmutationGiveItem = function (outputVariable, item, outputItem, sound) {
    $gameVariables.setValue(outputVariable, outputItem.id)
    $gameParty.gainItem(outputItem, Number(Resi.Parameters['Output Amount']));
    // Play Sound plus message
    sound.name = String(Resi.Parameters['Output Sound']);
    let text = String(Resi.Parameters['Transmutation Message']);
    let textOut = text.replace(/INPUT/g, item.name);
    textOut = textOut.replace(/OUTPUT/g, outputItem.name);
    this.transmutationMessage(Resi.Params.showMessages, Resi.Params.playSounds, sound, textOut);

}

Game_Interpreter.prototype.getItemFromPool = function (pool) {
    return $dataItems[pool[Math.floor(Math.random() * pool.length)]];
}
