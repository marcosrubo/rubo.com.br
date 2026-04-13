const { createClient } = supabase;

const supabaseClient = createClient(
  "https://wwaohtcebmijxgugbihu.supabase.co",
  "sb_publishable_BU6qFD5MDhuUvybtf-ehkw_--JRKqTY"
);

const btnEntrar = document.getElementById("btnEntrar");
const btnCriarConta = document.getElementById("btnCriarConta");
const btnSaibaMais = document.getElementById("btnSaibaMais");
const btnSair = document.getElementById("btnSair");

const topbarActions = document.getElementById("topbarActions");
const topbarUser = document.getElementById("topbarUser");
const userDisplayName = document.getElementById("userDisplayName");

const modalEntrar = document.getElementById("modalEntrar");
const modalCriarConta = document.getElementById("modalCriarConta");

const formEntrar = document.getElementById("formEntrar");
const formCriarConta = document.getElementById("formCriarConta");

const loginMessage = document.getElementById("loginMessage");
const cadastroMessage = document.getElementById("cadastroMessage");

const btnSubmitEntrar = document.getElementById("btnSubmitEntrar");
const btnSubmitCriarConta = document.getElementById("btnSubmitCriarConta");

function abrirModal(modal) {
  modal.classList.remove("hidden");
}

function fecharModal(modal) {
  modal.classList.add("hidden");
}

function limparMensagem(elemento) {
  elemento.textContent = "";
  elemento.className = "auth-message hidden";
}

function mostrarMensagem(elemento, texto, tipo = "success") {
  elemento.textContent = texto;
  elemento.className = `auth-message ${tipo}`;
}

function getDisplayName(profile, user) {
  if (profile?.nome && String(profile.nome).trim()) {
    return String(profile.nome).trim();
  }

  const nomeMeta = user?.user_metadata?.nome;
  if (nomeMeta && String(nomeMeta).trim()) {
    return String(nomeMeta).trim();
  }

  const email = user?.email || "";
  if (email.includes("@")) {
    return email.split("@")[0];
  }

  return "Usuário";
}

async function carregarPerfil(user) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar perfil:", error);
    return null;
  }

  return data;
}

function atualizarInterfaceLogado(profile, user) {
  topbarActions.classList.add("hidden");
  topbarUser.classList.remove("hidden");
  userDisplayName.textContent = getDisplayName(profile, user);
}

function atualizarInterfaceDeslogado() {
  topbarActions.classList.remove("hidden");
  topbarUser.classList.add("hidden");
  userDisplayName.textContent = "Usuário";
}

async function verificarSessaoAtual() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Erro ao verificar sessão:", error);
    atualizarInterfaceDeslogado();
    return;
  }

  const session = data?.session;

  if (!session?.user) {
    atualizarInterfaceDeslogado();
    return;
  }

  const profile = await carregarPerfil(session.user);
  atualizarInterfaceLogado(profile, session.user);
}

btnEntrar.addEventListener("click", () => {
  limparMensagem(loginMessage);
  formEntrar.reset();
  abrirModal(modalEntrar);
});

btnCriarConta.addEventListener("click", () => {
  limparMensagem(cadastroMessage);
  formCriarConta.reset();
  abrirModal(modalCriarConta);
});

btnSaibaMais.addEventListener("click", () => {
  const secaoSobre = document.getElementById("secaoSobre");
  if (secaoSobre) {
    secaoSobre.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

btnSair.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Não foi possível sair da sessão.");
    return;
  }

  atualizarInterfaceDeslogado();
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.getAttribute("data-close");
    const modal = document.getElementById(modalId);
    if (modal) fecharModal(modal);
  });
});

[modalEntrar, modalCriarConta].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      fecharModal(modal);
    }
  });
});

formCriarConta.addEventListener("submit", async (event) => {
  event.preventDefault();
  limparMensagem(cadastroMessage);

  const nome = document.getElementById("cadastroNome").value.trim();
  const email = document.getElementById("cadastroEmail").value.trim().toLowerCase();
  const senha = document.getElementById("cadastroSenha").value;

  if (!nome || !email || !senha) {
    mostrarMensagem(cadastroMessage, "Preencha todos os campos.", "error");
    return;
  }

  if (senha.length < 6) {
    mostrarMensagem(cadastroMessage, "A senha deve ter pelo menos 6 caracteres.", "error");
    return;
  }

  try {
    btnSubmitCriarConta.disabled = true;
    btnSubmitCriarConta.textContent = "Criando conta...";

    const { error } = await supabaseClient.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nome
        }
      }
    });

    if (error) {
      throw error;
    }

    mostrarMensagem(
      cadastroMessage,
      "Conta criada com sucesso. Verifique seu e-mail para confirmar o cadastro.",
      "success"
    );

    formCriarConta.reset();
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    mostrarMensagem(
      cadastroMessage,
      error.message || "Não foi possível criar a conta.",
      "error"
    );
  } finally {
    btnSubmitCriarConta.disabled = false;
    btnSubmitCriarConta.textContent = "Criar conta";
  }
});

formEntrar.addEventListener("submit", async (event) => {
  event.preventDefault();
  limparMensagem(loginMessage);

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const senha = document.getElementById("loginSenha").value;

  if (!email || !senha) {
    mostrarMensagem(loginMessage, "Informe e-mail e senha.", "error");
    return;
  }

  try {
    btnSubmitEntrar.disabled = true;
    btnSubmitEntrar.textContent = "Entrando...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      throw error;
    }

    const user = data?.user;

    if (!user) {
      throw new Error("Login não concluído.");
    }

    const profile = await carregarPerfil(user);

    atualizarInterfaceLogado(profile, user);
    fecharModal(modalEntrar);
    formEntrar.reset();
  } catch (error) {
    console.error("Erro ao entrar:", error);
    mostrarMensagem(
      loginMessage,
      error.message || "Não foi possível entrar.",
      "error"
    );
  } finally {
    btnSubmitEntrar.disabled = false;
    btnSubmitEntrar.textContent = "Entrar";
  }
});

supabaseClient.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    const profile = await carregarPerfil(session.user);
    atualizarInterfaceLogado(profile, session.user);
  } else {
    atualizarInterfaceDeslogado();
  }
});

verificarSessaoAtual();


