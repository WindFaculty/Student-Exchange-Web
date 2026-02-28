# SQL Server -> MySQL Migration Tools

## 1) Install dependencies

```bash
pip install pyodbc mysql-connector-python
```

## 2) Run full copy

Set source (SQL Server) and destination (MySQL) connection env vars:

```bash
export SRC_HOST=127.0.0.1
export SRC_PORT=1433
export SRC_DATABASE=student_exchange
export SRC_USERNAME=sa
export SRC_PASSWORD='YourStrong!Passw0rd'

export DST_HOST=127.0.0.1
export DST_PORT=3306
export DST_DATABASE=student_exchange
export DST_USERNAME=root
export DST_PASSWORD='YourStrong!Passw0rd'

export CHUNK_SIZE=1000
python tools/db-migration/sqlserver_to_mysql.py
```

## 3) Validate post-copy integrity

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p student_exchange < tools/db-migration/validate_post_copy.sql
```
