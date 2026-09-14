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
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  \n\
  # Proxy reverso para PostgREST (API REST do PostgreSQL)\n\
  location /rest/ {\n\
    rewrite ^/rest/(.*) /$1 break;\n\
    proxy_pass http://postgrest:3100/;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_set_header X-Forwarded-Proto $scheme;\n\
    proxy_read_timeout 60s;\n\
    proxy_connect_timeout 60s;\n\
  }\n\
  \n\
  # Rotas do React Router (SPA)\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  \n\
  # Cache para assets estaticos\n\
  location ~* \\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]