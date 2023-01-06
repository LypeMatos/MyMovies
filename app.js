const express = require('express');
const exphdb = require('express-handlebars');
const db = require('./database/connDB');
const movieRoutes = require('./routes/MovieRoutes');
const userRoutes = require('./routes/UserRoutes');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

//inicializando express
const app = express();

//midleware body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());

//configurando template engine
app.engine('handlebars', exphdb.engine());
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.use(session({
    name: 'session',
    secret: 'sessionsecret',
    resave: true,
    saveUninitialized: true,
    store: new FileStore({
        path: require('path').join(require('os').tmpdir(), 'sessions')
    }),
    cookie: {
        httpOnly: true
    }
}))

app.use(flash());
app.use((req, res, next) => {
    if(req.session.userid){
        res.locals.session = req.session;
    }

    next();
})

//definindo rotas
app.use('/', movieRoutes);
app.use('/', userRoutes);

db.sync();

//porta para rodar o servidor
app.listen(3000, () => {
    console.log('servidor está rodando');
})