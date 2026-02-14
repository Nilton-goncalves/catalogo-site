/* ===================================================
   APP CATALOGO - ESTRUTURA PROFISSIONAL
=================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ============================
     CONFIG
  ============================ */

  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQrsgLtPNUrQlyn6nuCzYsqbjvDKpoTHhXhMW1szMPiUMvxRoxU38kdICzEJunp0F5Vc6qGDwvk2JPN/pub?gid=0&single=true&output=csv";

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  let produtos = [];
  let total = 0;

  /* ============================
     ELEMENTOS DOM
  ============================ */

  const elProdutos = document.getElementById("produtos");
  const elCarrinho = document.getElementById("carrinho");
  const elTotal = document.getElementById("total");
  const sidebar = document.getElementById("sidebar");
  const handle = document.getElementById("cart-handle");

  /* ============================
     PRODUTOS
  ============================ */

  function criarProduto(produto) {

    const div = document.createElement("div");
    div.className = "produto";

    div.innerHTML = `
      <img src="${produto.imagem}">
      <h3>${produto.nome}</h3>
      <h4>R$ ${produto.preco.toFixed(2)}</h4>
      <p>${produto.descricao}</p>

      <div class="quantidade-container">
        <input type="number" min="1" value="1">
        <span>Qtd</span>
      </div>

      <button>Adicionar</button>
    `;

    const inputQtd = div.querySelector("input");
    const botao = div.querySelector("button");

    botao.addEventListener("click", () => {
      adicionarAoCarrinho(produto, parseInt(inputQtd.value));
    });

    elProdutos.appendChild(div);
  }

  function mostrarProdutos(lista) {
    elProdutos.innerHTML = "";
    lista.forEach(criarProduto);
  }

  /* ============================
     CARRINHO
  ============================ */

  function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  }

  function adicionarAoCarrinho(produto, quantidade) {

    const existente = carrinho.find(p => p.id === produto.id);

    if (existente) {
      existente.quantidade += quantidade;
    } else {
      carrinho.push({ ...produto, quantidade });
    }

    salvarCarrinho();
    atualizarCarrinho();

    // abre automaticamente no mobile (UX melhor)
    sidebar?.classList.add("open");
  }

  function atualizarCarrinho() {

    elCarrinho.innerHTML = "";
    total = 0;

    carrinho.forEach((item, index) => {

      const subtotal = item.preco * item.quantidade;
      total += subtotal;

      const li = document.createElement("li");

      li.innerHTML = `
        <span>${item.nome} (${item.quantidade}x) - R$ ${subtotal.toFixed(2)}</span>
        <button data-index="${index}">❌</button>
      `;

      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";

      li.querySelector("button").onclick = () => removerItem(index);

      elCarrinho.appendChild(li);
    });

    elTotal.textContent = total.toFixed(2);
  }

  function removerItem(index) {
    carrinho.splice(index, 1);
    salvarCarrinho();
    atualizarCarrinho();
  }

  window.limparCarrinho = function () {
    if (!confirm("Deseja realmente limpar o carrinho?")) return;

    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();
  };

  /* ============================
     WHATSAPP
  ============================ */

  window.enviarWhatsApp = function () {

    if (!carrinho.length) {
      alert("Carrinho vazio!");
      return;
    }

    let mensagem = "🛒 *NOVO PEDIDO*\n━━━━━━━━━━━━━━━━━━\n\n";

    carrinho.forEach((item, i) => {
      mensagem += `📦 *Item ${i + 1}*\n`;
      mensagem += `${item.nome}\n`;
      mensagem += `Quantidade: ${item.quantidade}\n`;
      mensagem += `Subtotal: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
      mensagem += "--------------------------\n";
    });

    mensagem += `\n💰 *TOTAL:* R$ ${total.toFixed(2)}\n`;

    const telefone = "";
    const link = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

    window.open(link, "_blank");
  };

  /* ============================
     BUSCA
  ============================ */

  function normalizar(txt) {
    return txt.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  window.filtrarProdutos = function () {

    const filtro = normalizar(
      document.getElementById("search").value
    );

    document.querySelectorAll(".produto").forEach(card => {

      const texto = normalizar(card.textContent);

      card.style.display =
        texto.includes(filtro) ? "block" : "none";
    });
  };

  /* ============================
     DRAWER MOBILE
  ============================ */

  handle?.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  /* ============================
     FETCH PRODUTOS
  ============================ */

  fetch(url)
    .then(res => res.text())
    .then(texto => {

      const linhas = texto.split("\n");
      linhas.shift();

      linhas.forEach(linha => {
        if (!linha) return;

        const c = linha.split(",");

        produtos.push({
          id: c[0],
          nome: c[1],
          descricao: c[2],
          preco: parseFloat(c[3]),
          imagem: c[4]
        });
      });

      mostrarProdutos(produtos);
      atualizarCarrinho();
    })
    .catch(err => console.error("Erro ao carregar produtos:", err));

});

/* ============================
   AUTO UPDATE (ANTI CACHE)
============================ */

const VERSION = "1.0.0";

const savedVersion = localStorage.getItem("site_version");

if (savedVersion !== VERSION) {
  localStorage.setItem("site_version", VERSION);

  // força reload limpo
  window.location.reload(true);
}
