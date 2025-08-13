import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import LootTable from './libraries/LootTable.js';

const sounds = {
    jump: new Audio('./assets/sounds/jump.wav'),
    pickup: new Audio('./assets/sounds/pickup.wav'),
}

const loader = new GLTFLoader();
var models = {
    player: {
    },
    object: {
        
    }
};

function getDistance2D(object1, object2) {
    // Calculate the distance between two points in 3D space using the Euclidean distance formula
    var dx = object2.position.x - object1.position.x;
    var dz = object2.position.z - object1.position.z;
    
    // Square each component and sum them up
    var distanceSquared = dx * dx + dz * dz;
    
    // Take the square root of the sum to get the distance
    var distance = Math.sqrt(distanceSquared);
    
    return distance;
}

function getDistance(object1, object2) {
    // Calculate the distance between two points in 3D space using the Euclidean distance formula
    var dx = object2.position.x - object1.position.x;
    var dy = object2.position.y - object1.position.y;
    var dz = object2.position.z - object1.position.z;
    
    // Square each component and sum them up
    var distanceSquared = dx * dx + dy * dy + dz * dz;
    
    // Take the square root of the sum to get the distance
    var distance = Math.sqrt(distanceSquared);
    
    return distance;
}
// Загружаем модели игроков
for(let playerModel of ["mine","pig","laundry","drone","rotor","spruce","fridge","toilet","yozh"])
{
    loader.load(`./assets/models/${playerModel}.glb`, function ( gltf ) {
        gltf.scene.traverse( function( child ) { 
            if ( child.isMesh )
            {
                child.castShadow = true;
                //child.receiveShadow = true;
            }
        } );
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        models.player[playerModel] = gltf.scene;
    }, undefined, function ( error ){
        console.error( error );
    } );
}
// Создаем сцену и камеру
const scene = new THREE.Scene();

// Создаем камеру
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(-260,275,306);

// Создаем свет
var light = new THREE.DirectionalLight(0xFFFFFF, 5);
light.position.set(0,300,0).normalize();
light.castShadow = true;
light.shadow.camera.visible = true;
light.shadow.mapSize.width = 1024
light.shadow.mapSize.height = 1024
light.shadow.camera.near = 0.5
light.shadow.camera.far = 300
light.shadow.radius = 8;
//light.intensity = 2;

light.shadow.camera.top = 400;
light.shadow.camera.right = 400;
light.shadow.camera.left = -200;
light.shadow.camera.bottom = -200;

scene.add(light);

// const helper = new THREE.CameraHelper(light.shadow.camera)
// scene.add(helper)

// Создаем базовое освещение
var alight = new THREE.AmbientLight( 0xFFFFFF, 0.5 );
alight.protected = true;
alight.castShadow = true;
scene.add( alight );

// Создаем рендерер
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x00FFFF);
renderer.domElement.id = "game";
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Создаем управление
const controls = new OrbitControls(camera, renderer.domElement);

// Создание игрока
var player = "";
var drone  = "";
let initial = {y: 0, x: 400}
var player_pos = {
    y: 1
}
var game = {
    speed: 2,
    end: -415,
    tilesize: 34,
    tiles: 24
}
var params = {
    health: 0,
    score:  0,
    blocked: false,
    frame: 0,
    space: 0,
    speed: 0,
    score: 0,
}
document.addEventListener('keydown', function(event)
{
    if (event.key == 'A' || event.key == 'a' || event.key == "ArrowUp")
    {
        if(player_pos.y > 1) player_pos.y -= 1;
    }
    if (event.key == 'D' || event.key == 'd' || event.key == "ArrowDown")
    {
        if(3 > player_pos.y) player_pos.y += 1;
    }
    if (event.key == ' ' || event.key == 'space')
    {
        sounds.jump.play();
        if(params.space == 0) params.space = 60;
    }
    console.log(event.key);
});
function animate()
{
    let tiles = 0;
    // Первоначально разблокируем
    params.blocked = false;
    for(let i in scene.children)
    {
        // Проходимся по обьектам припятствиям
        if(scene.children[i].hasOwnProperty("isBlocker") && scene.children[i].isBlocker)
        {
            // Затем если впереди есть припятствие
            if(31 > getDistance2D(scene.children[i],player))
            {
                // Блокируем движение
                params.blocked = true;
            }
        }
    }
    for(let i in scene.children)
    {
        // Движимое
        if(scene.children[i].hasOwnProperty("isMoving") && scene.children[i].isMoving)
        {
            if(!params.blocked) scene.children[i].position.x -= game.speed;
        }
        
        // Проходимся по тайлам
        if(scene.children[i].hasOwnProperty("isTile") && scene.children[i].isTile)
        {
            tiles += 1;

            if(scene.children[i].position.x < game.end)
            {
                // Перемещаем тайл в начало карты
                scene.children[i].position.x = initial.x;

                // Проверяем загрузились ли модели
                if(models.player.hasOwnProperty("mine"))
                {
                    // Если это пограничный тайл то там рисуем блокеры
                    if(scene.children[i].hasOwnProperty("isBorder") && scene.children[i].isBorder)
                    {
                        const t = new LootTable(["mine","spruce","yozh"])
                        const item = t.randomItem();
                        if(item == "yozh")
                        {
                            let mine = models.player.yozh.clone();
                            mine.scale.set(80,80,80);
                            mine.isProp        = true;
                            mine.isMoving      = true;
                            mine.receiveShadow = true;
                            mine.position.set(
                                scene.children[i].position.x,
                                scene.children[i].position.y,
                                scene.children[i].position.z
                            );
                            scene.add(mine);
                        }
                        if(item == "mine")
                        {
                            let mine = models.player.mine.clone();
                            mine.scale.set(7,7,7);
                            mine.isProp        = true;
                            mine.isMoving      = true;
                            mine.receiveShadow = true;
                            mine.position.set(
                                scene.children[i].position.x,
                                scene.children[i].position.y,
                                scene.children[i].position.z
                            );
                            scene.add(mine);
                        }
                        if(item == "spruce")
                        {
                            let mine = models.player.spruce.clone();
                            mine.scale.set(12,12,12);
                            mine.isProp     = true;
                            mine.isMoving   = true;
                            mine.receiveShadow = true;
                            mine.castShadow = true;
                            mine.position.set(
                                scene.children[i].position.x,
                                scene.children[i].position.y,
                                scene.children[i].position.z
                            );
                            scene.add(mine);
                        }
                    }
                    else
                    {
                        // Если это обычный тайл то там рисуем разные объекты с шансом
                        if(Math.round(Math.random() * 10) == 5)
                        {
                            const t = new LootTable(["mine","laundry","spruce","toilet","fridge"])
                            const item = t.randomItem();
                            
                            if(item == "mine")
                            {
                                let mine = models.player.mine.clone();
                                mine.scale.set(7,7,7);
                                mine.isProp        = true;
                                mine.isHazard      = true;
                                mine.isMoving      = true;
                                mine.receiveShadow = true;
                                mine.position.set(
                                    scene.children[i].position.x,
                                    scene.children[i].position.y,
                                    scene.children[i].position.z
                                );
                                scene.add(mine);
                            }
                            if(["toilet","fridge","laundry"].includes(item))
                            {
                                let mine = models.player[item].clone();
                                mine.scale.set(7,7,7);
                                mine.isProp     = true;
                                mine.isRotating = true;
                                mine.isBouncing = true;
                                mine.isMoving   = true;
                                mine.isBounty   = true;
                                mine.receiveShadow = true;
                                mine.castShadow = true;
                                mine.position.set(
                                    scene.children[i].position.x,
                                    scene.children[i].position.y,
                                    scene.children[i].position.z
                                );
                                scene.add(mine);
                            }
                            if(item == "spruce")
                            {
                                let mine = models.player.spruce.clone();
                                mine.scale.set(12,12,12);
                                mine.isProp     = true;
                                mine.isBlocker  = true;
                                mine.isMoving   = true;
                                mine.receiveShadow = true;
                                mine.castShadow = true;
                                mine.position.set(
                                    scene.children[i].position.x,
                                    scene.children[i].position.y,
                                    scene.children[i].position.z
                                );
                                scene.add(mine);
                            }
                        }
                    }
                }
            }
        }
        // Вращаем все что вращается
        if(scene.children[i].hasOwnProperty("isRotating") && scene.children[i].isRotating)
        {
            scene.children[i].rotation.y += 0.05;
        }
        // Анимируем подпрыгивание
        if(scene.children[i].hasOwnProperty("isBouncing") && scene.children[i].isBouncing)
        {
            if(!scene.children[i].hasOwnProperty("bounceVector")) scene.children[i].bounceVector = 1;
            if(scene.children[i].position.y > 20) scene.children[i].bounceVector = -1;
            if(0 > scene.children[i].position.y ) scene.children[i].bounceVector = 1;
            scene.children[i].position.y += scene.children[i].bounceVector * 0.1;
        }
        // Проходимся по пропам
        if(scene.children[i].hasOwnProperty("isProp") && scene.children[i].isProp)
        {
            // Удаляем проп если он далеко
            if(scene.children[i].position.x < game.end)
            {
                scene.remove(scene.children[i]);
            }
        }
        // Проходимся по подбераемым вещам
        if(scene.children[i].hasOwnProperty("isBounty") && scene.children[i].isBounty)
        {
            // 
            if(24 > getDistance(scene.children[i],player))
            {
                scene.remove(scene.children[i]);
                sounds.pickup.play();
                params.score += 1;
                ui.score += 1;
            }
        }
        // Проходимся по обьектам угрозы
        if(scene.children[i].hasOwnProperty("isHazard") && scene.children[i].isHazard)
        {
            // 
            if(16 > getDistance(scene.children[i],player))
            {
                alert("Игра окончена, произошла бавовна");
                scene.remove(scene.children[i]);
                params.health -= 1;
            }
        }
    }
    // Первичное создание всех тайлов
    if(tiles == 0)
    {
        let geometry = new THREE.PlaneGeometry(34,34);
        geometry.receiveShadow = true;
        geometry.castShadow = true;
        let darken = new THREE.MeshStandardMaterial({ color: 0x008800 });
        let lighten = new THREE.MeshStandardMaterial({ color: 0x009900 });
        for(let y = 0; y < 5; y++)
        {
            for(let x = 0; x < game.tiles; x++)
            {
                console.log("Рендерим тайлы");
                let tile = new THREE.Mesh(geometry, (x % 2 ^ y % 2) ? darken : lighten);
                tile.isTile = true;
                tile.isMoving = true;
                if(y == 0 || y == 4) tile.isBorder = true;
                tile.rotation.x = -90 * (Math.PI / 180);
                tile.position.set(
                    x*game.tilesize - initial.x, 
                    0, 
                    (y*game.tilesize - initial.y)
                );
                tile.receiveShadow = true;
                tile.castShadow = true;
                scene.add(tile);
            }
        }
    }
    if(models.player.hasOwnProperty("pig"))
    {
        // Создаем игрока
        if(typeof player == "string")
        {
            // Если игрок не создан то создаем
            player = models.player.pig.clone();
            player.scale.set(10,10,10);
            player.receiveShadow = true;
            player.castShadow = true;

            light.target = player;

            scene.add(player);
        }
        else
        {
            const destination = game.tilesize * player_pos.y;
            // Если игрок создан то двигаем его в зависимости от кнопок
            if(player.position.z != destination);
            {
                if(player.position.z > destination) player.position.z -= 4;
                if(destination > player.position.z) player.position.z += 4;
            }
            // Анимация шагания свиньи
            player.rotation.z = 0;
            if(!params.blocked)
            {
                if(Math.floor(params.frame/20) % 2 == 0)
                {
                    player.rotation.z = -0.1;
                }
                else
                {
                    player.rotation.z = 0.1;
                }
            }
            params.frame += 1;
        }
        camera.target = player;
        camera.position.set(
            player.position.x,
            player.position.y + 100,
            player.position.z + 100,
        )
        controls.target.set(player.position.x,player.position.y,player.position.z)
    }
    if(models.player.hasOwnProperty("drone"))
    {
        // Создаем игрока
        if(typeof drone == "string")
        {
            // Если игрок не создан то создаем
            drone = new THREE.Object3D();
            drone.isDrone = true;
            drone.scale.set(7,7,7);
            drone.position.set(-70,30,0);
            drone.receiveShadow = true;
            drone.castShadow = true;
            let base = models.player.drone.clone();
            base.receiveShadow = true;
            base.castShadow = true;
            let rotor1 = models.player.rotor.clone();
            let rotor2 = models.player.rotor.clone();
            let rotor3 = models.player.rotor.clone();
            let rotor4 = models.player.rotor.clone();
            rotor1.isRotor = true;
            rotor2.isRotor = true;
            rotor3.isRotor = true;
            rotor4.isRotor = true;
            rotor1.position.x += 1.8;
            rotor2.position.x -= 1.8;
            rotor3.position.x += 1.8;
            rotor4.position.x -= 1.8;
            rotor1.position.z += 1.8;
            rotor2.position.z += 1.8;
            rotor3.position.z -= 1.8;
            rotor4.position.z -= 1.8;
            base.castShadow = true;
            base.receiveShadow = true;
            drone.add(base);
            drone.add(rotor1);
            drone.add(rotor2);
            drone.add(rotor3);
            drone.add(rotor4);
            scene.add(drone);

            light.castShadow = true;
            light.position.set(drone.position.x, drone.position.y, drone.position.z);
            
            console.log("Дрон поставлен");
        }
        else
        {
            // Расстояние по горизонтали влево/вправо от дрона, доводка
            const destination = game.tilesize * player_pos.y;
            
            // Если игрок создан то двигаем их
            if(drone.position.z != destination);
            {
                drone.rotation.x = 0;
                if(drone.position.z > destination)
                {
                    drone.position.z -= 0.5 + (0.1*ui.score);
                    drone.rotation.x = 0.1;
                }
                if(destination > drone.position.z)
                {
                    drone.position.z += 0.5 + (0.1*ui.score);
                    drone.rotation.x = -0.1;
                }
            }
            // Если свинособака встала, то изображаем сближение с дроном
            if(player.position.x >= drone.position.x && params.blocked)
            {
                // Имитируем сближение с дроном
                if(player.position.x > drone.position.x) drone.position.x += 1;
                if(drone.position.y > 20) drone.position.y -= 0.1;
                drone.rotation.z = -0.1;
            }
            // Если свинья разблокирована то
            if(!params.blocked)
            {
                // Поднимаем дрона назад в воздух и делаем постепенное удаление 
                if(30 > drone.position.y) drone.position.y += 0.1;
                if(drone.position.x > -70) drone.position.x -= 0.1;
                drone.rotation.z = 0;
            }
            // Обрабатываем прыжок
            if(params.space > player.position.y)
            {
                player.position.y += 4;
            }
            else
            {
                if(params.space > 0)
                {
                    params.space -= 2;
                    player.position.y -= 2;
                }
            }
            // Если дрон настиг свинью
            if(1 > (player.position.x - drone.position.x))
            {
                alert("Игра окончена, дрон настиг вас");
            }
            // Вращаем лопости дрона
            for(let oi in drone.children)
            {
                const cmp = drone.children[oi];
                if(cmp.hasOwnProperty("isRotor") && cmp.isRotor)
                {
                    drone.children[oi].rotation.y += 0.5;
                }
            }
        }
    }
    if(typeof player !== "string") light.position.set(player.position.x, player.position.y + 200, player.position.z + 0);
    controls.update(); // Update orbit controls
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    //game.speed = 2 + (0.1 * ui.score);
    setTimeout(() => animate(),1000/144);
}
animate();
function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);