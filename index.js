var express = require("express");
var app = express();
var routes = require("./routes");

var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var socketio = require('socket.io');
var bodyParser = require('body-parser');

//DATABASE MONGO

//connecció a base de dades
mongoose.connect('mongodb://mongo:27017/websockets', (err, res) => {
    useMongoClient: true;
    if (err) console.log(`Error en la conexió de la base de dades:${err}`)
})

//require('./config/passport')(passport);

app.set('port', process.env.PORT || 3000);

app.set('view engine', 'pug');

//middlewares

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'practicaWebsockets',
    resave: false,
    saveUninitialized: false,

}));
app.use(passport.initialize());
app.use(passport.session());

var server = app.listen(app.get('port'), function () {
    console.log("servidor iniciat");

});

//routes
var io = socketio.listen(server);
var User = require('./user');
app.get("/", function (req, res) {
    //  req.session.user = req.session.user ? req.session.user + 1: 1;

    User.find({}, (err, users) => {
        if (err) {
            return res.status(500).send("Error");
        }
        else if (!users) {
            res.status(500).send("No hi ha usuaris registrats");
        }
        else {
            users.sort(function (a, b) {
                return b.partidasguanyades - a.partidasguanyades;
            })
            res.render("index", { title: 'Joc de Pintar', arrayUser: users, usuari: req.session.nombre });


            console.log(req.session);
        }

        // res.send(users[0].nom)
    })

});



app.get("/login", function (req, res) {
    res.render("login", { title: 'Joc de Pintar' });
});


app.post("/login", function (req, res, next) {
    var user_nom = req.body.nom;
    User.findOne({ nom: req.body.nom, password: req.body.password }, (err, user) => {
        //console.log(user.nom);

        if (err) {
            res.send("Error en la conexió");
            res.end();
        }

        if (!user) {
            res.send("Usuari o contrasenya incorrectes");
            res.end();
        }
        console.log(req.session);
    })
    req.session.nombre = req.body.nom;
    res.redirect('/');
    next();

});


app.get("/registre", function (req, res) {
    res.render("registre", { title: 'Joc de Pintar' });
});


app.post("/registre", function (req, res, next) {
    //  console.log(req.body);
    if (req.body.password == req.body.password2) {
        var newUser = new User();
        newUser.nom = req.body.nom;
        newUser.password = req.body.password;
        newUser.partidasguanyades = 0;
        newUser.save(function (err) {
            if (err) { throw err; }
            // console.log(newUser)
        });
        res.redirect('/')
    } else {
        res.send("Les contrasenyas no coincideixen");
    }
    next();
});



//JOC
app.get("/game", function (req, res) {
    if (req.session.nombre) {
        res.sendFile(__dirname + '/views/game.html');
        //  console.log(req.session);
        io.on('connection', (socket) => {
            //  console.log('new connection',socket.id);
            socket.on('puntuacio', (data) => {
                console.log(data.resultat);
                //  console.log(req.session);
                if (data.resultat == "victoria") {
                    User.findOne({ nom: req.session.nombre }, (err, user) => {
                        //console.log(user.nom);
                        user.partidasguanyades = user.partidasguanyades + 1;
                        user.save();
                        // console.log(user);
                    })
                }
                //   io.sockets.emit('message',data);
            })

        });
    } else {
        res.redirect('/')
    }

});



//TANCAR SESSIÓ
app.get("/logout", function (req, res) {
    req.session.destroy();
    // console.log(req.session);
    res.redirect('/')

});

app.get("*", function (req, res) {
    res.sendFile(__dirname + '/views/notfound.html');
});

io.on('connection', (socket) => {
    //  console.log('new connection',socket.id);
    socket.on('message', (data) => {
        console.log(data);
        io.sockets.emit('message', data);
    })
});


passport.serializeUser(function (user_nom, done) {
    done(null, user_nom);
});


passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user_nom) {
        done(err, user_nom);
    });
});


app.use(express.static(__dirname + '/views'));
