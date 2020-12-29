declare const Hooks: {
    on(hook: "init" | "ready", handler: () => void): void;
}

declare interface DialogConfig {
    jQuery: boolean;
    width: number;
}

declare interface DialogButton {
    icon: string;
    label: string;
    callback: () => void;
}

declare interface DialogData {
    title: string;
    content: string;
    buttons: { [id: string]: DialogButton };
    default: string,
    render: (root: HTMLElement) => void,
    close: (root: HTMLElement) => void,
}

declare class Dialog {
    constructor(data: DialogData, config: DialogConfig);
    public render(val: boolean): void;
}