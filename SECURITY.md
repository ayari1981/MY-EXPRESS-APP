# Politique de Sécurité

## 🔒 Informations Sensibles

**IMPORTANT:** Ne jamais commiter les fichiers suivants sur GitHub :
- `.env` - Contient les mots de passe et clés secrètes
- `backups/*.json` - Peut contenir des données sensibles
- `uploads/*` - Peut contenir des fichiers utilisateurs

## ✅ Fichiers Protégés

Le `.gitignore` protège automatiquement :
- `.env` et `.env.local`
- `node_modules/`
- `backups/*.json`
- `uploads/**/*`

## 🔐 Configuration Railway

### Pour déployer sur Railway :

1. **N'utilisez JAMAIS de mots de passe hardcodés** dans le code
2. **Configurez les variables d'environnement** dans Railway Dashboard :
   - `MYSQL_URL` ou
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`

3. **Changez les secrets** :
   - `SESSION_SECRET` - Générez une clé aléatoire forte
   - `ADMIN_PASSWORD` - Changez le mot de passe admin par défaut

### Générer un SESSION_SECRET sécurisé :

```javascript
// Dans Node.js
require('crypto').randomBytes(64).toString('hex')
```

Ou en ligne de commande :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚨 Si des secrets ont été exposés

Si vous avez accidentellement commité des secrets :

1. **Changez IMMÉDIATEMENT** tous les mots de passe exposés dans Railway
2. Générez de nouvelles clés secrètes
3. Nettoyez l'historique Git (voir section suivante)

### Nettoyer l'historique Git :

```bash
# Supprimer le fichier de l'historique Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (ATTENTION: destructif!)
git push origin --force --all
```

## 📝 Checklist avant chaque commit

- [ ] Vérifiez qu'aucun fichier `.env` n'est staged
- [ ] Pas de mots de passe hardcodés dans le code
- [ ] Pas de clés API ou tokens dans le code
- [ ] Les backups sont bien ignorés

## 🔍 Vérifier les fichiers à commiter :

```bash
git status
git diff --cached
```

## 📧 Signaler une Vulnérabilité

Si vous trouvez une vulnérabilité de sécurité, veuillez la signaler de manière responsable en créant une issue privée ou en contactant les mainteneurs.

## 🛡️ Bonnes Pratiques

1. **Variables d'environnement** : Utilisez toujours `process.env.*`
2. **Secrets rotation** : Changez régulièrement vos mots de passe
3. **Accès minimal** : Ne donnez que les permissions nécessaires
4. **Mises à jour** : Gardez les dépendances à jour (`npm audit`)
5. **HTTPS** : Utilisez toujours HTTPS en production
