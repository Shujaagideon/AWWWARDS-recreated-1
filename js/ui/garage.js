import * as THREE from 'three';
import { LoadingManager } from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


class Garage_ {
    constructor(portal, loadElem, left, right) {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.garage = portal;
        this.loadingElem = loadElem;
        this.leftBtn = left;
        this.rightBtn = right;
        this.cars = [];
        this.current = 0;
        this.rot = 0.004;
        this.parent = document.querySelector('.item-desc');
        this.LoadManager = new LoadingManager();
        this.GlLoader = new GLTFLoader(this.LoadManager);

        // this.LoadManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        //     // this.progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
        //     console.log(itemsLoaded, itemsTotal);
        // };

        this.LoadManager.onLoad = (() => {
            // this.init();
            this.loadingElem.style.display = 'none';
            this.BtnEvents();
            this.scene.add(this.cars[0]);
            this.scene.add(this.cars[1]);
            this.scene.add(this.cars[2]);
            this.current === 0 ? this.cars[0].visible = true : this.cars[0].visible = false;
            this.current === 1 ? this.cars[1].visible = true : this.cars[1].visible = false;
            this.current === 2 ? this.cars[2].visible = true : this.cars[2].visible = false;
        })

        RectAreaLightUniformsLib.init();
        this.init();
    }
    init() {
        this.fov = 70;
        this.aspectRatio = window.innerWidth / window.innerHeight;
        this.scene = new THREE.Scene();
        //camera
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 1, 1000);
        this.camera.position.z = 9;
        this.camera.position.y = -0.5;
        this.camera.position.x = 0;
        this.camera.lookAt(new THREE.Vector3(0., 0., 0.));

        // garage
        this.geom = new THREE.TorusBufferGeometry(2, 1, 100, 100);
        this.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#fca').convertSRGBToLinear(),
            metalness: 0.1,
            roughness: 0.1,
        })
        this.cube = new THREE.Mesh(this.geom, this.material);
        this.cube.rotation.x = Math.PI / 2;
        this.cube.position.set(0, -3.8, 2);
        this.scene.add(this.cube);




        this.geom = new THREE.PlaneBufferGeometry(30, 10);
        this.plane1 = new THREE.Mesh(this.geom, this.material);
        this.scene.add(this.plane1);
        this.plane1.position.set(0, 7, 0);
        this.plane1.rotation.set(Math.PI / 2, 0, 0);



        this.geom = new THREE.PlaneBufferGeometry(30, 10);
        this.plane2 = new THREE.Mesh(this.geom, this.material);
        this.scene.add(this.plane2);
        this.plane2.position.set(0, -3, 0);
        this.plane2.rotation.set(-Math.PI / 2, 0, 0);


        this.geom = new THREE.PlaneBufferGeometry(10, 10);
        this.plane3 = new THREE.Mesh(this.geom, this.material);
        this.scene.add(this.plane3);
        this.plane3.position.set(15, 2, 0);
        this.plane3.rotation.set(0, -Math.PI / 2, 0);


        this.geom = new THREE.PlaneBufferGeometry(10, 10);
        this.plane4 = new THREE.Mesh(this.geom, this.material);
        this.scene.add(this.plane4);
        this.plane4.position.set(-15, 2, 0);
        this.plane4.rotation.set(0, Math.PI / 2, 0);


        this.geom = new THREE.PlaneBufferGeometry(30, 10);
        this.plane5 = new THREE.Mesh(this.geom, this.material);
        this.scene.add(this.plane5);
        this.plane5.position.set(0, 2, -5);
        this.plane5.rotation.set(0, 0, 0);


        // lights
        this.light = new THREE.AmbientLight('lightpink', 0.6);
        this.scene.add(this.light);
        this.light = new THREE.PointLight('#faa', 0.1);
        this.light.position.set(4, 10, 0)
        this.scene.add(this.light);
        this.light = new THREE.PointLight('#faa', 0.1);
        this.light.position.set(-4, -10, 0)
        this.scene.add(this.light);
        this.light = new THREE.RectAreaLight('#ffe', 0.3, 8, 8);
        this.light.position.set(10, 7, 3);
        this.light.rotation.x = -Math.PI / 2;
        this.scene.add(this.light);
        this.light = new THREE.RectAreaLight('#ffe', 0.3, 8, 8);
        this.light.position.set(-10, 7, 3);
        this.light.rotation.x = -Math.PI / 2;
        this.scene.add(this.light);
        this.light = new THREE.RectAreaLight('#fff', 5, 5, 5);
        this.light.position.set(0, -2.5, 2);
        this.light.rotation.x = Math.PI / 2;
        // this.light.lookAt(new THREE.Vector3(0,1,6))
        this.scene.add(this.light);


        // screen
        this.light = new THREE.RectAreaLight('#fff', 10, 30, 10);
        this.light.position.set(0, 2, -5);
        // this.light.lookAt(new THREE.Vector3(0, 0, 8))
        this.scene.add(this.light);

        // loaders

        this.GlLoader.setPath(`./resources/vehicles/gltf/`);
        this.GlLoader.load('terzo.gltf', gltf => {
            gltf.scene.scale.setScalar(2.2);
            gltf.scene.position.z = 2;
            gltf.scene.position.y = -2;
            this.cars.push(gltf.scene)
            console.log(gltf)
            // if (this.current === 1) {
            //     this.scene.add(gltf.scene);
            //     this.gltf = gltf.scene
            // };
        });
        this.GlLoader.load('urus.gltf', gltf => {
            gltf.scene.scale.setScalar(1.6);
            gltf.scene.position.z = 2;
            gltf.scene.position.y = -1.5;
            this.cars.push(gltf.scene)
            // if (this.current === 0) {
            //     this.scene.add(gltf.scene);
            //     this.gltf = gltf.scene
            // }
        });
        this.GlLoader.load('aventador.gltf', gltf => {
            gltf.scene.scale.setScalar(0.015);
            gltf.scene.rotation.y = Math.PI / 2;
            gltf.scene.position.z = 2;
            gltf.scene.position.y = -2.2;
            this.cars.push(gltf.scene)
            // if (this.current === 2) {
            //     this.scene.add(gltf.scene);
            //     this.gltf = gltf.scene
            // }
        });
        console.log(this.cars);


        // renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.rendererSize = {};
        this.rendererSize.height = this.parent.clientHeight;
        this.rendererSize.width = this.parent.clientWidth;

        this.renderer.setSize(this.rendererSize.width, this.rendererSize.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor('#fff');
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = THREE.CineonToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.garage.appendChild(this.renderer.domElement);
        this.prevAnimFrame = null;
        this._UpdateOnResize();
        this._RAF();
    }
    BtnEvents() {
        this.leftBtn.addEventListener('click', () => {
            this.BtnFunc();
            console.log('left');
        });
        this.rightBtn.addEventListener('click', () => {
            this.BtnFunc('right');
            console.log('right');
            console.log(this.current);
        });
    }
    BtnFunc(right = '') {
        let current = 0;
        this.rot = 0.008;
        if (right = 'right') {
            this.current < 2 ? this.current += 1 : this.current = 0;
            // this.rot = 0.004;
        }
        else {
            this.current > 0 ? this.current -= 1 : this.current = 2;
            // this.rot = 0.004;
        }
        this.rot = 0.004;
    }
    _RAF = () => {
        requestAnimationFrame((t) => {
            if (this.cars[0]) { this.cars[0].rotation.y += this.rot };
            if (this.cars[1]) { this.cars[1].rotation.y += this.rot };
            if (this.cars[2]) { this.cars[2].rotation.y += this.rot };
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.render(this.scene, this.camera);
            this._RAF();
        })
    }
    _UpdateOnResize = () => {
        window.addEventListener('resize', () => {
            this.rendererSize.height = this.garage.clientHeight;
            this.rendererSize.width = this.garage.clientWidth;
            this.renderer.setSize(this.rendererSize.width, this.rendererSize.height);
        });

    }
}

export default Garage_;