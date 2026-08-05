// ID da sua planilha do Google Sheets
const SPREADSHEET_ID = '1qizKwH5JD_FK7Ogm31seXSmKLs4nBvs3KScFRciHanM'; 

// URLs de busca ajustadas para capturar o intervalo A1:K15 na aba RANKING
const URL_RANKING = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=RANKING&range=A1:K15`;
const URL_JOGOS   = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=JOGOS`;

// Busca os dados da aba RANKING, Período (J1) e Semana (K1)
async function carregarRanking() {
    try {
        const response = await fetch(`${URL_RANKING}&_=${new Date().getTime()}`);
        const text = await response.text();
        const data = JSON.parse(text.substring(47, text.length - 2));
        
        const rows = data.table.rows;

        // Captura do Período (Célula J1 - índice 9) e da Semana (Célula K1 - índice 10)
        let periodo = '7';
        let semana = '';

        if (rows[0] && rows[0].c) {
            const celulaJ1 = rows[0].c[9];
            const celulaK1 = rows[0].c[10];

            if (celulaJ1) periodo = celulaJ1.f || celulaJ1.v || '7';
            if (celulaK1) semana  = celulaK1.f || celulaK1.v || '';
        }

        // Atualiza os cabeçalhos na tela
        const elPeriodo = document.getElementById('ranking-periodo');
        const elSemana = document.getElementById('ranking-semana');
        const elJogosSemana = document.getElementById('jogos-semana');

        if (elPeriodo) elPeriodo.innerText = periodo;

        if (semana !== '') {
            if (elSemana) elSemana.innerText = semana;
            if (elJogosSemana) elJogosSemana.innerText = semana;
        }

        // Preenchimento da Tabela de Ranking
        const tbody = document.getElementById('ranking-body');
        tbody.innerHTML = '';

        rows.forEach(row => {
            const cells = row.c;
            if (!cells || cells.length === 0) return;

            // Filtra para garantir que apenas as linhas com o número da posição (1 a 12) sejam processadas
            const pos = cells[0] ? (cells[0].v !== null ? cells[0].v : '') : '';
            if (!pos || isNaN(pos)) return;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="cell-num">${pos}</td>`;

            const categorias = [
                { nome: cells[1]?.v, papel: cells[2]?.v }, // Ouro
                { nome: cells[3]?.v, papel: cells[4]?.v }, // Prata
                { nome: cells[5]?.v, papel: cells[6]?.v }, // Bronze
                { nome: cells[7]?.v, papel: cells[8]?.v }  // Cobre
            ];

            categorias.forEach(cat => {
                const nomeLimpo = cat.nome ? cat.nome.toString().trim() : '';
                if (nomeLimpo !== '') {
                    const papelTratado = (cat.papel || '').toString().toLowerCase().trim();
                    const classePapel = papelTratado === 'desafiante' ? 'desafiante' : 'desafiado';
                    tr.innerHTML += `<td class="${classePapel}">${nomeLimpo}</td>`;
                } else {
                    tr.innerHTML += `<td class="vazio"></td>`;
                }
            });

            tbody.appendChild(tr);
        });
    } catch (erro) {
        console.error("Erro ao carregar Ranking:", erro);
    }
}

// Busca os dados da aba JOGOS
async function carregarJogos() {
    try {
        const response = await fetch(`${URL_JOGOS}&_=${new Date().getTime()}`);
        const text = await response.text();
        const data = JSON.parse(text.substring(47, text.length - 2));
        
        const rows = data.table.rows;
        const tbody = document.getElementById('jogos-body');
        tbody.innerHTML = '';

        // Pula o cabeçalho da planilha (linha index 0)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row.c) continue;

            const cells = row.c;
            if (!cells[0] || !cells[0].v) continue;

            const categoria  = cells[0]?.v || '';
            const desafiante = cells[1]?.v || '';
            const vs         = cells[2]?.v || 'X';
            const desafiado  = cells[3]?.v || '';
            const mesa       = cells[4]?.v || '';
            const horario    = cells[5]?.v || '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${categoria}</td>
                <td class="col-desafiante-box">${desafiante}</td>
                <td class="col-vs">${vs}</td>
                <td class="col-desafiado-box">${desafiado}</td>
                <td class="col-mesa">${mesa}</td>
                <td>${horario}</td>
            `;
            tbody.appendChild(tr);
        }
    } catch (erro) {
        console.error("Erro ao carregar Jogos:", erro);
    }
}

// Alterna a exibição entre o Slide do Ranking e o Slide dos Jogos
function alternarSlides() {
    const slideRanking = document.getElementById('slide-ranking');
    const slideJogos = document.getElementById('slide-jogos');

    if (slideRanking && slideJogos) {
        if (slideRanking.classList.contains('active')) {
            slideRanking.classList.remove('active');
            slideJogos.classList.add('active');
        } else {
            slideJogos.classList.remove('active');
            slideRanking.classList.add('active');
        }
    }
}

// Execução Inicial ao carregar a página
carregarRanking();
carregarJogos();

// Atualiza os dados da planilha a cada 5 segundos
setInterval(() => {
    carregarRanking();
    carregarJogos();
}, 5000);

// Alterna os slides da TV a cada 20 segundos
setInterval(alternarSlides, 20000);
