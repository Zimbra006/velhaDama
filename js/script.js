// Flag global para saber de quem é o turno
let turnoJogador2 = false;

// FLAGS RELACIONADAS ÀS AÇÕES DO JOGADOR

// Flag global para saber se a primeira peça já foi colocada
let podeColocarPeca = true;

// Flag para saber se já passou da segunda ação
let podeComer = true;

// Flag que lembra a posição da peça que foi comida, caso o jogador queira
// substituí-la por uma peça sua
let pecaSubstituir = -1;

// FLAGS RELACIONADAS À AÇÃO DE COMER

// Flag global para mudar o estado de jogo de "Colocar peça" para "Comer peça"
let comendo = false;

// Flag que lembra a posição da peça selecionada pra comer
let pecaSelecionada = -1;

// Array para armazenar quais peças podem ser comidas
let pecasPraComer = [-1, -1, -1];

// FLAG RELACIONADA À AÇÃO DE SUBSTITUIR

let divSinalizado = null;


// Array que armazena uma cópia (mais simples e acessível) do tabuleiro
/* Legenda:
    - 0: espaço ocupado por uma peça do jogador 1
    - 1: espaço ocupado por uma peça do jogador 2
    - 2: espaço não ocupado por uma peça 
*/
let tabuleiro = [
    2, 2, 2, 2,
    2, 2, 2, 2,
    2, 2, 2, 2,
    2, 2, 2, 2
];

// Array para armazenar as cores dos jogadores 
const cores = [
    "rgb(255, 69, 1)", // Jogador 1 (laranja neon)
    "rgb(29, 243, 1)"  // Jogador 2 (verde neon)
];

// Array para armazenar a quantidade de peças de cada jogador
let pecas = [12, 12];

// Elementos importantes do documento
const gameBoard = document.querySelector(".game-board");
const turno = document.getElementById("turno");
const vitoria = document.getElementById("vitoria");
const botaoTurno = document.getElementById("acabarTurno");
const botaoReiniciar = document.getElementById("reiniciarJogo");
const botaoAjuda = document.getElementById("ajuda");
const contadorLaranja = document.getElementById("contador-laranja");
const contadorVerde = document.getElementById("contador-verde");

// Atualizar a funcionalidade dos botões
botaoTurno.addEventListener("click", TrocaTurno);
botaoReiniciar.addEventListener("click", ReiniciarJogo);
botaoAjuda.addEventListener("click", Ajuda);

// Mostra o painel de regras no começo
Ajuda();

// Atualiza os divs para o tabuleiro
for (let i = 0; i < 16; i++) {
    const div = document.getElementById("peca" + (i).toString());
    div.onclick = function () {

        // Bloco de código para colocar peças
        if (tabuleiro[i] == 2 && (podeColocarPeca || pecaSubstituir == i)) {

            // Se a posição estiver desocupada e colocar
            // uma peça ali for válido de acordo com as regras
            ColocarPeca(div, i);

            ReiniciarFlagsComer();

            pecaSubstituir = -1;
        }
        // Bloco de código para selecionar (ou desselecionar) uma peça para a ação de comer
        else if (tabuleiro[i] == +turnoJogador2 && podeComer) {
            if (!comendo) {
                // Se a posição estiver ocupada pela peça do jogador atual
                // selecione-a para comer uma peça do jogador adversário
                SelecionarPeca(div, i);
            }
            else if (pecaSelecionada == i) {
                // Só sair do estado de "Comer peça" quando clicar novamente na
                // peça selecionada
                ReiniciarFlagsComer();
            }
        }
        // Bloco de código para comer uma peça
        else if (tabuleiro[i] == +!turnoJogador2 && comendo) {
            // Comer peça
            ComerPeca(div, i);

            ReiniciarFlagsComer();
        }
        // Bloco de código se ele clicou onde não devia
        else {
            Erro(div);
        }

        console.log(tabuleiro);

        if (ChecarVitoriaPecas(i)) // Ganhou colocando peça
            Vitoria(turnoJogador2);
        else if (ChecarVitoriaExausto()) // Perdeu todas as peças
            Vitoria(!turnoJogador2);
        else if (ChecarEmpate()) // Nenhum dos dois ganhou
            Empate();
    }
}

function ColocarPeca(div, posicao) {
    tabuleiro[posicao] = +turnoJogador2; // Preenche o espaço no tabuleiro de acordo com o turno

    div.style.backgroundColor = cores[+turnoJogador2];
    div.style.border = "0px solid black"; // Caso a peça tenha sido colocada num espaço sinalizado

    podeColocarPeca = false;

    // Desconta uma peça do jogador
    pecas[+turnoJogador2]--;
    if(turnoJogador2) {
        contadorVerde.innerHTML = (parseInt(contadorVerde.innerHTML) - 1).toString();
    }
    else {
        contadorLaranja.innerHTML = (parseInt(contadorLaranja.innerHTML) - 1).toString();
    }
}

function SelecionarPeca(div, posicao) {
    // Atualizar flags relacionadas a comer com base na seleção atual
    pecaSelecionada = posicao;
    pecasPraComer = PecasPraComer(posicao);
    comendo = true;

    // Indicar a peça selecionada
    div.style.border = "5px solid white";
}

function PecasPraComer(posicao) {
    // Retorna as peças que podem ser comidas

    let coluna = posicao % 4;
    let linha = Math.floor(posicao / 4);

    // Dependendo do quadrante, apenas certos espaços tem que ser verificados
    if (coluna < 2 && linha < 2)
        return [posicao + 1, posicao + 5, posicao + 4];
    else if (coluna < 2 && linha >= 2)
        return [posicao - 4, posicao - 3, posicao + 1];
    else if (coluna >= 2 && linha < 2)
        return [posicao + 4, posicao + 3, posicao - 1];
    else if (coluna >= 2 && linha >= 2)
        return [posicao - 1, posicao - 5, posicao - 4];
}

function ReiniciarFlagsAcoes() {
    podeColocarPeca = true;
    podeComer = true;
    pecaSubstituir = -1;
}

function ComerPeca(divComida, posicao) {
    // Come peça na posição passada como argumento
    
    if (!pecasPraComer.includes(posicao)) {
        console.log("Posição inválida!");
        Erro(divComida);
        return;
    }
    
    // Álgebra para descobrir onde a peça selecionada vai parar após o movimento
    let novaPos = 2*posicao - pecaSelecionada;
    
    // Verificar se existe peça neste local
    if (tabuleiro[novaPos] != 2) {
        console.log("Tem peça no destino!");
        Erro(divComida);
        return;
    }
    
    // Encontrando os divs a serem modificados
    let divPosAnterior  = document.getElementById("peca" + pecaSelecionada.toString());
    let divPosPosterior = document.getElementById("peca" + novaPos.toString());
    
    // Trocar as cores dos divs
    divPosAnterior.style.backgroundColor = "rgb(15, 15, 15)";
    divComida.style.backgroundColor = "rgb(15, 15, 15)";
    divPosPosterior.style.backgroundColor = cores[+turnoJogador2];
    
    // Atualizar o tabuleiro
    tabuleiro[pecaSelecionada] = 2; // Vazio
    tabuleiro[posicao] = 2; // Vazio
    tabuleiro[novaPos] = +turnoJogador2;
    
    // Não deixar colocar mais peças
    podeColocarPeca = false;
    
    // Não deixar comer outra peça
    podeComer = false;
    
    // Indicar que peça foi comida, para ser substituida
    pecaSubstituir = posicao;

    // Indicar que pode colocar peça no tabuleiro
    let rgbValues = cores[+turnoJogador2].substring(4, cores[+turnoJogador2].length - 1);
    divComida.style.border = "5px solid rgba(" + rgbValues + ", 0.3)";
    divSinalizado = divComida;
}

function ReiniciarFlagsComer() {
    // Voltar a borda da peça selecionada ao normal, se tiver alguma peça selecionada
    let divSelecionado = document.getElementById("peca" + pecaSelecionada.toString());
    if (divSelecionado) divSelecionado.style.border = "0px solid black";

    // Limpar as flags para a próxima seleção
    pecaSelecionada = -1;
    pecasPraComer = [-1, -1, -1];
    comendo = false;
}

function TrocaTurno() {
    turno.innerHTML = turnoJogador2 ? "laranjas" : "verdes";
    turnoJogador2   = !turnoJogador2;
    turno.className = "cor-jogador-" + ((+turnoJogador2) + 1).toString();

    ReiniciarFlagsAcoes();

    // Tira a sinalização da última borda sinalizada
    if (divSinalizado) {
        divSinalizado.style.border = "0px solid black";
        divSinalizado = null;
    }
}

function ChecarVitoriaExausto() {
    // Checar por vitória caso um jogador esteja sem peças
    return pecas[+turnoJogador2] <= 0;
}

function ChecarVitoriaPecas(posicao) {
    // Checa por vitória no caso do jogador ter completado uma sequência de peças

    // A posição atual é um múltiplo de 4 (comecoLinha)
    // adicionado de um offset (comecoColuna)
    let comecoColuna = posicao % 4;
    let comecoLinha = posicao - comecoColuna;

    // Flags de vitória
    let vitoriaPorColuna = true, vitoriaPorLinha = true
    let vitoriaPorDiagonal1 = true, vitoriaPorDiagonal2 = true

    // Checar coluna onde a peça foi colocada
    for (let i = 0; i < 4; i++) {
        if (tabuleiro[comecoColuna + i * 4] != +turnoJogador2) vitoriaPorColuna = false;
    }

    // Checar linha onde a peça foi colocada
    for (let i = 0; i < 4; i++) {
        if (tabuleiro[comecoLinha + i] != +turnoJogador2) vitoriaPorLinha = false;
    }

    // Checar diagonal 1
    for (let i = 0; i < 4; i++) {
        // Os índices da primeira diagonal são 0, 5, 10 e 15
        if (tabuleiro[i * 5] != +turnoJogador2) vitoriaPorDiagonal1 = false;
    }

    // Checar diagonal 2
    for (let i = 0; i < 4; i++) {
        // Os índices da segunda diagonal são 3, 6, 9 e 12
        if (tabuleiro[3 + i * 3] != +turnoJogador2) vitoriaPorDiagonal2 = false;
    }

    return (vitoriaPorColuna || vitoriaPorLinha || vitoriaPorDiagonal1 || vitoriaPorDiagonal2);
}

function Vitoria(jogador) {
    // Imprime vitória na tela e impede de clicar no tabuleiro
    let div = document.createElement("div");
    div.innerHTML = "VITÓRIA DAS";
    vitoria.appendChild(div);

    div = document.createElement("div");
    div.innerHTML = !jogador ? "LARANJAS" : "VERDES";
    div.className = "cor-jogador-" + ((+jogador) + 1).toString();
    vitoria.appendChild(div);

    gameBoard.style.pointerEvents = "none";
}

function ChecarEmpate() {
    // Checa se todos os espaços estão preenchidos
    for (let i = 0; i < tabuleiro.length; i++) {
        if (tabuleiro[i] == 2) return false;
    }

    return true;
}

function Empate() {

    // Imprime empate na tela e impede de clicar no tabuleiro
    let div = document.createElement("div");
    div.innerHTML = "EMPATE";
    vitoria.appendChild(div);

    gameBoard.style.pointerEvents = "none";
}

function ReiniciarJogo() {
    tabuleiro = [
        2, 2, 2, 2,
        2, 2, 2, 2,
        2, 2, 2, 2,
        2, 2, 2, 2,
    ]

    gameBoard.querySelectorAll('.game-item').forEach(element => {
        element.style.backgroundColor = "rgb(15, 15, 15)";
    });

    // Tira a sinalização da última borda sinalizada
    if (divSinalizado) {
        divSinalizado.style.border = "0px solid black";
        divSinalizado = null;
    }

    turnoJogador2 = false;
    pecas = [12, 12];
    while (vitoria.hasChildNodes()) {
        vitoria.removeChild(vitoria.firstChild);
    }
    turno.innerHTML = "laranjas";
    turno.className = "cor-jogador-1";
    gameBoard.style.pointerEvents = "auto";

    contadorLaranja.innerHTML = "12";
    contadorVerde.innerHTML = "12";

    ReiniciarFlagsAcoes();
    ReiniciarFlagsComer();
}

function Erro(div) {
    // Faz o div reagir a um clique que geraria erro
    div.classList.add("erro");

    setTimeout(() => {
        div.classList.remove("erro");
    }, 400);
}

function Ajuda() {
    // Cria um div contendo um painel com as regras
    const divFundo = document.createElement("div");
    divFundo.className = "painel-ajuda-fundo";

    const divWrapper = document.createElement("div");
    divWrapper.className = "painel-ajuda-wrapper";

    // Cria o texto com a explicação do jogo
    const divTexto = document.createElement("div");
    divTexto.className = "painel-ajuda";

    var texto = document.createElement("h1");
    texto.style.textAlign = "center";
    texto.innerHTML = "REGRAS";
    divTexto.appendChild(texto);

    texto = document.createElement("p");
    texto.innerHTML = "Cada jogador possuí 12 peças.";
    divTexto.appendChild(texto);

    texto = document.createElement("p");
    texto.innerHTML = "O primeiro jogador é o ganhador de uma rodada de pedra-papel-tesoura.";
    divTexto.appendChild(texto);

    // Cria espaço entre as linhas
    divTexto.appendChild(document.createElement("br"));

    texto = document.createElement("p");
    texto.innerHTML = "No seu turno, ao menos uma de três ações deve acontecer:";
    divTexto.appendChild(texto);

    texto = document.createElement("p");
    texto.innerHTML = "1. Colocar uma peça";
    divTexto.appendChild(texto);

    texto = document.createElement("p");
    texto.innerHTML = "2. Comer uma peça do adversário";
    divTexto.appendChild(texto);

    var lista = document.createElement("ul");
    texto = document.createElement("li");
    texto.innerHTML = "Se você não tiver colocado uma peça, não poderá colocar após esta ação.";
    lista.appendChild(texto);

    texto = document.createElement("li");
    texto.innerHTML = "Apenas uma ação de comer pode acontecer por turno.";
    lista.appendChild(texto);

    divTexto.appendChild(lista);

    texto = document.createElement("p");
    texto.innerHTML = "3. Substituir uma peça comida."
    divTexto.appendChild(texto);

    lista = document.createElement("ul");
    texto = document.createElement("li");
    texto.innerHTML = "Após comer uma peça adversária, você pode colocar uma das suas peças no lugar da peça comida.";
    lista.appendChild(texto);

    divTexto.appendChild(lista);

    var divTemp = document.createElement("div");
    divTemp.style.display = "flex";

    texto = document.createElement("p");
    texto.innerHTML = "Para terminar seu turno, clique em";
    divTemp.appendChild(texto);

    texto = document.createElement("span");
    texto.className = "material-symbols-rounded";
    texto.innerHTML = "check";
    divTemp.appendChild(texto);

    divTexto.appendChild(divTemp);
    
    // Cria espaço entre as linhas
    divTexto.appendChild(document.createElement("br"));

    texto = document.createElement("p");
    texto.innerHTML = "Ganha o primeiro jogador a completar uma linha, coluna ou diagonal.";
    divTexto.appendChild(texto);

    texto = document.createElement("p");
    texto.innerHTML = "Se um jogador não tiver mais peças e não tiver completado uma sequência de peças descrita acima, a vitória é do outro jogador.";
    divTexto.appendChild(texto);

    texto = document.createElement("p");
    texto.innerHTML = "É considerado empate quando todo o tabuleiro tiver sido preenchido mas nenhum jogador tiver ganhado.";
    divTexto.appendChild(texto);

    // Cria espaço entre as linhas
    divTexto.appendChild(document.createElement("br"));

    var divTemp = document.createElement("div");
    divTemp.style.display = "flex";

    texto = document.createElement("p");
    texto.innerHTML = "Para reiniciar o jogo, clique em";
    divTemp.appendChild(texto);

    texto = document.createElement("span");
    texto.className = "material-symbols-rounded";
    texto.innerHTML = "refresh";
    divTemp.appendChild(texto);

    divTexto.appendChild(divTemp);

    divWrapper.appendChild(divTexto);
    divFundo.appendChild(divWrapper);

    divFundo.onclick = function() {
        document.getElementById("game-wrapper").style.pointerEvents = "auto";
        this.remove();
    }
    // Adiciona esse painel ao corpo
    document.body.appendChild(divFundo);

    

    // Impede o click no resto da tela
    document.getElementById("game-wrapper").style.pointerEvents = "none";
}