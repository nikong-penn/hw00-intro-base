import {vec3, vec4} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import CubeFlat from './geometry/CubeFlat';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  'Shape #1': swapToIcosphere, // A function pointer, essentially
  'Shape #2': swapToFlatCube, // A function pointer, essentially
  'Shape #3': swapToNonFlatCube, // A function pointer, essentially
  'Shape #4': swapToSquare, // A function pointer, essentially
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let cubeflat: CubeFlat
let prevTesselations: number = 5;
let uTime: number = 0.0;

let render_type: number = 0;

var palette = {
    color: [ 0, 95, 255 ],
  };

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  cubeflat = new CubeFlat(vec3.fromValues(0, 0, 0));
  cubeflat.create();
}

function swapToIcosphere() {
  render_type = 0;
}
function swapToFlatCube() {
  render_type = 1;
}
function swapToNonFlatCube() {
  render_type = 2;
}
function swapToSquare() {
  render_type = 3;
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  //gui.add(controls, 'Load Scene');
  gui.add(controls, 'Shape #1');
  gui.add(controls, 'Shape #2');
  gui.add(controls, 'Shape #3');
  gui.add(controls, 'Shape #4');
  gui.addColor(palette, 'color');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    uTime++;
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }

    let color = vec4.fromValues(palette.color[0]/255.0, palette.color[1]/255.0, palette.color[2]/255.0, 1)
 
    if (render_type === 0) {
      renderer.render(camera, lambert, [icosphere,], color, uTime);
    } 
    if (render_type === 1) {
      renderer.render(camera, lambert, [cube,], color, uTime);
    } 
    if (render_type === 2) {
      renderer.render(camera, lambert, [cubeflat,], color, uTime);
    } 
    if (render_type === 3) {
      renderer.render(camera, lambert, [square,], color, uTime);
    } 

    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
