const express = require('express');
const users = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/login', (req, res) => {
    res.render('user/login');
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    //checa se o usuário está cadastrado
    const user = await users.findOne({where: {email: email}});

    if(!user){
        req.flash('message', 'Informe um e-mail válido para continuar');
        res.render('user/login');

        return;
    }

    if(email !== user.email){
        req.flash('message', 'Usuário não cadastrado');
        res.render('user/login');

        return;
    }   

    //confere se a senha bate
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if(!passwordMatch){
        req.flash('message', 'Senha inválida');
        res.render('user/login');

        return;
    }

    req.session.userid = user.id;
    req.flash('message', 'Login efetuado com sucesso');

    req.session.save(() => {
        res.redirect('/');
    })    
})

router.get('/logout', (req, res) => {
    req.flash('message', 'Saiu com sucesso');
    req.session.destroy();    
    res.redirect('/');
})

router.get('/registrar', (req, res) => {
    res.render('user/register');
});

router.post('/registrar', async (req, res) => {
    const {nome, email, password, confirmPassword} = req.body;

    if(password !== confirmPassword){
        req.flash('message', 'As senhas digitadas não conferem');
        res.render('user/register');
        return;
    }

    const checkUser = await users.findOne({where: {email: email}});

    if(checkUser){
        req.flash('message', 'Já existe um usuário cadastrado com este e-mail');
        res.render('user/register');
        return;
    }

    if(!nome){
        req.flash('message', 'Digite seu nome');
        res.render('user/register');
        return;
    }

    //criptografa a senha
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const user = {nome, email, password: hashPassword};

    try {
        const userCreate = await users.create(user);

        //iniciando a sessão
        req.session.userid = userCreate.id;
        
        req.flash(('message', 'Cadastro realizado com sucesso'));
        req.session.save(() => {
            res.redirect('/')
        });
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;