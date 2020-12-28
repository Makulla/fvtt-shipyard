console.log("on load");

Hooks.on("init", function() {
  console.log("on init");
});

Hooks.on("ready", function() {
    let je = new JournalEntry({ name: "The boat" });
});