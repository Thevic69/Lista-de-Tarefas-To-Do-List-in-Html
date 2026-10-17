# Lista de Tarefas

Aplicação web para organizar tarefas do dia a dia, desenvolvida com HTML, CSS e JavaScript puro, sem frameworks ou bibliotecas externas. É possível adicionar tarefas, marcá-las como concluídas, removê-las e alternar a visualização entre todas, pendentes ou concluídas. As tarefas ficam salvas no navegador e continuam disponíveis ao recarregar a página.

## Funcionalidades

- **Adicionar tarefas**: pelo botão "Adicionar" ou pela tecla `Enter`.
- **Mensagem para entradas vazias**: se o campo estiver em branco ou tiver apenas espaços, nenhuma tarefa é criada e uma mensagem de erro aparece abaixo do campo, que também ganha uma borda vermelha. A mensagem some assim que o usuário começa a digitar.
- **Marcar como concluída**: ao clicar na tarefa, ela recebe um marcador e o texto é riscado. Clicar novamente desfaz a ação.
- **Remover tarefas**: pelo ícone de lixeira de cada item.
- **Filtros**: alternam entre *Todas*, *Pendentes* e *Concluídas*, cada um com um contador atualizado em tempo real.
- **Resumo no topo**: informa quantas tarefas ainda estão pendentes (ou "Tudo concluído!").
- **Mensagens de lista vazia**: cada filtro tem seu próprio aviso quando não há nada a exibir.
- **Persistência**: a lista é salva no `localStorage` do navegador a cada alteração.
- **Tema claro e escuro**: seguem automaticamente a preferência do sistema do usuário.
- **Responsivo e acessível**: funciona em telas de celular e pode ser usado inteiramente pelo teclado (`Tab` para navegar, `Espaço` para concluir, `Enter` para adicionar).

## Como executar

Nenhuma instalação é necessária. Basta abrir o arquivo `index.html` em qualquer navegador moderno, com dois cliques ou pelo menu *Abrir arquivo*.

```bash
git clone https://github.com/seu-usuario/lista-de-tarefas-web.git
cd lista-de-tarefas-web
# Abra o index.html no navegador
```

> Se for abrir pelo VS Code, abra a pasta inteira do projeto (*File → Open Folder*) ou use a extensão *Live Server*, para evitar o bloqueio de arquivos fora de pastas confiáveis.

## Estrutura do projeto

```
.
├── index.html        # Estrutura da página (HTML)
├── css/
│   └── estilo.css    # Apresentação visual (CSS)
├── js/
│   └── script.js     # Estado, eventos e renderização (JavaScript)
└── README.md         # Documentação do projeto
```

Cada tecnologia cuida de uma responsabilidade: o **HTML** define a estrutura, o **CSS** cuida da aparência e o **JavaScript** controla os dados e o comportamento.

## Como o JavaScript funciona

O código segue um ciclo simples e fácil de acompanhar:

1. **O estado vive em um único objeto**, `estadoDaAplicacao`, que guarda a lista de tarefas e o filtro selecionado.
2. **Os eventos apenas atualizam o estado**: clicar, marcar ou enviar o formulário chama uma função que altera os dados.
3. **A interface é redesenhada a partir do estado**: depois de cada alteração, a função `renderizarInterface` reconstrói o resumo, os filtros e a lista na tela.

Esse ciclo evita um problema comum em interfaces dinâmicas: a tela e os dados ficarem fora de sincronia, já que a tela é sempre um reflexo do estado.

### Estrutura dos dados

A lista é um *array* de objetos, um para cada tarefa:

```javascript
{ identificador: 1, texto: "Estudar JavaScript", concluida: false }
```

Cada tarefa tem um `identificador` único, que não se repete mesmo depois de remoções. É por ele que o código sabe qual tarefa deve ser concluída ou removida.

### Principais funções

| Grupo | Funções | Responsabilidade |
|---|---|---|
| Operações sobre o estado | `adicionarTarefa`, `alternarConclusaoDaTarefa`, `removerTarefa`, `definirFiltro` | Alteram a lista de tarefas ou o filtro |
| Consultas | `obterTarefasFiltradas`, `contarTarefasPorFiltro`, `formatarResumoDeTarefas` | Leem o estado sem alterá-lo |
| Renderização | `renderizarInterface`, `renderizarLista`, `renderizarFiltros`, `criarElementoDaTarefa` | Desenham a tela com base no estado |
| Eventos | `tratarEnvioDoFormulario`, `tratarAlteracaoNaLista`, `tratarCliqueNaLista`, `tratarCliqueNosFiltros` | Respondem às ações do usuário |
| Armazenamento | `carregarTarefasSalvas`, `salvarTarefas` | Leem e gravam no `localStorage` |

### Delegação de eventos

Em vez de registrar um "ouvinte" de clique em cada botão de cada tarefa, o código registra **um único ouvinte na lista inteira** e descobre qual elemento foi acionado com `evento.target.closest(...)`. Assim, o mesmo código funciona para qualquer tarefa, inclusive as que ainda serão criadas, e a quantidade de ouvintes não cresce com o tamanho da lista.

## Decisões de segurança e acessibilidade

- **Texto digitado nunca é interpretado como HTML.** Os itens são criados com `createElement` e `textContent`, então algo como `<img src=x onerror=...>` aparece como texto comum, sem ser executado.
- **Dados salvos são validados ao carregar.** Se o conteúdo do `localStorage` estiver corrompido ou em formato inesperado, a aplicação abre com a lista vazia em vez de quebrar.
- **Mensagens de erro são anunciadas por leitores de tela** (`role="alert"`), e o campo recebe `aria-invalid` enquanto estiver inválido.
- **A caixa de seleção nativa é mantida**, apenas escondida visualmente, o que preserva o suporte a teclado e a leitores de tela. O foco é devolvido ao item depois de cada redesenho, para quem navega pelo teclado não perder a posição.
- **O botão de remover tem um nome acessível** que inclui o texto da tarefa (por exemplo, "Remover tarefa: Lavar o carro").
- **Animações respeitam** a preferência do sistema por movimento reduzido.

## Personalização

- **Cores e aparência**: ajuste as variáveis definidas no início de `css/estilo.css`. Há um bloco para o tema claro e outro, dentro de `prefers-color-scheme: dark`, para o escuro.
- **Mensagens de texto**: ficam em constantes no topo de `js/script.js` (`MENSAGEM_PARA_ENTRADA_VAZIA` e `MENSAGENS_DE_LISTA_VAZIA`).
- **Tamanho máximo da tarefa**: controlado pelo atributo `maxlength` do campo, em `index.html` (padrão: 120 caracteres).

## Possíveis melhorias futuras

- Editar o texto de uma tarefa já criada.
- Botão para limpar todas as tarefas concluídas de uma vez.
- Prioridade ou data de vencimento para cada tarefa.
- Reordenar tarefas arrastando e soltando.

## Licença

Este projeto está licenciado sob os termos da licença MIT.
