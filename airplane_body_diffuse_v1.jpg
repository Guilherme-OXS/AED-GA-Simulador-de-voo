# Simulador de Voo - Vetores 3D

Um simulador front-end simples utilizando **Plotly.js** para visualização 3D de vetores de direção. O usuário pode manipular coordenadas nos eixos X, Y e Z para alterar a orientação da aeronave em tempo real ou iniciar um modo de voo livre dinâmico.

## Tecnologias e Decisões de Arquitetura
- **HTML5, CSS3, JavaScript (Vanilla)**: Nenhuma etapa de build obrigatória.
- **Plotly.js (WebGL 3D)**: Renderização eficiente com separação entre a criação do layout (`Plotly.newPlot`) e as atualizações de frame a frame (`Plotly.update`), o que elimina o recálculo redundante do DOM (Layout Thrashing).
- **Page Visibility API**: A simulação interrompe automaticamente a renderização de gráficos se a aba do navegador for desfocada ou minimizada, poupando processamento e memória.
- **Limitador de FPS**: Travado na constante de 30 Frames Per Second (ajustável no objeto `CONFIG`), garantindo fluidez visual sem uso abusivo da CPU do cliente.

## Funcionalidades
- **Modo Orientação**: Apenas atualiza a direção do vetor unitário.
- **Modo Voo Livre**: A posição é calculada a cada frame baseada na direção dos vetores, criando movimento contínuo na tela.
- **Normalização Matemática**: Vetores de fuselagem e asas calculados dinamicamente com base nas interações do usuário, mantendo tamanho consistente.
- **Play/Pause**: Opção de interromper o motor físico do simulador.

## Como usar
Abra o arquivo `index.html` diretamente em seu navegador. Não há necessidade de build ou de um servidor local obrigatório. Dependências importadas via CDN em tempo real.