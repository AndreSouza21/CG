const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


const canvasCoordinates =
    document.getElementById(
        "canvasCoordinates"
    );

const webglCoordinates =
    document.getElementById(
        "webglCoordinates"
    );

const colorBox =
    document.getElementById(
        "colorBox"
    );

const colorName =
    document.getElementById(
        "colorName"
    );


// --------------------------------------------------
// 1a. VERTICES
// --------------------------------------------------

let vertices = new Float32Array([0.0,0.0]);


// --------------------------------------------------
// 1b. CORES
// --------------------------------------------------

let colors = new Float32Array([0.0, 0.0, 1.0]);

// --------------------------------------------------
// 1c. TAMANHO DOS PONTOS
// --------------------------------------------------

let pointSizes = new Float32Array([10.0]);
let pointSizes_aux = 10.0;

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const colorsBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.DYNAMIC_DRAW
);

const pointSizesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    pointSizes,
    gl.DYNAMIC_DRAW
);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;
in float aPointSize;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aPointSize;
    vColor = aColor;
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getAttribLocation(
        program,
        "aColor"
    );

const pointSizeLocation =
    gl.getAttribLocation(
        program,
        "aPointSize"
    );

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.enableVertexAttribArray(colorLocation);

gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.enableVertexAttribArray(pointSizeLocation);

gl.vertexAttribPointer(
    pointSizeLocation,
    1,
    gl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 9. INTERAÇÃO COM O MOUSE
// --------------------------------------------------

let pontoInicial = null;

canvas.addEventListener("mousedown",mouseClick,false);
  
function mouseClick(event){

    // Posição do clique em pixels
    const x = event.offsetX;
    const y = event.offsetY;


    // Se for o ponto inicial
    if (pontoInicial === null) {

        pontoInicial = { x: x, y: y };

        canvasCoordinates.textContent =
            `Canvas: (${pontoInicial.x}, ${pontoInicial.y})`;
        //retorna não desenha só com 1 ponto
        return; 
    }

    const pontoFinal = { x: x, y: y };

    canvasCoordinates.textContent =
        `Canvas: (${pontoInicial.x}, ${pontoInicial.y}) , (${pontoFinal.x}, ${pontoFinal.y})`;

     // Definiação dos pixels da reta usando bresenham
    const pixelsDaReta = bresenham(
        pontoInicial.x,
        pontoInicial.y,
        pontoFinal.x,
        pontoFinal.y
    );

    const novosVertices = [];

    //Converter X e Y obtidos pelo bresenham para o intervalo [-1, 1]
    for (const p of pixelsDaReta) {

        const webglX = (p.x / canvas.width) * 2 - 1;
        const webglY = -((p.y / canvas.height) * 2 - 1);

        novosVertices.push(webglX, webglY);
    }

    // Atualizar o vetor de vértices
    vertices = new Float32Array(novosVertices);


    webglCoordinates.textContent =
        `WebGL: (${novosVertices[0].toFixed(3)}, ${novosVertices[1].toFixed(3)}) , 
        (${novosVertices[novosVertices.length - 2].toFixed(3)}, ${novosVertices[novosVertices.length - 1].toFixed(3)})`;


    // Atualizar o conteúdo do buffer na GPU
    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        verticesBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.DYNAMIC_DRAW
    );

    const numVertices = vertices.length / 2;
    const coresExpandidas = coresParaNVertices(colors, numVertices);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coresExpandidas, gl.DYNAMIC_DRAW);

    const tamanhosExpandidos = tamanhosParaNVertices(pointSizes_aux, numVertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tamanhosExpandidos, gl.DYNAMIC_DRAW);

    // Redesenhar a cena
    drawScene();

    pontoInicial = null;
}

// --------------------------------------------------
// 10. INTERAÇÃO COM O TECLADO
// --------------------------------------------------

document.addEventListener(
  "keydown",
  keyboardClick,
  false
);

function keyboardClick(event) {

  switch(event.key) {
      case "ArrowUp":
        pointSizes_aux += 5.0;
        pointSizes = new Float32Array([pointSizes_aux])
        break;
      case "ArrowDown":
        pointSizes_aux -= 5.0;
        if (pointSizes_aux < 1.0) {
          pointSizes_aux = 1.0;
        }
        pointSizes = new Float32Array([pointSizes_aux])
        break;
      case "0":
          colors = new Float32Array([
              1.0, 1.0, 1.0
          ]);
          colorBox.style.backgroundColor = "white";
          break;

      case "1":
          colors = new Float32Array([
              1.0, 0.0, 0.0
          ]);
          colorBox.style.backgroundColor = "red";
          break;

      case "2":
          colors = new Float32Array([
              0.0, 1.0, 0.0
          ]);
          colorBox.style.backgroundColor = "green";
          break;

      case "3":
          colors = new Float32Array([
              0.0, 0.0, 1.0
          ]);
          colorBox.style.backgroundColor = "blue";
          break;

      case "4":
          colors = new Float32Array([
              1.0, 1.0, 0.0
          ]);
          colorBox.style.backgroundColor = "yellow";
          break;

      case "5":
          colors = new Float32Array([
              1.0, 0.0, 1.0
          ]);
          colorBox.style.backgroundColor = "magenta";
          break;

      case "6":
          colors = new Float32Array([
              0.0, 1.0, 1.0
          ]);
          colorBox.style.backgroundColor = "cyan";
          break;

      case "7":
          colors = new Float32Array([
              1.0, 0.5, 0.0
          ]);
          colorBox.style.backgroundColor = "orange";
          break;

      case "8":
          colors = new Float32Array([
              0.5, 0.0, 1.0
          ]);
          colorBox.style.backgroundColor = "purple";
          break;

      case "9":
          colors = new Float32Array([
              1.0, 0.4, 0.7
          ]);
          colorBox.style.backgroundColor = "pink";
          break;

      default:
          return;
  }

  // Atualizar o buffer de cores
  const numVertices = vertices.length / 2;
  const coresExpandidas = coresParaNVertices(colors, numVertices);

  gl.bindBuffer(
      gl.ARRAY_BUFFER,
      colorsBuffer
  );

  gl.bufferData(
      gl.ARRAY_BUFFER,
      coresExpandidas,
      gl.DYNAMIC_DRAW
  );

  // Atualizar o buffer de tamanhos dos pontos
  const tamanhosExpandidos = tamanhosParaNVertices(pointSizes_aux, numVertices);

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    pointSizesBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    tamanhosExpandidos,
    gl.DYNAMIC_DRAW
  );

  // Redesenhar
  drawScene();
}

// --------------------------------------------------
// 11. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 12. DESENHAR
// --------------------------------------------------

const numComponents = 2;

gl.useProgram(program);

function drawScene(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.drawArrays(
        gl.POINTS,
        0,
        vertices.length / numComponents
    );
}

drawScene();


// --------------------------------------------------
// 13. FUNÇÕES AUXILIARES
// --------------------------------------------------

function bresenham(x0, y0, x1, y1) {
    // Garante apenas inteiros 
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    const pontos = [];

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);

    // Direção do passo em cada eixo: +1 ou -1
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;

    // Erro acumulado inicial
    let erro = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
        pontos.push({ x: x, y: y });

        if (x === x1 && y === y1) {
            break;
        }

        const e2 = 2 * erro;

        // Decide se anda no X
        if (e2 > -dy) {
            erro -= dy;
            x += sx;
        }

        // Decide se anda no Y
        if (e2 < dx) {
            erro += dx;
            y += sy;
        }
    }

    return pontos;
}



function coresParaNVertices(corRGB, n) {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
        arr[i * 3 + 0] = corRGB[0];
        arr[i * 3 + 1] = corRGB[1];
        arr[i * 3 + 2] = corRGB[2];
    }
    return arr;
}

function tamanhosParaNVertices(tamanho, n) {
    const arr = new Float32Array(n);
    arr.fill(tamanho);
    return arr;
}