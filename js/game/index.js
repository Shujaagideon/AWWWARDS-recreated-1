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
    constructor(stage, vehicle, start) {
        this.stage = stage;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.car = null;
        this.colors = {};
        this.LoadManager = new THREE.LoadingManager();
        this.loader = new GLTFLoader(this.LoadManager);
        this.LoadManager.onLoad = this._Init();

        // const progressbarElem = document.querySelector('#progressbar');
        // this.LoadManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        //     progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
        // };


        // this._Init();
        this._gameStarted = start;
    }
    _Init = () => {
        // hide the loading bar
        // const loadingElem = document.querySelector('#loading');
        // loadingElem.style.display = 'none';
        this.fov = 70;
        this.aspectRatio = window.innerWidth / window.innerHeight;
        this.rendererSize = {}
        this.rendererSize.height = window.innerHeight;
        this.rendererSize.width = window.innerWidth;
        this.scene = new THREE.Scene();

        //camera
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 1, 1000);
        this.camera.position.z = -10;
        this.camera.position.y = 4;
        this.camera.lookAt(new THREE.Vector3(0., 0., 0.));

        // simple cube
        this.geom = new THREE.BoxBufferGeometry(1, 1, 1);
        this.mat = new THREE.MeshStandardMaterial({ color: 'lightpink' });
        this.cube = new THREE.Mesh(this.geom, this.mat);
        // this.loader.load('./resources/vehicles/gltf/vehicle3.gltf', gltf =>{
        //     this.car = gltf.scene.children[0]; 
        //     // this.scene.add(this.car);
        //     // this._RAF();
        //     // this
        // });
        this.miss = new sceneObj._MissThem(this.scene, this.loader);

        this.keys = new key_press._KeyPress(this.cube, this.miss);
        // console.log(this.car)
        this.background_ = new sceneObj._BackgroundCloud({ scene: this.scene, loader: this.loader });


        //simple plane
        this.geometry2 = new THREE.PlaneGeometry(1000, 1000, 10, 10);
        this.material2 = new THREE.MeshStandardMaterial({
            color: 0xf6f47f,
        });
        this.plane = new THREE.Mesh(this.geometry2, this.material2);
        this.plane.rotation.x = -0.5 * Math.PI;
        this.plane.position.y = -1;

        //sky
        const uniforms = {
            topColor: { value: new THREE.Color(this.stage.color.sky.top) },
            bottomColor: { value: new THREE.Color(this.stage.color.sky.bottom) },
            offset: { value: 33 },
            exponent: { value: 0.6 }
        };
        const skyGeo = new THREE.SphereBufferGeometry(1000, 10, 5);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: _VS,
            fragmentShader: _FS,
            side: THREE.BackSide,
        });

        //lights
        let light = new THREE.DirectionalLight(this.stage.color.DirectionalLight, 6);
        light.position.set(60, 100, 10);
        light.target.position.set(40, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.far = 200.0;
        light.shadow.camera.near = 1.0;
        light.shadow.camera.left = 50;
        light.shadow.camera.right = -50;
        light.shadow.camera.top = 50;
        light.shadow.camera.bottom = -50;
        this.scene.add(light);

        light = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
        this.scene.add(light);
        light = new THREE.AmbientLight(this.stage.color.AmbientLight, 5);
        this.scene.add(light);
        light = new THREE.SpotLight(0xffa95c, 1),
            light.position.set(20, 1000, 10);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.far = 200.0;
        light.shadow.camera.near = 1.0;
        light.shadow.camera.left = 50;
        light.shadow.camera.right = -50;
        light.shadow.camera.top = 50;
        light.shadow.camera.bottom = -50;
        this.scene.add(light);

        this.scene.background = new THREE.Color(this.stage.color.background);
        this.scene.fog = new THREE.FogExp2(this.stage.color.fog, 0.00325);


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
        this._TryAgain();
    }
    _RAF = () => {
        requestAnimationFrame((t) => {
            if (this.prevAnimFrame === null) {
                this.prevAnimFrame = t;
            }
            this.myTime = (t - this.prevAnimFrame) / 10000;

            this.StepOver(this.myTime);
            this.renderer.render(this.scene, this.camera);
            this._RAF();
            this.prevAnimFrame = t;
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
        let btn = document.querySelector('.again');
        btn.addEventListener('click', () => {
            document.querySelector('.game-over').style.display = 'none';
            this.gameOver = false;
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