const { Server } = require('net');

const host = '0.0.0.0';
const poolConnections = new Map();

const error = (err) => {
  console.log(err);
  process.exit(1);
}

const sendMessage = (message, origin) => {
  for (const socket of poolConnections.keys()) {
    if (socket !== origin) {
      const sendSocket = poolConnections.get(socket).socket;
      sendSocket.write(message);
    }
  }
}

const listen = (port) => {
  const server = new Server();

  server.on('connection', (socket) => {
    const clientSocket = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`New connection from :>> ${clientSocket}`);

    // Codificación para los mensajes en el servidor
    socket.setEncoding('utf8');

    // socket para cuando se recibe la data
    socket.on('data', (message) => {
      if (!poolConnections.has(clientSocket)) {
        console.log(`Username ${message} set for connection ${clientSocket}`);
        const objConn = {
          username: message,
          socket
        };
        poolConnections.set(clientSocket, objConn);
      } else if (message === "END") {
        socket.end();
      } else {
        const username = poolConnections.get(clientSocket).username;
        const fullMsg = `[${username}] ${message}`;
        console.log(`${clientSocket} :>> ${fullMsg}`);
        sendMessage(fullMsg, clientSocket);
      }
    });

    // socket para el close del cliente desconectado
    socket.on('close', () => {
      console.log(`Connection from ${clientSocket} closed!`);
      poolConnections.delete(clientSocket);
    });
  })

  server.listen({ port, host }, () => {
    console.log('Listening on port 8000');
  });

  server.on("error", (err) => error(err));
}

const main = () => {
  if (process.argv.length !== 3) {
    error(`Usage: node ${__filename} port`);
  }

  let port = process.argv[2];
  if (isNaN(port)) {
    error(`Invalid port: ${port}`);
  }

  port = Number(port);
  listen(port);
}

if (require.main === module) {
  main();
}
