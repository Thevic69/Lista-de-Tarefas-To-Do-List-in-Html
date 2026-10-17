/**
 * Lista de Tarefas
 * -----------------
 * O funcionamento segue um ciclo simples e previsível:
 *
 *   1. O estado da aplicação vive em um único objeto (`estadoDaAplicacao`),
 *      que guarda a lista de tarefas e o filtro selecionado.
 *   2. Os eventos (cliques, envio do formulário) apenas ATUALIZAM o estado.
 *   3. Depois de cada atualização, a interface é REDESENHADA a partir do estado.
 *
 * Cada tarefa é um objeto com o formato:
 *   { identificador: 1, texto: "Estudar JavaScript", concluida: false }
 */

const CHAVE_DE_ARMAZENAMENTO = "lista-de-tarefas-web";

const FILTRO_TODAS = "todas";
const FILTRO_PENDENTES = "pendentes";
const FILTRO_CONCLUIDAS = "concluidas";
const FILTROS_VALIDOS = [FILTRO_TODAS, FILTRO_PENDENTES, FILTRO_CONCLUIDAS];

const MENSAGEM_PARA_ENTRADA_VAZIA = "Digite uma descrição para a tarefa.";

const MENSAGENS_DE_LISTA_VAZIA = {
    [FILTRO_TODAS]: "Nenhuma tarefa por aqui. Adicione a primeira acima.",
    [FILTRO_PENDENTES]: "Nenhuma tarefa pendente. Bom trabalho!",
    [FILTRO_CONCLUIDAS]: "Nenhuma tarefa concluída ainda.",
};

const ICONE_DE_REMOCAO = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="4 7 6 7 20 7"></polyline>
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
        <path d="M19 7l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7"></path>
    </svg>
`;

const estadoDaAplicacao = {
    tarefas: [],
    filtroAtual: FILTRO_TODAS,
    proximoIdentificador: 1,
    identificadorDaTarefaRecemAdicionada: null,
};

const elementos = {
    formulario: document.getElementById("formulario-de-tarefa"),
    campoDeTarefa: document.getElementById("campo-de-tarefa"),
    mensagemDeErro: document.getElementById("mensagem-de-erro"),
    resumoDeTarefas: document.getElementById("resumo-de-tarefas"),
    filtros: document.getElementById("filtros-de-tarefas"),
    listaDeTarefas: document.getElementById("lista-de-tarefas"),
    mensagemDeListaVazia: document.getElementById("mensagem-de-lista-vazia"),
};

/* =========================================================
   ARMAZENAMENTO NO NAVEGADOR
   ========================================================= */

function ehTarefaValida(tarefa) {
    return (
        tarefa !== null &&
        typeof tarefa === "object" &&
        typeof tarefa.identificador === "number" &&
        typeof tarefa.texto === "string" &&
        typeof tarefa.concluida === "boolean"
    );
}

function carregarTarefasSalvas() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_DE_ARMAZENAMENTO);

        if (!dadosSalvos) {
            return [];
        }

        const tarefasSalvas = JSON.parse(dadosSalvos);
        return Array.isArray(tarefasSalvas) ? tarefasSalvas.filter(ehTarefaValida) : [];
    } catch (erro) {
        // Dados corrompidos ou armazenamento indisponível: começa com a lista vazia.
        return [];
    }
}

function salvarTarefas() {
    try {
        localStorage.setItem(CHAVE_DE_ARMAZENAMENTO, JSON.stringify(estadoDaAplicacao.tarefas));
    } catch (erro) {
        // Se o armazenamento estiver indisponível, o app segue funcionando em memória.
    }
}

function calcularProximoIdentificador(tarefas) {
    const maiorIdentificador = tarefas.reduce(
        (maiorValorEncontrado, tarefa) => Math.max(maiorValorEncontrado, tarefa.identificador),
        0
    );
    return maiorIdentificador + 1;
}

/* =========================================================
   OPERAÇÕES SOBRE O ESTADO
   ========================================================= */

function criarTarefa(texto) {
    const novaTarefa = {
        identificador: estadoDaAplicacao.proximoIdentificador,
        texto: texto,
        concluida: false,
    };

    estadoDaAplicacao.proximoIdentificador += 1;
    return novaTarefa;
}

function obterErroDeValidacao(textoLimpo) {
    if (textoLimpo === "") {
        return MENSAGEM_PARA_ENTRADA_VAZIA;
    }
    return null;
}

function adicionarTarefa(textoDigitado) {
    const textoLimpo = textoDigitado.trim();
    const erroDeValidacao = obterErroDeValidacao(textoLimpo);

    if (erroDeValidacao) {
        exibirMensagemDeErro(erroDeValidacao);
        return false;
    }

    const novaTarefa = criarTarefa(textoLimpo);
    estadoDaAplicacao.tarefas.push(novaTarefa);
    estadoDaAplicacao.identificadorDaTarefaRecemAdicionada = novaTarefa.identificador;

    // Uma tarefa nova é sempre pendente: no filtro "Concluídas" ela ficaria invisível.
    if (estadoDaAplicacao.filtroAtual === FILTRO_CONCLUIDAS) {
        estadoDaAplicacao.filtroAtual = FILTRO_TODAS;
    }

    salvarTarefas();
    renderizarInterface();
    return true;
}

function alternarConclusaoDaTarefa(identificador) {
    const tarefaEncontrada = estadoDaAplicacao.tarefas.find(
        (tarefa) => tarefa.identificador === identificador
    );

    if (!tarefaEncontrada) {
        return;
    }

    tarefaEncontrada.concluida = !tarefaEncontrada.concluida;
    salvarTarefas();
    renderizarInterface();
}

function removerTarefa(identificador) {
    estadoDaAplicacao.tarefas = estadoDaAplicacao.tarefas.filter(
        (tarefa) => tarefa.identificador !== identificador
    );
    salvarTarefas();
    renderizarInterface();
}

function definirFiltro(novoFiltro) {
    if (!FILTROS_VALIDOS.includes(novoFiltro)) {
        return;
    }

    estadoDaAplicacao.filtroAtual = novoFiltro;
    renderizarInterface();
}

/* =========================================================
   CONSULTAS SOBRE O ESTADO
   ========================================================= */

function obterTarefasFiltradas() {
    const { tarefas, filtroAtual } = estadoDaAplicacao;

    if (filtroAtual === FILTRO_PENDENTES) {
        return tarefas.filter((tarefa) => !tarefa.concluida);
    }

    if (filtroAtual === FILTRO_CONCLUIDAS) {
        return tarefas.filter((tarefa) => tarefa.concluida);
    }

    return tarefas;
}

function contarTarefasPorFiltro() {
    const { tarefas } = estadoDaAplicacao;
    const totalDeConcluidas = tarefas.filter((tarefa) => tarefa.concluida).length;

    return {
        [FILTRO_TODAS]: tarefas.length,
        [FILTRO_PENDENTES]: tarefas.length - totalDeConcluidas,
        [FILTRO_CONCLUIDAS]: totalDeConcluidas,
    };
}

function formatarResumoDeTarefas(contagem) {
    const totalDePendentes = contagem[FILTRO_PENDENTES];

    if (contagem[FILTRO_TODAS] > 0 && totalDePendentes === 0) {
        return "Tudo concluído!";
    }

    if (totalDePendentes === 0) {
        return "Nenhuma tarefa pendente";
    }

    if (totalDePendentes === 1) {
        return "1 tarefa pendente";
    }

    return `${totalDePendentes} tarefas pendentes`;
}

/* =========================================================
   MENSAGENS DE ERRO DO FORMULÁRIO
   ========================================================= */

function exibirMensagemDeErro(mensagem) {
    elementos.mensagemDeErro.textContent = mensagem;
    elementos.campoDeTarefa.classList.add("campo-invalido");
    elementos.campoDeTarefa.setAttribute("aria-invalid", "true");
}

function limparMensagemDeErro() {
    elementos.mensagemDeErro.textContent = "";
    elementos.campoDeTarefa.classList.remove("campo-invalido");
    elementos.campoDeTarefa.removeAttribute("aria-invalid");
}

/* =========================================================
   RENDERIZAÇÃO (REDESENHO DA INTERFACE A PARTIR DO ESTADO)
   ========================================================= */

function criarElementoDaTarefa(tarefa) {
    const item = document.createElement("li");
    item.className = "tarefa";
    item.dataset.identificador = String(tarefa.identificador);
    item.classList.toggle("tarefa-concluida", tarefa.concluida);
    item.classList.toggle(
        "tarefa-nova",
        tarefa.identificador === estadoDaAplicacao.identificadorDaTarefaRecemAdicionada
    );

    const rotulo = document.createElement("label");
    rotulo.className = "tarefa-conteudo";

    const caixaDeSelecao = document.createElement("input");
    caixaDeSelecao.type = "checkbox";
    caixaDeSelecao.className = "tarefa-caixa";
    caixaDeSelecao.checked = tarefa.concluida;

    const marcador = document.createElement("span");
    marcador.className = "tarefa-marcador";
    marcador.setAttribute("aria-hidden", "true");

    // O texto é inserido com textContent (nunca como HTML), o que impede
    // que o conteúdo digitado pelo usuário seja interpretado como código.
    const textoDaTarefa = document.createElement("span");
    textoDaTarefa.className = "tarefa-texto";
    textoDaTarefa.textContent = tarefa.texto;

    rotulo.append(caixaDeSelecao, marcador, textoDaTarefa);

    const botaoDeRemocao = document.createElement("button");
    botaoDeRemocao.type = "button";
    botaoDeRemocao.className = "tarefa-remover";
    botaoDeRemocao.setAttribute("aria-label", `Remover tarefa: ${tarefa.texto}`);
    botaoDeRemocao.innerHTML = ICONE_DE_REMOCAO;

    item.append(rotulo, botaoDeRemocao);
    return item;
}

function renderizarResumo(contagem) {
    elementos.resumoDeTarefas.textContent = formatarResumoDeTarefas(contagem);
}

function renderizarFiltros(contagem) {
    elementos.filtros.querySelectorAll("[data-filtro]").forEach((botao) => {
        const ehFiltroAtual = botao.dataset.filtro === estadoDaAplicacao.filtroAtual;
        botao.classList.toggle("filtro-ativo", ehFiltroAtual);
        botao.setAttribute("aria-pressed", String(ehFiltroAtual));
    });

    elementos.filtros.querySelectorAll("[data-contador]").forEach((contador) => {
        contador.textContent = String(contagem[contador.dataset.contador]);
    });
}

function renderizarLista() {
    const tarefasVisiveis = obterTarefasFiltradas();
    const fragmentoDaLista = document.createDocumentFragment();

    tarefasVisiveis.forEach((tarefa) => {
        fragmentoDaLista.appendChild(criarElementoDaTarefa(tarefa));
    });

    elementos.listaDeTarefas.replaceChildren(fragmentoDaLista);

    elementos.mensagemDeListaVazia.textContent =
        tarefasVisiveis.length === 0 ? MENSAGENS_DE_LISTA_VAZIA[estadoDaAplicacao.filtroAtual] : "";

    // A animação de entrada vale apenas uma vez, para a tarefa recém-criada.
    estadoDaAplicacao.identificadorDaTarefaRecemAdicionada = null;
}

function renderizarInterface() {
    const contagem = contarTarefasPorFiltro();

    renderizarResumo(contagem);
    renderizarFiltros(contagem);
    renderizarLista();
}

function devolverFocoParaCaixaDaTarefa(identificador) {
    // Como a lista é redesenhada, o elemento focado deixa de existir.
    // Devolver o foco evita que quem usa o teclado perca sua posição.
    const caixaDeSelecao = elementos.listaDeTarefas.querySelector(
        `[data-identificador="${identificador}"] .tarefa-caixa`
    );

    if (caixaDeSelecao) {
        caixaDeSelecao.focus();
    }
}

/* =========================================================
   TRATAMENTO DE EVENTOS
   ========================================================= */

function obterIdentificadorDaTarefaDoElemento(elemento) {
    return Number(elemento.closest(".tarefa").dataset.identificador);
}

function tratarEnvioDoFormulario(evento) {
    evento.preventDefault();

    const tarefaFoiAdicionada = adicionarTarefa(elementos.campoDeTarefa.value);

    if (tarefaFoiAdicionada) {
        elementos.campoDeTarefa.value = "";
        limparMensagemDeErro();
    }

    elementos.campoDeTarefa.focus();
}

function tratarCliqueNosFiltros(evento) {
    const botaoDoFiltro = evento.target.closest("[data-filtro]");

    if (botaoDoFiltro) {
        definirFiltro(botaoDoFiltro.dataset.filtro);
    }
}

function tratarAlteracaoNaLista(evento) {
    const caixaDeSelecao = evento.target.closest(".tarefa-caixa");

    if (!caixaDeSelecao) {
        return;
    }

    const identificador = obterIdentificadorDaTarefaDoElemento(caixaDeSelecao);
    alternarConclusaoDaTarefa(identificador);
    devolverFocoParaCaixaDaTarefa(identificador);
}

function tratarCliqueNaLista(evento) {
    const botaoDeRemocao = evento.target.closest(".tarefa-remover");

    if (botaoDeRemocao) {
        removerTarefa(obterIdentificadorDaTarefaDoElemento(botaoDeRemocao));
    }
}

function configurarEventos() {
    elementos.formulario.addEventListener("submit", tratarEnvioDoFormulario);
    elementos.campoDeTarefa.addEventListener("input", limparMensagemDeErro);

    // Um único "ouvinte" por região (delegação de eventos): funciona para
    // qualquer tarefa, inclusive as criadas depois do carregamento da página.
    elementos.filtros.addEventListener("click", tratarCliqueNosFiltros);
    elementos.listaDeTarefas.addEventListener("change", tratarAlteracaoNaLista);
    elementos.listaDeTarefas.addEventListener("click", tratarCliqueNaLista);
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarAplicacao() {
    estadoDaAplicacao.tarefas = carregarTarefasSalvas();
    estadoDaAplicacao.proximoIdentificador = calcularProximoIdentificador(estadoDaAplicacao.tarefas);

    configurarEventos();
    renderizarInterface();
}

inicializarAplicacao();
