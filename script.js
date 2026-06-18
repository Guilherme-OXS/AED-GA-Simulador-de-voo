import * as THREE from 'three';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. CONFIGURAÇÕES E ESTADO
    // ==========================================
    const CONFIG = {
        velocidadeCruzeiro: 0.1, // Velocidade base do avião
        distanciaCamera: { x: 0, y: 7, z: -18 }
    };

    const STATE = {
        pos: new THREE.Vector3(0, 10, 0),
        yaw: 0, // Controla a rotação infinita para os lados (Heading)
        isRunning: true
    };

    window.isDraggingUI = false; 

    // ==========================================
    // 2. CAPTURA DE ELEMENTOS DO DOM
    // ==========================================
    const DOM = {
        sliders: {
            x: document.getElementById('sliderX'),
            y: document.getElementById('sliderY'), 
            z: document.getElementById('sliderZ')  
        },
        labels: {
            x: document.getElementById('valX'),
            y: document.getElementById('valY'),
            z: document.getElementById('valZ')
        },
        display: {
            vector: document.getElementById('vector-display'),
            flight: document.getElementById('flight-display')
        },
        controls: {
            modo: document.getElementById('modoSimulacao'),
            resetBtn: document.getElementById('resetBtn'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            fuselageSize: document.getElementById('fuselageSize'),
            cameraDist: document.getElementById('cameraDist'),
            joystickSens: document.getElementById('joystickSens')
        }
    };

    // ==========================================
    // 3. CONFIGURAÇÃO DO THREE.JS
    // ==========================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 
    scene.fog = new THREE.Fog(0x87CEEB, 20, 150); 

    const camera = new THREE.PerspectiveCamera(60, DOM.display.flight.clientWidth / DOM.display.flight.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(DOM.display.flight.clientWidth, DOM.display.flight.clientHeight);
    DOM.display.flight.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const size = 300;
    const divisions = 100;
    const gridHelper = new THREE.GridHelper(size, divisions, 0x00ff41, 0x0f3460);
    scene.add(gridHelper);

    // ==========================================
    // 4. CARREGAMENTO DO AVIÃO OBJ/MTL
    // ==========================================
    const aviao = new THREE.Group();
    scene.add(aviao);
    let modelMesh = null;

    const mtlLoader = new MTLLoader();
    mtlLoader.load('11805_airplane_v2_L2.mtl', function (materials) {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('11805_airplane_v2_L2.obj', function (object) {
            modelMesh = object;
            const initialScale = parseFloat(DOM.controls.fuselageSize?.value) || 0.015;
            modelMesh.scale.set(initialScale, initialScale, initialScale);
            modelMesh.rotation.y = Math.PI;
            modelMesh.rotation.x = Math.PI / 2;
            modelMesh.rotation.z = 0;
            aviao.add(modelMesh);
        });
    });

    aviao.position.copy(STATE.pos);

    // ==========================================
    // 5. EVENTOS DA INTERFACE
    // ==========================================
    Object.keys(DOM.sliders).forEach(eixo => {
        DOM.sliders[eixo].addEventListener('input', (event) => {
            let valor = parseFloat(event.target.value);
            if (isNaN(valor)) valor = 0; 
            DOM.labels[eixo].innerText = valor.toFixed(1);

            // Animação visual do volante
            if (!window.isDraggingUI && (eixo === 'x' || eixo === 'y')) {
                const wheel = document.getElementById('steeringWheel');
                const knob = document.getElementById('joystick-knob');
                const joystick = document.getElementById('joystick');
                
                if (wheel) {
                    const rot = (parseFloat(DOM.sliders.y.value) / 10) * 120; 
                    wheel.style.transform = `rotate(${rot}deg)`;
                }
                
                if (knob && joystick) {
                    const normX = parseFloat(DOM.sliders.y.value) / 10;
                    const normY = parseFloat(DOM.sliders.x.value) / 10;
                    const rect = joystick.getBoundingClientRect();
                    const radius = Math.min(rect.width, rect.height) / 2 - 15;
                    knob.style.transform = `translate(${normX * radius}px, ${-normY * radius}px)`;
                }
            }
        });
    });

    // === Joystick Virtual ===
    const joystick = document.getElementById('joystick');
    const knob = document.getElementById('joystick-knob');
    let pointerId = null;

    function resetKnob() {
        knob.style.transform = `translate(0px, 0px)`;
    }

    function updateFromJoystick(normX, normY) {
        const sensitivity = parseFloat(DOM.controls.joystickSens?.value) || 1.0;
        const mappedX = Math.round((-normY) * 100 * sensitivity) / 10; 
        const mappedY = Math.round((normX) * 100 * sensitivity) / 10;  
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
        DOM.sliders.x.value = clamp(mappedX, -10, 10);
        DOM.sliders.y.value = clamp(mappedY, -10, 10);
        DOM.sliders.x.dispatchEvent(new Event('input'));
        DOM.sliders.y.dispatchEvent(new Event('input'));
    }

    if (joystick && knob) {
        const wheel = document.getElementById('steeringWheel');
        let wheelPointerId = null;

        if (wheel) {
            wheel.ondragstart = () => false;
            wheel.addEventListener('dragstart', (ev) => ev.preventDefault());
            wheel.style.touchAction = 'none';
        }

        joystick.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            pointerId = e.pointerId;
            window.isDraggingUI = true; 
            joystick.setPointerCapture(pointerId);
            if (e.target === wheel || wheel.contains(e.target)) {
                wheelPointerId = e.pointerId;
            }
        });

        joystick.addEventListener('pointermove', (e) => {
            if (pointerId !== e.pointerId) return;
            const rect = joystick.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            const normX = Math.max(-1, Math.min(1, dx));
            const normY = Math.max(-1, Math.min(1, dy));
            
            const radius = Math.min(rect.width, rect.height) / 2 - 15;
            knob.style.transform = `translate(${normX * radius}px, ${normY * radius}px)`;
            
            updateFromJoystick(normX, normY);

            if (wheelPointerId === e.pointerId) {
                const ang = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
                let rot = ang + 90; 
                if (rot > 180) rot -= 360; 
                rot = Math.max(-120, Math.min(120, rot));
                if (wheel) wheel.style.transform = `rotate(${rot}deg)`;
                
                const mappedY = Math.round((rot / 120) * 10 * 10) / 10; 
                DOM.sliders.y.value = Math.max(-10, Math.min(10, mappedY));
                DOM.sliders.y.dispatchEvent(new Event('input'));
            }
        });

        const releaseUI = (e) => {
            if (pointerId !== e.pointerId) return;
            joystick.releasePointerCapture(pointerId);
            pointerId = null;
            window.isDraggingUI = false;
            resetKnob();
            DOM.sliders.x.value = 0; DOM.sliders.y.value = 0;
            DOM.sliders.x.dispatchEvent(new Event('input'));
            DOM.sliders.y.dispatchEvent(new Event('input'));

            if (wheelPointerId === e.pointerId) {
                wheelPointerId = null;
                if (wheel) {
                    wheel.style.transition = 'transform 0.25s ease';
                    wheel.style.transform = `rotate(0deg)`;
                    setTimeout(() => { if (wheel) wheel.style.transition = ''; }, 300);
                }
            }
        };

        joystick.addEventListener('pointerup', releaseUI);
        joystick.addEventListener('pointercancel', releaseUI);
    }

    // ==========================================
    // 6. CONTROLE POR TECLADO (WASD + Setas)
    // ==========================================
    const TECLAS = { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false };

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (TECLAS.hasOwnProperty(key)) {
            TECLAS[key] = true;
            if (key === 'arrowup' || key === 'arrowdown') e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (TECLAS.hasOwnProperty(key)) TECLAS[key] = false;
    });

    function processarTeclado() {
        if (window.isDraggingUI) return; 

        const velAperto = 0.5;   
        const velRetorno = 0.8;  
        let mudou = false;

        // X (Frente/Trás -> Acelerador) -> W e S
        let valX = parseFloat(DOM.sliders.x.value);
        if (TECLAS.w) { valX += velAperto; mudou = true; }
        else if (TECLAS.s) { valX -= velAperto; mudou = true; }
        else if (valX !== 0 && STATE.isRunning) { 
            if (Math.abs(valX) < velRetorno) valX = 0;
            else valX += valX > 0 ? -velRetorno : velRetorno;
            mudou = true;
        }

        // Y (Esq/Dir -> Rotação do Volante) -> A e D
        let valY = parseFloat(DOM.sliders.y.value);
        if (TECLAS.a) { valY -= velAperto; mudou = true; }
        else if (TECLAS.d) { valY += velAperto; mudou = true; }
        else if (valY !== 0 && STATE.isRunning) { 
            if (Math.abs(valY) < velRetorno) valY = 0;
            else valY += valY > 0 ? -velRetorno : velRetorno;
            mudou = true;
        }

        // Z (Sobe/Desce) -> Setas
        let valZ = parseFloat(DOM.sliders.z.value);
        if (TECLAS.arrowup) { valZ += velAperto; mudou = true; }
        else if (TECLAS.arrowdown) { valZ -= velAperto; mudou = true; }
        else if (valZ !== 0 && STATE.isRunning) {
            if (Math.abs(valZ) < velRetorno) valZ = 0;
            else valZ += valZ > 0 ? -velRetorno : velRetorno;
            mudou = true;
        }

        if (mudou) {
            DOM.sliders.x.value = Math.max(-10, Math.min(10, valX));
            DOM.sliders.y.value = Math.max(-10, Math.min(10, valY));
            DOM.sliders.z.value = Math.max(-10, Math.min(10, valZ));

            DOM.sliders.x.dispatchEvent(new Event('input'));
            DOM.sliders.y.dispatchEvent(new Event('input'));
            DOM.sliders.z.dispatchEvent(new Event('input'));
        }
    }

    // ==========================================
    // 7. BOTÕES DE AJUSTE
    // ==========================================
    const sensitivityVal = document.getElementById('sensitivityVal');
    if (DOM.controls.joystickSens) {
        DOM.controls.joystickSens.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            sensitivityVal.innerText = v.toFixed(1) + 'x';
        });
    }

    DOM.controls.resetBtn.addEventListener('click', () => {
        STATE.pos.set(0, 10, 0); 
        STATE.yaw = 0; // Reseta a bússola para o Norte
        aviao.position.copy(STATE.pos);
    });

    DOM.controls.playPauseBtn.addEventListener('click', () => {
        STATE.isRunning = !STATE.isRunning;
        DOM.controls.playPauseBtn.classList.toggle('paused');
        DOM.controls.playPauseBtn.innerText = STATE.isRunning ? "Pausar Simulação" : "Continuar Simulação";
    });

    const fuselageVal = document.getElementById('fuselageVal');
    if (DOM.controls.fuselageSize) {
        DOM.controls.fuselageSize.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            fuselageVal.innerText = val.toFixed(3);
            if (modelMesh) modelMesh.scale.set(val, val, val);
        });
    }

    const cameraVal = document.getElementById('cameraVal');
    if (DOM.controls.cameraDist) {
        DOM.controls.cameraDist.addEventListener('input', (e) => {
            const z = parseFloat(e.target.value);
            cameraVal.innerText = z.toFixed(0);
            CONFIG.distanciaCamera.z = z;
        });
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            const p = ev.currentTarget.dataset.preset;
            if (p === 'norte') { STATE.yaw = 0; }
            else if (p === 'sul') { STATE.yaw = Math.PI; } 
            else if (p === 'horizontal') { DOM.sliders.z.value = 0; DOM.sliders.z.dispatchEvent(new Event('input')); }
        });
    });

    window.addEventListener('resize', () => {
        camera.aspect = DOM.display.flight.clientWidth / DOM.display.flight.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(DOM.display.flight.clientWidth, DOM.display.flight.clientHeight);
    });

    // ==========================================
    // 8. MOTOR DE RENDERIZAÇÃO E NOVO MODELO DE VOO
    // ==========================================
    function loopSimulador() {
        requestAnimationFrame(loopSimulador);
        processarTeclado();

        if (STATE.isRunning) {
            // 1. ROTAÇÃO (Curva Infinita)
            // O slider Y agora não é uma coordenada fixa, é a TAXA de curva.
            const turnRate = parseFloat(DOM.sliders.y.value) * 0.003; 
            
            // CORREÇÃO AQUI: Subtrair o turnRate alinha o visual com a física
            STATE.yaw -= turnRate; 

            // 2. INCLINAÇÃO (Pitch)
            // Limitado a subir/descer 60 graus para o avião não capotar
            const pitchRate = parseFloat(DOM.sliders.z.value) / 10;
            const pitch = pitchRate * (Math.PI / 3); 

            // Calcula o vetor de direção para onde o nariz está apontando
            const dirX = Math.sin(STATE.yaw) * Math.cos(pitch);
            const dirY = Math.sin(pitch);
            const dirZ = Math.cos(STATE.yaw) * Math.cos(pitch);
            const direcao = new THREE.Vector3(dirX, dirY, dirZ).normalize();

            // Rotaciona fisicamente o modelo na cena
            const alvoLookAt = aviao.position.clone().add(direcao);
            aviao.lookAt(alvoLookAt);

            if (DOM.controls.modo.value === 'voo') {
                // 3. ACELERAÇÃO
                // Slider X (W/S) atua como acelerador. 
                // Se 0, voa em velocidade de cruzeiro. Se 10, voa com o dobro da velocidade.
                let multiplicadorVelocidade = 1 + (parseFloat(DOM.sliders.x.value) / 10);
                multiplicadorVelocidade = Math.max(0, multiplicadorVelocidade); // Impede voar de ré
                
                // Move o avião pra frente
                aviao.position.add(direcao.multiplyScalar(CONFIG.velocidadeCruzeiro * multiplicadorVelocidade));
                
                // Limite do chão
                if (aviao.position.y < 0.5) aviao.position.y = 0.5;
                STATE.pos.copy(aviao.position);
            }

            // Atualização do Painel de Texto (Agora inclui a Bússola 0-360º)
            if (DOM.controls.modo.value === 'voo') {
                DOM.display.vector.innerText = `Posição:\n[X: ${aviao.position.x.toFixed(1)}, ALT: ${aviao.position.y.toFixed(1)}, Z: ${aviao.position.z.toFixed(1)}]`;
            } else {
                let compass = (STATE.yaw * 180 / Math.PI) % 360;
                if (compass < 0) compass += 360;
                DOM.display.vector.innerText = `Bússola: ${compass.toFixed(0)}°\nInclinação: ${(pitchRate * 60).toFixed(0)}°\nAcelerador: ${DOM.sliders.x.value}`;
            }

            // Câmera Persegue
            const cameraRelativeOffset = new THREE.Vector3(CONFIG.distanciaCamera.x, CONFIG.distanciaCamera.y, CONFIG.distanciaCamera.z);
            const cameraOffsetRotated = cameraRelativeOffset.applyQuaternion(aviao.quaternion);
            const cameraTargetPos = aviao.position.clone().add(cameraOffsetRotated);
            
            camera.position.lerp(cameraTargetPos, 0.1); 
            camera.lookAt(aviao.position); 
        }

        renderer.render(scene, camera);
    }

    loopSimulador();
});