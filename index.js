const express = require('express');
app = express();

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const sass = require('sass');
const sharp = require('sharp');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});

const formidable = require('formidable');
const crypto = require('crypto');
const session = require('express-session');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
var geoip = require('geoip-lite');

app.use(helmet.frameguard());
app.use(["/produse_cos", "/cumpara"], express.json({limit: "2mb"}));

app.use(session({
    secret: 'abcdefg',      //folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}));

/* DB Setup */
const {Client} = require('pg');
const client = (process.env.ONLINE) ? new Client({
    database: "d1o6io0om1nthn",
    user: "xyvpbfwgmsvxny",
    password: "1f70202fc346cec5ca700c27cf39f837004694e4f3de4ae6044064feba2a1d13",
    host: "ec2-34-197-84-74.compute-1.amazonaws.com",
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
}) : new Client({
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
    emailServer: 'magazinulcartianultw@gmail.com'
}

foldere = ["temp", "poze_uploadate"];
for (let folder of foldere) {
    const cale = path.join(__dirname, folder);
    if (!fs.existsSync(cale)) {
        fs.mkdirSync(cale);
    }
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
app.use("/poze_uploadate", express.static(__dirname + "/poze_uploadate"));

/* Tipuri carti */
app.use("/*", (req, res, next) => {
    res.locals.tipuriCarti = obGlobal.tipuriCarti;
    res.locals.utilizator = req.session.utilizator;
    next();
});

function getIp(req) {//pentru Heroku
    var ip = req.headers["x-forwarded-for"];//ip-ul userului pentru care este forwardat mesajul
    if (ip) {
        let vect = ip.split(",");
        return vect[vect.length - 1];
    } else if (req.ip) {
        return req.ip;
    } else {
        return req.connection.remoteAddress;
    }
}

const sterge_accesari_vechi = () => {
    const queryDelete = `delete from accesari where now()-data_accesare >= interval '8 minutes'`;
    client.query(queryDelete, (err, res) => {
        if (err) {
            console.log(err);
        }
    });
};
setInterval(() => {
    sterge_accesari_vechi();
}, 8 * 60 * 1000);

app.get("/*", (req, res, next) => {
    const id_utiliz = (req.session.utilizator) ? req.session.utilizator.id : null;
    const queryInsert = `insert into accesari (ip, user_id, pagina) values ('${getIp(req)}', ${id_utiliz}, $1::text)`;
    client.query(queryInsert, [req.url], (err, resQuery) => {
        if (err) {
            console.log(err);
        }
    });
    next();
});

const trimiteMail = async (email, subiect, mesajText, mesajHtml, atasamente = []) => {
    var transp = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth: {
            user: obGlobal.emailServer,
            pass: "jpotebbvqaqtkpfo"
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    await transp.sendMail({
        from: obGlobal.emailServer,
        to: email,
        subject: subiect,
        text: mesajText,
        html: mesajHtml,
        attachments: atasamente
    });
}

app.get(["/", "/index", "/home"], (req, res) => {
    const query_select = `select username, nume, prenume, culoare_chat from utilizatori where id in (select distinct user_id from accesari where now()-data_accesare <= interval '8 minutes')`;
    client.query(query_select, (err_1, resQuery) => {
        if (err_1) {
            console.log(err_1);
        } else {
            let evenimente = [];

            let texteEvenimente = ["Eveniment important", "Festivitate", "Prajituri gratis"];
            const dataCurenta = new Date();
            for (let i = 0; i < texteEvenimente.length; i++) {
                evenimente.push({
                    data: new Date(dataCurenta.getFullYear(), dataCurenta.getMonth(), Math.ceil(Math.random() * 27)),
                    text: texteEvenimente[i]
                });
            }
            console.log(evenimente)

            res.render("pagini/index", {
                ip: req.ip,
                imagini_galerie_statica: imaginiFereastraTimp(),        /* filtram dupa timp */
                imagini_galerie_animata: obGlobal.obImagini.imagini,    /* trimitem toate imaginile */
                mesaj_login: req.query["result"],                       /* rezultatul logarii daca este cazul */
                useri_online: resQuery.rows,
                geolocation: geoip.lookup(getIp(req)),
                evenimente: evenimente
            });
        }
    });
});

app.get("/produse", (req, res) => {
    client.query("select * from unnest(enum_range(null::categ_carti))", (err1, categRes) => {
        client.query("select distinct unnest(genuri_literare) from carti c", (err2, genuriRes) => {
            client.query("select min(pret) from carti", (err3, minRes) => {
                client.query("select max(pret) from carti", (err4, maxRes) => {
                    client.query("select distinct autor from carti", (err3, autoriRes) => {
                        const restr_tip = (req.query.tip) ? `tip='${req.query.tip}'` : "1=1"
                        client.query("select * from carti where " + restr_tip, (err, queryRes) => {
                            res.render("pagini/produse", {
                                tip: (req.query.tip) ? req.query.tip : "Toate",
                                produse: queryRes.rows,
                                optiuni: categRes.rows,
                                genuri: genuriRes.rows,
                                autori: autoriRes.rows,
                                min_price: minRes.rows[0].min,
                                max_price: maxRes.rows[0].max
                            });
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

app.post("/produse_cos", (req, res) => {
    if (req.body.ids_prod.length === 0) {
        res.send([]);
        return;
    }
    let querySelect = `select nume, descriere, pret from carti where id in (${req.body.ids_prod.join(',')})`;
    client.query(querySelect, (err, res_query) => {
        if (err) {
            console.log(err);
            res.send([]);
        } else {
            res.send(res_query.rows);
        }
    });
});

const salt = "tehniciweb";
app.post("/inreg", (req, res) => {
    const formular = new formidable.IncomingForm();
    formular.parse(req, (err, campuriText, campuriFisier) => {
        const parola_criptata = crypto.scryptSync(campuriText.parola, salt, 64).toString('hex');

        //Validari
        let eroare = "";
        if (campuriText.username === "") {
            eroare += "Username necompletat!\n";
        }
        if (campuriText.nume === "") {
            eroare += "Nume necompletat!\n";
        }
        if (campuriText.prenume === "") {
            eroare += "Prenume necompletat!\n";
        }
        if (campuriText.email === "") {
            eroare += "Email necompletat!\n";
        }
        if (campuriText.parola === "") {
            eroare += "Parola necompletata!\n";
        }
        if (!campuriText.username.match(new RegExp("^[A-Za-z0-9]+$"))) {
            eroare += "Username contine si caractere nealfanumerice!\n";
        }
        if (campuriText.parola !== campuriText.rparola) {
            eroare += "Cele doua parole nu se potrivesc!\n";
        }
        if (!campuriText.email.includes("@")) {
            eroare += "Email invalid!\n";
        }

        if (campuriFisier.poza.size === 0) {
            eroare += "Lipsa poza!\n";
        }

        if (eroare !== "") {
            res.render("pagini/inregistrare", {
                err: eroare
            });
            return;
        }

        const oldPath = campuriFisier.poza._writeStream.path;
        if (!fs.existsSync(path.join(__dirname, 'poze_uploadate', `${campuriText.username}`))) {
            fs.mkdirSync(path.join(__dirname, 'poze_uploadate', `${campuriText.username}`));
            const newPath = path.join(__dirname, 'poze_uploadate', `${campuriText.username}`) + "/poza.jpg";
            const rawData = fs.readFileSync(oldPath);

            fs.writeFile(newPath, rawData, function (err) {
                if (err) {
                    eroare += "Eroare la incarcarea pozei de profil!\n";
                }
                if (eroare !== "") {
                    res.render("pagini/inregistrare", {
                        err: eroare
                    });
                    return;
                }

                const query_utilizator = `select username from utilizatori where username='${campuriText.username}'`;
                client.query(query_utilizator, (err_0, res_0) => {
                    if (err_0) {
                        console.log(err);
                        res.render("pagini/inregistrare", {
                            err: "Eroare baza de date"
                        });
                    } else if (res_0.rows.length !== 0) {
                        eroare += "Username-ul este deja folosit\n";
                        res.render("pagini/inregistrare", {
                            err: eroare
                        });
                    } else {
                        const comanda_inserare = `insert into utilizatori (username, nume, prenume, parola, email, culoare_chat, telefon) values ($1::text, $2::text, $3::text,'${parola_criptata}', $4::text, $5::text, $6::text) RETURNING data_adaugare`;
                        client.query(comanda_inserare, [campuriText.username, campuriText.nume, campuriText.prenume, campuriText.email, campuriText.culoare_chat, campuriText.telefon], (err_1, res_1) => {
                            if (err_1) {
                                console.log(err_1);
                                res.render("pagini/inregistrare", {
                                    err: "Eroare baza de date"
                                });
                            } else {
                                const data_adaugare = res_1.rows[0].data_adaugare;

                                let token = "";
                                for (let i = 1; i <= 50; i++) {
                                    token += String.fromCharCode(Math.floor(Math.random() * 26) + "a".charCodeAt(0));
                                }

                                const comanda_inserare_token = `update utilizatori set cod='${token}' where username= $1::text`;
                                client.query(comanda_inserare_token, [campuriText.username], (err_2, res_2) => {
                                    if (err_2) {
                                        console.log(err_2);
                                        res.render("pagini/inregistrare", {
                                            err: "Eroare baza de date"
                                        });
                                    } else {
                                        res.render("pagini/inregistrare", {
                                            raspuns: "Datele au fost introduse"
                                        });
                                        trimiteMail(campuriText.email, `Salut, stimate ${campuriText.nume}`, "Bun venit!", `Username-ul tau este ${campuriText.username} pe site-ul <strong><i><em>https://afternoon-sea-55888.herokuapp.com</em></i></strong>. <br/> Pentru a confirma emailul, accesati <a href='https://afternoon-sea-55888.herokuapp.com/cod_mail/${token}-${data_adaugare.getTime()}/${campuriText.username}'>acest link</a>`, []);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        } else {
            eroare += "Username-ul exista deja!\n";
            if (eroare !== "") {
                res.render("pagini/inregistrare", {
                    err: eroare
                });
            }
        }
    });
});

const update_profile = (campuriText, criptareParola, req, res, changes) => {
    const queryUpdate = `update utilizatori set nume=$1::text, prenume=$2::text, email=$3::text, culoare_chat=$4::text, telefon=$5::text where parola='${criptareParola}' and username=$6::text`;
    client.query(queryUpdate, [campuriText.nume, campuriText.prenume, campuriText.email, campuriText.culoare_chat, campuriText.telefon, campuriText.username], function (err, rez) {
        if (err) {
            console.log(err);
            res.render("pagini/eroare_generala", {text: "Eroare baza date. Incercati mai tarziu."});
            return;
        }
        if (rez.rowCount === 0) {
            res.render("pagini/profil", {mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa."});
            return;
        }

        if (req.session.utilizator.nume !== campuriText.nume) {
            changes.push("numele");
        }
        if (req.session.utilizator.prenume !== campuriText.prenume) {
            changes.push("prenumele");
        }
        if (req.session.utilizator.email !== campuriText.email) {
            changes.push("emailul");
        }
        if (req.session.utilizator.culoare_chat !== campuriText.culoare_chat) {
            changes.push("culoarea de chat");
        }
        if (req.session.utilizator.telefon !== campuriText.telefon) {
            changes.push("telefonul");
        }

        req.session.utilizator.nume = campuriText.nume;
        req.session.utilizator.prenume = campuriText.prenume;
        req.session.utilizator.email = campuriText.email;
        req.session.utilizator.culoare_chat = campuriText.culoare_chat;
        req.session.utilizator.telefon = campuriText.telefon;

        let mesaj = "Editarile s-au efectuat cu succes! Ati schimbat urmatoarele: <br/><ul>";
        for (const camp of changes) {
            mesaj += `<li>${camp}</li>`;
        }
        mesaj += "</ul>.";
        trimiteMail(req.session.utilizator.email, 'Editare detalii cont', '', mesaj, []);

        res.render("pagini/profil", {mesaj: "Update-ul s-a realizat cu succes."});
    });
}

app.post("/profil", function (req, res) {
    if (!req.session.utilizator) {
        res.render("pagini/eroare_generala", {text: "Nu sunteti logat."});
        return;
    }
    const formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFisier) {
        const criptareParola = crypto.scryptSync(campuriText.parola, salt, 64).toString('hex');

        if (campuriFisier.poza.size === 0) {
            update_profile(campuriText, criptareParola, req, res, []);
        } else {
            const oldPath = campuriFisier.poza._writeStream.path;
            const newPath = path.join(__dirname, 'poze_uploadate', `${campuriText.username}`) + "/poza.jpg";
            const rawData = fs.readFileSync(oldPath);

            fs.writeFile(newPath, rawData, function (err) {
                if (err) {
                    console.log(err);
                }
                update_profile(campuriText, criptareParola, req, res, ["imaginea de profil"]);
            });
        }
    });
});

app.post("/promoveaza", urlencodedParser, (req, res) => {
    if (!req.session.utilizator || req.session.utilizator.rol !== "admin") {
        res.redirect("/useri");
        return;
    }
    client.query(`update utilizatori set rol='admin' where id=${req.body.id}`, (err, resQuery) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/useri");
    });
});

app.post("/retrogradeaza", urlencodedParser, (req, res) => {
    if (!req.session.utilizator || req.session.utilizator.rol !== "admin") {
        res.redirect("/useri");
        return;
    }
    client.query(`update utilizatori set rol='comun' where id=${req.body.id}`, (err, resQuery) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/useri");
    });
});

app.get("/cod_mail/:token1_2/:username", (req, res) => {
    const comanda_lookup = `SELECT * from utilizatori where username=$1::text`;
    client.query(comanda_lookup, [req.params["username"]], (err, queryRes) => {
        if (err) {
            res.render("pagini/token", {
                mesaj: "Eroare baza de date!"
            });
        } else {
            const [token_1, insert_time] = req.params["token1_2"].split("-");
            if (token_1 === queryRes.rows[0].cod && insert_time == queryRes.rows[0].data_adaugare.getTime()) {
                client.query(`update utilizatori set confirmat_mail='true' where username=$1::text`, [req.params["username"]], (err_1, queryRes_1) => {
                    console.log(err_1);
                    if (err_1) {
                        res.render("pagini/token", {
                            mesaj: "Eroare baza de date la confirmare! Incercati din nou."
                        });
                    } else {
                        res.render("pagini/token", {
                            mesaj: "Ati confirmat mail-ul!"
                        });
                    }
                });
            } else {
                res.render("pagini/token", {
                    mesaj: "Link invalid! Incercati din nou!"
                });
            }
        }
    })
});

app.post("/login", (req, res) => {
    const formular = new formidable.IncomingForm();
    formular.parse(req, (err, campuriText, campuriFisier) => {
        const parola_criptata = crypto.scryptSync(campuriText.parola_login, salt, 64).toString('hex');
        const query_select = `select * from utilizatori where username= $1::text and parola='${parola_criptata}'`;
        client.query(query_select, [campuriText.username_login], (err, query_res) => {
            if (err) {
                console.log(err);
                res.redirect("/index?result=eroare_bd");
            } else {
                if (query_res.rows.length === 1) {
                    if (query_res.rows[0].confirmat_mail === false) {
                        res.redirect("/index?result=mail_neconfirmat");
                    } else {
                        req.session.utilizator = {
                            id: query_res.rows[0].id,
                            nume: query_res.rows[0].nume,
                            prenume: query_res.rows[0].prenume,
                            username: query_res.rows[0].username,
                            email: query_res.rows[0].email,
                            culoare_chat: query_res.rows[0].culoare_chat,
                            telefon: query_res.rows[0].telefon,
                            rol: query_res.rows[0].rol
                        };
                        res.redirect("/index?result=login_success");
                    }
                } else {
                    res.redirect("/index?result=username_parola_incorecta");
                }
            }
        });
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
});

const delete_folder = (nume) => {
    if (fs.existsSync(path.join(__dirname, 'poze_uploadate', nume))) {
        fs.rmSync(path.join(__dirname, 'poze_uploadate', nume), {recursive: true, force: true});
    }
}

app.post("/delete_cont", (req, res) => {
    const formular = new formidable.IncomingForm();
    formular.parse(req, (err, campuriText) => {
        const parola_criptata = crypto.scryptSync(campuriText.parola, salt, 64).toString('hex');
        client.query(`select * from utilizatori where username=$1::text and parola='${parola_criptata}'`, [req.session.utilizator.username], (err_1, res_1) => {
            if (err_1) {
                res.redirect("/index?result=eroare_bd");
            } else if (res_1.rows.length === 1) {
                client.query(`delete from utilizatori where username=$1::text`, [req.session.utilizator.username], (err_2, res_2) => {
                    console.log(err_2);
                    if (err_2) {
                        res.redirect("/index?result=eroare_bd");
                    } else {
                        trimiteMail(req.session.utilizator.email, `Terminare cont`, '', `La revedere, ${req.session.utilizator.nume}. <br/> Sorry to see you go!`, []);
                        delete_folder(req.session.utilizator.username);
                        req.session.destroy();
                        res.locals.utilizator = null;
                        res.redirect("/index?result=success");
                    }
                });
            } else {
                res.redirect("/index?result=username_parola_incorecta");
            }
        });
    });
});

app.get("/useri", (req, res) => {
    if (req.session.utilizator && req.session.utilizator.rol === "admin") {
        client.query("select * from utilizatori", (err, resQuery) => {
            res.render("pagini/useri", {
                useri: resQuery.rows
            });
        });
    } else {
        randeazaEroare(res, 403);
    }
});

app.post("/sterge_utiliz", (req, res) => {
    if (!req.session.utilizator || req.session.utilizator.rol !== "admin") {
        res.redirect("/useri");
        return;
    }
    const formular = new formidable.IncomingForm();
    formular.parse(req, (err, campuriText, campuriFisier) => {
        const query_delete = `delete from utilizatori where id=${campuriText.id_utiliz} RETURNING username`;
        client.query(query_delete, (err_1, res_1) => {
            if (err_1) {
                console.log(err_1);
            } else {
                delete_folder(res_1.rows[0].username);
            }
            res.redirect("/useri");
        });
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
    ];

    const index_pick = Math.floor(Math.random() * optiuni_aleatoare.length);
    const {nr_imag, pozitii_imagini} = optiuni_aleatoare[index_pick];

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
    let oraCurenta = (new Date().getHours() >= 10 ? new Date().getHours() : '0' + new Date().getHours())
        + ":"
        + (new Date().getMinutes() >= 10 ? new Date().getMinutes() : '0' + new Date().getMinutes());
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

console.log("Loading...");
setTimeout(() => {
    const s_port = process.env.PORT || 8080;
    app.listen(s_port, () => {
        console.log("Started");
    });
}, 3500);