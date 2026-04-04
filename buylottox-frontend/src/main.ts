// import 'reflect-metadata'
// import { ValidationPipe } from '@nestjs/common'
// import { NestFactory } from '@nestjs/core'
// import { AppModule } from './app.module'

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule)

//   app.enableCors({
//     origin: [
//       'http://localhost:5173',
//       'https://www.buylottox.com',
//       'https://buylottox.com',
//       'd1k2sr62wis3mw.cloudfront.net',
//    ],
//     credentials: true,
//   })

//   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

//   const port = process.env.PORT ? Number(process.env.PORT) : 4000
//   await app.listen(port)
//   console.log(`🚀 BuyLottoX API running on http://localhost:${port}`)
// }
// bootstrap()
import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://www.buylottox.com',
      'https://buylottox.com',
      'https://d1k2sr62wis3mw.cloudfront.net',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const port = process.env.PORT ? Number(process.env.PORT) : 4000
  await app.listen(port, '0.0.0.0')
  console.log(`🚀 BuyLottoX API running on port ${port}`)
}
bootstrap()