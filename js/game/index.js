import * as THREE from 'three';
import { ReinhardToneMapping } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { key_press } from './keyPress'
import { sceneObj } from './SceneObj';
const _VS = `
varying vec3 vWorldPosition;
void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;


const _FS = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;
varying vec3 vWorldPosition;
void main() {
    float h = normalize( vWorldPosition + offset ).y;
  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
}`;
export default class ThreeTemplate {
    constructor(stage, vehicle, start, bar, loading) {
        this.stage = stage;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sun = 0.2;
        this.progressbarElem = bar;
        this.loadingElem = loading;
        this.colors = {};
        this.LoadManager = new THREE.LoadingManager();
        this.loader = new GLTFLoader(this.LoadManager);

        this.LoadManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
        };
        this.LoadManager.onLoad = (() => {
            this._gameStarted = start;
            this.loadingElem.style.display = 'none';
        })

        this._Init();
    }
    _Init = () => {
        // hide the loading bar
        this.fov = 70;
        this.aspectRatio = window.innerWidth / window.innerHeight;
        this.rendererSize = {}
        this.rendererSize.height = window.innerHeight;
        this.rendererSize.width = window.innerWidth;
        this.scene = new THREE.Scene();

        //camera
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 1, 1000);
        this.camera.position.z = -6;
        this.camera.position.y = 3;
        this.camera.lookAt(new THREE.Vector3(0., 0., 0.));
        this.miss = new sceneObj._MissThem(this.scene, this.loader, this.stage);
        this.keys = new key_press._KeyPress(this.cube, this.miss, this.scene, this.loader);
        this.background_ = new sceneObj._BackgroundCloud({ scene: this.scene, loader: this.loader, stage: this.stage });


        //simple plane
        this.geometry2 = new THREE.PlaneGeometry(600, 1000, 1, 1);
        this.texture = THREE.ImageUtils.loadTexture
            (this.stage.config.surfaceTexture);
        this.material2 = new THREE.MeshStandardMaterial({
            color: this.stage.color.color || 'rgb(154, 90, 60)',
            map: this.texture,
            bumpMap: this.texture,
            bumpScale: 2000, 
        });
        this.plane = new THREE.Mesh(this.geometry2, this.material2);
        this.plane.rotation.x = -0.5 * Math.PI;
        this.plane.position.y = -1;
        this.plane.receiveShadow = true;
        this.plane.castShadow = true;

        //sky
        this.uniforms = {
            topColor: { value: new THREE.Color(this.stage.color.sky.top) },
            bottomColor: { value: new THREE.Color(this.stage.color.sky.bottom) },
            offset: { value: 33 },
            exponent: { value: 0.6 }
        };
        const skyGeo = new THREE.SphereBufferGeometry(1000, 1, 1);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: _VS,
            fragmentShader: _FS,
            side: THREE.BackSide,
        });

        //lights
         this.light = new THREE.DirectionalLight(this.stage.color.DirectionalLight, this.stage.config.ambiIntense);
        this.light.position.set(60, 100, 10);
        this.light.target.position.set(40, 0, 0);
        this.light.castShadow = true;
        this.light.shadow.bias = -0.001;
        this.light.shadow.mapSize.width = 4096;
        this.light.shadow.mapSize.height = 4096;
        this.light.shadow.camera.far = 200.0;
        this.light.shadow.camera.near = 1.0;
        this.light.shadow.camera.left = 50;
        this.light.shadow.camera.right = -50;
        this.light.shadow.camera.top = 50;
        this.light.shadow.camera.bottom = -50;
        this.scene.add(this.light);

        this.light1 = new THREE.HemisphereLight(0xffeeb1, 0x080820, this.stage.config.ambiIntense);
        this.scene.add(this.light1);
        this.light2 = new THREE.AmbientLight(this.stage.color.AmbientLight, 0.1);
        this.scene.add(this.light2);
        this.light3 = new THREE.SpotLight(0xffa95c, this.stage.config.ambiIntense),
            this.light3.position.set(20, 1000, 10);
        this.light3.castShadow = true;
        this.light3.shadow.bias = -0.001;
        this.light3.shadow.mapSize.width = 4096;
        this.light3.shadow.mapSize.height = 4096;
        this.light3.shadow.camera.far = 200.0;
        this.light3.shadow.camera.near = 1.0;
        this.light3.shadow.camera.left = 50;
        this.light3.shadow.camera.right = -50;
        this.light3.shadow.camera.top = 50;
        this.light3.shadow.camera.bottom = -50;
        this.scene.add(this.light3);

        this.scene.background = new THREE.Color(this.stage.color.background);
        this.scene.fog = new THREE.Fog(this.stage.color.fog,0.02, this.stage.config.fog,);


        //scene
        this.scene.add(this.cube);
        this.scene.add(this.plane);
        this.scene.add(new THREE.Mesh(skyGeo, skyMat));

        //renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });

        this.renderer.setSize(this.rendererSize.width, this.rendererSize.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = ReinhardToneMapping;
        this.renderer.toneMappingExposure = 2.3;
        document.body.appendChild(this.renderer.domElement);
        this.gameOver = false;
        this.prevAnimFrame = null;
        this._RAF();
        this._UpdateOnResize();
    }
    _RAF = () => {
        requestAnimationFrame((t) => {
            if (this.prevAnimFrame === null) {
                this.prevAnimFrame = t;
            }
            this.myTime = (t - this.prevAnimFrame) / 10000;

            this.StepOver(this.myTime);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.render(this.scene, this.camera);
            this._RAF();
            this.prevAnimFrame = t;
            this._TryAgain();
            this.sun += 0.0015;
            this.light.intensity = Math.max( -0.8, Math.sin(this.sun) * 1);
            this.light1.intensity = Math.max( -0.6, Math.sin(this.sun) * 1);
            this.light2.intensity = Math.max(0.5, Math.sin(this.sun) * 0.8);
            this.light3.intensity = Math.max( -0.8, Math.sin(this.sun) * 1);
            // light position
            this.light.position.x = -100 + (Math.cos(this.sun)* 200);
            this.light3.position.x = -100 + (Math.cos(this.sun)* 200);
            

            // light pos y
            this.light.position.y =  20 + (Math.sin(this.sun) * 30);
            this.light3.position.y = 20+ (Math.sin(this.sun)* 30);
            if (this.light1.intensity > 0.5) {
                this.uniforms.topColor.value.r = Math.abs(Math.sin(this.sun)) * this.uniforms.topColor.value.r
                this.uniforms.bottomColor.value.r = Math.abs(math.sin(this.sun)) * this.uniforms.bottomColor.value.r
                this.uniforms.topColor.value.g = Math.abs(Math.sin(this.sun)) * this.uniforms.topColor.value.g
                this.uniforms.bottomColor.value.g = Math.abs(math.sin(this.sun)) * this.uniforms.bottomColor.value.g
                this.uniforms.topColor.value.b = Math.abs(Math.sin(this.sun)) * this.uniforms.topColor.value.b
                this.uniforms.bottomColor.value.b = Math.abs(math.sin(this.sun)) * this.uniforms.bottomColor.value.b
            } else if (this.light1.intensity > 0){
                this.uniforms.topColor.value = new THREE.Color(this.stage.color.sky.top)
                this.uniforms.bottomColor.value = new THREE.Color(this.stage.color.sky.bottom)
            } else{
                this.uniforms.topColor.value = new THREE.Color('rgb(50, 50, 80)')
                this.uniforms.bottomColor.value = new THREE.Color('rgb(10, 10, 40)')
            }
        });
    }
    StepOver = (time) => {
        if (this.gameOver || !this._gameStarted) {
            return;
        }
        this.keys._CharacterMovement(time);
        this.miss.Update(time * 10);
        this.background_.Update(time);

        if (this.keys.gameOver && !this.gameOver) {
            this.gameOver = true;
            document.querySelector('.game-over').style.display = 'flex';
        }
    }
    _TryAgain = () => {
        let btn;
        document.querySelector('.again').addEventListener('click', () => {
            document.querySelector('.game-over').style.display = 'none';
            // this.gameOver = false;
            this.keys.gameOver = false;
        })
    }
    _UpdateOnResize = () => {
        window.addEventListener('resize', () => {
            this.rendererSize.height = window.innerHeight;
            this.rendererSize.width = window.innerWidth;
            this.renderer.setSize(this.rendererSize.width, this.rendererSize.height);
        })
    }
}