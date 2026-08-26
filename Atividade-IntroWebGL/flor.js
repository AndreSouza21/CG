const canvas_TFan = document.getElementById("glCanvasFlor");
const gl_TFan = canvas_TFan.getContext("webgl2");

if (!gl_TFan) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

function circleVertices(a,b,cor,radius) {
    const [r, g, Blue] = cor;
    const vertices = [a,b,r,g,Blue];


    const numSides = 40;

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = a + radius * Math.cos(angle);
        const y = b + radius * Math.sin(angle);
        vertices.push(x, y,r,g,Blue);
    }

    return new Float32Array(vertices);
}



// --------------------------------------------------
// 2. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource_TFan = `#version 300 es

in vec2 aPosition;
in vec3 aColors;

out vec3 vColors;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColors = aColors;
}
    
`;
    
    
// --------------------------------------------------
// 3. FRAGMENT SHADER
// --------------------------------------------------
    
const fragmentShaderSource_TFan = `#version 300 es
    
precision mediump float;
    
in vec3 vColors;
    
out vec4 outColor;
    
void main() {
    outColor = vec4(vColors, 1.0);
}
    
`;
    
    
// --------------------------------------------------
// 4. COMPILAR SHADERS
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


const vertexShader_TFan = createShader(
    gl_TFan,
    gl_TFan.VERTEX_SHADER,
    vertexShaderSource_TFan
);

const fragmentShader_TFan = createShader(
    gl_TFan,
    gl_TFan.FRAGMENT_SHADER,
    fragmentShaderSource_TFan
);


// --------------------------------------------------
// 5. CRIAR PROGRAMA
// --------------------------------------------------

const program_TFan = gl_TFan.createProgram();

gl_TFan.attachShader(program_TFan, vertexShader_TFan);
gl_TFan.attachShader(program_TFan, fragmentShader_TFan);

gl_TFan.linkProgram(program_TFan);

if (!gl_TFan.getProgramParameter(program_TFan, gl_TFan.LINK_STATUS)) {
    
    throw new Error(
        gl_TFan.getProgramInfoLog(program_TFan)
    );
}


// --------------------------------------------------
// 6. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_TFan =
gl_TFan.getAttribLocation(
    program_TFan,
        "aPosition"
    );
    
    const colorsLocation_TFan =
    gl_TFan.getAttribLocation(
        program_TFan,
        "aColors"
    );
    
    
    
// --------------------------------------------------
// 7. BUFFER
// --------------------------------------------------

const verticesBuffer_TFan = gl_TFan.createBuffer();


// --------------------------------------------------
// 8. CONFIGURA ATRIBUTOS E DESENHA
// --------------------------------------------------

function desenha_circulo(a, b, cor, radius){

    const vertices_TFan = circleVertices(a, b, cor, radius);

    gl_TFan.bindBuffer(gl_TFan.ARRAY_BUFFER, verticesBuffer_TFan);

    gl_TFan.bufferData(
        gl_TFan.ARRAY_BUFFER,
        vertices_TFan,
        gl_TFan.STATIC_DRAW
    );

    //atributos
    const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

    gl_TFan.enableVertexAttribArray(positionLocation_TFan);

    gl_TFan.vertexAttribPointer(
        positionLocation_TFan,
        2,
        gl_TFan.FLOAT,
        false,
        stride,
        0
    );

    gl_TFan.enableVertexAttribArray(colorsLocation_TFan);
    gl_TFan.vertexAttribPointer(
        colorsLocation_TFan,
        3,
        gl_TFan.FLOAT,
        false,
        stride,
        2 * Float32Array.BYTES_PER_ELEMENT
    );

    gl_TFan.useProgram(program_TFan);

    gl_TFan.drawArrays(
        gl_TFan.TRIANGLE_FAN,
        0,
        42
    );
}
    

// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl_TFan.clearColor(1, 1, 1, 1);

gl_TFan.clear(gl_TFan.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 10. CRIA A FLOR
// --------------------------------------------------

const distancia = Math.hypot(0.2, 0.2); 

for (let i = 0; i < 6; i++) {
    
    const angulo = (i * 2 * Math.PI) / 6;

    const x = distancia * Math.cos(angulo);
    const y = distancia * Math.sin(angulo);

    desenha_circulo(x, y, [1.0, 0.4, 0.7], 0.15);
}
desenha_circulo(0.0, 0.0, [1.0, 1.0, 0.0],0.19);