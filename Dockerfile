# =============================================================================
# Dockerfile - IGREJA APOSTÓLICA BOAS NOVAS (IABN)
# Multi-stage: build do React/Vite + servidor Nginx
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

# Configuração do nginx para SPA (suporte a rotas do React Router)
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  location ~* \\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]