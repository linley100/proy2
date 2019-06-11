const express = require('express');
const app = express();
// may need to change config to config.prod later on
const config = require('../webpack.config');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const mediaserver = require('mediaserver')

// hands this compiler off to the middleware for hot reloading
const compiler = webpack(config);

const fs = require('fs');
const path = require('path')

app.use(webpackDevMiddleware(compiler, {
	noInfo: true,
	// public path simulates publicPath of config file
	publicPath: config.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

app.use(express.static('./dist'));

const PORT = process.env.port || 3000;
const server = app.listen(PORT);
const io = require('socket.io').listen(server);
const { Blockchain } = require('./blockchain/blockchain');
const dirsize = 52 //En LABAM, este valor es 55

var messages = [];

var text = {text: ''}
var txtFinal = ''
var extens = []
var results = []

var _getAllFilesFromFolder = function(dir) {

    fs.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });
    
    var i, j
    var arch = new String()

    for(j = 0; j < results.length; j++){
        for(i = dirsize; i < results[j].length; i++){
            arch += results[j][i]
        }
        arch += '<br><br>'
    }

    extens = getTypes(arch)
    console.log(extens)
    asignartxt(results, extens)
    return arch;
};

function getTypes(archives){
    var exten = []
    for(var i = 0; i < archives.length; i++){
        if (archives[i] == '.' ){
            exten[i] = archives[i+1] + archives[i+2] + archives[i+3] 
            i +=8
        }  
    };
    exten = exten.filter(function(el){
        return el != null
    });
    return exten
}

function asignartxt(array, exten){
    var newA = []
    newA = array
    for(var i = 0; i < exten.length; i++){
        if(exten[i] == 'txt'){
            txtFinal = newA[i]
        }

    };
}

var result = _getAllFilesFromFolder(__dirname + "/archivos")

io.on('connection', function(socket) {
	let obj = fs.readFileSync('chatG.json', 'utf-8');
	messages = JSON.parse(obj);

	console.log('Alguien se ha conectado con Sockets');

	socket.on('new-message', function(data) {
		messages.push(data);

		fs.writeFile('chatG.json', JSON.stringify(messages,null,' '), function (err) {
			if (err) throw err;
		});

		io.sockets.emit('messages', messages);
		});
		
	socket.on('blockchain', function(data) {
		let chain = new Blockchain();
		let bool = new Boolean();
		if( (chain.compararUsuario(data.usuario)) && (chain.compararContraseña(data.contra))) {	
			bool = true;
			socket.emit('inicio', bool);
		}else{
			bool = false;
			socket.emit('inicio', bool);
		}	
	});

	socket.on('registrar', function(data) {
		let chain = new Blockchain();
		let bool = new Boolean();
		if( chain.compararUsuario(data.usuario) ) {	
			bool = true;
			socket.emit('registro', bool);
			console.log("Existe");
		}else{
			chain.minePendingTransactions(data.usuario, data.contra);

			chain.escribirArchivo();

			bool = false;
			socket.emit('registro', bool);
			console.log("No existe");
		}	
	});
    socket.emit('newUser', text);
	socket.on('text', data => {
        text.text = data.text
        io.sockets.emit('text', data);
        fs.writeFile(txtFinal, text.text, 'utf8', (err)=>{
            if(err) throw err;
            console.log('Archivo modificado por:'+ socket.id)
        })
    });

	socket.on('carpetas', data => {
        socket.emit('folders', result, extens, results);
        io.sockets.emit('messages', messages);
    });

});

app.get('/archivos/:nombre', (req, res)=>{
    var cancion = path.join(__dirname,'/archivos/', req.params.nombre)
    mediaserver.pipe(req, res,cancion)
});

console.log("Polling server is running at 'http://localhost:3000'");
