import { logger } from "./Logger";

export function pErr(err: Error): void {
  logger.error(err);
}

export function getRandomInt(): number {
  return Math.floor(Math.random() * 1_000_000_000_000);
}
