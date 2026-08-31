import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve))

async function bootstrap() {
  console.log('--- LabourAxis Admin Bootstrap ---')
  
  const email = await question('Admin Email: ')
  const name = await question('Admin Name: ')
  const password = await question('Admin Password: ')

  if (!email || !password) {
    console.error('Email and password are required.')
    process.exit(1)
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    console.error('User with this email already exists.')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log(`\nSuccess! Admin account created for ${user.email}`)
  console.log('You can now log in at /admin/login')
  
  rl.close()
  await prisma.$disconnect()
}

bootstrap().catch(e => {
  console.error(e)
  process.exit(1)
})
