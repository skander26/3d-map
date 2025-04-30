import * as THREE from 'three';

export function createForklift() {
    // Create a group to hold all parts of the forklift
    const forkliftGroup = new THREE.Group();
    
    // Create the main body of the forklift
    const bodyGeometry = new THREE.BoxGeometry(3, 2, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFA500 }); // Orange
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    body.receiveShadow = true;
    forkliftGroup.add(body);
    
    // Create the cabin
    const cabinGeometry = new THREE.BoxGeometry(1.5, 1, 1.8);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Dark gray
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0.75, 2, 0);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    forkliftGroup.add(cabin);
    
    // Create the fork base
    const forkBaseGeometry = new THREE.BoxGeometry(1.5, 0.5, 2);
    const forkBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 }); // Medium gray
    const forkBase = new THREE.Mesh(forkBaseGeometry, forkBaseMaterial);
    forkBase.position.set(-1.5, 0.5, 0);
    forkBase.castShadow = true;
    forkBase.receiveShadow = true;
    forkliftGroup.add(forkBase);
    
    // Create the forks
    const forkGeometry = new THREE.BoxGeometry(2, 0.2, 0.5);
    const forkMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 }); // Light gray
    
    const fork1 = new THREE.Mesh(forkGeometry, forkMaterial);
    fork1.position.set(-2.5, 0.5, 0.7);
    fork1.castShadow = true;
    fork1.receiveShadow = true;
    forkliftGroup.add(fork1);
    
    const fork2 = new THREE.Mesh(forkGeometry, forkMaterial);
    fork2.position.set(-2.5, 0.5, -0.7);
    fork2.castShadow = true;
    fork2.receiveShadow = true;
    forkliftGroup.add(fork2);
    
    // Create wheels (4 wheels)
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Black
    
    const createWheel = (x, z) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(x, 0.5, z);
        wheel.rotation.z = Math.PI / 2; // Rotate to align with forklift
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        return wheel;
    };
    
    const frontLeftWheel = createWheel(1, 1);
    const frontRightWheel = createWheel(1, -1);
    const backLeftWheel = createWheel(-1, 1);
    const backRightWheel = createWheel(-1, -1);
    
    forkliftGroup.add(frontLeftWheel, frontRightWheel, backLeftWheel, backRightWheel);
    
    // Position the forklift at the starting point (Store A)
    forkliftGroup.position.set(-80, 0, 0);
    
    return forkliftGroup;
}

export function createDeliveryTruck(color = 0x1E90FF) {
    const truckGroup = new THREE.Group();
    
    // Create truck cab
    const cabGeometry = new THREE.BoxGeometry(3, 3, 2.5);
    const cabMaterial = new THREE.MeshStandardMaterial({ color: color });
    const cab = new THREE.Mesh(cabGeometry, cabMaterial);
    cab.position.set(0, 1.5, 0);
    cab.castShadow = true;
    cab.receiveShadow = true;
    truckGroup.add(cab);
    
    // Create truck cargo area
    const cargoGeometry = new THREE.BoxGeometry(6, 3.5, 2.8);
    const cargoMaterial = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });
    const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
    cargo.position.set(-4.5, 1.75, 0);
    cargo.castShadow = true;
    cargo.receiveShadow = true;
    truckGroup.add(cargo);
    
    // Create windows for the cab
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0.9
    });
    
    const windshieldGeometry = new THREE.PlaneGeometry(2, 1.5);
    const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
    windshield.position.set(1.51, 2, 0);
    windshield.rotation.y = Math.PI / 2;
    truckGroup.add(windshield);
    
    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const createWheel = (x, z) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(x, 0.7, z);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        return wheel;
    };
    
    // Add front wheels
    const frontLeftWheel = createWheel(0, 1.5);
    const frontRightWheel = createWheel(0, -1.5);
    truckGroup.add(frontLeftWheel, frontRightWheel);
    
    // Add back wheels
    const backLeftWheel1 = createWheel(-5, 1.5);
    const backRightWheel1 = createWheel(-5, -1.5);
    const backLeftWheel2 = createWheel(-7, 1.5);
    const backRightWheel2 = createWheel(-7, -1.5);
    truckGroup.add(backLeftWheel1, backRightWheel1, backLeftWheel2, backRightWheel2);
    
    // Add text (e.g., "DELIVERY") to the cargo area
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'Bold 70px Arial';
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('DELIVERY', canvas.width / 2, canvas.height / 2);
    
    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true
    });
    
    const labelGeometry = new THREE.PlaneGeometry(5, 1.2);
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(-4.5, 2, 1.41);
    truckGroup.add(label);
    
    return truckGroup;
}

export function createShippingContainer(color = 0xFF4500) {
    const containerGroup = new THREE.Group();
    
    // Create the container body
    const containerGeometry = new THREE.BoxGeometry(6, 2.8, 2.5);
    const containerMaterial = new THREE.MeshStandardMaterial({ color: color });
    const container = new THREE.Mesh(containerGeometry, containerMaterial);
    container.position.y = 1.4;
    container.castShadow = true;
    container.receiveShadow = true;
    containerGroup.add(container);
    
    // Add ridges to container (for realism)
    const ridgeGeometry = new THREE.BoxGeometry(6, 0.1, 2.5);
    const ridgeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const topRidge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
    topRidge.position.y = 2.8;
    containerGroup.add(topRidge);
    
    // Add container logo
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'Bold 40px Arial';
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('SHIPPING', canvas.width / 2, canvas.height / 2 - 30);
    context.fillText('CO.', canvas.width / 2, canvas.height / 2 + 30);
    
    const logoTexture = new THREE.CanvasTexture(canvas);
    const logoMaterial = new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true
    });
    
    const logoGeometry = new THREE.PlaneGeometry(2, 2);
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0, 1.4, 1.26);
    containerGroup.add(logo);
    
    return containerGroup;
}

export function createPallet(withBoxes = true) {
    const palletGroup = new THREE.Group();
    
    // Create the pallet base
    const baseGeometry = new THREE.BoxGeometry(1.6, 0.2, 1.6);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1;
    base.castShadow = true;
    base.receiveShadow = true;
    palletGroup.add(base);
    
    // Add pallet supports
    const supportGeometry = new THREE.BoxGeometry(0.2, 0.2, 1.6);
    
    for (let i = -1; i <= 1; i += 2) {
        const support = new THREE.Mesh(supportGeometry, baseMaterial);
        support.position.set(i * 0.6, 0.2, 0);
        support.castShadow = true;
        support.receiveShadow = true;
        palletGroup.add(support);
    }
    
    // Optionally add boxes on the pallet
    if (withBoxes) {
        const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C }); // Tan
        
        // Create a group of boxes with slightly different sizes
        const sizes = [
            { width: 1.2, height: 0.8, depth: 1.2 },
            { width: 1.0, height: 0.7, depth: 1.0 },
            { width: 0.9, height: 0.6, depth: 0.9 }
        ];
        
        let currentHeight = 0.3; // Starting height above pallet
        
        sizes.forEach(size => {
            const boxGeometry = new THREE.BoxGeometry(
                size.width, size.height, size.depth
            );
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.y = currentHeight + size.height / 2;
            box.castShadow = true;
            box.receiveShadow = true;
            palletGroup.add(box);
            
            currentHeight += size.height;
        });
    }
    
    return palletGroup;
}

export function createStorageRack() {
    const rackGroup = new THREE.Group();
    
    // Create the rack frame
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    
    // Vertical supports
    const supportGeometry = new THREE.BoxGeometry(0.3, 6, 0.3);
    
    // Create four corner supports
    for (let x = -2; x <= 2; x += 4) {
        for (let z = -1; z <= 1; z += 2) {
            const support = new THREE.Mesh(supportGeometry, frameMaterial);
            support.position.set(x, 3, z);
            support.castShadow = true;
            support.receiveShadow = true;
            rackGroup.add(support);
        }
    }
    
    // Horizontal shelves
    const shelfGeometry = new THREE.BoxGeometry(4.5, 0.1, 2.5);
    const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });
    
    // Create shelves at different heights
    for (let y = 0.5; y <= 5.5; y += 1.5) {
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(0, y, 0);
        shelf.receiveShadow = true;
        rackGroup.add(shelf);
        
        // Add boxes on shelves
        if (y !== 5.5) { // Skip boxes on top shelf
            for (let x = -1.5; x <= 1.5; x += 1.5) {
                const boxSize = 0.8 + Math.random() * 0.4;
                const boxHeight = 0.6 + Math.random() * 0.3;
                
                const boxGeometry = new THREE.BoxGeometry(boxSize, boxHeight, boxSize);
                const boxColor = [0xD2B48C, 0xA0522D, 0xDEB887][Math.floor(Math.random() * 3)];
                const boxMaterial = new THREE.MeshStandardMaterial({ color: boxColor });
                const box = new THREE.Mesh(boxGeometry, boxMaterial);
                
                box.position.set(x, y + boxHeight/2 + 0.1, 0);
                box.castShadow = true;
                box.receiveShadow = true;
                rackGroup.add(box);
            }
        }
    }
    
    return rackGroup;
}

export function createWorker() {
    const workerGroup = new THREE.Group();
    
    // Create body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF }); // Blue jumpsuit
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    body.receiveShadow = true;
    workerGroup.add(body);
    
    // Create head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // Safety helmet
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    head.receiveShadow = true;
    workerGroup.add(head);
    
    // Create arms
    const armGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(0, 1, 0.4);
    leftArm.rotation.x = -Math.PI / 4;
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    workerGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0, 1, -0.4);
    rightArm.rotation.x = Math.PI / 4;
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    workerGroup.add(rightArm);
    
    // Create legs
    const legGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.15);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(0, 0.3, 0.15);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    workerGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0, 0.3, -0.15);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    workerGroup.add(rightLeg);
    
    return workerGroup;
}

export function createStorage() {
    const storageGroup = new THREE.Group();
    
    // Create organized zones for different storage areas
    
    // ZONE 1: Main warehouse storage area (Northeast quadrant)
    const storageRackPositions1 = [
        { x: 40, z: -35, rotation: 0 },
        { x: 40, z: -40, rotation: 0 },
        { x: 50, z: -35, rotation: 0 },
        { x: 50, z: -40, rotation: 0 }
    ];
    
    storageRackPositions1.forEach(pos => {
        const rack = createStorageRack();
        rack.position.set(pos.x, 0, pos.z);
        rack.rotation.y = pos.rotation;
        storageGroup.add(rack);
    });
    
    // ZONE 2: Shipping container staging area (Northwest quadrant)
    const containerPositions = [
        { x: -70, z: -30, color: 0xFF4500, rotation: 0 },  // Red-orange
        { x: -60, z: -30, color: 0x4682B4, rotation: 0 },  // Steel blue
        { x: -70, z: -35, color: 0xFFD700, rotation: 0 },  // Gold
        { x: -60, z: -35, color: 0x228B22, rotation: 0 },  // Forest green
        
        // Stacked containers (second layer)
        { x: -70, z: -30, color: 0x4682B4, rotation: 0, y: 2.9 },
        { x: -60, z: -30, color: 0xFF4500, rotation: 0, y: 2.9 }
    ];
    
    containerPositions.forEach(pos => {
        const container = createShippingContainer(pos.color);
        container.position.set(pos.x, pos.y || 0, pos.z);
        container.rotation.y = pos.rotation;
        storageGroup.add(container);
    });
    
    // ZONE 3: Receiving area with trucks and pallets (Southwest quadrant)
    const truckPositions = [
        { x: -60, z: 30, color: 0x1E90FF, rotation: Math.PI / 2 },  // Facing south
        { x: -40, z: 40, color: 0xFF6347, rotation: Math.PI }       // Facing west
    ];
    
    truckPositions.forEach(pos => {
        const truck = createDeliveryTruck(pos.color);
        truck.position.set(pos.x, 0, pos.z);
        truck.rotation.y = pos.rotation;
        storageGroup.add(truck);
    });
    
    // ZONE 4: Pallet staging area (organized grid)
    // Create a 4x4 grid of pallets in the southeast quadrant
    for (let x = 0; x < 4; x++) {
        for (let z = 0; z < 4; z++) {
            const pallet = createPallet(true);
            pallet.position.set(50 + x * 4, 0, 30 + z * 4);
            storageGroup.add(pallet);
        }
    }
    
    // ZONE 5: Loading dock with pallets (South area)
    const loadingDockPallets = [
        { x: -10, z: 25, withBoxes: true },
        { x: -5, z: 25, withBoxes: true },
        { x: 0, z: 25, withBoxes: false },
        { x: 5, z: 25, withBoxes: true },
        { x: 10, z: 25, withBoxes: false }
    ];
    
    loadingDockPallets.forEach(pos => {
        const pallet = createPallet(pos.withBoxes);
        pallet.position.set(pos.x, 0, pos.z);
        storageGroup.add(pallet);
    });
    
    // ZONE 6: Rack storage area (North area)
    const northStorageRacks = [
        { x: -40, z: -40, rotation: 0 },
        { x: -30, z: -40, rotation: 0 },
        { x: -20, z: -40, rotation: 0 },
        { x: -10, z: -40, rotation: 0 }
    ];
    
    northStorageRacks.forEach(pos => {
        const rack = createStorageRack();
        rack.position.set(pos.x, 0, pos.z);
        rack.rotation.y = pos.rotation;
        storageGroup.add(rack);
    });
    
    // ZONE 7: Add workers throughout the facility
    const workerPositions = [
        { x: -63, z: 26, rotation: 0 },     // Near truck loading
        { x: 40, z: -38, rotation: Math.PI/4 }, // In storage area
        { x: -65, z: -33, rotation: Math.PI/2 }, // By containers
        { x: -3, z: 25, rotation: -Math.PI/4 },  // At loading dock
        { x: 54, z: 34, rotation: 0 },      // In pallet area
        { x: 10, z: -35, rotation: Math.PI }, // Walking on road
        { x: -40, z: 0, rotation: Math.PI/2 }   // On main road
    ];
    
    workerPositions.forEach(pos => {
        const worker = createWorker();
        worker.position.set(pos.x, 0, pos.z);
        worker.rotation.y = pos.rotation;
        storageGroup.add(worker);
    });
    
    // Add parking zone markers
    function createGroundMarker(x, z, width, height, color) {
        const markerGeometry = new THREE.PlaneGeometry(width, height);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(x, 0.02, z);
        return marker;
    }
    
    // Container zone marker
    const containerZoneMarker = createGroundMarker(-65, -32.5, 20, 10, 0xFF4500);
    storageGroup.add(containerZoneMarker);
    
    // Pallet zone marker
    const palletZoneMarker = createGroundMarker(54, 34, 20, 20, 0x4682B4);
    storageGroup.add(palletZoneMarker);
    
    // Loading dock marker
    const loadingMarker = createGroundMarker(0, 25, 30, 5, 0xFFD700);
    storageGroup.add(loadingMarker);
    
    // Truck parking area
    const truckMarker = createGroundMarker(-50, 35, 25, 15, 0x32CD32);
    storageGroup.add(truckMarker);
    
    return storageGroup;
}

export function createAnimationPath() {
    // Create an expanded set of waypoints for a more complex path
    const waypoints = [
        new THREE.Vector3(-80, 1, 0),  // Start at Store A
        new THREE.Vector3(-30, 1, 0),  // Store B
        new THREE.Vector3(-10, 1, 0),  // Approaching intersection
        new THREE.Vector3(0, 1, -10),  // Turn north at intersection
        new THREE.Vector3(0, 1, -30),  // Moving north
        new THREE.Vector3(20, 1, -30), // Moving east
        new THREE.Vector3(20, 1, 0),   // Back to main road
        new THREE.Vector3(40, 1, 0),   // Continue east
        new THREE.Vector3(70, 1, 0),   // Store D
        new THREE.Vector3(40, 1, 0),   // Back west
        new THREE.Vector3(20, 1, 0),   // Continue west
        new THREE.Vector3(0, 1, 0),    // At intersection
        new THREE.Vector3(0, 1, 30),   // Turn south
        new THREE.Vector3(-30, 1, 30), // Moving west on south road
        new THREE.Vector3(-60, 1, 30), // End of south road
        new THREE.Vector3(-60, 1, 0),  // Back to main road
    ];
    
    // Create a closed curve that follows the waypoints
    const curve = new THREE.CatmullRomCurve3(waypoints);
    curve.closed = true;
    
    return curve;
} 