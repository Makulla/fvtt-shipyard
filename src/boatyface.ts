import sliderTemplate, { Delta, DerivedAttribute, DialogData, MainAttribute, ShipLevel, ShipLevelType } from "../templates/sliders.handlebars";
import tableTemplate from "../templates/table.handlebars";
import mainAttributesTemplate from "../templates/mainAttributes.handlebars"

type ShipLevelLookup = Record<ShipLevelType, number>;

function deriveAttributes(shipLevels: ShipLevelLookup, previous?: readonly DerivedAttribute[]): DerivedAttribute[] {

    const result: DerivedAttribute[] = [];

    const add = (attribute: Pick<DerivedAttribute, "label" | "type" | "value">) => 
        result.push({ 
            ...attribute, 
            delta: buildDelta(attribute.value - (previous?.[result.length].value ?? attribute.value))
        });

    add({ type: "armorClass", label: "Armor Class", value: 10 });
    add({ type: "hitPoints", label: "Hit Points", value: 200 });
    add({ type: "length", label: "Length (ft)", value: 100 });
    add({ type: "width", label: "Width (ft)", value: 20 });
    add({ type: "mass", label: "Mass (tons)", value: 100 });
    add({ type: "cargoHold", label: "Cargo Hold (tons)", value: 1 });
    add({ type: "masts", label: "Masts", value: 1 });
    add({ type: "minimumCrew", label: "Minimum Crew", value: 3 });
    add({ type: "fuelConsumption", label: "Fuel Consumption (GP / mile)", value: 1 });
    add({ type: "travelPace", label: "Travel Pace (miles / hour)", value: 100 });
    add({ type: "maximumTravelHeight", label: "Maximum Travel Height (ft)", value: 150 });

    return result;
}

function deriveMainAttributes(shipLevels: ShipLevelLookup, previous?: readonly MainAttribute[]): MainAttribute[] {

    const result: MainAttribute[] = [];

    const add = (attribute: Pick<MainAttribute, "label" | "type" | "value">) => {
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

function showDialog() {

    const levels: ShipLevel[] = [ 
        { type: "cargo", label: "Cargo", min: 1, max: 5, value: 1 },
        { type: "hull", label: "Hull", min: 1, max: 5, value: 1 },
        { type: "sails", label: "Sails", min: 1, max: 5, value: 1 },
        { type: "creatureCapacity", label: "Creature Capacity", min: 1, max: 5, value: 1 },
        { type: "voidCoreEfficiency", label: "Void Core Efficiency", min: 1, max: 3, value: 1 },
        { type: "voidCoreStrength", label: "Void Core Strength", min: 1, max: 3, value: 1 },
        { type: "smallWeaponSlots", label: "Weapon Slots (small)", min: 0, max: 2, value: 0 },
        { type: "chambers", label: "Chambers", min: 0, max: 4, value: 0 }
    ];

    const mainAttributes = deriveMainAttributes(asShipLevelLookup(levels));
    const derived = deriveAttributes(asShipLevelLookup(levels));

    const initialLevels = cloneArray(levels);
    const initialMainAttributes = cloneArray(mainAttributes);
    const initialDerived = cloneArray(derived);

    const data: DialogData = { 
        outputTableId: "boatyfaceOutputTableId",
        mainAttributeTableId: "boatyfaceMainAttributeTableId",
        levels,
        mainAttributes,
        derived
    };

    const d = new Dialog({
        title: "Ship",
        content: sliderTemplate(data),
        buttons: {
            tell: {
                icon: '<i class="fas fa-check"></i>',
                label: "To Chat",
                callback: () => {}
            },
            close: {
                icon: '<i class="fas fa-check"></i>',
                label: "Close",
                callback: () => {}
            }
        },
        default: "close",
        render: dialogContentRoot => {

            levels.forEach((level, index) => {
                const slider = dialogContentRoot.querySelector(`#boatyFace${level.type}Slider`) as HTMLInputElement;
                slider.addEventListener("change", () => 
                {
                    level.value = parseInt(slider.value);
                    const delta = level.value - initialLevels[index].value;
                    level.delta = buildDelta(delta);

                    data.mainAttributes = deriveMainAttributes(asShipLevelLookup(levels), initialMainAttributes);
                    data.derived = deriveAttributes(asShipLevelLookup(levels), initialDerived);

                    updateOutputTables(dialogContentRoot, data);
                });
            });

            updateOutputTables(dialogContentRoot, data);
        },
        close: html => { },
    }, {
        jQuery: false,
        width: 800
    });

    d.render(true);
}

Hooks.on("init", () => { });
Hooks.on("ready", () => { (<any>window)["showBoatyface"] = () => showDialog(); });