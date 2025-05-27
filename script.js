// Import Three.js from CDN
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js';

let scene, camera, renderer;
let playerCar;
let road;
let sideGroundLeft, sideGroundRight;
let obstacles = [];
let trees = [];
let clouds = [];
let coins = [];
let speed = 0.15;
let gameSpeed = 0.15;
let moveLeft = false;
let moveRight = false;
let score = 0;
let gameRunning = true;

// Game elements
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create road
    createRoad();
    
    // Create player car
    createPlayerCar();
    
    // Create environment
    createTrees();
    createClouds();
    createSun();
    
    // Create initial obstacles and coins
    spawnObstacles();
    spawnCoins();

    setupControls();
    setupResize();
}

function createRoad() {
    // Main road
    const roadGeometry = new THREE.PlaneGeometry(8, 200);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    // Road lines
    for (let i = 0; i < 20; i++) {
        const lineGeometry = new THREE.PlaneGeometry(0.2, 3);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 0.01, -i * 10);
        line.rotation.x = -Math.PI / 2;
        scene.add(line);
    }

    // Side grounds
    const sideGroundGeometry = new THREE.PlaneGeometry(12, 200);
    const sideGroundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });

    sideGroundLeft = new THREE.Mesh(sideGroundGeometry, sideGroundMaterial);
    sideGroundLeft.position.x = -10;
    sideGroundLeft.rotation.x = -Math.PI / 2;
    sideGroundLeft.receiveShadow = true;
    scene.add(sideGroundLeft);

    sideGroundRight = sideGroundLeft.clone();
    sideGroundRight.position.x = 10;
    scene.add(sideGroundRight);
}

function createPlayerCar() {
    // Create a simple car using basic geometries
    const carGroup = new THREE.Group();
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.5, 3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.25;
    body.castShadow = true;
    carGroup.add(body);

    // Car roof
    const roofGeometry = new THREE.BoxGeometry(1.2, 0.4, 1.5);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xaa2222 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 0.7;
    roof.position.z = -0.2;
    roof.castShadow = true;
    carGroup.add(roof);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    const wheels = [];
    const wheelPositions = [
        [-0.8, 0, 1], [0.8, 0, 1],
        [-0.8, 0, -1], [0.8, 0, -1]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        carGroup.add(wheel);
        wheels.push(wheel);
    });

    playerCar = carGroup;
    playerCar.position.set(0, 0, 5);
    playerCar.wheels = wheels;
    scene.add(playerCar);
}

function createTrees() {
    for (let i = 0; i < 15; i++) {
        // Left side trees
        const treeLeft = createTree();
        treeLeft.position.set(-8 + Math.random() * 4, 0, -i * 15 - Math.random() * 10);
        scene.add(treeLeft);
        trees.push(treeLeft);

        // Right side trees
        const treeRight = createTree();
        treeRight.position.set(8 - Math.random() * 4, 0, -i * 15 - Math.random() * 10);
        scene.add(treeRight);
        trees.push(treeRight);
    }
}

function createTree() {
    const treeGroup = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 2, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(1, 8, 6);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 2.5;
    leaves.castShadow = true;
    treeGroup.add(leaves);

    return treeGroup;
}

function createClouds() {
    for (let i = 0; i < 10; i++) {
        const cloud = createCloud();
        const x = Math.random() * 60 - 30;
        const y = Math.random() * 8 + 15;
        const z = Math.random() * -150;
        cloud.position.set(x, y, z);
        scene.add(cloud);
        clouds.push(cloud);
    }
}

function createCloud() {
    const cloudGroup = new THREE.Group();
    const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    // Create multiple spheres for cloud effect
    for (let i = 0; i < 5; i++) {
        const cloudPart = new THREE.Mesh(
            new THREE.SphereGeometry(1 + Math.random(), 8, 6),
            cloudMaterial
        );
        cloudPart.position.set(
            Math.random() * 4 - 2,
            Math.random() * 1,
            Math.random() * 4 - 2
        );
        cloudGroup.add(cloudPart);
    }

    return cloudGroup;
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(-15, 25, -50);
    scene.add(sun);
}

function spawnObstacles() {
    // Clear existing obstacles
    obstacles.forEach(obstacle => scene.remove(obstacle));
    obstacles = [];

    // Create new obstacles
    for (let i = 0; i < 5; i++) {
        const obstacle = createObstacle();
        obstacle.position.set(
            (Math.random() - 0.5) * 6,
            0.5,
            -30 - i * 20
        );
        scene.add(obstacle);
        obstacles.push(obstacle);
    }
}

function createObstacle() {
    const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obstacleMaterial = new THREE.MeshLambertMaterial({ color: 0xff8800 });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.castShadow = true;
    return obstacle;
}

function spawnCoins() {
    // Clear existing coins
    coins.forEach(coin => scene.remove(coin));
    coins = [];

    // Create new coins
    for (let i = 0; i < 8; i++) {
        const coin = createCoin();
        coin.position.set(
            (Math.random() - 0.5) * 6,
            1,
            -25 - i * 15
        );
        scene.add(coin);
        coins.push(coin);
    }
}

function createCoin() {
    const coinGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 8);
    const coinMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.x = Math.PI / 2;
    return coin;
}

function setupControls() {
    window.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = false;
    });
}

function setupResize() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function checkCollisions() {
    if (!playerCar || !gameRunning) return;

    // Check obstacle collisions
    obstacles.forEach((obstacle, index) => {
        const distance = playerCar.position.distanceTo(obstacle.position);
        if (distance < 1.5) {
            gameOver();
        }
    });

    // Check coin collection
    coins.forEach((coin, index) => {
        const distance = playerCar.position.distanceTo(coin.position);
        if (distance < 1.5) {
            scene.remove(coin);
            coins.splice(index, 1);
            score += 10;
            updateScore();
        }
    });
}

function updateScore() {
    scoreElement.textContent = score;
    speedElement.textContent = Math.round(gameSpeed * 200);
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

window.restartGame = function() {
    gameRunning = true;
    score = 0;
    gameSpeed = 0.15;
    gameOverElement.style.display = 'none';
    
    // Reset car position
    if (playerCar) {
        playerCar.position.set(0, 0, 5);
    }
    
    // Respawn obstacles and coins
    spawnObstacles();
    spawnCoins();
    
    updateScore();
};

function animate() {
    requestAnimationFrame(animate);

    if (!gameRunning) {
        renderer.render(scene, camera);
        return;
    }

    // Move player car
    if (playerCar) {
        if (moveLeft) {
            playerCar.position.x = Math.max(-3.5, playerCar.position.x - 0.15);
            playerCar.rotation.z = Math.min(0.2, playerCar.rotation.z + 0.05);
        }
        if (moveRight) {
            playerCar.position.x = Math.min(3.5, playerCar.position.x + 0.15);
            playerCar.rotation.z = Math.max(-0.2, playerCar.rotation.z - 0.05);
        }
        if (!moveLeft && !moveRight) {
            playerCar.rotation.z *= 0.9; // Return to upright position
        }

        // Animate wheels
        if (playerCar.wheels) {
            playerCar.wheels.forEach(wheel => {
                wheel.rotation.x += gameSpeed * 10;
            });
        }
    }

    // Move environment
    trees.forEach(tree => {
        tree.position.z += gameSpeed;
        if (tree.position.z > 15) {
            tree.position.z = -200;
            tree.position.x = (Math.random() > 0.5 ? -8 : 8) + (Math.random() - 0.5) * 4;
        }
    });

    clouds.forEach(cloud => {
        cloud.position.z += gameSpeed * 0.3;
        if (cloud.position.z > 20) {
            cloud.position.z = -150;
            cloud.position.x = Math.random() * 60 - 30;
        }
        cloud.rotation.y += 0.005;
    });

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.position.z += gameSpeed;
        obstacle.rotation.y += 0.05;
        if (obstacle.position.z > 15) {
            obstacle.position.z = -100;
            obstacle.position.x = (Math.random() - 0.5) * 6;
        }
    });

    // Move coins
    coins.forEach(coin => {
        coin.position.z += gameSpeed;
        coin.rotation.y += 0.1;
        if (coin.position.z > 15) {
            coin.position.z = -120;
            coin.position.x = (Math.random() - 0.5) * 6;
        }
    });

    // Increase speed gradually
    gameSpeed += 0.0002;
    score += 1;

    // Update UI every 10 frames for performance
    if (score % 10 === 0) {
        updateScore();
    }

    checkCollisions();
    renderer.render(scene, camera);
}