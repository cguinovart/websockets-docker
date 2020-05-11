var express = require("express");
var router = express.Router();
var passport = require('passport');

var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());



var User = require('./user');
router.get("/", function (req, res) {

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
    })
});



router.get("/login", function (req, res) {
    res.render("login", { title: 'Joc de Pintar' });
});


router.post("/login", function (req, res, next) {
    var user_nom = req.body.nom;

    User.findOne({ nom: req.body.nom, password: req.body.password }, (err, user) => {

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

router.get("/registre", function (req, res) {
    res.render("registre", { title: 'Joc de Pintar' });
});

router.post("/registre", function (req, res, next) {

    if (req.body.password == req.body.password2) {
        var newUser = new User();
        newUser.nom = req.body.nom;
        newUser.password = req.body.password;
        newUser.partidasguanyades = 0;
        newUser.save(function (err) {
            if (err) { throw err; }
            console.log(newUser)
        });
        res.redirect('/')
    } else {
        res.send("Les contrasenyas no coincideixen");
    }

    next();

});


router.get("/game", function (req, res) {

    if (req.session.nombre) {
        res.sendFile(__dirname + '/views/game.html');
        console.log(req.session);
    } else {
        res.redirect('/')
    }
});


router.get("/logout", function (req, res) {
    req.session.destroy();
    console.log(req.session);
    res.redirect('/')
});


router.get("*", function (req, res) {
    res.sendFile(__dirname + '/views/notfound.html');
});



passport.serializeUser(function (user_nom, done) {
    done(null, user_nom);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user_nom) {
        done(err, user_nom);
    });
});

module.exports = router;