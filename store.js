import * as THREE from 'three';

// Factory for creating different types of stores/warehouses
export function createStore(position, name, type = 'standard') {
    // Create a group to hold the store and its label
    const storeGroup = new THREE.Group();
    
    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const brickTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg');
    brickTexture.wrapS = THREE.RepeatWrapping;
    brickTexture.wrapT = THREE.RepeatWrapping;
    brickTexture.repeat.set(2, 1);
    
    const metalTexture = textureLoader.load('https://threejs.org/examples/textures/metal.jpg');
    metalTexture.wrapS = THREE.RepeatWrapping;
    metalTexture.wrapT = THREE.RepeatWrapping;
    metalTexture.repeat.set(4, 2);
    
    // Store types with different dimensions and styles
    const storeTypes = {
        standard: {
            width: 10,
            height: 6,
            depth: 8,
            color: 0xF4A460, // Sandy brown
            texture: brickTexture,
            roofColor: 0x8B0000, // Dark red
            roofHeight: 1,
            windows: true
        },
        warehouse: {
            width: 15,
            height: 8,
            depth: 12,
            color: 0x708090, // Slate gray
            texture: metalTexture,
            roofColor: 0x2F4F4F, // Dark slate gray
            roofHeight: 2,
            windows: false
        },
        smallDepot: {
            width: 8,
            height: 5,
            depth: 7,
            color: 0xFFD700, // Gold
            texture: brickTexture,
            roofColor: 0x8B4513, // Saddle brown
            roofHeight: 1.5,
            windows: true
        },
        industrial: {
            width: 18,
            height: 10,
            depth: 14,
            color: 0x4682B4, // Steel blue
            texture: metalTexture,
            roofColor: 0x708090, // Slate gray
            roofHeight: 0, // Flat roof
            windows: true,
            curved: true // Curved roof
        }
    };
    
    // Select the store type
    const storeConfig = storeTypes[type] || storeTypes.standard;
    
    // Create store body
    const { width, height, depth, color, texture, roofColor, roofHeight, windows, curved } = storeConfig;
    
    // Create store main body
    const storeGeometry = new THREE.BoxGeometry(width, height, depth);
    const storeMaterial = new THREE.MeshStandardMaterial({ 
        map: texture,
        color: color,
        roughness: 0.7,
        metalness: 0.2
    });
    
    const store = new THREE.Mesh(storeGeometry, storeMaterial);
    store.position.set(position.x, position.y + height / 2, position.z);
    store.castShadow = true;
    store.receiveShadow = true;
    storeGroup.add(store);
    
    // Add roof
    if (roofHeight > 0) {
        if (curved) {
            // Curved roof (like a warehouse)
            const roofGeometry = new THREE.CylinderGeometry(depth / 2, depth / 2, width, 32, 1, true, -Math.PI / 2, Math.PI);
            const roofMaterial = new THREE.MeshStandardMaterial({
                color: roofColor,
                roughness: 0.6,
                metalness: 0.3
            });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.rotation.z = Math.PI / 2;
            roof.position.set(position.x, position.y + height + depth / 4, position.z);
            roof.castShadow = true;
            roof.receiveShadow = true;
            storeGroup.add(roof);
        } else {
            // Regular sloped roof
            const roofGeometry = new THREE.ConeGeometry(
                Math.sqrt(width * width + depth * depth) / 2,
                roofHeight,
                4,
                1,
                false
            );
            const roofMaterial = new THREE.MeshStandardMaterial({
                color: roofColor,
                roughness: 0.6,
                metalness: 0.1
            });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.rotation.y = Math.PI / 4;
            roof.position.set(position.x, position.y + height + roofHeight / 2, position.z);
            roof.castShadow = true;
            roof.receiveShadow = true;
            storeGroup.add(roof);
        }
    }
    
    // Add windows if enabled
    if (windows) {
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x87CEEB, // Sky blue
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.9
        });
        
        // Front windows
        const frontWindowGeometry = new THREE.PlaneGeometry(width * 0.7, height * 0.4);
        const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
        frontWindow.position.set(position.x, position.y + height * 0.6, position.z + depth / 2 + 0.01);
        storeGroup.add(frontWindow);
        
        // Side windows
        const sideWindowGeometry = new THREE.PlaneGeometry(depth * 0.6, height * 0.3);
        const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
        leftWindow.rotation.y = Math.PI / 2;
        leftWindow.position.set(position.x - width / 2 - 0.01, position.y + height * 0.6, position.z);
        storeGroup.add(leftWindow);
    }
    
    // Create a simple text label for the store
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'Bold 60px Arial';
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, canvas.width / 2, canvas.height / 2);
    
    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const labelGeometry = new THREE.PlaneGeometry(5, 2);
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(
        position.x, 
        position.y + height + roofHeight + 1, 
        position.z
    );
    label.rotation.x = -Math.PI / 6; // Tilt the label for better visibility
    storeGroup.add(label);
    
    return storeGroup;
}

export function createAllStores() {
    const storesGroup = new THREE.Group();
    
    // Create different types of stores/warehouses at various positions
    const storeConfigs = [
        // Main warehouses along the center road
        { x: -80, y: 0, z: -20, name: 'A', type: 'warehouse' },
        { x: -30, y: 0, z: -20, name: 'B', type: 'standard' },
        { x: 20, y: 0, z: -20, name: 'C', type: 'industrial' },
        { x: 70, y: 0, z: -20, name: 'D', type: 'smallDepot' },
        
        // Warehouses on the other side of the road
        { x: -60, y: 0, z: 20, name: 'E', type: 'smallDepot' },
        { x: 20, y: 0, z: 20, name: 'F', type: 'standard' },
        { x: 50, y: 0, z: 20, name: 'G', type: 'warehouse' },
        
        // Buildings at the upper road
        { x: -30, y: 0, z: -65, name: 'H', type: 'industrial' },
        { x: 30, y: 0, z: -60, name: 'I', type: 'standard' },
        
        // Buildings at the lower road
        { x: -40, y: 0, z: 65, name: 'J', type: 'warehouse' },
        { x: 20, y: 0, z: 60, name: 'K', type: 'smallDepot' }
    ];
    
    storeConfigs.forEach(config => {
        const store = createStore(
            { x: config.x, y: config.y, z: config.z },
            config.name,
            config.type
        );
        storesGroup.add(store);
    });
    
    return storesGroup;
} 