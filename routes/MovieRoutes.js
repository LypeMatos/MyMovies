const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const User = require('../models/User');
const Comment = require('../models/Comments');
const multer = require('multer');
const {Op} = require('sequelize');

//configurando multer
const storage = multer.diskStorage({
    filename: function(req, file, cb){
        let nome = Date.now() + ' - ' + file.originalname;
        cb(null, nome);
    },
    destination: function(req, file, cb){
        let path = 'public/images';
        cb(null, path);
    }
});

const upload = multer({storage: storage});

//Rotas
router.get('/', async (req, res) => {
    let search = '';
    let order = '';

    //busca por filmes
    if(req.query.search){
        search = req.query.search;
        //aqui vai pegar o valor digitado no campo search e salvar na variável
    }
    
    const movieData = await Movie.findAll({
        where: {
            name: {[Op.like]: `%${search}%`}
        },
        include: User
    });
    const movies = movieData.map((result) => result.get({plain: true}));
    let movieQtd = movies.length;   

    if(movieQtd === 0){
        movieQtd = false;
    }
    
    res.render('home', {movies, search, movieQtd});
});

router.get('/dashboard', async(req, res) => {
    const userId = req.session.userid;
    if(!userId){
        console.log(req.flash('message', 'Você precisa estar logado para acessar a dashboard'));
        res.redirect('/login');
    }else{        
        const movieData = await Movie.findAll({
            where: {
                UserId: userId
            },
            include: User
        });

        const movies = movieData.map((result) => result.dataValues);
        let emptyMovies;

        if(movies.length === 0){
            emptyMovies = true;
        }

        res.render('movie/dashboard', {movies, emptyMovies});
    }
})

router.get('/add', (req, res) => {res.render('movie/add')});

router.post('/add', upload.single('movieImage'), async (req, res) => {
    const userId = req.session.userid;
    const {movieName, movieComment, movieDate} = req.body;    
    let movieImage = '';

    const checkName = await Movie.findOne({where: {name: movieName}});

    if(!userId){
        req.flash('message', 'Você precisa estar logado para fazer um comentário');
        res.render('user/login');
        
        return;
    }

    if(checkName){
        req.flash('message', 'Este filme já foi cadastrado');
        res.render('movie/add');

        return;
    }

    if(!movieName){
        req.flash('message', 'Informe o nome do Movie');
        res.render('movie/add');

        return;
    }

    if(!movieComment){
        req.flash('message', 'Insira seu comentário sobre o Movie');
        res.render('movie/add');

        return;
    }

    if(!movieDate){
        req.flash('message', 'Informe a data de lançamento do Movie');
        res.render('movie/add');

        return;
    }

    if(!req.file){
        req.flash('message', 'Insira um poster para o Movie');
        res.render('movie/add');
        
        return;
    }else{
        movieImage = req.file.filename;
    }

    try{
        await Movie.create({
            name: movieName,
            commentary: movieComment,
            releaseDate: movieDate,
            movieImage: movieImage,
            UserId: userId
        });
        
        req.flash('message', 'Movie cadastrado com sucesso');
        req.session.save(() => {
            res.redirect('/dashboard');
        })        
    }catch(error){
        console.log(error);
    }
})

router.get('/movie/:id', async(req, res) => {
    const movieId = req.params.id;

    const movie = await Movie.findOne({where: {id: movieId}, include: User});
    const comment = await Comment.findAll({where: {MovieId: movieId}, include: User});
    const commentMap = comment.map((result) => result.dataValues);
    
    res.render('movie/movie', {movie, commentMap});
});

router.post('/movie/:id', async(req, res) => {
    const movieId = req.body.movieId;
    const comment = req.body.comment;
    const user = req.session.userid;

    if(!user){
        req.flash('message', 'Você deve estar logado para fazer um comentário');
        res.render('user/login');

        return;
    }

    try{
        const commentCreate = {            
            comment,
            UserId: user,
            MovieId: movieId
        }

        await Comment.create(commentCreate);
        req.flash('message', 'Comentário postado');
        req.session.save(() => {
            res.redirect(`/movie/${movieId}`);
        })
    }catch(error){
        req.flash('message', error);
    }
});

router.post('/remove', async(req, res) => {
    const commentId = req.body.commentId;    
    const user = req.session.userid;
    const comment = await Comment.findOne({where: {id: commentId}, include: User});

    if(!user){
        req.flash('message', 'Você precisa estar logado para excluir o comentário');
        res.render('user/login');
        return;
    }

    if(user !== comment.UserId){
        req.flash('message', 'Você não é o autor deste comentário');
        res.redirect('back');
        return;
    }

    try{
        await Comment.destroy({
            where: {
                id: commentId
            }
        })

        req.flash('message', 'Comentário removido com sucesso');
        res.redirect('back');
    }catch(error){
        req.flash('message', error);
    }
})

module.exports = router;