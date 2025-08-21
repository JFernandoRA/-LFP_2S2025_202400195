const Operador = require('./Operador');
const Cliente = require('./Cliente');

class Llamada {
    constructor(idOperador, nombreOperador, estrellasStr, idCliente, nombreCliente) {
        this.operador = new Operador(idOperador, nombreOperador);
        this.cliente = new Cliente(idCliente, nombreCliente);
        this.estrellas = estrellasStr.split(';').filter(e => e.trim() === 'x').length;
    }

    clasificacion() {
        if (this.estrellas >= 4) return "Buena";
        if (this.estrellas >= 2) return "Media";
        return "Mala";
    }
}

module.exports = Llamada;