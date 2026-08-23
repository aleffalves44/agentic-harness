# agentic-harness

Fluxo de agente para desenvolvimento de software, executado sobre o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (dsh). Mesmo modelo do `harness-cmd` (commands → agents → skills → hooks), sem acoplamento a um vendor de LLM: Ollama cloud, Anthropic, OpenAI, DeepSeek — todos configuráveis sem restart.

## O que é

- **Commands** (skills user-invocable): `/task`, `/plan`, `/spike`, `/pr`, `/context` — routers que delegam a subagentes.
- **Agents** (subagent presets): build, bug-fixer, specifier, reviewer, pr-opener, planner, spike-researcher, context-bootstrapper — cada um com persona própria, declarada no `cordis.yml`.
- **Skills** (playbooks): grill, anti-prompt-capture — invocados pelo modelo ou pelo usuário.
- **Contratos**: subagent handoff budget, commit trailer genérico, artifact storage, artifact scanning — neutros, sem vendor.

## Pré-requisitos

1. DeepSeek Harness clonado e construído ao lado:
   ```sh
   git clone https://github.com/deepseek-ai/deepseek-harness.git ../deepseek-harness
   cd ../deepseek-harness && pnpm install && pnpm run build
   ```
2. Uma API key de pelo menos um provider:
   - `OLLAMA_API_KEY` para Ollama cloud
   - `ANTHROPIC_API_KEY` para Anthropic
   - `OPENAI_API_KEY` para OpenAI
   - `DEEPSEEK_API_KEY` para DeepSeek

## Uso

### Web UI

```sh
export OLLAMA_API_KEY=...
pnpm dsh --profile agentic web
# abre http://127.0.0.1:3080
```

### Headless (one-shot)

```sh
export OLLAMA_API_KEY=...
pnpm dsh --profile agentic-headless "implemente: adicione validação de email no campo de cadastro"
```

### Skills (slash-commands na Web UI)

Skills são auto-descobertas em `.dsh/skills/`. Depois de subir a Web UI, digite `/task`, `/plan`, `/spike`, `/pr`, `/context` no composer.

## Estrutura

```
agentic-harness/
├── cordis.yml              # profile web (sobre dsh-base)
├── cordis.headless.yml     # profile headless
├── providers.patch.yml     # overlay multi-provider (Ollama + Anthropic + OpenAI)
├── AGENTS.md               # contratos runtime
├── .dsh/skills/            # skills auto-descobertas
│   ├── task/SKILL.md
│   ├── plan/SKILL.md
│   ├── spike/SKILL.md
│   ├── pr/SKILL.md
│   ├── context/SKILL.md
│   ├── grill/SKILL.md
│   └── anti-prompt-capture/SKILL.md
└── contracts/              # contratos neutros
    ├── subagent-handoff-budget.md
    ├── commit-trailer.md
    ├── artifact-storage.md
    └── artifact-scanning.md
```

## Provider config

Edite `providers.patch.yml` para adicionar/remover providers. Cada provider é uma route no `llm-pi-ai`. Credential via `apiKeyEnv` (referência a env var, resolvida por request — sem restart para trocar key).

Para Ollama cloud, ajuste `baseURL` ao endpoint real documentado pela Ollama.

## Licença

MIT.