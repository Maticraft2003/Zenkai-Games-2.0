# Resumen: permisos de administrador

Fecha: 2026-11-11
Rama local: `zenkai-games-2.5`

## Cambios realizados

- En `backend/database.js`, al inicializar roles se asigna `admin` a la cuenta configurada por el usuario y se dejan las demás cuentas como `usuario`. La comparación del correo ignora mayúsculas/minúsculas.
- El registro sigue asignando `usuario` a cada cuenta nueva.
- En `backend/server.js`, agregar juegos ahora requiere rol de administrador. Editar y eliminar juegos ya estaban protegidos.
- Crear, editar y eliminar noticias requiere rol de administrador.
- Crear, editar y eliminar publicaciones de comunidad requiere rol de administrador. Los usuarios normales conservan la lectura, los comentarios y los likes.
- En el frontend se ocultan los controles de crear, editar y eliminar para cuentas que no son admin.

## Verificaciones

- `npm run build` en `frontend`: correcto.
- Consulta SQLite de solo lectura: la cuenta indicada tiene rol `admin` y hay exactamente un administrador.
- `POST /juegos`, `POST /noticias` y `POST /comunidad` sin sesión: las tres solicitudes respondieron `401 ADMIN_AUTH_REQUIRED`.
- Diagnósticos de los archivos modificados: sin errores.

## Estado de Git

Estos cambios y este resumen están en la rama local `zenkai-games-2.5`; todavía no se hizo un nuevo commit ni push. La base local `backend/zenkai.db` permanece fuera de los cambios preparados, y el archivo `si` no fue modificado.
