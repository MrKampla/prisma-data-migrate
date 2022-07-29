# Prisma-data-migrate

<p align=center>A CLI tool for running data migrations with Prisma in TypeScript</p>

**[GitHub](https://github.com/MrKampla/prisma-data-migrate)**

## Description

Prisma does not have the functionality of migrating the actual data with Typescript built in - it only allows to migrate the database schema using SQL. RedwoodJS solves that problem with [data migrations](https://redwoodjs.com/docs/data-migrations), but it is specific only to Redwood applications. This package is a CLI tool for creating data migrations and applying them to any project that uses Prisma.

## Getting started

Install the prisma-data-migrate tool with your favorite package manager:

```sh
yarn add prisma-data-migrate
```

or

```sh
npm install prisma-data-migrate
```

> You can install prisma-data-migrate globally but it's preffered to add this package to dev dependencies and then use npx to invoke commands.

In order to initialize data migrations, run:

```sh
npx prisma-data-migrate init
```

This command will automatically look for `schema.prisma` file in the prisma directory. If it's not found, then you have to specify the path to the schema file with `--schema "relative-path-to-schema"` parameter.

Prisma-migrate-schema needs a table in your database in order to store the actual state of database migrations that have been run. By default, this table is called `prisma_data_migrations` but you can change that with `--table "table-name"` parameter.

After initializing the prisma-data-migrate, you have to run an actual migration with Prisma migrate in order for Prisma to create the `prisma_data_migrations` table. After that you're good to go!

## Commands

### create

```sh
npx prisma-data-migrate create --name "name_of_the_migration"
```

Creates a new data migration file with a name of choice. Name parameter is required. Also you can provide a custom path to the prisma schema file with `--schema "relative-path-to-schema"`. New data migration will be created in the `dataMigrations` directory which is a sibling to the prisma schema file.

### deploy

```sh
npx prisma-data-migrate deploy
```

Deploys all the migrations that are present in the `dataMigrations` directory but not saved as executed in the database.

### status

```sh
npx prisma-data-migrate status
```

Returns a status of the database, whether it is up-to-date or not.
