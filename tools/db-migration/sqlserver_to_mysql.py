#!/usr/bin/env python3
"""
Full data copy utility: SQL Server -> MySQL.

Required environment variables:
- SRC_HOST, SRC_PORT, SRC_DATABASE, SRC_USERNAME, SRC_PASSWORD
- DST_HOST, DST_PORT, DST_DATABASE, DST_USERNAME, DST_PASSWORD

Optional:
- SRC_ODBC_DRIVER (default: ODBC Driver 18 for SQL Server)
- SRC_ENCRYPT (default: yes)
- SRC_TRUST_SERVER_CERTIFICATE (default: yes)
- CHUNK_SIZE (default: 1000)
"""

from __future__ import annotations

import os
import sys
from typing import Iterable, List, Sequence, Tuple

try:
    import pyodbc
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency: pyodbc. Install with `pip install pyodbc`."
    ) from exc

try:
    import mysql.connector
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency: mysql-connector-python. Install with `pip install mysql-connector-python`."
    ) from exc


TABLE_ORDER: List[str] = [
    "ref_listing_categories",
    "ref_iot_component_categories",
    "ref_iot_sample_categories",
    "ref_order_statuses",
    "ref_support_ticket_statuses",
    "ref_event_registration_statuses",
    "users",
    "listings",
    "iot_components",
    "iot_sample_products",
    "catalog_items",
    "orders",
    "events",
    "order_items",
    "event_registrations",
    "faqs",
    "support_tickets",
    "iot_page_contents",
    "iot_highlights",
]


def _env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None or value == "":
        raise SystemExit(f"Missing required environment variable: {name}")
    return value


def connect_sql_server() -> "pyodbc.Connection":
    driver = _env("SRC_ODBC_DRIVER", "ODBC Driver 18 for SQL Server")
    host = _env("SRC_HOST")
    port = _env("SRC_PORT", "1433")
    database = _env("SRC_DATABASE")
    username = _env("SRC_USERNAME")
    password = _env("SRC_PASSWORD")
    encrypt = _env("SRC_ENCRYPT", "yes")
    trust_cert = _env("SRC_TRUST_SERVER_CERTIFICATE", "yes")

    conn_str = (
        f"DRIVER={{{driver}}};"
        f"SERVER={host},{port};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        f"Encrypt={encrypt};"
        f"TrustServerCertificate={trust_cert};"
    )
    return pyodbc.connect(conn_str)


def connect_mysql() -> "mysql.connector.MySQLConnection":
    return mysql.connector.connect(
        host=_env("DST_HOST"),
        port=int(_env("DST_PORT", "3306")),
        database=_env("DST_DATABASE"),
        user=_env("DST_USERNAME"),
        password=_env("DST_PASSWORD"),
        autocommit=False,
        charset="utf8mb4",
        use_unicode=True,
    )


def quote_mysql_identifier(value: str) -> str:
    return f"`{value}`"


def table_columns(cursor: "pyodbc.Cursor", table: str) -> List[str]:
    cursor.execute(f"SELECT * FROM [{table}] WHERE 1 = 0")
    return [desc[0] for desc in cursor.description]


def truncate_destination_tables(cursor: "mysql.connector.cursor.MySQLCursor") -> None:
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    for table in TABLE_ORDER:
        cursor.execute(f"TRUNCATE TABLE {quote_mysql_identifier(table)}")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")


def copy_table(
    src_cursor: "pyodbc.Cursor",
    dst_cursor: "mysql.connector.cursor.MySQLCursor",
    table: str,
    chunk_size: int,
) -> int:
    cols = table_columns(src_cursor, table)
    col_list = ", ".join(quote_mysql_identifier(c) for c in cols)
    placeholders = ", ".join(["%s"] * len(cols))
    insert_sql = (
        f"INSERT INTO {quote_mysql_identifier(table)} ({col_list}) "
        f"VALUES ({placeholders})"
    )

    src_cursor.execute(f"SELECT * FROM [{table}] ORDER BY [id]")
    copied = 0
    while True:
        rows = src_cursor.fetchmany(chunk_size)
        if not rows:
            break
        batch: List[Tuple[object, ...]] = [tuple(row) for row in rows]
        dst_cursor.executemany(insert_sql, batch)
        copied += len(batch)
    return copied


def reset_auto_increment(cursor: "mysql.connector.cursor.MySQLCursor") -> None:
    for table in TABLE_ORDER:
        cursor.execute(
            f"SELECT COALESCE(MAX(id), 0) + 1 FROM {quote_mysql_identifier(table)}"
        )
        next_id = int(cursor.fetchone()[0])
        cursor.execute(
            f"ALTER TABLE {quote_mysql_identifier(table)} AUTO_INCREMENT = {next_id}"
        )


def print_counts(cursor: "mysql.connector.cursor.MySQLCursor") -> None:
    print("\nDestination row counts:")
    for table in TABLE_ORDER:
        cursor.execute(f"SELECT COUNT(*) FROM {quote_mysql_identifier(table)}")
        count = int(cursor.fetchone()[0])
        print(f"- {table}: {count}")


def main() -> int:
    chunk_size = int(_env("CHUNK_SIZE", "1000"))
    print(f"Starting full copy SQL Server -> MySQL (chunk_size={chunk_size})")

    src_conn = connect_sql_server()
    dst_conn = connect_mysql()
    src_cursor = src_conn.cursor()
    dst_cursor = dst_conn.cursor()

    try:
        print("Truncating destination tables...")
        truncate_destination_tables(dst_cursor)
        dst_conn.commit()

        for table in TABLE_ORDER:
            print(f"Copying table: {table}")
            copied = copy_table(src_cursor, dst_cursor, table, chunk_size)
            dst_conn.commit()
            print(f"  copied rows: {copied}")

        print("Resetting AUTO_INCREMENT values...")
        reset_auto_increment(dst_cursor)
        dst_conn.commit()

        print_counts(dst_cursor)
        print("\nCopy completed successfully.")
        return 0
    except Exception as exc:  # pragma: no cover
        dst_conn.rollback()
        print(f"\nCopy failed: {exc}", file=sys.stderr)
        return 1
    finally:
        src_cursor.close()
        dst_cursor.close()
        src_conn.close()
        dst_conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
