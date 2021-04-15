const { Socket } = require('net');

// Interfaz de Readline (leer por consola)
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const error = (err) => {
  console.log(err);
  process.exit(1);
}

// Fuction connect to server
const connect = (host, port) => {
  console.log(`Connecting to ${host}:${port}`);

  const socket = new Socket();
  socket.connect({ host, port });
  socket.setEncoding('utf8');

  socket.on('connect', () => {
    console.log(`Client Connected!`);

    readline.question("Choose your username: ", (username) => {
      socket.write(username);
      console.log(`Type any message to send it, type "END"to finish`);
    });

    readline.on('line', (message) => {
      socket.write(message);

      if (message === "END") {
        socket.end();
        console.log("Client Disconnected!");
        process.exit(0)
      }
    });

    socket.on('data', (data) => {
      console.log(data);
    })
  })

  socket.on('error', (err) => error(err.message));
}

const main = () => {
  if (process.argv.length !== 4) {
    error(`Usage: node ${__filename} host port`);
  }

  let [,, host, port] = process.argv;

  if (isNaN(port)) {
    error(`Invalid port: ${port}`);
  }

  port = Number(port);
  connect(host, port);
}

if (require.main === module) {
  main();
}
