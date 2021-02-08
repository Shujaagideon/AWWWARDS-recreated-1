import * as THREE from 'three'
import { BufferGeometryUtils } from 'three';
import { key_press } from "./keyPress";
import { math } from '../../utils/math'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

export const sceneObj = (() => {
    const START_POS = 100;
    const SEPARATION_DISTANCE = 20;

    class _MissThem {
        constructor(props,loader) {
            this.objects_ = [];
            this.unused_ = [];
            this.speed_ = 20;
            this.params_ = props;
            this.score_ = 0.0;
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
                obj = new key_press.WorldObject(this.params_,this.loader);
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

            if (scoreText == this.scoreText_) {
                return;
            }

            document.getElementById('score-text').innerText = scoreText;
        }
        UpdateColliders_(timeElapsed) {
            const invisible = [];
            const visible = [];
            this.speed_ += 0.008;

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
            this.cloudGeo = [];

            this.LoadModel_();
        }

        LoadModel_() {
            this.loader.setPath('./resources/Clouds/GLTF/');
            this.loader.load('Cloud' + math.rand_int(1, 3) + '.glb', (glb) => {
                this.mesh_ = glb.scene;
                this.params_.scene.add(this.mesh_);

                this.position_.x = math.rand_range(-800, 800);
                this.position_.y = math.rand_range(80, 100);
                this.position_.z = math.rand_range(0, 1000);
                this.scale_ = math.rand_range(10, 20);

                const q = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
                this.quaternion_.copy(q);

                this.mesh_.traverse(c => {
                    if (c.geometry) {
                        c.geometry.computeBoundingBox();
                        this.cloudGeo.push(c.geometry);

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
                    c.geometry = BufferGeometryUtils.mergeBufferGeometries(
                        this.cloudGeo, false);
                    c.castShadow = true;
                    c.receiveShadow = true;
                });
            });
            this.loader.setPath('./resources/vehicles/gltf/');
            this.loader.load('road1.gltf',(gltf)=>{
                this.mesh2 = gltf.scene;
                this.params_.scene.add(this.mesh2);
                this.mesh2.position.copy(new THREE.Vector3(0,-1,0));
                this.mesh2.rotation.y = -Math.PI/2;
                this.mesh2.scale.setScalar(0.05);
                this.mesh2.scale.x = 5;
            })
        }
        Update(timeElapsed) {
            if (!this.mesh_ || !this.mesh2) {
                return;
            }

            this.position_.x -= timeElapsed * 10;
            if (this.position_.x < -100) {
                this.position_.x = math.rand_range(2000, 3000);
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
            this.quaternion_ = new THREE.Quaternion();
            this.scale_ = 0.5;
            this.mesh_ = null;
            this.newMesh = null;
            this.newGeom = new THREE.InstancedBufferGeometry();
            this.tempObj = new THREE.Object3D();

            this.LoadModel_();
        }

        LoadModel_() {
            const assets = [
                ['SmallPalmTree.glb', 'PalmTree.png', 3],
                ['BigPalmTree.glb', 'PalmTree.png', 5],
                ['Skull.glb', 'Ground.png', 1],
                ['Scorpion.glb', 'Scorpion.png', 1],
                ['Pyramid.glb', 'Ground.png', 40],
                ['Monument.glb', 'Ground.png', 10],
                ['Cactus1.glb', 'Ground.png', 5],
                ['Cactus2.glb', 'Ground.png', 5],
                ['Cactus3.glb', 'Ground.png', 5],
                ['scene.gltf', 'Ground.png', 0.3],
            ];
            const [asset, textureName, scale] = assets[math.rand_int(0, assets.length - 1)];

            const texLoader = new THREE.TextureLoader();
            const texture = texLoader.load('./resources/DesertPack/Blend/Textures/' + textureName);
            texture.encoding = THREE.sRGBEncoding;

            this.loader.setPath('./resources/DesertPack/GLTF/');
            this.loader.load(asset, (glb) => {
                this.mesh_ = SkeletonUtils.clone(glb.scene);
                
                this.position_.x = -100;
                this.position_.z = math.rand_range(1000, 0);
                this.scale_ = scale;

                
                // const q = new THREE.Quaternion().setFromAxisAngle(
                //     new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
                //     this.quaternion_.copy(q);
                    
                    this.mesh_.traverse(c => {
                        let materials = c.material;
                        if(c.geometry){
                            THREE.BufferGeometry.prototype.copy.call(this.newGeom, c.geometry);
                        }
                        if (!(c.material instanceof Array)) {
                            materials = [c.material];
                        }
                        
                        for (let m of materials) {
                            if (m) {
                                if (texture) {
                                    m.map = texture;
                                }
                                m.specular = new THREE.Color(0x000000);
                            }
                        }
                        c.castShadow = true;
                        c.receiveShadow = true;
                        this.newMesh = new THREE.InstancedMesh(this.newGeom, c.material, 100);
                    });
            });
        }
 
        Update(timeElapsed) {
            if (!this.mesh_) {
                return;
            }

            this.position_.z -= timeElapsed * 10;
            if (this.position_.z < -100) {
                this.position_.z = math.rand_range(2000, 3000);
            }

            this.newMesh.position.copy(this.position_);
            this.newMesh.quaternion.copy(this.quaternion_);
            this.newMesh.scale.setScalar(this.scale_);
            let i = 0;

            for (let x = 0; x < 1; x++) {
                for (let z = 0; z < 10; z++) {
                    this.id = i++;
                    this.tempObj.position.set( 5 - x, 0, 5 - z);
                    this.tempObj.updateMatrix();
                    this.newMesh.setMatrixAt(this.id, this.tempObj.matrix);
                }
            }
            this.newMesh.instanceMatrix.needsUpdate = true;
            this.params_.scene.add(this.newMesh);
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