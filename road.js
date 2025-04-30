import * as THREE from 'three';

export function createRoad() {
    // Create a group to hold all road segments
    const roadGroup = new THREE.Group();
    
    // Load asphalt texture
    const textureLoader = new THREE.TextureLoader();
    const asphaltTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
    asphaltTexture.wrapS = THREE.RepeatWrapping;
    asphaltTexture.wrapT = THREE.RepeatWrapping;
    asphaltTexture.repeat.set(5, 1);
    
    // Create material for roads
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        map: asphaltTexture,
        color: 0x666666,
        roughness: 0.8,
        metalness: 0.2
    });
    
    // Create road markings material
    const markingsMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    // Create main horizontal road (X axis)
    const mainRoadGeometry = new THREE.PlaneGeometry(200, 20);
    const mainRoad = new THREE.Mesh(mainRoadGeometry, roadMaterial);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.y = 0.01;
    mainRoad.receiveShadow = true;
    roadGroup.add(mainRoad);
    
    // Create central vertical road (Z axis)
    const verticalRoadGeometry = new THREE.PlaneGeometry(20, 200);
    const verticalRoad = new THREE.Mesh(verticalRoadGeometry, roadMaterial);
    verticalRoad.rotation.x = -Math.PI / 2;
    verticalRoad.position.y = 0.01;
    verticalRoad.receiveShadow = true;
    roadGroup.add(verticalRoad);
    
    // Create secondary horizontal roads
    const secondaryRoadGeometry = new THREE.PlaneGeometry(100, 15);
    
    // Upper secondary road
    const upperRoad = new THREE.Mesh(secondaryRoadGeometry, roadMaterial);
    upperRoad.rotation.x = -Math.PI / 2;
    upperRoad.position.set(0, 0.01, -50);
    upperRoad.receiveShadow = true;
    roadGroup.add(upperRoad);
    
    // Lower secondary road
    const lowerRoad = new THREE.Mesh(secondaryRoadGeometry, roadMaterial);
    lowerRoad.rotation.x = -Math.PI / 2;
    lowerRoad.position.set(0, 0.01, 50);
    lowerRoad.receiveShadow = true;
    roadGroup.add(lowerRoad);
    
    // Add road markings (white lines) to main road
    function createRoadMarking(width, height, x, z, isVertical = false) {
        const markingGeometry = new THREE.PlaneGeometry(width, height);
        const marking = new THREE.Mesh(markingGeometry, markingsMaterial);
        marking.rotation.x = -Math.PI / 2;
        marking.position.set(x, 0.02, z); // Slightly above the road
        marking.receiveShadow = false;
        return marking;
    }
    
    // Add center lines to main horizontal road
    for (let x = -90; x <= 90; x += 10) {
        const marking = createRoadMarking(5, 0.5, x, 0);
        roadGroup.add(marking);
    }
    
    // Add center lines to vertical road
    for (let z = -90; z <= 90; z += 10) {
        const marking = createRoadMarking(0.5, 5, 0, z, true);
        roadGroup.add(marking);
    }
    
    // Add border lines to main roads
    const mainBorderTop = createRoadMarking(200, 0.5, 0, -10);
    const mainBorderBottom = createRoadMarking(200, 0.5, 0, 10);
    const verticalBorderLeft = createRoadMarking(0.5, 200, -10, 0);
    const verticalBorderRight = createRoadMarking(0.5, 200, 10, 0);
    
    roadGroup.add(mainBorderTop);
    roadGroup.add(mainBorderBottom);
    roadGroup.add(verticalBorderLeft);
    roadGroup.add(verticalBorderRight);
    
    return roadGroup;
} 