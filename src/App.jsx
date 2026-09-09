import React, { useState, useEffect, useRef, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const KEY = "nutri:v4";
const LEGADO = ["nutri:v3", "nutri:v2"];
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- tabela base (por 100 g) — referência TACO/USDA ---------- */
const TABELA = [
  ["Frango, peito grelhado", 165, 31, 0, 3.6, [["filé médio", 120]]],
  ["Frango, peito cru", 110, 23, 0, 1.5, [["filé médio", 130]]],
  ["Frango, coxa sem pele", 175, 25, 0, 8, null],
  ["Patinho moído cru", 133, 21.5, 0, 5, null],
  ["Patinho grelhado", 219, 35, 0, 8, [["bife", 100]]],
  ["Alcatra grelhada", 241, 32, 0, 12, null],
  ["Contrafilé grelhado", 278, 29, 0, 18, null],
  ["Músculo cozido", 200, 30, 0, 8, null],
  ["Lombo suíno assado", 165, 27, 0, 6, null],
  ["Tilápia grelhada", 129, 26, 0, 2.7, [["filé", 130]]],
  ["Salmão grelhado", 208, 22, 0, 13, [["posta", 150]]],
  ["Atum em água, lata", 116, 26, 0, 1, [["lata drenada", 120]]],
  ["Sardinha em óleo, drenada", 208, 25, 0, 11, null],
  ["Ovo inteiro cozido", 143, 13, 1.1, 9.5, [["ovo", 50]]],
  ["Clara de ovo", 52, 11, 0.7, 0.2, [["clara", 33]]],
  ["Gema de ovo", 322, 16, 3.6, 27, [["gema", 17]]],
  ["Peito de peru defumado", 105, 18, 3, 2, [["fatia", 15]]],
  ["Whey concentrado, pó", 400, 78, 8, 6, [["scoop", 30]]],
  ["Whey isolado, pó", 375, 88, 2, 1, [["scoop", 30]]],
  ["Proteína de ervilha, pó", 383, 80, 3, 6, [["scoop", 30]]],
  ["Albumina, pó", 375, 80, 5, 1, [["scoop", 30]]],
  ["Caseína, pó", 370, 78, 6, 3, [["scoop", 30]]],
  ["Queijo cottage", 98, 11, 3.4, 4.3, null],
  ["Ricota", 140, 11, 3, 8, null],
  ["Queijo minas frescal", 264, 17, 3, 20, [["fatia", 30]]],
  ["Mussarela", 300, 22, 3, 22, [["fatia", 20]]],
  ["Iogurte natural integral", 61, 3.5, 4.7, 3.3, [["pote", 170]]],
  ["Iogurte grego zero", 60, 10, 4, 0, [["pote", 130]]],
  ["Leite integral", 61, 3.2, 4.7, 3.3, [["copo", 200]]],
  ["Leite desnatado", 35, 3.4, 5, 0.2, [["copo", 200]]],
  ["Arroz branco cozido", 128, 2.5, 28, 0.2, [["colher sopa", 25], ["escumadeira", 80]]],
  ["Arroz integral cozido", 124, 2.6, 26, 1, [["colher sopa", 25]]],
  ["Feijão carioca cozido", 76, 4.8, 13.6, 0.5, [["concha", 80]]],
  ["Feijão preto cozido", 77, 4.5, 14, 0.5, [["concha", 80]]],
  ["Batata doce cozida", 77, 1.3, 18, 0.1, [["unidade média", 150]]],
  ["Batata inglesa cozida", 87, 1.8, 20, 0.1, null],
  ["Mandioca cozida", 125, 0.6, 30, 0.3, null],
  ["Macarrão cozido", 158, 5.8, 30, 0.9, null],
  ["Aveia em flocos", 394, 13.9, 66.6, 8.5, [["colher sopa", 15]]],
  ["Pão francês", 300, 8, 58, 3.1, [["unidade", 50]]],
  ["Pão integral", 253, 9.4, 43, 4, [["fatia", 25]]],
  ["Tapioca, goma hidratada", 358, 0, 89, 0, [["disco", 60]]],
  ["Cuscuz de milho cozido", 113, 2.2, 25, 0.3, null],
  ["Granola", 430, 9, 65, 14, [["colher sopa", 15]]],
  ["Maltodextrina", 380, 0, 95, 0, [["scoop", 30]]],
  ["Dextrose", 380, 0, 100, 0, [["scoop", 30]]],
  ["Mel", 309, 0, 84, 0, [["colher sopa", 20]]],
  ["Banana prata", 98, 1.3, 26, 0.1, [["unidade", 70]]],
  ["Banana nanica / caturra", 92, 1.4, 23.8, 0.1, [["unidade", 100]]],
  ["Maçã", 56, 0.3, 15, 0.2, [["unidade", 130]]],
  ["Mamão papaia", 40, 0.5, 10, 0.1, [["metade", 150]]],
  ["Laranja", 45, 1, 11, 0.1, [["unidade", 150]]],
  ["Abacaxi", 48, 0.9, 12, 0.1, [["fatia", 80]]],
  ["Morango", 30, 0.9, 6.8, 0.3, null],
  ["Uva", 69, 0.7, 18, 0.2, null],
  ["Melancia", 33, 0.9, 8, 0.1, null],
  ["Manga", 64, 0.4, 16, 0.2, null],
  ["Abacate", 96, 1.2, 6, 8.4, null],
  ["Azeite de oliva", 884, 0, 0, 100, [["colher sopa", 13]]],
  ["Óleo de coco", 892, 0, 0, 99, [["colher sopa", 13]]],
  ["Manteiga", 760, 0.6, 0.1, 84, [["colher chá", 5]]],
  ["Pasta de amendoim integral", 588, 25, 20, 50, [["colher sopa", 16]]],
  ["Amendoim", 567, 26, 16, 49, null],
  ["Castanha do Pará", 656, 14, 12, 66, [["unidade", 5]]],
  ["Castanha de caju", 553, 18, 30, 44, null],
  ["Amêndoas", 579, 21, 22, 50, [["unidade", 1.2]]],
  ["Nozes", 654, 15, 14, 65, null],
  ["Chia", 486, 17, 42, 31, [["colher sopa", 12]]],
  ["Linhaça", 534, 18, 29, 42, [["colher sopa", 10]]],
  ["Brócolis cozido", 25, 2.1, 4.4, 0.5, null],
  ["Couve refogada", 90, 2.9, 8, 6, null],
  ["Alface", 15, 1.3, 2.4, 0.2, null],
  ["Tomate", 15, 1.1, 3.1, 0.2, [["unidade", 110]]],
  ["Cenoura crua", 34, 1.3, 7.7, 0.2, null],
  ["Abobrinha cozida", 19, 1.1, 3, 0.2, null],
  ["Espinafre cozido", 23, 2.9, 3.8, 0.4, null],
  ["Pepino", 16, 0.7, 3.6, 0.1, null],
  ["Beterraba cozida", 32, 1.3, 7.2, 0.1, null],
  ["Chuchu cozido", 19, 0.4, 4.8, 0.1, null],
  ["Repolho", 25, 1.3, 5.8, 0.1, null],
  ["Cebola", 39, 1.7, 8.9, 0.1, null],
  ["Café sem açúcar", 2, 0.1, 0.3, 0, [["xícara", 150]]],
  ["Achocolatado em pó", 400, 4, 88, 2, [["colher sopa", 15]]],
  ["Chocolate 70%", 580, 8, 45, 42, [["quadradinho", 6]]],
  ["Requeijão light", 175, 10, 4, 13, [["colher sopa", 20]]],
  ["Doce de leite", 306, 6, 56, 6, [["colher sopa", 20]]],
  ["Barra de proteína", 350, 30, 35, 10, [["unidade", 45]]],
].map(([nome, kcal, prot, carb, gord, porcoes]) => ({
  id: "t_" + nome.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  nome, kcal, prot, carb, gord, porcoes: porcoes || [], fonte: "TACO",
}));

const MEALS_PADRAO = [
  { nome: "Café da manhã", hora: "07:00" },
  { nome: "Lanche da manhã", hora: "10:00" },
  { nome: "Almoço", hora: "12:30" },
  { nome: "Pré-treino", hora: "15:30" },
  { nome: "Pós-treino", hora: "17:30" },
  { nome: "Jantar", hora: "20:00" },
  { nome: "Ceia", hora: "22:00" },
].map((m) => ({ ...m, id: uid(), alvo: null }));

const REFEICOES_MODELO_PADRAO = [{ id: uid(), nome: "Padrão", padrao: true, meals: MEALS_PADRAO }];

const CONFIG_PADRAO = {
  refeicoesModelos: REFEICOES_MODELO_PADRAO,
  supps: ["Creatina 5 g", "Whey", "BCAA", "Vitamina D", "Ômega 3", "Magnésio"].map((nome) => ({ id: uid(), nome, cadaDias: 1, ancora: "2024-01-01" })),
  marcadores: ["Qualidade do sono", "Cansaço ao acordar", "Produtividade", "Bem-estar", "Irritabilidade", "Estresse", "Ansiedade"].map((nome) => ({ id: uid(), nome })),
  medicamentos: ["Testosterona", "Anastrozol"].map((nome) => ({ id: uid(), nome, cadaDias: nome === "Anastrozol" ? 7 : 4, ancora: "2024-01-01" })),
};

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const label = (s) => { const d = fromIso(s); return s === iso(new Date()) ? "Hoje" : `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`; };
const n0 = (v) => Math.round(Number(v) || 0);
const n1 = (v) => Math.round((Number(v) || 0) * 10) / 10;
const fmt = (v) => n0(v).toLocaleString("pt-BR");
const diffDias = (a, b) => Math.round((fromIso(a) - fromIso(b)) / 86400000);
function normalizeSupps(supps) {
  return (supps || []).map((s) => typeof s === "string"
    ? { id: uid(), nome: s, cadaDias: 1, ancora: iso(new Date()) }
    : { cadaDias: 1, ancora: iso(new Date()), ...s });
}
function suppleDue(s, day) {
  if (!s.cadaDias || s.cadaDias <= 1) return true;
  const d = diffDias(day, s.ancora || day);
  return d >= 0 && d % s.cadaDias === 0;
}
function normalizeConfig(raw) {
  if (!raw) return CONFIG_PADRAO;
  if (raw.refeicoesModelos) {
    const refs = raw.refeicoesModelos.map((r, i) => ({ padrao: i === 0, ...r }));
    if (!refs.some((r) => r.padrao)) refs[0].padrao = true;
    return { ...CONFIG_PADRAO, ...raw, refeicoesModelos: refs };
  }
  const meals = raw.meals || MEALS_PADRAO;
  return {
    refeicoesModelos: [{ id: uid(), nome: "Importado", padrao: true, meals }],
    supps: raw.supps || CONFIG_PADRAO.supps,
    marcadores: raw.marcadores || CONFIG_PADRAO.marcadores,
    medicamentos: raw.medicamentos || CONFIG_PADRAO.medicamentos,
  };
}
function doseNaData(historico, data) {
  if (!historico || !historico.length) return null;
  const validos = historico.filter((h) => h.data <= data).sort((a, b) => a.data.localeCompare(b.data));
  return validos.length ? validos[validos.length - 1] : null;
}
function somarAlvo(meals) {
  return (meals || []).reduce((a, m) => {
    const al = m.alvo || {};
    return { kcal: a.kcal + (al.kcal || 0), prot: a.prot + (al.prot || 0), carb: a.carb + (al.carb || 0), gord: a.gord + (al.gord || 0) };
  }, { kcal: 0, prot: 0, carb: 0, gord: 0 });
}
function pctGorduraMarinha(pescoco, cintura, altura) {
  if (!pescoco || !cintura || !altura || cintura <= pescoco) return null;
  const v = 495 / (1.0324 - 0.19077 * Math.log10(cintura - pescoco) + 0.15456 * Math.log10(altura)) - 450;
  return v > 0 && v < 60 ? v : null;
}

const calc = (it) => ({
  kcal: (it.kcal * it.g) / 100, prot: (it.prot * it.g) / 100,
  carb: (it.carb * it.g) / 100, gord: (it.gord * it.g) / 100,
});
const somar = (items) => (items || []).reduce((a, it) => {
  const m = calc(it);
  return { kcal: a.kcal + m.kcal, prot: a.prot + m.prot, carb: a.carb + m.carb, gord: a.gord + m.gord };
}, { kcal: 0, prot: 0, carb: 0, gord: 0 });

const MACROS = [
  { k: "carb", lb: "carb", nome: "Carbo", cor: "var(--orange)", txt: "var(--orange-d)", bg: "var(--orange-s)" },
  { k: "prot", lb: "prot", nome: "Proteína", cor: "var(--lime)", txt: "var(--lime-d)", bg: "var(--lime-s)" },
  { k: "gord", lb: "gord", nome: "Gordura", cor: "var(--violet)", txt: "var(--violet-d)", bg: "var(--violet-s)" },
];

const MEDIDAS_CAMPOS = [
  { key: "pescoco", lb: "Pescoço", un: "cm" },
  { key: "ombro", lb: "Ombro", un: "cm" },
  { key: "peito", lb: "Peito", un: "cm" },
  { key: "bracoD", lb: "Braço D contraído", un: "cm" },
  { key: "bracoE", lb: "Braço E contraído", un: "cm" },
  { key: "antebracoD", lb: "Antebraço D", un: "cm" },
  { key: "antebracoE", lb: "Antebraço E", un: "cm" },
  { key: "cinturaUmbigo", lb: "Cintura (umbigo)", un: "cm" },
  { key: "cinturaAlta", lb: "Cintura alta", un: "cm" },
  { key: "abdomenInferior", lb: "Abdômen inferior", un: "cm" },
  { key: "quadril", lb: "Quadril", un: "cm" },
  { key: "coxaD", lb: "Coxa D", un: "cm" },
  { key: "coxaE", lb: "Coxa E", un: "cm" },
  { key: "panturrilhaD", lb: "Panturrilha D", un: "cm" },
  { key: "panturrilhaE", lb: "Panturrilha E", un: "cm" },
  { key: "pctGordura", lb: "% Gordura", un: "%" },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.nx{
--bg:#F5F6FA;--card:#FFFFFF;--ink:#1B2559;--ink2:#7C87A3;--ink3:#A9B1C6;--rule:#EDEFF5;
--coral:#F5385D;--coral-d:#D31E43;--coral-s:#FFE8ED;
--lime:#5FC36A;--lime-d:#2E8B48;--lime-s:#E6F7E9;
--orange:#F5A623;--orange-d:#B87409;--orange-s:#FEF3DE;
--violet:#7B61FF;--violet-d:#5138D6;--violet-s:#EDE9FF;
background:var(--bg);color:var(--ink);font-family:'Inter',ui-sans-serif,system-ui,sans-serif;
min-height:100%;padding:14px 14px 88px;-webkit-font-smoothing:antialiased;position:relative;letter-spacing:-.01em}
.nx *{box-sizing:border-box}
.nx .num{font-variant-numeric:tabular-nums}
.nx .eb{font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--ink2)}
.nx .card{background:var(--card);border-radius:16px;box-shadow:0 1px 2px rgba(27,37,89,.06),0 6px 16px rgba(27,37,89,.04)}
.nx button{font:inherit;cursor:pointer;border-radius:12px;border:0}
.nx button:focus-visible,.nx input:focus-visible,.nx textarea:focus-visible{outline:2px solid var(--coral);outline-offset:2px}
.nx input,.nx textarea{font:inherit;background:#fff;border:1.5px solid var(--rule);border-radius:10px;color:var(--ink);padding:10px 11px;width:100%}
.nx input::placeholder,.nx textarea::placeholder{color:var(--ink3)}
.nx textarea{resize:none}
.nx .row{display:flex;align-items:center;justify-content:space-between;gap:10px}

.nx .hero{width:100%;background:var(--coral);color:#fff;padding:8px;display:flex;align-items:center;gap:12px;
border-radius:999px;box-shadow:0 4px 14px rgba(245,56,93,.32);font-weight:600;font-size:15px;margin-bottom:14px}
.nx .hero:active{transform:scale(.985)}
.nx .hero[data-on="1"]{background:var(--ink);box-shadow:0 4px 14px rgba(27,37,89,.3)}
.nx .heroIcon{width:44px;height:44px;border-radius:999px;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:20px;flex:0 0 auto}

.nx .strip{background:var(--card);border-radius:14px;padding:10px 13px;margin-bottom:12px;box-shadow:0 1px 2px rgba(27,37,89,.05)}
.nx .stripBtn{width:100%;background:transparent;padding:0;display:flex;align-items:center;justify-content:space-between;gap:8px}

.nx .kcal{font-size:40px;line-height:1;font-weight:800;letter-spacing:-.04em}
.nx .track{height:8px;background:var(--rule);border-radius:999px;overflow:hidden}
.nx .fill{height:100%;transition:width .35s ease;border-radius:999px}
.nx .pill{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.nx .cta{background:var(--coral);color:#fff;padding:13px 14px;font-weight:600;font-size:15px;width:100%;border-radius:12px;box-shadow:0 3px 10px rgba(245,56,93,.26)}
.nx .cta:disabled{opacity:.4;box-shadow:none;cursor:default}
.nx .dark{background:var(--ink);color:#fff;padding:13px 14px;font-weight:600;font-size:15px;width:100%;border-radius:12px}
.nx .ghost{background:#fff;color:var(--ink);padding:9px 12px;font-size:13px;font-weight:600;border:1.5px solid var(--rule);border-radius:10px}
.nx .ghost[data-on="1"]{background:var(--ink);color:#fff;border-color:var(--ink)}
.nx .soft{background:var(--coral-s);color:var(--coral-d);padding:9px 12px;font-size:13px;font-weight:600;border-radius:10px}
.nx .mini{background:transparent;color:var(--ink2);padding:4px 8px;font-size:14px;font-weight:600}
.nx .item{border-top:1px solid var(--rule);padding:10px 0}
.nx .ribbon{display:flex;height:100%;border-radius:999px;overflow:hidden}
.nx .sheet{position:fixed;inset:0;background:var(--bg);z-index:60;padding:14px 14px 30px;overflow-y:auto}
.nx .chip{background:#fff;border:1.5px solid var(--rule);padding:7px 12px;font-size:12.5px;white-space:nowrap;font-weight:600;border-radius:999px;color:var(--ink2)}
.nx .chip[data-on="1"]{background:var(--coral-s);color:var(--coral-d);border-color:var(--coral-s)}
.nx .star{background:transparent;padding:4px 6px;font-size:16px;line-height:1;color:var(--ink3)}
.nx .star[data-on="1"]{color:var(--orange)}
.nx .box{width:20px;height:20px;border:2px solid var(--rule);border-radius:7px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff}
.nx .box[data-on="1"]{background:var(--lime);border-color:var(--lime)}
.nx .menu{position:absolute;right:0;top:100%;z-index:20;background:#fff;border-radius:14px;min-width:210px;box-shadow:0 8px 28px rgba(27,37,89,.18);overflow:hidden;padding:5px}
.nx .menu button{display:block;width:100%;text-align:left;background:transparent;padding:11px 12px;font-size:13.5px;border-radius:9px;font-weight:500}
.nx .nav{position:fixed;left:0;right:0;bottom:0;z-index:40;background:#fff;display:flex;
box-shadow:0 -2px 14px rgba(27,37,89,.08);padding:8px 6px calc(8px + env(safe-area-inset-bottom))}
.nx .nav button{flex:1;background:transparent;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;color:var(--ink3);font-size:10.5px;font-weight:600}
.nx .nav button[data-on="1"]{color:var(--coral)}
@media (prefers-reduced-motion:reduce){.nx .fill{transition:none}}
`;

const Ico = ({ d }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const I_HOME = "M3 10.5 12 3l9 7.5V21H3z";
const I_CHART = "M4 20V10M10 20V4M16 20v-7M22 20H2";
const I_GEAR = "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 007.6 19l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 003 13.6H3a2 2 0 110-4h.1A1.6 1.6 0 004.9 8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H10a1.6 1.6 0 001-1.5V4a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V10a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z";
const I_USER = "M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM4 21a8 8 0 0116 0";

/* =============== APP =============== */
export default function Nutri() {
  const [tab, setTab] = useState("dia");
  const [data, setData] = useState(null);
  const [day, setDay] = useState(iso(new Date()));
  const [sheet, setSheet] = useState(null);
  const [vozOpen, setVozOpen] = useState(false);
  const [sugestao, setSugestao] = useState(null);
  const [modeloOpen, setModeloOpen] = useState(false);
  const [copiarFuturoMeal, setCopiarFuturoMeal] = useState(null);
  const [favoritarMeal, setFavoritarMeal] = useState(null);
  const [usarFavoritaMeal, setUsarFavoritaMeal] = useState(null);
  const [clip, setClip] = useState(null);
  const [toast, setToast] = useState("");
  const saveRef = useRef(null);

  useEffect(() => {
    (async () => {
      const vazio = { config: CONFIG_PADRAO, favs: [], custom: [], recentes: [], days: {}, pesos: {}, medicoes: {}, altura: null, fotosIndex: {}, examesCampos: [], exames: {}, exameContexto: {}, medicamentoHistorico: {}, refeicoesFavoritas: [], tendenciasRazoes: [] };
      try {
        const r = await window.storage.get(KEY);
        const p = JSON.parse(r.value);
        setData(p && p.config ? { ...vazio, ...p } : vazio);
        return;
      } catch { /* sem v4, tenta migrar */ }
      for (const k of LEGADO) {
        try {
          const r = await window.storage.get(k);
          const p = JSON.parse(r.value);
          if (p && p.config) {
            const migrado = { ...vazio, ...p };
            setData(migrado);
            window.storage.set(KEY, JSON.stringify(migrado)).catch(() => {});
            setToast("Dados anteriores importados");
            setTimeout(() => setToast(""), 2600);
            return;
          }
        } catch { /* segue */ }
      }
      setData(vazio);
    })();
  }, []);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };
  const persist = (next) => {
    setData(next);
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      try { window.storage.set(KEY, JSON.stringify(next)).catch(() => flash("Não deu para salvar agora.")); }
      catch { flash("Não deu para salvar agora."); }
    }, 350);
  };

  const cfgRaw = (data && data.config) || CONFIG_PADRAO;
  const cfg = useMemo(() => {
    const norm = normalizeConfig(cfgRaw);
    return { ...norm, supps: normalizeSupps(norm.supps), medicamentos: normalizeSupps(norm.medicamentos) };
  }, [cfgRaw]);
  const refModeloPadrao = useMemo(() => cfg.refeicoesModelos.find((r) => r.padrao) || cfg.refeicoesModelos[0], [cfg]);
  const dia = useMemo(() => {
    const d = data && data.days ? data.days[day] : null;
    if (d && d.meals) return d;
    return { meals: (refModeloPadrao.meals || []).map((m) => ({ ...m, id: uid(), items: [] })), supps: [], modeloId: refModeloPadrao.id };
  }, [data, day, refModeloPadrao]);
  const modeloHojeId = dia.modeloId || refModeloPadrao.id;
  const metaHoje = useMemo(() => somarAlvo(dia.meals), [dia]);

  const setDia = (patch) => persist({ ...data, days: { ...data.days, [day]: { ...dia, ...patch } } });
  const setMeal = (id, patch) => setDia({ meals: dia.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  const tot = useMemo(() => somar(dia.meals.flatMap((m) => m.items || [])), [dia]);

  function addItens(mealId, novos) {
    const alvo = dia.meals.find((x) => x.id === mealId);
    const meals = dia.meals.map((x) => (x.id === mealId ? { ...x, items: [...(x.items || []), ...novos] } : x));
    const rec = [...novos.map((x) => { const c = { ...x }; delete c.g; delete c.id; return c; }), ...(data.recentes || [])]
      .filter((v, i, a) => a.findIndex((z) => z.nome === v.nome) === i).slice(0, 30);
    persist({ ...data, recentes: rec, days: { ...data.days, [day]: { ...dia, meals } } });
    flash(`${novos.length} item(ns) → ${alvo ? alvo.nome : "refeição"}`);
  }

  function toggleFav(f) {
    const on = (data.favs || []).some((x) => x.nome === f.nome);
    const c = { ...f }; delete c.g; delete c.id;
    persist({ ...data, favs: on ? data.favs.filter((x) => x.nome !== f.nome) : [...(data.favs || []), { ...c, id: uid() }] });
  }

  if (!data) return <div className="nx"><style>{CSS}</style><div className="eb">Carregando…</div></div>;
  const shift = (k) => { const d = fromIso(day); d.setDate(d.getDate() + k); setDay(iso(d)); };

  return (
    <div className="nx">
      <style>{CSS}</style>

      {tab === "dia" && (
        <>
          <div className="row" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 999, background: "var(--coral-s)", color: "var(--coral-d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>P</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Olá, Pedro</div>
                <div className="eb">{label(day)}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="ghost" style={{ padding: "8px 11px" }} onClick={() => setModeloOpen(true)}>
                {cfg.refeicoesModelos.find((r) => r.id === modeloHojeId)?.nome || "Refeição"}
              </button>
              <button className="ghost" style={{ padding: "8px 11px" }} onClick={() => shift(-1)} aria-label="Dia anterior">←</button>
              <button className="ghost" style={{ padding: "8px 11px" }} onClick={() => shift(1)} aria-label="Próximo dia">→</button>
            </div>
          </div>

          <PainelTopo
            pesos={data.pesos || {}} day={day}
            onSetPeso={(kg) => persist({ ...data, pesos: { ...(data.pesos || {}), [day]: kg } })}
            medLista={cfg.medicamentos} medMarcados={dia.medicamentos || []} medHistorico={data.medicamentoHistorico || {}}
            onToggleMed={(s) => setDia({ medicamentos: (dia.medicamentos || []).includes(s) ? dia.medicamentos.filter((z) => z !== s) : [...(dia.medicamentos || []), s] })}
            suppLista={cfg.supps} suppMarcados={dia.supps || []}
            onToggleSupp={(s) => setDia({ supps: (dia.supps || []).includes(s) ? dia.supps.filter((z) => z !== s) : [...(dia.supps || []), s] })}
          />

          <Resumo tot={tot} cfg={metaHoje} />

          <button className="hero" onClick={() => setVozOpen(true)}>
            <span className="heroIcon">🎙</span>
            <span style={{ textAlign: "left" }}>Falar o que comi<br /><span style={{ fontSize: 12, opacity: .85, fontWeight: 500 }}>diga a refeição e as quantidades</span></span>
          </button>

          {dia.meals.map((m) => (
            <MealCard
              key={m.id} meal={m} clip={clip}
              onAdd={() => setSheet({ mealId: m.id })}
              onVoz={() => setVozOpen(m.id)}
              onSugerir={() => setSugestao({ mealId: m.id })}
              onPatch={(p) => setMeal(m.id, p)}
              onCopy={() => { setClip({ nome: m.nome, items: m.items || [] }); flash(`${m.nome} copiada`); }}
              onPaste={() => { setMeal(m.id, { items: [...(m.items || []), ...clip.items.map((i) => ({ ...i, id: uid() }))] }); flash("Colado"); }}
              onCopiarFuturo={() => setCopiarFuturoMeal(m)}
              onFavoritar={() => setFavoritarMeal(m)}
              onUsarFavorita={() => setUsarFavoritaMeal(m.id)}
              onClear={() => setMeal(m.id, { items: [] })}
              onDelete={() => setDia({ meals: dia.meals.filter((x) => x.id !== m.id) })}
            />
          ))}

          <Marcadores lista={cfg.marcadores} valores={dia.marcadores || {}}
            onValor={(id, v) => setDia({ marcadores: { ...(dia.marcadores || {}), [id]: v } })}
            onLista={(l) => persist({ ...data, config: { ...cfg, marcadores: l } })} />
        </>
      )}

      {tab === "hist" && <Historico data={data} cfg={cfg} onPick={(d) => { setDay(d); setTab("dia"); }}
        onSalvarMedicao={(dataChave, valores) => persist({ ...data, medicoes: { ...(data.medicoes || {}), [dataChave]: valores } })}
        onAltura={(cm) => persist({ ...data, altura: cm })}
        onFotosIndex={(dataChave, angulos) => persist({ ...data, fotosIndex: { ...(data.fotosIndex || {}), [dataChave]: angulos } })}
        onExamesCampos={(campos) => persist({ ...data, examesCampos: campos })}
        onSalvarExame={(dataChave, valores, campos) => persist({ ...data, examesCampos: campos, exames: { ...(data.exames || {}), [dataChave]: { ...(data.exames && data.exames[dataChave]), ...valores } } })}
        onExameContexto={(dataChave, ctx) => persist({ ...data, exameContexto: { ...(data.exameContexto || {}), [dataChave]: ctx } })}
        razoes={data.tendenciasRazoes || []}
        onRazoes={(l) => persist({ ...data, tendenciasRazoes: l })} />}
      {tab === "perfil" && <Perfil data={data} cfg={cfg} refModeloPadrao={refModeloPadrao} persist={persist} />}
      {tab === "cfg" && <Ajustes data={data} cfg={cfg} persist={persist} flash={flash} />}

      <div className="nav">
        {[["dia", "Diário", I_HOME], ["hist", "Histórico", I_CHART], ["perfil", "Perfil", I_USER], ["cfg", "Ajustes", I_GEAR]].map(([k, v, d]) => (
          <button key={k} data-on={tab === k ? "1" : "0"} onClick={() => setTab(k)}>
            <Ico d={d} />{v}
          </button>
        ))}
      </div>

      {modeloOpen && (
        <div className="sheet">
          <div className="row" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Refeição de hoje</span>
            <button className="ghost" onClick={() => setModeloOpen(false)}>fechar</button>
          </div>
          <div className="eb" style={{ marginBottom: 9, fontWeight: 700 }}>Escolha o modelo para {label(day)}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {cfg.refeicoesModelos.map((r) => (
              <button key={r.id} className="chip" data-on={r.id === modeloHojeId ? "1" : "0"}
                onClick={() => {
                  if (r.id === modeloHojeId) { setModeloOpen(false); return; }
                  setDia({ modeloId: r.id, meals: r.meals.map((m) => ({ ...m, id: uid(), items: [] })), supps: [] });
                  flash(`${r.nome} aplicado a ${label(day)}`);
                  setModeloOpen(false);
                }}>
                {r.nome}{r.padrao ? " · padrão" : ""}
              </button>
            ))}
          </div>
          <div className="eb" style={{ lineHeight: 1.6 }}>
            Trocar aqui vale só para {label(day).toLowerCase()} e reinicia as refeições já lançadas nele. O modelo marcado "padrão" é o que abre em dias novos. Para criar, renomear ou editar modelos, vá em Ajustes.
          </div>
        </div>
      )}

      {vozOpen && (
        <VozPanel meals={dia.meals} mealFixo={typeof vozOpen === "string" ? vozOpen : null}
          onClose={() => setVozOpen(false)}
          onLancar={(mealId, itens) => { addItens(mealId, itens); setVozOpen(false); }} />
      )}

      {sugestao && (
        <SugerirPanel
          data={data} cfg={metaHoje} dia={dia} tot={tot}
          meal={dia.meals.find((m) => m.id === sugestao.mealId)}
          onClose={() => setSugestao(null)}
          onLancar={(itens) => { addItens(sugestao.mealId, itens); setSugestao(null); }}
          onSalvarAlvo={(alvo) => setMeal(sugestao.mealId, { alvo })} />
      )}

      {sheet && (
        <FoodSheet data={data} onClose={() => setSheet(null)} onFav={toggleFav}
          onAdd={(itens) => { addItens(sheet.mealId, itens); setSheet(null); }}
          onCustom={(f) => persist({ ...data, custom: [f, ...(data.custom || [])] })}
          meal={dia.meals.find((m) => m.id === sheet.mealId)} />
      )}

      {copiarFuturoMeal && (
        <CopiarFuturoPanel meal={copiarFuturoMeal} onClose={() => setCopiarFuturoMeal(null)}
          onConfirmar={(dias) => {
            let novosDays = { ...data.days };
            const nomeAlvo = copiarFuturoMeal.nome.trim().toLowerCase();
            for (let k = 1; k <= dias; k++) {
              const d = fromIso(day); d.setDate(d.getDate() + k);
              const key = iso(d);
              const existente = novosDays[key];
              const baseMeals = existente && existente.meals ? existente.meals : (refModeloPadrao.meals || []).map((m) => ({ ...m, id: uid(), items: [] }));
              const meals = baseMeals.map((m) => m.nome.trim().toLowerCase() === nomeAlvo ? { ...m, items: copiarFuturoMeal.items.map((it) => ({ ...it, id: uid() })) } : m);
              novosDays[key] = { ...(existente || { supps: [], medicamentos: [] }), meals };
            }
            persist({ ...data, days: novosDays });
            flash(`${copiarFuturoMeal.nome} copiada para os próximos ${dias} dias`);
            setCopiarFuturoMeal(null);
          }} />
      )}

      {favoritarMeal && (
        <FavoritarRefeicaoPanel meal={favoritarMeal} onClose={() => setFavoritarMeal(null)}
          onSalvar={(nome) => {
            persist({ ...data, refeicoesFavoritas: [{ id: uid(), nome, items: favoritarMeal.items.map((it) => ({ ...it })) }, ...(data.refeicoesFavoritas || [])] });
            flash(`"${nome}" salva nas refeições favoritas`);
            setFavoritarMeal(null);
          }} />
      )}

      {usarFavoritaMeal && (
        <UsarFavoritaPanel favoritas={data.refeicoesFavoritas || []} onClose={() => setUsarFavoritaMeal(null)}
          onUsar={(fav) => {
            addItens(usarFavoritaMeal, fav.items.map((it) => ({ ...it, id: uid() })));
            setUsarFavoritaMeal(null);
          }}
          onExcluir={(favId) => persist({ ...data, refeicoesFavoritas: (data.refeicoesFavoritas || []).filter((f) => f.id !== favId) })} />
      )}

      {toast && (
        <div style={{ position: "fixed", left: 14, right: 14, bottom: 82, zIndex: 70, background: "var(--ink)", color: "#fff", padding: "13px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 6px 20px rgba(27,37,89,.28)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------- suplementos: fino, no topo, expansível, editável ---------- */
function PainelTopo({ pesos, day, onSetPeso, medLista, medMarcados, medHistorico, onToggleMed, suppLista, suppMarcados, onToggleSupp }) {
  const [aberto, setAberto] = useState(null);

  const medHoje = medLista.filter((m) => suppleDue(m, day));
  const medFeito = medHoje.filter((m) => medMarcados.includes(m.nome)).length;
  const suppHoje = suppLista.filter((s) => suppleDue(s, day));
  const suppFeito = suppHoje.filter((s) => suppMarcados.includes(s.nome)).length;

  const Mini = ({ k, icone, titulo, valor, cor }) => (
    <button onClick={() => setAberto(aberto === k ? null : k)}
      style={{ flex: 1, background: aberto === k ? "var(--ink)" : "var(--card)", borderRadius: 12, padding: "9px 6px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2, boxShadow: "0 1px 2px rgba(27,37,89,.06)" }}>
      <span style={{ fontSize: 15 }}>{icone}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: aberto === k ? "#fff" : "var(--ink)" }}>{titulo}</span>
      <span style={{ fontSize: 10.5, fontWeight: 800, color: aberto === k ? "#fff" : (cor || "var(--ink2)") }}>{valor}</span>
    </button>
  );

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 7 }}>
        <Mini k="peso" icone="⚖️" titulo="Peso" valor={pesos[day] != null ? `${n1(pesos[day])}kg` : "—"} />
        <Mini k="med" icone="🧠" titulo="Meds" valor={`${medFeito}/${medHoje.length}`} cor={medFeito === medHoje.length && medHoje.length ? "var(--lime-d)" : "var(--ink2)"} />
        <Mini k="supp" icone="💊" titulo="Suplem." valor={`${suppFeito}/${suppHoje.length}`} cor={suppFeito === suppHoje.length && suppHoje.length ? "var(--lime-d)" : "var(--ink2)"} />
      </div>

      {aberto && (
        <div className="card" style={{ padding: 13, marginTop: 8 }}>
          {aberto === "peso" && <PesoConteudo pesos={pesos} day={day} onSet={onSetPeso} />}
          {aberto === "med" && <ListaConteudo lista={medLista} marcados={medMarcados} historico={medHistorico} day={day} onToggle={onToggleMed} comDose />}
          {aberto === "supp" && <ListaConteudo lista={suppLista} marcados={suppMarcados} day={day} onToggle={onToggleSupp} />}
        </div>
      )}
    </div>
  );
}

function PesoConteudo({ pesos, day, onSet }) {
  const [val, setVal] = useState(pesos[day] != null ? String(pesos[day]) : "");
  useEffect(() => { setVal(pesos[day] != null ? String(pesos[day]) : ""); }, [day, pesos]);

  const entradas = Object.keys(pesos).sort().reverse().slice(0, 10);
  const diasOrdenados = Object.keys(pesos).sort();
  const anteriorData = diasOrdenados.filter((d) => d < day).slice(-1)[0] || null;
  const semanaData = (() => { const d = fromIso(day); d.setDate(d.getDate() - 7); return iso(d); })();
  const atual = pesos[day];
  const deltaAnt = atual != null && anteriorData != null ? atual - pesos[anteriorData] : null;
  const deltaSemana = atual != null && pesos[semanaData] != null ? atual - pesos[semanaData] : null;
  const Delta = ({ v }) => (
    <span style={{ color: v == null ? "var(--ink3)" : v > 0 ? "var(--orange-d)" : v < 0 ? "var(--lime-d)" : "var(--ink2)" }}>
      {v == null ? "—" : `${v > 0 ? "+" : ""}${n1(v)} kg`}
    </span>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
        <input className="num" inputMode="decimal" placeholder="kg" value={val}
          onChange={(e) => setVal(e.target.value.replace(",", ".").replace(/[^\d.]/g, ""))}
          style={{ flex: 1, padding: "8px 10px", fontSize: 14, fontWeight: 700, textAlign: "center" }} />
        <button className="ghost" disabled={!val} onClick={() => onSet(Number(val))}>salvar</button>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 11 }}>
        <div className="eb" style={{ flex: 1, background: "var(--rule)", borderRadius: 9, padding: "7px 9px" }}>
          vs anterior<br /><span className="num" style={{ fontSize: 13, fontWeight: 700 }}><Delta v={deltaAnt} /></span>
        </div>
        <div className="eb" style={{ flex: 1, background: "var(--rule)", borderRadius: 9, padding: "7px 9px" }}>
          vs 7 dias<br /><span className="num" style={{ fontSize: 13, fontWeight: 700 }}><Delta v={deltaSemana} /></span>
        </div>
      </div>
      {entradas.map((d, i) => {
        const anterior = entradas[i + 1];
        const delta = anterior != null ? pesos[d] - pesos[anterior] : null;
        return (
          <div key={d} className="row" style={{ padding: "6px 0", borderTop: i ? "1px solid var(--rule)" : 0 }}>
            <span style={{ fontSize: 12.5 }}>{label(d)}</span>
            <span className="num" style={{ fontSize: 12.5, fontWeight: 700 }}>{n1(pesos[d])} kg <Delta v={delta} /></span>
          </div>
        );
      })}
    </div>
  );
}

function ListaConteudo({ lista, marcados, historico, day, onToggle, comDose }) {
  return (
    <div>
      {lista.length === 0 && <div className="eb" style={{ padding: "6px 0" }}>Nada cadastrado. Adicione em Ajustes.</div>}
      {lista.map((m, i) => {
        const due = suppleDue(m, day);
        const dose = comDose ? doseNaData((historico || {})[m.id], day) : null;
        return (
          <div key={m.id || m.nome + i} style={{ padding: "8px 0", borderTop: i ? "1px solid var(--rule)" : 0 }}>
            <button onClick={() => due && onToggle(m.nome)} style={{ display: "flex", alignItems: "center", gap: 9, background: "transparent", padding: 0, width: "100%", textAlign: "left", opacity: due ? 1 : .45 }}>
              <span className="box" data-on={due && marcados.includes(m.nome) ? "1" : "0"}>{due && marcados.includes(m.nome) ? "✓" : ""}</span>
              <span style={{ fontSize: 13.5, fontWeight: marcados.includes(m.nome) ? 600 : 400, color: marcados.includes(m.nome) ? "var(--ink)" : "var(--ink2)", flex: 1 }}>
                {m.nome}{dose ? <span style={{ color: "var(--ink2)", fontWeight: 400 }}> · {dose.dose}{dose.unidade}{dose.horario ? ` · ${dose.horario}` : ""}</span> : null}
              </span>
              {(m.cadaDias || 1) > 1 && (
                <span className="pill" style={{ background: due ? "var(--orange-s)" : "var(--rule)", color: due ? "var(--orange-d)" : "var(--ink3)" }}>
                  {due ? "hoje" : `a cada ${m.cadaDias}d`}
                </span>
              )}
            </button>
          </div>
        );
      })}
      <div className="eb" style={{ marginTop: 9, lineHeight: 1.5 }}>Para adicionar ou mudar a periodicidade, vá em Ajustes.</div>
    </div>
  );
}

function Marcadores({ lista, valores, onValor, onLista }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const preenchidos = lista.filter((m) => valores[m.id] != null).length;

  return (
    <div className="strip">
      <button className="stripBtn" onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14 }}>🧭</span>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Marcações diárias</span>
          <span className="pill" style={{ background: preenchidos === lista.length && lista.length ? "var(--lime-s)" : "var(--rule)", color: preenchidos === lista.length && lista.length ? "var(--lime-d)" : "var(--ink2)" }}>
            {preenchidos}/{lista.length}
          </span>
        </div>
        <span style={{ color: "var(--ink3)", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {lista.map((m, i) => (
            <div key={m.id} style={{ padding: "9px 0", borderTop: i ? "1px solid var(--rule)" : 0 }}>
              {edit ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={m.nome} style={{ flex: 1, padding: "7px 9px", fontSize: 13 }}
                    onChange={(e) => onLista(lista.map((z, k) => (k === i ? { ...z, nome: e.target.value } : z)))} />
                  <button className="mini" onClick={() => onLista(lista.filter((_, k) => k !== i))}>✕</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13.5, fontWeight: valores[m.id] != null ? 600 : 400, marginBottom: 7 }}>{m.nome}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => onValor(m.id, valores[m.id] === n ? null : n)}
                        style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontWeight: 700, fontSize: 13,
                          background: valores[m.id] === n ? "var(--violet)" : "var(--bg)",
                          color: valores[m.id] === n ? "#fff" : "var(--ink2)" }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
            <button className="ghost" style={{ flex: 1 }} onClick={() => setEdit(!edit)}>{edit ? "concluir" : "editar lista"}</button>
            {edit && <button className="ghost" onClick={() => onLista([...lista, { id: uid(), nome: "Novo marcador" }])}>+ item</button>}
          </div>
          <div className="eb" style={{ marginTop: 9, lineHeight: 1.5 }}>1 = baixo, 5 = alto. Preencha quando lembrar — não precisa ser todo dia.</div>
        </div>
      )}
    </div>
  );
}

function MedicamentosStrip({ lista, historico, onLista, onDose }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [alterando, setAlterando] = useState(null);
  const [histAberto, setHistAberto] = useState(null);
  const [form, setForm] = useState({ dose: "", unidade: "mg", horario: "", data: iso(new Date()) });

  const hoje = iso(new Date());
  const ativos = lista.filter((m) => doseNaData(historico[m.id], hoje)).length;

  function abrirAlterar(m) {
    const atual = doseNaData(historico[m.id], hoje);
    setForm({ dose: atual ? String(atual.dose) : "", unidade: atual ? atual.unidade : "mg", horario: atual ? atual.horario : "", data: hoje });
    setAlterando(m.id);
  }
  function salvarDose() {
    if (form.dose === "") return;
    onDose(alterando, { data: form.data, dose: Number(form.dose), unidade: form.unidade, horario: form.horario });
    setAlterando(null);
  }

  return (
    <div className="strip">
      <button className="stripBtn" onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14 }}>🧠</span>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Medicamentos</span>
          <span className="pill" style={{ background: ativos ? "var(--lime-s)" : "var(--rule)", color: ativos ? "var(--lime-d)" : "var(--ink2)" }}>
            {ativos}/{lista.length}
          </span>
        </div>
        <span style={{ color: "var(--ink3)", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {lista.map((m, i) => {
            const atual = doseNaData(historico[m.id], hoje);
            const hist = (historico[m.id] || []).slice().sort((a, b) => b.data.localeCompare(a.data));
            return (
              <div key={m.id} style={{ padding: "9px 0", borderTop: i ? "1px solid var(--rule)" : 0 }}>
                {edit ? (
                  <div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7 }}>
                      <input value={m.nome} style={{ flex: 1, padding: "7px 9px", fontSize: 13 }}
                        onChange={(e) => onLista(lista.map((z, k) => (k === i ? { ...z, nome: e.target.value } : z)))} />
                      <button className="mini" onClick={() => onLista(lista.filter((_, k) => k !== i))}>✕</button>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span className="eb" style={{ whiteSpace: "nowrap" }}>a cada</span>
                      <input className="num" inputMode="numeric" value={m.cadaDias || 1} style={{ width: 44, padding: "7px 4px", fontSize: 13, textAlign: "center" }}
                        onChange={(e) => onLista(lista.map((z, k) => (k === i ? { ...z, cadaDias: Math.max(1, n0(e.target.value.replace(/\D/g, "")) || 1) } : z)))} />
                      <span className="eb">dias, a partir de</span>
                      <input type="date" value={m.ancora || hoje} style={{ padding: "6px 7px", fontSize: 12, flex: 1 }}
                        onChange={(e) => onLista(lista.map((z, k) => (k === i ? { ...z, ancora: e.target.value } : z)))} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row" style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{m.nome}</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {(m.cadaDias || 1) > 1 && <span className="pill" style={{ background: "var(--rule)", color: "var(--ink2)" }}>a cada {m.cadaDias}d</span>}
                        {atual ? (
                          <span className="pill" style={{ background: "var(--violet-s)", color: "var(--violet-d)" }}>{atual.dose} {atual.unidade}{atual.horario ? ` · ${atual.horario}` : ""}</span>
                        ) : (
                          <span className="pill" style={{ background: "var(--rule)", color: "var(--ink2)" }}>sem dose</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="ghost" style={{ flex: 1 }} onClick={() => abrirAlterar(m)}>alterar dose</button>
                      {hist.length > 0 && <button className="ghost" onClick={() => setHistAberto(histAberto === m.id ? null : m.id)}>{histAberto === m.id ? "ocultar" : "histórico"}</button>}
                    </div>
                    {histAberto === m.id && (
                      <div style={{ marginTop: 8 }}>
                        {hist.map((h, k) => (
                          <div key={h.data} className="row" style={{ padding: "5px 0", borderTop: k ? "1px solid var(--rule)" : 0 }}>
                            <span className="eb">{label(h.data)}</span>
                            <span className="num" style={{ fontSize: 12 }}>{h.dose} {h.unidade}{h.horario ? ` · ${h.horario}` : ""}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
            <button className="ghost" style={{ flex: 1 }} onClick={() => setEdit(!edit)}>{edit ? "concluir" : "editar lista"}</button>
            {edit && <button className="ghost" onClick={() => onLista([...lista, { id: uid(), nome: "Novo medicamento", cadaDias: 1, ancora: hoje }])}>+ item</button>}
          </div>
          {lista.length === 0 && !edit && <div className="eb" style={{ padding: "8px 0" }}>Toque em "editar lista" para adicionar um medicamento.</div>}
        </div>
      )}

      {alterando && (
        <div className="sheet">
          <div className="row" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{lista.find((m) => m.id === alterando)?.nome}</span>
            <button className="ghost" onClick={() => setAlterando(null)}>fechar</button>
          </div>
          <div className="eb" style={{ marginBottom: 5 }}>Válido a partir de</div>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="eb" style={{ marginBottom: 4 }}>Dose</div>
              <input className="num" inputMode="decimal" value={form.dose}
                onChange={(e) => setForm({ ...form, dose: e.target.value.replace(",", ".").replace(/[^\d.]/g, "") })} />
            </div>
            <div style={{ width: 78 }}>
              <div className="eb" style={{ marginBottom: 4 }}>Unidade</div>
              <input value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} />
            </div>
          </div>
          <div className="eb" style={{ marginBottom: 4 }}>Horário</div>
          <input placeholder="hh:mm" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} style={{ marginBottom: 16 }} />
          <button className="cta" onClick={salvarDose} disabled={form.dose === ""}>Salvar</button>
        </div>
      )}
    </div>
  );
}

function PesoHistorico({ pesos, janela }) {
  const chaves = Object.keys(pesos).filter((d) => {
    const dias = diffDias(iso(new Date()), d);
    return dias >= 0 && dias < janela;
  }).sort();
  if (!chaves.length) return null;
  const valores = chaves.map((d) => pesos[d]);
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const delta = valores[valores.length - 1] - valores[0];
  return (
    <div className="card" style={{ padding: 14, marginBottom: 12 }}>
      <div className="row">
        <div>
          <div className="eb" style={{ fontWeight: 700 }}>Peso em jejum</div>
          <div className="eb" style={{ fontSize: 10.5, marginTop: 3 }}>média do período · {chaves.length} registros</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="num" style={{ fontSize: 21, fontWeight: 800 }}>{n1(media)} kg</div>
          <div className="eb" style={{ fontSize: 10.5, marginTop: 2, color: delta > 0 ? "var(--orange-d)" : delta < 0 ? "var(--lime-d)" : "var(--ink2)" }}>
            {delta > 0 ? "+" : ""}{n1(delta)} kg no período
          </div>
        </div>
      </div>
    </div>
  );
}

function Pills({ m, metas }) {
  return (
    <>
      {MACROS.map((x) => {
        const meta = metas && metas[x.k];
        const over = meta && m[x.k] > meta * 1.05;
        return (
          <span key={x.k} className="pill" style={{ background: over ? "var(--coral-s)" : x.bg, color: over ? "var(--coral-d)" : x.txt }}>
            {n1(m[x.k])}{meta ? ` / ${n0(meta)}` : ""} {x.lb}
          </span>
        );
      })}
    </>
  );
}

/* ---------- resumo do dia ---------- */
function Resumo({ tot, cfg }) {
  const over = tot.kcal > cfg.kcal;
  const pct = Math.min(100, (tot.kcal / (cfg.kcal || 1)) * 100);
  return (
    <div className="card" style={{ padding: "11px 13px", marginBottom: 10 }}>
      <div className="row" style={{ alignItems: "center", marginBottom: 7 }}>
        <div className="eb" style={{ fontWeight: 700 }}>Calorias hoje</div>
        <span className="num" style={{ fontSize: 13.5, fontWeight: 800 }}>
          {fmt(tot.kcal)}<span style={{ color: "var(--ink2)", fontWeight: 500 }}> / {fmt(cfg.kcal)} kcal</span>
        </span>
      </div>
      <div className="track" style={{ marginBottom: 9, height: 6 }}>
        <div className="fill" style={{ width: `${pct}%`, background: over ? "var(--coral)" : "var(--ink)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
        {MACROS.map((x) => (
          <div key={x.k} style={{ background: x.bg, borderRadius: 9, padding: "6px 7px", textAlign: "center" }}>
            <div className="eb" style={{ color: x.txt, fontSize: 9.5, fontWeight: 700 }}>{x.nome}</div>
            <div className="num" style={{ fontWeight: 800, fontSize: 12.5, color: x.txt }}>
              {fmt(tot[x.k])}<span style={{ fontWeight: 500, fontSize: 9.5 }}>/{fmt(cfg[x.k])}g</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- refeição ---------- */
function MealCard({ meal, clip, onAdd, onVoz, onSugerir, onPatch, onCopy, onPaste, onCopiarFuturo, onFavoritar, onUsarFavorita, onClear, onDelete }) {
  const [aberto, setAberto] = useState(false);
  const [menu, setMenu] = useState(false);
  const [metas, setMetas] = useState(false);
  const t = somar(meal.items);
  const a = meal.alvo;
  const pct = a && a.kcal ? Math.min(100, (t.kcal / a.kcal) * 100) : 0;
  const over = a && a.kcal && t.kcal > a.kcal * 1.05;
  const setAlvo = (f, v) => onPatch({ alvo: { kcal: 0, prot: 0, carb: 0, gord: 0, ...a, [f]: n0(v) } });

  if (!aberto) {
    return (
      <button className="card" onClick={() => setAberto(true)}
        style={{ width: "100%", padding: "12px 15px", marginBottom: 9, textAlign: "left", background: "var(--card)" }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>{meal.nome}</div>
            <div className="eb num" style={{ marginTop: 3 }}>{meal.hora || "—"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="eb" style={{ fontWeight: 600 }}>meta {a && a.kcal ? `${fmt(a.kcal)} kcal` : "—"}</div>
            <div className="num" style={{ fontSize: 15, fontWeight: 800, marginTop: 3, color: over ? "var(--coral-d)" : "var(--ink)" }}>{fmt(t.kcal)} kcal</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: "13px 15px", marginBottom: 11 }}>
      <div className="row" style={{ position: "relative" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700 }}>{meal.nome}</div>
          <div className="eb num" style={{ marginTop: 2 }}>{meal.hora}</div>
        </div>
        <button className="mini" onClick={() => setAberto(false)} aria-label="Recolher">▲</button>
        <button className="mini" onClick={() => setMenu(!menu)} aria-label="Opções">⋯</button>
        {menu && (
          <div className="menu" onMouseLeave={() => setMenu(false)}>
            <button onClick={() => { setMetas(true); setMenu(false); }}>Editar metas</button>
            <button onClick={() => { onCopy(); setMenu(false); }}>Copiar refeição</button>
            <button style={{ opacity: clip ? 1 : .35 }} onClick={() => { if (clip) { onPaste(); setMenu(false); } }}>Colar {clip ? `“${clip.nome}”` : "—"}</button>
            <button onClick={() => { onCopiarFuturo(); setMenu(false); }}>Copiar para os próximos dias…</button>
            <button style={{ opacity: (meal.items || []).length ? 1 : .35 }} onClick={() => { if ((meal.items || []).length) { onFavoritar(); setMenu(false); } }}>Favoritar esta refeição</button>
            <button onClick={() => { onUsarFavorita(); setMenu(false); }}>Usar refeição favorita</button>
            <button onClick={() => { onClear(); setMenu(false); }}>Limpar itens</button>
            <button style={{ color: "var(--coral-d)" }} onClick={() => { onDelete(); setMenu(false); }}>Excluir refeição</button>
          </div>
        )}
      </div>

      {/* meta × acumulado */}
      <div style={{ marginTop: 12, background: "var(--bg)", borderRadius: 12, padding: "11px 12px" }}>
        <div className="row" style={{ marginBottom: 8 }}>
          <span className="eb" style={{ fontWeight: 700 }}>Acumulado</span>
          <span className="num" style={{ fontSize: 14, fontWeight: 800 }}>
            {fmt(t.kcal)}<span style={{ color: "var(--ink2)", fontWeight: 600, fontSize: 12.5 }}> / {a && a.kcal ? fmt(a.kcal) : "—"} kcal</span>
          </span>
        </div>
        {a && a.kcal ? (
          <div className="track" style={{ marginBottom: 9 }}>
            <div className="fill" style={{ width: `${pct}%`, background: over ? "var(--coral)" : "var(--lime)" }} />
          </div>
        ) : null}
        {metas ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
            {[{ k: "kcal", lb: "kcal", bg: "#fff", txt: "var(--ink)" }, ...MACROS].map((x) => (
              <div key={x.k}>
                <div className="eb" style={{ marginBottom: 4, color: x.txt, fontWeight: 700 }}>{x.lb}</div>
                <input className="num" inputMode="numeric" placeholder="—"
                  style={{ padding: "8px 6px", fontSize: 13, background: x.bg === "#fff" ? "#fff" : x.bg, fontWeight: 700, textAlign: "center" }}
                  value={a && a[x.k] ? a[x.k] : ""} onChange={(e) => setAlvo(x.k, e.target.value.replace(/\D/g, ""))} />
              </div>
            ))}
            <button className="ghost" style={{ gridColumn: "span 4", marginTop: 2 }} onClick={() => setMetas(false)}>concluir metas</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
            <Pills m={t} metas={a} />
            <button className="mini" style={{ fontSize: 11, color: "var(--coral-d)", padding: "2px 6px" }} onClick={() => setMetas(true)}>editar metas</button>
          </div>
        )}
      </div>

      {(meal.items || []).map((it) => (
        <ItemRow key={it.id} it={it}
          onG={(g) => onPatch({ items: meal.items.map((z) => (z.id === it.id ? { ...z, g } : z)) })}
          onDel={() => onPatch({ items: meal.items.filter((z) => z.id !== it.id) })} />
      ))}

      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        <button className="soft" style={{ flex: 1 }} onClick={onVoz}>🎙 Falar</button>
        <button className="ghost" style={{ flex: 1 }} onClick={onAdd}>+ Alimento</button>
        <button className="ghost" onClick={onUsarFavorita} aria-label="Usar refeição favorita">★</button>
        <button className="ghost" style={{ background: "var(--violet-s)", color: "var(--violet-d)", borderColor: "var(--violet-s)" }} onClick={onSugerir}>✨ Meta</button>
      </div>
    </div>
  );
}

function CopiarFuturoPanel({ meal, onClose, onConfirmar }) {
  const [dias, setDias] = useState("7");
  return (
    <div className="sheet">
      <div className="row" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Copiar "{meal.nome}"</span>
        <button className="ghost" onClick={onClose}>fechar</button>
      </div>
      <div className="eb" style={{ marginBottom: 10, lineHeight: 1.6 }}>
        Aplica os itens de hoje nessa mesma refeição (por nome) nos próximos dias. Se um dia já tiver itens lançados ali, eles são substituídos.
      </div>
      <div className="eb" style={{ marginBottom: 7 }}>Quantos dias à frente</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[7, 14, 30].map((n) => (
          <button key={n} className="chip" data-on={dias === String(n) ? "1" : "0"} onClick={() => setDias(String(n))} style={{ flex: 1 }}>{n} dias</button>
        ))}
      </div>
      <input className="num" inputMode="numeric" placeholder="ou outro número" value={["7", "14", "30"].includes(dias) ? "" : dias}
        onChange={(e) => setDias(e.target.value.replace(/\D/g, ""))} style={{ marginBottom: 16 }} />
      <button className="cta" onClick={() => onConfirmar(Math.max(1, Number(dias) || 7))}>Copiar</button>
    </div>
  );
}

function FavoritarRefeicaoPanel({ meal, onClose, onSalvar }) {
  const [nome, setNome] = useState(meal.nome);
  const t = somar(meal.items);
  return (
    <div className="sheet">
      <div className="row" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Favoritar refeição</span>
        <button className="ghost" onClick={onClose}>fechar</button>
      </div>
      <div className="eb" style={{ marginBottom: 5 }}>Nome da refeição favorita</div>
      <input value={nome} onChange={(e) => setNome(e.target.value)} style={{ marginBottom: 14, fontSize: 15 }} />
      <div className="card" style={{ padding: "4px 15px 10px", marginBottom: 16 }}>
        <div className="eb" style={{ padding: "10px 0 4px", fontWeight: 700 }}>{meal.items.length} itens · {fmt(t.kcal)} kcal</div>
        {meal.items.map((it, i) => (
          <div key={i} className="item" style={{ fontSize: 13 }}>{it.nome} · {it.g} g</div>
        ))}
      </div>
      <button className="cta" onClick={() => nome.trim() && onSalvar(nome.trim())} disabled={!nome.trim()}>Salvar como favorita</button>
    </div>
  );
}

function UsarFavoritaPanel({ favoritas, onClose, onUsar, onExcluir }) {
  return (
    <div className="sheet">
      <div className="row" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Refeições favoritas</span>
        <button className="ghost" onClick={onClose}>fechar</button>
      </div>
      {favoritas.length === 0 && <div className="eb" style={{ padding: "6px 0", lineHeight: 1.6 }}>Nenhuma ainda. Dentro de uma refeição, use "Favoritar esta refeição" para salvar um conjunto de alimentos — como um pré-treino que você sempre repete.</div>}
      <div className="card" style={{ padding: "4px 15px 8px" }}>
        {favoritas.map((f, i) => {
          const t = somar(f.items);
          return (
            <div key={f.id} className="item">
              <div className="row">
                <button style={{ background: "transparent", padding: 0, textAlign: "left", flex: 1 }} onClick={() => onUsar(f)}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{f.nome}</div>
                  <div className="eb" style={{ marginTop: 3 }}>{f.items.length} itens · {fmt(t.kcal)} kcal</div>
                </button>
                <button className="mini" style={{ color: "var(--coral-d)" }} onClick={() => onExcluir(f.id)}>excluir</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemRow({ it, onG, onDel }) {
  const m = calc(it);
  return (
    <div className="item">
      <div className="row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.nome}</div>
          <div style={{ display: "flex", gap: 5, marginTop: 6, alignItems: "center" }}>
            <span className="num" style={{ fontSize: 11.5, fontWeight: 800 }}>{fmt(m.kcal)}</span>
            <Pills m={m} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <input className="num" inputMode="decimal" value={it.g}
            onChange={(e) => onG(Number(e.target.value.replace(",", ".").replace(/[^\d.]/g, "")) || 0)}
            style={{ width: 62, padding: "8px 8px", fontSize: 13, textAlign: "right", fontWeight: 700 }} />
          <span className="eb">g</span>
          <button className="mini" onClick={onDel} aria-label="Remover">✕</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- sugestão para fechar a meta ---------- */
function SugerirPanel({ data, cfg, dia, tot, meal, onClose, onLancar, onSalvarAlvo }) {
  const temAlvo = (a) => a && (a.kcal || a.prot || a.carb || a.gord);
  const [alvoTipo, setAlvoTipo] = useState(temAlvo(meal.alvo) ? "refeicao" : "dia");
  const [alvoRasc, setAlvoRasc] = useState(meal.alvo || { kcal: "", prot: "", carb: "", gord: "" });
  const [res, setRes] = useState(null);
  const [nota, setNota] = useState("");
  const [proc, setProc] = useState(false);
  const [erro, setErro] = useState("");

  const t = somar(meal.items);
  const alvoAtivo = temAlvo(meal.alvo)
    ? meal.alvo
    : { kcal: +alvoRasc.kcal || 0, prot: +alvoRasc.prot || 0, carb: +alvoRasc.carb || 0, gord: +alvoRasc.gord || 0 };
  const falta = alvoTipo === "refeicao"
    ? { kcal: alvoAtivo.kcal - t.kcal, prot: alvoAtivo.prot - t.prot, carb: alvoAtivo.carb - t.carb, gord: alvoAtivo.gord - t.gord }
    : { kcal: cfg.kcal - tot.kcal, prot: cfg.prot - tot.prot, carb: cfg.carb - tot.carb, gord: cfg.gord - tot.gord };

  /* histórico: o que ele costuma comer nesta refeição */
  const historico = useMemo(() => {
    const cont = {};
    Object.values(data.days || {}).forEach((d) =>
      (d.meals || []).forEach((m) => {
        if (m.nome !== meal.nome) return;
        (m.items || []).forEach((i) => {
          if (!cont[i.nome]) cont[i.nome] = { n: 0, g: 0, f: i };
          cont[i.nome].n++; cont[i.nome].g += i.g;
        });
      }));
    return Object.entries(cont).sort((a, b) => b[1].n - a[1].n).slice(0, 14)
      .map(([nome, v]) => ({ nome, media: Math.round(v.g / v.n), vezes: v.n, f: v.f }));
  }, [data, meal]);

  async function sugerir() {
    setProc(true); setErro("");
    try {
      const hist = historico.length
        ? historico.map((h) => `${h.nome} (~${h.media} g, ${h.vezes}x)`).join("; ")
        : "sem histórico ainda";
      const favs = (data.favs || []).map((f) => f.nome).join("; ") || "nenhum";
      const jaTem = (meal.items || []).map((i) => `${i.nome} ${i.g} g`).join("; ") || "nada ainda";
      const escopo = alvoTipo === "refeicao"
        ? `fechar a meta da refeição "${meal.nome}"`
        : `corrigir o dia inteiro usando a refeição "${meal.nome}"`;

      const r = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-5", max_tokens: 1200,
          messages: [{ role: "user", content: `Você é nutricionista esportivo de um praticante que treina 6x/semana. Objetivo: ${escopo}.

Já consumido nesta refeição: ${jaTem}
FALTA atingir: ${n0(falta.kcal)} kcal, ${n0(falta.prot)} g proteína, ${n0(falta.carb)} g carboidrato, ${n0(falta.gord)} g gordura.

Alimentos que ele costuma usar nesta refeição: ${hist}
Favoritos dele: ${favs}

Sugira de 2 a 4 alimentos com gramagem que cheguem perto do que falta, priorizando o histórico e os favoritos dele. Se algum macro estiver negativo (já estourou), não some mais dele. Use alimentos brasileiros comuns.

Responda só JSON, sem markdown:
{"nota":"uma frase curta explicando a escolha","itens":[{"nome":"Frango, peito grelhado","g":150,"kcal":165,"prot":31,"carb":0,"gord":3.6}]}` }],
        }),
      });
      const j = await r.json();
      const raw = (j.content || []).map((c) => c.text || "").join("").replace(/```json|```/g, "").trim();
      const o = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
      if (!o.itens || !o.itens.length) throw new Error();
      setNota(o.nota || "");
      setRes(o.itens.map((f) => ({ ...f, id: uid(), fonte: "sugestão" })));
    } catch { setErro("Não consegui montar a sugestão agora. Tente de novo."); }
    setProc(false);
  }

  const soma = res ? somar(res) : null;

  return (
    <div className="sheet">
      <div className="row" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Fechar a meta</span>
        <button className="ghost" onClick={onClose}>fechar</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button className="chip" data-on={alvoTipo === "refeicao" ? "1" : "0"} onClick={() => { setAlvoTipo("refeicao"); setRes(null); }}>
          Meta de {meal.nome}
        </button>
        <button className="chip" data-on={alvoTipo === "dia" ? "1" : "0"} onClick={() => { setAlvoTipo("dia"); setRes(null); }}>
          Corrigir o dia
        </button>
      </div>

      {alvoTipo === "refeicao" && !temAlvo(meal.alvo) && (
        <div className="card" style={{ padding: 15, marginBottom: 13, background: "var(--violet-s)" }}>
          <div className="eb" style={{ marginBottom: 10, fontWeight: 700, color: "var(--violet-d)" }}>
            {meal.nome} ainda não tem meta própria — defina aqui para sugerir com base nela
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}>
            {[{ k: "kcal", lb: "kcal", bg: "#fff", txt: "var(--ink)" }, ...MACROS].map((x) => (
              <div key={x.k}>
                <div className="eb" style={{ marginBottom: 4, color: x.txt, fontWeight: 700 }}>{x.lb}</div>
                <input className="num" inputMode="numeric" placeholder="—"
                  style={{ padding: "8px 6px", fontSize: 13, background: "#fff", fontWeight: 700, textAlign: "center" }}
                  value={alvoRasc[x.k]} onChange={(e) => setAlvoRasc({ ...alvoRasc, [x.k]: e.target.value.replace(/\D/g, "") })} />
              </div>
            ))}
          </div>
          <button className="ghost" style={{ width: "100%", marginTop: 10 }}
            disabled={!alvoRasc.kcal && !alvoRasc.prot && !alvoRasc.carb && !alvoRasc.gord}
            onClick={() => onSalvarAlvo({ kcal: n0(alvoRasc.kcal), prot: n0(alvoRasc.prot), carb: n0(alvoRasc.carb), gord: n0(alvoRasc.gord) })}>
            Salvar como meta fixa desta refeição
          </button>
        </div>
      )}

      <div className="card" style={{ padding: 15, marginBottom: 13 }}>
        <div className="eb" style={{ marginBottom: 9, fontWeight: 700 }}>Falta para bater</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}>
          {[{ k: "kcal", lb: "kcal", bg: "var(--rule)", txt: "var(--ink)" }, ...MACROS].map((x) => (
            <div key={x.k} style={{ background: x.bg, borderRadius: 10, padding: "9px 6px", textAlign: "center" }}>
              <div className="eb" style={{ color: x.txt, marginBottom: 3, fontWeight: 700 }}>{x.lb}</div>
              <div className="num" style={{ fontSize: 15, fontWeight: 800, color: falta[x.k] < 0 ? "var(--coral-d)" : x.txt }}>{n0(falta[x.k])}</div>
            </div>
          ))}
        </div>
        {historico.length > 0 && (
          <div className="eb" style={{ marginTop: 11 }}>Baseado em {historico.length} alimentos que você já usou nesta refeição</div>
        )}
      </div>

      {erro && <div className="card" style={{ padding: 13, marginBottom: 12, fontSize: 13, color: "var(--coral-d)", background: "var(--coral-s)" }}>{erro}</div>}

      {!res && (
        <button className="cta" onClick={sugerir} disabled={proc}>{proc ? "Montando…" : "✨ Sugerir refeição"}</button>
      )}

      {res && (
        <>
          {nota && <div className="card" style={{ padding: 13, marginBottom: 12, fontSize: 13, lineHeight: 1.5, background: "var(--violet-s)", color: "var(--violet-d)", fontWeight: 500 }}>{nota}</div>}
          <div className="card" style={{ padding: "5px 15px 15px", marginBottom: 12 }}>
            {res.map((it, i) => (
              <div key={it.id} className="item">
                <div className="row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{it.nome}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                      <span className="num" style={{ fontSize: 11.5, fontWeight: 800 }}>{fmt(calc(it).kcal)}</span>
                      <Pills m={calc(it)} />
                    </div>
                  </div>
                  <input className="num" inputMode="decimal" value={it.g} style={{ width: 62, padding: "8px", fontSize: 13, textAlign: "right", fontWeight: 700 }}
                    onChange={(e) => setRes(res.map((z, k) => (k === i ? { ...z, g: Number(e.target.value.replace(",", ".").replace(/[^\d.]/g, "")) || 0 } : z)))} />
                  <span className="eb">g</span>
                  <button className="mini" onClick={() => setRes(res.filter((_, k) => k !== i))}>✕</button>
                </div>
              </div>
            ))}
            <div className="row" style={{ marginTop: 13, paddingTop: 12, borderTop: "1px solid var(--rule)" }}>
              <span className="eb" style={{ fontWeight: 700 }}>Soma</span>
              <span className="num" style={{ fontSize: 16, fontWeight: 800 }}>{fmt(soma.kcal)} kcal</span>
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 8 }}><Pills m={soma} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="cta" onClick={() => onLancar(res)}>Lançar em {meal.nome}</button>
            <button className="ghost" onClick={() => setRes(null)}>outra</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- voz ---------- */
function VozPanel({ meals, mealFixo, onClose, onLancar }) {
  const [txt, setTxt] = useState("");
  const [ouvindo, setOuvindo] = useState(false);
  const [proc, setProc] = useState(false);
  const [erro, setErro] = useState("");
  const [res, setRes] = useState(null);
  const [mealId, setMealId] = useState(mealFixo || (meals[0] && meals[0].id));
  const recRef = useRef(null);

  useEffect(() => { if (!mealFixo) ouvir(); }, []); // eslint-disable-line

  function ouvir() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setErro("Gravação direta indisponível aqui. Use o microfone do teclado no campo abaixo — funciona igual."); return; }
    try {
      const r = new SR();
      r.lang = "pt-BR"; r.continuous = true; r.interimResults = true;
      let base = "";
      r.onresult = (e) => {
        let fin = "", int = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) fin += e.results[i][0].transcript; else int += e.results[i][0].transcript;
        }
        if (fin) base += fin;
        setTxt((base + int).trim());
      };
      r.onerror = () => { setOuvindo(false); setErro("Microfone bloqueado aqui. Use o microfone do teclado no campo abaixo."); };
      r.onend = () => setOuvindo(false);
      recRef.current = r; r.start(); setOuvindo(true);
    } catch { setErro("Microfone bloqueado aqui. Use o microfone do teclado no campo abaixo."); }
  }
  function parar() { try { recRef.current && recRef.current.stop(); } catch {} setOuvindo(false); }

  async function processar() {
    if (!txt.trim()) return;
    parar(); setProc(true); setErro("");
    try {
      const nomes = meals.map((m) => m.nome).join(" | ");
      const r = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-5", max_tokens: 1400,
          messages: [{ role: "user", content: `Ditado de registro alimentar brasileiro: "${txt}"

Refeições disponíveis: ${nomes}

1) Identifique em qual refeição lançar. Use exatamente um dos nomes acima, ou null se não foi dito.
2) Liste os alimentos, com QUANTIDADE em gramas e composição POR 100 g.
Porções: pão francês 50 g · ovo 50 g · colher sopa de arroz 25 g · concha de feijão 80 g · filé de frango 120 g · scoop de whey 30 g · banana 100 g.

Só JSON, sem markdown:
{"refeicao":"Almoço","itens":[{"nome":"Arroz branco cozido","g":150,"kcal":128,"prot":2.5,"carb":28,"gord":0.2}]}` }],
        }),
      });
      const j = await r.json();
      const raw = (j.content || []).map((c) => c.text || "").join("").replace(/```json|```/g, "").trim();
      const o = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
      if (!o.itens || !o.itens.length) throw new Error();
      if (!mealFixo && o.refeicao) {
        const m = meals.find((x) => x.nome.toLowerCase() === String(o.refeicao).toLowerCase());
        if (m) setMealId(m.id);
      }
      setRes(o.itens.map((f) => ({ ...f, id: uid(), fonte: "voz" })));
    } catch { setErro("Não consegui interpretar. Diga com quantidades: “no almoço, 150 gramas de arroz e um filé de frango”."); }
    setProc(false);
  }

  const t = res ? somar(res) : null;

  return (
    <div className="sheet">
      <div className="row" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Registrar por voz</span>
        <button className="ghost" onClick={() => { parar(); onClose(); }}>fechar</button>
      </div>

      {!res && (
        <>
          <button className="hero" data-on={ouvindo ? "1" : "0"} onClick={() => (ouvindo ? parar() : ouvir())}>
            <span className="heroIcon">{ouvindo ? "■" : "🎙"}</span>
            <span>{ouvindo ? "Gravando — toque para parar" : "Gravar"}</span>
          </button>
          <textarea rows={5} value={txt} onChange={(e) => setTxt(e.target.value)}
            placeholder="No almoço, 150 gramas de arroz, uma concha de feijão e um filé de frango grelhado"
            style={{ marginBottom: 9, fontSize: 15, lineHeight: 1.5 }} />
          <div className="eb" style={{ marginBottom: 14, lineHeight: 1.5 }}>
            Diga o nome da refeição no começo e ela é escolhida sozinha. O microfone do teclado também funciona neste campo.
          </div>
          {erro && <div className="card" style={{ padding: 13, marginBottom: 12, fontSize: 13, color: "var(--coral-d)", background: "var(--coral-s)" }}>{erro}</div>}
          <button className="cta" onClick={processar} disabled={proc || !txt.trim()}>{proc ? "Calculando…" : "Calcular"}</button>
        </>
      )}

      {res && (
        <>
          <div className="eb" style={{ marginBottom: 8, fontWeight: 700 }}>Lançar em</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 15 }}>
            {meals.map((m) => (
              <button key={m.id} className="chip" data-on={m.id === mealId ? "1" : "0"} onClick={() => setMealId(m.id)}>{m.nome}</button>
            ))}
          </div>
          <div className="card" style={{ padding: "5px 15px 15px", marginBottom: 12 }}>
            {res.map((it, i) => (
              <div key={it.id} className="item">
                <div className="row">
                  <input value={it.nome} style={{ flex: 1, padding: "8px 10px", fontSize: 13 }}
                    onChange={(e) => setRes(res.map((z, k) => (k === i ? { ...z, nome: e.target.value } : z)))} />
                  <input className="num" inputMode="decimal" value={it.g} style={{ width: 62, padding: "8px", fontSize: 13, textAlign: "right", fontWeight: 700 }}
                    onChange={(e) => setRes(res.map((z, k) => (k === i ? { ...z, g: Number(e.target.value.replace(",", ".").replace(/[^\d.]/g, "")) || 0 } : z)))} />
                  <span className="eb">g</span>
                  <button className="mini" onClick={() => setRes(res.filter((_, k) => k !== i))}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 5, marginTop: 7 }}><Pills m={calc(it)} /></div>
              </div>
            ))}
            <div className="row" style={{ marginTop: 13, paddingTop: 12, borderTop: "1px solid var(--rule)" }}>
              <span className="eb" style={{ fontWeight: 700 }}>Total</span>
              <span className="num" style={{ fontSize: 16, fontWeight: 800 }}>{fmt(t.kcal)} kcal</span>
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 8 }}><Pills m={t} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="cta" onClick={() => onLancar(mealId, res)}>Lançar</button>
            <button className="ghost" onClick={() => { setRes(null); setTxt(""); }}>refazer</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- painel de alimentos ---------- */
function FoodSheet({ data, meal, onClose, onAdd, onFav, onCustom }) {
  const [modo, setModo] = useState("buscar");
  const [q, setQ] = useState("");
  const [ean, setEan] = useState("");
  const [off, setOff] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [sel, setSel] = useState(null);
  const [g, setG] = useState(100);
  const [erro, setErro] = useState("");
  const [proc, setProc] = useState(false);
  const [rapido, setRapido] = useState({ nome: "", kcal: "", prot: "", carb: "", gord: "" });
  const fileRef = useRef(null);

  const favs = data.favs || [], custom = data.custom || [], recentes = data.recentes || [];
  const local = useMemo(() => {
    const base = [...custom, ...TABELA];
    if (!q.trim()) return favs.length ? favs : base.slice(0, 24);
    const t = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return base.filter((f) => f.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(t)).slice(0, 30);
  }, [q, custom, favs]);

  async function claude(content, tokens) {
    const r = await fetch("/api/claude", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: tokens || 800, messages: [{ role: "user", content }] }),
    });
    const j = await r.json();
    return (j.content || []).map((c) => c.text || "").join("");
  }

  async function buscarOFF() {
    if (!q.trim()) return;
    setBuscando(true); setErro("");
    try {
      const u = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=12&fields=product_name,brands,nutriments,code`;
      const j = await (await fetch(u)).json();
      const r = (j.products || []).map(mapOFF).filter(Boolean);
      if (!r.length) throw new Error();
      setOff(r);
    } catch { setErro("Sem resposta da base de produtos. Use a tabela local, “estimar” ou a adição rápida."); }
    setBuscando(false);
  }

  async function estimar() {
    if (!q.trim()) return;
    setBuscando(true); setErro("");
    try {
      const t = await claude(`Estime a composição POR 100 g do alimento brasileiro: "${q}". Só JSON, sem markdown: [{"nome":"...","kcal":0,"prot":0,"carb":0,"gord":0}]`, 400);
      const c = t.replace(/```json|```/g, "").trim();
      setOff(JSON.parse(c.slice(c.indexOf("["), c.lastIndexOf("]") + 1)).map((f) => ({ ...f, id: uid(), fonte: "Claude", porcoes: [] })));
    } catch { setErro("Não consegui estimar. Tente a adição rápida."); }
    setBuscando(false);
  }

  async function acharPorCodigo(code) {
    const j = await (await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`)).json();
    if (j.status !== 1) throw new Error("nf");
    const f = mapOFF(j.product);
    if (!f) throw new Error("nf");
    setSel(f); setG(100); setModo("buscar"); setErro("");
  }

  async function lerFoto(file) {
    setProc(true); setErro("");
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file);
      });
      const txt = await claude([
        { type: "image", source: { type: "base64", media_type: file.type === "image/png" ? "image/png" : "image/jpeg", data: b64 } },
        { type: "text", text: "Leia o código de barras (EAN/UPC) desta foto. Responda APENAS os dígitos. Se não conseguir, responda NAO." },
      ], 100);
      const code = (txt.match(/\d{8,14}/) || [])[0];
      if (!code) throw new Error("sc");
      await acharPorCodigo(code);
    } catch (e) {
      setErro(String(e.message) === "sc"
        ? "Não deu para ler o código. Aproxime, use boa luz, ou digite o número abaixo."
        : "Produto não está na Open Food Facts. Use a adição rápida com os dados do rótulo.");
    }
    setProc(false);
  }

  const isFav = (f) => favs.some((x) => x.nome === f.nome);
  const preview = sel ? calc({ ...sel, g: Number(g) || 0 }) : null;

  const Linha = ({ f }) => (
    <div className="item">
      <div className="row">
        <button style={{ background: "transparent", padding: 0, textAlign: "left", flex: 1, minWidth: 0 }}
          onClick={() => { setSel(f); setG(f.porcoes && f.porcoes[0] ? f.porcoes[0][1] : 100); }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {f.nome}{f.marca ? <span style={{ color: "var(--ink2)" }}> · {f.marca}</span> : null}
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 6, alignItems: "center" }}>
            <span className="num" style={{ fontSize: 11.5, fontWeight: 800 }}>{fmt(f.kcal)}</span>
            <Pills m={f} />
            <span className="eb" style={{ fontSize: 10 }}>/100g</span>
          </div>
        </button>
        <button className="star" data-on={isFav(f) ? "1" : "0"} onClick={() => onFav(f)} aria-label="Favoritar">★</button>
      </div>
    </div>
  );

  return (
    <div className="sheet">
      <div className="row" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{meal ? meal.nome : "Adicionar"}</span>
        <button className="ghost" onClick={onClose}>fechar</button>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 11, marginBottom: 11 }}>
        {[["buscar", "Buscar"], ["fav", "Favoritos"], ["rec", "Recentes"], ["rapido", "Rápido"], ["codigo", "Código"]].map(([k, v]) => (
          <button key={k} className="chip" data-on={modo === k ? "1" : "0"} onClick={() => { setModo(k); setErro(""); }}>{v}</button>
        ))}
      </div>

      {erro && <div className="card" style={{ padding: 13, marginBottom: 11, fontSize: 13, color: "var(--coral-d)", background: "var(--coral-s)" }}>{erro}</div>}

      {sel && (
        <div className="card" style={{ padding: 15, marginBottom: 13, boxShadow: "0 4px 18px rgba(245,56,93,.18)" }}>
          <div className="row" style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 14.5, fontWeight: 700 }}>{sel.nome}</span>
            <button className="mini" onClick={() => setSel(null)}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <input className="num" inputMode="decimal" value={g} style={{ width: 104, textAlign: "right", fontSize: 17, fontWeight: 800 }}
              onChange={(e) => setG(e.target.value.replace(",", ".").replace(/[^\d.]/g, ""))} />
            <span className="eb">gramas</span>
          </div>
          {sel.porcoes && sel.porcoes.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 11 }}>
              {sel.porcoes.map(([nome, gr]) => <button key={nome} className="chip" onClick={() => setG(gr)}>{nome} · {gr} g</button>)}
            </div>
          )}
          <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 13 }}>
            <span className="num" style={{ fontSize: 16, fontWeight: 800 }}>{fmt(preview.kcal)}</span>
            <Pills m={preview} />
          </div>
          <button className="cta" onClick={() => onAdd([{ ...sel, id: uid(), g: Number(g) || 0 }])}>Adicionar</button>
        </div>
      )}

      {modo === "buscar" && (
        <>
          <input placeholder="filé de frango, aveia, banana…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 9, fontSize: 15 }} />
          <div style={{ display: "flex", gap: 6, marginBottom: 11 }}>
            <button className="ghost" style={{ flex: 1 }} onClick={buscarOFF} disabled={buscando}>{buscando ? "buscando…" : "buscar industrializado"}</button>
            <button className="ghost" onClick={estimar} disabled={buscando}>estimar</button>
          </div>
          <div className="card" style={{ padding: "5px 15px 13px" }}>
            <div className="eb" style={{ padding: "11px 0 4px", fontWeight: 700 }}>{!q && favs.length ? "Seus favoritos" : "Tabela base"}</div>
            {local.map((f, i) => <Linha key={f.nome + i} f={f} />)}
            {off.length > 0 && <div className="eb" style={{ padding: "16px 0 4px", fontWeight: 700, color: "var(--orange-d)" }}>Base de produtos</div>}
            {off.map((f, i) => <Linha key={"o" + i} f={f} />)}
          </div>
        </>
      )}

      {modo === "fav" && (
        <div className="card" style={{ padding: "5px 15px 13px" }}>
          <div className="eb" style={{ padding: "11px 0 4px", fontWeight: 700 }}>Favoritos</div>
          {favs.length === 0 && <div className="eb" style={{ padding: "6px 0 10px" }}>Toque na estrela de qualquer alimento para fixá-lo aqui.</div>}
          {favs.map((f, i) => <Linha key={f.nome + i} f={f} />)}
        </div>
      )}

      {modo === "rec" && (
        <div className="card" style={{ padding: "5px 15px 13px" }}>
          <div className="eb" style={{ padding: "11px 0 4px", fontWeight: 700 }}>Usados recentemente</div>
          {recentes.length === 0 && <div className="eb" style={{ padding: "6px 0 10px" }}>Ainda nada. O que você registrar aparece aqui.</div>}
          {recentes.map((f, i) => <Linha key={f.nome + i} f={f} />)}
        </div>
      )}

      {modo === "rapido" && (
        <div className="card" style={{ padding: 15 }}>
          <div className="eb" style={{ marginBottom: 10, fontWeight: 700 }}>Criar alimento · valores por 100 g</div>
          <input placeholder="Nome do alimento" value={rapido.nome} onChange={(e) => setRapido({ ...rapido, nome: e.target.value })} style={{ marginBottom: 10, fontSize: 15 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: 13 }}>
            {[{ k: "kcal", lb: "kcal", bg: "var(--rule)", txt: "var(--ink)" }, ...MACROS].map((x) => (
              <label key={x.k}>
                <div className="eb" style={{ marginBottom: 4, color: x.txt, fontWeight: 700 }}>{x.lb}</div>
                <input className="num" inputMode="decimal" style={{ padding: "9px 6px", fontSize: 13, background: x.bg, fontWeight: 700, textAlign: "center" }} value={rapido[x.k]}
                  onChange={(e) => setRapido({ ...rapido, [x.k]: e.target.value.replace(",", ".").replace(/[^\d.]/g, "") })} />
              </label>
            ))}
          </div>
          <button className="cta" disabled={!rapido.nome.trim()}
            onClick={() => {
              const f = { id: uid(), nome: rapido.nome.trim(), kcal: +rapido.kcal || 0, prot: +rapido.prot || 0, carb: +rapido.carb || 0, gord: +rapido.gord || 0, porcoes: [], fonte: "meu" };
              onCustom(f); setSel(f); setG(100); setModo("buscar");
              setRapido({ nome: "", kcal: "", prot: "", carb: "", gord: "" });
            }}>Criar e usar</button>
          <div className="eb" style={{ marginTop: 10 }}>Fica salvo na sua base para as próximas vezes.</div>
        </div>
      )}

      {modo === "codigo" && (
        <div className="card" style={{ padding: 15 }}>
          <div className="eb" style={{ marginBottom: 10, fontWeight: 700 }}>Código de barras</div>
          <label className="cta" style={{ display: "block", textAlign: "center", opacity: proc ? .6 : 1 }}>
            {proc ? "Lendo…" : "Fotografar o código"}
            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
              onChange={(e) => e.target.files && e.target.files[0] && lerFoto(e.target.files[0])} />
          </label>
          <div className="eb" style={{ marginTop: 10, lineHeight: 1.5 }}>Abre a câmera, lê os dígitos e busca na Open Food Facts.</div>
          <div className="eb" style={{ margin: "18px 0 7px", fontWeight: 700 }}>Ou digite o número</div>
          <div style={{ display: "flex", gap: 6 }}>
            <input className="num" inputMode="numeric" placeholder="7891000…" value={ean} onChange={(e) => setEan(e.target.value.replace(/\D/g, ""))} />
            <button className="ghost" disabled={!ean || proc} onClick={async () => {
              setProc(true); setErro("");
              try { await acharPorCodigo(ean); } catch { setErro("Código não encontrado na Open Food Facts."); }
              setProc(false);
            }}>buscar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function mapOFF(p) {
  const nu = (p && p.nutriments) || {};
  let kcal = nu["energy-kcal_100g"];
  if (kcal == null && nu["energy_100g"] != null) kcal = nu["energy_100g"] / 4.184;
  if (kcal == null) return null;
  return {
    id: "off_" + (p.code || uid()),
    nome: p.product_name || "Produto sem nome",
    marca: (p.brands || "").split(",")[0] || "",
    kcal: n1(kcal), prot: n1(nu.proteins_100g), carb: n1(nu.carbohydrates_100g), gord: n1(nu.fat_100g),
    porcoes: [], fonte: "OFF",
  };
}

/* ---------- histórico ---------- */
const SERIES_TENDENCIA = [
  { key: "peso", nome: "Peso", unidade: "kg", cor: "var(--coral)" },
  { key: "kcal", nome: "Calorias", unidade: "kcal", cor: "var(--ink)" },
  { key: "carb", nome: "Carbo", unidade: "g", cor: "var(--orange)" },
  { key: "prot", nome: "Proteína", unidade: "g", cor: "var(--lime)" },
  { key: "gord", nome: "Gordura", unidade: "g", cor: "var(--violet)" },
  { key: "pctMeta", nome: "% da meta (kcal)", unidade: "%", cor: "var(--violet-d)" },
];

function Historico({ data, cfg, onPick, onSalvarMedicao, onAltura, onFotosIndex, onExamesCampos, onSalvarExame, onExameContexto, razoes, onRazoes }) {
  const [janela, setJanela] = useState(14);
  const [ativos, setAtivos] = useState(["peso", "kcal"]);

  const dias = [];
  for (let k = janela - 1; k >= 0; k--) {
    const d = new Date(); d.setDate(d.getDate() - k);
    const key = iso(d);
    const dd = data.days && data.days[key];
    const items = ((dd && dd.meals) || []).flatMap((m) => m.items || []);
    const consumido = somar(items);
    const metaDia = somarAlvo((dd && dd.meals) || []);
    const peso = data.pesos && data.pesos[key] != null ? data.pesos[key] : null;
    const pctMeta = metaDia.kcal > 0 ? (consumido.kcal / metaDia.kcal) * 100 : null;
    const medida = (data.medicoes && data.medicoes[key]) || null;
    const exameDia = (data.exames && data.exames[key]) || null;
    const ponto = { key, ...consumido, metaDia, peso, pctMeta, vazio: items.length === 0, supps: (dd && dd.supps) || [] };
    MEDIDAS_CAMPOS.forEach((c) => { ponto[c.key] = medida && medida[c.key] != null ? medida[c.key] : null; });
    (data.examesCampos || []).forEach((c) => { ponto[c.key] = exameDia && exameDia[c.key] != null ? exameDia[c.key] : null; });
    (cfg.marcadores || []).forEach((m) => { ponto["marc_" + m.id] = dd && dd.marcadores && dd.marcadores[m.id] != null ? dd.marcadores[m.id] : null; });
    (cfg.medicamentos || []).forEach((med) => {
      const dose = doseNaData((data.medicamentoHistorico || {})[med.id], key);
      ponto["med_" + med.id] = dose ? dose.dose : null;
    });
    dias.push(ponto);
  }
  const max = Math.max(1, ...dias.map((d) => Math.max(d.kcal, d.metaDia.kcal || 0)));
  const reg = dias.filter((d) => !d.vazio);
  const md = (f) => (reg.length ? reg.reduce((a, d) => a + d[f], 0) / reg.length : 0);
  const regMeta = reg.filter((d) => d.metaDia.kcal > 0);
  const bateuKcal = regMeta.filter((d) => d.pctMeta >= 90 && d.pctMeta <= 110).length;
  const suppOk = dias.filter((d) => cfg.supps.length && d.supps.length === cfg.supps.length).length;

  const cards = [
    { lb: "Média kcal", v: fmt(md("kcal")), sub: regMeta.length ? `${bateuKcal}/${regMeta.length} dias na faixa da meta` : "sem meta definida no período", bg: "#fff", txt: "var(--ink)" },
    { lb: "Média proteína", v: `${fmt(md("prot"))} g`, sub: `${reg.length} dias registrados`, bg: "var(--lime-s)", txt: "var(--lime-d)" },
    { lb: "Média carbo", v: `${fmt(md("carb"))} g`, sub: `${reg.length} dias registrados`, bg: "var(--orange-s)", txt: "var(--orange-d)" },
    { lb: "Média gordura", v: `${fmt(md("gord"))} g`, sub: `${reg.length} dias registrados`, bg: "var(--violet-s)", txt: "var(--violet-d)" },
  ];

  return (
    <>
      <div className="row" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 19, fontWeight: 800 }}>Histórico</span>
        <div style={{ display: "flex", gap: 5 }}>
          {[7, 14, 30].map((j) => (
            <button key={j} className="chip" data-on={janela === j ? "1" : "0"} onClick={() => setJanela(j)} style={{ padding: "6px 11px" }}>{j}d</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 12 }}>
        {cards.map((c) => (
          <div key={c.lb} className="card" style={{ padding: 14, background: c.bg }}>
            <div className="eb" style={{ color: c.txt, fontWeight: 700, marginBottom: 6 }}>{c.lb}</div>
            <div className="num" style={{ fontSize: 21, fontWeight: 800, color: c.txt, letterSpacing: "-.03em" }}>{c.v}</div>
            <div className="eb" style={{ fontSize: 10.5, marginTop: 4, color: c.txt, opacity: .75 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 12 }}>
        <div className="row">
          <div>
            <div className="eb" style={{ fontWeight: 700 }}>Suplementos completos</div>
            <div className="eb" style={{ fontSize: 10.5, marginTop: 3 }}>dias com a lista toda marcada</div>
          </div>
          <span className="num" style={{ fontSize: 21, fontWeight: 800 }}>{suppOk}<span style={{ color: "var(--ink2)", fontSize: 14 }}>/{janela}</span></span>
        </div>
      </div>

      <PesoHistorico pesos={data.pesos || {}} janela={janela} />

      <MedicoesPanel medicoes={data.medicoes || {}} altura={data.altura} onAltura={onAltura}
        onSalvar={(dataChave, valores) => onSalvarMedicao(dataChave, valores)} />

      <FotosPanel fotosIndex={data.fotosIndex || {}} onIndex={onFotosIndex} />

      <ExamesPanel campos={data.examesCampos || []} exames={data.exames || {}} contextos={data.exameContexto || {}}
        onCampos={onExamesCampos} onSalvar={onSalvarExame} onContexto={onExameContexto} />

      <Tendencias dias={dias} ativos={ativos} setAtivos={setAtivos} temMedidas={Object.keys(data.medicoes || {}).length > 0}
        examesCampos={data.examesCampos || []} marcadores={cfg.marcadores || []} medicamentos={cfg.medicamentos || []}
        razoes={razoes} onRazoes={onRazoes} />

      <div className="card" style={{ padding: "6px 15px 15px" }}>
        {dias.map((d) => {
          const kp = d.prot * 4, kc = d.carb * 4, kg = d.gord * 9, soma = kp + kc + kg || 1;
          return (
            <button key={d.key} onClick={() => onPick(d.key)}
              style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", borderTop: "1px solid var(--rule)", borderRadius: 0, padding: "11px 0" }}>
              <div className="row" style={{ marginBottom: 7 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{label(d.key)}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {d.pctMeta != null && (
                    <span className="pill" style={{ background: d.pctMeta >= 90 && d.pctMeta <= 110 ? "var(--lime-s)" : "var(--coral-s)", color: d.pctMeta >= 90 && d.pctMeta <= 110 ? "var(--lime-d)" : "var(--coral-d)" }}>
                      {n0(d.pctMeta)}% da meta
                    </span>
                  )}
                  <span className="num" style={{ fontSize: 12, color: d.vazio ? "var(--ink3)" : "var(--ink)", fontWeight: d.vazio ? 500 : 700 }}>
                    {d.vazio ? "—" : `${fmt(d.kcal)} kcal`}
                  </span>
                </div>
              </div>
              <div style={{ height: 9, background: "var(--rule)", borderRadius: 999 }}>
                <div className="ribbon" style={{ width: `${(d.kcal / max) * 100}%` }}>
                  <div style={{ width: `${(kp / soma) * 100}%`, background: "var(--lime)" }} />
                  <div style={{ width: `${(kc / soma) * 100}%`, background: "var(--orange)" }} />
                  <div style={{ width: `${(kg / soma) * 100}%`, background: "var(--violet)" }} />
                </div>
              </div>
            </button>
          );
        })}
        <div style={{ display: "flex", gap: 6, marginTop: 13, flexWrap: "wrap" }}>
          {MACROS.map((x) => <span key={x.k} className="pill" style={{ background: x.bg, color: x.txt }}>{x.nome}</span>)}
        </div>
      </div>
    </>
  );
}

const PALETA_MEDIDAS = ["var(--coral)", "var(--lime)", "var(--orange)", "var(--violet)", "var(--ink)"];

function Tendencias({ dias, ativos, setAtivos, temMedidas, examesCampos, marcadores, medicamentos, razoes, onRazoes }) {
  const [seletorOpen, setSeletorOpen] = useState(null);
  const [filtro, setFiltro] = useState("");
  const toggle = (k) => setAtivos(ativos.includes(k) ? ativos.filter((z) => z !== k) : [...ativos, k]);

  const seriesMedidas = MEDIDAS_CAMPOS.map((c, i) => ({ key: c.key, nome: c.lb, unidade: c.un, cor: PALETA_MEDIDAS[i % PALETA_MEDIDAS.length] }));
  const seriesExames = (examesCampos || []).map((c, i) => ({ key: c.key, nome: c.nome, unidade: c.unidade || "", cor: PALETA_MEDIDAS[(i + 2) % PALETA_MEDIDAS.length] }));
  const seriesMarcadores = (marcadores || []).map((m, i) => ({ key: "marc_" + m.id, nome: m.nome, unidade: "", cor: PALETA_MEDIDAS[(i + 1) % PALETA_MEDIDAS.length] }));
  const seriesMedicamentos = (medicamentos || []).map((m, i) => ({ key: "med_" + m.id, nome: m.nome, unidade: "", cor: PALETA_MEDIDAS[(i + 3) % PALETA_MEDIDAS.length] }));
  const todasSeries = [...SERIES_TENDENCIA, ...seriesMedidas, ...seriesExames, ...seriesMarcadores, ...seriesMedicamentos];
  const medidasAtivas = ativos.filter((k) => seriesMedidas.some((s) => s.key === k)).length;
  const examesAtivos = ativos.filter((k) => seriesExames.some((s) => s.key === k)).length;
  const marcadoresAtivos = ativos.filter((k) => seriesMarcadores.some((s) => s.key === k)).length;
  const medicamentosAtivos = ativos.filter((k) => seriesMedicamentos.some((s) => s.key === k)).length;

  const chartData = useMemo(() => {
    const faixas = {};
    todasSeries.forEach((s) => {
      const vals = dias.map((d) => d[s.key]).filter((v) => v != null && !Number.isNaN(v));
      faixas[s.key] = vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : null;
    });
    return dias.map((d) => {
      const ponto = { data: label(d.key).slice(0, 6), _raw: {} };
      todasSeries.forEach((s) => {
        const v = d[s.key];
        ponto._raw[s.key] = v;
        if (v == null || !faixas[s.key]) { ponto[s.key + "_n"] = null; return; }
        const { min, max } = faixas[s.key];
        ponto[s.key + "_n"] = max === min ? 50 : ((v - min) / (max - min)) * 100;
      });
      return ponto;
    });
  }, [dias]);

  const CustomTooltip = ({ active, payload, label: lb }) => {
    if (!active || !payload || !payload.length) return null;
    const raw = payload[0].payload._raw;
    return (
      <div style={{ background: "var(--ink)", color: "#fff", padding: "9px 11px", borderRadius: 9, fontSize: 11.5 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{lb}</div>
        {todasSeries.filter((s) => ativos.includes(s.key) && raw[s.key] != null).map((s) => (
          <div key={s.key} style={{ color: s.cor }}>{s.nome}: {n1(raw[s.key])} {s.unidade}</div>
        ))}
      </div>
    );
  };

  const listaSeletor = seletorOpen === "medidas" ? seriesMedidas : seletorOpen === "exames" ? seriesExames
    : seletorOpen === "marcadores" ? seriesMarcadores : seletorOpen === "medicamentos" ? seriesMedicamentos : [];
  const listaFiltrada = filtro.trim()
    ? listaSeletor.filter((s) => s.nome.toLowerCase().includes(filtro.trim().toLowerCase()))
    : listaSeletor;

  return (
    <>
    <div className="card" style={{ padding: 14, marginBottom: 12 }}>
      <div className="eb" style={{ fontWeight: 700, marginBottom: 9 }}>Tendências — cruze os índices que quiser</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {SERIES_TENDENCIA.map((s) => (
          <button key={s.key} className="chip" data-on={ativos.includes(s.key) ? "1" : "0"}
            style={ativos.includes(s.key) ? { background: s.cor, color: "#fff", borderColor: s.cor } : {}}
            onClick={() => toggle(s.key)}>{s.nome}</button>
        ))}
        {temMedidas && (
          <button className="chip" style={medidasAtivas ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" } : {}}
            onClick={() => { setSeletorOpen("medidas"); setFiltro(""); }}>
            📏 medições{medidasAtivas ? ` (${medidasAtivas})` : ""}
          </button>
        )}
        {seriesExames.length > 0 && (
          <button className="chip" style={examesAtivos ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" } : {}}
            onClick={() => { setSeletorOpen("exames"); setFiltro(""); }}>
            🧪 exames{examesAtivos ? ` (${examesAtivos})` : ""}
          </button>
        )}
        {seriesMarcadores.length > 0 && (
          <button className="chip" style={marcadoresAtivos ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" } : {}}
            onClick={() => { setSeletorOpen("marcadores"); setFiltro(""); }}>
            🧭 marcações{marcadoresAtivos ? ` (${marcadoresAtivos})` : ""}
          </button>
        )}
        {seriesMedicamentos.length > 0 && (
          <button className="chip" style={medicamentosAtivos ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" } : {}}
            onClick={() => { setSeletorOpen("medicamentos"); setFiltro(""); }}>
            🧠 medicamentos{medicamentosAtivos ? ` (${medicamentosAtivos})` : ""}
          </button>
        )}
      </div>
      {ativos.length === 0 ? (
        <div className="eb" style={{ padding: "10px 0" }}>Escolha ao menos um índice acima para ver o gráfico.</div>
      ) : (
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="var(--rule)" vertical={false} />
              <XAxis dataKey="data" tick={{ fontSize: 10, fill: "var(--ink2)" }} axisLine={{ stroke: "var(--rule)" }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--ink2)" }} axisLine={false} tickLine={false} width={26} />
              <Tooltip content={<CustomTooltip />} />
              {todasSeries.filter((s) => ativos.includes(s.key)).map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key + "_n"} name={s.nome} stroke={s.cor} strokeWidth={2} dot={{ r: 2 }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="eb" style={{ marginTop: 10, lineHeight: 1.5 }}>
        Cada linha usa sua própria escala (0–100) só para comparar a tendência entre elas — não são os valores reais. Toque num ponto para ver os números originais.
      </div>

      {seletorOpen && (
        <div className="sheet">
          <div className="row" style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>
              {seletorOpen === "medidas" ? "Escolher medições" : seletorOpen === "exames" ? "Escolher exames"
                : seletorOpen === "marcadores" ? "Escolher marcações" : "Escolher medicamentos"}
            </span>
            <button className="ghost" onClick={() => setSeletorOpen(null)}>concluir</button>
          </div>
          {seletorOpen === "exames" && listaSeletor.length > 8 && (
            <input placeholder="buscar índice…" value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ marginBottom: 12, fontSize: 14 }} />
          )}
          <div className="card" style={{ padding: "4px 15px 8px" }}>
            {listaFiltrada.map((s, i) => (
              <button key={s.key} onClick={() => toggle(s.key)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderTop: i ? "1px solid var(--rule)" : 0, background: "transparent", width: "100%", textAlign: "left" }}>
                <span className="box" data-on={ativos.includes(s.key) ? "1" : "0"}>{ativos.includes(s.key) ? "✓" : ""}</span>
                <span style={{ fontSize: 14, fontWeight: ativos.includes(s.key) ? 600 : 400 }}>{s.nome}</span>
                <span className="eb" style={{ marginLeft: "auto" }}>{s.unidade}</span>
              </button>
            ))}
            {listaFiltrada.length === 0 && <div className="eb" style={{ padding: "12px 0" }}>Nada encontrado.</div>}
          </div>
        </div>
      )}
    </div>

    <RazoesCard seriesMedidas={seriesMedidas} seriesExames={seriesExames} seriesMarcadores={seriesMarcadores} seriesMedicamentos={seriesMedicamentos}
      dias={dias} razoes={razoes || []} onRazoes={onRazoes} />
    </>
  );
}

function RazoesCard({ seriesMedidas, seriesExames, seriesMarcadores, seriesMedicamentos, dias, razoes, onRazoes }) {
  const [novo, setNovo] = useState(false);
  const [nome, setNome] = useState("");
  const [numKey, setNumKey] = useState("");
  const [denKey, setDenKey] = useState("");

  const todasSeries = [...SERIES_TENDENCIA, ...seriesMedidas, ...seriesExames, ...seriesMarcadores, ...seriesMedicamentos];
  const grupos = [
    { titulo: "Alimentação e peso", itens: SERIES_TENDENCIA },
    { titulo: "Medições corporais", itens: seriesMedidas },
    { titulo: "Exames de sangue", itens: seriesExames },
    { titulo: "Marcações diárias", itens: seriesMarcadores },
    { titulo: "Medicamentos (dose)", itens: seriesMedicamentos },
  ];

  function criar() {
    if (!numKey || !denKey) return;
    const numS = todasSeries.find((s) => s.key === numKey);
    const denS = todasSeries.find((s) => s.key === denKey);
    const nomeFinal = nome.trim() || `${numS?.nome} / ${denS?.nome}`;
    onRazoes([...razoes, { id: uid(), nome: nomeFinal, numKey, denKey }]);
    setNovo(false); setNome(""); setNumKey(""); setDenKey("");
  }

  return (
    <div className="card" style={{ padding: 14, marginBottom: 12 }}>
      <div className="row" style={{ marginBottom: 9 }}>
        <span className="eb" style={{ fontWeight: 700 }}>Cocientes — divida um índice pelo outro</span>
        <button className="mini" style={{ color: "var(--coral-d)" }} onClick={() => setNovo(!novo)}>{novo ? "cancelar" : "+ novo"}</button>
      </div>

      {novo && (
        <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--rule)" }}>
          <input placeholder="nome (opcional)" value={nome} onChange={(e) => setNome(e.target.value)} style={{ marginBottom: 8, fontSize: 13 }} />
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
            <select value={numKey} onChange={(e) => setNumKey(e.target.value)}
              style={{ flex: 1, padding: "8px 6px", fontSize: 12.5, borderRadius: 10, border: "1.5px solid var(--rule)", background: "#fff" }}>
              <option value="">numerador…</option>
              {grupos.map((g) => g.itens.length > 0 && (
                <optgroup key={g.titulo} label={g.titulo}>
                  {g.itens.map((s) => <option key={s.key} value={s.key}>{s.nome}</option>)}
                </optgroup>
              ))}
            </select>
            <span className="eb" style={{ fontSize: 16 }}>÷</span>
            <select value={denKey} onChange={(e) => setDenKey(e.target.value)}
              style={{ flex: 1, padding: "8px 6px", fontSize: 12.5, borderRadius: 10, border: "1.5px solid var(--rule)", background: "#fff" }}>
              <option value="">denominador…</option>
              {grupos.map((g) => g.itens.length > 0 && (
                <optgroup key={g.titulo} label={g.titulo}>
                  {g.itens.map((s) => <option key={s.key} value={s.key}>{s.nome}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <button className="cta" onClick={criar} disabled={!numKey || !denKey}>Criar cociente</button>
        </div>
      )}

      {razoes.length === 0 && !novo && (
        <div className="eb" style={{ padding: "6px 0", lineHeight: 1.5 }}>Nenhum ainda. Ex.: Estradiol ÷ Testosterona, para acompanhar esse índice ao longo do tempo.</div>
      )}

      {razoes.map((r) => {
        const numS = todasSeries.find((s) => s.key === r.numKey);
        const denS = todasSeries.find((s) => s.key === r.denKey);
        const chartData = dias.map((d) => {
          const num = d[r.numKey], den = d[r.denKey];
          const v = num != null && den ? num / den : null;
          return { data: label(d.key).slice(0, 6), v };
        });
        const comValor = chartData.filter((p) => p.v != null);
        const ultimo = comValor.length ? comValor[comValor.length - 1].v : null;
        return (
          <div key={r.id} style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--rule)" }}>
            <div className="row" style={{ marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.nome}</div>
                <div className="eb" style={{ marginTop: 2 }}>{numS?.nome} ÷ {denS?.nome}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {ultimo != null && <span className="num" style={{ fontSize: 15, fontWeight: 800 }}>{ultimo < 1 ? ultimo.toFixed(3) : n1(ultimo)}</span>}
                <button className="mini" style={{ color: "var(--coral-d)" }} onClick={() => onRazoes(razoes.filter((z) => z.id !== r.id))}>✕</button>
              </div>
            </div>
            {comValor.length < 2 ? (
              <div className="eb" style={{ padding: "6px 0" }}>Precisa de pelo menos dois dias com os dois índices registrados.</div>
            ) : (
              <div style={{ width: "100%", height: 140 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="var(--rule)" vertical={false} />
                    <XAxis dataKey="data" tick={{ fontSize: 9.5, fill: "var(--ink2)" }} axisLine={{ stroke: "var(--rule)" }} tickLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9.5, fill: "var(--ink2)" }} axisLine={false} tickLine={false} width={34} />
                    <Tooltip formatter={(v) => [v < 1 ? v.toFixed(3) : n1(v), r.nome]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="v" stroke="var(--violet)" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MedicoesPanel({ medicoes, altura, onAltura, onSalvar }) {
  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState("lista");
  const [dataForm, setDataForm] = useState(iso(new Date()));
  const [vals, setVals] = useState({});
  const [alturaForm, setAlturaForm] = useState(altura ? String(altura) : "");

  const datas = Object.keys(medicoes).sort().reverse();
  const ultima = datas[0];
  const camposManuais = MEDIDAS_CAMPOS.filter((c) => c.key !== "pctGordura");
  const estimado = pctGorduraMarinha(Number(vals.pescoco) || null, Number(vals.cinturaUmbigo) || null, Number(alturaForm) || null);

  function carregar(d) {
    setDataForm(d);
    const v = {};
    MEDIDAS_CAMPOS.forEach((c) => { v[c.key] = medicoes[d] && medicoes[d][c.key] != null ? String(medicoes[d][c.key]) : ""; });
    setVals(v);
    setModo("form");
  }
  function nova() {
    setDataForm(iso(new Date()));
    setVals({});
    setModo("form");
  }
  function salvar() {
    const valores = {};
    camposManuais.forEach((c) => { if (vals[c.key] !== undefined && vals[c.key] !== "") valores[c.key] = Number(vals[c.key]); });
    if (estimado != null) valores.pctGordura = Math.round(estimado * 10) / 10;
    if (alturaForm && Number(alturaForm) !== altura) onAltura(Number(alturaForm));
    onSalvar(dataForm, valores);
    setModo("lista");
  }

  return (
    <div className="strip">
      <button className="stripBtn" onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14 }}>📏</span>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Medições</span>
          <span className="pill" style={{ background: ultima ? "var(--lime-s)" : "var(--rule)", color: ultima ? "var(--lime-d)" : "var(--ink2)" }}>
            {ultima ? `última ${label(ultima)}` : "sem registro"}
          </span>
        </div>
        <span style={{ color: "var(--ink3)", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {modo === "lista" && (
            <>
              <button className="cta" style={{ marginBottom: 10 }} onClick={nova}>+ nova medição</button>
              {datas.length === 0 && <div className="eb" style={{ padding: "6px 0" }}>Nenhuma medição ainda. Você costuma medir aos domingos.</div>}
              {datas.map((d, i) => (
                <button key={d} onClick={() => carregar(d)} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", padding: "8px 0", borderTop: i ? "1px solid var(--rule)" : 0 }}>
                  <div className="row">
                    <span style={{ fontSize: 12.5 }}>{label(d)}</span>
                    <span className="num" style={{ fontSize: 12, color: "var(--ink2)" }}>
                      {medicoes[d].pctGordura != null ? `${n1(medicoes[d].pctGordura)}% gordura` : `${Object.keys(medicoes[d]).length} campos`}
                    </span>
                  </div>
                </button>
              ))}
            </>
          )}

          {modo === "form" && (
            <>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
                <input type="date" value={dataForm} onChange={(e) => setDataForm(e.target.value)} style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} />
                <input className="num" inputMode="numeric" placeholder="altura cm" value={alturaForm}
                  onChange={(e) => setAlturaForm(e.target.value.replace(/\D/g, ""))} style={{ width: 96, padding: "8px 10px", fontSize: 13, textAlign: "center" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 12 }}>
                {camposManuais.map((c) => (
                  <label key={c.key}>
                    <div className="eb" style={{ marginBottom: 3 }}>{c.lb}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input className="num" inputMode="decimal" style={{ padding: "7px 8px", fontSize: 12.5 }}
                        value={vals[c.key] || ""} onChange={(e) => setVals({ ...vals, [c.key]: e.target.value.replace(",", ".").replace(/[^\d.]/g, "") })} />
                      <span className="eb">{c.un}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="card" style={{ padding: 12, marginBottom: 12, background: "var(--violet-s)" }}>
                <div className="eb" style={{ color: "var(--violet-d)", fontWeight: 700, marginBottom: 4 }}>% gordura — método Marinha americana</div>
                {estimado != null ? (
                  <div className="num" style={{ fontSize: 20, fontWeight: 800, color: "var(--violet-d)" }}>{n1(estimado)}%</div>
                ) : (
                  <div className="eb" style={{ lineHeight: 1.5 }}>Preencha altura, pescoço e cintura (umbigo) para calcular.</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="cta" onClick={salvar}>Salvar</button>
                <button className="ghost" onClick={() => setModo("lista")}>cancelar</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- fotos de progresso: silhueta-guia + captura + galeria ---------- */
const ANGULOS_FOTO = [
  { key: "frontal", lb: "Frontal" },
  { key: "costas", lb: "Costas" },
  { key: "lateral", lb: "Lateral" },
];

function SilhuetaGuia({ angulo }) {
  const frente = (
    <svg viewBox="0 0 120 260" width="100%" height="100%">
      <g fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.55">
        <circle cx="60" cy="28" r="18" />
        <path d="M60 46 L60 150" />
        <path d="M60 58 Q30 60 18 110" />
        <path d="M60 58 Q90 60 102 110" />
        <path d="M60 70 L34 66 M60 70 L86 66" />
        <path d="M60 150 Q40 150 30 200 Q26 230 24 254" />
        <path d="M60 150 Q80 150 90 200 Q94 230 96 254" />
        <path d="M35 62 Q60 78 85 62" />
      </g>
    </svg>
  );
  const lado = (
    <svg viewBox="0 0 120 260" width="100%" height="100%">
      <g fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.55">
        <circle cx="66" cy="28" r="17" />
        <path d="M64 45 Q56 90 58 150" />
        <path d="M60 58 Q40 80 44 120" />
        <path d="M58 150 Q48 150 46 200 Q45 230 46 254" />
        <path d="M58 150 Q66 150 68 200 Q68 230 66 254" />
        <path d="M60 56 Q76 56 78 46" />
      </g>
    </svg>
  );
  return angulo === "lateral" ? lado : frente;
}

function comprimir(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      const max = 900;
      const esc = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * esc);
      c.height = Math.round(img.height * esc);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function FotosPanel({ fotosIndex, onIndex }) {
  const [open, setOpen] = useState(false);
  const [dataForm, setDataForm] = useState(iso(new Date()));
  const [guia, setGuia] = useState(null);
  const [preview, setPreview] = useState({});
  const [proc, setProc] = useState(false);
  const [verData, setVerData] = useState(null);
  const fileRef = useRef(null);

  const datas = Object.keys(fotosIndex).sort().reverse();

  async function onArquivo(file) {
    if (!guia) return;
    setProc(true);
    try {
      const dataUrl = await comprimir(file);
      await window.storage.set(`foto:${dataForm}:${guia}`, dataUrl);
      setPreview((p) => ({ ...p, [guia]: dataUrl }));
      const atuais = fotosIndex[dataForm] || [];
      if (!atuais.includes(guia)) onIndex(dataForm, [...atuais, guia]);
    } catch { /* falha silenciosa, usuário pode tentar de novo */ }
    setProc(false);
    setGuia(null);
  }

  return (
    <div className="strip">
      <button className="stripBtn" onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14 }}>📷</span>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Fotos de progresso</span>
          <span className="pill" style={{ background: datas.length ? "var(--lime-s)" : "var(--rule)", color: datas.length ? "var(--lime-d)" : "var(--ink2)" }}>
            {datas.length ? `última ${label(datas[0])}` : "sem registro"}
          </span>
        </div>
        <span style={{ color: "var(--ink3)", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          <input type="date" value={dataForm} onChange={(e) => { setDataForm(e.target.value); setPreview({}); }}
            style={{ padding: "8px 10px", fontSize: 13, marginBottom: 10 }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 10 }}>
            {ANGULOS_FOTO.map((a) => {
              const feito = preview[a.key] || (fotosIndex[dataForm] || []).includes(a.key);
              return (
                <button key={a.key} onClick={() => setGuia(a.key)}
                  style={{ background: "var(--bg)", border: `1.5px solid ${feito ? "var(--lime)" : "var(--rule)"}`, borderRadius: 10, padding: "8px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", aspectRatio: "1/1.6", color: "var(--ink3)", overflow: "hidden" }}>
                    {preview[a.key] ? <img src={preview[a.key]} alt={a.lb} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} /> : <SilhuetaGuia angulo={a.key} />}
                  </div>
                  <span className="eb" style={{ color: feito ? "var(--lime-d)" : "var(--ink2)", fontWeight: 600 }}>{a.lb}</span>
                </button>
              );
            })}
          </div>

          {datas.length > 0 && (
            <>
              <div className="eb" style={{ margin: "12px 0 6px", fontWeight: 700 }}>Registros anteriores</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {datas.map((d) => (
                  <button key={d} className="chip" onClick={() => setVerData(d)}>{label(d)} · {(fotosIndex[d] || []).length}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {guia && (
        <div className="sheet">
          <div className="row" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Foto {ANGULOS_FOTO.find((a) => a.key === guia).lb.toLowerCase()}</span>
            <button className="ghost" onClick={() => setGuia(null)}>fechar</button>
          </div>
          <div className="card" style={{ padding: 16, marginBottom: 14, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 160, color: "var(--ink2)" }}><SilhuetaGuia angulo={guia} /></div>
          </div>
          <div className="eb" style={{ marginBottom: 16, lineHeight: 1.6, textAlign: "center" }}>
            Alinhe seu corpo com a silhueta acima — mesma distância e enquadramento de sempre ajudam a comparar as semanas. Quando estiver pronto, toque abaixo para abrir a câmera.
          </div>
          <label className="cta" style={{ display: "block", textAlign: "center", opacity: proc ? .6 : 1 }}>
            {proc ? "salvando…" : "Tirar foto"}
            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
              onChange={(e) => e.target.files && e.target.files[0] && onArquivo(e.target.files[0])} />
          </label>
        </div>
      )}

      {verData && (
        <VisualizarFotos data={verData} angulos={fotosIndex[verData] || []}
          onClose={() => setVerData(null)}
          onDeletar={async (angulo) => {
            try { await window.storage.delete(`foto:${verData}:${angulo}`); } catch { /* já pode não existir, ignora */ }
            const restante = (fotosIndex[verData] || []).filter((a) => a !== angulo);
            onIndex(verData, restante);
          }} />
      )}
    </div>
  );
}

function VisualizarFotos({ data, angulos, onClose, onDeletar }) {
  const [imgs, setImgs] = useState({});
  useEffect(() => {
    (async () => {
      const novo = {};
      for (const a of angulos) {
        try {
          const r = await window.storage.get(`foto:${data}:${a}`);
          novo[a] = r ? r.value : null;
        } catch { novo[a] = null; }
      }
      setImgs(novo);
    })();
  }, [data, angulos]);

  return (
    <div className="sheet">
      <div className="row" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{label(data)}</span>
        <button className="ghost" onClick={onClose}>fechar</button>
      </div>
      {angulos.length === 0 && <div className="eb">Nenhuma foto neste registro.</div>}
      {angulos.map((a) => (
        <div key={a} className="card" style={{ padding: 10, marginBottom: 10 }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="eb" style={{ fontWeight: 700 }}>{ANGULOS_FOTO.find((x) => x.key === a)?.lb || a}</span>
            <button className="mini" style={{ color: "var(--coral-d)" }} onClick={() => onDeletar(a)}>excluir</button>
          </div>
          {imgs[a] ? <img src={imgs[a]} alt={a} style={{ width: "100%", borderRadius: 8 }} /> : <div className="eb">carregando…</div>}
        </div>
      ))}
    </div>
  );
}

/* ---------- exames de sangue: catálogo crescente + extração automática ---------- */
function slugify(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "campo";
}
function acharOuCriarCampo(campos, nome, unidade) {
  const norm = slugify(nome);
  const achado = campos.find((c) => c.key === norm || slugify(c.nome) === norm);
  if (achado) return { campos, key: achado.key };
  let key = norm, i = 2;
  while (campos.some((c) => c.key === key)) { key = norm + "_" + i; i++; }
  return { campos: [...campos, { key, nome, unidade: unidade || "" }], key };
}

function ExamesPanel({ campos, exames, contextos, onCampos, onSalvar, onContexto }) {
  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState("lista");
  const [dataForm, setDataForm] = useState(iso(new Date()));
  const [proc, setProc] = useState(false);
  const [erro, setErro] = useState("");
  const [revisao, setRevisao] = useState(null);
  const [verData, setVerData] = useState(null);
  const [manNome, setManNome] = useState(""); const [manValor, setManValor] = useState(""); const [manUnidade, setManUnidade] = useState("");
  const [ctx, setCtx] = useState({ momento: "", dose: "", anaPeriodicidade: "", anaUltima: "" });
  const fileRef = useRef(null);

  useEffect(() => {
    const c = contextos[dataForm] || {};
    setCtx({
      momento: c.momento || "", dose: c.dose != null ? String(c.dose) : "",
      anaPeriodicidade: c.anaPeriodicidade != null ? String(c.anaPeriodicidade) : "", anaUltima: c.anaUltima || "",
    });
  }, [dataForm, contextos]);

  function salvarCtx(patch) {
    const novo = { ...ctx, ...patch };
    setCtx(novo);
    onContexto(dataForm, {
      momento: novo.momento || null, dose: novo.dose !== "" ? Number(novo.dose) : null,
      anaPeriodicidade: novo.anaPeriodicidade !== "" ? Number(novo.anaPeriodicidade) : null, anaUltima: novo.anaUltima || null,
    });
  }

  const datas = Object.keys(exames).sort().reverse();

  async function processarArquivo(file) {
    setProc(true); setErro("");
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file);
      });
      const isPdf = file.type === "application/pdf";
      const bloco = isPdf
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } }
        : { type: "image", source: { type: "base64", media_type: file.type === "image/png" ? "image/png" : "image/jpeg", data: b64 } };
      const resp = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-5", max_tokens: 1000,
          messages: [{ role: "user", content: [bloco, {
            type: "text", text: `Extraia todos os resultados numéricos de exames laboratoriais deste documento. Ignore tabelas de referência, notas e textos explicativos — só o resultado medido de cada exame.

Para resultados do tipo "Inferior a X" ou "Superior a X" (abaixo do limite de detecção), use o valor X mesmo assim.

Responda APENAS com um JSON compacto, sem markdown, sem espaços supérfluos, nesse formato — "n" é o nome do exame, "v" é o valor numérico, "u" é a unidade:
[{"n":"Hemoglobina","v":15.9,"u":"g/dL"},{"n":"Glicose","v":87,"u":"mg/dL"}]` }] }],
        }),
      });
      const j = await resp.json();
      const raw = (j.content || []).map((c) => c.text || "").join("").replace(/```json|```/g, "").trim();
      const arr = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1));
      if (!arr.length) throw new Error();
      setRevisao(arr.map((x) => ({ nome: x.n, valor: String(x.v), unidade: x.u || "" })));
      setModo("revisar");
    } catch {
      setErro("Não consegui ler os índices deste arquivo. Tente novamente, ou adicione manualmente abaixo.");
    }
    setProc(false);
  }

  function salvarRevisao() {
    let camposAtual = campos;
    const valores = {};
    revisao.forEach((r) => {
      if (!r.nome.trim() || r.valor === "") return;
      const { campos: c2, key } = acharOuCriarCampo(camposAtual, r.nome.trim(), r.unidade);
      camposAtual = c2;
      valores[key] = Number(r.valor);
    });
    onSalvar(dataForm, valores, camposAtual);
    setRevisao(null); setModo("lista");
  }

  function adicionarManual() {
    if (!manNome.trim() || manValor === "") return;
    const { campos: c2, key } = acharOuCriarCampo(campos, manNome.trim(), manUnidade);
    onSalvar(dataForm, { [key]: Number(manValor) }, c2);
    setManNome(""); setManValor(""); setManUnidade("");
  }

  return (
    <div className="strip">
      <button className="stripBtn" onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14 }}>🧪</span>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Exames de sangue</span>
          <span className="pill" style={{ background: datas.length ? "var(--lime-s)" : "var(--rule)", color: datas.length ? "var(--lime-d)" : "var(--ink2)" }}>
            {datas.length ? `último ${label(datas[0])}` : "sem registro"}
          </span>
        </div>
        <span style={{ color: "var(--ink3)", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {modo === "lista" && (
            <>
              <input type="date" value={dataForm} onChange={(e) => setDataForm(e.target.value)} style={{ padding: "8px 10px", fontSize: 13, marginBottom: 10 }} />

              <div className="card" style={{ padding: 13, marginBottom: 12, background: "var(--violet-s)" }}>
                <div className="eb" style={{ color: "var(--violet-d)", fontWeight: 700, marginBottom: 9 }}>Contexto hormonal desta coleta</div>

                <div className="eb" style={{ marginBottom: 5 }}>Testosterona — momento da coleta</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
                  {[["pico", "Pico"], ["vale", "Vale"]].map(([k, lb]) => (
                    <button key={k} className="chip" data-on={ctx.momento === k ? "1" : "0"}
                      onClick={() => salvarCtx({ momento: ctx.momento === k ? "" : k })} style={{ flex: 1 }}>{lb}</button>
                  ))}
                </div>
                <div className="eb" style={{ marginBottom: 4 }}>Dose de testosterona (mg)</div>
                <input className="num" inputMode="decimal" placeholder="ex.: 125" value={ctx.dose}
                  onChange={(e) => salvarCtx({ dose: e.target.value.replace(",", ".").replace(/[^\d.]/g, "") })}
                  style={{ marginBottom: 12, background: "#fff" }} />

                <div className="eb" style={{ marginBottom: 5 }}>Anastrozol — a cada quantos dias</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 9, flexWrap: "wrap" }}>
                  {[5, 7, 10].map((n) => (
                    <button key={n} className="chip" data-on={ctx.anaPeriodicidade === String(n) ? "1" : "0"}
                      onClick={() => salvarCtx({ anaPeriodicidade: ctx.anaPeriodicidade === String(n) ? "" : String(n) })}>{n} dias</button>
                  ))}
                  <input className="num" inputMode="numeric" placeholder="outro" value={["5", "7", "10"].includes(ctx.anaPeriodicidade) ? "" : ctx.anaPeriodicidade}
                    onChange={(e) => salvarCtx({ anaPeriodicidade: e.target.value.replace(/\D/g, "") })}
                    style={{ width: 72, background: "#fff", fontSize: 12.5 }} />
                </div>
                <div className="eb" style={{ marginBottom: 4 }}>Última dose de anastrozol</div>
                <input type="date" value={ctx.anaUltima} onChange={(e) => salvarCtx({ anaUltima: e.target.value })} style={{ background: "#fff" }} />
              </div>

              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <label className="cta" style={{ flex: 1, display: "block", textAlign: "center", opacity: proc ? .6 : 1 }}>
                  {proc ? "lendo…" : "Anexar PDF"}
                  <input type="file" accept="application/pdf" style={{ display: "none" }}
                    onChange={(e) => e.target.files && e.target.files[0] && processarArquivo(e.target.files[0])} />
                </label>
                <label className="cta" style={{ flex: 1, display: "block", textAlign: "center", opacity: proc ? .6 : 1 }}>
                  {proc ? "lendo…" : "Fotografar exame"}
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                    onChange={(e) => e.target.files && e.target.files[0] && processarArquivo(e.target.files[0])} />
                </label>
              </div>
              <div className="eb" style={{ marginBottom: 10, lineHeight: 1.5 }}>Se o botão não abrir nada ao tocar, o navegador pode estar bloqueando a seleção de arquivo neste ambiente — nesse caso, use "+ adicionar índice manualmente" abaixo.</div>
              <button className="ghost" style={{ width: "100%", marginBottom: 10 }} onClick={() => setModo("manual")}>+ adicionar índice manualmente</button>
              {erro && <div className="card" style={{ padding: 11, marginBottom: 10, fontSize: 12, color: "var(--coral-d)", background: "var(--coral-s)" }}>{erro}</div>}
              {datas.length === 0 && <div className="eb" style={{ padding: "6px 0" }}>Nenhum exame ainda. Todo índice novo que aparecer é adicionado sozinho ao catálogo.</div>}
              {datas.map((d, i) => (
                <button key={d} onClick={() => setVerData(d)} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", padding: "8px 0", borderTop: i ? "1px solid var(--rule)" : 0 }}>
                  <div className="row">
                    <span style={{ fontSize: 12.5 }}>{label(d)}</span>
                    <span className="num" style={{ fontSize: 12, color: "var(--ink2)" }}>{Object.keys(exames[d]).length} índices</span>
                  </div>
                </button>
              ))}
            </>
          )}

          {modo === "manual" && (
            <div className="card" style={{ padding: 13 }}>
              <div className="eb" style={{ marginBottom: 9, fontWeight: 700 }}>Novo índice — {label(dataForm)}</div>
              <input placeholder="Nome do exame" value={manNome} onChange={(e) => setManNome(e.target.value)} style={{ marginBottom: 8, fontSize: 14 }} />
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                <input className="num" inputMode="decimal" placeholder="valor" value={manValor}
                  onChange={(e) => setManValor(e.target.value.replace(",", ".").replace(/[^\d.]/g, ""))} style={{ flex: 1 }} />
                <input placeholder="unidade" value={manUnidade} onChange={(e) => setManUnidade(e.target.value)} style={{ width: 90 }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="cta" onClick={adicionarManual} disabled={!manNome.trim() || manValor === ""}>Salvar</button>
                <button className="ghost" onClick={() => setModo("lista")}>concluir</button>
              </div>
            </div>
          )}

          {modo === "revisar" && revisao && (
            <>
              <div className="eb" style={{ marginBottom: 9, fontWeight: 700 }}>Confira antes de salvar — {revisao.length} índices encontrados</div>
              <div className="card" style={{ padding: "4px 13px 10px", marginBottom: 12, maxHeight: 360, overflowY: "auto" }}>
                {revisao.map((r, i) => (
                  <div key={i} className="item" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input value={r.nome} style={{ flex: 1, padding: "6px 8px", fontSize: 12.5 }}
                      onChange={(e) => setRevisao(revisao.map((z, k) => (k === i ? { ...z, nome: e.target.value } : z)))} />
                    <input className="num" inputMode="decimal" value={r.valor} style={{ width: 66, padding: "6px 6px", fontSize: 12.5, textAlign: "right" }}
                      onChange={(e) => setRevisao(revisao.map((z, k) => (k === i ? { ...z, valor: e.target.value.replace(",", ".").replace(/[^\d.]/g, "") } : z)))} />
                    <input value={r.unidade} style={{ width: 58, padding: "6px 6px", fontSize: 11.5 }}
                      onChange={(e) => setRevisao(revisao.map((z, k) => (k === i ? { ...z, unidade: e.target.value } : z)))} />
                    <button className="mini" onClick={() => setRevisao(revisao.filter((_, k) => k !== i))}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="cta" onClick={salvarRevisao}>Salvar {revisao.length} índices em {label(dataForm)}</button>
                <button className="ghost" onClick={() => { setRevisao(null); setModo("lista"); }}>cancelar</button>
              </div>
            </>
          )}
        </div>
      )}

      {verData && (
        <div className="sheet">
          <div className="row" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{label(verData)}</span>
            <button className="ghost" onClick={() => setVerData(null)}>fechar</button>
          </div>
          {contextos[verData] && (contextos[verData].momento || contextos[verData].dose || contextos[verData].anaPeriodicidade || contextos[verData].anaUltima) && (
            <div className="card" style={{ padding: 13, marginBottom: 12, background: "var(--violet-s)" }}>
              <div className="eb" style={{ color: "var(--violet-d)", fontWeight: 700, marginBottom: 7 }}>Contexto hormonal</div>
              {contextos[verData].momento && <div style={{ fontSize: 13, marginBottom: 3 }}>Coleta no <b>{contextos[verData].momento}</b>{contextos[verData].dose ? ` · dose ${contextos[verData].dose} mg` : ""}</div>}
              {contextos[verData].anaPeriodicidade && <div style={{ fontSize: 13, marginBottom: 3 }}>Anastrozol a cada {contextos[verData].anaPeriodicidade} dias</div>}
              {contextos[verData].anaUltima && <div style={{ fontSize: 13 }}>Última dose de anastrozol: {label(contextos[verData].anaUltima)}</div>}
            </div>
          )}
          <div className="card" style={{ padding: "4px 15px 10px" }}>
            {Object.entries(exames[verData]).map(([key, v], i) => {
              const c = campos.find((x) => x.key === key);
              return (
                <div key={key} className="item">
                  <div className="row">
                    <span style={{ fontSize: 13.5 }}>{c ? c.nome : key}</span>
                    <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{n1(v)} {c ? c.unidade : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- perfil ---------- */
function Perfil({ data, cfg, refModeloPadrao, persist }) {
  const [foto, setFoto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [alturaVal, setAlturaVal] = useState(data.altura ? String(data.altura) : "");
  const [verFotos, setVerFotos] = useState(null);
  const [thumbs, setThumbs] = useState({});

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get("foto:perfil"); setFoto(r ? r.value : null); }
      catch { setFoto(null); }
      setCarregando(false);
    })();
  }, []);

  async function trocarFoto(file) {
    try { const dataUrl = await comprimir(file); await window.storage.set("foto:perfil", dataUrl); setFoto(dataUrl); }
    catch { /* silencioso */ }
  }

  const datasFotos = Object.keys(data.fotosIndex || {}).sort().reverse().slice(0, 6);
  useEffect(() => {
    (async () => {
      for (const d of datasFotos) {
        const ang = (data.fotosIndex[d] || [])[0];
        if (!ang || thumbs[d]) continue;
        try { const r = await window.storage.get(`foto:${d}:${ang}`); setThumbs((t) => ({ ...t, [d]: r ? r.value : null })); } catch {}
      }
    })();
  }, [datasFotos.join(",")]); // eslint-disable-line

  const pesoDatas = Object.keys(data.pesos || {}).sort().slice(-60);
  const pesoChart = pesoDatas.map((d) => ({ data: label(d).slice(0, 6), kg: data.pesos[d] }));
  const ultimoPeso = pesoDatas.length ? data.pesos[pesoDatas[pesoDatas.length - 1]] : null;
  const metaTotal = somarAlvo(refModeloPadrao.meals);

  return (
    <>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 14 }}>Perfil</div>

      <div className="card" style={{ padding: 18, marginBottom: 11, textAlign: "center" }}>
        <label style={{ display: "inline-block", cursor: "pointer" }}>
          <div style={{ width: 92, height: 92, borderRadius: 999, margin: "0 auto 10px", background: "var(--coral-s)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid var(--rule)" }}>
            {!carregando && foto ? <img src={foto} alt="Perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 30, fontWeight: 800, color: "var(--coral-d)" }}>P</span>}
          </div>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && e.target.files[0] && trocarFoto(e.target.files[0])} />
          <span className="eb" style={{ color: "var(--coral-d)", fontWeight: 700 }}>{foto ? "trocar foto" : "adicionar foto"}</span>
        </label>
        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>Pedro</div>
        <div className="eb" style={{ marginTop: 3 }}>{ultimoPeso != null ? `${n1(ultimoPeso)} kg` : "peso não registrado"}{data.altura ? ` · ${data.altura} cm` : ""}</div>
      </div>

      <div className="card" style={{ padding: 15, marginBottom: 11 }}>
        <div className="eb" style={{ fontWeight: 700, marginBottom: 9 }}>Altura</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input className="num" inputMode="numeric" placeholder="cm" value={alturaVal}
            onChange={(e) => setAlturaVal(e.target.value.replace(/\D/g, ""))} style={{ flex: 1 }} />
          <button className="ghost" disabled={!alturaVal} onClick={() => persist({ ...data, altura: Number(alturaVal) })}>salvar</button>
        </div>
      </div>

      <div className="card" style={{ padding: 15, marginBottom: 11 }}>
        <div className="eb" style={{ fontWeight: 700, marginBottom: 9 }}>Meta ativa</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 8 }}>{refModeloPadrao.nome}</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <span className="pill" style={{ background: "var(--rule)", color: "var(--ink)" }}>{fmt(metaTotal.kcal)} kcal</span>
          <Pills m={metaTotal} />
        </div>
      </div>

      <div className="card" style={{ padding: 15, marginBottom: 11 }}>
        <div className="row" style={{ marginBottom: 9 }}>
          <span className="eb" style={{ fontWeight: 700 }}>Evolução do peso</span>
          <span className="num" style={{ fontSize: 12.5, color: "var(--ink2)" }}>{pesoDatas.length} registros</span>
        </div>
        {pesoChart.length < 2 ? (
          <div className="eb" style={{ padding: "8px 0" }}>Registre o peso por alguns dias para ver o gráfico aqui.</div>
        ) : (
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <LineChart data={pesoChart} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="var(--rule)" vertical={false} />
                <XAxis dataKey="data" tick={{ fontSize: 9.5, fill: "var(--ink2)" }} axisLine={{ stroke: "var(--rule)" }} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9.5, fill: "var(--ink2)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip formatter={(v) => [`${n1(v)} kg`, "Peso"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="kg" stroke="var(--coral)" strokeWidth={2} dot={{ r: 2 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 15 }}>
        <div className="row" style={{ marginBottom: 9 }}>
          <span className="eb" style={{ fontWeight: 700 }}>Evolução das fotos</span>
        </div>
        {datasFotos.length === 0 ? (
          <div className="eb" style={{ padding: "8px 0" }}>Registre fotos de progresso no Histórico para ver a evolução aqui.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
            {datasFotos.map((d) => (
              <button key={d} onClick={() => setVerFotos(d)} style={{ background: "var(--bg)", borderRadius: 9, overflow: "hidden", aspectRatio: "1/1.3", padding: 0 }}>
                {thumbs[d] ? <img src={thumbs[d]} alt={d} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div className="eb" style={{ padding: 8 }}>{label(d)}</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      {verFotos && (
        <VisualizarFotos data={verFotos} angulos={(data.fotosIndex || {})[verFotos] || []} onClose={() => setVerFotos(null)}
          onDeletar={async (angulo) => {
            try { await window.storage.delete(`foto:${verFotos}:${angulo}`); } catch {}
            const restante = ((data.fotosIndex || {})[verFotos] || []).filter((a) => a !== angulo);
            persist({ ...data, fotosIndex: { ...(data.fotosIndex || {}), [verFotos]: restante } });
          }} />
      )}
    </>
  );
}

/* ---------- ajustes ---------- */
function Ajustes({ data, cfg, persist, flash }) {
  const set = (patch) => persist({ ...data, config: { ...cfg, ...patch } });

  function exportar() {
    const L = [["data", "refeicao", "alimento", "gramas", "kcal", "prot_g", "carb_g", "gord_g", "fonte"]];
    Object.keys(data.days || {}).sort().forEach((d) =>
      ((data.days[d].meals) || []).forEach((m) =>
        (m.items || []).forEach((i) => {
          const c = calc(i);
          L.push([d, m.nome, `"${(i.nome || "").replace(/"/g, "'")}"`, i.g, n0(c.kcal), n1(c.prot), n1(c.carb), n1(c.gord), i.fonte || ""]);
        })));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([L.map((l) => l.join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    a.download = `nutri-${iso(new Date())}.csv`; a.click();
  }

  const setRefs = (lista) => set({ refeicoesModelos: lista });

  return (
    <>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 14 }}>Ajustes</div>

      <div className="card" style={{ padding: "6px 15px 15px", marginBottom: 11 }}>
        <div className="row" style={{ padding: "12px 0 8px" }}>
          <span className="eb" style={{ fontWeight: 700 }}>Meus modelos de refeição</span>
          <button className="mini" style={{ color: "var(--coral-d)" }}
            onClick={() => setRefs([...cfg.refeicoesModelos, { id: uid(), nome: "Novo modelo", padrao: false, meals: MEALS_PADRAO.map((m) => ({ ...m, id: uid(), alvo: null })) }])}>
            + novo
          </button>
        </div>
        {cfg.refeicoesModelos.map((r, ri) => (
          <ModeloRefeicaoRow key={r.id} r={r}
            onRenomear={(nome) => setRefs(cfg.refeicoesModelos.map((z, k) => (k === ri ? { ...z, nome } : z)))}
            onPadrao={() => setRefs(cfg.refeicoesModelos.map((z, k) => ({ ...z, padrao: k === ri })))}
            onExcluir={() => {
              const restante = cfg.refeicoesModelos.filter((_, k) => k !== ri);
              if (r.padrao) restante[0].padrao = true;
              setRefs(restante);
            }}
            podeExcluir={cfg.refeicoesModelos.length > 1}
            onMeals={(meals) => setRefs(cfg.refeicoesModelos.map((z, k) => (k === ri ? { ...z, meals } : z)))} />
        ))}
        <div className="eb" style={{ marginTop: 10, lineHeight: 1.5 }}>
          Cada modelo já traz nome, horário e as metas de macro de cada refeição. Toque em "adotar como padrão" para ele abrir sozinho em dias novos; no Diário dá para trocar só para o dia atual.
        </div>
      </div>

      <div className="card" style={{ padding: "6px 15px 15px", marginBottom: 11 }}>
        <div style={{ padding: "12px 0 4px" }}>
          <span className="eb" style={{ fontWeight: 700 }}>Medicamentos</span>
        </div>
        <MedicamentosStrip lista={cfg.medicamentos} historico={data.medicamentoHistorico || {}}
          onLista={(l) => set({ medicamentos: l })}
          onDose={(medId, entrada) => {
            const atual = (data.medicamentoHistorico && data.medicamentoHistorico[medId]) || [];
            const novo = [...atual.filter((h) => h.data !== entrada.data), entrada].sort((a, b) => a.data.localeCompare(b.data));
            persist({ ...data, medicamentoHistorico: { ...(data.medicamentoHistorico || {}), [medId]: novo } });
          }} />
        <div className="eb" style={{ marginTop: 4, lineHeight: 1.5 }}>Toda alteração de dose fica no histórico, com a data em que passou a valer. Isso entra nas Tendências do Histórico, cruzável com as marcações diárias.</div>
      </div>

      <div className="card" style={{ padding: "6px 15px 15px", marginBottom: 11 }}>
        <div className="row" style={{ padding: "12px 0 8px" }}>
          <span className="eb" style={{ fontWeight: 700 }}>Suplementos</span>
          <button className="mini" style={{ color: "var(--coral-d)" }}
            onClick={() => set({ supps: [...cfg.supps, { id: uid(), nome: "Novo item", cadaDias: 1, ancora: iso(new Date()) }] })}>
            + novo
          </button>
        </div>
        {cfg.supps.map((s, i) => (
          <div key={s.id} className="item" style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input value={s.nome} style={{ flex: 1, padding: "8px 10px", fontSize: 13 }}
              onChange={(e) => set({ supps: cfg.supps.map((z, k) => (k === i ? { ...z, nome: e.target.value } : z)) })} />
            <span className="eb" style={{ whiteSpace: "nowrap" }}>a cada</span>
            <input className="num" inputMode="numeric" value={s.cadaDias || 1} style={{ width: 44, padding: "8px 4px", fontSize: 13, textAlign: "center" }}
              onChange={(e) => set({ supps: cfg.supps.map((z, k) => (k === i ? { ...z, cadaDias: Math.max(1, n0(e.target.value.replace(/\D/g, "")) || 1) } : z)) })} />
            <span className="eb">dias</span>
            <input type="date" value={s.ancora || iso(new Date())} style={{ padding: "7px 6px", fontSize: 11.5, width: 118 }}
              onChange={(e) => set({ supps: cfg.supps.map((z, k) => (k === i ? { ...z, ancora: e.target.value } : z)) })} />
            <button className="mini" onClick={() => set({ supps: cfg.supps.filter((_, k) => k !== i) })}>✕</button>
          </div>
        ))}
        <div className="eb" style={{ marginTop: 10, lineHeight: 1.5 }}>A data ao lado é quando a periodicidade começa a contar — mude-a se precisar recalcular os dias certos.</div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="eb" style={{ margin: "0 0 10px", fontWeight: 700 }}>Seus dados</div>
        <button className="ghost" style={{ width: "100%", padding: 12 }} onClick={exportar}>Baixar tudo em CSV</button>
      </div>
    </>
  );
}

function ModeloRefeicaoRow({ r, onRenomear, onPadrao, onExcluir, podeExcluir, onMeals }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="item">
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: open ? 10 : 0, flexWrap: "wrap" }}>
        <button onClick={() => setOpen(!open)} style={{ background: "transparent", padding: "4px 2px", color: "var(--ink2)" }}>{open ? "▾" : "▸"}</button>
        <input value={r.nome} style={{ flex: 1, minWidth: 90, padding: "8px 10px", fontSize: 13.5, fontWeight: 600 }} onChange={(e) => onRenomear(e.target.value)} />
        <button className="ghost" data-on={r.padrao ? "1" : "0"} disabled={r.padrao} onClick={onPadrao}>{r.padrao ? "padrão" : "adotar como padrão"}</button>
        <button className="mini" disabled={!podeExcluir} onClick={onExcluir}>✕</button>
      </div>
      {open && (
        <div>
          {r.meals.map((m, i) => (
            <div key={m.id} style={{ padding: "8px 0", borderTop: "1px solid var(--rule)" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7 }}>
                <input className="num" value={m.hora} placeholder="hh:mm" style={{ width: 74, padding: "7px 8px", fontSize: 12, fontWeight: 600 }}
                  onChange={(e) => onMeals(r.meals.map((z, k) => (k === i ? { ...z, hora: e.target.value } : z)))} />
                <input value={m.nome} style={{ padding: "7px 9px", fontSize: 13, fontWeight: 600 }}
                  onChange={(e) => onMeals(r.meals.map((z, k) => (k === i ? { ...z, nome: e.target.value } : z)))} />
                <button className="mini" onClick={() => onMeals(r.meals.filter((_, k) => k !== i))}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5 }}>
                {[{ k: "kcal", lb: "kcal", bg: "var(--rule)" }, ...MACROS].map((x) => (
                  <input key={x.k} className="num" inputMode="numeric" placeholder={x.lb}
                    style={{ padding: "7px 5px", fontSize: 11.5, background: x.bg, fontWeight: 700, textAlign: "center", border: 0 }}
                    value={m.alvo && m.alvo[x.k] ? m.alvo[x.k] : ""}
                    onChange={(e) => onMeals(r.meals.map((z, k) => (k === i ? { ...z, alvo: { kcal: 0, prot: 0, carb: 0, gord: 0, ...z.alvo, [x.k]: n0(e.target.value.replace(/\D/g, "")) } } : z)))} />
                ))}
              </div>
            </div>
          ))}
          <button className="ghost" style={{ width: "100%", marginTop: 9 }}
            onClick={() => onMeals([...r.meals, { id: uid(), nome: "Nova refeição", hora: "", alvo: null }])}>+ refeição</button>
        </div>
      )}
    </div>
  );
}
