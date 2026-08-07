# Publicar en InsForge

[InsForge](https://insforge.dev) aporta dos piezas para este proyecto: el **Postgres gestionado** y el **deploy del frontend**. La app no necesita adoptar el SDK ni el sistema de auth de InsForge — se conecta a su Postgres con Prisma, igual que a cualquier otro.

Vale aclararlo porque cambia el trabajo: `insforge deployments deploy` publica sobre Vercel por debajo, así que el SSR y los Server Actions de Next funcionan tal cual, sin adaptaciones.

---

## 1. Crear el proyecto y enlazarlo

```bash
npx @insforge/cli login
npx @insforge/cli create          # o creá el proyecto desde insforge.dev
npx @insforge/cli link --project-id <tu-project-id>
```

El `project-id` sale de la URL del dashboard. `link` también instala las agent skills de InsForge en el repo.

Para confirmar contra qué proyecto estás trabajando:

```bash
npx @insforge/cli current
```

## 2. Apuntar la app al Postgres de InsForge

```bash
npx @insforge/cli db connection-string
```

Copiá esa URL a tu `.env` local como `DATABASE_URL` y aplicá el esquema:

```bash
npm run db:deploy     # prisma migrate deploy — aplica las migraciones versionadas
npm run seed          # módulos, milestones y usuario demo
npm run seed:vocab    # 75 tarjetas de vocabulario (opcional)
```

Verificá que las tablas quedaron creadas:

```bash
npx @insforge/cli db tables
```

> Usá `db:deploy` y no `db:migrate` contra un entorno real: `migrate deploy` solo aplica migraciones ya versionadas, nunca genera ni resetea nada.

## 3. Generar el `AUTH_SECRET`

```bash
openssl rand -base64 48
```

Es obligatorio: en producción la app **falla al arrancar** si `AUTH_SECRET` falta, es el valor de ejemplo, o tiene menos de 32 caracteres. Es deliberado — sin esa validación, un deploy que se olvide de la variable quedaría firmando sesiones con una clave que está publicada en el repo, y cualquiera podría falsificar el JWT de cualquier usuario.

## 4. Cargar las variables de entorno del deploy

```bash
npx @insforge/cli deployments env set DATABASE_URL "postgresql://..."
npx @insforge/cli deployments env set AUTH_SECRET "<el que generaste>"
```

O pasándolas directo en el deploy:

```bash
npx @insforge/cli deployments deploy --env '{"DATABASE_URL":"postgresql://...","AUTH_SECRET":"..."}'
```

Corré `npx @insforge/cli deployments env --help` para ver la forma exacta de los subcomandos en tu versión del CLI.

## 5. Desplegar

```bash
npm run build                          # validá que compile antes de subir
npx @insforge/cli deployments deploy
```

Seguimiento y URL final:

```bash
npx @insforge/cli deployments list
npx @insforge/cli deployments status <deployment-id>
npx @insforge/cli deployments metadata      # dominios asignados
npx @insforge/cli deployments slug mi-app   # subdominio propio (opcional)
```

---

## Si algo falla

| Síntoma | Dónde mirar |
|---|---|
| La app arranca pero tira 500 en cualquier página | `DATABASE_URL` mal cargada en el deploy. Verificá con `deployments env`. |
| `AUTH_SECRET es obligatoria en producción` | Falta la variable en el entorno del deploy (paso 4). |
| Las páginas cargan pero no hay contenido | Faltó correr las migraciones o el seed contra el Postgres de InsForge (paso 2). |
| Errores de conexión bajo carga | Subí el plan o bajá `DATABASE_POOL_MAX`. Cada instancia serverless abre su propio pool. |

Diagnóstico general del backend:

```bash
npx @insforge/cli diagnose
npx @insforge/cli logs postgres.logs
```

---

## Alternativa: desplegar directo en Vercel

Como InsForge publica sobre Vercel de todas formas, también podés importar el repo en Vercel y usar InsForge solo como Postgres. En ese caso salteá el paso 5 y cargá `DATABASE_URL` y `AUTH_SECRET` en las variables de entorno del proyecto de Vercel. El build de Next es el mismo.

---

## Qué queda pendiente de verificar

Los comandos de arriba salen de la ayuda del CLI (`@insforge/cli`) y de la documentación oficial, pero el deploy en sí no está probado end-to-end en este repo — hace falta una cuenta de InsForge para eso. Lo que sí está verificado localmente contra Postgres 16: las migraciones, los seeds, el login, y las escrituras transaccionales de XP y repasos SRS.
