import dialogTemplate from "../templates/dialog.handlebars";

Hooks.on("init", () => {});
Hooks.on("ready", () => {
    debugger;
    console.log(dialogTemplate());
});