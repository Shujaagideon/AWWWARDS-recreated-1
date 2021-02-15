import image1 from '../../images/thomas-griggs-LWofoKc7gS4-unsplash.jpg'
import image2 from '../../images/thomas-griggs-LWofoKc7gS4-unsplash.jpg'
import image3 from '../../images/desert.png'

export const data = {
    stage: {
        city: {
            name: 'city',
            color: {
                sky: {
                    top: 'rgb(155, 152, 240)',
                    bottom: 'rgb(112, 220, 234)',
                },
                fog: 'rgb(45, 43, 45)',
                background: 'rgb(17, 26, 62)',
                ambient: 'rgb(05, 13, 90)',
                directional: 'rgba(15, 183, 130, 0.8)',
            },
            assets: [
                ['1Story_GableRoof_Mat.fbx', 0.03],
                ['1Story_RoundRoof_Mat.fbx', 0.03],
                ['1Story_Sign_Mat.fbx', 0.03],
                ['1Story_Mat.fbx', 0.03],
                ['2Story_2_Mat.fbx', 0.03],
                ['2Story_Balcony_Mat.fbx', 0.03],
                ['2Story_Center_Mat.fbx', 0.03],
                ['2Story_Columns_Mat.fbx', 0.03],
                ['2Story_Double_Mat.fbx', 0.03],
                ['2Story_GableRoof_Mat.fbx', 0.03],
                ['2Story_RoundRoof_Mat.fbx', 0.03],
                ['2Story_SideHouse_Mat.fbx', 0.03],
                ['2Story_Sign_Mat.fbx', 0.03],
                ['2Story_Slim_Mat.fbx', 0.03],
                ['2Story_Stairs_Mat.fbx', 0.03],
                ['2Story_Mat.fbx', 0.03],
                ['2Story_Wide_2Doors_Mat.fbx', 0.03],
                ['2Story_Wide_Mat.fbx', 0.03],
                ['3Story_balcony_Mat.fbx', 0.03],
                ['3Story_Slim_Mat.fbx', 0.03],
                ['3Story_Small_Mat.fbx', 0.03],
                ['4Story_Center_Mat.fbx', 0.03],
                ['4Story_Wide_2Doors_Mat.fbx', 0.03],
                ['4Story_Mat.fbx', 0.03],
                ['6Story_Stack_Mat.fbx', 0.03],

            ],
            config: {
                fog: 600,
                speed: 0.01,
                ambiIntense: 1,
                bgRange: [20, 100],
                surfaceTexture: image1,
                set highScore(value){
                    let current = 0;
                    if(value > current){
                        current = value
                    }
                    current;
                },
            }
        },
        winter: {
            name:'winter',
            color: {
                sky: {
                    top: 'rgb(200, 203, 200)',
                    bottom: 'rgb(225, 253, 250)',
                },
                fog: 'rgb(200, 200, 225)',
                background: 'rgb(47, 06, 255)',
                ambient: 'rgb(05, 03, 25)',
                directional: 'rgb(15, 03, 30)',
                color: 'rgb(255, 255, 255)',

            },
            assets: [
                ['BirchTree_Dead_Snow_1.fbx', 0.03],
                ['BirchTree_Dead_Snow_2.fbx', 0.03],
                ['BirchTree_Dead_Snow_3.fbx', 0.03],
                ['BirchTree_Dead_Snow_4.fbx', 0.03],
                ['BirchTree_Dead_Snow_5.fbx', 0.03],
                ['BirchTree_Snow_1.fbx', 0.03],
                ['BirchTree_Snow_2.fbx', 0.03],
                ['BirchTree_Snow_3.fbx', 0.03],
                ['BirchTree_Snow_4.fbx', 0.03],
                ['BirchTree_Snow_5.fbx', 0.03],
            ],
            textures: [
                '../../images/snowflake1.png',
                '../../images/snowflake1_t.png',
                '../../images/snowflake2.png',
                '../../images/snowflake2_t.png',
                '../../images/snowflake3.png',
                '../../images/snowflake3_t.png',
                '../../images/snowflake4.png',
                '../../images/snowflake4_t.png',
                '../../images/snowflake5.png',
                '../../images/snowflake5_t.png',
            ],
            config: {
                fog: 200,
                ambiIntense: 2,
                speed: 0.009,
                bgRange: [30, 400],
                surfaceTexture: image2,
                set highScore(value) {
                    let current = 0;
                    if (value > current) {
                        current = value
                    }
                    current;
                },
            }
        },
        desert: {
            name:'desert',
            color: {
                sky: {
                    top: 'rgba(255, 203, 100, 0.3)',
                    bottom: 'rgb(255, 203, 100)',
                },
                fog: 'rgb(255, 203, 136)',
                background: 'rgb(147, 106, 12)',
                ambient: 'rgb(205, 143, 50)',
                directional: 'rgba(155, 103, 30, 0.8)',
            },
            assets: [
                ['BirchTree_Dead_1.fbx', 0.03],
                ['BirchTree_Dead_2.fbx', 0.03],
                ['BirchTree_Dead_3.fbx', 0.03],
                ['BirchTree_Dead_4.fbx', 0.03],
                ['BirchTree_Dead_5.fbx', 0.03],
                ['BirchTree_Autumn_1.fbx', 0.03],
                ['BirchTree_Autumn_2.fbx', 0.03],
                ['BirchTree_Autumn_3.fbx', 0.03],
                ['BirchTree_Autumn_4.fbx', 0.03],
                ['BirchTree_Autumn_5.fbx', 0.03],
            ],
            config: {
                fog: 800,
                speed: 0.008,
                ambiIntense: 0.8,
                bgRange: [30, 400],
                surfaceTexture: image3,
                set highScore(value) {
                    let current = 0;
                    if (value > current) {
                        current = value
                    }
                    current;
                },
            }
        }
    },
    vehicle: {

    }
}