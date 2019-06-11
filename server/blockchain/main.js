const { Blockchain, Transaction } = require('./blockchain');
const fs = require('fs');
// Create new instance of Blockchain class
const savjeeCoin = new Blockchain();

savjeeCoin.leerArchivo();


if(savjeeCoin.compararUsuario("Felix1")) {
    console.log("Existe");
}else{
    console.log("No existe");
}
console.log("Funciona");


 //Mine block
//savjeeCoin.minePendingTransactions('Felix', '123456789');

// Mine block
//savjeeCoin.minePendingTransactions('Ricardo', 'abcdefg');
//savjeeCoin.escribirArchivo();