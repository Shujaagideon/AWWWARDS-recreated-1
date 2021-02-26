import * as THREE from 'three'
import { math } from '../../utils/math';
import { BufferGeometryUtils } from 'three';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { data } from '../data/data';



export const key_press = (() => {
    class _KeyPress {
        constructor(props, miss, scene, loader) {
            this.position = new THREE.Vector3(0, 0, 0);
            this.player = new THREE.Box3();
            this.velocity = 0;
            this.vehicle = props;
            this.loader = loader;
            this.scene = scene;
            this.carMesh = new THREE.Object3D();
            this.miss = miss;
            // this.props.position.xyz = this.position;
            this.gameOver = data.gameOver;
            this.events = {
                left: false,
                forward: false,
                right: false,
                back: false,
            };
            this.Player();
            this._Init();
        }
        Player() {
            this.loader.load(`./resources/vehicles/gltf/${this.vehicle}`, gltf => {
                this.carMesh.add(gltf.scene);
                this.scene.add(this.carMesh);
                switch (this.vehicle) {
                    case 'terzo.gltf':
                        this.carMesh.scale.setScalar(0.5);
                        this.carMesh.position.y = 3;
                        break;
                    case 'urus.gltf':
                        this.carMesh.scale.setScalar(0.4);
                        this.carMesh.position.y = 4;
                        break;
                    case 'aventador.gltf':
                        this.carMesh.scale.setScalar(0.0035);
                        this.carMesh.rotation.y = Math.PI / 2;
                        break;

                    default:
                        this.carMesh.scale.setScalar(0.0035);
                        this.carMesh.rotation.y = Math.PI / 2;
                        break;
                }
                this.carMesh.traverse(c => {
                    c.castShadow = true;
                    c.receiveShadow = true;
                });
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
                    data.gameOver = true;
                    data.gamePaused = true;
                }
            }
        }
        
        _CharacterMovement = (time) => {
            
            this.gameOver = data.gameOver;
            if (this.position.x == 0.0) {
                this.velocity = 50;
                this.velocity *= 0.768;
            }
            const acceleration = 0.005 * time;
            const t = 1.4 - Math.pow(0.001, time);
            if (this.events.left && this.position.x <= 2.3) {
                this.position.x += time * (this.velocity + acceleration * 0.005);
                // this.position.x += -1;
                // this.position.x = Math.max(this.position.x, -1.5)
                this.carMesh.position.lerp(this.position, t);
            }
            if (this.events.right && this.position.x >= -2.3) {
                this.position.x -= time * (this.velocity + acceleration * 0.005);
                // this.position.x += -1;
                // this.position.x = Math.max(this.position.x, 1.5)
                this.carMesh.position.lerp(this.position, t);
            }
            this._Collisions();
        }
    }
    class WorldObject {
        constructor(params, loader) {
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
    class Camera_ {
        constructor(params) {
            this.params = params;
            this.camera = params.camera;
            this.position = new THREE.Vector3();
            this.lookAt = new THREE.Vector3();
            console.log(this.camera)
        }
        calculated([x, y, z]) {
            const offset = new THREE.Vector3(x, y, z);
            // offset.applyQuaternion(this.params.target.rotation);
            offset.add(this.params.target.position);
            return offset;
        }
        Update(time) {
            const offset = this.calculated([0, 3, -6]);
            const lookAt = this.calculated([0, 3, 1]);
            const t = 1.2 - Math.pow(0.001, time);

            this.position.lerp(offset, t);
            this.lookAt.lerp(lookAt, t);

            this.camera.position.copy(this.position);
            this.camera.lookAt(this.lookAt);
        }
    }
    return {
        _KeyPress: _KeyPress,
        WorldObject: WorldObject,
        Camera_: Camera_,
    }
})();

