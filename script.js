function mostrarPagina(pagina) {
    const conteudo = document.getElementById("conteudo");

    if (pagina === "historico") {
        conteudo.innerHTML = "<h2>Histórico de Serviços</h2><p>Aqui vai aparecer a lista de atendimentos.</p>";
    }
    else if (pagina ==="graficos") {
        conteudo.innerHTML = "<h2>Dashboards</h2><p>Aqui vão aparecer os gráficos de atendimento.</p>";    
    }
    else {
        conteudo.innerHTML ="<p>Bem-vindo ao sistema de Gestão Diária do Barbeiro.</p>";
    }
}

//Salvar atendimentos na memória do navegador sem banco de dados.
let atendimentos = [];
let total = 0;

// Pega o formulário
document.getElementById("formAtendimento").addEventListener("submit", function(event) {
    event.preventDefault(); // evita recarregar a página

    // Pega valores
    const descricao = document.getElementById("descricao").value;
    const valor = parseFloat(document.getElementById("valor").value);

    // Cria atendimento
    const atendimento = {
        descricao: descricao,
        valor: valor,
        data: new Date().toLocaleTimeString() // hora do atendimento
    };

    // Adiciona no array
    atendimentos.push(atendimento);

    // Atualiza total
    total += valor;

    // Atualiza tela
    atualizarLista();

    // Limpa inputs
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
});

function atualizarLista() {
    const lista = document.getElementById("listaAtendimentos");
    lista.innerHTML = "";

    atendimentos.forEach((at, index) => {
        const li = document.createElement("li");
        li.textContent = `${at.data} - ${at.descricao} : ${at.valor} €`;
        lista.appendChild(li);
    });

    document.getElementById("totalDia").textContent = total.toFixed(2);
}


