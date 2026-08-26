const canvas_T1 = document.getElementById("glCanvasCarro");
const gl_T1 = canvas_T1.getContext("webgl2");

if (!gl_T1) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource_T1 = `#version 300 es

in vec2 aPosition;
in vec3 aColors;

out vec3 vColors;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColors = aColors;
}

`;


// --------------------------------------------------
// 2. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource_T1 = `#version 300 es

precision mediump float;

in vec3 vColors;

out vec4 outColor;

void main() {
    outColor = vec4(vColors, 1.0);
}

`;


// --------------------------------------------------
// 3. COMPILAR SHADERS
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


const vertexShader_T1 = createShader(
    gl_T1,
    gl_T1.VERTEX_SHADER,
    vertexShaderSource_T1
);

const fragmentShader_T1 = createShader(
    gl_T1,
    gl_T1.FRAGMENT_SHADER,
    fragmentShaderSource_T1
);


// --------------------------------------------------
// 4. CRIAR PROGRAMA
// --------------------------------------------------

const program_T1 = gl_T1.createProgram();

gl_T1.attachShader(program_T1, vertexShader_T1);
gl_T1.attachShader(program_T1, fragmentShader_T1);

gl_T1.linkProgram(program_T1);

if (!gl_T1.getProgramParameter(program_T1, gl_T1.LINK_STATUS)) {

    throw new Error(
        gl_T1.getProgramInfoLog(program_T1)
    );
}


// --------------------------------------------------
// 5. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_T1 =
    gl_T1.getAttribLocation(
        program_T1,
        "aPosition"
    );

const colorsLocation_T1 =
    gl_T1.getAttribLocation(
        program_T1,
        "aColors"
    );


// --------------------------------------------------
// 6. BUFFER DE VÉRTICES
// --------------------------------------------------

const verticesBuffer_T1 = gl_T1.createBuffer();


// --------------------------------------------------
// 7. CONFIGURA ATRIBUTOS
// --------------------------------------------------

function configurarAtributos_T1(vertices) {

    gl_T1.bindBuffer(gl_T1.ARRAY_BUFFER, verticesBuffer_T1);

    gl_T1.bufferData(
        gl_T1.ARRAY_BUFFER,
        vertices,
        gl_T1.STATIC_DRAW
    );

    const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

    gl_T1.enableVertexAttribArray(positionLocation_T1);
    gl_T1.vertexAttribPointer(
        positionLocation_T1,
        2,
        gl_T1.FLOAT,
        false,
        stride,
        0
    );

    gl_T1.enableVertexAttribArray(colorsLocation_T1);
    gl_T1.vertexAttribPointer(
        colorsLocation_T1,
        3,
        gl_T1.FLOAT,
        false,
        stride,
        2 * Float32Array.BYTES_PER_ELEMENT
    );
}

// --------------------------------------------------
// 8.1. DESENHA TRIÂNGULO RETANGULO
// --------------------------------------------------
function desenha_triangulo_d(a, b, largura, altura, cor)  {

    const [r, g, bC] = cor;

    const vertices = new Float32Array([
        a, b + altura, r, g, bC,            
        a, b, r, g, bC,                     
        a + largura, b, r, g, bC            
    ]);

    configurarAtributos_T1(vertices);
    gl_T1.useProgram(program_T1);
    gl_T1.drawArrays(
        gl_T1.TRIANGLES,
        0, 
        3
    );
}

function desenha_triangulo_e(a, b, largura, altura, cor)  {

    const [r, g, bC] = cor;

    const vertices = new Float32Array([
        a + largura, b + altura, r, g, bC,  
        a, b, r, g, bC,                     
        a + largura, b, r, g, bC            
    ]);

    configurarAtributos_T1(vertices);
    gl_T1.useProgram(program_T1);
    gl_T1.drawArrays(
        gl_T1.TRIANGLES, 
        0, 
        3
    );
}


// --------------------------------------------------
// 8.2. DESENHA QUADRADO / RETÂNGULO
// --------------------------------------------------


function desenha_quadrado(a, b, largura, altura, cor) {

    const [r, g, bC] = cor;

    const vertices = new Float32Array([
        a, b + altura, r, g, bC,
        a + largura, b + altura, r, g, bC,
        a + largura, b, r, g, bC,

        a, b + altura, r, g, bC,
        a + largura, b, r, g, bC,
        a, b, r, g, bC
    ]);

    configurarAtributos_T1(vertices);

    gl_T1.useProgram(program_T1);

    gl_T1.drawArrays(
        gl_T1.TRIANGLES,
        0,
        vertices.length / 5
    );
}


// --------------------------------------------------
// 8.3. DESENHA CÍRCULO
// --------------------------------------------------

function desenha_circulo(a, b, raio, cor) {

    const [r, g, bC] = cor;

    const numSides = 40;
    const vertices = [a, b, r, g, bC];

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = a + raio * Math.cos(angle);
        const y = b + raio * Math.sin(angle);
        vertices.push(x, y, r, g, bC);
    }

    configurarAtributos_T1(new Float32Array(vertices));

    gl_T1.useProgram(program_T1);

    gl_T1.drawArrays(
        gl_T1.TRIANGLE_FAN,
        0,
        numSides + 2
    );
}


// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl_T1.clearColor(1, 1, 1, 1);
gl_T1.clear(gl_T1.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 10. MONTANDO O CARRO
// --------------------------------------------------

desenha_quadrado(-0.5, -0.15, 1, 0.3, [1.0, 0.0, 0.0]);
desenha_quadrado(0.43, 0.04, 0.07, 0.1, [1.0, 0.85, 0.2]);
desenha_quadrado(-0.3, 0.15, 0.6, 0.2, [0.5, 0.85, 0.95]);
desenha_triangulo_d(0.3, 0.15, 0.11, 0.2, [0.5, 0.85, 0.95]);
desenha_triangulo_e(-0.41, 0.15, 0.11, 0.2, [0.5, 0.85, 0.95]);
desenha_circulo(0.30, -0.15, 0.12, [0, 0, 0]);
desenha_circulo(-0.30, -0.15, 0.12, [0, 0, 0]);
