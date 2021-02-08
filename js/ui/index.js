const { Expo } = require("gsap");
const { default: gsap } = require("gsap/gsap-core");
const { data } = require("../data/data");
const { default: ThreeTemplate } = require("../game");

class UI {
    constructor() {
        this.links = [];
        this.ext = [];
        this.stages = [];
        this.vehicles = [];
        this.menuOpen = false;
        this.isFullscreen = false;
        this.chosenStage = 'desert';
        this.chosenVehicle = 'custom';
        this.data = data;
        this._Init();
        this.StartGame();
        let currentClick;
        this.url = `${window.location.protocol}//${window.location.hostname}`;
        if (window.location.port) {
            this.url = `${this.url}:${window.location.port}`
        }
    }
    _Init() {
        this._DOMElem();
        this.links.forEach((link, i) => {
            link.addEventListener('click', e => {
                this.ext.forEach(ext => {
                    ext.classList.remove('act');
                })
                this.ext[i].classList.add('act')
                this.links.forEach(link => {
                    link.classList.remove('active');
                })
                currentClick = link;
                link.classList.add('active');
                this._FetchHtml(e.target.id);
            });
        })
        this.hamburger.addEventListener('click', () => {
            if (!this.menuOpen) {
                document.querySelector('.hiden-menu').classList.add('live')
                this.menuOpen = true;
            } else {
                document.querySelector('.hiden-menu').classList.remove('live')
                this.menuOpen = false;
            }
        })
        this.fullscreen.addEventListener('click', () => {
            if (!this.isFullscreen) {
                document.querySelector('.fullscreen h3').innerHTML = 'Exit FullScreen'
                document.documentElement.requestFullscreen();
                this.isFullscreen = true;
            } else {
                document.exitFullscreen();
                document.querySelector('.fullscreen h3').innerHTML = 'FullScreen'
                this.isFullscreen = false;
            }
        });
    }
    _DOMElem() {
        this.hamburger = document.querySelector('.hamburger-menu')
        this.fullscreen = document.querySelector('.fullscreen')
        this.links = [...document.querySelectorAll('.choice-specific')];
        this.ext = [...document.querySelectorAll('.ext')];
    }
    _FetchHtml(link) {
        fetch(`${this.url}/${link}.html`).then((res) => {
            return res.text();
        }).then((html) => {
            let content = new DOMParser().parseFromString(html, 'text/html');
            let desc = document.querySelector('.item-desc');
            let cont = content.querySelector('.hapo');
            this.stages = [...content.querySelectorAll('.stage-image')];
            this.vehicles = [...content.querySelectorAll('.vehicle-specific')];
            this.PostFetch();

            gsap.to('.hapo', {
                opacity: 0,
                x: 200,
                transition: Expo.easeOut,
                duration: 0.5,
                onComplete: (gsap) => {
                    document.querySelector('.item-desc').removeChild(document.querySelector('.hapo'));
                }
            })
            setTimeout(() => {
                desc.appendChild(cont);
                gsap.from('.hapo', {
                    opacity: 0,
                    x: -200,
                    transition: 'ease',
                    duration: 0.3,
                })
            }, 400)
        }).catch(err => {
            console.log(err);
        })
    }
    PostFetch() {
        this.stages.forEach(stage => {
            stage.addEventListener('click', e => {
                this.chosenStage = this.data.stage[`${e.target.id}`];
                let stageImg = e.target.children[0].currentSrc;
                currentClick.children[0].src = stageImg;
            });
        })
        this.vehicles.forEach(stage => {
            stage.addEventListener('click', e => {
                this.chosenVehicle = this.data.vehicle[`${e.target.id}`];
                let stageImg = e.target.src;
                if (!stageImg) return;
                currentClick.children[0].src = stageImg;
            });
        })
    }
    StartGame() {
        document.getElementById('play').onclick = () => {
            document.getElementById('game-ui').style.display = 'none';
            new ThreeTemplate(this.chosenStage, this.chosenVehicle, true);
        };

    }

}

new UI();