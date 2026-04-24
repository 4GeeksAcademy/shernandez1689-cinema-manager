type Sala = number[][];

interface ConteoAsientos {
  ocupados: number;
  disponibles: number;
}

interface ParContiguo {
  fila: number;
  columna1: number;
  columna2: number;
}

interface EscenariosUI {
  vacia: Sala;
  parcial: Sala;
  casiLlena: Sala;
  llena: Sala;
}

// Crea una sala con el tamano indicado usando 0 (libre) en todos los asientos.
function inicializarSala(filas = 8, columnas = 10): Sala {
  const sala: Sala = [];

  for (let i = 0; i < filas; i++) {
    const fila: number[] = [];
    for (let j = 0; j < columnas; j++) {
      fila.push(0);
    }
    sala.push(fila);
  }

  return sala;
}

// Devuelve una representacion de texto de la sala usando X para ocupado y L para libre.
function mostrarSala(sala: Sala): string {
  if (sala.length === 0 || sala[0].length === 0) {
    return "Sala vacia.";
  }

  const columnas = sala[0].length;
  let encabezado = "    ";
  for (let i = 0; i < columnas; i++) {
    encabezado += `${String(i + 1).padStart(2, " ")}${i < columnas - 1 ? " " : ""}`;
  }

  let resultado = encabezado;
  for (let i = 0; i < sala.length; i++) {
    let lineaFila = `\nF${String(i + 1).padStart(2, "0")}: `;
    for (let j = 0; j < sala[i].length; j++) {
      lineaFila += sala[i][j] === 1 ? "X" : "L";
      if (j < sala[i].length - 1) {
        lineaFila += "  ";
      }
    }
    resultado += lineaFila;
  }

  return resultado;
}

// Intenta reservar un asiento en la posicion indicada y retorna un mensaje claro del resultado.
function reservarAsiento(sala: Sala, fila: number, columna: number): string {
  const filaIndex = fila - 1;
  const columnaIndex = columna - 1;

  if (
    filaIndex < 0 ||
    filaIndex >= sala.length ||
    columnaIndex < 0 ||
    columnaIndex >= sala[0].length
  ) {
    return `Error: el asiento F${fila} C${columna} no existe.`;
  }

  if (sala[filaIndex][columnaIndex] === 1) {
    return `No disponible: el asiento F${fila} C${columna} ya esta ocupado.`;
  }

  sala[filaIndex][columnaIndex] = 1;
  return `Reserva exitosa en F${fila} C${columna}.`;
}

// Recorre toda la sala y devuelve cuantas butacas estan ocupadas y disponibles.
function contarAsientos(sala: Sala): ConteoAsientos {
  let ocupados = 0;
  let disponibles = 0;

  for (const fila of sala) {
    for (const asiento of fila) {
      if (asiento === 1) ocupados++;
      else disponibles++;
    }
  }

  return { ocupados, disponibles };
}

// Busca el primer par horizontal de asientos libres dentro de la misma fila.
function buscarDosContiguos(sala: Sala): ParContiguo | null {
  for (let i = 0; i < sala.length; i++) {
    for (let j = 0; j < sala[i].length - 1; j++) {
      if (sala[i][j] === 0 && sala[i][j + 1] === 0) {
        return {
          fila: i + 1,
          columna1: j + 1,
          columna2: j + 2,
        };
      }
    }
  }

  return null;
}

// Convierte el resultado de la busqueda de contiguos en un mensaje legible.
function describirContiguos(sala: Sala): string {
  const par = buscarDosContiguos(sala);

  if (!par) {
    return "No hay asientos contiguos disponibles.";
  }

  return `Primer par contiguo libre: F${par.fila} C${par.columna1} y C${par.columna2}.`;
}

// Duplica una sala para crear escenarios sin modificar la matriz original.
function clonarSala(sala: Sala): Sala {
  const clon: Sala = [];

  for (let i = 0; i < sala.length; i++) {
    const filaClon: number[] = [];
    for (let j = 0; j < sala[i].length; j++) {
      filaClon.push(sala[i][j]);
    }
    clon.push(filaClon);
  }

  return clon;
}

// Ocupa asientos a partir de una lista de coordenadas [fila, columna].
function ocuparAsientos(sala: Sala, asientos: [number, number][]): void {
  for (const [fila, columna] of asientos) {
    const filaIndex = fila - 1;
    const columnaIndex = columna - 1;
    if (filaIndex >= 0 && filaIndex < sala.length && columnaIndex >= 0 && columnaIndex < sala[0].length) {
      sala[filaIndex][columnaIndex] = 1;
    }
  }
}

// Construye un bloque de salida para un escenario: mapa, conteo y contiguos.
function resumenEscenario(nombre: string, sala: Sala): string {
  const conteo = contarAsientos(sala);
  let resultado = `=== ${nombre} ===\n`;
  resultado += `${mostrarSala(sala)}\n`;
  resultado += `${describirContiguos(sala)}\n`;
  resultado += `Ocupados: ${conteo.ocupados} | Disponibles: ${conteo.disponibles}`;
  return resultado;
}

// Dibuja una interfaz web con selector de escenario y reserva por clic.
function inicializarInterfazWeb(escenarios: EscenariosUI): void {
  if (typeof document === "undefined") {
    return;
  }

  const mapa = document.querySelector<HTMLDivElement>("#seat-map");
  const mensaje = document.querySelector<HTMLParagraphElement>("#ui-message");
  const estadisticas = document.querySelector<HTMLParagraphElement>("#ui-stats");
  const selectorEscenario = document.querySelector<HTMLSelectElement>("#scenario-select");
  const botonReset = document.querySelector<HTMLButtonElement>("#btn-reset");
  const botonPar = document.querySelector<HTMLButtonElement>("#btn-reserve-pair");

  if (!mapa || !mensaje || !estadisticas || !selectorEscenario || !botonReset || !botonPar) {
    return;
  }

  let salaActual = clonarSala(escenarios[selectorEscenario.value as keyof EscenariosUI]);

  const actualizarEstadisticas = () => {
    const par = buscarDosContiguos(salaActual);
    const conteo = contarAsientos(salaActual);
    estadisticas.textContent = par
      ? `Ocupados: ${conteo.ocupados}, Disponibles: ${conteo.disponibles}. Siguiente par contiguo: F${par.fila} C${par.columna1}-C${par.columna2}.`
      : `Ocupados: ${conteo.ocupados}, Disponibles: ${conteo.disponibles}. No hay asientos contiguos disponibles.`;
  };

  const actualizarVista = () => {
    mapa.innerHTML = "";
    const columnas = salaActual[0].length;

    for (let i = 0; i < salaActual.length; i++) {
      for (let j = 0; j < columnas; j++) {
        const ocupado = salaActual[i][j] === 1;
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = `${i + 1}-${j + 1}`;
        boton.className = ocupado
          ? "rounded-md px-2 py-2 text-xs font-semibold text-white bg-slate-800 cursor-not-allowed"
          : "rounded-md px-2 py-2 text-xs font-semibold text-slate-800 bg-emerald-200 hover:bg-emerald-300";
        boton.disabled = ocupado;

        boton.addEventListener("click", () => {
          const resultado = reservarAsiento(salaActual, i + 1, j + 1);
          mensaje.textContent = resultado;
          actualizarEstadisticas();
          actualizarVista();
        });

        mapa.appendChild(boton);
      }
    }
  };

  const cargarEscenario = (clave: keyof EscenariosUI) => {
    salaActual = clonarSala(escenarios[clave]);
    mensaje.textContent = `Escenario cargado: ${selectorEscenario.options[selectorEscenario.selectedIndex]?.text}.`;
    actualizarEstadisticas();
    actualizarVista();
  };

  selectorEscenario.addEventListener("change", () => {
    cargarEscenario(selectorEscenario.value as keyof EscenariosUI);
  });

  botonReset.addEventListener("click", () => {
    cargarEscenario(selectorEscenario.value as keyof EscenariosUI);
    mensaje.textContent = "Sala reiniciada al estado original del escenario actual.";
  });

  botonPar.addEventListener("click", () => {
    const par = buscarDosContiguos(salaActual);

    if (!par) {
      mensaje.textContent = "No se pudo reservar el par: no hay asientos contiguos disponibles.";
      actualizarEstadisticas();
      return;
    }

    const resultado1 = reservarAsiento(salaActual, par.fila, par.columna1);
    const resultado2 = reservarAsiento(salaActual, par.fila, par.columna2);
    mensaje.textContent = `Reserva doble realizada. ${resultado1} ${resultado2}`;
    actualizarEstadisticas();
    actualizarVista();
  });

  mensaje.textContent = "Haz clic en un asiento libre para reservarlo o usa los botones de accion.";
  actualizarEstadisticas();
  actualizarVista();
}

const salida: string[] = [];

// Escenario 1: sala vacia (todos disponibles)
const salaVacia = inicializarSala(8, 10);
salida.push("=== Escenario 1: Sala vacia ===");
salida.push(mostrarSala(salaVacia));
salida.push(describirContiguos(salaVacia));

const conteoInicial = contarAsientos(salaVacia);
salida.push(`Ocupados: ${conteoInicial.ocupados} | Disponibles: ${conteoInicial.disponibles}`);

// Escenario 2: reservas y validaciones
const salaReservas = clonarSala(salaVacia);
salida.push("\n=== Escenario 2: Reservas y validaciones ===");
salida.push(reservarAsiento(salaReservas, 1, 1));
salida.push(reservarAsiento(salaReservas, 1, 2));
salida.push(reservarAsiento(salaReservas, 1, 2));
salida.push(reservarAsiento(salaReservas, 9, 3));
salida.push(mostrarSala(salaReservas));
salida.push(describirContiguos(salaReservas));
const conteoReservas = contarAsientos(salaReservas);
salida.push(`Ocupados: ${conteoReservas.ocupados} | Disponibles: ${conteoReservas.disponibles}`);

// Escenario 3: sala parcialmente ocupada
const salaParcial = inicializarSala(8, 10);
ocuparAsientos(salaParcial, [
  [1, 1],
  [1, 2],
  [2, 5],
  [3, 7],
  [4, 3],
  [5, 9],
  [7, 4],
  [8, 10],
]);
salida.push("\n" + resumenEscenario("Escenario 3: Sala parcialmente ocupada", salaParcial));

// Escenario 4: sala casi llena, solo asientos sueltos libres (sin contiguos)
const salaCasiLlena = inicializarSala(8, 10);
for (let i = 0; i < salaCasiLlena.length; i++) {
  for (let j = 0; j < salaCasiLlena[i].length; j++) {
    salaCasiLlena[i][j] = 1;
  }
}
for (let i = 0; i < salaCasiLlena.length; i++) {
  const columnaLibre = i % 2 === 0 ? 2 : 7;
  salaCasiLlena[i][columnaLibre] = 0;
}
salida.push("\n" + resumenEscenario("Escenario 4: Sala casi llena con asientos sueltos", salaCasiLlena));

// Escenario 5: sala completamente llena
const salaLlena = inicializarSala(8, 10);
for (let i = 0; i < salaLlena.length; i++) {
  for (let j = 0; j < salaLlena[i].length; j++) {
    salaLlena[i][j] = 1;
  }
}
salida.push("\n" + resumenEscenario("Escenario 5: Sala completamente llena", salaLlena));
salida.push(reservarAsiento(salaLlena, 4, 4));

const resumen = salida.join("\n");

if (typeof document !== "undefined") {
  import("./style.css").then(() => {
    const app = document.querySelector<HTMLPreElement>("#app");
    if (app) {
      app.style.whiteSpace = "pre";
      app.textContent = resumen;
    }

    // La interfaz web permite elegir escenario y operar reservas interactivas.
    inicializarInterfazWeb({
      vacia: salaVacia,
      parcial: salaParcial,
      casiLlena: salaCasiLlena,
      llena: salaLlena,
    });
  });
}

console.log(resumen);

export {};
