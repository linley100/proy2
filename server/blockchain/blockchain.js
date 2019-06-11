const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const fs = require('fs');

class Block {
  /**
   * @param {number} timestamp
   * @param {string} usuario
   * @param {string} contraseña
   * @param {string} previousHash
   */
  constructor(timestamp, usuario, contraseña, previousHash = '') {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.usuario = usuario;
    this.contraseña = contraseña;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + this.usuario + this.contraseña + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }

  getBlock() {
    return this;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
  }

  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block(new Date().toISOString(), ' ', ' ', '0');
  }

  /**
   * Returns the latest block on our chain. Useful when you want to create a
   * new Block and you need the hash of the previous Block.
   *
   * @returns {Block[]}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Takes all the pending transactions, puts them in a Block and starts the
   * mining process. It also adds a transaction to send the mining reward to
   * the given address.
   *
   * @param {string} miningRewardAddress
   */
  minePendingTransactions(usuario, contraseña) {
    let block = new Block(new Date().toISOString(), usuario, contraseña, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them.
   *
   * @returns {boolean}
   */
  isChainValid() {
    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    // Check the remaining blocks on the chain to see if there hashes and
    // signatures are correct
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }

  leerArchivo() {
    let obj = fs.readFileSync('blockchain.json', 'utf-8');
    this.chain = JSON.parse(obj);
  }

  escribirArchivo() {
    fs.writeFile('blockchain.json', JSON.stringify(this.chain,null,' '), function (err) {
      if (err) throw err;
    });
  }

  compararUsuario(user) {
    this.leerArchivo();

    for (let i = 1; i < this.chain.length; i++) {
      	var currentBlock = this.chain[i];

      	if (!currentBlock.usuario.localeCompare(user)) {
          return true;
    	}

    }

    return false;

  }

  compararContraseña(contra) {
    this.leerArchivo();

    for (let i = 1; i < this.chain.length; i++) {
      	var currentBlock = this.chain[i];

      	if (!currentBlock.contraseña.localeCompare(contra)) {
          return true;
    	}

    }

    return false;

  }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
