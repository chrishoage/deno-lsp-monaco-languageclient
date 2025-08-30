import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import {
  MonacoEditorLanguageClientWrapper,
  type WrapperConfig,
} from "monaco-editor-wrapper";
import { configureDefaultWorkerFactory } from "monaco-editor-wrapper/workers/workerLoaders";
// this is required syntax highlighting
import "@codingame/monaco-vscode-typescript-basics-default-extension";

const htmlContainer = document.getElementById("container")!;
const text = `import { KomodoClient, Types } from "npm:komodo_client";

const komodo = KomodoClient("https://demo.komo.do", {
    type: "api-key",
    params: {
        key: "your_key",
        secret: "your secret",
    },
});

// Inferred as Types.StackListItem[]
const stacks = await komodo.read("ListStacks", {});

// Inferred as Types.Stack we use Types.Action to force a type eror as an example
const stack: Types.Action = await komodo.read("GetStack", {
    stack: stacks[0].name,
});

console.log(stack);
`;

async function run() {
  const denoClientUserConfig: WrapperConfig = {
    $type: "extended",
    htmlContainer,
    logLevel: 2,
    vscodeApiConfig: {
      serviceOverrides: {
        ...getKeybindingsServiceOverride(),
      },
      userConfiguration: {
        json: JSON.stringify({
          // Deno enable allows the Deno LSP to respond to language server
          // requests from "typescript" files
          "deno.enable": true,
          "typescript.tsserver.web.projectWideIntellisense.enabled": true,
          "typescript.tsserver.web.projectWideIntellisense.suppressSemanticErrors":
            false,
          "workbench.colorTheme": "Default Dark Modern",
          // asyncTokenization allows us to leverage the Textmate worker
          "editor.experimental.asyncTokenization": true,
        }),
      },
    },
    editorAppConfig: {
      codeResources: {
        modified: {
          text,
          uri: "file:///workspace/test.ts",
          enforceLanguageId: "typescript",
        },
      },
      monacoWorkerFactory: configureDefaultWorkerFactory,
    },
    languageClientConfigs: {
      configs: {
        typescript: {
          clientOptions: {
            documentSelector: [
              {
                language: "typescript",
                pattern: "**/*.ts",
              },
            ],
          },
          connection: {
            options: {
              $type: "WebSocketUrl",
              url: "ws://localhost:3000/",
              startOptions: {
                onCall: () => {
                  console.log("Connected to socket.");
                },
                reportStatus: true,
              },
              stopOptions: {
                onCall: () => {
                  console.log("Disconnected from socket.");
                },
                reportStatus: true,
              },
            },
          },
        },
      },
    },
  };
  const wrapper = new MonacoEditorLanguageClientWrapper();

  await wrapper.initAndStart(denoClientUserConfig);
}

run();
