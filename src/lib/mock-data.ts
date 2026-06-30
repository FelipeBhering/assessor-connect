export type RiskProfile = "Conservador" | "Moderado" | "Arrojado";
export type Origin = "Indicação" | "Evento" | "Redes Sociais" | "Site" | "Parceria";
export type InteractionType = "WhatsApp" | "Reunião" | "Email" | "Ligação";
export type PipelineStage =
  | "Prospect"
  | "KYC"
  | "Análise de Risco"
  | "Assinatura"
  | "Primeiro Aporte"
  | "Crescimento"
  | "Reativação";

export interface Interaction {
  id: string;
  clientId: string;
  type: InteractionType;
  date: string; // ISO
  summary: string;
  aiSummary?: string;
}

export interface PortfolioProduct {
  name: string;
  value: number;
  maturity?: string;
  yield: string;
  category: "Renda Fixa" | "Renda Variável" | "FIIs" | "Internacional";
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  aum: number;
  profile: RiskProfile;
  origin: Origin;
  lastContact: string; // ISO
  nextAction: string;
  tags: string[];
  notes: string;
  suitabilityExpires: string;
  portfolio: PortfolioProduct[];
}

export interface PipelineCard {
  id: string;
  clientName: string;
  estimatedAum: number;
  daysInStage: number;
  origin: Origin;
  stage: PipelineStage;
}

export interface AgendaEvent {
  id: string;
  clientName: string;
  type: "Reunião" | "Ligação" | "WhatsApp";
  day: number; // 0=Mon..4=Fri
  startHour: number; // 8..18
  duration: number; // hours
}

export interface Template {
  id: string;
  title: string;
  preview: string;
  channel: "WhatsApp" | "Email";
}

export interface SentMessage {
  id: string;
  clientName: string;
  template: string;
  channel: "WhatsApp" | "Email";
  date: string;
  status: "Enviado" | "Agendado" | "Falhou";
}

// ----- helpers
const today = new Date();
const iso = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
};

// ----- 18 clients
export const clients: Client[] = [
  {
    id: "c1", name: "Ana Beatriz Carvalho", email: "ana.carvalho@email.com", phone: "+55 11 98123-4501",
    city: "São Paulo, SP", aum: 2_450_000, profile: "Moderado", origin: "Indicação",
    lastContact: iso(-3), nextAction: "Revisar carteira Q2",
    tags: ["VIP", "Indicador"], notes: "Cliente desde 2019. Filha entrando na faculdade.",
    suitabilityExpires: iso(180),
    portfolio: [
      { name: "CDB Banco BTG 110% CDI", value: 800_000, maturity: iso(220), yield: "13.4% a.a.", category: "Renda Fixa" },
      { name: "Tesouro IPCA+ 2035", value: 350_000, maturity: "2035-05-15", yield: "IPCA+6.1%", category: "Renda Fixa" },
      { name: "ITSA4, PETR4, VALE3", value: 620_000, yield: "—", category: "Renda Variável" },
      { name: "HGLG11, KNRI11", value: 380_000, yield: "8.2% a.a.", category: "FIIs" },
      { name: "ETF IVVB11", value: 300_000, yield: "—", category: "Internacional" },
    ],
  },
  {
    id: "c2", name: "Ricardo Almeida Souza", email: "ricardo.souza@email.com", phone: "+55 11 99876-1122",
    city: "São Paulo, SP", aum: 7_800_000, profile: "Arrojado", origin: "Evento",
    lastContact: iso(-18), nextAction: "Apresentar private equity",
    tags: ["Top 10", "Empresário"], notes: "Sócio de holding. Apetite alto para alternativos.",
    suitabilityExpires: iso(90),
    portfolio: [
      { name: "Ações Brasil (carteira ativa)", value: 3_200_000, yield: "—", category: "Renda Variável" },
      { name: "Private Equity FIP", value: 2_100_000, maturity: "2030-12-01", yield: "Meta 18% a.a.", category: "Renda Variável" },
      { name: "Tesouro Selic", value: 800_000, yield: "Selic", category: "Renda Fixa" },
      { name: "FIIs Logística", value: 700_000, yield: "9.1% a.a.", category: "FIIs" },
      { name: "REITs EUA", value: 1_000_000, yield: "—", category: "Internacional" },
    ],
  },
  {
    id: "c3", name: "Mariana Lopes Ferreira", email: "mari.lopes@email.com", phone: "+55 21 98711-2233",
    city: "Rio de Janeiro, RJ", aum: 420_000, profile: "Conservador", origin: "Redes Sociais",
    lastContact: iso(-9), nextAction: "Renovar suitability",
    tags: ["Novo cliente"], notes: "Médica, foco em previdência.",
    suitabilityExpires: iso(20),
    portfolio: [
      { name: "LCI Itaú", value: 200_000, maturity: iso(7), yield: "95% CDI", category: "Renda Fixa" },
      { name: "Tesouro IPCA+ 2029", value: 150_000, maturity: "2029-08-15", yield: "IPCA+5.9%", category: "Renda Fixa" },
      { name: "Previdência PGBL", value: 70_000, yield: "—", category: "Renda Fixa" },
    ],
  },
  {
    id: "c4", name: "João Pedro Nogueira", email: "joao.nogueira@email.com", phone: "+55 31 98444-5566",
    city: "Belo Horizonte, MG", aum: 1_150_000, profile: "Moderado", origin: "Indicação",
    lastContact: iso(-22), nextAction: "Reativar relacionamento",
    tags: ["Reativação"], notes: "Sem contato há quase um mês.",
    suitabilityExpires: iso(45),
    portfolio: [
      { name: "CDB Pan 105% CDI", value: 500_000, maturity: iso(400), yield: "12.5% a.a.", category: "Renda Fixa" },
      { name: "Carteira de Ações", value: 350_000, yield: "—", category: "Renda Variável" },
      { name: "FIIs Tijolo", value: 200_000, yield: "8.5% a.a.", category: "FIIs" },
      { name: "ETF Mundial", value: 100_000, yield: "—", category: "Internacional" },
    ],
  },
  {
    id: "c5", name: "Camila Rocha Pinto", email: "camila.rocha@email.com", phone: "+55 11 97002-9988",
    city: "Campinas, SP", aum: 285_000, profile: "Conservador", origin: "Site",
    lastContact: iso(-2), nextAction: "Enviar relatório mensal",
    tags: [], notes: "Cliente cautelosa, prefere renda fixa pós-fixada.",
    suitabilityExpires: iso(300),
    portfolio: [
      { name: "Tesouro Selic", value: 180_000, yield: "Selic", category: "Renda Fixa" },
      { name: "CDB Inter 100% CDI", value: 105_000, maturity: iso(180), yield: "100% CDI", category: "Renda Fixa" },
    ],
  },
  {
    id: "c6", name: "Felipe Costa Andrade", email: "f.andrade@email.com", phone: "+55 47 99110-2244",
    city: "Florianópolis, SC", aum: 3_900_000, profile: "Arrojado", origin: "Indicação",
    lastContact: iso(-6), nextAction: "Discutir alocação internacional",
    tags: ["VIP"], notes: "Aniversário de investimento em 5 dias.",
    suitabilityExpires: iso(150),
    portfolio: [
      { name: "Ações Globais (BDRs)", value: 1_400_000, yield: "—", category: "Internacional" },
      { name: "Ações Brasil", value: 1_100_000, yield: "—", category: "Renda Variável" },
      { name: "Debêntures Incentivadas", value: 800_000, maturity: "2031-06-01", yield: "IPCA+7.2%", category: "Renda Fixa" },
      { name: "FII de Papel", value: 600_000, yield: "10.3% a.a.", category: "FIIs" },
    ],
  },
  {
    id: "c7", name: "Patrícia Mendes Lima", email: "p.lima@email.com", phone: "+55 11 96321-8870",
    city: "São Paulo, SP", aum: 680_000, profile: "Moderado", origin: "Evento",
    lastContact: iso(-12), nextAction: "Agendar reunião trimestral",
    tags: [], notes: "Recém-divorciada, reorganizando patrimônio.",
    suitabilityExpires: iso(60),
    portfolio: [
      { name: "CDB Daycoval 108% CDI", value: 300_000, maturity: iso(540), yield: "108% CDI", category: "Renda Fixa" },
      { name: "Tesouro IPCA+ 2045", value: 200_000, maturity: "2045-05-15", yield: "IPCA+6.3%", category: "Renda Fixa" },
      { name: "Ações dividendos", value: 130_000, yield: "—", category: "Renda Variável" },
      { name: "FIIs Híbrido", value: 50_000, yield: "8.8% a.a.", category: "FIIs" },
    ],
  },
  {
    id: "c8", name: "Bruno Henrique Tavares", email: "bruno.tavares@email.com", phone: "+55 51 98765-1010",
    city: "Porto Alegre, RS", aum: 1_900_000, profile: "Arrojado", origin: "Redes Sociais",
    lastContact: iso(-4), nextAction: "Análise de small caps",
    tags: ["Trader"], notes: "Acompanha mercado diariamente.",
    suitabilityExpires: iso(120),
    portfolio: [
      { name: "Small Caps", value: 900_000, yield: "—", category: "Renda Variável" },
      { name: "Opções e estruturadas", value: 400_000, yield: "—", category: "Renda Variável" },
      { name: "Tesouro Selic", value: 400_000, yield: "Selic", category: "Renda Fixa" },
      { name: "Cripto via ETF", value: 200_000, yield: "—", category: "Internacional" },
    ],
  },
  {
    id: "c9", name: "Larissa Vieira Cunha", email: "l.cunha@email.com", phone: "+55 11 99887-3344",
    city: "São Paulo, SP", aum: 540_000, profile: "Moderado", origin: "Indicação",
    lastContact: iso(-1), nextAction: "Confirmar aporte mensal",
    tags: [], notes: "Aportes mensais via débito automático.",
    suitabilityExpires: iso(200),
    portfolio: [
      { name: "CDB Master 110% CDI", value: 250_000, maturity: iso(720), yield: "110% CDI", category: "Renda Fixa" },
      { name: "Carteira recomendada Ações", value: 180_000, yield: "—", category: "Renda Variável" },
      { name: "FIIs Logística", value: 80_000, yield: "9.0% a.a.", category: "FIIs" },
      { name: "ETF S&P 500", value: 30_000, yield: "—", category: "Internacional" },
    ],
  },
  {
    id: "c10", name: "Eduardo Maciel Prado", email: "e.prado@email.com", phone: "+55 11 96543-7788",
    city: "Santos, SP", aum: 165_000, profile: "Conservador", origin: "Site",
    lastContact: iso(-30), nextAction: "Reativar (sem contato 30d)",
    tags: ["Reativação"], notes: "Cliente inativo, último aporte há 6 meses.",
    suitabilityExpires: iso(-10),
    portfolio: [
      { name: "Poupança + LCI", value: 165_000, yield: "—", category: "Renda Fixa" },
    ],
  },
  {
    id: "c11", name: "Tatiana Reis Barbosa", email: "tatiana.reis@email.com", phone: "+55 71 98123-7766",
    city: "Salvador, BA", aum: 4_600_000, profile: "Moderado", origin: "Indicação",
    lastContact: iso(-7), nextAction: "Apresentar fundo multimercado",
    tags: ["VIP", "Empresária"], notes: "Sócia de rede de farmácias.",
    suitabilityExpires: iso(80),
    portfolio: [
      { name: "Multimercado Verde", value: 1_500_000, yield: "Meta CDI+5%", category: "Renda Variável" },
      { name: "Debêntures Eletrobras", value: 1_200_000, maturity: "2034-04-01", yield: "IPCA+7.4%", category: "Renda Fixa" },
      { name: "Carteira Ações", value: 900_000, yield: "—", category: "Renda Variável" },
      { name: "FIIs", value: 600_000, yield: "8.9% a.a.", category: "FIIs" },
      { name: "REITs", value: 400_000, yield: "—", category: "Internacional" },
    ],
  },
  {
    id: "c12", name: "Gustavo Henrique Lima", email: "gustavo.lima@email.com", phone: "+55 11 98221-3344",
    city: "São Paulo, SP", aum: 920_000, profile: "Moderado", origin: "Parceria",
    lastContact: iso(-14), nextAction: "Renovar CDB vencendo",
    tags: [], notes: "CDB de 600k vencendo em 8 dias.",
    suitabilityExpires: iso(110),
    portfolio: [
      { name: "CDB Original 112% CDI", value: 600_000, maturity: iso(8), yield: "112% CDI", category: "Renda Fixa" },
      { name: "Tesouro Prefixado 2027", value: 200_000, maturity: "2027-01-01", yield: "11.8% a.a.", category: "Renda Fixa" },
      { name: "Ações", value: 120_000, yield: "—", category: "Renda Variável" },
    ],
  },
  {
    id: "c13", name: "Renata Oliveira Schmidt", email: "renata.s@email.com", phone: "+55 47 98765-4422",
    city: "Joinville, SC", aum: 320_000, profile: "Conservador", origin: "Site",
    lastContact: iso(-5), nextAction: "Confirmar agenda do mês",
    tags: [], notes: "Engenheira, planejamento de aposentadoria.",
    suitabilityExpires: iso(240),
    portfolio: [
      { name: "Previdência VGBL", value: 180_000, yield: "—", category: "Renda Fixa" },
      { name: "LCA Bradesco", value: 140_000, maturity: iso(365), yield: "94% CDI", category: "Renda Fixa" },
    ],
  },
  {
    id: "c14", name: "Marcelo Augusto Ribeiro", email: "m.ribeiro@email.com", phone: "+55 61 99887-1010",
    city: "Brasília, DF", aum: 5_200_000, profile: "Arrojado", origin: "Indicação",
    lastContact: iso(-10), nextAction: "Estruturada de proteção",
    tags: ["VIP", "Servidor público"], notes: "Procura proteção patrimonial.",
    suitabilityExpires: iso(95),
    portfolio: [
      { name: "COE Capital Protegido", value: 1_500_000, maturity: "2028-03-01", yield: "—", category: "Renda Variável" },
      { name: "Ações dividendos", value: 1_300_000, yield: "—", category: "Renda Variável" },
      { name: "Debêntures", value: 1_000_000, maturity: "2032-09-01", yield: "IPCA+6.9%", category: "Renda Fixa" },
      { name: "FIIs Premium", value: 700_000, yield: "8.4% a.a.", category: "FIIs" },
      { name: "Treasury Bonds", value: 700_000, yield: "—", category: "Internacional" },
    ],
  },
  {
    id: "c15", name: "Júlia Fernanda Castro", email: "ju.castro@email.com", phone: "+55 11 96543-2211",
    city: "São Paulo, SP", aum: 195_000, profile: "Moderado", origin: "Redes Sociais",
    lastContact: iso(-8), nextAction: "Onboarding etapa 2",
    tags: ["Novo cliente"], notes: "Recém-formada, primeira experiência.",
    suitabilityExpires: iso(330),
    portfolio: [
      { name: "Tesouro Selic", value: 100_000, yield: "Selic", category: "Renda Fixa" },
      { name: "Carteira recomendada Ações", value: 60_000, yield: "—", category: "Renda Variável" },
      { name: "FIIs", value: 35_000, yield: "8.5% a.a.", category: "FIIs" },
    ],
  },
  {
    id: "c16", name: "Alexandre Pires Domingues", email: "a.domingues@email.com", phone: "+55 11 98321-7766",
    city: "São Paulo, SP", aum: 2_750_000, profile: "Moderado", origin: "Evento",
    lastContact: iso(-16), nextAction: "Revisão semestral",
    tags: ["Empresário"], notes: "Sem contato há 16 dias.",
    suitabilityExpires: iso(70),
    portfolio: [
      { name: "Debêntures Incentivadas", value: 900_000, maturity: "2030-08-01", yield: "IPCA+6.5%", category: "Renda Fixa" },
      { name: "Ações", value: 800_000, yield: "—", category: "Renda Variável" },
      { name: "FIIs", value: 550_000, yield: "8.7% a.a.", category: "FIIs" },
      { name: "Tesouro IPCA+", value: 500_000, maturity: "2035-05-15", yield: "IPCA+6.0%", category: "Renda Fixa" },
    ],
  },
  {
    id: "c17", name: "Beatriz Camargo Neves", email: "b.neves@email.com", phone: "+55 19 99001-3344",
    city: "Ribeirão Preto, SP", aum: 1_420_000, profile: "Conservador", origin: "Indicação",
    lastContact: iso(-11), nextAction: "Realocar vencimentos",
    tags: [], notes: "Vencimento múltiplo no próximo mês.",
    suitabilityExpires: iso(140),
    portfolio: [
      { name: "CDB Sofisa 109% CDI", value: 700_000, maturity: iso(40), yield: "109% CDI", category: "Renda Fixa" },
      { name: "LCI Bradesco", value: 400_000, maturity: iso(60), yield: "92% CDI", category: "Renda Fixa" },
      { name: "Tesouro IPCA+ 2029", value: 320_000, maturity: "2029-08-15", yield: "IPCA+5.8%", category: "Renda Fixa" },
    ],
  },
  {
    id: "c18", name: "Henrique Salles Moura", email: "h.moura@email.com", phone: "+55 11 97765-2299",
    city: "São Paulo, SP", aum: 6_300_000, profile: "Arrojado", origin: "Parceria",
    lastContact: iso(-2), nextAction: "Apresentar fundo offshore",
    tags: ["VIP", "Family Office"], notes: "Patrimônio familiar consolidado.",
    suitabilityExpires: iso(160),
    portfolio: [
      { name: "Fundo Offshore Cayman", value: 2_400_000, yield: "—", category: "Internacional" },
      { name: "Ações Brasil ativa", value: 1_600_000, yield: "—", category: "Renda Variável" },
      { name: "Debêntures High Grade", value: 1_300_000, maturity: "2033-10-01", yield: "IPCA+6.7%", category: "Renda Fixa" },
      { name: "FII de papel + tijolo", value: 1_000_000, yield: "9.4% a.a.", category: "FIIs" },
    ],
  },
];

// 30+ interactions
function makeInteractions(): Interaction[] {
  const types: InteractionType[] = ["WhatsApp", "Reunião", "Email", "Ligação"];
  const summaries = [
    "Atualização sobre vencimento de CDB e proposta de realocação para debêntures incentivadas.",
    "Reunião trimestral para revisão de carteira e calibragem de risco.",
    "Envio de relatório mensal e análise de performance vs CDI.",
    "Discussão sobre apetite por ativos internacionais e dolarização.",
    "Confirmação de aporte mensal e atualização cadastral.",
    "Apresentação de fundo multimercado com track record consistente.",
    "Alinhamento sobre estratégia de proteção e diversificação setorial.",
    "Renovação de suitability e atualização de objetivos financeiros.",
  ];
  const aiSummaries = [
    "Cliente demonstrou interesse em aumentar exposição a renda variável (~10% da carteira). Próximos passos: enviar carteira recomendada small caps até sexta. Tom: receptivo, sem objeções relevantes.",
    "Discussão técnica sobre marcação a mercado de Tesouro IPCA+. Cliente entendeu volatilidade e mantém posição. Confirmou aporte adicional de R$ 50k em 30 dias.",
    "Conversa rápida sobre vencimento. Cliente prefere reinvestir no mesmo emissor com prazo maior. Ação: enviar 3 opções com taxas comparativas.",
    "Reunião alinhada com plano anual. Cliente sinalizou possível liquidez extra em Q4 (~R$ 300k). Atualizar projeção patrimonial.",
  ];
  const list: Interaction[] = [];
  let counter = 1;
  clients.forEach((c, idx) => {
    const n = 2 + (idx % 3);
    for (let i = 0; i < n; i++) {
      const t = types[(i + idx) % types.length];
      list.push({
        id: `i${counter++}`,
        clientId: c.id,
        type: t,
        date: iso(-(i * 7 + (idx % 5) + 1)),
        summary: summaries[(i + idx) % summaries.length],
        aiSummary: t === "Reunião" ? aiSummaries[(i + idx) % aiSummaries.length] : undefined,
      });
    }
  });
  return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export const interactions: Interaction[] = makeInteractions();

export const pipeline: PipelineCard[] = [
  { id: "p1", clientName: "Carlos Eduardo Vianna", estimatedAum: 350_000, daysInStage: 4, origin: "Indicação", stage: "Prospect" },
  { id: "p2", clientName: "Sofia Mendes", estimatedAum: 180_000, daysInStage: 9, origin: "Redes Sociais", stage: "Prospect" },
  { id: "p3", clientName: "Roberto Tanaka", estimatedAum: 1_200_000, daysInStage: 2, origin: "Evento", stage: "KYC" },
  { id: "p4", clientName: "Letícia Borges", estimatedAum: 420_000, daysInStage: 6, origin: "Indicação", stage: "KYC" },
  { id: "p5", clientName: "Fernando Aragão", estimatedAum: 850_000, daysInStage: 3, origin: "Site", stage: "Análise de Risco" },
  { id: "p6", clientName: "Isabela Brito", estimatedAum: 2_400_000, daysInStage: 11, origin: "Parceria", stage: "Análise de Risco" },
  { id: "p7", clientName: "Diego Marin", estimatedAum: 670_000, daysInStage: 1, origin: "Indicação", stage: "Assinatura" },
  { id: "p8", clientName: "Vanessa Coelho", estimatedAum: 290_000, daysInStage: 5, origin: "Site", stage: "Primeiro Aporte" },
  { id: "p9", clientName: "Hugo Pereira", estimatedAum: 3_100_000, daysInStage: 2, origin: "Evento", stage: "Primeiro Aporte" },
  { id: "p10", clientName: "Aline Saraiva", estimatedAum: 1_650_000, daysInStage: 28, origin: "Indicação", stage: "Crescimento" },
  { id: "p11", clientName: "Thiago Marques", estimatedAum: 980_000, daysInStage: 45, origin: "Indicação", stage: "Crescimento" },
  { id: "p12", clientName: "Carla Bittencourt", estimatedAum: 540_000, daysInStage: 60, origin: "Site", stage: "Crescimento" },
  { id: "p13", clientName: "Eduardo Maciel Prado", estimatedAum: 165_000, daysInStage: 30, origin: "Site", stage: "Reativação" },
  { id: "p14", clientName: "João Pedro Nogueira", estimatedAum: 1_150_000, daysInStage: 22, origin: "Indicação", stage: "Reativação" },
];

export const pipelineStages: PipelineStage[] = [
  "Prospect", "KYC", "Análise de Risco", "Assinatura", "Primeiro Aporte", "Crescimento", "Reativação",
];

// Captação mensal últimos 6 meses
const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
export const captacaoMensal = (() => {
  const now = new Date();
  const arr: { month: string; value: number }[] = [];
  const values = [1_800_000, 2_350_000, 2_100_000, 2_900_000, 2_650_000, 3_100_000];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({ month: monthLabels[d.getMonth()], value: values[5 - i] });
  }
  return arr;
})();

export const agendaEvents: AgendaEvent[] = [
  { id: "e1", clientName: "Ana Beatriz Carvalho", type: "Reunião", day: 0, startHour: 9, duration: 1 },
  { id: "e2", clientName: "Felipe Costa Andrade", type: "Ligação", day: 0, startHour: 14, duration: 1 },
  { id: "e3", clientName: "Ricardo Almeida Souza", type: "Reunião", day: 1, startHour: 10, duration: 2 },
  { id: "e4", clientName: "Larissa Vieira Cunha", type: "WhatsApp", day: 1, startHour: 16, duration: 1 },
  { id: "e5", clientName: "Tatiana Reis Barbosa", type: "Reunião", day: 2, startHour: 11, duration: 1 },
  { id: "e6", clientName: "Bruno Henrique Tavares", type: "Ligação", day: 3, startHour: 9, duration: 1 },
  { id: "e7", clientName: "Henrique Salles Moura", type: "Reunião", day: 3, startHour: 15, duration: 2 },
  { id: "e8", clientName: "Marcelo Augusto Ribeiro", type: "Reunião", day: 4, startHour: 10, duration: 1 },
  { id: "e9", clientName: "Camila Rocha Pinto", type: "WhatsApp", day: 4, startHour: 14, duration: 1 },
];

export const templates: Template[] = [
  { id: "t1", title: "Aniversário de Investimento", channel: "WhatsApp",
    preview: "Olá {{nome}}! Hoje completa 1 ano da sua jornada conosco. Que tal revisarmos sua estratégia?" },
  { id: "t2", title: "Atualização de Mercado", channel: "Email",
    preview: "Prezado(a) {{nome}}, segue um resumo dos principais movimentos do mercado nesta semana e impactos na sua carteira." },
  { id: "t3", title: "Lembrete de Reunião", channel: "WhatsApp",
    preview: "Olá {{nome}}, confirmando nossa reunião amanhã às {{hora}}. Posso te enviar a pauta?" },
  { id: "t4", title: "Vencimento de Produto", channel: "Email",
    preview: "{{nome}}, seu {{produto}} vence em {{dias}} dias. Preparei 3 opções de realocação para você avaliar." },
];

export const recentSends: SentMessage[] = [
  { id: "m1", clientName: "Ana Beatriz Carvalho", template: "Lembrete de Reunião", channel: "WhatsApp", date: iso(-1), status: "Enviado" },
  { id: "m2", clientName: "Gustavo Henrique Lima", template: "Vencimento de Produto", channel: "Email", date: iso(-2), status: "Enviado" },
  { id: "m3", clientName: "Felipe Costa Andrade", template: "Aniversário de Investimento", channel: "WhatsApp", date: iso(-3), status: "Enviado" },
  { id: "m4", clientName: "Tatiana Reis Barbosa", template: "Atualização de Mercado", channel: "Email", date: iso(0), status: "Agendado" },
  { id: "m5", clientName: "Larissa Vieira Cunha", template: "Lembrete de Reunião", channel: "WhatsApp", date: iso(-4), status: "Enviado" },
  { id: "m6", clientName: "Eduardo Maciel Prado", template: "Atualização de Mercado", channel: "Email", date: iso(-5), status: "Falhou" },
];

export const notifications = [
  { id: "n1", title: "CDB de Gustavo Lima vence em 8 dias", time: "há 2h", type: "warning" as const },
  { id: "n2", title: "Nova indicação recebida: Sofia Mendes", time: "há 5h", type: "info" as const },
  { id: "n3", title: "Revisão de compliance pendente", time: "ontem", type: "destructive" as const },
];

// Dashboard summary
export const dashboardSummary = {
  totalClientes: 128,
  aumTotal: 47_200_000,
  captacaoMes: 3_100_000,
  reunioesSemana: 6,
};

export const todoContacts = [
  { clientId: "c4", reason: "22 dias sem contato" },
  { clientId: "c12", reason: "CDB vence em 8 dias" },
  { clientId: "c6", reason: "Aniversário de investimento em 5 dias" },
  { clientId: "c10", reason: "Cliente inativo — reativar" },
  { clientId: "c16", reason: "16 dias sem contato" },
];
