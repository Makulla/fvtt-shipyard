export type ShipLevelType = 
      "hull" 
    | "cargo"
    | "sails" 
    | "voidCoreStrength" 
    | "voidCoreEfficiency" 
    | "creatureCapacity"
    | "smallWeaponSlots"
    | "chambers";

export type DerivedAttributeType = 
      "fuelConsumption"
    | "mass"
    | "cargoHold"
    | "travelPace"
    | "hitPoints"
    | "crew"
    | "passengers"
    | "armorClass"
    | "width"
    | "length"
    | "masts"
    | "maximumTravelHeight"
    | "crewUpkeep";


export type AbilityType =
      "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma";

export interface Delta {
    value: number;
    isPositive: boolean;
}

interface BaseAttribute<TAttributeType> {
    value: number;
    delta?: Delta;
    label: string;
    type: TAttributeType;
}

export interface ShipLevel extends BaseAttribute<ShipLevelType> {
    min: number;
    max: number;
}

export interface DerivedAttribute extends BaseAttribute<DerivedAttributeType> { }
export interface Ability extends BaseAttribute<AbilityType> {
    shortLabel: string;
}

export interface DialogData {
    levels: ShipLevel[];
    mainAttributes: Ability[];
    derived: DerivedAttribute[];

    outputTableId: string;
    mainAttributeTableId: string;
    sendToChatId: string;
    sendToGmId: string;
}

declare let sliderTemplate: (data: DialogData) => string;
export default sliderTemplate;