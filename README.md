# 🖥️ Frontend - Gerenciador de Estoque

![Status](https://img.shields.io/badge/status-em--desenvolvimento-yellow)

Este repositório contém o código-fonte da interface de usuário (Frontend) para o projeto de **Gerenciamento de Estoque**. A aplicação é desenvolvida em React e utiliza Vite como ferramenta de build, focando em uma experiência de desenvolvimento moderna e performática.

## ✨ Tecnologias Utilizadas

-   **[React](https://react.dev/)**: Biblioteca principal para a construção da interface.
-   **[Vite](https://vitejs.dev/)**: Ferramenta de build e servidor de desenvolvimento rápido.
-   **[JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)**: Linguagem base da aplicação.
-   **[Axios](https://axios-http.com/)**: Para realizar as requisições HTTP para a API do backend.
-   **[React Router](https://reactrouter.com/)**: Para gerenciamento de rotas e navegação entre páginas.
-   **[ESLint](https://eslint.org/)** & **[Prettier](https://prettier.io/)**: Para padronização e qualidade do código.

## 🔗 Repositórios do Projeto

Este projeto é dividido em múltiplos repositórios. Acesse os outros componentes através dos links abaixo:

-   **[📄 Documentação](https://github.com/TPPE-Estoque/Doc)**
-   **[⚙️ Backend](https://github.com/TPPE-Estoque/Backend)**
-   **[🔑 Serviço de Autenticação](https://github.com/TPPE-Estoque/Auth)**

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para executar o ambiente de desenvolvimento localmente.

### Pré-requisitos

-   **Node.js**: Versão 20.x ou superior.
-   **npm** ou **yarn**.

### Passos para Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/TPPE-Estoque/Frontend.git
    ```

2.  **Acesse a pasta do projeto:**
    ```bash
    cd Frontend
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

Após executar o último comando, a aplicação estará disponível em **[http://localhost:5173](http://localhost:5173)** (ou a porta indicada no seu terminal).

## 📜 Scripts Disponíveis

Neste projeto, você pode executar os seguintes scripts:

-   `npm run dev`: Inicia o servidor de desenvolvimento com Hot-Reload.
-   `npm run build`: Gera a versão de produção da aplicação na pasta `dist/`.
-   `npm run lint`: Executa o ESLint para verificar por erros no código.
-   `npm run preview`: Inicia um servidor local para visualizar a versão de produção (após o `build`).
