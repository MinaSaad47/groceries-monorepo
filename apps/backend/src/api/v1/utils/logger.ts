import logger from "pino";

const log = logger({
  level: "trace",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  base: {
    pid: false,
  },
});

export default log;
