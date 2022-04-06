window.onload = () => {
    /* Inputs */
    const inp_name = document.getElementById("inp-nume");
    const range = document.getElementById("inp-pret");
    const inp_categ = document.getElementById("inp-categorie");

    /* Spans */
    const span_range = document.getElementById("infoRange");

    /* Butoane */
    const btn_filtrare = document.getElementById("filtrare");
    const radio_buttons = document.getElementsByName("gr_rad");

    /* Produse */
    const produse = document.querySelectorAll("article.produs");

    /* Obtinem nr_pagini din radio button-ul selectat */
    const get_nr_pagini = () => {
        let nr_pagini;
        for (let radio of radio_buttons) {
            if (radio.checked) {
                nr_pagini = radio.value;
                break;
            }
        }
        if (nr_pagini != "toate") {
            let min_pagini, max_pagini;
            [min_pagini, max_pagini] = nr_pagini.split(":");
            min_pagini = parseInt(min_pagini);
            max_pagini = parseInt(max_pagini);
            nr_pagini = [min_pagini, max_pagini];
        } else {
            nr_pagini = [0, 10000];
        }
        return nr_pagini;
    }

    range.onchange = e => {
        span_range.innerHTML = " (" + e.target.value + ") ";
    }

    btn_filtrare.onclick = () => {
        const val_name = inp_name.value;
        for (const produs of produse) {
            produs.style.display = "none";

            /* Numele cartii */
            const cond1 = produs.getElementsByClassName("val-nume")[0].innerHTML.startsWith(val_name);

            /* Intervalul de pagini */
            let cond2 = false;
            const nr_pagini = parseInt(produs.getElementsByClassName("val-nr-pagini")[0].innerHTML);
            const [min_pagini, max_pagini] = get_nr_pagini();
            console.log(min_pagini, nr_pagini, max_pagini);
            if (min_pagini <= nr_pagini && nr_pagini <= max_pagini) {
                cond2 = true;
            }

            /* Pret minim */
            let cond3 = false;
            const pret = parseInt(produs.getElementsByClassName("val-pret")[0].innerHTML);
            const min_pret = parseInt(span_range.innerHTML.slice(2, -2));
            if (min_pret <= pret) {
                cond3 = true;
            }

            /* Categorie */
            const categ_carte = produs.getElementsByClassName("val-categorie")[0].innerHTML;
            const cond4 = (inp_categ.value === "toate" || categ_carte === inp_categ.value);

            if (cond1 && cond2 && cond3 && cond4) {
                produs.style.display = "block";
            }
        }
    };
};