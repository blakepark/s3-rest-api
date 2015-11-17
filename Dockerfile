FROM blakepark/node:latest

ADD . /src

WORKDIR /src

EXPOSE 8080

CMD ["node", "./app.js"]