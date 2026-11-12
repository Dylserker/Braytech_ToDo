# Braytech ToDo API

Backend Express + TypeScript de Braytech ToDo.

## Développement

```bash
npm install
cp .env.example .env
npm run dev
```

L'API est disponible sur `http://localhost:3000`.

## Scripts

- `npm run dev` : démarre le serveur avec rechargement automatique.
- `npm run build` : compile TypeScript dans `dist/`.
- `npm start` : démarre la version compilée.
- `npm run lint` : vérifie le code source.

## Endpoints actuels

- `GET /api/v1/health` : état du service.
- `GET /api/v1` : index de l’API.

Les intégrations OAuth Bungie, les tâches et la synchronisation seront ajoutées derrière ces routes versionnées.

Les variables `BUNGIE_API_KEY`, `BUNGIE_CLIENT_ID`, `BUNGIE_CLIENT_SECRET` et `BUNGIE_OAUTH_AUTHORIZE_URL` sont requises dans `.env` pour la future intégration Bungie. Ne commitez jamais `.env`.
