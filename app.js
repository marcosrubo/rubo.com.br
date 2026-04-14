const { createClient } = supabase;

const supabaseClient = createClient(
  "https://wwaohtcebmijxgugbihu.supabase.co",
  "sb_publishable_BU6qFD5MDhuUvybtf-ehkw_--JRKqTY"
);

const URL_ATIVIDADES_BASE = "https://atividades-escolares-frontend.vercel.app";

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

const linkAtividadesHero = document.getElementById("linkAtividadesHero");
const linkAtividadesCard = document.getElementById("linkAtividadesCard");

function abrirModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
}

function fecharModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
}

function limparMensagem(elemento) {
  if (!elemento) return;
  elemento.textContent = "";
  elemento.className = "auth-message hidden";
}

function mostrarMensagem(elemento, texto, tipo = "success") {
  if (!elemento) return;
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
  try {
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
  } catch (error) {
    console.error("Erro inesperado ao carregar perfil:", error);
    return null;
  }
}

function atualizarInterfaceLogado(profile, user) {
  if (topbarActions) topbarActions.classList.add("hidden");
  if (topbarUser) topbarUser.classList.remove("hidden");
  if (userDisplayName) userDisplayName.textContent = getDisplayName(profile, user);
}

function atualizarInterfaceDeslogado() {
  if (topbarActions) topbarActions.classList.remove("hidden");
  if (topbarUser) topbarUser.classList.add("hidden");
  if (userDisplayName) userDisplayName.textContent = "Usuário";
}

function construirUrlAtividades({ profile = null, user = null } = {}) {
  const params = new URLSearchParams();
  params.set("origem", "portal");

  const nome = getDisplayName(profile, user);

  if (user) {
    params.set("modo", "logado");
    params.set("nome", nome);
  } else {
    params.set("modo", "anonimo");
  }

  return `${URL_ATIVIDADES_BASE}/?${params.toString()}`;
}

function configurarLinksAtividades({ profile = null, user = null } = {}) {
  const url = construirUrlAtividades({ profile, user });

  [linkAtividadesHero, linkAtividadesCard].forEach((link) => {
    if (!link) return;
    link.href = url;
  });
}

async function verificarSessaoAtual() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
      console.error("Erro ao verificar sessão:", error);
      atualizarInterfaceDeslogado();
      configurarLinksAtividades();
      return;
    }

    const session = data?.session;

    if (!session?.user) {
      atualizarInterfaceDeslogado();
      configurarLinksAtividades();
      return;
    }

    const profile = await carregarPerfil(session.user);
    atualizarInterfaceLogado(profile, session.user);
    configurarLinksAtividades({ profile, user: session.user });
  } catch (error) {
    console.error("Erro inesperado ao verificar sessão:", error);
    atualizarInterfaceDeslogado();
    configurarLinksAtividades();
  }
}

function configurarTogglesSenha() {
  const toggles = document.querySelectorAll(".password-toggle");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("data-target");
      const input = document.getElementById(targetId);

      if (!input) return;

      const mostrando = input.type === "text";
      input.type = mostrando ? "password" : "text";

      toggle.textContent = mostrando ? "👁" : "🙈";
      toggle.classList.toggle("is-visible", !mostrando);
    });
  });
}

function resetCampoSenha(idInput, seletorToggle) {
  const input = document.getElementById(idInput);
  const toggle = document.querySelector(seletorToggle);

  if (input) input.type = "password";
  if (toggle) {
    toggle.textContent = "👁";
    toggle.classList.remove("is-visible");
  }
}

if (btnEntrar) {
  btnEntrar.addEventListener("click", () => {
    limparMensagem(loginMessage);
    if (formEntrar) formEntrar.reset();

    resetCampoSenha("loginSenha", '.password-toggle[data-target="loginSenha"]');
    abrirModal(modalEntrar);
  });
}

if (btnCriarConta) {
  btnCriarConta.addEventListener("click", () => {
    limparMensagem(cadastroMessage);
    if (formCriarConta) formCriarConta.reset();

    resetCampoSenha("cadastroSenha", '.password-toggle[data-target="cadastroSenha"]');
    abrirModal(modalCriarConta);
  });
}

if (btnSaibaMais) {
  btnSaibaMais.addEventListener("click", () => {
    const secaoSobre = document.getElementById("secaoSobre");
    if (secaoSobre) {
      secaoSobre.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

if (btnSair) {
  btnSair.addEventListener("click", async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) throw error;

      atualizarInterfaceDeslogado();
      configurarLinksAtividades();
      window.location.href = "https://rubo.com.br";
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Não foi possível sair da sessão.");
    }
  });
}

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.getAttribute("data-close");
    const modal = document.getElementById(modalId);
    fecharModal(modal);
  });
});

[modalEntrar, modalCriarConta].forEach((modal) => {
  if (!modal) return;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      fecharModal(modal);
    }
  });
});

if (formCriarConta) {
  formCriarConta.addEventListener("submit", async (event) => {
    event.preventDefault();
    limparMensagem(cadastroMessage);

    const nome = document.getElementById("cadastroNome")?.value.trim();
    const email = document.getElementById("cadastroEmail")?.value.trim().toLowerCase();
    const senha = document.getElementById("cadastroSenha")?.value;

    if (!nome || !email || !senha) {
      mostrarMensagem(cadastroMessage, "Preencha todos os campos.", "error");
      return;
    }

    if (senha.length < 6) {
      mostrarMensagem(cadastroMessage, "A senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }

    try {
      if (btnSubmitCriarConta) {
        btnSubmitCriarConta.disabled = true;
        btnSubmitCriarConta.textContent = "Criando conta...";
      }

      const { error } = await supabaseClient.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: "https://rubo.com.br",
          data: { nome }
        }
      });

      if (error) throw error;

      mostrarMensagem(
        cadastroMessage,
        "Conta criada com sucesso. Verifique seu e-mail para confirmar o cadastro.",
        "success"
      );

      formCriarConta.reset();
      resetCampoSenha("cadastroSenha", '.password-toggle[data-target="cadastroSenha"]');
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      mostrarMensagem(
        cadastroMessage,
        error.message || "Não foi possível criar a conta.",
        "error"
      );
    } finally {
      if (btnSubmitCriarConta) {
        btnSubmitCriarConta.disabled = false;
        btnSubmitCriarConta.textContent = "Criar conta";
      }
    }
  });
}

if (formEntrar) {
  formEntrar.addEventListener("submit", async (event) => {
    event.preventDefault();
    limparMensagem(loginMessage);

    const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
    const senha = document.getElementById("loginSenha")?.value;

    if (!email || !senha) {
      mostrarMensagem(loginMessage, "Informe e-mail e senha.", "error");
      return;
    }

    try {
      if (btnSubmitEntrar) {
        btnSubmitEntrar.disabled = true;
        btnSubmitEntrar.textContent = "Entrando...";
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password: senha
      });

      if (error) throw error;
      if (!data?.user) throw new Error("Login não concluído.");

      const profile = await carregarPerfil(data.user);

      configurarLinksAtividades({ profile, user: data.user });

      fecharModal(modalEntrar);
      formEntrar.reset();
      resetCampoSenha("loginSenha", '.password-toggle[data-target="loginSenha"]');

      window.location.href = "https://rubo.com.br";
    } catch (error) {
      console.error("Erro ao entrar:", error);
      mostrarMensagem(
        loginMessage,
        error.message || "Não foi possível entrar.",
        "error"
      );
    } finally {
      if (btnSubmitEntrar) {
        btnSubmitEntrar.disabled = false;
        btnSubmitEntrar.textContent = "Entrar";
      }
    }
  });
}

supabaseClient.auth.onAuthStateChange((_event, _session) => {
  // Mantemos a atualização pelo carregamento da página.
});

configurarTogglesSenha();
configurarLinksAtividades();
verificarSessaoAtual();

