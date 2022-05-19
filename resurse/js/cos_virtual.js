window.addEventListener("load", function () {
    let prod_sel = localStorage.getItem("cos_virtual");
    
    if (prod_sel) {
        let vect_ids = prod_sel.split(",");
        fetch("/produse_cos", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({
                ids_prod: vect_ids
            })
        }).then(function (rasp) {
            return rasp.json();
        }).then(function (objson) {
                for (let prod of objson) {
                    let articol = document.createElement("article");
                    articol.innerHTML = `<div class="container border mb-2"><p>Nume: ${prod.nume}</p> <p>Descriere: ${prod.descriere}</p> <p>Pret: ${prod.pret}</p></div>`

                    document.getElementsByTagName("main")[0].insertBefore(articol, document.getElementById("cumpara"));
                }
            }
        ).catch(function (err) {
            console.log(err)
        });

        /*
                document.getElementById("cumpara").onclick=function(){
                        //TO DO: preluare vector id-uri din localStorage

                    fetch("/cumpara", {

                        method: "POST",
                        headers:{'Content-Type': 'application/json'},

                        mode: 'cors',
                        cache: 'default',
                        body: JSON.stringify({
                            ids_prod: 0,
                        })
                    })
                    .then(function(rasp){ console.log(rasp); return rasp.text()})
                    .then(function(raspunsText) {

                        console.log(raspunsText);
                        //Ștergem conținutul paginii
                        //creăm un paragraf în care scriem răspunsul de la server
                        //Dacă utilizatorul e logat și cumpărarea a reușit,

                        let p=document.createElement("p");
                        p.innerHTML=raspunsText;
                        document.getElementsByTagName("main")[0].innerHTML="";
                        document.getElementsByTagName("main")[0].appendChild(p)
                        if(!raspunsText.includes("nu sunteti logat"))
                            localStorage.removeItem("produse_selectate");

                    }
                    ).catch(function(err){console.log(err)});
                }
                */
    } else {
        document.getElementsByTagName("main")[0].innerHTML = "<p>Nu aveti nimic in cos!</p>";
    }
});