# Braytech ToDo API

Backend Express + TypeScript de Braytech ToDo.

## Développement

```bash
npm install
cp .env.example .env
npm run dev
```

Avant de démarrer l’API, initialisez le schéma, créez un compte MariaDB dédié,
puis renseignez ses identifiants dans `back/.env` :

```sql
SOURCE database/schema.sql;
CREATE USER 'braytech_app'@'localhost' IDENTIFIED BY 'choisir-un-mot-de-passe';
GRANT ALL PRIVILEGES ON braytech_todo.* TO 'braytech_app'@'localhost';
FLUSH PRIVILEGES;
```

Les commandes SQL doivent être exécutées avec un compte administrateur MariaDB
(par exemple `sudo mariadb`). Ne faites pas fonctionner l’API avec l’utilisateur
`root`.

L'API est disponible sur `http://localhost:3000`.

## Scripts

- `npm run dev` : démarre le serveur avec rechargement automatique.
- `npm run build` : compile TypeScript dans `dist/`.
- `npm start` : démarre la version compilée.
- `npm run lint` : vérifie le code source.

## Endpoints actuels

- `GET /api/v1/health` : état du service.
- `GET /api/v1` : index de l’API.
- `GET /api/v1/activities` : catalogue des activités du manifeste Bungie, regroupées par catégorie.
- `GET /api/v1/tasks` : tâches de l’utilisateur connecté.
- `POST /api/v1/tasks` : crée une tâche liée à une activité Bungie.
- `PATCH /api/v1/tasks/:id` et `DELETE /api/v1/tasks/:id` : modifie ou supprime une tâche.

Le catalogue du manifeste est mis en cache en mémoire pendant une heure. La connexion Bungie associe
la session à un utilisateur MariaDB afin que les tâches et leurs définitions d’activité soient persistées.

Les variables `BUNGIE_API_KEY`, `BUNGIE_CLIENT_ID`, `BUNGIE_CLIENT_SECRET` et `BUNGIE_OAUTH_AUTHORIZE_URL` sont requises dans `.env` pour la future intégration Bungie. Ne commitez jamais `.env`.
