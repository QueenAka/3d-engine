const dsettings = {
  flyMode: true,
  forward: 'w',
  backward: 's',
  left: 'a',
  right: 'd',
  sprint: 'x',
  reset: 'r',
  screenie: 'p',
  camUp: 'ArrowUp',
  camDown: 'ArrowDown',
  camLeft: "ArrowLeft",
  camRight: "ArrowRight",
  noMouse: false,
  sensitivity: 500,
}

let settings = dsettings;
if (localStorage.getItem("settings")) {
  settings = JSON.parse(localStorage.getItem("settings"));
}

let canvas = null;
let keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  delete keys[e.key];
});

function playGame() {
  document.getElementById("menu").remove();
  document.getElementById("game").classList.remove("hidden");
  let mouseX = 0;
  let mouseY = 0;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  camera.rotation.order = "YXZ";

  const renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvas = renderer.domElement;
  document.body.appendChild(canvas);
  if (canvas.requestPointerLock) {
    canvas.requestPointerLock();
  } else if (canvas.mozRequestPointerLock) {
    canvas.mozRequestPointerLock();
  } else if (canvas.webkitRequestPointerLock) {
    canvas.webkitRequestPointerLock();
  } else {
    alert("Your browser is not capable of pointer lock controls.")
  }

  document.addEventListener('pointerlockchange', () => {
    const con = settings;
    const sens = settings.sensitivity;
    if (document.pointerLockElement === canvas) {
      function getMousePosition(e) {
        const { movementX, movementY } = e;
        const normalizedMovementX = movementX / window.innerWidth;
        const normalizedMovementY = movementY / window.innerHeight;

        mouseX += normalizedMovementX * (sens / 100)
        mouseY += normalizedMovementY * (sens / 100);
      }

      if (!con.noMouse) canvas.addEventListener('mousemove', getMousePosition);
    } else {
      document.getElementById("paused").classList.remove("hidden");
      document.getElementById("game").classList.add("hidden");
      canvas.removeEventListener('mousemove', getMousePosition);
    }
  });


  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  let frame = 0;
  let fps = "?"
  function animate() {
    requestAnimationFrame(animate);
    frame++
    const con = settings
    const statsDiv = document.getElementById("stats");
    statsDiv.innerHTML = `[${Math.round(camera.position.x)}, ${Math.round(camera.position.y)}, ${Math.round(camera.position.z)}] | ${fps}`;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.rotation.y = mouseX * -1;
    camera.rotation.x = mouseY * -1;
    let mult = 1;
    if (keys[con.sprint]) mult = 2;
    if (keys[con.forward] || keys[con.backward]) {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.normalize();
      direction.multiplyScalar(keys[con.forward] ? (0.1 * mult) : (-0.1 * mult));
      camera.position.add(direction);
    }
    if (keys[con.left] || keys[con.right]) {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      direction.crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
      direction.multiplyScalar(keys.a ? (0.1 * mult) : (-0.1 * mult));
      camera.position.add(direction);
    }
    if (keys[con.camUp]) mouseY -= 0.05;
    if (keys[con.camDown]) mouseY += 0.05;
    if (keys[con.camLeft]) mouseX -= 0.05;
    if (keys[con.camRight]) mouseX += 0.05;
    if (keys[con.screenie]) {
      screenshot();
      delete keys[con.screenie];
    }
    if (keys[con.reset]) {
      camera.position.x = 0;
      camera.position.y = 0;
      camera.position.z = 5;
      mouseX = 0;
      mouseY = 0;
    }

    renderer.render(scene, camera);
  }

  animate();
  setInterval(() => {
    fps = frame;
    frame = 0;
  }, 1000);
}

function resumeGame() {
  document.getElementById("paused").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  canvas.requestPointerLock();
}

function screenshot() {
  const base64image = canvas.toDataURL("image/png");
  window.open(base64image);
}

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

function openSettings() {
  document.getElementById("settings").classList.remove("hidden");
}

function changeSetting(setting, type) {
  if (type == "key") {
    document.getElementById("keySelect").classList.remove("hidden");
    keys = {};
    let newKeys = [];
    let loopdieloop = setInterval(() => {
      if (!isEmpty(keys)) {
        clearInterval(loopdieloop);
        document.getElementById("keySelect").classList.add("hidden");
        for (const key in keys) {
          newKeys.push(key);
        }
        settings[setting] = newKeys[0];
        document.getElementById(setting).innerHTML = newKeys[0];
      }
    })
  } else if (type == "toggle") {
    settings[setting] = !settings[setting];
    document.getElementById(setting).innerHTML = settings[setting];
  } else if (type == "slider") {
    document.getElementById("sliderSelector").classList.remove("hidden");
    let slider = document.getElementById("slider");
    slider.value = settings[setting];
  }
}

function changeSensitivity() {
  settings.sensitivity = document.getElementById("slider").value;
  document.getElementById("sensitivity").innerHTML = settings.sensitivity;
  document.getElementById("sliderSelector").classList.add("hidden");
}

function closeSettings() {
  document.getElementById("settings").classList.add("hidden");
  localStorage.setItem("settings", JSON.stringify(settings));
}

function resetSettings() {
  localStorage.removeItem("settings");
  window.location.reload();
}