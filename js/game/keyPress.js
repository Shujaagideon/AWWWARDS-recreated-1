import * as THREE from 'three'
import { math } from '../../utils/math';
import { BufferGeometryUtils } from 'three';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';


export const key_press = (() => {
    class _KeyPress {
        constructor(props, miss) {
            this.position = new THREE.Vector3(0, 0, 0);
            this.player = new THREE.Box3();
            this.velocity = 0;
            this.props = props;
            this.direction;
            this.miss = miss;
            // this.props.position.xyz = this.position;
            this.gameOver = false;
            this.events = {
                left: false,
                forward: false,
                right: false,
                back: false,
            };

            this._Init();
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

            this.player.setFromObject(this.props);

            for (let c of colliders) {
                const cur = c.collider;

                if (cur.intersectsBox(this.player)) {
                    this.gameOver = true;
                }
            }
        }

        _CharacterMovement = (time) => {

            if (this.position.x == 0.0) {
                this.velocity = 60;
            }
            const acceleration = 0.05 * time;
            if (this.events.left && this.position.x <= 2) {
                this.position.x += time * (this.velocity + acceleration * 0.005);
                // this.position.x += -1;
                // this.position.x = Math.max(this.position.x, -1.5)
                this.props.position.copy(this.position);
            }
            if (this.events.right && this.position.x >= -2) {
                this.position.x -= time * (this.velocity + acceleration * 0.005);
                // this.position.x += -1;
                // this.position.x = Math.max(this.position.x, 1.5)
                this.props.position.copy(this.position);
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
            let objNum = math.rand_int(3, 6)
            this.loader.setPath('./resources/vehicles/gltf/');
            this.loader.load(`vehicle${objNum}.gltf`, (gltf) => {
                this.mesh = SkeletonUtils.clone(gltf.scene);
                // console.log(this.mesh)
                const root = new THREE.Object3D();
                root.add(this.mesh);
                this.params_.add(root);
                switch (objNum) {
                    case 3:
                        this.mesh.scale.setScalar(0.005);
                        this.mesh.rotation.y = - Math.PI / 2;
                        break;
                    case 6:
                        this.mesh.scale.setScalar(0.01);
                        this.mesh.rotation.y = Math.PI / 2;
                        break;
                    case 5:
                        this.mesh.scale.setScalar(0.8);
                        this.mesh.rotation.y = Math.PI;
                        break;

                    default:
                        this.mesh.scale.setScalar(0.005);
                        this.mesh.rotation.y = - Math.PI / 2;
                        break;
                }
                this.mesh.traverse(c => {
                    if (c.geometry) {
                        THREE.BufferGeometry.prototype.copy.call(this.newGeom, c.geometry);
                        this.spawnGeo.push(this.newGeom);
                    }
                    c.geometry = BufferGeometryUtils.mergeBufferGeometries(
                        this.spawnGeo, false);
                    c.castShadow = true;
                    c.receiveShadow = true;
                });
            });
            // this.mesh.scale.setScalar(0.01);

        }

        UpdateCollider_() {
            this.collider.setFromObject(this.mesh);
        }

        Update(timeElapsed) {
            if (!this.mesh) {
                return;
            }
            this.mesh.position.copy(this.position);
            // this.mesh.quaternion.copy(this.quaternion);
            // this.mesh.scale.setScalar(this.scale);
            this.UpdateCollider_();
        }
    }
    return {
        _KeyPress: _KeyPress,
        WorldObject: WorldObject,
    }
})();

