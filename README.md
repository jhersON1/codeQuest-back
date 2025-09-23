<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


Claro, aquí tienes una plantilla de documentación para tu archivo `README.md` basada en los requisitos que mencionaste. Puedes copiar y pegar este contenido directamente en tu archivo y personalizar CodeQuest y otros detalles.

-----

CodeQuest

Una breve descripción de lo que hace este proyecto. Este es un backend construido con NestJS que se integra con Discord para la autenticación, utiliza una base de datos PostgreSQL y MeiliSearch para búsquedas, todo orquestado con Docker.

## Tabla de Contenidos

  - [Requisitos Previos](https://www.google.com/search?q=%23requisitos-previos)
  - [Guía de Inicio Rápido](https://www.google.com/search?q=%23gu%C3%ADa-de-inicio-r%C3%A1pido)
      - [1. Instalar Dependencias](https://www.google.com/search?q=%231-instalar-dependencias)
      - [2. Crear Aplicación de Discord](https://www.google.com/search?q=%232-crear-aplicaci%C3%B3n-de-discord)
      - [3. Configurar Variables de Entorno](https://www.google.com/search?q=%233-configurar-variables-de-entorno)
      - [4. Levantar Servicios con Docker](https://www.google.com/search?q=%234-levantar-servicios-con-docker)
      - [5. Poblar la Base de Datos (Seed)](https://www.google.com/search?q=%235-poblar-la-base-de-datos-seed)
      - [6. Ejecutar el Proyecto](https://www.google.com/search?q=%236-ejecutar-el-proyecto)
  - [Scripts Disponibles](https://www.google.com/search?q=%23scripts-disponibles)

-----

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

  - [Node.js](https://nodejs.org/en/) (v18 o superior)
  - [npm](https://www.google.com/search?q=https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
  - [Docker](https://www.docker.com/products/docker-desktop/) y Docker Compose

-----

## Guía de Inicio Rápido

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### 1\. Instalar Dependencias

Primero, clona el repositorio (si aún no lo has hecho) y luego instala todas las dependencias del proyecto usando npm:

```bash
npm install
```

### 2\. Crear Aplicación de Discord

Para la autenticación con Discord, necesitas credenciales de una aplicación.

1.  Ve al **[Portal de Desarrolladores de Discord](https://www.google.com/search?q=https://discord.com/developers/applications)**.
2.  Haz clic en **"New Application"** y dale un nombre a tu aplicación.
3.  Navega a la pestaña **"OAuth2" -\> "General"**.
4.  Copia el **CLIENT ID** y genera un **CLIENT SECRET** haciendo clic en "Reset Secret". Guarda ambos valores, los necesitarás en el siguiente paso.
5.  En la sección **"Redirects"**, añade la URL de callback. Para el entorno de desarrollo, esta suele ser:
    `http://localhost:3000/auth/discord/callback`
    (Asegúrate de que el puerto coincida con el de tu backend).

### 3\. Configurar Variables de Entorno

El proyecto utiliza un archivo `.env` para gestionar las variables de entorno. Se proporciona una plantilla para facilitar la configuración.

1.  Copia el archivo `env.template` y renómbralo a `.env`:

    ```bash
    cp env.template .env
    ```

2.  Abre el archivo `.env` y rellena las variables con los valores correspondientes. Especialmente, asegúrate de configurar las credenciales de Discord que obtuviste en el paso anterior:

    ```env
    # Discord OAuth
    DISCORD_CLIENT_ID=TU_CLIENT_ID_DE_DISCORD
    DISCORD_CLIENT_SECRET=TU_CLIENT_SECRET_DE_DISCORD
    DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback

    # Database
    POSTGRES_USER=admin
    POSTGRES_PASSWORD=password123
    POSTGRES_DB=project_db
    DATABASE_URL="postgresql://admin:password123@localhost:5432/project_db?schema=public"

    # MeiliSearch
    MEILISEARCH_HOST=http://localhost:7700
    MEILISEARCH_API_KEY=una_llave_maestra_segura
    ```

### 4\. Levantar Servicios con Docker

Este proyecto utiliza Docker para ejecutar la base de datos (PostgreSQL) y el motor de búsqueda (MeiliSearch).

1.  **Verifica que Docker Engine esté corriendo** en tu sistema.

2.  Ejecuta el siguiente comando para levantar los contenedores en segundo plano (`-d`):

    ```bash
    docker-compose up -d
    ```

    Este comando leerá el archivo `docker-compose.yml` y creará e iniciará los servicios de la base de datos y MeiliSearch.

### 5\. Poblar la Base de Datos (Seed)

Una vez que la base de datos esté corriendo, puedes poblarla con datos de ejemplo ejecutando el script de "seed". Esto es útil para tener usuarios y otros datos con los que probar la aplicación.

```bash
npm run seed
```

### 6\. Ejecutar el Proyecto

Finalmente, para iniciar la aplicación de NestJS en modo de desarrollo, ejecuta:

```bash
npm run start:dev
```

Este comando iniciará el servidor y lo reiniciará automáticamente cada vez que detecte cambios en los archivos del código fuente. ¡Tu backend debería estar corriendo en `http://localhost:3000`\! 🚀

-----

## Scripts Disponibles

En el archivo `package.json`, puedes encontrar otros scripts útiles:

  - `npm run build`: Compila el proyecto TypeScript a JavaScript.
  - `npm start`: Inicia la aplicación en modo de producción (después de compilar).
  - `npm run lint`: Ejecuta el linter para revisar la calidad del código.
  - `npm run test`: Ejecuta las pruebas unitarias.

