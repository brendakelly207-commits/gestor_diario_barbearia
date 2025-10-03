(function(){
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));
  const formatMoney = v => '€ ' + Number(v||0).toFixed(2);

  function loadJSON(key, fallback){ try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
  function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  function loadNumber(key, fallback=0){ const v = parseFloat(localStorage.getItem(key)); return isNaN(v) ? fallback : v; }
  function saveNumber(key, val){ localStorage.setItem(key, String(val)); }

  const K_AT = 'atendimentos';
  const K_TR = 'transacoes';
  const K_TOTAL = 'total';

  let atendimentos = loadJSON(K_AT, []);
  let transacoes = loadJSON(K_TR, []);
  let total = loadNumber(K_TOTAL, 0);

  function dateKey(ts){ const d = ts ? new Date(ts) : new Date(); const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const day=('0'+d.getDate()).slice(-2); return `${y}-${m}-${day}`; }

  function persistAll(){
    saveJSON(K_AT, atendimentos);
    saveJSON(K_TR, transacoes);
    saveNumber(K_TOTAL, total);
  }

  // ===== INDEX =====
  const formAtendimento = qs('#formAtendimento');
  const btnAdicionar = qs('#btnAdicionar');
  const listaAtendimentos = qs('#ListaAtendimentos');
  const elTotalDia = qs('#totalDia');
  const elTotalAcumulado = qs('#totalAcumulado');

  function calcTotalDiaFromArray(){
    const todayKey = dateKey();
    return atendimentos.reduce((acc,a)=> dateKey(a.data) === todayKey ? acc+Number(a.valor||0) : acc ,0);
  }

  function renderIndex(){
    if(elTotalDia) elTotalDia.textContent = formatMoney(calcTotalDiaFromArray());
    if(elTotalAcumulado) elTotalAcumulado.textContent = formatMoney(total);

    if(!listaAtendimentos) return;
    listaAtendimentos.innerHTML = '';
    const todayKey = dateKey();
    const todayList = atendimentos.filter(a => dateKey(a.data) === todayKey);

    if(todayList.length === 0){
      listaAtendimentos.innerHTML = '<p>Nenhum atendimento registrado hoje.</p>';
      return;
    }

    todayList.forEach((a) => {
      const globalIndex = atendimentos.indexOf(a);
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.className = 'left';
      left.innerHTML = `<strong>${a.nome}</strong><br><small>${a.servicos.join(', ')}</small>`;
      const right = document.createElement('div');
      right.innerHTML = `<span style="font-weight:800; margin-right:12px">${formatMoney(a.valor)}</span>
                         <button class="btn-delete" data-index="${globalIndex}">❌</button>`;
      li.appendChild(left);
      li.appendChild(right);
      listaAtendimentos.appendChild(li);
    });

    qsa('.btn-delete').forEach(btn=>{
      btn.onclick = () => {
        const i = Number(btn.getAttribute('data-index'));
        if(isNaN(i)) return;
        total -= Number(atendimentos[i].valor || 0);
        atendimentos.splice(i,1);
        persistAll();
        renderIndex();
        renderHistorico();
        renderTotal();
        renderDashboard();
      };
    });
  }

  if(btnAdicionar && formAtendimento){
    btnAdicionar.addEventListener('click', ()=> {
      formAtendimento.classList.toggle('hidden');
      if(!formAtendimento.classList.contains('hidden')){
        setTimeout(()=> formAtendimento.scrollIntoView({behavior:'smooth', block:'center'}),120);
      }
    });
  }

  if(formAtendimento){
    formAtendimento.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const nome = (qs('#nomeCliente') && qs('#nomeCliente').value || '').trim();
      const checkboxes = qsa('#servicos input[type="checkbox"]:checked');
      if(!nome || checkboxes.length===0){ alert('Preencha o nome e selecione pelo menos um serviço.'); return; }
      const servicos = checkboxes.map(c=>c.value);
      const valor = servicos.reduce((s,sv)=> s + Number(qs(`#servicos input[value="${sv}"]`)?.dataset?.valor || 0), 0) || 0;
      const obj = { nome, servicos, valor, data: Date.now() };
      atendimentos.push(obj);
      total += Number(valor);
      persistAll();
      formAtendimento.reset();
      formAtendimento.classList.add('hidden');
      renderIndex();
      renderHistorico();
      renderDashboard();
      renderTotal();
    });
  }

  // ===== HISTÓRICO =====
  const elHistoricoList = qs('#historico-atendimentos');

  function getMonthWeekLabel(d) {
    const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const month = monthNames[d.getMonth()];
    const day = d.getDate();
    const weekOfMonth = Math.ceil(day / 7);
    return `${month} - Semana ${weekOfMonth}`;
  }

  function renderHistorico(){
    if(!elHistoricoList) return;
    elHistoricoList.innerHTML = '';

    if(atendimentos.length===0){
      elHistoricoList.innerHTML = '<p>Nenhum atendimento registrado.</p>';
      return;
    }

    const groups = {};
    atendimentos.forEach(a=>{
      const key = getMonthWeekLabel(new Date(a.data));
      if(!groups[key]) groups[key] = [];
      groups[key].push(a);
    });

    Object.keys(groups).forEach(groupKey=>{
      const card = document.createElement('div');
      card.className = 'card';
      const h = document.createElement('h3');
      h.textContent = groupKey;
      card.appendChild(h);

      groups[groupKey].forEach(a=>{
        const globalIndex = atendimentos.indexOf(a);
        const p = document.createElement('p');
        p.innerHTML = `<strong>${a.nome}</strong> — ${a.servicos.join(', ')} — <span style="font-weight:800">${formatMoney(a.valor)}</span>
                       <button class="btn-delete" data-index="${globalIndex}" style="margin-left:12px">❌</button>`;
        card.appendChild(p);
      });

      elHistoricoList.appendChild(card);
    });

    qsa('.card .btn-delete').forEach(btn=>{
      btn.onclick = ()=>{
        const i = Number(btn.getAttribute('data-index'));
        if(isNaN(i)) return;
        total -= Number(atendimentos[i].valor || 0);
        atendimentos.splice(i,1);
        persistAll();
        renderHistorico();
        renderIndex();
        renderTotal();
        renderDashboard();
      };
    });
  }

  // ===== TOTAL =====
  const formTransacao = qs('#formTransacao');
  const elHistoricoTrans = qs('#historico-list');
  const elTotal = qs('#total');

  function renderTotal(){
    if(elTotal) elTotal.textContent = formatMoney(total);
    if(!elHistoricoTrans) return;

    elHistoricoTrans.innerHTML = '';

    if(transacoes.length === 0){
      elHistoricoTrans.innerHTML = '<p>Nenhuma transação registrada.</p>';
      return;
    }

    transacoes.slice().reverse().forEach((t, idx)=>{
      const li = document.createElement('li');
      li.className = 'card';
      li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
                        <div>
                          <strong>${t.descricao}</strong><br>
                          <small>${new Date(t.data).toLocaleString()}</small>
                        </div>
                        <div style="text-align:right">
                          <div><strong>${formatMoney(t.valor)}</strong></div>
                          <div style="margin-top:6px">
                            <button class="btn-delete" data-index="${transacoes.length-1-idx}">❌</button>
                          </div>
                        </div>
                      </div>`;
      elHistoricoTrans.appendChild(li);
    });

    qsa('#historico-list .btn-delete').forEach(btn=>{
      btn.onclick = ()=>{
        const i = Number(btn.getAttribute('data-index'));
        if(isNaN(i)) return;
        const t = transacoes[i];
        total -= (t.tipo === 'entrada' ? t.valor : -t.valor);
        transacoes.splice(i,1);
        persistAll();
        renderTotal();
        renderIndex();
        renderDashboard();
      };
    });
  }

  if(formTransacao){
    formTransacao.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const descricao = qs('#descricao')?.value?.trim();
      const valor = Number(qs('#valor')?.value || 0);
      const tipo = qs('#tipo')?.value;
      if(!descricao || !valor || !tipo){ alert('Preencha todos os campos da transação.'); return; }
      const obj = { descricao, valor, tipo, data: Date.now() };
      transacoes.push(obj);
      total += (tipo === 'entrada' ? valor : -valor);
      persistAll();
      formTransacao.reset();
      renderTotal();
      renderIndex();
      renderDashboard();
    });
  }

  // ===== DASHBOARD =====
  const graficoAtendimentosEl = qs('#graficoAtendimentos');
  const graficoServicosEl = qs('#graficoServicos');
  let chartAtend, chartServ;

  function renderDashboard(){
    if(!graficoAtendimentosEl && !graficoServicosEl) return;

    // Contagem de atendimentos por mês
    const countsByMonth = {};
    atendimentos.forEach(a=>{
      const d = new Date(a.data);
      const key = `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}`;
      countsByMonth[key] = (countsByMonth[key]||0) + 1;
    });

    const labels = Object.keys(countsByMonth)
      .sort()
      .map(l => {
        const month = Number(l.split('-')[1]);
        const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
        return monthNames[month-1];
      });

    const values = Object.keys(countsByMonth).sort().map(k=> countsByMonth[k] );

    if(graficoAtendimentosEl){
      if(chartAtend) chartAtend.destroy();
      chartAtend = new Chart(graficoAtendimentosEl.getContext('2d'), {
        type:'bar',
        data:{ labels, datasets:[{ label:'Atendimentos por mês', data: values, backgroundColor:'rgba(6,182,212,0.5)', borderColor:'rgba(6,182,212,1)', borderWidth:1 }]},
        options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true } } }
      });
    }

    // Gráfico de serviços
    const servicesCount = {};
    atendimentos.forEach(a=> a.servicos.forEach(s=> servicesCount[s] = (servicesCount[s]||0)+1 ));
    const svcLabels = Object.keys(servicesCount);
    const svcValues = svcLabels.map(l=>servicesCount[l]);

    if(graficoServicosEl){
      if(chartServ) chartServ.destroy();
      chartServ = new Chart(graficoServicosEl.getContext('2d'), {
        type:'pie',
        data:{ labels: svcLabels, datasets:[{ data: svcValues, backgroundColor:[
          '#13546dff','#00e5ff','#05b5ebff','#058accff','#0472a1ff','#25526cff','#047e80ff','#004f5b'] }]},
        options:{ responsive:true, maintainAspectRatio:false }
      });
    }
  }

  // Inicializa tudo
  renderIndex();
  renderHistorico();
  renderTotal();
  renderDashboard();

})();

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("pin-overlay");
  const pinInput = document.getElementById("pin-input");
  const pinBtn = document.getElementById("pin-btn");
  const resetBtn = document.getElementById("reset-btn");
  const pinTitle = document.getElementById("pin-title");
  const pinMsg = document.getElementById("pin-msg");

  let savedPin = localStorage.getItem("userPIN");

  if (savedPin) {
    // Usuário já tem PIN → pede para desbloquear
    pinTitle.textContent = "Digite seu PIN";
    pinBtn.textContent = "Entrar";
    resetBtn.style.display = "block"; // mostra botão de reset
  }

  pinBtn.addEventListener("click", () => {
    const enteredPin = pinInput.value.trim();

    if (!savedPin) {
      // Criar PIN pela primeira vez
      if (enteredPin.length < 4) {
        pinMsg.textContent = "O PIN deve ter pelo menos 4 dígitos.";
        return;
      }
      localStorage.setItem("userPIN", enteredPin);
      overlay.style.display = "none";
    } else {
      // Validar PIN
      if (enteredPin === savedPin) {
        overlay.style.display = "none";
      } else {
        pinMsg.textContent = "PIN incorreto!";
      }
    }
  });

  // Função de reset
  resetBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja redefinir o PIN?")) {
      localStorage.removeItem("userPIN");
      location.reload(); // recarrega e volta para criar novo PIN
    }
  });
});
