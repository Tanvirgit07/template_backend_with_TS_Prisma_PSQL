// import { env } from "./env.js";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "../generated/prisma/client.js";

// const adapter = new PrismaPg({
//   connectionString: env.databaseUrl,
// });

// export const prisma = new PrismaClient({
//   adapter,
// });


import net from "node:net";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
if (net.setDefaultAutoSelectFamily) {
  net.setDefaultAutoSelectFamily(false);
} 


import { env } from "./env.js";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client.js";

// Node.js এনভায়রনমেন্টে WebSocket চালু করার কনফিগারেশন
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({
  connectionString: env.databaseUrl,
});

export const prisma = new PrismaClient({
  adapter,
});