import { Pool } from 'pg';

import type { Countdown } from './types';

const DEFAULT_POOL_MAX = 10;
const CONNECTION_TIMEOUT_MS = 5000;
const IDLE_TIMEOUT_MS = 30000;
const QUERY_TIMEOUT_MS = 5000;

const globalForPg = globalThis as unknown as {
  countdownPool: Pool | undefined;
};

const COUNTDOWN_SQL = {
  findMany: 'SELECT id, name, "date" FROM countdowns WHERE id = ANY($1::text[]) ORDER BY "date" ASC',
  findOne: 'SELECT id, name, "date" FROM countdowns WHERE id = $1 LIMIT 1',
  create: 'INSERT INTO countdowns (id, name, "date") VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
} as const;

export async function findCountdownsByIds(ids: string[]): Promise<Countdown[]> {
  if (ids.length === 0) {
    return [];
  }

  const { rows } = await getPool().query<Countdown>(COUNTDOWN_SQL.findMany, [ids]);
  return rows;
}

export async function findCountdownById(id: string): Promise<Countdown | null> {
  const { rows } = await getPool().query<Countdown>(COUNTDOWN_SQL.findOne, [id]);
  return rows[0] ?? null;
}

export async function createCountdown(countdown: Countdown): Promise<boolean> {
  const result = await getPool().query(COUNTDOWN_SQL.create, [countdown.id, countdown.name, countdown.date]);
  return result.rowCount === 1;
}

export async function pingDatabase(): Promise<void> {
  await getPool().query('SELECT 1');
}

function getPool() {
  if (!globalForPg.countdownPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    globalForPg.countdownPool = new Pool({
      connectionString,
      max: getPoolMax(),
      connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
      idleTimeoutMillis: IDLE_TIMEOUT_MS,
      query_timeout: QUERY_TIMEOUT_MS,
      statement_timeout: QUERY_TIMEOUT_MS,
      application_name: 'until',
    });
  }

  return globalForPg.countdownPool;
}

function getPoolMax() {
  const value = Number(process.env.PG_POOL_MAX ?? DEFAULT_POOL_MAX);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_POOL_MAX;
}
