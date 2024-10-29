<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Teslo API

1. Clone project

2. Build packages
```
yarn install
```
3. Clone file ```.env.template``` and rename it to ```.env```

4. Adjust environment variable values for each one as per your needs.

3. Postgres database setting up

```
docker-compose up -d
```

4. Set up dependencies for configuration loading

```
yarn add @nestjs/config
```
In you app.module.ts file set up following import for the configuration
```
@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
})
```

5. Install TypeORM packages

```
yarn add @nestjs/typeorm typeorm
```

6. Install Postgress package
```
yarn add pg
```

7. Set up TypeORM in your app.module.ts file as follows
```
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true, // not for production
    }),
  ],
})
```

9. Run SEED
```
http://localhost:3000/api/seed
```

10. Run application for development
```
yarn start:dev
```