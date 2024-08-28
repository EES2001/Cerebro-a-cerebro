const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let teamsData = {
  redTeam: [],
  blueTeam: [],
};

// Configura express para servir archivos estáticos desde la carpeta 'client/public'
app.use(express.static(path.join(__dirname, "../client/public")));

io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado");

  socket.on("joinTeam", (data) => {
    if (data.team === "red") {
      teamsData.redTeam.push({ id: socket.id, time: null });
    } else {
      teamsData.blueTeam.push({ id: socket.id, time: null });
    }
    io.emit("updateTeams", teamsData); // Enviar actualización a todos los clientes
    saveData();
  });

  socket.on("startGame", () => {
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    io.emit("startCountdown", randomNumber);
  });

  socket.on("userResponse", (data) => {
    const teamArray =
      data.team === "red" ? teamsData.redTeam : teamsData.blueTeam;
    const user = teamArray.find((user) => user.id === socket.id);
    if (user) {
      user.time = data.time;
    }
    saveData();
    checkCompletion();
  });

  socket.on("resetGame", () => {
    teamsData.redTeam = [];
    teamsData.blueTeam = [];
    io.emit("resetGame");
    saveData();
  });

  socket.on("disconnect", () => {
    teamsData.redTeam = teamsData.redTeam.filter(
      (user) => user.id !== socket.id
    );
    teamsData.blueTeam = teamsData.blueTeam.filter(
      (user) => user.id !== socket.id
    );
    io.emit("updateTeams", teamsData); // Enviar actualización a todos los clientes después de la desconexión
    saveData();
  });
});

function saveData() {
  fs.writeFileSync(
    path.join(__dirname, "data", "teams.json"),
    JSON.stringify(teamsData)
  );
}

function checkCompletion() {
  if (
    teamsData.redTeam.every((user) => user.time !== null) &&
    teamsData.blueTeam.every((user) => user.time !== null)
  ) {
    const redAvg =
      teamsData.redTeam.reduce((acc, curr) => acc + curr.time, 0) /
      teamsData.redTeam.length;
    const blueAvg =
      teamsData.blueTeam.reduce((acc, curr) => acc + curr.time, 0) /
      teamsData.blueTeam.length;

    io.emit("gameResult", { redAvg, blueAvg });
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
