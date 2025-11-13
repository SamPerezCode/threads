# React + Vite

This project now incluye un modo **Mock** para ejecutar la aplicación sin depender de una base de datos o API remota. Además de las instrucciones originales de Vite, seguí estos pasos para activar el backend simulado.

## Ejecutar la aplicación con la API simulada

1. Iniciá la aplicación con `npm run dev` como siempre.
2. El mock se activa automáticamente en cualquier entorno a menos que lo desactives de forma explícita. Si necesitás forzar un comportamiento específico, podés crear un archivo `.env.local` en la raíz del proyecto (al mismo nivel que `package.json`) y definir la variable:

   ```bash
   VITE_USE_MOCK_API=true  # o false para llamar a la API real
   ```

Cuando el modo mock está activo, la aplicación intercepta las peticiones al backend configurado en `VITE_API_BASE_URL` (por defecto `https://dockerapps.pulzo.com/threads`) y las atiende con datos locales persistidos en `localStorage`. Esto permite iniciar sesión, registrar usuarios, gestionar el perfil y trabajar con publicaciones, likes y seguidores sin requerir MySQL ni servicios externos.

### Configurar la URL base de la API real

Si en algún momento disponés de un backend accesible (o querés apuntar a otro entorno), agregá esta variable al mismo archivo `.env.local`:

```bash
VITE_API_BASE_URL="https://tu-backend.com/threads"
```

También podés usar rutas relativas (por ejemplo `/threads`) para que Vercel u otra plataforma sirva el mock y evites problemas de CORS. El mock seguirá funcionando mientras `VITE_USE_MOCK_API` esté en `true`.

### Credenciales de ejemplo

Puedes usar cualquiera de estos usuarios precargados:

| Usuario   | Email             | Contraseña |
| --------- | ----------------- | ---------- |
| anademo   | ana@example.com   | 123456     |
| brunotest | bruno@example.com | 123456     |
| carlamock | carla@example.com | 123456     |

Los nuevos registros también quedan guardados en la base simulada.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
