import os
import socket
import threading
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool


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
        self._pool: ConnectionPool | None = None
        self._lock = threading.Lock()

    def open(self):
        with self._lock:
            if self._pool is not None:
                return
            self._pool = ConnectionPool(
                self.dsn,
                min_size=1,
                max_size=10,
                kwargs={"row_factory": dict_row},
                open=True,
                reconnect_timeout=30,
                connection_class=psycopg.Connection,
            )

    def close(self):
        with self._lock:
            if self._pool:
                self._pool.close()
                self._pool = None

    @contextmanager
    def transaction(self):
        # Se pool não está pronto, tenta abrir (thread-safe)
        if self._pool is None:
            try:
                self.open()
            except Exception as exc:
                # Pool falhou — usa conexão direta como fallback
                print(f"[db] pool falhou, usando conexão direta: {exc}")
                with psycopg.connect(self.dsn, connect_timeout=15) as conn:
                    with conn.transaction():
                        yield PostgresTransaction(conn)
                return

        with self._pool.connection() as conn:
            with conn.transaction():
                yield PostgresTransaction(conn)


def _resolve_ipv4(host: str, port: int) -> str:
    try:
        results = socket.getaddrinfo(host, port, socket.AF_INET)
        if results:
            return results[0][4][0]
    except Exception:
        pass
    return host


def build_postgres_dsn() -> str:
    # Railway fornece DATABASE_URL automaticamente — tem prioridade absoluta
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        if database_url.startswith("postgres://"):
            database_url = "postgresql://" + database_url[len("postgres://"):]
        return database_url

    # Fallback para variáveis manuais (SD_DB_*)
    host = os.getenv("SD_DB_HOST", "localhost")
    port = os.getenv("SD_DB_PORT", "5432")
    dbname = os.getenv("SD_DB_NAME", "secretaria_digital")
    user = os.getenv("SD_DB_USER", "postgres")
    password = os.getenv("SD_DB_PASSWORD", "")

    hostaddr = _resolve_ipv4(host, int(port))
    extras = f"hostaddr={hostaddr} sslmode=require gssencmode=disable"

    if password:
        return f"host={host} port={port} dbname={dbname} user={user} password={password} {extras}"
    return f"host={host} port={port} dbname={dbname} user={user} {extras}"
