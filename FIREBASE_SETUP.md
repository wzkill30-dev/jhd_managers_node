# 🔥 Guia de Configuração do Firebase

## Passo 1: Criar Projeto no Firebase

1. Acesse https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Digite o nome do projeto: `jhd-managers` (ou o nome que preferir)
4. Clique em **"Continuar"**
5. Desabilite o Google Analytics (não é necessário para este projeto)
6. Clique em **"Criar projeto"**
7. Aguarde a criação (leva alguns segundos)
8. Clique em **"Continuar"**

## Passo 2: Ativar o Firestore Database

1. No menu lateral esquerdo, clique em **"Firestore Database"**
2. Clique no botão **"Criar banco de dados"**
3. Escolha o modo: **"Iniciar no modo de produção"**
4. Clique em **"Avançar"**
5. Escolha a localização do servidor:
   - Para Brasil: `southamerica-east1 (São Paulo)`
   - Ou escolha a mais próxima de você
6. Clique em **"Ativar"**
7. Aguarde a criação do banco (leva alguns segundos)

## Passo 3: Gerar Credenciais de Acesso

1. Clique no ícone de **engrenagem ⚙️** no menu lateral (ao lado de "Visão geral do projeto")
2. Clique em **"Configurações do projeto"**
3. Vá na aba **"Contas de serviço"** (Service accounts)
4. Certifique-se que está selecionado **"Node.js"**
5. Clique no botão **"Gerar nova chave privada"**
6. Uma janela de confirmação aparecerá, clique em **"Gerar chave"**
7. Um arquivo JSON será baixado automaticamente

## Passo 4: Configurar no Projeto

1. Renomeie o arquivo baixado para: `firebase-credentials.json`
2. Mova o arquivo para a pasta raiz do projeto (mesma pasta do `server.js`)
3. **IMPORTANTE**: Nunca commite este arquivo no Git! Ele já está no `.gitignore`

## Passo 5: Criar Índice no Firestore

1. No Firebase Console, vá em **"Firestore Database"**
2. Clique na aba **"Índices"** (Indexes)
3. Clique em **"Adicionar índice"** ou **"Create Index"**
4. Configure o índice:
   - Collection ID: `matches`
   - Fields to index:
     - Campo: `match_date` | Ordem: `Descending`
   - Query scope: `Collection`
5. Clique em **"Criar"**
6. Aguarde alguns minutos até o índice ser criado (status: "Enabled")

**Nota:** O Firestore pode sugerir criar o índice automaticamente quando você tentar fazer a primeira query. Se aparecer um link no erro, basta clicar nele que o índice será criado automaticamente.

## Passo 6: Testar a Conexão

Execute o servidor:
```bash
npm start
```

Se tudo estiver correto, você verá:
```
✓ Firestore conectado com sucesso
Servidor rodando em http://localhost:3000
```

## ⚠️ Problemas Comuns

### Erro: "Cannot find module firebase-credentials.json"
- Verifique se o arquivo está na pasta raiz do projeto
- Verifique se o nome está correto: `firebase-credentials.json`

### Erro: "Permission denied"
- Verifique se você baixou o arquivo correto (Service Account Key)
- Tente gerar uma nova chave privada

### Erro: "Invalid credentials"
- O arquivo JSON pode estar corrompido
- Baixe novamente as credenciais do Firebase Console

## 📊 Plano Gratuito do Firebase

O plano gratuito (Spark) inclui:
- **50.000 leituras/dia**
- **20.000 escritas/dia**
- **20.000 exclusões/dia**
- **1 GB de armazenamento**

Mais que suficiente para este projeto! 🎉

## 🔒 Segurança

Para produção (Render), você vai configurar as credenciais como "Secret File" no painel do Render, não precisa commitar o arquivo no GitHub.
