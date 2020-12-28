interface SliderData {
    min: number;
    max: number;
    value: number;
    id: string;
    delta?: number;
}

export interface DialogData {
    cargo: SliderData;
}

declare let dialogTemplate: (data: DialogData) => string;
export default dialogTemplate;