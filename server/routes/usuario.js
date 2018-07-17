const express = require('express');
const Usuario = require('../models/usuario')
const app = express();

const bcrypt = require('bcrypt');
const _ = require('underscore');




app.get('/usuario', (req, res) => {

    let desde = req.query.desde || 0
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario
    .find({ estado: true}, 'nombre email role estado google img')
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        Usuario.count({ estado: true }, (err, conteo) => {
            res.json({
                ok: true,
                usuarios,
                total: conteo
            });
        })

        

    })
});

app.post('/usuario', (req, res) => {

    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        // para no usar mostrar la contraseña, usar undefined para que no aparesca en la respuesta
        // password: null,
        usuarioDB.password = undefined;

        res.json({
            ok: true,
            usuario: usuarioDB
        })


    });

});

app.put('/usuario/:id', (req, res) => {

    let id = req.params.id;
    let body = _.pick( req.body, ['nombre', 'email', 'img', 'role', 'estado']);



    Usuario.findByIdAndUpdate( id, body, {new: true, runValidators: true}, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });            
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })

    });

});

app.delete('/usuario/:id', (req, res) => {
    let id = req.params.id;
    /* Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => { */

    let cambia_estado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambia_estado, {new: true}, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });            
        };

        if ( !usuarioBorrado ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            }); 
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });








});



module.exports = app