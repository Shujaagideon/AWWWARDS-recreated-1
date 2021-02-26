import * as THREE from 'three'
import { BufferGeometryUtils, SceneUtils } from 'three';
import { key_press } from "./keyPress";
import { math } from '../../utils/math'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export const sceneObj = (() => {
    const START_POS = 100;
    const SEPARATION_DISTANCE = 20;

    class _MissThem {
        constructor(props, loader, accel) {
            this.objects_ = [];
            this.unused_ = [];
            this.speed_ = 20;
            this.params_ = props;
            this.stage = accel;
            this.acceleration = accel.config.speed;
            this.score_ = 0.0;
            this.score = 250;
            this.scoreText_ = '00000';
            this.separationDistance_ = SEPARATION_DISTANCE;
            this.loader = loader;
        };
        GetColliders() {
            return this.objects_;
        }
        LastObjectPosition_() {
            if (this.objects_.length == 0) {
                return SEPARATION_DISTANCE;
            }

            return this.objects_[this.objects_.length - 1].position.z;
        };
        SpawnObj_(scale, offset) {
            let obj = null;

            if (this.unused_.length > 0) {
                obj = this.unused_.pop();
                obj.mesh.visible = true;
            } else {
                obj = new key_press.WorldObject(this.params_, this.loader);
            }


            obj.position.z = START_POS + offset;
            obj.position.x = math.rand_int(-2, 2);
            obj.scale = scale * 0.01;
            this.objects_.push(obj);
        }
        SpawnCluster_() {
            const scaleIndex = math.rand_int(0, 1);
            const scales = [1, 0.5];
            const ranges = [1, 2];
            const scale = scales[scaleIndex];
            const numObjects = math.rand_int(1, ranges[scaleIndex]);

            for (let i = 0; i < numObjects; ++i) {
                const offset = i * 1 * scale;
                this.SpawnObj_(scale, offset);
            }
        }


        MaybeSpawn_() {
            const closest = this.LastObjectPosition_();
            if (Math.abs(100 - closest) > this.separationDistance_) {
                this.SpawnCluster_();
                this.separationDistance_ = math.rand_range(SEPARATION_DISTANCE, SEPARATION_DISTANCE * 1.5);
            }
        }

        Update(timeElapsed) {
            this.MaybeSpawn_();
            this.UpdateColliders_(timeElapsed);
            this.UpdateScore_(timeElapsed)
        };
        UpdateScore_(timeElapsed) {
            this.score_ += timeElapsed * 5.0;

            const scoreText = Math.round(this.score_).toLocaleString(
                'en-US', { minimumIntegerDigits: 5, useGrouping: false });
                switch (this.stage.name) {
                    case 'city':
                        window.localStorage.setItem('city-poin', JSON.stringify(Math.round(this.score_)));
                        break;
                    case 'winter':
                        window.localStorage.setItem('winter-poin', JSON.stringify(Math.round(this.score_)));
                        break;
                    case 'desert':
                        window.localStorage.setItem('desert-poin', JSON.stringify(Math.round(this.score_)));
                        break;
                
                    default:
                        break;
                }

            if (scoreText == this.scoreText_) {
                return;
            }
            
            document.getElementById('score-text').innerText = scoreText;
            if(this.score_ > this.score){
                document.getElementById('cash-text').innerHTML = this.score/25;
                this.score += 250;
            }
        }
        UpdateColliders_(timeElapsed) {
            const invisible = [];
            const visible = [];
            this.speed_ += this.acceleration;

            for (let obj of this.objects_) {
                obj.position.z -= timeElapsed * this.speed_;

                if (obj.position.z < -400) {
                    invisible.push(obj);
                    obj.mesh.visible = false;
                } else {
                    visible.push(obj);
                }

                obj.Update(timeElapsed);
            }

            this.objects_ = visible;
            this.unused_.push(...invisible);
        }
    }
    class BackgroundCloud {
        constructor(params) {
            this.params_ = params;
            this.position_ = new THREE.Vector3();
            this.quaternion_ = new THREE.Quaternion();
            this.scale_ = 1.0;
            this.mesh_ = null;
            this.mesh2 = null;
            this.objects_ = [];
            this.unused_ = [];
            this.speed_ = 20;
            this.loader = this.params_.loader;

            this.LoadModel_();
        }

        LoadModel_() {
            this.loader.setPath('./resources/Clouds/GLTF/');
            this.loader.load('Cloud' + math.rand_int(1, 3) + '.glb', (glb) => {
                this.mesh_ = glb.scene;
                this.params_.scene.add(this.mesh_);

                this.position_.x = math.rand_range(-900, 900);
                this.position_.y = math.rand_range(40, 60);
                this.position_.z = math.rand_range(60, 800);
                this.scale_ = math.rand_range(6, 15);

                const q = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
                this.quaternion_.copy(q);

                this.mesh_.traverse(c => {
                    if (c.geometry) {
                        c.geometry.computeBoundingBox();
                    }

                    let materials = c.material;
                    if (!(c.material instanceof Array)) {
                        materials = [c.material];
                    }

                    for (let m of materials) {
                        if (m) {
                            m.specular = new THREE.Color(0x000000);
                            m.emissive = new THREE.Color(0xC0C0C0);
                        }
                    }
                    c.castShadow = true;
                    c.receiveShadow = true;
                });
            });
            this.loader.setPath('./resources/vehicles/gltf/');
            this.loader.load('road1.gltf', (gltf) => {
                this.mesh2 = gltf.scene;
                this.params_.scene.add(this.mesh2);
                this.mesh2.position.copy(new THREE.Vector3(0, -0.2, 0));
                this.mesh2.rotation.y = -Math.PI / 2;
                this.mesh2.scale.setScalar(0.05);
                this.mesh2.scale.x = 20;

                this.mesh2.traverse(r => {
                    r.receiveShadow = true;
                    // r.castShadow = true;
                })
            })
        }
        Update(timeElapsed) {
            if (!this.mesh_ || !this.mesh2) {
                return;
            }

            this.position_.x -= timeElapsed * 10;
            if (this.position_.x < -900) {
                this.position_.x = math.rand_range(-700, 900);
            }

            this.mesh_.position.copy(this.position_);
            this.mesh_.quaternion.copy(this.quaternion_);
            this.mesh_.scale.setScalar(this.scale_);
        }
    };
    class BackgroundCrap {
        constructor(params) {
            this.params_ = params;
            this.loader = this.params_.loader;
            this.position_ = new THREE.Vector3();
            this.position_2 = new THREE.Vector3();
            this.quaternion_ = new THREE.Quaternion();
            this.scale_ = 0.5;
            this.mesh_ = new THREE.Object3D();
            this.mesh2 = new THREE.Object3D();
            this.newMesh = null;
            this.newGeom = new THREE.InstancedBufferGeometry();
            this.tempObj = new THREE.Object3D();

            this.LoadModel_();
        }

        LoadModel_() {
            const assets = this.params_.stage.assets;
            const [asset, scale] = assets[math.rand_int(0, assets.length - 1)];

            const loader = new FBXLoader();
            loader.setPath(`./resources/naturePack/FBX/`);
            loader.load(asset, (fbx) => {

                this.mesh_.add(SkeletonUtils.clone(fbx));
                this.mesh2.add(SkeletonUtils.clone(fbx));
                this.params_.scene.add(this.mesh_);
                this.params_.scene.add(this.mesh2);

                this.position_.x = math.rand_range(this.params_.stage.config.bgRange[0], this.params_.stage.config.bgRange[1]) // && math.rand_range(-30, -800);
                this.position_2.x = math.rand_range(- this.params_.stage.config.bgRange[0], - this.params_.stage.config.bgRange[1]);
                this.position_.z = math.rand_range(0, 800);
                this.position_2.z = math.rand_range(0, 800);
                this.scale_ = scale;

                const q = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
                this.quaternion_.copy(q);

                fbx.traverse(c => {
                    c.castShadow = true;
                    c.receiveShadow = true;
                    if (c.material) {
                        console.log('yhjknklm')
                        c.material.fog = false;
                    }
                });
            });
            if (this.params_.stage.name === 'winter') {
                let loader = new THREE.TextureLoader();

                let texture = loader.load(this.params_.stage.textures[math.rand_int(0, this.params_.stage.textures.length - 1)])
                // this.createSystem(texture);
            }
        }
        createSystem(texture) {
            this.ParticleGeom = new THREE.Geometry();
            this.ParticleMaterial = new THREE.PointsMaterial({
                size: 4,
                transparent: false,
                opacity: 1,
                map: texture,
                blending: THREE.NormalBlending,
                depthWrite: false,
                sizeAttenuation: true,
                color: 0x00ff00
            });
            this.ParticleRange = 800;
            for (let i = 0; i < 100; i++) {
                let particle = new THREE.Vector3(
                    Math.random() * this.ParticleRange - this.ParticleRange / 2,
                    Math.random() * this.ParticleRange * 1.5,
                    Math.random() * this.ParticleRange - this.ParticleRange / 2);
                particle.velocityY = 0.1 + Math.random() / 5;
                particle.velocityX = (Math.random() - 0.5) / 3;
                particle.velocityZ = (Math.random() - 0.5) / 3;
                this.ParticleGeom.vertices.push(particle);
                // new BufferGeometryUtils.mergeBufferGeometries(this.ParticleGeom, this.ParticleGeom);
            }
            this.ParticleSystem = new THREE.Points(this.ParticleGeom, this.ParticleMaterial);
            this.ParticleSystem.sortParticles = true;
            this.params_.scene.add(this.ParticleSystem)}
        Update(timeElapsed) {
            if (!this.mesh_) {
                return;
            }
            let bgSpeed = 10
            bgSpeed += timeElapsed;
            this.position_.z -= timeElapsed * bgSpeed;
            this.position_2.z -= timeElapsed * bgSpeed;
            if (this.position_.z < -10) {
                this.position_.z = math.rand_range(500, 800);
            }
            if (this.position_2.z < 0) {
                this.position_2.z = math.rand_range(500, 800);
            }
            this.mesh_.position.copy(this.position_);
            this.mesh2.position.copy(this.position_2);
            this.mesh_.quaternion.copy(this.quaternion_);
            this.mesh_.scale.setScalar(this.scale_);
            this.mesh2.scale.setScalar(this.scale_);

            // particles
            this.params_.scene.children.forEach(child => {
                if (child instanceof THREE.Points) {
                    let vertices = child.geometry.vertices;
                    vertices.forEach(v => {
                        v.y = v.y - (v.velocityY);
                        v.x = v.x - (v.velocityX);
                        v.z = v.z - (v.velocityZ);
                        if (v.y <= 0) v.y = 60;
                        if (v.x <= -20 || v.x >= 20)
                            v.velocityX = v.velocityX * -1;
                        if (v.z <= 20 || v.z >= -20)
                            v.velocityZ = v.velocityZ * -1;
                    });

                    child.position.set(math.rand_range(400, - 400), math.rand_range(0, 300), math.rand_range(10, 800))
                    child.geometry.verticesNeedUpdate = true;
                }
            });
        }
    };
    class Background {
        constructor(params) {
            this.params_ = params;
            this.clouds_ = [];
            this.crap_ = [];

            this.SpawnClouds_();
            this.SpawnCrap_();
        }

        SpawnClouds_() {
            for (let i = 0; i < 15; ++i) {
                const cloud = new BackgroundCloud(this.params_);

                this.clouds_.push(cloud);
            }
        }
        SpawnCrap_() {
            for (let i = 0; i < 50; ++i) {
                const crap = new BackgroundCrap(this.params_);

                this.crap_.push(crap);
            }
        }

        Update(timeElapsed) {
            for (let c of this.clouds_) {
                c.Update(timeElapsed);
            }
            for (let c of this.crap_) {
                c.Update(timeElapsed);
            }
        }
    }

    return {
        _MissThem: _MissThem,
        _BackgroundCloud: Background,
    }
})();