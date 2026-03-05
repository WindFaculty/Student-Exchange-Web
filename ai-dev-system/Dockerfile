FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app
RUN chmod +x /app/scripts/*.sh

EXPOSE 8090

CMD ["python", "-m", "uvicorn", "orchestrator.app:app", "--host", "0.0.0.0", "--port", "8090"]
