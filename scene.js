import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function setupScene() {
    // Create the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Add fog for depth - reduced for better visibility of the complex scene
    scene.fog = new THREE.Fog(0x87CEEB, 200, 300);
    
    // Create a ground plane
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7CFC00, // Light green
        roughness: 0.8,
        metalness: 0.2 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
    
    return scene;
}

export function setupCamera(container) {
    // Create a perspective camera
    const camera = new THREE.PerspectiveCamera(
        45, // Lower FOV for less distortion
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    
    // Position the camera for isometric-like view
    camera.position.set(80, 80, 80);
    camera.lookAt(0, 0, 0);
    
    return camera;
}

export function setupRenderer(container) {
    // Create the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Enable shadows with higher quality
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Append the renderer to the container
    container.appendChild(renderer.domElement);
    
    return renderer;
}

export function setupLights(scene) {
    // Add ambient light (0xffffff, intensity 0.6)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add directional light (0xffffff, intensity 0.8)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    
    scene.add(directionalLight);
    
    // Add a secondary light from another angle for better illumination
    const secondaryLight = new THREE.DirectionalLight(0xffffcc, 0.5);
    secondaryLight.position.set(-30, 40, -30);
    secondaryLight.castShadow = true;
    
    // Configure shadow properties
    secondaryLight.shadow.mapSize.width = 1024;
    secondaryLight.shadow.mapSize.height = 1024;
    secondaryLight.shadow.camera.near = 0.5;
    secondaryLight.shadow.camera.far = 500;
    secondaryLight.shadow.camera.left = -100;
    secondaryLight.shadow.camera.right = 100;
    secondaryLight.shadow.camera.top = 100;
    secondaryLight.shadow.camera.bottom = -100;
    
    scene.add(secondaryLight);
    
    return { ambientLight, directionalLight, secondaryLight };
}

export function setupControls(camera, renderer) {
    // Add orbit controls for user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below the ground
    
    // Set initial rotation to match isometric view
    controls.update();
    
    return controls;
} 