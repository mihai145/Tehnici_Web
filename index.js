const express = require('express');
app = express();

const fs = require('fs');
const ejs = require('ejs');
const sass = require('sass');
const sharp = require('sharp');

/* DB Setup */
const {Client} = require('pg');
const {max} = require("pg/lib/defaults");
const client = new Client({
    database: "proiect_cartianul",
    user: "mihai145",
    password: "mihai145",
    host: "localhost",
    port: 5432,
});
client.connect();

/* Variabile globale */
const obGlobal = {
    obImagini: null,
    obErori: null,
    tipuriCarti: null,
}
/* Initializare tipuri carti */
client.query("select * from unnest(enum_range(null::tip_carti))", (err, tipuriRes) => {
    if (err) {
        console.log(err);
    } else {
        obGlobal.tipuriCarti = tipuriRes.rows;
    }
});

/* View engine */
app.set("view engine", "ejs");
/* Static */
app.use("/resurse", express.static(__dirname + "/resurse"));

/* Tipuri carti */
app.use("/*", (req, res, next) => {
    res.locals.tipuriCarti = obGlobal.tipuriCarti;
    next();
});

app.get(["/", "/index", "/home"], (req, res) => {
    res.render("pagini/index", {
        ip: req.ip,
        vector: [10, 20, 30],
        imagini_galerie_statica: imaginiFereastraTimp(),    /* filtram dupa timp */
        imagini_galerie_animata: obGlobal.obImagini.imagini,         /* trimitem toate imaginile */
    });
});

app.get("/produse", (req, res) => {
    client.query("select * from unnest(enum_range(null::categ_carti))", (err1, categRes) => {
        client.query("select distinct unnest(genuri_literare) from carti c", (err2, genuriRes) => {
            client.query("select min(pret) from carti", (err3, minRes) => {
                client.query("select max(pret) from carti", (err4, maxRes) => {
                    const restr_tip = (req.query.tip) ? `tip='${req.query.tip}'` : "1=1"
                    client.query("select * from carti where " + restr_tip, (err, queryRes) => {
                        res.render("pagini/produse", {
                            tip: (req.query.tip) ? req.query.tip : "Toate",
                            produse: queryRes.rows,
                            optiuni: categRes.rows,
                            genuri: genuriRes.rows,
                            min_price: minRes.rows[0].min,
                            max_price: maxRes.rows[0].max
                        });
                    });
                });
            });
        });
    })
});

app.get("/produs/:id", (req, res) => {
    client.query(`select * from carti where id=${req.params["id"]}`, (err, queryRes) => {
        res.render("pagini/produs", {
            prod: queryRes.rows[0],
        })
    });
});

app.get("/*.ejs", (req, res) => {
    randeazaEroare(res, 403);
});

app.get("/galerie_statica", (req, res) => {
    res.render("pagini/galerie_statica", {
        imagini_galerie_statica: imaginiFereastraTimp(),
    });
});

app.get("*/galerie_animata.css", (err, res) => {
    const optiuni_aleatoare = [
        {
            nr_imag: 9,
            pozitii_imagini: "((1, 1), (2, 1), (2, 3), (2, 2), (1, 2), (1, 3), (3, 3), (3, 1), (3, 2))"
        },
        {
            nr_imag: 12,
            pozitii_imagini: "((1, 1), (2, 1), (2, 3), (2, 2), (1, 2), (1, 3), (3, 3), (3, 1), (3, 2), (4, 2), (4, 3), (4, 1))"
        },
        {
            nr_imag: 15,
            pozitii_imagini: "((1, 1), (2, 1), (2, 3), (2, 2), (1, 2), (1, 3), (3, 3), (3, 1), (3, 2), (4, 2), (4, 3), (4, 1), (5, 2), (5, 3), (5, 1))"
        }
    ]

    const index_pick = Math.floor(Math.random() * optiuni_aleatoare.length);
    const {nr_imag, pozitii_imagini} = optiuni_aleatoare[index_pick];
    //console.log(nr_imag, pozitii_imagini);

    const stringSCSS = fs.readFileSync(__dirname + "/resurse/scss/galerie_animata_scss.txt").toString("utf8");
    const resultSCSS = ejs.render(stringSCSS, {
        nr_imag: nr_imag,
        pozitii_imagini: pozitii_imagini
    });

    const caleSCSS = __dirname + "/temp/galerie_animata.scss";
    fs.writeFileSync(caleSCSS, resultSCSS);

    try {
        const resultCSS = sass.compile(caleSCSS, {sourceMap: true});

        const caleCSS = __dirname + "/temp/galerie_animata.css";
        fs.writeFileSync(caleCSS, resultCSS.css);

        res.setHeader("Content-Type", "text/css");
        res.sendFile(caleCSS);
    } catch (err) {
        console.log(err);
        res.send("Eroare!");
    }
});

const randeazaEroare = (res, identificator, titlu, text, imagine) => {
    const eroare = obGlobal.obErori.erori.find(el => {
        return (el.identificator === identificator);
    });

    titlu = titlu || (eroare && eroare.titlu) || "Eroare";
    text = text || (eroare && eroare.text) || "Text";
    imagine = imagine || (eroare && (obGlobal.obErori.cale_baza + '/' + eroare.imagine)) || "Imagine";

    if (eroare && eroare.status) {
        res.status(eroare.identificator);
    }

    res.render("pagini/eroare_generala", {
        titlu: titlu,
        text: text,
        imagine: imagine
    });
};

app.get("/eroare", (req, res) => {
    randeazaEroare(res, 1, "Eroare generala :)");
});

app.get("/*", (req, res) => {
    res.render("pagini" + req.url, (err, resRender) => {
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                randeazaEroare(res, 404);
            } else {
                //nu este 404, este o alta eroare
                throw err;
            }
        } else {
            res.send(resRender);
        }
    });
    res.end();
});

/* Returneaza imaginile al caror interval de afisare contine ora curenta */
const imaginiFereastraTimp = () => {
    let imaginiFereastraTimp = [];
    let oraCurenta = new Date().getHours() + ":" + new Date().getMinutes();
    for (let imag of obGlobal.obImagini.imagini) {
        [start_interval, end_interval] = imag.timp.split("-");
        if (start_interval <= oraCurenta && oraCurenta <= end_interval) {
            if (imaginiFereastraTimp.length < 10) {
                imaginiFereastraTimp.push(imag);
            }
        }
    }
    return imaginiFereastraTimp;
}

/* Redimensioneaza imaginile mari in medii si mici */
const creeazaImagini = () => {
    const buf = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf8");
    obGlobal.obImagini = JSON.parse(buf); //global

    for (let imag of obGlobal.obImagini.imagini) {
        let nume_imag, extensie;
        [nume_imag, extensie] = imag.cale_imagine.split("."); //"abc.de".split(".") ---> ["abc","de"]
        imag.mare = `${obGlobal.obImagini.cale_galerie}/${imag.cale_imagine}`;

        const dim_mediu = 300;
        imag.mediu = `${obGlobal.obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.webp`; //nume-300.webp
        if (!fs.existsSync(imag.mediu)) {
            sharp(__dirname + "/" + imag.mare).resize(dim_mediu).toFile(__dirname + "/" + imag.mediu);
        }

        const dim_mic = 150;
        imag.mic = `${obGlobal.obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp`; //nume-150.webp
        if (!fs.existsSync(imag.mic)) {
            sharp(__dirname + "/" + imag.mare).resize(dim_mic).toFile(__dirname + "/" + imag.mic);
        }
    }
}
creeazaImagini();

const creeazaErori = () => {
    const buf = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf8");
    obGlobal.obErori = JSON.parse(buf); //global
}
creeazaErori();

app.listen(8080, callback = () => {
    console.log("Serverul asculta pe portul 8080...");
});