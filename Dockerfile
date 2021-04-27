FROM node:12.10.0
RUN npm install -g serve
COPY . /app
WORKDIR /app
EXPOSE 5000
CMD ["serve", "build", "-l", "5000"]
