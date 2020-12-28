interface SliderData {
    min: number;
    max: number;
    value: number;
    id: string;
    delta?: number;
}

export interface DialogData {
    cargo: SliderData;
    outputTableId: string;
}

declare let sliderTemplate: (data: DialogData) => string;
export default sliderTemplate;