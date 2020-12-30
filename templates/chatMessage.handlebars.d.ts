interface ChatMessageData {
    tableHtml: string;
    inputId: string;
    mayNotApply: boolean;
}

declare let chatMessageTemplate: (data: ChatMessageData) => string;
export default chatMessageTemplate;