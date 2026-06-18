<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulador de Voo - Motor 3D</title>
    <link rel="stylesheet" href="style.css">
    
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
            }
        }
    </script>
</head>
<body>
    <div class="cockpit-container" role="main">
        <div class="panel">
            <div class="panel-header">
                <h1>Painel de Voo 3D</h1>
                <p id="instrucoes">Ajuste os controles para pilotar</p>
            </div>

            <div class="control-group full-width">
                <label for="modoSimulacao">Modo de Simulação:</label>
                <select id="modoSimulacao" aria-label="Selecione o modo de simulação" aria-describedby="instrucoes">
                    <option value="orientacao">Modo Orientação (Fixo)</option>
                    <option value="voo">Modo Voo Livre (Dinâmico)</option>
                </select>
            </div>

            <div class="control-group">
                <label for="sliderX">Eixo X (Frente / Trás)</label>
                <input type="range" id="sliderX" min="-10" max="10" step="0.1" value="5" aria-label="Ajuste da direção no eixo X">
                <span id="valX" aria-live="polite">5.0</span>
            </div>

            <div class="control-group">
                <label for="sliderY">Eixo Y (Esquerda / Direita)</label>
                <input type="range" id="sliderY" min="-10" max="10" step="0.1" value="0" aria-label="Ajuste da direção no eixo Y">
                <span id="valY" aria-live="polite">0.0</span>
            </div>

            <div class="control-group">
                <label for="sliderZ">Eixo Z (Subir / Descer)</label>
                <input type="range" id="sliderZ" min="-10" max="10" step="0.1" value="2" aria-label="Ajuste da direção no eixo Z">
                <span id="valZ" aria-live="polite">2.0</span>
            </div>

            <div class="joystick-section full-width">
                <label for="joystick">Volante Virtual</label>
                <p class="hint">Arraste para controlar Frente/Trás e Esquerda/Direita</p>
                <div class="joystick-wrapper">
                    <div class="joystick-container" id="joystick" role="application" aria-label="Volante virtual">
                        <div class="joystick-base"></div>
                        <img id="steeringWheel" src="volante.png" alt="Volante" draggable="false" />
                        <div class="joystick-knob" id="joystick-knob" aria-hidden="true"></div>
                    </div>
                </div>
            </div>

            <div class="status-box full-width">
                <h3>Dados de Navegação:</h3>
                <p id="vector-display" aria-live="polite">Inicializando motor 3D...</p>
            </div>
            
            <div class="button-group full-width">
                <button id="playPauseBtn" aria-label="Pausar ou continuar simulação">Pausar Simulação</button>
                <button id="resetBtn" aria-label="Resetar a posição de voo" class="btn-secondary">Resetar Posição</button>
            </div>

            <div class="settings-divider full-width">Ajustes Avançados</div>

            <div class="control-group">
                <label for="fuselageSize">Escala do Modelo</label>
                <input type="range" id="fuselageSize" min="0.005" max="0.05" step="0.001" value="0.015" aria-label="Escala do modelo do avião">
                <span id="fuselageVal">0.015</span>
            </div>

            <div class="control-group">
                <label for="cameraDist">Distância da Câmera</label>
                <input type="range" id="cameraDist" min="-40" max="-8" step="1" value="-18" aria-label="Distância da câmera">
                <span id="cameraVal">-18</span>
            </div>

            <div class="control-group">
                <label for="joystickSens">Sensibilidade do Volante</label>
                <input type="range" id="joystickSens" min="0.2" max="3" step="0.1" value="1.0" aria-label="Sensibilidade do volante">
                <span id="sensitivityVal">1.0x</span>
            </div>

            <div class="preset-row full-width">
                <button class="preset-btn" data-preset="norte">Norte</button>
                <button class="preset-btn" data-preset="sul">Sul</button>
                <button class="preset-btn" data-preset="horizontal">Horizontal</button>
            </div>
        </div>

        <div id="flight-display" aria-label="Visualização 3D do voo"></div>
    </div>

    <script type="module" src="script.js"></script>
</body>
</html>