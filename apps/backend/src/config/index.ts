import { Config } from "./interfaces/config.interface";

const config: Config = {
  app: {
    port: Number(process.env.APP_PORT || 3000),
  },
  db: {
    url: process.env.DATABASE_URL,
  },
};

export { Config, config };
