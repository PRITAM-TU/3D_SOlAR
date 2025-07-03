import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
const backgroundAudio = new Audio('milky-way-ambient-space-music-1395.mp3');

// Set audio to loop
backgroundAudio.loop = true;

// Play the audio (note: many browsers require this to be triggered by user interaction)
document.addEventListener('click', function() {
  backgroundAudio.play().catch(e => console.log("Audio play failed:", e));
}, { once: true }); // The { once: true } option makes this listener trigger only once
// Loading screen elements
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loading-screen';
loadingScreen.innerHTML = `
   <div class="loading-screen">
   <div class="loading-text">CREATED BY PRITAM </div>
        <div class="loading-text">Loading 3D SOLAR...</div>
        <div class="progress-container">
            <div class="progress-bar" id="progress-bar"></div>
        </div>
    </div>
`;


// Add CSS for the loading screen
const style = document.createElement('style');
style.textContent = `
  .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            font-family: "Bitcount Grid Double", system-ui;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .progress-container {
            width: 80%;
            max-width: 300px;
            height: 30px;
            background: #333;
            border-radius: 15px;
            margin: 20px 0;
            
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg,rgb(170, 14, 194), #1912d4);
            transition: width 0.3s ease;
        }
        
        .loading-text {
            color: white;
            text-shadow: 10px 10px 30px wheat;
            font-size: 18px;
            text-align: center;
        }
        header{
            width: 100%;
        }
@media only screen and (max-width: 781px) {
    .container{
        flex-direction: column;
    }
    .box_1{
        height: auto;
    width:auto;
    }
    
  
}

`;



document.head.appendChild(style);
document.body.appendChild(loadingScreen);
 let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const interval = setInterval(function() {
            progress += Math.random() * 10;
            if(progress >= 100) {
                progress = 100;
                clearInterval(interval);
                document.querySelector('.loading-screen').style.opacity = '0';
                setTimeout(function() {
                    document.querySelector('.loading-screen').style.display = 'none';
                }, 500);
            }
            progressBar.style.width = progress + '%';
        }, 300);


let scene, camera, renderer, controls, skybox;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;
let planet_sun_label;

let mercury_orbit_radius = 50;
let venus_orbit_radius = 60;
let earth_orbit_radius = 70;
let mars_orbit_radius = 80;
let jupiter_orbit_radius = 100;
let saturn_orbit_radius = 120;
let uranus_orbit_radius = 140;
let neptune_orbit_radius = 160;

let mercury_revolution_speed = 2;
let venus_revolution_speed = 1.5;
let earth_revolution_speed = 1;
let mars_revolution_speed = 0.8;
let jupiter_revolution_speed = 0.7;
let saturn_revolution_speed = 0.6;
let uranus_revolution_speed = 0.5;
let neptune_revolution_speed = 0.4;


let totalAssets = 15; // Skybox (6) + planets (8) + sun (1)
let loadedAssets = 0;

function updateProgress() {
  const progress = Math.round((loadedAssets / totalAssets) * 100);
  document.querySelector('.progress').textContent = `${progress}%`;
  
  if (loadedAssets === totalAssets) {
    
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 1000);
  }
}

function createMaterialArray() {
  const skyboxImagepaths = [
    '../image/skybox/space_ft.png', 
    '../image/skybox/space_bk.png', 
    '../image/skybox/space_up.png', 
    '../image/skybox/space_dn.png', 
    '../image/skybox/space_rt.png', 
    '../image/skybox/space_lf.png'
  ];
  
  const materialArray = skyboxImagepaths.map((image) => {
    let texture = new THREE.TextureLoader().load(
      image,
      () => { 
        loadedAssets++;
        updateProgress();
      },
      undefined, 
      (err) => { 
        console.error('Error loading skybox texture:', err);
        loadedAssets++; 
        updateProgress();
      }
    );
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

function setSkyBox() {
  const materialArray = createMaterialArray();
  let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

function loadPlanetTexture(texture, radius, widthSegments, heightSegments, meshType, name) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const loader = new THREE.TextureLoader();
  
  const planetTexture = loader.load(
    texture,
    () => { // onLoad callback
      loadedAssets++;
      updateProgress();
    },
    undefined, 
    (err) => { 
      console.error(`Error loading ${name} texture:`, err);
      loadedAssets++; 
      updateProgress();
    }
  );
  
  const material = meshType == 'standard' 
    ? new THREE.MeshStandardMaterial({ map: planetTexture }) 
    : new THREE.MeshBasicMaterial({ map: planetTexture });

  return new THREE.Mesh(geometry, material);
}

function createRing(innerRadius) {
  let outerRadius = innerRadius + 0.1; 
  let thetaSegments = 100;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
  const material = new THREE.MeshBasicMaterial({ 
    color: '#ffffff', 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  
  planet_sun = loadPlanetTexture("../image/sun_hd.jpg", 20, 100, 100, 'basic', 'sun');
  planet_mercury = loadPlanetTexture("../image/mercury_hd.jpg", 2, 100, 100, 'standard', 'mercury');
  planet_venus = loadPlanetTexture("../image/venus_hd.jpg", 3, 100, 100, 'standard', 'venus');
  planet_earth = loadPlanetTexture("../image/earth_hd.jpg", 4, 100, 100, 'standard', 'earth');
  planet_mars = loadPlanetTexture("../image/mars_hd.jpg", 3.5, 100, 100, 'standard', 'mars');
  planet_jupiter = loadPlanetTexture("../image/jupiter_hd.jpg", 10, 100, 100, 'standard', 'jupiter');
  planet_saturn = loadPlanetTexture("../image/saturn_hd.jpg", 8, 100, 100, 'standard', 'saturn');
  planet_uranus = loadPlanetTexture("../image/uranus_hd.jpg", 6, 100, 100, 'standard', 'uranus');
  planet_neptune = loadPlanetTexture("../image/neptune_hd.jpg", 5, 100, 100, 'standard', 'neptune');
  
  scene.add(planet_sun);
  scene.add(planet_mercury);
  scene.add(planet_venus);
  scene.add(planet_earth);
  scene.add(planet_mars);
  scene.add(planet_jupiter);
  scene.add(planet_saturn);
  scene.add(planet_uranus);
  scene.add(planet_neptune);

  const sunLight = new THREE.PointLight(0xffffff, 1, 0); 
  sunLight.position.copy(planet_sun.position); 
  scene.add(sunLight);

  
  createRing(mercury_orbit_radius);
  createRing(venus_orbit_radius);
  createRing(earth_orbit_radius);
  createRing(mars_orbit_radius);
  createRing(jupiter_orbit_radius);
  createRing(saturn_orbit_radius);
  createRing(uranus_orbit_radius);
  createRing(neptune_orbit_radius);

  setSkyBox();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "c";
  
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 12;
  controls.maxDistance = 1000;

  camera.position.z = 100;
}

function planetRevolver(time, speed, planet, orbitRadius, planetName) {
  let orbitSpeedMultiplier = 0.001;
  const planetAngle = time * orbitSpeedMultiplier * speed;
  planet.position.x = planet_sun.position.x + orbitRadius * Math.cos(planetAngle);
  planet.position.z = planet_sun.position.z + orbitRadius * Math.sin(planetAngle);
}

function animate(time) {
  requestAnimationFrame(animate);

  
  if (loadedAssets === totalAssets) {
    
    const rotationSpeed = 0.005;
    planet_earth.rotation.y += rotationSpeed;
    planet_sun.rotation.y += rotationSpeed;
    planet_mercury.rotation.y += rotationSpeed;
    planet_venus.rotation.y += rotationSpeed;
    planet_mars.rotation.y += rotationSpeed;
    planet_jupiter.rotation.y += rotationSpeed;
    planet_saturn.rotation.y += rotationSpeed;
    planet_uranus.rotation.y += rotationSpeed;
    planet_neptune.rotation.y += rotationSpeed;

    planetRevolver(time, mercury_revolution_speed, planet_mercury, mercury_orbit_radius, 'mercury');
    planetRevolver(time, venus_revolution_speed, planet_venus, venus_orbit_radius, 'venus');
    planetRevolver(time, earth_revolution_speed, planet_earth, earth_orbit_radius, 'earth');
    planetRevolver(time, mars_revolution_speed, planet_mars, mars_orbit_radius, 'mars');
    planetRevolver(time, jupiter_revolution_speed, planet_jupiter, jupiter_orbit_radius, 'jupiter');
    planetRevolver(time, saturn_revolution_speed, planet_saturn, saturn_orbit_radius, 'saturn');
    planetRevolver(time, uranus_revolution_speed, planet_uranus, uranus_orbit_radius, 'uranus');
    planetRevolver(time, neptune_revolution_speed, planet_neptune, neptune_orbit_radius, 'neptune');
  }

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

init();
animate(0);