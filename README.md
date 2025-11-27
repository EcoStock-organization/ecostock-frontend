# 🖥️ Frontend - Gerenciador de Estoque

![Status](https://img.shields.io/badge/status-em--desenvolvimento-yellow)

Este repositório contém o código-fonte do **Frontend** do sistema **Gerenciador de Estoque**.

## 🔗 Repositórios do Projeto

Este projeto é dividido em múltiplos repositórios. Acesse os outros componentes através dos links abaixo:

-   **[📄 Documentação](https://github.com/EcoStock-organization/ecostock-docs)**
-   **[⚙️ Backend](https://github.com/EcoStock-organization/ecostock-backend)**
-   **[🔑 Serviço de Autenticação](https://github.com/EcoStock-organization/ecostock-auth)**

## 🚀 Rodando em Desenvolvimento

### Pré-requisitos

- **Node.js** (recomendado 20.x ou superior)
- **npm** (ou `yarn` / `pnpm`)

### Passos

1. Clone o repositório:

```bash
git clone https://github.com/EcoStock-organization/ecostock-frontend.git
````

2. Acesse o diretório do frontend:

```bash
cd ecostock-frontend/frontend
```

3. Instale as dependências:

```bash
npm install
# ou: pnpm install
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Next.js geralmente expõe a aplicação em `http://localhost:3000` (confirme no terminal).

## 📜 Scripts úteis (definidos em `package.json`)

- `npm run dev` — Inicia o servidor de desenvolvimento (Next.js).
- `npm run build` — Compila a aplicação para produção.
- `npm run start` — Inicia a versão compilada (após `build`).
- `npm run lint` — Executa o ESLint.

## 🧩 Variáveis de ambiente

- Crie um arquivo `.env.local` com variáveis locais, por exemplo:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Adapte a URL do backend conforme seu ambiente (docker, containers, etc.).
