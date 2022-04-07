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
    const btn_resetare = document.getElementById("resetare");
    const sort_cresc = document.getElementById("sortCrescNume");
    const sort_descresc = document.getElementById("sortDescrescNume");

    /* Produse */
    const produse = document.querySelectorAll("article.produs");
    const grid_produse = document.getElementsByClassName("grid-produse")[0];

    /* Obtinem nr_pagini din radio button-ul selectat */
    const get_nr_pagini = () => {
        let nr_pagini;
        for (let radio of radio_buttons) {
            if (radio.checked) {
                nr_pagini = radio.value;
                break;
            }
        }
        if (nr_pagini !== "toate") {
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

    /* Filtrare */
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

    /* Resetare */
    btn_resetare.onclick = () => {
        for(const produs of produse) {
            produs.style.display = "block";
        }

        inp_name.value = "";
        range.value = 0;
        span_range.innerHTML = "(0)";
        document.getElementById("i_rad4").checked = true;
        document.getElementById("sel-toate").selected = true;
    }

    const sort_produse = (sgn) => {
        let array_produse = Array.from(produse);
        array_produse.sort((a,  b) => {
            const a_pret = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            const b_pret = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if(a_pret !== b_pret) {
                return sgn * (a_pret - b_pret);
            }

            const a_nume = a.getElementsByClassName("val_nume")[0].innerHTML;
            const b_nume = b.getElementsByClassName("val-nume")[0].innerHTML;
            return sgn * a_nume.localeCompare(b_nume);
        });

        return array_produse;
    }

    /* Sortare crescatoare */
    sort_cresc.onclick = () => {
        const array_produse = sort_produse(1);

        for(const produs of array_produse) {
            grid_produse.appendChild(produs);
        }
    }

    /* Sortare descrescatoare */
    sort_descresc.onclick = () => {
        const array_produse = sort_produse(-1);

        for(const produs of array_produse) {
            grid_produse.appendChild(produs);
        }
    }
};