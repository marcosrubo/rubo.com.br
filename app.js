const btnEntrar = document.getElementById("btnEntrar");
const btnCriarConta = document.getElementById("btnCriarConta");
const btnSaibaMais = document.getElementById("btnSaibaMais");

btnEntrar.addEventListener("click", () => {
  alert("Em breve: tela de login do Portal RUBO.");
});

btnCriarConta.addEventListener("click", () => {
  alert("Em breve: criação de conta com validação por e-mail.");
});

btnSaibaMais.addEventListener("click", () => {
  const secaoSobre = document.getElementById("secaoSobre");
  if (secaoSobre) {
    secaoSobre.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});