# 🏥 Sistema de Assistência Clínica

Projeto acadêmico desenvolvido para gestão de pequenos negócios, com foco em uma clínica médica.

## 📌 Objetivo

Criar uma aplicação completa com:

* Cadastro de usuários (pacientes e administradores)
* Agendamento de consultas
* Controle de horários disponíveis
* Organização de atendimentos médicos

---

# ⚙️ Tecnologias utilizadas

### Backend

* Java 21
* Spring Boot
* Spring Security
* JPA / Hibernate

### Banco de Dados

* MariaDB / MySQL

### Frontend

* React (em desenvolvimento)

---

# 🚀 Status do Projeto

## ✅ Backend (em desenvolvimento)

### ✔ Já implementado:

* CRUD de usuários
* Criptografia de senha (BCrypt)
* Estrutura de autenticação
* CRUD de consultas
* Estrutura de entidades (Paciente, Médico, Consulta)

### ❗ Pendente no backend:

* Validações de negócio:

  * ❌ Impedir agendamento em datas passadas
  * ❌ Impedir consultas no mesmo horário
  * ❌ Verificar disponibilidade do médico
* Sistema de roles mais completo (ADMIN, MÉDICO, PACIENTE)
* Melhor tratamento de erros (exceptions)
* Retornos padronizados (ResponseEntity)
* Integração completa com frontend
* Melhor organização de DTOs

---

## 🎨 Frontend (Responsável: equipe React)

### ⚠️ Importante

O sistema atualmente é testado via **Postman**, então:

> Algumas rotas podem parecer "quebradas" no navegador, mas estão funcionando corretamente via API.

---

### 📋 O que precisa ser feito no Frontend:

* Tela de Login
* Tela de Cadastro de Usuário
* Dashboard (painel principal)
* Tela de Agendamento de Consulta
* Tela de Listagem de Consultas
* Interface para ADMIN (cancelamento, controle)

---

### 🔗 Integração com Backend

Consumir as rotas:

* `/usuarios`
* `/auth/login`
* `/consultas`

---

### 💡 Sugestão

Você pode:

* Criar o projeto do zero baseado na API
  OU
* Implementar localmente e depois integrar com o backend

---

## 🗄️ Banco de Dados (Responsável: equipe DB)

### ⚠️ Situação atual

O banco foi criado apenas para testes iniciais no MariaDB.

---

### 📌 Estrutura atual usada no backend:

#### Usuário

* id
* username
* password
* cpf
* role

#### Consulta

* id
* data
* horario
* paciente_id
* medico_id

#### Médico

* id
* nome
* especialidade

#### Paciente

* id
* nome
* cpf

---

### ❗ O que precisa ser feito:

* Criar banco estruturado no MySQL/MariaDB
* Normalizar tabelas (relacionamentos corretos)
* Criar constraints:

  * UNIQUE (CPF)
  * FOREIGN KEY
* Validar integridade dos dados

---

### 📦 Entrega esperada:

* Arquivo `.sql` contendo:

  * CREATE DATABASE
  * CREATE TABLES
  * INSERTS (opcional para testes)

---

# 🔐 Segurança

* Senhas criptografadas com BCrypt
* Estrutura base de autenticação implementada
* Futuramente:

  * JWT
  * Controle de acesso por perfil

---

# 📡 Testes

Atualmente realizados via:

* Postman

---

# 👨‍💻 Equipe

* Backend: Java / Spring Boot
* Frontend: React
* Banco de Dados: MySQL / MariaDB

---

# 📅 Prazo

Entrega final: **21 de Maio**

---

# 🧠 Observações finais

Este projeto ainda está em evolução e passará por:

* Refatorações
* Melhorias de segurança
* Integração completa entre camadas

---
