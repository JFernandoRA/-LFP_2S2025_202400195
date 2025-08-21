const readline = require('readline');
const CallCenter = require('./CallCenter');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const callCenter = new CallCenter();
let datosCargados = false;

function mostrarMenu() {
    console.log("\n=== SIMULADOR DE CALLCENTER ===");
    console.log("1. Cargar Registros de Llamadas");
    console.log("2. Exportar Historial de Llamadas");
    console.log("3. Exportar Listado de Operadores");
    console.log("4. Exportar Listado de Clientes");
    console.log("5. Exportar Rendimiento de Operadores");
    console.log("6. Mostrar Porcentaje de Clasificación de Llamadas");
    console.log("7. Mostrar Cantidad de Llamadas por Calificación");
    console.log("8. Salir");
}

function leerOpcion() {
    rl.question("\nSeleccione una opción: ", (opcion) => {
        switch (opcion.trim()) {
            case '1':
                rl.question("Ingrese la ruta del archivo CSV (ej: data/Archivo1.csv): ", (ruta) => {
                    ruta = ruta.trim();
                    if (!ruta) {
                        console.log("Ruta no válida.");
                        leerOpcion();
                        return;
                    }
                    callCenter.cargarLlamadas(ruta);
                    datosCargados = callCenter.llamadas.length > 0;
                    leerOpcion();
                });
                break;

            case '2':
                if (datosCargados) callCenter.exportarHistorial();
                else console.log("Primero cargue los datos.");
                leerOpcion();
                break;

            case '3':
                if (datosCargados) callCenter.exportarOperadores();
                else console.log("Primero cargue los datos.");
                leerOpcion();
                break;

            case '4':
                if (datosCargados) callCenter.exportarClientes();
                else console.log("Primero cargue los datos.");
                leerOpcion();
                break;

            case '5':
                if (datosCargados) callCenter.exportarRendimiento();
                else console.log("Primero cargue los datos.");
                leerOpcion();
                break;

            case '6':
                if (datosCargados) callCenter.mostrarPorcentajeClasificacion();
                else console.log("Primero cargue los datos.");
                leerOpcion();
                break;

            case '7':
                if (datosCargados) callCenter.mostrarCantidadPorEstrellas();
                else console.log("Primero cargue los datos.");
                leerOpcion();
                break;

            case '8':
                console.log("¡Hasta luego!");
                rl.close();
                break;

            default:
                console.log("Opción no válida.");
                leerOpcion();
        }
    });
}

mostrarMenu();
leerOpcion();