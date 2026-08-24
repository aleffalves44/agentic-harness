# agentic-harness

Agentic harness for software development on [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Mesmo fluxo do `harness-cmd` (commands → agents → skills), sem acoplamento a um vendor de LLM: Ollama cloud, Anthropic, OpenAI, DeepSeek — todos configuráveis sem restart.

## O que é

- **5 commands** (routers): `/task`, `/plan`, `/spike`, `/pr`, `/context`.
- **8 agents** (subagent presets): specifier, planner, build, bug-fixer, reviewer, pr-opener, spike-researcher, context-bootstrapper.
- **2 playbooks** (skills): grill, anti-prompt-capture.
- **4 contratos** neutros: subagent handoff budget, commit trailer, artifact storage, artifact scanning.

## Instalação

Opção 1 — **Docker (recomendado)**:

```sh
git clone <seu-fork-do-agentic-harness>
cd agentic-harness
docker compose up --build
# abre http://localhost:3080
```

A imagem constrói o dsh a partir do fonte (para resolver os bundles do profile web), linka o projeto como overlay, e expõe a UI na porta 3080. Keys de provider ficam no volume `dsh-home` (persistente); configure pela UI em Settings → Models.

Opção 2 — **Local (desenvolvimento)**:

```sh
git clone <seu-fork-do-agentic-harness>
cd agentic-harness
npm install
```

O `npm install` baixa o `@deepseek-ai/dsh` (DeepSeek Harness) como dependência. Não precisa clonar o dsh separado.

## Configurar providers

Edite `cordis.yml` (web) e `cordis.headless.yml` (headless) na seção `llm-pi-ai.config.providers`. Cada provider é uma route. Credential via `apiKeyEnv` (referência a env var, resolvida por request — sem restart para trocar key).

### Ollama cloud

```yaml
ollama:
  displayName: Ollama Cloud
  apiKeyEnv: OLLAMA_API_KEY
  api: openai-completions
  baseURL: https://<seu-endpoint-ollama-cloud>/v1
  compat:
    supportsDeveloperRole: false
    maxTokensField: max_tokens
  models:
    - id: llama3.3
      contextWindow: 128000
      maxTokens: 8192
```

Ajuste `baseURL` ao endpoint real documentado pela sua Ollama cloud. Os `compat` switches corrigem o shape de request que Ollama espera.

### Anthropic / OpenAI (catalog routes)

```yaml
anthropic:
  apiKeyEnv: ANTHROPIC_API_KEY
  models:
    - id: claude-sonnet-4-5
      contextWindow: 200000
openai:
  apiKeyEnv: OPENAI_API_KEY
```

### Trocar o LLM padrão

Em `cordis.yml` e `cordis.headless.yml`:

```yaml
- id: agent-default-model
  config:
    provider: ollama        # ou anthropic, openai
    model: llama3.3          # ou claude-sonnet-4-5, gpt-5
```

## Uso

### Docker (recomendado)

```sh
# Suba a Web UI (build na primeira vez ~5-10 min):
docker compose up --build
# abre http://localhost:3080

# Configure providers em Settings → Models (keys persistem no volume dsh-home).
# Digite /task, /plan, /spike, /pr, /context no composer.
```

Para passar keys via env em vez da UI, crie `.env` no root:

```
OLLAMA_API_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

### Local

### Headless (one-shot)

```sh
export OLLAMA_API_KEY=...
npm run headless -- "implemente: adicione validação de email no cadastro"
```

### Web UI

A Web UI depende dos bundles `dsh-web-app` e client packages instalados no `$DSH_HOME/profiles/web/node_modules`. Há dois caminhos:

**Opção A — install npm (recomendado para distribuição):**

```sh
export OLLAMA_API_KEY=...
npm install          # baixa @deepseek-ai/dsh com todos os bundles
npm start            # Web UI em http://127.0.0.1:3080
```

Se o `npm install` não montar os bundles do profile web automaticamente, rode uma vez dentro do repo clonado do dsh para popular `$DSH_HOME/profiles/web/` (ver Opção B).

**Opção B — repo clonado do dsh (desenvolvimento):**

```sh
# Em outro terminal, suba a Web UI a partir do repo do dsh com o overlay:
cd /path/to/deepseek-harness
OLLAMA_API_KEY=... pnpm dsh --profile web --patch /path/to/agentic-harness/cordis.yml
```

Na Web UI, digite `/task`, `/plan`, `/spike`, `/pr`, `/context` no composer. As skills são descobertas automaticamente de `.dsh/skills/`.

### Bin direto

```sh
./bin/cli.js headless "task text"   # one-shot
./bin/cli.js web                    # Web UI (requer bundles instalados)
```

## Estrutura

```
agentic-harness/
├── bin/cli.js              # wrapper que invoca dsh com o overlay do projeto
├── cordis.yml              # overlay web (providers + subagentes + skills)
├── cordis.headless.yml     # overlay headless
├── AGENTS.md               # contratos runtime
├── .dsh/skills/            # 7 skills auto-descobertas
│   ├── task/SKILL.md
│   ├── plan/SKILL.md
│   ├── spike/SKILL.md
│   ├── pr/SKILL.md
│   ├── context/SKILL.md
│   ├── grill/SKILL.md
│   └── anti-prompt-capture/SKILL.md
└── contracts/              # 4 contratos neutros
    ├── subagent-handoff-budget.md
    ├── commit-trailer.md
    ├── artifact-storage.md
    └── artifact-scanning.md
```

## Como funciona

1. `bin/cli.js` resolve o path absoluto do projeto e injeta no overlay.
2. Invoca `dsh` (do `node_modules/.bin/dsh`) com `--profile web --patch <overlay>`.
3. O dsh boots o profile base (`dsh-base` + `dsh-web-app`) e aplica o overlay por cima.
4. O overlay: desabilita o adapter DeepSeek-only, monta `llm-pi-ai` com seus providers, declara 8 subagentes com personas, aponta o skill provider para `.dsh/skills/`.
5. Skills são descobertas automaticamente e aparecem como slash-commands na Web UI.

## Adicionar um agent

Em `cordis.yml`, na seção `- insert:`, copie um bloco `tool-subagent-<name>` e troque o `toolName`, `persona`, e `id`. Nenhum código novo.

## Adicionar uma skill

Crie `.dsh/skills/<name>/SKILL.md` com frontmatter `name`, `description`, `user-invocable: true`. O skill provider detecta automaticamente (watch habilitado).

## Licença

MIT.