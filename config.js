/* ============================================================
   T-JET · CONFIGURAÇÃO DA INSTALAÇÃO

   Edite este arquivo UMA VEZ e suba junto com o index.html.
   Todo aparelho que abrir o app já vem configurado — ninguém
   precisa digitar URL, chave ou token em celular nenhum.

   Para trocar de projeto depois, edite aqui e suba de novo.
   ============================================================ */

var TJET_CONFIG = {

  /* ---------- Identificação ---------- */
  lavajato: {
    nome: '',          // ex.: 'T-Jet Estética Automotiva' — vazio mantém o que está no app
    tel:  ''           // ex.: '5583999990000' (com o 55 na frente)
  },

  /* ---------- Nuvem (Supabase) ----------
     Cole aqui a Project URL e a chave anon public.
     Enquanto url e chave estiverem vazias, o app roda só no aparelho. */
  nuvem: {
    ativa:       false,
    url:         '',    // https://SEUPROJETO.supabase.co
    chave:       '',    // chave anon public (começa com eyJ) — NUNCA a service_role
    loja:        'principal',
    enviarFotos: false, // fotos são pesadas: 500 MB do plano gratuito acabam rápido
    auto:        true   // sincroniza sozinho alguns segundos após cada alteração
  },

  /* ---------- Leitura de placa ----------
     'local'           → leitor embarcado, funciona offline
     'platerecognizer' → API dedicada, bem mais precisa (token obrigatório)
     'proxy'           → seu próprio endpoint (Edge Function, por exemplo) */
  ocr: {
    provedor: 'local',
    token:    '',
    endpoint: ''
  }

};
