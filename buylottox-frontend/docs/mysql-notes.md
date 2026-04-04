# MySQL notes

## Common DATABASE_URL formats
- Local:
  `mysql://root:password@localhost:3306/buylottox`
- Remote:
  `mysql://user:pass@your-host:3306/buylottox`

## Prisma P1000 (authentication failed)
- Verify username/password in DATABASE_URL
- Ensure MySQL user has permissions:
  `GRANT ALL PRIVILEGES ON buylottox.* TO 'root'@'localhost';`
  `FLUSH PRIVILEGES;`
