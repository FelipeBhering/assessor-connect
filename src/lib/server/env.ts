// O loader de env do projeto (@lovable.dev/vite-tanstack-config) só injeta vars VITE_*.
// Variáveis server-only (chaves secretas, ids de dev) precisam ser carregadas explicitamente.
// Em produção (Cloudflare/Nitro), o host injeta essas vars diretamente em process.env e
// dotenv simplesmente não encontra o arquivo .env.local — isso é um no-op seguro.
import { config } from "dotenv";

config({ path: ".env.local" });
