import {
  IWebSocket,
  toSocket,
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from "npm:vscode-ws-jsonrpc";
import {
  createConnection,
  createServerProcess,
  forward,
} from "npm:vscode-ws-jsonrpc/server";
import {
  InitializeParams,
  InitializeRequest,
  Message,
} from "npm:vscode-languageserver";

Deno.serve({ port: 3000 }, (req) => {
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Not a WebSocket request", { status: 400 });
  }

  const { socket: ws, response } = Deno.upgradeWebSocket(req);
  console.log("Client connected");

  const socket = toSocket(ws);

  if (ws.readyState === ws.OPEN) {
    launchLanguageServer(socket);
  } else {
    ws.onopen = () => {
      launchLanguageServer(socket);
    };
  }

  return response;
});

export const launchLanguageServer = (socket: IWebSocket) => {
  const reader = new WebSocketMessageReader(socket);
  const writer = new WebSocketMessageWriter(socket);
  const socketConnection = createConnection(reader, writer, () =>
    socket.dispose()
  );
  const serverConnection = createServerProcess("Deno", "deno", ["lsp"]);
  if (serverConnection !== undefined) {
    forward(socketConnection, serverConnection, (message) => {
      if (Message.isRequest(message)) {
        if (message.method === InitializeRequest.type.method) {
          const initializeParams = message.params as InitializeParams;
          initializeParams.processId = Deno.pid;
        }

        console.log(`Server received: ${message.method}`);
        console.log(message);
      }
      if (Message.isResponse(message)) {
        console.log(`Server sent:`);
        console.log(message);
      }
      return message;
    });
  }
};
