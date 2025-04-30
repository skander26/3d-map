import * as THREE from 'three';
import { setupScene, setupCamera, setupRenderer, setupLights, setupControls } from './scene.js';
import { createRoad } from './road.js';
import { createAllStores } from './store.js';
import { createForklift, createAnimationPath, createStorage } from './forklift.js';
import { WaypointEditor } from './waypointEditor.js';

// State variables
let scene, camera, renderer, controls;
let forklift, curve;
let animationProgress = 0;
let direction = 1; // 1 for forward, -1 for reverse
let isPaused = false;
let pauseTimer = 0;
let pauseDuration = 2; // Pause duration in seconds
let lastTimestamp = 0;
let currentWaypointIndex = 0;
let movingToNextWaypoint = true;
let waypointEditor = null;
let isEditMode = false;
let savedOriginalCurve = null;

// Camera state for restoring after edit mode
let savedCameraPosition = null;
let savedCameraRotation = null;
let savedControlsEnabled = true;

// Constants
const ANIMATION_SPEED = 0.05; // Slower speed for more realistic movement
const PAUSE_WAYPOINTS = [0, 1, 8]; // Indices of waypoints where forklift should pause

// Initialize the scene
function init() {
    try {
        // Get the container
        const container = document.body;
        
        // Setup the scene, camera, renderer, and lights
        scene = setupScene();
        camera = setupCamera(container);
        renderer = setupRenderer(container);
        setupLights(scene);
        controls = setupControls(camera, renderer);
        
        // Create and add the road
        const road = createRoad();
        scene.add(road);
        
        // Create and add the stores
        const stores = createAllStores();
        scene.add(stores);
        
        // Create and add storage elements (shelves, pallets, containers, trucks)
        const storage = createStorage();
        scene.add(storage);
        
        // Add a ground grid for visual reference (optional)
        const gridHelper = new THREE.GridHelper(200, 50, 0x555555, 0x333333);
        gridHelper.position.y = 0.01;
        scene.add(gridHelper);
        
        // Create and add the forklift
        forklift = createForklift();
        scene.add(forklift);
        
        // Create the animation path
        curve = createAnimationPath();
        savedOriginalCurve = curve.clone();
        
        // Visualize the path (for debugging, can be removed later)
        visualizePath();
        
        // Create UI controls for the waypoint editor
        createUI();
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        // Start the animation loop
        animate(0);
        
        console.log("Scene initialized successfully");
    } catch (error) {
        console.error("Error initializing scene:", error);
        // Try to show a basic error message on the screen
        document.body.innerHTML = `
            <div style="color: red; padding: 20px;">
                <h2>Error initializing 3D scene</h2>
                <p>Please check the console for details.</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }
}

// Create UI controls for the waypoint editor
function createUI() {
    try {
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'absolute';
        uiContainer.style.top = '10px';
        uiContainer.style.left = '10px';
        uiContainer.style.zIndex = '1000';
        uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        uiContainer.style.padding = '10px';
        uiContainer.style.borderRadius = '5px';
        uiContainer.style.color = 'white';
        uiContainer.style.fontFamily = 'Arial, sans-serif';
        
        const title = document.createElement('h3');
        title.textContent = 'Waypoint Editor';
        title.style.margin = '0 0 10px 0';
        uiContainer.appendChild(title);
        
        // Edit mode toggle button
        const editButton = document.createElement('button');
        editButton.textContent = 'Enable Edit Mode';
        editButton.style.display = 'block';
        editButton.style.margin = '5px 0';
        editButton.style.padding = '5px 10px';
        editButton.style.backgroundColor = '#4CAF50';
        editButton.style.border = 'none';
        editButton.style.color = 'white';
        editButton.style.borderRadius = '3px';
        editButton.style.cursor = 'pointer';
        editButton.addEventListener('click', toggleEditMode);
        uiContainer.appendChild(editButton);
        
        // Add waypoint button
        const addButton = document.createElement('button');
        addButton.textContent = 'Add Waypoint';
        addButton.style.display = 'none'; // Initially hidden
        addButton.style.margin = '5px 0';
        addButton.style.padding = '5px 10px';
        addButton.style.backgroundColor = '#2196F3';
        addButton.style.border = 'none';
        addButton.style.color = 'white';
        addButton.style.borderRadius = '3px';
        addButton.style.cursor = 'pointer';
        addButton.addEventListener('click', addWaypoint);
        uiContainer.appendChild(addButton);
        
        // Remove waypoint button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove Waypoint';
        removeButton.style.display = 'none'; // Initially hidden
        removeButton.style.margin = '5px 0';
        removeButton.style.padding = '5px 10px';
        removeButton.style.backgroundColor = '#f44336';
        removeButton.style.border = 'none';
        removeButton.style.color = 'white';
        removeButton.style.borderRadius = '3px';
        removeButton.style.cursor = 'pointer';
        removeButton.addEventListener('click', removeWaypoint);
        uiContainer.appendChild(removeButton);
        
        // Save changes button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Changes';
        saveButton.style.display = 'none'; // Initially hidden
        saveButton.style.margin = '5px 0';
        saveButton.style.padding = '5px 10px';
        saveButton.style.backgroundColor = '#FF9800';
        saveButton.style.border = 'none';
        saveButton.style.color = 'white';
        saveButton.style.borderRadius = '3px';
        saveButton.style.cursor = 'pointer';
        saveButton.addEventListener('click', saveChanges);
        uiContainer.appendChild(saveButton);
        
        // Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.display = 'none'; // Initially hidden
        cancelButton.style.margin = '5px 0';
        cancelButton.style.padding = '5px 10px';
        cancelButton.style.backgroundColor = '#9E9E9E';
        cancelButton.style.border = 'none';
        cancelButton.style.color = 'white';
        cancelButton.style.borderRadius = '3px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.addEventListener('click', cancelChanges);
        uiContainer.appendChild(cancelButton);
        
        // Instructions
        const instructions = document.createElement('p');
        instructions.textContent = 'Click and drag the yellow waypoints to move them.';
        instructions.style.fontSize = '12px';
        instructions.style.margin = '10px 0 0 0';
        instructions.style.display = 'none'; // Initially hidden
        uiContainer.appendChild(instructions);
        
        // Store references to buttons for toggling visibility
        uiContainer.editButton = editButton;
        uiContainer.addButton = addButton;
        uiContainer.removeButton = removeButton;
        uiContainer.saveButton = saveButton;
        uiContainer.cancelButton = cancelButton;
        uiContainer.instructions = instructions;
        
        document.body.appendChild(uiContainer);
        
        // Store the UI container reference for later use
        window.uiContainer = uiContainer;
    } catch (error) {
        console.error("Error creating UI:", error);
    }
}

// Set camera to top-down view
function setCameraToTopView() {
    if (!camera || !controls) return;
    
    try {
        // Save current camera position and rotation for later restoration
        savedCameraPosition = camera.position.clone();
        savedCameraRotation = camera.rotation.clone();
        savedControlsEnabled = controls.enabled;
        
        // Move camera to top view (high above the scene looking down)
        camera.position.set(0, 150, 0);
        camera.lookAt(0, 0, 0);
        
        // Disable orbit controls to prevent camera movement
        controls.enabled = false;
    } catch (error) {
        console.error("Error setting camera to top view:", error);
    }
}

// Restore camera to original position
function restoreCamera() {
    if (!camera || !controls) return;
    
    try {
        if (savedCameraPosition && savedCameraRotation) {
            // Restore the saved camera position and rotation
            camera.position.copy(savedCameraPosition);
            camera.rotation.copy(savedCameraRotation);
        } else {
            // Fallback to a default position if no saved position
            camera.position.set(80, 80, 80);
            camera.lookAt(0, 0, 0);
        }
        
        // Restore controls to their original state
        controls.enabled = savedControlsEnabled;
    } catch (error) {
        console.error("Error restoring camera:", error);
    }
}

// Toggle edit mode
function toggleEditMode() {
    try {
        isEditMode = !isEditMode;
        
        if (isEditMode) {
            // Enable edit mode
            window.uiContainer.editButton.textContent = 'Disable Edit Mode';
            window.uiContainer.editButton.style.backgroundColor = '#f44336';
            window.uiContainer.addButton.style.display = 'block';
            window.uiContainer.removeButton.style.display = 'block';
            window.uiContainer.saveButton.style.display = 'block';
            window.uiContainer.cancelButton.style.display = 'block';
            window.uiContainer.instructions.style.display = 'block';
            
            // Change to top-down view and disable camera movement
            setCameraToTopView();
            
            // Create the waypoint editor
            if (waypointEditor) {
                waypointEditor.dispose();
            }
            waypointEditor = new WaypointEditor(scene, camera, renderer, forklift);
        } else {
            // Disable edit mode
            window.uiContainer.editButton.textContent = 'Enable Edit Mode';
            window.uiContainer.editButton.style.backgroundColor = '#4CAF50';
            window.uiContainer.addButton.style.display = 'none';
            window.uiContainer.removeButton.style.display = 'none';
            window.uiContainer.saveButton.style.display = 'none';
            window.uiContainer.cancelButton.style.display = 'none';
            window.uiContainer.instructions.style.display = 'none';
            
            // Restore camera to original position and enable controls
            restoreCamera();
            
            // Cleanup the editor
            if (waypointEditor) {
                waypointEditor.dispose();
                waypointEditor = null;
            }
            
            // Restore the original path visualization
            visualizePath();
        }
    } catch (error) {
        console.error("Error toggling edit mode:", error);
        // Reset to safe state
        isEditMode = false;
        if (window.uiContainer) {
            window.uiContainer.editButton.textContent = 'Enable Edit Mode';
            window.uiContainer.editButton.style.backgroundColor = '#4CAF50';
            window.uiContainer.addButton.style.display = 'none';
            window.uiContainer.removeButton.style.display = 'none';
            window.uiContainer.saveButton.style.display = 'none';
            window.uiContainer.cancelButton.style.display = 'none';
            window.uiContainer.instructions.style.display = 'none';
        }
        restoreCamera();
    }
}

// Add a new waypoint
function addWaypoint() {
    try {
        if (waypointEditor) {
            waypointEditor.addWaypoint();
        }
    } catch (error) {
        console.error("Error adding waypoint:", error);
    }
}

// Remove the selected waypoint
function removeWaypoint() {
    try {
        if (waypointEditor) {
            waypointEditor.removeWaypoint();
        }
    } catch (error) {
        console.error("Error removing waypoint:", error);
    }
}

// Save the changes to the path
function saveChanges() {
    try {
        if (waypointEditor) {
            // Get the updated curve
            const newCurve = waypointEditor.getCurve();
            
            if (newCurve) {
                curve = newCurve;
                
                // Update the path visualization
                visualizePath();
                
                // Exit edit mode
                toggleEditMode();
                
                // Show success message
                alert('Path updated successfully!');
            } else {
                console.error("Failed to get updated curve from editor");
                alert('Failed to update path. Please try again.');
            }
        }
    } catch (error) {
        console.error("Error saving changes:", error);
        alert('An error occurred while saving changes. Please try again.');
    }
}

// Cancel changes and revert to the original path
function cancelChanges() {
    try {
        // Restore the original curve
        if (savedOriginalCurve) {
            curve = savedOriginalCurve.clone();
        } else {
            // If no saved curve, create a new one
            curve = createAnimationPath();
        }
        
        // Exit edit mode
        toggleEditMode();
        
        // Restore the original path visualization
        visualizePath();
    } catch (error) {
        console.error("Error canceling changes:", error);
        alert('An error occurred while canceling changes. Please try again.');
    }
}

// Visualize the path with points and a line
function visualizePath() {
    try {
        if (!scene || !curve) return;
        
        // Remove any existing path visualization
        const pathObjects = scene.children.filter(obj => 
            obj.name === 'pathLine' || obj.name === 'pathPoint'
        );
        
        pathObjects.forEach(obj => scene.remove(obj));
        
        // Create a new path visualization
        const points = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const curveObject = new THREE.Line(geometry, material);
        curveObject.position.y = 0.1; // Slightly above ground
        curveObject.name = 'pathLine';
        scene.add(curveObject);
        
        // Add small spheres at each waypoint for visualization
        if (!isEditMode) { // Only add small markers when not in edit mode
            const waypointMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const waypointGeometry = new THREE.SphereGeometry(0.5, 8, 8);
            
            points.forEach((point, index) => {
                if (index % 10 === 0) { // Only add spheres at some points to avoid clutter
                    const waypoint = new THREE.Mesh(waypointGeometry, waypointMaterial);
                    waypoint.position.copy(point);
                    waypoint.position.y = 0.5; // Position above ground
                    waypoint.name = 'pathPoint';
                    scene.add(waypoint);
                }
            });
        }
    } catch (error) {
        console.error("Error visualizing path:", error);
    }
}

// Handle window resize
function onWindowResize() {
    try {
        const container = document.body;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    } catch (error) {
        console.error("Error handling window resize:", error);
    }
}

// Animation function
function animate(timestamp) {
    requestAnimationFrame(animate);
    
    try {
        // Calculate delta time
        const deltaTime = lastTimestamp > 0 ? (timestamp - lastTimestamp) / 1000 : 0.016; // Convert to seconds
        lastTimestamp = timestamp;
        
        // Update controls only when not in edit mode or when controls are enabled
        if (controls && controls.enabled) {
            controls.update();
        }
        
        // Update forklift movement only when not in edit mode
        if (!isEditMode && forklift && curve) {
            updateForklift(deltaTime);
        }
        
        // Render the scene
        if (scene && camera && renderer) {
            renderer.render(scene, camera);
        }
    } catch (error) {
        console.error("Error in animation loop:", error);
    }
}

// Update forklift position and rotation based on curve
function updateForklift(deltaTime) {
    if (!forklift || !curve) return;
    
    try {
        // If paused at a waypoint, handle the pause timer
        if (isPaused) {
            pauseTimer += deltaTime;
            
            // Resume movement after pause duration
            if (pauseTimer >= pauseDuration) {
                isPaused = false;
                pauseTimer = 0;
                movingToNextWaypoint = true;
            }
            return;
        }
        
        // Calculate new position on the curve
        const speed = ANIMATION_SPEED * deltaTime;
        animationProgress += speed * direction;
        
        // Normalize progress to [0, 1] range
        if (animationProgress > 1) {
            animationProgress = 0;
            direction = 1; // Reset to forward direction when loop completes
        } else if (animationProgress < 0) {
            animationProgress = 1;
            direction = -1; // Should not get here normally, but just in case
        }
        
        // Get position on the curve
        const position = curve.getPoint(animationProgress);
        
        // Position the forklift
        forklift.position.copy(position);
        
        // Rotate forklift to face the direction of movement
        const tangent = curve.getTangent(animationProgress);
        const angle = Math.atan2(tangent.x, tangent.z);
        
        // Flip the angle when going in reverse
        forklift.rotation.y = angle;
        
        // Check if we've reached specific waypoints where we should pause
        checkWaypointArrival();
    } catch (error) {
        console.error("Error updating forklift:", error);
    }
}

// Check if the forklift has reached a waypoint where it should pause
function checkWaypointArrival() {
    if (!movingToNextWaypoint) return;
    
    try {
        // Map animationProgress to waypoint indices
        const totalWaypoints = 16; // Based on the number of waypoints in the curve
        const waypointIndex = Math.floor(animationProgress * totalWaypoints);
        
        // Check if we should pause at this waypoint
        if (PAUSE_WAYPOINTS.includes(waypointIndex) && waypointIndex !== currentWaypointIndex) {
            console.log(`Pausing at waypoint ${waypointIndex}`);
            isPaused = true;
            pauseTimer = 0;
            movingToNextWaypoint = false;
            currentWaypointIndex = waypointIndex;
        }
    } catch (error) {
        console.error("Error checking waypoint arrival:", error);
    }
}

// Export waypoint positions to JSON
function exportWaypoints() {
    try {
        if (waypointEditor) {
            const positions = waypointEditor.getWaypointPositions();
            const jsonString = JSON.stringify(positions, null, 2);
            
            // Create a download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'waypoints.json';
            a.click();
            
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error("Error exporting waypoints:", error);
        alert('Failed to export waypoints. Please try again.');
    }
}

// Initialize the scene
window.addEventListener('DOMContentLoaded', init);

// Make functions available globally for UI buttons
window.toggleEditMode = toggleEditMode;
window.addWaypoint = addWaypoint;
window.removeWaypoint = removeWaypoint;
window.saveChanges = saveChanges;
window.cancelChanges = cancelChanges;
window.exportWaypoints = exportWaypoints; 