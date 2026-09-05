# Igreja Apostólica Boas Novas (IABN) — Deploy no CasaOS

Sistema eclesiástico completo (membros, credenciais QR, financeiro, câmeras, lives,
pedidos de oração, diretoria e lideranças 2026/2028).

---

## Requisitos

- Servidor com **CasaOS** instalado
- Docker e Docker Compose (já inclusos no CasaOS)
- Portas livres: `3000` (app) e `5432` (PostgreSQL)

---

## 1. Baixar/Copiar o projeto para o servidor

Coloque a pasta do projeto no seu servidor CasaOS (ex: via SSH, SMB ou pelo
gerenciador de apps do CasaOS).

---

## 2. Configurar o `.env`

1. Copie e ajuste o arquivo de ambiente:

   ```bash
   cp .env.example .env   # se não existir .env ainda
   ```

2. Edite `.env` e troque **obrigatoriamente** a senha:

   ```env
   POSTGRES_PASSWORD=uma_senha_bem_forte
   POSTGRES_PORT=5432
   APP_PORT=3000
   ```

   > ⚠️ **NÃO deixe a senha padrão** `troque_esta_senha_segura` em produção.

---

## 3. Subir a stack

Na pasta raiz do projeto:

```bash
docker compose up -d
```

Isso irá:

1. Subir o **PostgreSQL 16** e aplicar automaticamente o
   [`schema-completo.sql`](./src/db/schema-completo.sql) (tables + seed da diretoria).
2. Compilar e subir a **aplicação web** (React/Vite servida por Nginx).
3. Iniciar a rotina de **backup diário** (às 03:00) com retenção de 30 dias.

Verificar status:

```bash
docker compose ps
docker compose logs -f app
```

---

## 4. Acessar o sistema

- **Aplicação**: `http://IP_DO_SERVIDOR:3000`
- **Página pública de Pedido de Oração**: `http://IP_DO_SERVIDOR:3000/oracao`
- **Console interno (demo)**: `http://IP_DO_SERVIDOR:3000/demo/dashboard`

---

## 5. Banco de dados

| Item | Valor |
|------|-------|
| Host | `localhost` (ou IP do servidor) |
| Porta | `5432` (configurável) |
| Database | `boas_novas_db` |
| User | `boasnovas_user` |
| Password | definida no `.env` |

### Conectar manualmente (dentro do container)

```bash
docker exec -it iabn_postgres psql -U boasnovas_user -d boas_novas_db
```

### Backup manual

```bash
docker exec -it iabn_postgres pg_dump -U boasnovas_user boas_novas_db > backup.sql
```

---

## 6. Estrutura de arquivos importantes

```
├── docker-compose.yml        # Stack (postgres + app + backup)
├── Dockerfile                # Build do React/Vite + Nginx
├── .env                      # Configurações (senhas, portas)
├── .dockerignore
└── src/
    └── db/
        └── schema-completo.sql   # Banco completo (tabelas + seed)
```

---

## 7. Atualizar a aplicação

Sempre que houver mudanças no código:

```bash
docker compose build app
docker compose up -d app
```

---

## 8. Solução de problemas

| Problema | Solução |
|----------|---------|
| Porta 5432 em uso | Altere `POSTGRES_PORT` no `.env` (ex: `5433`) |
| App não responde | `docker compose logs app` |
| Banco não populou | Verifique se `pgdata` foi criado antes; se mudou o schema, rode `docker compose down -v` (apaga dados) e suba de novo |
| Acesso negado ao banco | Confira `POSTGRES_PASSWORD` no `.env` |