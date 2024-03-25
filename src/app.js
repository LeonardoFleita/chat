const express = require("express");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");

const viewsRouter = require("./routes/viewsRouter");

const app = express();

// configurar handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

// permitir envío de información mediante formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(`${__dirname}/../public`));
app.use("/", viewsRouter);

const httpServer = app.listen(8080, () => {
  console.log("Servidor listo!");
});

// crear un servidor para WS
const io = new Server(httpServer);

const messagesHistory = [];

io.on(`connection`, (clientSocket) => {
  console.log(`Usuario conectado => ${clientSocket.id}`);

  for (const data of messagesHistory) {
    clientSocket.emit("message", data);
  }

  clientSocket.on("newUser", (data) => {
    clientSocket.broadcast.emit("newUserConnected", data);
  });
  clientSocket.on(`message`, (data) => {
    messagesHistory.push(data);
    io.emit(`message`, data);
  });
});
