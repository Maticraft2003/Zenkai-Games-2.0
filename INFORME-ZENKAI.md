# Informe de Zenkai Games

**Actualizado:** 3 de noviembre de 2026
**Repositorio:** `Maticraft2003/Zenkai-Games-2.0`

Este informe resume los cambios realizados y las comprobaciones ejecutadas. No reemplaza una prueba del sitio publicado ni garantiza que no existan errores fuera de lo verificado.

## Mejoras realizadas

### Catálogo e interacción con juegos

- Se reorganizaron las tarjetas para mostrar género, descripción, puntuación, visitas y votos.
- Se agregó una estrella para guardar favoritos y una sección para consultarlos. Los favoritos se guardan por cuenta.
- La puntuación comunitaria se calcula con likes y dislikes; un juego sin votos se muestra sin puntuación comunitaria.
- Las visitas se cuentan una vez por cuenta o por identificador anónimo del navegador.
- Se incorporaron recomendaciones y rankings por género basados en la actividad de la comunidad.
- Los juegos recién agregados se destacan en Inicio y Juegos durante cuatro días.
- El formulario de propuestas acepta títulos reconocidos y bloquea nombres inventados o duplicados.
- El límite de imagen se aumentó a 20 MiB y el límite JSON del backend a 28 MiB para imágenes codificadas en Base64.
- Se mejoraron estilos de Inicio y de autenticación, y los mensajes visuales de error.
- Se eliminaron referencias a una imagen de fondo inexistente que generaba una advertencia de compilación.

### Cuentas y permisos

- Las sesiones usan tokens validados por el backend.
- Votos, favoritos, perfiles, comentarios y sus likes requieren autenticación; la identidad se obtiene de la sesión, no de un ID enviado por el navegador.
- Las noticias solo pueden ser creadas, editadas o eliminadas por un administrador.
- Las publicaciones de Comunidad requieren sesión para crearse y solo pueden ser modificadas por su autor o un administrador.
- Se agregó una migración compatible que registra el autor de las nuevas publicaciones. Las publicaciones existentes se conservan; al no tener autor registrado, solo las puede administrar un administrador.

## Verificaciones ejecutadas

- `npm run lint` en `frontend`: aprobado.
- `npm run build` en `frontend`: aprobado.
- `node --check` para `backend/server.js` y `backend/database.js`: aprobado.
- `git diff --check`: aprobado.
- Pruebas API con bases temporales: registro e inicio de sesión, aislamiento entre cuentas, votos, favoritos, perfiles, permisos de Noticias y Comunidad, comentarios, likes y conteo de visitas.
- La migración se probó con una base temporal que contenía una publicación anterior: se conservó el contenido y se limitó su administración al admin.
- Se probaron algunos flujos visuales y diseño móvil; la prueba visual fue parcial y no sustituye pruebas en dispositivos y navegadores reales.
- Las pruebas de escritura se hicieron con bases aisladas, no con la base de datos real.

## Precauciones antes de publicar

1. **Cambiar la contraseña predeterminada del administrador.** La configuración actual de la base crea `admin@gmail.com` con una contraseña predeterminada. Reemplazala por una contraseña única y robusta antes de exponer el sitio, y confirma que podés iniciar sesión con ella.
2. Reiniciar el backend después de actualizar el código, para cargar los cambios y ejecutar la migración de `owner_user_id`.
3. Confirmar que frontend y backend desplegados corresponden a estos cambios y usan la misma base de datos. Las pruebas locales no certifican la configuración del hosting.
4. Antes de subir imágenes grandes, confirmar los límites del proveedor de hosting, proxy y almacenamiento.

## Commits guardados

- `47c4a42` — `Save Zenkai Games improvements`
- `ffe3a2e` — `Secure game engagement and count guest views`
- `89c13c9` — `Enforce profile and community permissions`
