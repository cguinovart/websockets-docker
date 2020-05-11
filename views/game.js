var tablerodejuego = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

var colors = ["#ff0000", "#33cc33", "#3366ff", "#ffff00"];
var aleatori = Math.floor(Math.random() * (colors.length));
var color_player = colors[aleatori];
var contador = 0;

function ini() {

    document.getElementById("h1").style.color = "red";
    var socket = io.connect('http://localhost:3000');

    tablero();
    var button = document.getElementById("enviar");
    var output = document.getElementById("output");

    var tabla = document.getElementById("tablero");

    tabla.addEventListener("click", juego, false);


    socket.on('message', function (data) {

        console.log(data.message);
        var row = data.message.substring(7, 8);
        var col = data.message.substring(8, 9);
        if (tablerodejuego[row][col] == 0) {
            document.getElementById(data.message).style.background = data.color;
            tablerodejuego[row][col] = 1;
        }
        if (contador == 99) {
            document.getElementById("marcador").innerHTML = "<h1 class=\"display-3 text-center\">Partida Acabada</h1>";
            tabla.removeEventListener("click", juego, false);
        } else {
            contador++;
        }

    });



}

function tablero() {
    var mitabla = document.getElementById("tablero");
    var thetabla = document.createElement("table");
    var mitblBody = document.createElement("tbody");
    for (var i = 0; i < 10; i++) {
        var mihilera = document.createElement("tr");
        for (var j = 0; j < 10; j++) {
            var micelda = document.createElement("td");
            mihilera.appendChild(micelda);
            micelda.className += "micasilla";
            micelda.id = "micelda" + i + j;
        }
        mitblBody.appendChild(mihilera);

    }
    thetabla.appendChild(mitblBody);
    mitabla.appendChild(thetabla);
}


function juego(e) {
    var socket = io()
    var linia = e.target.id.substring(7, 8);
    var columna = e.target.id.substring(8, 9);
    var row = parseInt(linia);
    var col = parseInt(columna);
    document.getElementById("marcador").innerHTML = "<h1 class=\"display-3 text-center\">WebSockets</h1>";

    if (tablerodejuego[row][col] == 0) {
        socket.emit('message', {
            message: e.target.id,
            color: color_player
        });
        console.log(contador);
    }
    else {
        document.getElementById("marcador").innerHTML = "<h1 class=\"display-3 text-center\" style=\"color:red;\">Ya has tocat aqui</h1>";
    }
}

window.addEventListener("load", ini, false);





