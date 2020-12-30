declare const Hooks: {
    on(hook: "init" | "ready", handler: () => void): void;
}

declare interface Actor {
    update(data: { data: any }): void;
    readonly data: any;
}

declare const ui: {
    notifications: {
        error(message: string): void;
    }
}

declare const game: {
    actors: {
        find(predicate: (actor: { name: string }) => boolean): Actor | null;
    },
    user: {
        isGM: boolean;
    }
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

declare interface ChatMessageData {
    content: string;
    whisper?: User[];
}

declare interface User {

}

declare class ChatMessage {
    static create(data: ChatMessageData): Promise<void>;
    static getWhisperRecipients(userName: string): User[]; 
}

declare class Dialog {
    constructor(data: DialogData, config: DialogConfig);
    public render(val: boolean): void;
}