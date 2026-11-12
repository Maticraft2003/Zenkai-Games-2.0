# Zenkai Games API

## Requisitos
- Node.js 20 o superior.
- Una clave de API de RAWG: https://rawg.io/apidocs

## Instalación
```bash
cd backend
npm install
cp .env.example .env
```

Editá `.env` y completá:
- `JWT_SECRET`: cadena aleatoria larga, mínimo 32 caracteres.
- `ADMIN_EMAIL`: correo exacto de la cuenta que será administradora.
- `ADMIN_PASSWORD`: contraseña inicial segura, mínimo 10 caracteres. Si el usuario ya existe, el arranque le asigna el rol admin y no cambia su contraseña.
- `RAWG_API_KEY`: clave privada de RAWG.

Luego iniciá:
```bash
npm run dev
```

La API queda en `http://localhost:3001/api`. SQLite crea o actualiza `zenkai.db` automáticamente. Las contraseñas antiguas en texto plano se convierten a bcrypt en el primer login correcto.

## Rutas principales
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/catalog/games?search=minecraft`
- `GET /api/games`
- `POST /api/games`, `PUT /api/games/:id`, `DELETE /api/games/:id` (admin)
- `POST /api/games/:gameId/ratings`, `GET /api/games/:gameId/my-rating` (usuario autenticado)
- `GET /api/noticias`, `POST/PUT/DELETE /api/noticias` (escritura admin)
- `GET /api/comentarios`, `POST/PUT/DELETE /api/comentarios` (escritura admin)

Las rutas protegidas requieren `Authorization: Bearer <token>`.
