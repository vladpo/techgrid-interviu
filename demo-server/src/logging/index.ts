import { format, createLogger, transports } from "winston";
import momentTZ from "moment-timezone";
import { EU_BUCHAREST } from "../commons";
import morgan from "morgan";
import { Request } from "express-jwt";

morgan.token("date", () => {
  return momentTZ().tz(EU_BUCHAREST).format("YYYY-MM-DDTHH:mm:ss.SSS");
});

morgan.token("appUser", (req: Request & { user: { email: string } }) => {
  if (req.user) {
    return req.user.email;
  } else return "no-jwt";
});

morgan.format(
  "myFormat",
  `[:date["${EU_BUCHAREST}"]] :remote-addr :req[X-Real-IP] :appUser :method :url HTTP/:http-version :status :res[content-length] :response-time ms`,
);

const { colorize, combine, printf } = format;

const myFormat = printf((info) => {
  return `[${info.timestamp}] ${info.level}: ${info.message}`;
});

const appendTimestamp = format((info, opts) => {
  if (opts.timeZone) {
    info.timestamp = momentTZ()
      .tz(opts.timeZone)
      .format("YYYY-MM-DDTHH:mm:ss.SSS");
  }
  return info;
});

const logger = createLogger({
  format: combine(
    appendTimestamp({ timeZone: EU_BUCHAREST }),
    colorize(),
    myFormat,
  ),
  transports: [new transports.Console()],
});

export default logger;
