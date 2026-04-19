import os
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row


class PostgresTransaction:
    def __init__(self, conn):
        self.conn = conn

    def fetch_one(self, query, params):
        with self.conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, params)
            return cur.fetchone()

    def fetch_all(self, query, params):
        with self.conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, params)
            return cur.fetchall()

    def execute(self, query, params):
        with self.conn.cursor() as cur:
            cur.execute(query, params)


class PostgresDatabase:
    def __init__(self, dsn: str):
        self.dsn = dsn

    @contextmanager
    def transaction(self):
        with psycopg.connect(self.dsn) as conn:
            try:
                with conn.transaction():
                    yield PostgresTransaction(conn)
            except Exception:
                conn.rollback()
                raise


def build_postgres_dsn() -> str:
    host = os.getenv("SD_DB_HOST", "localhost")
    port = os.getenv("SD_DB_PORT", "5432")
    dbname = os.getenv("SD_DB_NAME", "secretaria_digital")
    user = os.getenv("SD_DB_USER", "postgres")
    password = os.getenv("SD_DB_PASSWORD", "")

    if password:
        return f"host={host} port={port} dbname={dbname} user={user} password={password}"
    return f"host={host} port={port} dbname={dbname} user={user}"
