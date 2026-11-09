# Pendientes

## Verificación E2E del borrado de perfiles (admin)

**Estado:** pendiente de prueba manual.

**Contexto:** `admin_delete_profile` en `supabase/schema.sql` (sección 9) ahora
ejecuta cada paso en su propio bloque con manejo de excepción, en este orden:

1. `storage.objects` — limpieza de avatar y fondo (best-effort)
2. `public.links` — enlaces del usuario
3. `public.profiles` — el perfil
4. `auth.users` — la cuenta de autenticación

El orden importa: borrar primero `auth.users` dispara la cascada FK sobre
`public.profiles`, y ese `DELETE` choca con las políticas RLS (no existe policy
de `DELETE` y la cascada no corre como `SECURITY DEFINER`).

La función devuelve `text`: `'ok'` o
`'Perfil eliminado parcialmente. Detalle: <paso>: <mensaje de Postgres> | ...'`.

**Verificado por REST con la anon key:**
- `rpc/admin_delete_profile` como `anon` → `401` (permiso denegado). Correcto.
- La firma nueva (`returns text`) está cargada en PostgREST.

**Verificado en el cliente:**
- `src/lib/errors.ts` (`getErrorMessage`) extrae `message`/`code`/`details`/`hint`
  de los `PostgrestError` de Supabase, que no son instancias de `Error`; por eso
  todo caía antes en `"Unknown error"`.
- `src/components/admin/user-row.tsx` muestra el warning con el detalle cuando la
  RPC devuelve algo distinto de `'ok'`.

**Falta:**
1. En `/admin`, borrar un perfil de prueba.
2. Confirmar en el toast:
   - `Perfil eliminado` → flujo completo, la cuenta de auth también se borró.
   - `Perfil eliminado parcialmente. Detalle: ...` → anotar qué paso falló
     (`storage` / `links` / `profiles` / `auth.users`) y con qué mensaje de
     Postgres; con eso se ajusta el grant puntual.
3. Comprobar que la URL pública del perfil borrado devuelve 404 y que sus
   enlaces ya no aparecen.

**Nota de permisos:** `auth.users` y `storage.objects` pertenecen a
`supabase_auth_admin` / `supabase_storage_admin`, no a `postgres`. El bloque
`grant delete on table ... to postgres` al final de la sección 9 intenta
conceder esos permisos y no falla si no puede (solo emite un `notice`).
