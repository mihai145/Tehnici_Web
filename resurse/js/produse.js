window.onload = () => {
    /* Inputs */
    const inp_name = document.getElementById("inp-nume");
    const range_min = document.getElementById("inp-pret-min");
    const range_max = document.getElementById("inp-pret-max");
    const inp_categ = document.getElementById("inp-categorie");

    /* Spans */
    const span_range_min = document.getElementById("infoRangeMin");
    const span_range_max = document.getElementById("infoRangeMax");

    /* Butoane */
    const btn_filtrare = document.getElementById("filtrare");
    const radio_buttons = document.getElementsByName("gr_rad");
    const btn_resetare = document.getElementById("resetare");
    const sort_cresc = document.getElementById("sortCrescNume");
    const sort_descresc = document.getElementById("sortDescrescNume");
    const btn_calculeaza = document.getElementById("calculeaza");

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

    range_min.onchange = e => {
        span_range_min.innerHTML = " (" + e.target.value + ") ";
    }

    range_max.onchange = e => {
        span_range_max.innerHTML = " (" + e.target.value + ") ";
    }


    const match_name = (str_a, str_b) => {
        if (!str_b.includes("*")) {
            /* Daca str_b nu contine '*', str_a trebuie sa aibe ca prefix str_b*/
            return str_a.startsWith(str_b);
        } else if (str_b.split('*').length === 2) {
            /* Daca str_b contine '*', str_a trebuie sa se potriveasca si la prefix, si la sufix */
            [prefix, sufix] = str_b.split("*");
            if (str_a.startsWith(prefix) && str_a.endsWith(sufix) && prefix.length + sufix.length <= str_a.length) {
                return true;
            } else {
                return false;
            }
        } else {
            /* Cautare invalida */
            inp_name.value = "";
            return false;
        }
    };

    /* Filtrare */
    btn_filtrare.onclick = () => {
        const val_name = inp_name.value;
        for (const produs of produse) {
            produs.style.display = "none";

            /* Numele cartii */
            const cond1 = match_name(produs.getElementsByClassName("val-nume")[0].innerHTML, val_name);

            /* Intervalul de pagini */
            let cond2 = false;
            const nr_pagini = parseInt(produs.getElementsByClassName("val-nr-pagini")[0].innerHTML);
            const [min_pagini, max_pagini] = get_nr_pagini();
            if (min_pagini <= nr_pagini && nr_pagini <= max_pagini) {
                cond2 = true;
            }

            /* Pret */
            let cond3 = false;
            const pret = parseInt(produs.getElementsByClassName("val-pret")[0].innerHTML);
            const min_pret = parseInt(span_range_min.innerHTML.slice(2, -2));
            const max_pret = parseInt(span_range_max.innerHTML.slice(2, -2));
            if (min_pret <= pret && pret <= max_pret) {
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
        for (const produs of produse) {
            produs.style.display = "block";
        }

        inp_name.value = "";

        range_min.value = 0;
        span_range_min.innerHTML = " (0) ";
        range_max.value = range_max.max;
        span_range_max.innerHTML = " (" + range_max.max + ") ";

        document.getElementById("i_rad4").checked = true;
        document.getElementById("sel-toate").selected = true;
    }

    const sort_produse = (sgn) => {
        let array_produse = Array.from(produse);
        array_produse.sort((a, b) => {
            const a_nume = a.getElementsByClassName("val-nume")[0].innerHTML;
            const b_nume = b.getElementsByClassName("val-nume")[0].innerHTML;
            if (a_nume.localeCompare(b_nume) !== 0) {
                return sgn * a_nume.localeCompare(b_nume);
            }

            const a_lg_desc = a.getElementsByClassName("val-descriere")[0].innerHTML.length;
            const b_lg_desc = b.getElementsByClassName("val-descriere")[0].innerHTML.length;
            return sgn * (a_lg_desc <= b_lg_desc);
        });

        return array_produse;
    }

    /* Sortare crescatoare */
    sort_cresc.onclick = () => {
        const array_produse = sort_produse(1);

        for (const produs of array_produse) {
            grid_produse.appendChild(produs);
        }
    }

    /* Sortare descrescatoare */
    sort_descresc.onclick = () => {
        const array_produse = sort_produse(-1);

        for (const produs of array_produse) {
            grid_produse.appendChild(produs);
        }
    }

    /* Calculare suma articole vizibile */
    btn_calculeaza.onclick = () => {
        if (!document.getElementById("calc-res")) {
            let suma = 0.0;
            for (const prod of produse) {
                if (prod.style.display !== "none") {
                    suma += parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                }
            }

            const calc_par = document.createElement("p");
            calc_par.id = "calc-res";
            calc_par.innerHTML = "Suma prețurilor produselor afișate: " + suma;

            const heading_tip_produse = document.getElementById("heading-tip-produse");
            document.getElementById("heading-tip-produse").parentElement.insertBefore(calc_par, heading_tip_produse);

            /* Sterge rezultatul calculului dupa 2 secunde */
            setTimeout(() => {
                calc_par.remove();
            }, 2000);
        }
    }
};