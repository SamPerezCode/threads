# React + Vite

This project now incluye un modo **Mock** para ejecutar la aplicación sin depender de una base de datos o API remota. Además de las instrucciones originales de Vite, seguí estos pasos para activar el backend simulado.

## Ejecutar la aplicación con la API simulada

1. Creá un archivo `.env.local` en la raíz del proyecto (al mismo nivel que `package.json`).
2. Añadí la variable:

   ```bash
   VITE_USE_MOCK_API=true
   ```

3. Iniciá la aplicación con `npm run dev` como siempre.

Cuando esta variable esté definida en `true`, la aplicación intercepta las peticiones a `https://dockerapps.pulzo.com/threads/...` y las atiende con datos locales persistidos en `localStorage`. Esto permite iniciar sesión, registrar usuarios, gestionar el perfil y trabajar con publicaciones, likes y seguidores sin requerir MySQL ni servicios externos.

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
