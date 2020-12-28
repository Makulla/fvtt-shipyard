console.log("on load");

Hooks.on("init", function() {
  console.log("on init");
});

Hooks.on("ready", function() {
    let d = Dialog.confirm({
        title: "A Yes or No Question",
        content: "<p>Choose wisely.</p>",
        yes: () => console.log("You chose ... wisely"),
        no: () => console.log("You chose ... poorly"),
        defaultYes: false
    });
});