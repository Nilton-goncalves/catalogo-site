const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQrsgLtPNUrQlyn6nuCzYsqbjvDKpoTHhXhMW1szMPiUMvxRoxU38kdICzEJunp0F5Vc6qGDwvk2JPN/pub?gid=0&single=true&output=csv";

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let total = 0;
let produtos = []; // TODOS os produtos

fetch(url)
  .then(res => res.text())
  .then(texto => {
    const linhas = texto.split("\n");
    linhas.shift();

    linhas.forEach(linha => {
      if (!linha) return;
      const colunas = linha.split(",");

      const produto = {
        id: colunas[0],
        nome: colunas[1],
        descricao: colunas [2],
        preco: parseFloat(colunas[3]),
        imagem: colunas[4]
      };

      produtos.push(produto);
    });

    mostrarProdutos(produtos);
    atualizarCarrinho();
  });

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

  botao.onclick = () => {
    adicionarAoCarrinho(produto, parseInt(inputQtd.value));
  };

  document.getElementById("produtos").appendChild(div);
}

function adicionarAoCarrinho(produto, quantidade) {
  const existente = carrinho.find(p => p.id === produto.id);

  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinho.push({
      ...produto,
      quantidade: quantidade
    });
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const ul = document.getElementById("carrinho");
  ul.innerHTML = "";
  total = 0;

  carrinho.forEach((item, index) => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;

    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    li.innerHTML = `
      <span>
        ${item.nome} (${item.quantidade}x) - R$ ${subtotal.toFixed(2)}
      </span>
      <button onclick="removerItem(${index})">❌</button>
    `;

    ul.appendChild(li);
  });

  document.getElementById("total").textContent = total.toFixed(2);
}


function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function enviarWhatsApp() {
  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  let mensagem = "🛒 *NOVO PEDIDO*\n";
  mensagem += "━━━━━━━━━━━━━━━━━━\n\n";

  carrinho.forEach((item, index) => {
    mensagem += `📦 *Item ${index + 1}*\n`;
    mensagem += `${item.nome}\n`;
    mensagem += `Quantidade: ${item.quantidade}\n`;
    mensagem += `Valor unitário: R$ ${item.preco.toFixed(2)}\n`;
    mensagem += `Subtotal: R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
    mensagem += "--------------------------\n";
  });

  mensagem += "\n";
  mensagem += `💰 *TOTAL DO PEDIDO:* R$ ${total.toFixed(2)}\n`;
  mensagem += "━━━━━━━━━━━━━━━━━━\n";
  mensagem += "Obrigado pela preferência! 😊";

  const telefone = ""; // Seu número
  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}


function removerItem(index) {
  carrinho.splice(index, 1); // remove o item do array
  salvarCarrinho();
  atualizarCarrinho();
}

function mostrarProdutos(lista) {
  const container = document.getElementById("produtos");
  container.innerHTML = "";

  lista.forEach(produto => {
    criarProduto(produto);
  });
}


//Barra de busca e produto

function removerAcentos(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filtrarProdutos() {
  const input = document.getElementById("search");
  const filtro = input.value.toLowerCase();
  
  const produtos = document.querySelectorAll("#produtos .produto");

  produtos.forEach(produto => {
    const nomeProduto = produto.textContent.toLowerCase();

    if (nomeProduto.includes(filtro)) {
      produto.style.display = "block";
    } else {
      produto.style.display = "none";
    }
  });
}

    

function limparCarrinho() {
  if (!confirm("Deseja realmente limpar o carrinho?")) return;

  carrinho = [];
  salvarCarrinho();
  atualizarCarrinho();
}
