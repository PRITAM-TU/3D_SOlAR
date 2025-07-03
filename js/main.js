import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

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
// Add this after your existing loading screen code but before the init() function

// Speed Control Panel
const controlPanel = document.createElement('div');
controlPanel.id = 'control-panel';
controlPanel.innerHTML = `
  <div class="control-panel">
    <h2>Planet Speed Controls</h2>
    <div class="control-group">
      <label for="mercury-speed">Mercury:</label>
      <input type="range" id="mercury-speed" min="0.1" max="5" step="0.1" value="${mercury_revolution_speed}">
      <span class="speed-value">${mercury_revolution_speed}x</span>
    </div>
    <div class="control-group">
      <label for="venus-speed">Venus:</label>
      <input type="range" id="venus-speed" min="0.1" max="5" step="0.1" value="${venus_revolution_speed}">
      <span class="speed-value">${venus_revolution_speed}x</span>
    </div>
    <div class="control-group">
      <label for="earth-speed">Earth:</label>
      <input type="range" id="earth-speed" min="0.1" max="5" step="0.1" value="${earth_revolution_speed}">
      <span class="speed-value">${earth_revolution_speed}x</span>
    </div>
    <div class="control-group">
      <label for="mars-speed">Mars:</label>
      <input type="range" id="mars-speed" min="0.1" max="5" step="0.1" value="${mars_revolution_speed}">
      <span class="speed-value">${mars_revolution_speed}x</span>
    </div>
    <div class="control-group">
      <label for="jupiter-speed">Jupiter:</label>
      <input type="range" id="jupiter-speed" min="0.1" max="5" step="0.1" value="${jupiter_revolution_speed}">
      <span class="speed-value">${jupiter_revolution_speed}x</span>
    </div>
    <div class="control-group">
      <label for="saturn-speed">Saturn:</label>
      <input type="range" id="saturn-speed" min="0.1" max="5" step="0.1" value="${saturn_revolution_speed}">
      <span class="speed-value">${saturn_revolution_speed}x</span>
    </div>
    <div class="control-group">
      <label for="uranus-speed">Uranus:</label>
      <input type="range" id="uranus-speed" min="0.1" max="5" step="0.1" value="${uranus_revolution_speed}">
      <span class="speed-value">${uranus_revolution_speed}x</span>
    </div>
    <div class="control-group">
      <label for="neptune-speed">Neptune:</label>
      <input type="range" id="neptune-speed" min="0.1" max="5" step="0.1" value="${neptune_revolution_speed}">
      <span class="speed-value">${neptune_revolution_speed}x</span>
    </div>
    <button id="reset-speeds">Reset to Default</button>
    <button id="toggle-panel">Hide Controls</button>
  </div>
`;

// Add CSS for the control panel
const panelStyle = document.createElement('style');
panelStyle.textContent = `
  .control-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px;
    border-radius: 10px;
    font-family: Arial, sans-serif;
    z-index: 1000;
    max-width: 300px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .control-panel h2 {
    margin-top: 0;
    font-size: 1.2em;
    color: #fff;
    text-align: center;
    margin-bottom: 15px;
  }
  
  .control-group {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }
  
  .control-group label {
    flex: 1;
    margin-right: 10px;
    font-size: 0.9em;
  }
  
  .control-group input[type="range"] {
    flex: 2;
    margin-right: 10px;
  }
  
  .speed-value {
    flex: 0.5;
    text-align: right;
    font-size: 0.9em;
    color: #4fc3f7;
  }
  
  #reset-speeds, #toggle-panel {
    width: 100%;
    padding: 8px;
    margin-top: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  #reset-speeds:hover, #toggle-panel:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  #reset-speeds {
    margin-right: 5px;
  }
  
  .control-panel.collapsed {
    width: 40px;
    height: 40px;
    overflow: hidden;
    padding: 0;
  }
  
  .control-panel.collapsed > * {
    display: none;
  }
  
  .control-panel.collapsed #toggle-panel {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    border-radius: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    .control-panel {
      top: auto;
      bottom: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }
  }
`;

document.head.appendChild(panelStyle);
document.body.appendChild(controlPanel);

// Add event listeners for the speed controls
document.getElementById('mercury-speed').addEventListener('input', (e) => {
  mercury_revolution_speed = parseFloat(e.target.value);
  document.querySelector('#mercury-speed + .speed-value').textContent = `${mercury_revolution_speed}x`;
});

document.getElementById('venus-speed').addEventListener('input', (e) => {
  venus_revolution_speed = parseFloat(e.target.value);
  document.querySelector('#venus-speed + .speed-value').textContent = `${venus_revolution_speed}x`;
});

document.getElementById('earth-speed').addEventListener('input', (e) => {
  earth_revolution_speed = parseFloat(e.target.value);
  document.querySelector('#earth-speed + .speed-value').textContent = `${earth_revolution_speed}x`;
});

document.getElementById('mars-speed').addEventListener('input', (e) => {
  mars_revolution_speed = parseFloat(e.target.value);
  document.querySelector('#mars-speed + .speed-value').textContent = `${mars_revolution_speed}x`;
});

document.getElementById('jupiter-speed').addEventListener('input', (e) => {
  jupiter_revolution_speed = parseFloat(e.target.value);
  document.querySelector('#jupiter-speed + .speed-value').textContent = `${jupiter_revolution_speed}x`;
});

document.getElementById('saturn-speed').addEventListener('input', (e) => {
  saturn_revolution_speed = parseFloat(e.target.value);
  document.querySelector('#saturn-speed + .speed-value').textContent = `${saturn_revolution_speed}x`;
});

document.getElementById('uranus-speed').addEventListener('input', (e) => {
  uranus_revolution_speed = parseFloat(e.target.value);
  document.querySelector('#uranus-speed + .speed-value').textContent = `${uranus_revolution_speed}x`;
});

document.getElementById('neptune-speed').addEventListener('input', (e) => {
  neptune_revolution_speed = parseFloat(e.target.value);
  document.querySelector('#neptune-speed + .speed-value').textContent = `${neptune_revolution_speed}x`;
});

// Reset to default speeds
document.getElementById('reset-speeds').addEventListener('click', () => {
  mercury_revolution_speed = 2;
  venus_revolution_speed = 1.5;
  earth_revolution_speed = 1;
  mars_revolution_speed = 0.8;
  jupiter_revolution_speed = 0.7;
  saturn_revolution_speed = 0.6;
  uranus_revolution_speed = 0.5;
  neptune_revolution_speed = 0.4;
  
  document.getElementById('mercury-speed').value = mercury_revolution_speed;
  document.getElementById('venus-speed').value = venus_revolution_speed;
  document.getElementById('earth-speed').value = earth_revolution_speed;
  document.getElementById('mars-speed').value = mars_revolution_speed;
  document.getElementById('jupiter-speed').value = jupiter_revolution_speed;
  document.getElementById('saturn-speed').value = saturn_revolution_speed;
  document.getElementById('uranus-speed').value = uranus_revolution_speed;
  document.getElementById('neptune-speed').value = neptune_revolution_speed;
  
  document.querySelectorAll('.speed-value').forEach((span, index) => {
    const speeds = [mercury_revolution_speed, venus_revolution_speed, earth_revolution_speed, 
                   mars_revolution_speed, jupiter_revolution_speed, saturn_revolution_speed, 
                   uranus_revolution_speed, neptune_revolution_speed];
    span.textContent = `${speeds[index]}x`;
  });
});

// Toggle panel visibility
document.getElementById('toggle-panel').addEventListener('click', () => {
  const panel = document.querySelector('.control-panel');
  const button = document.getElementById('toggle-panel');
  
  if (panel.classList.contains('collapsed')) {
    panel.classList.remove('collapsed');
    button.textContent = 'Hide Controls';
  } else {
    panel.classList.add('collapsed');
    button.textContent = '☰';
  }
});
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