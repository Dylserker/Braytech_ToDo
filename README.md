# Braytech_ToDo

## Serveurs HTTPS locaux

À exécuter une seule fois pour générer les certificats locaux :

```bash
cd back
mkdir -p certs
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1
```

Terminal 1 — backend Express :

```bash
cd back
npm run dev
```

API : `https://localhost:3000`

Terminal 2 — frontend React :

```bash
cd front
npm run dev -- --host localhost
```

Application : `https://localhost:5173`
