# Brujula

Marketplace freelance descentralizado construido sobre la red Stellar. Los empleadores publican trabajos y depositan USDC en contratos de escrow (via Trustless Work), y los freelancers aplican, entregan y cobran de forma segura y sin intermediarios.

## Stack Tecnologico

| Capa | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TailwindCSS 4 |
| Base de datos | Neon (PostgreSQL serverless) via `@neondatabase/serverless` |
| Blockchain | Stellar Network (Testnet), USDC on Stellar |
| Smart Contracts | Trustless Work (escrow single-release) |
| Wallet | Freighter Wallet (`@stellar/freighter-api`) |
| Formularios | React Hook Form |
| Deploy | Vercel |

## Estructura del Proyecto

```
src/
  app/
    page.tsx                          # Landing page
    layout.tsx                        # Layout global (Inter + JetBrains Mono)
    actions.ts                        # Server Actions (crear usuario, buscar jobs)
    globals.css                       # Tema y design tokens
    dashboard/
      employer/
        create-job/
          page.tsx                    # Formulario de 5 pasos para crear trabajo
          confirm-deposit/
            page.tsx                  # Confirmar escrow, firmar con Freighter
    api/
      jobs/
        create/route.ts              # POST - Crear job en Neon DB
        [id]/route.ts                # GET  - Obtener job por ID
      escrow/
        deploy/route.ts              # POST - Deploy escrow via Trustless Work API
        send/route.ts                # POST - Enviar XDR firmado a Stellar
      test-prisma/route.ts           # GET  - Test de conexion a Neon DB
      test/
        deploy-first/route.ts        # GET  - Test de deploy de escrow
        trustlesswork/route.ts        # GET  - Test de conexion a Trustless Work API
    test-freighter/page.tsx           # Pagina de prueba de conexion con Freighter
  components/
    landing/
      navbar.tsx                      # Navegacion con boton "Conectar Wallet"
      hero.tsx                        # Hero section
      how-it-works.tsx                # Seccion "Como funciona" (4 pasos)
      features.tsx                    # Ventajas de la plataforma
      for-whom.tsx                    # Seccion para empleadores y freelancers
      cta.tsx                         # Call to action final
      footer.tsx                      # Footer
  hooks/
    useWallet.ts                      # Hook para conectar/firmar con Freighter
  lib/
    db.ts                             # Cliente Neon (getDb)
    prisma.ts                         # Cliente Prisma (legacy, se mantiene por compatibilidad)
    utils.ts                          # Utilidad cn() para clases CSS
    trustlesswork/
      client.ts                       # Cliente HTTP para la API de Trustless Work
      types.ts                        # Tipos TypeScript para escrow, roles, milestones
scripts/
  create-tables.sql                   # Script SQL para crear las 7 tablas en Neon
  add-updated-at.sql                  # Migracion para agregar updatedAt
prisma/
  schema.prisma                       # Schema Prisma (referencia del modelo de datos)
```

## Modelo de Datos

| Tabla | Descripcion |
|---|---|
| **User** | Identificado por `stellarAddress` (Freighter). Sin email ni password. |
| **Job** | Trabajo publicado por un empleador. Tiene `escrowContractId` cuando se deposita. |
| **Application** | Postulacion de un freelancer a un job. |
| **Agreement** | Acuerdo activo entre empleador y freelancer, vinculado al escrow. |
| **Transaction** | Registro de transacciones en Stellar (deposits, releases, refunds). |
| **Notification** | Notificaciones in-app para el usuario. |
| **NotificationPreferences** | Preferencias de notificacion (email, telegram, discord). |

## Flujo Principal: Crear Trabajo y Depositar

1. Empleador conecta Freighter wallet
2. Completa formulario de 5 pasos (titulo, descripcion, entregables, presupuesto, revision)
3. Click "Continuar a Depositar" -> se guarda Job en Neon DB via `/api/jobs/create`
4. Pagina de confirmacion muestra resumen + desglose (monto + 2% fee plataforma)
5. Click "Crear Escrow" -> llama a `/api/escrow/deploy` que invoca Trustless Work API -> devuelve XDR sin firmar
6. Click "Firmar con Freighter" -> Freighter abre popup para firmar la transaccion
7. Click "Enviar Transaccion" -> llama a `/api/escrow/send` con el XDR firmado -> se envia a Stellar
8. Se actualiza el Job en DB con `escrowContractId` y `status = FUNDED`

## Requisitos Previos

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (o npm/yarn)
- Una base de datos [Neon](https://neon.tech/) (PostgreSQL serverless)
- Una API key de [Trustless Work](https://trustlesswork.com/)
- Extension de navegador [Freighter Wallet](https://www.freighter.app/) configurada en **Testnet**
- Una wallet Stellar con fondos de testnet (usar [Stellar Friendbot](https://friendbot.stellar.org/?addr=TU_ADDRESS))

## Variables de Entorno

Crea un archivo `.env.local` en la raiz del proyecto:

```env
# Neon PostgreSQL - Connection string de tu proyecto en neon.tech
DATABASE_URL="postgresql://usuario:password@ep-xxx.region.neon.tech/neondb?sslmode=require"

# Trustless Work API
# Testnet: https://dev.api.trustlesswork.com
# Mainnet: https://api.trustlesswork.com
TRUSTLESS_WORK_API_URL="https://dev.api.trustlesswork.com"
TRUSTLESS_WORK_API_KEY="tu-api-key-de-trustless-work"

# Clave publica Stellar de la plataforma Brujula
# Se usa como platformAddress, releaseSigner y disputeResolver en los escrows
BRUJULA_STELLAR_PUBLIC_KEY="G...tu-clave-publica-stellar"

# Issuer de USDC en Stellar Testnet
USDC_ISSUER_ADDRESS="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
```

### Donde obtener cada variable

| Variable | Donde |
|---|---|
| `DATABASE_URL` | [Neon Console](https://console.neon.tech/) -> tu proyecto -> Connection Details |
| `TRUSTLESS_WORK_API_URL` | `https://dev.api.trustlesswork.com` para testnet |
| `TRUSTLESS_WORK_API_KEY` | [Trustless Work Dashboard](https://app.trustlesswork.com/) -> API Keys |
| `BRUJULA_STELLAR_PUBLIC_KEY` | Tu wallet Stellar (la que actua como plataforma) |
| `USDC_ISSUER_ADDRESS` | Testnet: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

## Instalacion y Ejecucion

```bash
# 1. Clonar el repositorio
git clone https://github.com/AndJunes/brujulaDev.git
cd brujulaDev

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales (ver seccion anterior)

# 4. Crear tablas en Neon
# Opcion A: Ejecutar el script SQL directamente en el SQL Editor de Neon Console
# Copiar el contenido de scripts/create-tables.sql y pegarlo en neon.tech -> SQL Editor -> Run

# Opcion B: Usar psql si lo tenes instalado
psql $DATABASE_URL -f scripts/create-tables.sql

# 5. Iniciar el servidor de desarrollo
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Endpoints de la API

| Metodo | Ruta | Descripcion |
|---|---|---|
| `POST` | `/api/jobs/create` | Crea un job en la base de datos |
| `GET` | `/api/jobs/[id]` | Obtiene un job por ID |
| `POST` | `/api/escrow/deploy` | Deploya un escrow via Trustless Work, devuelve XDR sin firmar |
| `POST` | `/api/escrow/send` | Envia XDR firmado a Stellar y actualiza el job en DB |
| `GET` | `/api/test-prisma` | Test de conexion a la base de datos Neon |
| `GET` | `/api/test/trustlesswork` | Test de conexion a la API de Trustless Work |
| `GET` | `/api/test/deploy-first` | Test completo de deploy de escrow |

## Paginas de Test

- `/test-freighter` - Probar la conexion con la wallet Freighter
- `/api/test-prisma` - Verificar que la base de datos Neon responde
- `/api/test/trustlesswork` - Verificar que la API de Trustless Work responde

## Configuracion de Freighter para Testnet

1. Instalar la extension [Freighter](https://www.freighter.app/) en Chrome/Brave
2. Abrir Freighter -> Settings -> Network -> seleccionar **TESTNET**
3. Copiar tu direccion publica (empieza con `G...`)
4. Fondear tu wallet de testnet: ir a `https://friendbot.stellar.org/?addr=TU_DIRECCION`
5. Agregar trustline de USDC testnet en Freighter (asset code: USDC, issuer: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`)

## Deploy en Vercel

1. Conectar el repositorio a [Vercel](https://vercel.com/)
2. Agregar la integracion de Neon (configura `DATABASE_URL` automaticamente)
3. Agregar las demas variables de entorno en Settings -> Environment Variables:
   - `TRUSTLESS_WORK_API_URL`
   - `TRUSTLESS_WORK_API_KEY`
   - `BRUJULA_STELLAR_PUBLIC_KEY`
   - `USDC_ISSUER_ADDRESS`
4. Deploy

## Licencia

Proyecto privado - Todos los derechos reservados.
