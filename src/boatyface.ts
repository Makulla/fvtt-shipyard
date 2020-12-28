import dialogTemplate, { DialogData } from "../templates/dialog.handlebars";

function showDialog() {
    const cargoSliderId = "boatyfaceCargoSlider";
    const data: DialogData = { cargo: { min: 1, max: 5, value: 3, id: cargoSliderId } };

    const d = new Dialog({
        title: "Boatyface",
        content: dialogTemplate(data),
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: () => {}
            }
        },
        default: "ok",
        render: html => {
            const slider = (html.querySelector(`#${cargoSliderId}`) as HTMLFormElement);
            slider.addEventListener("change", () => 
            {
                data.cargo.value = slider.value;
                html.innerHTML = dialogTemplate(data);
            })
        },
        close: html => { },
    }, {
        jQuery: false
    });

    d.render(true);
}

Hooks.on("init", () => { });

Hooks.on("ready", () => {     
    (<any>window)["showBoatyface"] = () => showDialog();
});