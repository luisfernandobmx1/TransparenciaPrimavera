// URL Base do portal de transparência Fiorilli para Primavera-PE
const URL_BASE = "https://transparenciaprimavera.bm4contabilidade.com.br/Transparencia";

async function carregarDados() {
    const statusDiv = document.getElementById('status');
    const prefeitoDiv = document.getElementById('dados-prefeito');
    const vereadoresDiv = document.getElementById('dados-vereadores');

    statusDiv.style.display = 'block';
    prefeitoDiv.innerHTML = 'Carregando...';
    vereadoresDiv.innerHTML = 'Carregando...';

    // Parâmetros padrão com base na documentação que você enviou
    const anoAtual = "2026";
    const empresaPrefeitura = "1"; 
    const empresaCamara = "2"; // Geralmente a Câmara é ID 2 no sistema Fiorilli

    try {
        // 1. Buscar Contratos/Projetos do Prefeito (Empresa 1)
        const urlContratosPrefeito = `${URL_BASE}/VersaoJson/LicitacoesEContratos/?Listagem=Contratos&Exercicio=${anoAtual}&Empresa=${empresaPrefeitura}&MostraDadosConsolidado=False&ContratosApenasPublicados=False`;
        const contratosPrefeito = await fazerRequisicao(urlContratosPrefeito);

        // 2. Buscar Despesas Gerais da Câmara/Vereadores (Empresa 2)
        // Usando o filtro de janeiro a dezembro do ano atual
        const urlDespesasCamara = `${URL_BASE}/VersaoJson/Despesas/?Listagem=DespesasGerais&DiaInicioPeriodo=01&MesInicialPeriodo=01&DiaFinalPeriodo=31&MesFinalPeriodo=12&Exercicio=${anoAtual}&Empresa=${empresaCamara}&MostrarFornecedor=True&MostraDadosConsolidado=False&UFParaFiltroCOVID=&MostrarCNPJFornecedor=True&ApenasIDEmpenho=False`;
        const despesasCamara = await fazerRequisicao(urlDespesasCamara);

        // Renderizar os dados na tela
        renderizarPrefeito(contratosPrefeito, prefeitoDiv);
        renderizarVereadores(despesasCamara, vereadoresDiv);

    } catch (error) {
        console.error("Erro na execução:", error);
        prefeitoDiv.innerHTML = `<p style="color:red;">Erro ao conectar com a API da Prefeitura. Detalhes: ${error.message}</p>`;
        vereadoresDiv.innerHTML = `<p style="color:red;">Erro ao conectar com a API da Câmara.</p>`;
    } finally {
        statusDiv.style.display = 'none';
    }
}

// Função genérica para fazer o Fetch e tratar JSON
async function fazerRequisicao(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        // Se der erro de CORS (bloqueio do navegador), avisamos o desenvolvedor
        throw new Error("Bloqueio de CORS ou servidor fora do ar. Pode ser necessário um Proxy/Backend.");
    }
}

// Mostra os contratos/obras do Prefeito
function renderizarPrefeito(dados, elemento) {
    if (!dados || dados.length === 0) {
        elemento.innerHTML = "<p>Nenhum contrato listado ou formato inválido retornado pela API.</p>";
        return;
    }

    let html = "<h4>Contratos e Projetos Firmados em 2026:</h4>";
    
    // Iterando sobre os dados retornados (ajuste as propriedades de acordo com o retorno real do JSON)
    dados.slice(0, 5).forEach(contrato => { // Limitando a 5 itens para teste
        html += `
            <div class="item-gasto">
                <p><strong>Objeto/Projeto:</strong> ${contrato.Objeto || contrato.strObjeto || 'Não especificado'}</p>
                <p><strong>Fornecedor:</strong> ${contrato.Contratado || contrato.strRazaoSocial || 'Não informado'}</p>
                <p><strong>Valor do Contrato:</strong> <span class="valor">R$ ${contrato.ValorContrato || contrato.decValor || '0,00'}</span></p>
            </div>
        `;
    });
    elemento.innerHTML = html;
}

// Mostra os gastos da Câmara de Vereadores
function renderizarVereadores(dados, elemento) {
    if (!dados || dados.length === 0) {
        elemento.innerHTML = "<p>Nenhum gasto listado para a Câmara neste período.</p>";
        return;
    }

    let html = "<h4>Principais Despesas da Câmara (Vereadores):</h4>";
    
    dados.slice(0, 5).forEach(despesa => {
        html += `
            <div class="item-gasto">
                <p><strong>Histórico:</strong> ${despesa.Historico || despesa.strHistorico || 'Gasto de gabinete/manutenção'}</p>
                <p><strong>Favorecido:</strong> ${despesa.NomeFornecedor || despesa.strNomeFavorecido || 'Não identificado'}</p>
                <p><strong>Valor Empenhado:</strong> <span class="valor">R$ ${despesa.ValorEmpenho || despesa.decValor || '0,00'}</span></p>
            </div>
        `;
    });
    elemento.innerHTML = html;
}