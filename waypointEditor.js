import * as THREE from 'three';
import { createAnimationPath } from './forklift.js';

class WaypointEditor {
    constructor(scene, camera, renderer, forklift) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.forklift = forklift;
        this.waypoints = [];
        this.waypoint3DObjects = [];
        this.selectedWaypoint = null;
        this.isDragging = false;
        this.curve = null;
        this.pathLine = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Create a horizontal plane at Y=0 for waypoint dragging (XZ plane)
        this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.dragPoint = new THREE.Vector3();
        
        // Fixed height for all waypoints
        this.waypointHeight = 1;
        
        // Create initial waypoints from the animation path
        try {
            this.initializeFromPath();
            
            // Set up event listeners
            this.setupEventListeners();
        } catch (error) {
            console.error("Error initializing waypoint editor:", error);
        }
    }
    
    initializeFromPath() {
        // Get the original curve
        try {
            this.curve = createAnimationPath();
            
            // Extract waypoints from the curve
            const originalPoints = this.curve.points;
            
            // Clear any existing waypoints
            this.clearWaypoints();
            
            // Create visual waypoints from the curve points
            if (originalPoints && originalPoints.length > 0) {
                originalPoints.forEach(point => {
                    this.createWaypoint(point.x, this.waypointHeight, point.z);
                });
                
                // Create the visual path
                this.updatePathLine();
            } else {
                console.warn("No points found in animation path");
                // Create default waypoints if none exist
                this.createDefaultWaypoints();
            }
        } catch (error) {
            console.error("Error initializing path:", error);
            // Create default waypoints as fallback
            this.createDefaultWaypoints();
        }
    }
    
    createDefaultWaypoints() {
        // Create some default waypoints in a simple rectangle
        this.createWaypoint(-50, this.waypointHeight, -50);
        this.createWaypoint(50, this.waypointHeight, -50);
        this.createWaypoint(50, this.waypointHeight, 50);
        this.createWaypoint(-50, this.waypointHeight, 50);
        this.updatePathLine();
    }
    
    clearWaypoints() {
        // Remove all waypoint objects from the scene
        this.waypoint3DObjects.forEach(obj => {
            if (obj && this.scene) {
                this.scene.remove(obj);
            }
        });
        
        this.waypoints = [];
        this.waypoint3DObjects = [];
        
        // Remove the path line if it exists
        if (this.pathLine && this.scene) {
            this.scene.remove(this.pathLine);
            this.pathLine = null;
        }
    }
    
    createWaypoint(x, y, z) {
        if (!this.scene) return null;
        
        // Create a visual representation of the waypoint
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.7,
        });
        
        const waypointObj = new THREE.Mesh(geometry, material);
        // Make sure Y position is fixed at the waypoint height
        waypointObj.position.set(x, this.waypointHeight, z);
        this.scene.add(waypointObj);
        
        // Store the waypoint data
        const waypoint = {
            position: new THREE.Vector3(x, this.waypointHeight, z),
            object: waypointObj,
            index: this.waypoints.length
        };
        
        this.waypoints.push(waypoint);
        this.waypoint3DObjects.push(waypointObj);
        
        return waypoint;
    }
    
    updatePathLine() {
        if (!this.scene || this.waypoints.length < 2) return;
        
        // Remove existing path line
        if (this.pathLine) {
            this.scene.remove(this.pathLine);
        }
        
        try {
            // Create a new curve from the waypoints
            const points = this.waypoints.map(wp => wp.position);
            this.curve = new THREE.CatmullRomCurve3(points);
            this.curve.closed = true;
            
            // Create a visual representation of the path
            const curvePoints = this.curve.getPoints(100);
            const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
            const material = new THREE.LineBasicMaterial({ 
                color: 0xff0000,
                linewidth: 2 
            });
            
            this.pathLine = new THREE.Line(geometry, material);
            this.pathLine.position.y = 0.1; // Slightly above ground
            this.scene.add(this.pathLine);
        } catch (error) {
            console.error("Error updating path line:", error);
        }
    }
    
    setupEventListeners() {
        if (!this.renderer || !this.renderer.domElement) {
            console.error("Renderer not available for event listeners");
            return;
        }

        // Mouse move event
        const onMouseMove = (event) => {
            if (!this.renderer || !this.renderer.domElement) return;
            
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            if (this.isDragging && this.selectedWaypoint) {
                this.moveWaypoint();
            } else {
                this.highlightWaypoint();
            }
        };
        
        // Mouse down event
        const onMouseDown = () => {
            if (this.selectedWaypoint) {
                this.isDragging = true;
                document.body.style.cursor = 'grabbing';
            }
        };
        
        // Mouse up event
        const onMouseUp = () => {
            this.isDragging = false;
            document.body.style.cursor = 'auto';
        };
        
        try {
            // Add event listeners
            this.renderer.domElement.addEventListener('mousemove', onMouseMove);
            this.renderer.domElement.addEventListener('mousedown', onMouseDown);
            this.renderer.domElement.addEventListener('mouseup', onMouseUp);
            
            // Store references to remove later if needed
            this._eventListeners = {
                mousemove: onMouseMove,
                mousedown: onMouseDown,
                mouseup: onMouseUp
            };
        } catch (error) {
            console.error("Error setting up event listeners:", error);
        }
    }
    
    removeEventListeners() {
        if (this._eventListeners && this.renderer && this.renderer.domElement) {
            this.renderer.domElement.removeEventListener('mousemove', this._eventListeners.mousemove);
            this.renderer.domElement.removeEventListener('mousedown', this._eventListeners.mousedown);
            this.renderer.domElement.removeEventListener('mouseup', this._eventListeners.mouseup);
        }
    }
    
    highlightWaypoint() {
        if (!this.camera || !this.raycaster || this.waypoint3DObjects.length === 0) return;
        
        try {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.waypoint3DObjects);
            
            // Reset all waypoints to default color
            this.waypoint3DObjects.forEach(obj => {
                if (obj && obj.material) {
                    obj.material.color.set(0xffff00);
                }
            });
            
            // Set cursor style
            document.body.style.cursor = 'auto';
            
            // Clear selected waypoint
            this.selectedWaypoint = null;
            
            if (intersects.length > 0) {
                const waypointObj = intersects[0].object;
                if (waypointObj && waypointObj.material) {
                    waypointObj.material.color.set(0xff0000); // Highlight in red
                    document.body.style.cursor = 'grab';
                    
                    // Find the waypoint data
                    this.selectedWaypoint = this.waypoints.find(
                        wp => wp.object === waypointObj
                    );
                }
            }
        } catch (error) {
            console.error("Error highlighting waypoint:", error);
        }
    }
    
    moveWaypoint() {
        if (!this.selectedWaypoint || !this.raycaster || !this.camera) return;
        
        try {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Calculate the intersection point with the ground plane (XZ plane)
            if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragPoint)) {
                // Ensure Y position remains fixed at the waypoint height
                // Only update X and Z coordinates
                const newX = this.dragPoint.x;
                const newZ = this.dragPoint.z;
                
                // Update the waypoint object position
                this.selectedWaypoint.object.position.set(
                    newX,
                    this.waypointHeight,
                    newZ
                );
                
                // Update the stored position
                this.selectedWaypoint.position.set(
                    newX,
                    this.waypointHeight,
                    newZ
                );
                
                // Update the path
                this.updatePathLine();
            }
        } catch (error) {
            console.error("Error moving waypoint:", error);
        }
    }
    
    // Return the current animation curve
    getCurve() {
        return this.curve;
    }
    
    // Get waypoint positions for saving
    getWaypointPositions() {
        return this.waypoints.map(wp => ({
            x: wp.position.x,
            y: wp.position.y,
            z: wp.position.z
        }));
    }
    
    // Add a new waypoint
    addWaypoint() {
        if (this.waypoints.length === 0) {
            this.createDefaultWaypoints();
            return;
        }
        
        try {
            // Find the average position of two adjacent waypoints
            const index = this.selectedWaypoint ? this.selectedWaypoint.index : 0;
            const nextIndex = (index + 1) % this.waypoints.length;
            
            const p1 = this.waypoints[index].position;
            const p2 = this.waypoints[nextIndex].position;
            
            // Create a midpoint between the two existing waypoints (only X and Z)
            const midPoint = new THREE.Vector3(
                (p1.x + p2.x) / 2,
                this.waypointHeight,
                (p1.z + p2.z) / 2
            );
            
            // Create a new waypoint at the mid point
            this.createWaypoint(midPoint.x, midPoint.y, midPoint.z);
            
            // Update indices
            this.waypoints.forEach((wp, i) => {
                wp.index = i;
            });
            
            this.updatePathLine();
        } catch (error) {
            console.error("Error adding waypoint:", error);
        }
    }
    
    // Remove the selected waypoint
    removeWaypoint() {
        if (!this.selectedWaypoint || this.waypoints.length <= 4) return;
        
        try {
            // Remove from the scene
            if (this.scene && this.selectedWaypoint.object) {
                this.scene.remove(this.selectedWaypoint.object);
            }
            
            // Remove from the arrays
            const index = this.selectedWaypoint.index;
            this.waypoints.splice(index, 1);
            this.waypoint3DObjects.splice(index, 1);
            
            // Update indices
            this.waypoints.forEach((wp, i) => {
                wp.index = i;
            });
            
            this.selectedWaypoint = null;
            this.updatePathLine();
        } catch (error) {
            console.error("Error removing waypoint:", error);
        }
    }
    
    // Clean up resources
    dispose() {
        this.removeEventListeners();
        this.clearWaypoints();
    }
}

export { WaypointEditor }; 