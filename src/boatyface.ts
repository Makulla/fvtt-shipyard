import sliderTemplate, { DialogData } from "../templates/sliders.handlebars";
import tableTemplate from "../templates/table.handlebars";

function showDialog() {
    const cargoSliderId = "boatyfaceCargoSlider";
    const outputTableId = "boatyfaceOutputTableId";
    const data: DialogData = { outputTableId, cargo: { min: 1, max: 5, value: 3, id: cargoSliderId } };

    const d = new Dialog({
        title: "Boatyface",
        content: sliderTemplate(data) + tableTemplate(data),
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: () => {}
            }
        },
        default: "ok",
        render: html => {
            const table = (html.querySelector(`#${outputTableId}`) as HTMLTableElement);
            const slider = (html.querySelector(`#${cargoSliderId}`) as HTMLFormElement);

            table.innerHTML = tableTemplate(data);

            slider.addEventListener("change", () => 
            {
                data.cargo.delta = data.cargo.value - slider.value;
                data.cargo.value = slider.value;
                
                table.innerHTML = tableTemplate(data);
            })
        },
        close: html => { },
    }, {
        jQuery: false
    });

    d.render(true);
}

Hooks.on("init", () => { });
Hooks.on("ready", () => { (<any>window)["showBoatyface"] = () => showDialog(); });