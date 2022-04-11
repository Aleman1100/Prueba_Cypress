// 1. Crear una API REST con el Framework Express (2 Puntos)
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const fs = require('fs')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const exphbs = require("express-handlebars");
// 3. Ofrecer la funcionalidad Upload File con express-fileupload (1 Punto)
const expressFileUpload = require('express-fileupload');
app.use( expressFileUpload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: "Peso del archivo es mayor a lo permitido",
    })
);

app.listen(3000, () => console.log('UP en 3000'))

// 2. Servir contenido dinámico con express-handlebars (1 Punto)
app.use(express.static("assets"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.set('view engine', 'handlebars');
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
    'handlebars',
    exphbs.engine ({
        layoutsDir: __dirname + '/views',
        partialsDir: __dirname + '/views/componentes/',
    })
);

app.get('/', (req,res) => {
    res.render('index', {
        layout: 'index'
    });
});

app.get('/Registro', (req,res) => {
    res.render('registro', {
        layout: 'registro'
    });
});

app.get('/Login', (req,res) => {
    res.render('login', {
        layout: 'login'
    });
});

app.get('/Admin', (req,res) => {
    res.render('admin', {
        layout: 'admin'
    });
});

// Exportar funciones para las rutas
const { nuevoSkater,getSkater,editSkater,deleteSkater,validarSkater } = require('./consultas.js');

// Inicio validacion login
// 4. Implementar seguridad y restricción de recursos o contenido con JWT (2 Puntos)
const secretKey = 'The900°'

app.get('/token', (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, data) => {
        res.send( err ? 'Token invalido' : data );
    });
});

app.get('/SignIn', async (req, res) => {
    const { email, password } = req.query;
    const respuesta = await getSkater()
    const user = respuesta.find((u) => u.email == email && u.password == password);
    if (user) {
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: user,
            },
            secretKey
        );
        res.send(`
        <META HTTP-EQUIV="REFRESH" CONTENT="1;URL=http://localhost:3000/Datos?token=${token}">
        Skater ${email}.
        <script>
        sessionStorage.setItem('token', JSON.stringify('${token}'))
        </script>
        `);
    } else {
        res.send('Usuario o contraseña incorrecta');
    }
});

app.get('/Datos', (req,res) => {
    let { token } = req.query;
    jwt.verify(token, secretKey, (err,decoded) => {
        err
            ? res.status(401).send({
                error: '401 No autorizado',
                message: err.message,
            })
            :
            res.render('datos', {
                layout: 'datos',
                token:token,
                email: decoded.data.email,
                nombre: decoded.data.nombre,
                password: decoded.data.password,
                experiencia: decoded.data.anos_experiencia,
                especialidad: decoded.data.especialidad,
                
            });
    });
});
// Fin validacion login

// Inicio rutas para cada vista
let data = JSON.parse(fs.readFileSync('skaters.json', 'utf8'))

app.post('/skater', async (req, res) => {
    const email = req.body.email
    const nombre = req.body.nombre
    const pass1 = req.body.password1
    const pass2 = req.body.password2
    const exp = req.body.experiencia
    const esp = req.body.especialidad
    if (pass1 == pass2){
        const pass = pass1
        const { foto_skater } = req.files;
        const img = `foto-${email}`;
        foto_skater.mv(`${__dirname}/assets/img/${img}.jpg`, (err) => {
            console.log('Imagen agregada correctamente')
        })
        const respuesta = await nuevoSkater(email,nombre,pass,exp,esp,img)
        const respuesta2 = await getSkater();
        fs.writeFileSync('skaters.json', JSON.stringify(respuesta2))
        res.render('registro', {
            layout: 'registro',
        });
        console.log(respuesta[0])
        console.log("Registro exitoso")
    } else {
        console.log('Contraseñas no coinciden')
    }
});

app.get('/skaters', async (req,res) => {
    const respuesta = await getSkater();
    res.send(respuesta);
    fs.writeFileSync('skaters.json', JSON.stringify(respuesta))
})

app.post('/skaterEdit', async (req,res) => {
    const email = req.body.correo
    const nombre = req.body.name
    const pass1 = req.body.pass1
    const pass2 = req.body.pass2
    const exp = req.body.exp
    const esp = req.body.esp
    if (pass1 == pass2){
        const pass = pass1
        const respuesta = await editSkater(email,nombre,pass,exp,esp)
        console.log(respuesta)
        console.log('Usuario editado correctamente')
        const respuesta2 = await getSkater();
        fs.writeFileSync('skaters.json', JSON.stringify(respuesta2))
        res.render('login', {
            layout: 'login',
        });
    } else {
        console.log('Contraseñas no coinciden')
    }

})

app.put('/skater', async (req, res) => {
    const { email, estado } = req.body;
    const respuesta = await validarSkater(email, estado);
    const respuesta2 = await getSkater();
    console.log(respuesta2)
    console.log(respuesta[0])
    console.log('usuario validado')
    fs.writeFileSync('skaters.json', JSON.stringify(respuesta2))
    res.send(console.log('Archivo actualizado'))
});


app.delete('/skater/:email', async (req, res) => {
    const { email } = req.params;
    const respuestaLogin = await getSkater()
    const user = respuestaLogin.find((u) => u.email == email);
    if (user) {
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 15,
                data: user,
            },
            secretKey
        );
    const respuestaDelete = await deleteSkater(email)
    console.log(respuestaDelete)
    const respuestaRefresh = await getSkater();
    fs.writeFileSync('skaters.json', JSON.stringify(respuestaRefresh))
    fs.unlink(`${__dirname}/assets/img/foto-${email}.jpg`, (err) => {
        console.log(`Imagen de ${email} eliminada`);
    });
    };
    console.log(`Skater ${email} eliminado del JSON`)
});

// Fin rutas para cada vista