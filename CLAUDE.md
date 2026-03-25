# KuryeAI — Claude Code Yapılandırması

## Git Push Kurulumu

Token `.git/github_token` dosyasında saklanır (git tarafından takip edilmez):

```bash
echo "GHP_TOKEN_BURAYA" > .git/github_token
```

Session-start hook bu dosyayı okuyarak remote URL'i otomatik set eder.

## Vercel Deploy

GitHub push sonrası Vercel otomatik deploy eder.

## Geliştirme Dalı

Tek branch: `claude/connect-github-repo-0uL6U`

Tüm değişiklikler doğrudan bu branch'e commit edilip push edilir.
`main` branch silinmiştir — merge adımı gerekmez.
