# 📝 Git Commits - Conventional Commits

Execute os comandos abaixo na ordem apresentada para commitar as alterações de forma organizada.

---

## 🐛 Fix: Corrigir campo is_paid para status em AddAccountScreen

```bash
git add src/screens/financial/AddAccountScreen.tsx
git commit -m "fix(financial): corrigir campo is_paid para status na criação de conta"
```

---

## ✨ Feature: Adicionar categorias predefinidas no AddAccountScreen

```bash
git add src/screens/financial/AddAccountScreen.tsx
git commit -m "feat(financial): adicionar categorias predefinidas em modal de seleção"
```

---

## ✨ Feature: Adicionar hook para marcar conta como paga

```bash
git add src/hooks/useFinancial.ts
git commit -m "feat(financial): adicionar hook useMarkAccountAsPaid"
```

---

## ✨ Feature: Adicionar lista de contas pendentes na FinancialScreen

```bash
git add src/screens/tabs/FinancialScreen.tsx
git commit -m "feat(financial): adicionar relatório de contas pendentes recentes"
```

---

## ✨ Feature: Criar tela de edição de propriedade

```bash
git add src/screens/property/EditPropertyScreen.tsx
git add src/screens/property/index.ts
git commit -m "feat(property): criar tela de edição de propriedade"
```

---

## ✨ Feature: Adicionar botões de editar e excluir propriedade

```bash
git add src/screens/property/SelectPropertyScreen.tsx
git commit -m "feat(property): adicionar botões de editar e excluir no card de propriedade"
```

---

## 🔧 Chore: Adicionar rota de edição de propriedade na navegação

```bash
git add src/navigation/PropertyNavigator.tsx
git commit -m "chore(navigation): adicionar rota EditProperty no PropertyNavigator"
```

---

## 🔧 Chore: Atualizar tipos de navegação com EditProperty

```bash
git add src/types/navigation.ts
git commit -m "chore(types): adicionar EditProperty aos tipos de navegação"
```

---

## 🎨 Style: Limpar console.logs desnecessários

```bash
git add src/screens/property/SelectPropertyScreen.tsx
git commit -m "style(property): limpar console.logs e ajustar log de erro"
```

---

## 📚 Resumo dos Commits

Execute todos os comandos acima em sequência para criar um histórico git bem organizado:

1. **fix**: Correção do campo `is_paid` → `status`
2. **feat**: Categorias predefinidas no formulário de conta
3. **feat**: Hook para marcar conta como paga
4. **feat**: Lista de contas pendentes na tela financeira
5. **feat**: Tela de edição de propriedade completa
6. **feat**: Botões de editar/excluir integrados no card
7. **chore**: Configuração de rota na navegação
8. **chore**: Atualização de tipos TypeScript
9. **style**: Limpeza de console.logs

---

## 🏷️ Conventional Commits - Tipos Usados

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **chore**: Tarefas de manutenção (build, configs, etc)
- **style**: Formatação, limpeza de código (não afeta funcionalidade)

---

## ✅ Como Executar

### Opção 1: Executar todos de uma vez

````bash
bash -c "$(cat GIT_COMMITS.md | grep '^git' | grep -v '```')"
````

### Opção 2: Copiar e colar cada bloco manualmente

Copie cada comando `git add` e `git commit` individualmente do documento.

### Opção 3: Commit único (não recomendado)

```bash
git add .
git commit -m "feat: adicionar edição/exclusão de propriedades e melhorias no módulo financeiro

- Adicionar categorias predefinidas em AddAccountScreen
- Criar lista de contas pendentes na FinancialScreen
- Implementar EditPropertyScreen com mapa e upload de imagem
- Adicionar botões de editar/excluir no card de propriedade
- Criar hook useMarkAccountAsPaid
- Atualizar tipos de navegação e rotas
- Corrigir campo is_paid para status"
```

---

## 📊 Estatísticas

- **Arquivos modificados**: 6
- **Arquivos criados**: 1
- **Commits sugeridos**: 9
- **Linhas aproximadas**: ~1500+

---

**Gerado em**: 2025-10-04
