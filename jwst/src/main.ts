import * as THREE from "three";
// import { RGBELoader } from "./jsm/loaders/RGBELoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// lights
const settings = {
  ambientIntensity: 0.2,
};
let ambientLight = new THREE.AmbientLight(0xffffff, settings.ambientIntensity);
scene.add(ambientLight);

let pointLight = new THREE.PointLight(0x4466ff, 0.5);
pointLight.position.z = 2500;
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xff6666, 1);
camera.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x0000ff, 0.5);
pointLight3.position.x = -1000;
pointLight3.position.z = 1000;
scene.add(pointLight3);

const bgImageTexture = "bg.jpg";

const reflectionCube = new THREE.CubeTextureLoader()
  .setPath("/")
  .load([
    bgImageTexture,
    bgImageTexture,
    bgImageTexture,
    bgImageTexture,
    bgImageTexture,
    bgImageTexture,
  ]);
reflectionCube.encoding = THREE.sRGBEncoding;
// scene.background = reflectionCube;

// const [texture] = await Promise.all([rgbeLoader.loadAsync("bg.jpg")]);
// texture.mapping = THREE.EquirectangularReflectionMapping;
// scene.background = texture;
// scene.environment = texture;

const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 6);
let material;
if (false) {
  material = new THREE.MeshBasicMaterial({ color: 0xff6f00 });
} else {
  material = new THREE.MeshStandardMaterial({
    color: 0xffffff, //'#999',// 0x888888,
    roughness: 0.03,
    metalness: 1.0,

    // normalMap: normalMap,
    // normalScale: new THREE.Vector2( 1, - 1 ), // why does the normal map require negation in this case?

    // aoMap: aoMap,
    // aoMapIntensity: 1,

    // displacementMap: displacementMap,
    // displacementScale: settings.displacementScale,
    // displacementBias: - 0.428408, // from original model

    envMap: reflectionCube,
    envMapIntensity: 1.0, // settings.envMapIntensity,

    // side: THREE.DoubleSide
  });
}

//////////////////////
const TAU = Math.PI * 2;
function getIsometricCoords([px, py]) {
  const origin = [0, 0];
  const [ox, oy] = origin;
  const gridSeparation = 1.8; //Math.round(canvas.height * 0.01)
  const dy = Math.sin((TAU * 60) / 360) * gridSeparation;
  let x;
  let y;

  x = gridSeparation * px;
  if (!!(py % 2)) {
    x = x + gridSeparation * 0.5;
  }
  y = dy * py;

  const useAlternativeOrientation = true;
  if (useAlternativeOrientation) {
    // Rotate angles by 30°
    const rotate = TAU / 12;
    [x, y] = [
      x * Math.cos(rotate) - y * Math.sin(rotate),
      x * Math.sin(rotate) + y * Math.cos(rotate),
    ];
  }

  // Translate to our chosen grid origin
  x = x + ox;
  y = y + oy;

  return [x, y];
}

const gridCoordinates = [
  [-1, -2],
  [0, -2],
  [1, -2],
  [-2, -1],
  [-1, -1],
  [0, -1],
  [1, -1],
  [-2, 0],
  [-1, 0],
  [1, 0],
  [2, 0],
  [-2, 1],
  [-1, 1],
  [0, 1],
  [1, 1],
  [-1, 2],
  [0, 2],
  [1, 2],
]
  .map(getIsometricCoords)
  .map(([x, y]) => {
    return { x, y, z: 0 };
  });

function createMirror({ x, y, z }) {
  const mirror = new THREE.Mesh(geometry, material);
  mirror.position.x = x;
  mirror.position.y = y;
  mirror.position.z = z;
  mirror.rotation.x = TAU * 0.25;
  mirror.rotation.y = (TAU * 1) / 12;
  scene.add(mirror);
  return mirror;
}
const mirrors = gridCoordinates.map(createMirror);

//////////////////////

camera.position.z = 10;
let sphere;
sphere = new THREE.Mesh(
  new THREE.SphereGeometry(100, 20, 20),
  new THREE.MeshNormalMaterial()
);
scene.add(sphere);

function animate() {
  requestAnimationFrame(animate);

  // mirrors.forEach((mirror) => {
  //   mirror.rotation.x += 0.01 * Math.random();
  // });

  // cylinder.rotation.x += 0.02;
  // cylinder.rotation.y += 0.01;
  // cylinder.rotation.z += 0.012345;

  const time = Date.now() * 0.0005;

  // sphere.position.x = Math.sin(time * 0.7) * 20;
  sphere.position.y = Math.cos(time * 0.5) * 20;
  sphere.position.z = 10; //Math.cos(time * 0.3) * 10;

  for (let i = 1, l = scene.children.length; i < l; i++) {
    // scene.children[i].lookAt(sphere.position);
    scene.children[i].rotation.x = Math.sin(time * 0.7) + TAU / 6;
  }
  // camera.position.x = Math.sin(time) * 10;
  // camera.position.y = Math.sin(time) * 10;
  // camera.position.z = Math.sin(time) * 10;
  // camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

animate();
