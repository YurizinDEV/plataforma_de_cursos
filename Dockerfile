# Imagem base
FROM node:18

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todos os arquivos da API
COPY . .

# Expõe a porta (ajustar conforme .env)
EXPOSE 5011

# Comando para iniciar a aplicação
CMD ["npm", "start"]