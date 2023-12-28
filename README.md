# Controle de Ponto

## Descrição
A proposta é criar um sistema que gerencie a jornada de trabalho dos funcionários para cálculo de banco de horas. 

Certifiquse-se de ter as seguintes ferramentas instaladas e atualizadas no seu sistema: 

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Tecnologias usadas

O projeto feito com Node.js.

O banco usado é o MYSQL e é gerenciado pelo Prisma.

Para os testes é utilizado o Jest.

Quer dar uma olhada no código front-end?  . [Controle de Ponto Front](https://github.com/anarehder/controleDePonto_front)  .

## Instalação

Siga estas etapas para configurar e executar o projeto localmente:

```bash
   git clone https://https://github.com/anarehder/controleDePonto_back
   cd controleDePonto_back
```

### 1 - Instalar as dependencias

```bash
  npm install
```

### 2 - Configurar a variavel de ambiente

Crie um arquivo .env.development na raiz do projeto com a variavel de ambiente necessária. Você pode usar o arquivo .env.example como um modelo.

### 3 - Configurar o banco de dados com o Prisma

Execute as seguintes etapas
```bash
  npm run dev:migration:run
  npm run dev:migration:generate
  npm run dev:seed
```

### 4 - Execute o projeto em modo desenvolvimento

```bash
  npm run dev
```

## 5 - Testes
Crie um arquivo .env.test de maneira análoga ao .env.example mas crie um banco secundário para testes.

Rode as migrações

```bash
  npm run test:migration:run
  npm run test:migration:generate
  npm run test:seed
```

Rode o teste

```bash
npm run test
```

Para um teste de uma feature específica

```bash
npm test NOME_FEATURE
```

## 6 - Para subir o projeto no modo de produção

```bash
npm run build
npm start
```
