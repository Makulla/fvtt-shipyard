import sliderTemplate, { Delta, DerivedAttribute, DialogData, Ability, AbilityType, ShipLevel, ShipLevelType, DerivedAttributeType } from "../templates/sliders.handlebars";
import tableTemplate from "../templates/table.handlebars";
import mainAttributesTemplate from "../templates/mainAttributes.handlebars"
import chatMessageTemplate from "../templates/chatMessage.handlebars"

type ShipLevelLookup = Record<ShipLevelType, number>;

function deriveAttributes(shipLevels: ShipLevelLookup, previous?: readonly DerivedAttribute[]): DerivedAttribute[] {

    const result: DerivedAttribute[] = [];

    const roundDecimal = (num: number) => parseFloat(num.toFixed(2));

    const add = (attribute: Pick<DerivedAttribute, "label" | "type" | "value">) => 
        result.push({ 
            ...attribute, 
            delta: buildDelta(roundDecimal(attribute.value - (previous?.[result.length].value ?? attribute.value)))
        });

    const masts = Math.ceil(shipLevels.sails * 0.5);
    const hitPoints = Math.floor(shipLevels.hull * 50 + shipLevels.cargo * 15 + shipLevels.chambers * 15);
    const cargoHold = roundDecimal(0.5 + (shipLevels.cargo - 1) ** 2 * 0.8);
    const passengers = Math.floor(shipLevels.creatureCapacity ** 2 * 2);
    const crew = Math.max(0, Math.ceil(1 + shipLevels.sails * 2 + hitPoints * 0.1 + passengers * 0.25 + shipLevels.smallWeaponSlots * 3) - 3);

    const mass = roundDecimal(cargoHold * 1.2 + hitPoints * 0.1 + shipLevels.sails * 0.01 + masts * 5 + passengers * 0.35 + crew * 0.2 + shipLevels.smallWeaponSlots * 2.0);

    const maximumTravelHeight = roundDecimal(150 + (shipLevels.voidCoreStrength - 1)**2 * 100 - 50 * Math.log(0.25 * mass));
    const sailPropulsion = 1 + shipLevels.sails * 4 - shipLevels.sails ** (1.55);
    const travelPaceHour = roundDecimal(sailPropulsion - mass * 0.1);
    const fuelConsumption = roundDecimal(((10 ** (travelPaceHour * 0.3) + mass ** 1.5) * 1.5 ** (shipLevels.voidCoreStrength - 1)) / (shipLevels.voidCoreEfficiency ** 0.75) );
    const crewUpkeep = roundDecimal(crew * 0.75);

    add({ type: "armorClass", label: "Armor Class", value: 9 + shipLevels.hull });
    add({ type: "hitPoints", label: "Hit Points", value: hitPoints });
    add({ type: "length", label: "Length (ft)", value: 100 });
    add({ type: "width", label: "Width (ft)", value: 20 });
    add({ type: "mass", label: "Mass (tons)", value: mass });
    add({ type: "cargoHold", label: "Cargo Hold (tons)", value: cargoHold });
    add({ type: "masts", label: "Masts", value: masts });
    add({ type: "passengers", label: "Passengers", value: passengers })
    add({ type: "crew", label: "Crew", value: crew });
    add({ type: "fuelConsumption", label: "Fuel Consumption (GP / 100 miles)", value: fuelConsumption });
    add({ type: "travelPace", label: "Travel Pace (miles / day)", value: roundDecimal(travelPaceHour * 24) });
    add({ type: "maximumTravelHeight", label: "Maximum Travel Height (ft)", value: maximumTravelHeight });
    add({ type: "crewUpkeep", label: "Crew Upkeep (GP / Day)", value: crewUpkeep })

    return result;
}

function deriveAbilities(shipLevels: ShipLevelLookup, previous?: readonly Ability[]): Ability[] {

    const result: Ability[] = [];

    const add = (attribute: Pick<Ability, "label" | "type" | "value">) => {
        const value = Math.floor(attribute.value);
        result.push({ 
            ...attribute,
            value,
            delta: buildDelta(value - (previous?.[result.length].value ?? value)),
            shortLabel: attribute.label.substr(0, 3).toUpperCase()
        });
    }

    add({ type: "strength", label: "Strength", value: 10 + shipLevels.hull + (shipLevels.smallWeaponSlots + shipLevels.cargo) * 0.25 });
    add({ type: "dexterity", label: "Dexterity", value: 10 + shipLevels.sails + shipLevels.voidCoreStrength - shipLevels.cargo * 0.5 - shipLevels.hull * 0.5 });
    add({ type: "constitution", label: "Constitution", value: 10 + shipLevels.hull * 0.5 + shipLevels.voidCoreEfficiency * 2.0 - shipLevels.creatureCapacity });
    add({ type: "intelligence", label: "Intelligence", value: 0 });
    add({ type: "wisdom", label: "Wisdom", value: 0 });
    add({ type: "charisma", label: "Charisma", value: 0 });

    return result;
}

function asShipLevelLookup(shipLevels: readonly ShipLevel[]): ShipLevelLookup {
    const lookup = (type: ShipLevelType) => shipLevels.filter(level => level.type === type)[0].value;

    return {
        cargo: lookup("cargo"),
        chambers: lookup("chambers"),
        creatureCapacity: lookup("creatureCapacity"),
        hull: lookup("hull"),
        sails: lookup("sails"),
        smallWeaponSlots: lookup("smallWeaponSlots"),
        voidCoreEfficiency: lookup("voidCoreEfficiency"),
        voidCoreStrength: lookup("voidCoreStrength")
    }
}

function buildDelta(delta: number): Delta | undefined {
    return Math.abs(delta) > 0 ? { isPositive: delta > 0, value: delta } : undefined;
}

function updateOutputTables(dialogContentRoot: HTMLElement, data: DialogData) {
    const derivedTable = (dialogContentRoot.querySelector(`#${data.outputTableId}`) as HTMLTableElement);
    derivedTable.innerHTML = tableTemplate(data);

    const mainAttributesTable = (dialogContentRoot.querySelector(`#${data.mainAttributeTableId}`) as HTMLTableElement);
    mainAttributesTable.innerHTML = mainAttributesTemplate(data);
}

function cloneArray<TArray>(array: readonly TArray[]): TArray[] {
    return JSON.parse(JSON.stringify(array));
}

function cloneAndRemoveDelta(array: readonly ShipLevel[]): ShipLevel[] {
    const clone = cloneArray(array);
    clone.forEach(c => c.delta = undefined);
    return clone;
}

function buildDialogData(levels: ShipLevel[]): DialogData 
{
    const mainAttributes = deriveAbilities(asShipLevelLookup(levels));
    const derived = deriveAttributes(asShipLevelLookup(levels));

    return { 
        outputTableId: "shipyardOutputTable",
        mainAttributeTableId: "shipyardeMainAttributeTable",
        levels,
        mainAttributes,
        sendToChatId: "shipyardSendToChat",
        sendToGmId: "shipyardSendToGm",
        derived
    };
}

function showDialog(actorName: string) {

    const data = buildDialogData(getLevelsFromActorOrDefault(actorName));

    const initialLevels = cloneArray(data.levels);
    const initialMainAttributes = cloneArray(data.mainAttributes);
    const initialDerived = cloneArray(data.derived);

    const disposeListeners: (() => void)[] = [];
    const d = new Dialog({
        title: "Shipyard",
        content: sliderTemplate(data),
        buttons: {
            close: {
                icon: '<i class="fas fa-check"></i>',
                label: "Close",
                callback: () => {}
            }
        },
        default: "close",
        render: dialogContentRoot => {

            const addButtonListener = (domId: string, handler: () => void) => {
                const button = dialogContentRoot.querySelector(`#${domId}`) as HTMLInputElement;
                const domHandler = () => handler();
                button.addEventListener("click", domHandler);
                disposeListeners.push(() => button.removeEventListener("click", domHandler));
            }

            addButtonListener(data.sendToChatId, () => ChatMessage.create({
                 content: JSON.stringify({
                    dialogData: data,
                    actorName
                 }),
                 flags: {
                    shipyardChatMessage: true
                 }
            }));

            data.levels.forEach((level, index) => {
                const slider = dialogContentRoot.querySelector(`#shipyard${level.type}Slider`) as HTMLInputElement;
                const listener = () => 
                {
                    level.value = parseInt(slider.value);
                    const delta = level.value - initialLevels[index].value;
                    level.delta = buildDelta(delta);

                    data.mainAttributes = deriveAbilities(asShipLevelLookup(data.levels), initialMainAttributes);
                    data.derived = deriveAttributes(asShipLevelLookup(data.levels), initialDerived);

                    updateOutputTables(dialogContentRoot, data);
                }
                slider.addEventListener("change", listener);
                disposeListeners.push(() => slider.removeEventListener("change", listener));
            });

            updateOutputTables(dialogContentRoot, data);
        },
        close: () => disposeListeners.forEach(dispose => dispose()),
    }, {
        jQuery: false,
        width: 800
    });

    d.render(true);
}

function getLevelsFromActorOrDefault(actorName: string): ShipLevel[] 
{
    const actor = game.actors.find(a => a.name === actorName);

    if(actor === null) {
        ui.notifications.error("Shipyard: Unknown actor " + actorName);
    }
    else {
        try {
            const levels: ShipLevel[] = JSON.parse(actor.data.data.details.biography.value);
            if(levels.length > 0) {
                return levels;
            }
        }
        catch(error) {
            ui.notifications.error("Shipyard error: " + error);
        }
    }

    return [ 
        { type: "cargo", label: "Cargo", min: 1, max: 5, value: 1 },
        { type: "hull", label: "Hull", min: 1, max: 5, value: 1 },
        { type: "sails", label: "Sails", min: 1, max: 5, value: 1 },
        { type: "creatureCapacity", label: "Creature Capacity", min: 1, max: 5, value: 1 },
        { type: "voidCoreEfficiency", label: "Void Core Efficiency", min: 1, max: 3, value: 1 },
        { type: "voidCoreStrength", label: "Void Core Strength", min: 1, max: 3, value: 1 },
        { type: "smallWeaponSlots", label: "Weapon Slots (small)", min: 0, max: 2, value: 0 },
        { type: "chambers", label: "Chambers", min: 0, max: 4, value: 0 }
    ];
}

function updateActor(actorName: string, levelsJson: ShipLevel[]) 
{
    if(!game.user.isGM) {
        ui.notifications.error("Shipyard: only GM may update ships.");
        return;
    }

    const abilities = deriveAbilities(asShipLevelLookup(levelsJson));
    const getAbility = (type: AbilityType) => abilities.filter(attr => attr.type === type)[0].value;

    const derivedAttributes = deriveAttributes(asShipLevelLookup(levelsJson));
    const getAttribute = (type: DerivedAttributeType) => derivedAttributes.filter(attr => attr.type === type)[0].value;

    game.actors.find(a => a.name === actorName)!.update({ 
        data: { 
            abilities: {
                cha: { value: getAbility("charisma") },
                dex: { value: getAbility("dexterity") },
                int: { value: getAbility("intelligence") },
                str: { value: getAbility("strength") },
                wis: { value: getAbility("wisdom") },
                con: { value: getAbility("constitution") }
            },
            attributes: {
                ac: { value: getAttribute("armorClass") },
                capacity: { 
                    creature: `${getAttribute("crew")} Crew, ${getAttribute("passengers")} Passengers`, 
                    cargo: getAttribute("cargoHold") 
                },
                hp: { 
                    value: getAttribute("hitPoints"), 
                    min: 0, 
                    max: getAttribute("hitPoints")
                },
                speed: `${getAttribute("travelPace")} mpd`
            },
            details: { 
                biography: { 
                    value: JSON.stringify(levelsJson),
                } 
            } 
        } 
    });
}

Hooks.on("renderChatMessage", (message, messageRoot) => 
{ 
    if(message.data.flags.shipyardChatMessage) 
    {    
        const inputId = "shipyardChatMessageId";
        const { dialogData, actorName }: { actorName: string, dialogData: DialogData } = JSON.parse(message.data.content!);

        messageRoot.find(".message-content").html(chatMessageTemplate({ 
            tableHtml: tableTemplate(dialogData),
            inputId,
            mayNotApply: !game.user.isGM
        }));

        const buttonInput = messageRoot.find(`#${inputId}`);
        buttonInput.on("click", () => updateActor(actorName, cloneAndRemoveDelta(dialogData.levels)));
    }
});

Hooks.on("ready", () => { 
    (<any>window)["shipyardShow"] = (actorName: string) => showDialog(actorName);
});