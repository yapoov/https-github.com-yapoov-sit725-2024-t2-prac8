const express = require("express");
const bodyParser = require("body-parser");
const app = express();
let port = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", __dirname + "/src/views");

const movieRouter = require("./src/router");
app.use("/api/movie", movieRouter);
app.use("/api/skribble", (req, res) => {
  try {
    res.render("skribble");
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

let { Server } = require("socket.io");

const { createServer } = require("http");
const httpServer = createServer(app);
const io = new Server(httpServer);
let words = ["Jaws", "The Mummy", "The Terminator", "Sherlock Holmes"];
let players = [];
let currentDrawer = null;
let currentWord = "";
let roundDuration = 360;
let timer;

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.emit("requestName");

  socket.on("sendName", (name) => {
    players.push({
      id: socket.id,
      name: name,
      avatar: `vibrent_${players.length + 1}.png`,
    });
    io.emit("updatePlayers", players);
    if (currentDrawer === null) {
      currentDrawer = socket.id;
      assignNewDrawer();
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    players = players.filter((player) => player.id !== socket.id);
    io.emit("updatePlayers", players);
    if (socket.id === currentDrawer) {
      assignNewDrawer();
    }
  });

  socket.on("draw", (data) => {
    if (currentDrawer === socket.id) {
      socket.broadcast.emit("draw", data);
    }
  });

  socket.on("guess", (guess) => {
    const playerName =
      players.find((player) => player.id === socket.id)?.name || "Unknown";
    if (guess.toLowerCase() === currentWord.toLowerCase()) {
      io.emit("correctGuess", { name: playerName, word: currentWord });
      clearInterval(timer);
      assignNewDrawer();
    } else {
      sender = players.find((p) => p.id === socket.id).name;
      io.emit("guess", { sender, guess });
    }
  });
});

function startTimer() {
  let timeLeft = roundDuration;

  timer = setInterval(() => {
    timeLeft--;
    io.emit("timer", timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timer);
      io.emit("timeUp", currentWord);
      assignNewDrawer();
    }
  }, 1000);
}

function assignNewDrawer() {
  if (players.length === 0) return;
  const currentIndex = players.findIndex(
    (player) => player.id === currentDrawer
  );

  const nextIndex = (currentIndex + 1) % players.length;
  currentDrawer = players[nextIndex].id;

  currentWord = words[Math.floor(Math.random() * words.length)];
  console.log(currentWord);
  io.emit("newRound", {
    drawer: players[nextIndex].id,
    wordHangman: currentWord.replace(/\S/g, "_"),
  });
  io.to(currentDrawer).emit("yourTurn", currentWord);

  startTimer();
}

httpServer.listen(3000);
