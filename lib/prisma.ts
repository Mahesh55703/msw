import { PrismaClient } from '@prisma/client'

function createDummyProxy(): any {
  return new Proxy(() => Promise.resolve([]), {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      return createDummyProxy();
    },
    apply() {
      return Promise.resolve([]);
    }
  });
}

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    return createDummyProxy() as PrismaClient;
  }
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = new PrismaClient()

export default prisma

