# =============================================================================
# Dockerfile - IGREJA APOSTÓLICA BOAS NOVAS (IABN)
# Multi-stage: build do React/Vite + servidor Nginx com proxy PostgREST
# =============================================================================

# ---------- Estágio 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependência e instala
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copia o restante do código e faz o build
COPY . .
RUN npm run build

# ---------- Estágio 2: Servidor ----------
FROM nginx:alpine

# Copia o build gerado para o diretório padrão do nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do nginx com proxy reverso para PostgREST
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]