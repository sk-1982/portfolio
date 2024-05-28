import {
    add,
    cross,
    flatten,
    lookAt,
    mix,
    mult,
    normalize,
    perspective, rotateX,
    rotateY, rotateZ, scalem,
    subtract, translate,
    vec3,
    vec4
} from "@/utils/mv.js";
import { initShaders } from "@/utils/shader.ts";
import vertexShader from './flowerbox.vert';
import fragmentShader from './flowerbox.frag';

// https://github.com/kevin-shannon/3D-FlowerBox/blob/master/Common/MV.js

let running = false;

var indices = [];
var normals = [];
var vertices = [];

class Surface {
    constructor(x_initial, x_final, y_initial, y_final, x_divisions, y_divisions) {
        this.x_initial = x_initial;
        this.x_final = x_final;
        this.y_initial = y_initial;
        this.y_final = y_final;
        this.x_divisions = x_divisions;
        this.y_divisions = y_divisions;
        this.numIndices = (x_divisions-1) * (y_divisions-1) * 6;
    }
}

var subdiv = 13;
var square = new Surface(-1, 1, -1, 1, subdiv, subdiv)

function generate_geometry(surface, time) {
    normals = [];
    vertices = [];
    var x_discretized_interval = new Array(surface.x_divisions);
    var y_discretized_interval = new Array(surface.y_divisions);
    var dx = (surface.x_final-surface.x_initial) / (surface.x_divisions-1);
    var dy = (surface.y_final-surface.y_initial) / (surface.y_divisions-1);

    // Discretize intervals
    for (let i = 0; i < surface.x_divisions; i++) {
        x_discretized_interval[i] = dx * i + surface.x_initial;
    }
    for (let i = 0; i < surface.y_divisions; i++) {
        y_discretized_interval[i] = dy * i + surface.y_initial;
    }

    // Calculate vertices
    for (const x of x_discretized_interval) {
        for (const y of y_discretized_interval) {
            var pos = vec3(x, y, 1.0);
            var pos2 = vec3(pos);
            var morph = -Math.abs(1.6 * (time % 7.5) - 6) + 5;
            vertices.push(mix(pos, normalize(pos2), morph));
        }
    }

    // Calculate Normals
    for (let i = 0; i < surface.x_divisions; i++) {
        for (let j = 0; j <  surface.y_divisions; j++) {
            // Useful vectors
            var v = vertices[i*surface.y_divisions + j];
            var viprev = vertices[i*surface.y_divisions + j - 1];
            var vinext = vertices[i*surface.y_divisions + j + 1];
            var vjprev = vertices[(i-1)*surface.y_divisions + j];
            var vjnext = vertices[(i+1)*surface.y_divisions + j];
            let partial_x;
            let partial_y;

            // Find Partials
            if (j % surface.x_divisions === 0) {
                partial_x = subtract(vinext, v);
            } else if ((j+1) % surface.x_divisions === 0) {
                partial_x = subtract(v, viprev);
            } else {
                partial_x = add(subtract(vinext, v), subtract(v, viprev));
            }
            if (i % surface.y_divisions === 0) {
                partial_y = subtract(vjnext, v);
            } else if ((i+1) % surface.y_divisions === 0) {
                partial_y = subtract(v, vjprev);
            } else {
                partial_y = add(subtract(vjnext, v), subtract(v, vjprev));
            }

            // Cross Partials for Normal
            normals.push(vec4(normalize(cross(partial_y, partial_x)), 0.0));
        }
    }
}

function generate_indices(surface) {
    indices = [];
    for (var i = 0; i < surface.x_divisions-1; i++) {
        for (var j = 0; j < surface.y_divisions-1; j++) {
            // A square is made from an upper and lower triangle
            const a = i*surface.x_divisions + j;
            const b = i*surface.x_divisions + j + 1;
            const c = (i+1)*surface.x_divisions + j + 1;
            const d = (i+1)*surface.x_divisions + j;

            // first triangle
            indices.push(a);
            indices.push(b);
            indices.push(c);

            // second triangle
            indices.push(a);
            indices.push(c);
            indices.push(d);
        }
    }
}

var canvas;
var gl;

// shader with lighting
var u_lightPosition;
var u_ambientProduct;
var u_diffuseProduct;
var u_specularProduct;
var u_shininess;

// attributes
var modelView;
var projMatrix;
var a_vertexPosition;

// viewer properties
var viewer = {
    eye: vec3(0.0, 0.0, 5.0),
    at:  vec3(0.0, 0.0, 0.0),
    up:  vec3(0.0, 1.0, 0.0),
};

var perspProj = {
    fov: 60,
    aspect: 1,
    near: 0.001,
    far:  10
}

// modelview and project matrices
var mvMatrix;
var u_mvMatrix;

var projMatrix;
var u_projMatrix;

// Magic Variables
var shininess = 30;
var time = 0.625;
var delta_t = 0.01;
var sz = 0.5;
var pos = [0, 0];
var speed_r = 88;
var speed_x = -0.006;
var speed_y = 0.006;
var max_x = 2.1
var max_y = 1.7

// Light properties
class Light {
    constructor(position, ambient, diffuse, specular) {
        this.position = position;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}

var light = new Light(
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(0.2, 0.2, 0.2, 1.0),
    vec4(0.9, 0.9, 0.9, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0)
);

// Materials
class Material {
    constructor(ambient, diffuse, specular) {
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}

var materials = {
    cyan: new Material(
        vec4(0.0, 1.0, 1.0, 1.0),
        vec4(0.0, 1.0, 1.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0)
    ),
    magenta: new Material(
        vec4(1.0, 0.0, 1.0, 1.0),
        vec4(1.0, 0.0, 1.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0)
    ),
    yellow: new Material(
        vec4(1.0, 1.0, 0.0, 1.0),
        vec4(1.0, 1.0, 0.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0)
    ),
    red: new Material(
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0)
    ),
    green: new Material(
        vec4(0.0, 1.0, 0.0, 1.0),
        vec4(0.0, 1.0, 0.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0)
    ),
    blue: new Material(
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0)
    )
};

var faces = {
    front: {
        orientation: [0, 0],
        material: 'cyan'
    },
    left: {
        orientation: [0, 90],
        material: 'magenta'
    },
    back: {
        orientation: [0, 180],
        material: 'yellow'
    },
    right: {
        orientation: [0, 270],
        material: 'blue'
    },
    top: {
        orientation: [90, 0],
        material: 'red'
    },
    bottom: {
        orientation: [270, 0],
        material: 'green'
    }
}

var shape;
var aspect_ratio;

var program;
var vBuffer;
var vPosition;
var nBuffer;
var vNormal;
var iBuffer;

export function stop() {
    running = false;
}

// Graphics Initialization
export function init(c) {
    running = true;

    // Set up canvas
    canvas = c;

    gl = canvas.getContext('webgl');
    const ext = gl.getExtension('OES_element_index_uint');

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // Create the geometry and load into GPU structures,
    generate_geometry(square, time);
    generate_indices(square);
    shape = square;

    program = initShaders(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);

    // Array element buffer
    iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    // Vertex buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "a_vertexPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Normal buffer
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    vNormal = gl.getAttribLocation( program, "a_vertexNormal" );
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vNormal);

    // uniform locations
    u_mvMatrix = gl.getUniformLocation(program, "u_mvMatrix");
    u_projMatrix = gl.getUniformLocation(program, "u_projMatrix");
    u_lightPosition = gl.getUniformLocation(program, "u_lightPosition");
    u_ambientProduct = gl.getUniformLocation(program, "u_ambientProduct");
    u_diffuseProduct = gl.getUniformLocation(program, "u_diffuseProduct");
    u_specularProduct = gl.getUniformLocation(program, "u_specularProduct");
    u_shininess = gl.getUniformLocation(program, "u_shininess");

    canvas.addEventListener('mousedown', function () {
        if (subdiv === 13) {
            subdiv = 50;
        } else {
            subdiv = 13;
        }
        shape = new Surface(-1, 1, -1, 1, subdiv, subdiv);
        generate_indices(shape);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
    })

    render();
}

var render = function() {
    if (!running) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    aspect_ratio = canvas.width / canvas.height;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Time and position calculations
    time += delta_t
    pos[0] += speed_x
    pos[1] += speed_y

    if (Math.abs(pos[0]) > max_x) {
        speed_x = -speed_x;
    }
    if (Math.abs(pos[1]) > max_y) {
        speed_y = -speed_y;
    }

    generate_geometry(shape, time);

    // Vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vNormal);

    // Projection Matrix
    let pjMatrix = perspective(perspProj.fov, perspProj.aspect, perspProj.near, perspProj.far);
    gl.uniformMatrix4fv(u_projMatrix, false, flatten(pjMatrix));

    // mvMatrix building
    var mvFoundation = lookAt(viewer.eye, viewer.at, viewer.up);
    mvFoundation = mult(mvFoundation, scalem(sz/aspect_ratio, sz, sz));
    mvFoundation = mult(mvFoundation, rotateY(speed_r*time));
    mvFoundation = mult(mvFoundation, rotateZ(speed_r*time));
    for (const face in faces) {
        // Orientate Face
        mvMatrix = mult(mvFoundation, rotateX(faces[face].orientation[0]));
        mvMatrix = mult(mvMatrix, rotateY(faces[face].orientation[1]));
        mvMatrix = mult(translate(pos[0], pos[1], 0), mvMatrix);

        gl.uniformMatrix4fv(u_mvMatrix, false, flatten(mvMatrix));

        // Lights
        let ambientProduct = mult(light.ambient, materials[faces[face].material].ambient);
        let diffuseProduct = mult(light.diffuse, materials[faces[face].material].diffuse);
        let specularProduct = mult(light.specular, materials[faces[face].material].specular);

        gl.uniform4fv(u_lightPosition, flatten(light.position));
        gl.uniform4fv(u_ambientProduct, flatten(ambientProduct));
        gl.uniform4fv(u_diffuseProduct, flatten(diffuseProduct));
        gl.uniform4fv(u_specularProduct, flatten(specularProduct));
        gl.uniform1f(u_shininess, shininess);

        gl.drawElements(gl.TRIANGLES, shape.numIndices, gl.UNSIGNED_INT, 0);
    }
    requestAnimationFrame(render);
}
