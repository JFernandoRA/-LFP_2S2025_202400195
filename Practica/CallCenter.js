const fs = require('fs');
const Llamada = require('./Llamada');

class CallCenter {
    constructor() {
        this.llamadas = [];
        this.operadores = new Map(); 
        this.clientes = new Map();   
    }

    cargarLlamadas(ruta) {
        try {
            const data = fs.readFileSync(ruta, 'utf8');
            const lineas = data.trim().split('\n');

            if (lineas.length < 2) {
                console.log("El archivo está vacío o no tiene datos.");
                return;
            }

            this.llamadas = [];
            this.operadores.clear();
            this.clientes.clear();

            for (let i = 1; i < lineas.length; i++) {
                const linea = lineas[i].trim();
                if (!linea) continue;

                const partes = linea.split(',');
                if (partes.length !== 5) {
                    console.warn("Formato incorrecto (no 5 columnas):", linea);
                    continue;
                }

                const [idOp, nomOp, estrellas, idCli, nomCli] = partes.map(p => p.trim());

                if (!idOp || !nomOp || !estrellas || !idCli || !nomCli) {
                    console.warn("Datos incompletos:", linea);
                    continue;
                }

                const llamada = new Llamada(idOp, nomOp, estrellas, idCli, nomCli);
                this.llamadas.push(llamada);

                if (!this.operadores.has(idOp)) {
                    this.operadores.set(idOp, llamada.operador);
                }
                if (!this.clientes.has(idCli)) {
                    this.clientes.set(idCli, llamada.cliente);
                }
            }

            console.log(`${this.llamadas.length} llamadas cargadas desde ${ruta}`);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.error("Archivo no encontrado. Verifique la ruta.");
            } else if (err.code === 'EISDIR') {
                console.error("La ruta es una carpeta, no un archivo.");
            } else {
                console.error("Error al leer el archivo:", err.message);
            }
        }
    }

    exportarHistorial(ruta = 'reportes/historial.html') {
        let html = this.crearEncabezadoHTML("Historial de Llamadas");
        html += `
        <h2>Historial de Llamadas</h2>
        <table border="1" cellpadding="8" cellspacing="0">
            <tr>
                <th>ID Operador</th>
                <th>Nombre Operador</th>
                <th>Estrellas</th>
                <th>ID Cliente</th>
                <th>Nombre Cliente</th>
                <th>Clasificación</th>
            </tr>`;

        this.llamadas.forEach(l => {
            const estrellasVisuales = '★'.repeat(l.estrellas) + '☆'.repeat(5 - l.estrellas);
            html += `
            <tr>
                <td>${l.operador.id}</td>
                <td>${l.operador.nombre}</td>
                <td>${estrellasVisuales}</td>
                <td>${l.cliente.id}</td>
                <td>${l.cliente.nombre}</td>
                <td>${l.clasificacion()}</td>
            </tr>`;
        });

        html += `</table></body></html>`;
        fs.writeFileSync(ruta, html);
        console.log(`Historial exportado a ${ruta}`);
    }

    exportarOperadores(ruta = 'reportes/operadores.html') {
        let html = this.crearEncabezadoHTML("Listado de Operadores");
        html += `<h2>Operadores</h2><table border="1" cellpadding="8"><tr><th>ID</th><th>Nombre</th></tr>`;
        for (let op of this.operadores.values()) {
            html += `<tr><td>${op.id}</td><td>${op.nombre}</td></tr>`;
        }
        html += `</table></body></html>`;
        fs.writeFileSync(ruta, html);
        console.log(`Operadores exportados a ${ruta}`);
    }

    exportarClientes(ruta = 'reportes/clientes.html') {
        let html = this.crearEncabezadoHTML("Listado de Clientes");
        html += `<h2>Clientes</h2><table border="1" cellpadding="8"><tr><th>ID</th><th>Nombre</th></tr>`;
        for (let cli of this.clientes.values()) {
            html += `<tr><td>${cli.id}</td><td>${cli.nombre}</td></tr>`;
        }
        html += `</table></body></html>`;
        fs.writeFileSync(ruta, html);
        console.log(`Clientes exportados a ${ruta}`);
    }

    exportarRendimiento(ruta = 'reportes/rendimiento.html') {
        const total = this.llamadas.length;
        const llamadasPorOp = new Map();
        this.llamadas.forEach(l => {
            llamadasPorOp.set(l.operador.id, (llamadasPorOp.get(l.operador.id) || 0) + 1);
        });

        let html = this.crearEncabezadoHTML("Rendimiento de Operadores");
        html += `<h2>Rendimiento de Operadores</h2>
                 <table border="1" cellpadding="8">
                 <tr><th>ID</th><th>Nombre</th><th>Porcentaje de Atención</th></tr>`;

        for (let [id, op] of this.operadores) {
            const atendidas = llamadasPorOp.get(id) || 0;
            const porcentaje = total > 0 ? ((atendidas / total) * 100).toFixed(2) : 0;
            html += `<tr><td>${op.id}</td><td>${op.nombre}</td><td>${porcentaje}%</td></tr>`;
        }

        html += `</table></body></html>`;
        fs.writeFileSync(ruta, html);
        console.log(`Rendimiento exportado a ${ruta}`);
    }

    mostrarPorcentajeClasificacion() {
        const cont = { Buena: 0, Media: 0, Mala: 0 };
        this.llamadas.forEach(l => cont[l.clasificacion()]++);
        const total = this.llamadas.length;

        console.log("\nPorcentaje de Clasificación de Llamadas:");
        for (let tipo of Object.keys(cont)) {
            const porcentaje = total > 0 ? ((cont[tipo] / total) * 100).toFixed(2) : 0;
            console.log(`   ${tipo}: ${porcentaje}% (${cont[tipo]} llamadas)`);
        }
    }

    mostrarCantidadPorEstrellas() {
        const estrellas = [0, 0, 0, 0, 0];
        this.llamadas.forEach(l => {
            if (l.estrellas >= 1 && l.estrellas <= 5) {
                estrellas[l.estrellas - 1]++;
            }
        });

        console.log("\nCantidad de Llamadas por Calificación:");
        for (let i = 0; i < 5; i++) {
            console.log(`   ${i+1} estrella${i+1 === 1 ? '' : 's'}: ${estrellas[i]} llamadas`);
        }
    }

    crearEncabezadoHTML(titulo) {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${titulo}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { text-align: left; padding: 10px; border: 1px solid #ccc; }
        th { background-color: #f2f2f2; }
        h2 { color: #333; }
    </style>
</head>
<body>`;
    }
}

module.exports = CallCenter;