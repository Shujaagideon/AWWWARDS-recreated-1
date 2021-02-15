import * as THREE from 'three'
import { math } from '../../utils/math';
import { BufferGeometryUtils } from 'three';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';



export const key_press = (() => {
    class _KeyPress {
        constructor(props, miss, scene,loader) {
            this.position = new THREE.Vector3(0, 0, 0);
            this.player = new THREE.Box3();
            this.velocity = 0;
            this.props = props;
            this.loader = loader;
            this.scene = scene;
            this.carMesh = new THREE.Object3D();
            this.miss = miss;
            // this.props.position.xyz = this.position;
            this.gameOver = false;
            this.events = {
                left: false,
                forward: false,
                right: false,
                back: false,
            };
            this.Player();
            this._Init();
        }
        Player(){
            this.loader.load('./resources/vehicles/gltf/vehicle3.gltf', gltf =>{
                this.carMesh.add(gltf.scene); 
                this.scene.add(this.carMesh);
                this.carMesh.scale.setScalar(0.0035);
                this.carMesh.rotation.y = Math.PI/2;
             });
        }

        _Init = () => {
            window.addEventListener('keydown', (e) => this._onKeyDown(e));
            window.addEventListener('keyup', (e) => this._onKeyUp(e));

        }

        _onKeyDown = (e) => {
            switch (e.keyCode) {
                case 32:
                    this.events.enter = true;
                    break;
                case 'space':
                    this.events.space = true;
                    break;
                case 'esc':
                    this.events.esc = true;
                    break;
                case 'ctrl':
                    this.events.ctrl = true;
                    break;
                case 'shift':
                    this.events.shiftKey = true;
                    break;
                case 'alt':
                    this.events.alt = true;
                    break;
                case 37:
                    this.events.left = true;
                    this.direction = 1;
                    break;
                case 38:
                    this.events.forward = true;
                    this.direction = 2;
                    break;
                case 39:
                    this.events.right = true;
                    this.direction = 3;
                    break;
                case 40:
                    this.events.back = true;
                    this.direction = 4;
                    break;


                default:
                    break;
            }
        }
        _onKeyUp = (e) => {
            switch (e.keyCode) {
                case 'enter':
                    this.events.enter = false;
                    break;
                case 'space':
                    this.events.space = false;
                    break;
                case 'esc':
                    this.events.esc = false;
                    break;
                case 'ctrl':
                    this.events.ctrl = false;
                    break;
                case 'shift':
                    this.events.shiftKey = false;
                    break;
                case 'alt':
                    this.events.alt = false;
                    break;
                case 37:
                    this.events.left = false;
                    break;
                case 38:
                    this.events.forward = false;
                    break;
                case 39:
                    this.events.right = false;
                    break;
                case 40:
                    this.events.back = false;
                    break;


                default:
                    break;
            }
        }

        _Collisions() {
            const colliders = this.miss.GetColliders();

            this.player.setFromObject(this.carMesh);

            for (let c of colliders) {
                const cur = c.collider;

                if (cur.intersectsBox(this.player)) {
                    this.gameOver = true;
                }
            }
        }

        _CharacterMovement = (time) => {

            if (this.position.x == 0.0) {
                this.velocity = 50;
                this.velocity*= 0.768;
            }
            const acceleration = 0.005 * time;
            if (this.events.left && this.position.x <= 2.1) {
                this.position.x += time * (this.velocity + acceleration * 0.005);
                // this.position.x += -1;
                // this.position.x = Math.max(this.position.x, -1.5)
                this.carMesh.position.copy(this.position);
            }
            if (this.events.right && this.position.x >= -2.1) {
                this.position.x -= time * (this.velocity + acceleration * 0.005);
                // this.position.x += -1;
                // this.position.x = Math.max(this.position.x, 1.5)
                this.carMesh.position.copy(this.position);
            }
            this._Collisions();
        }
    }
    class WorldObject {
        constructor(params,loader) {
            this.position = new THREE.Vector3();
            this.scale = 1.0;
            this.collider = new THREE.Box3();
            this.mesh = null;
            this.newGeom = new THREE.BufferGeometry();
            this.spawnGeo = [];
            this.params_ = params;
            this.loader = loader;
            this.LoadModel_();
        }

        LoadModel_() {
            const vehicles = [
                'Cop.fbx',
                'NormalCar1.fbx',
                'NormalCar2.fbx',
                'SportsCar.fbx',
                'SportsCar2.fbx',
                'SUV.fbx',
                'Taxi.fbx',
                ]
            const loader = new FBXLoader();
            loader.setPath('./resources/CarPack/FBX/');
            loader.load(vehicles[math.rand_int(0, vehicles.length - 1)], (fbx) => {
                this.mesh = SkeletonUtils.clone(fbx);
                    this.mesh.scale.setScalar(0.0045);
                    this.mesh.rotation.x = - Math.PI / 2;
                const root = new THREE.Object3D();
                root.add(this.mesh);
                this.params_.add(root);
               
                this.mesh.traverse(c => {
                    c.castShadow = true;
                    c.receiveShadow = true;
                });
            });
        }

        UpdateCollider_() {
            this.collider.setFromObject(this.mesh);
        }

        Update(timeElapsed) {
            if (!this.mesh) {
                return;
            }
            this.mesh.position.copy(this.position);
            this.UpdateCollider_();
        }
    }
    return {
        _KeyPress: _KeyPress,
        WorldObject: WorldObject,
    }
})();

