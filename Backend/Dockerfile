FROM python:3.11-slim

# Evita que Python genere archivos .pyc y permite ver logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    cron \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/
#8 AM hora Argentina, 11 AM hora UTC
RUN echo "0 11 * * * . /etc/environment; cd /app && /usr/local/bin/python manage.py enviar_alertas >> /var/log/cron.log 2>&1" > /etc/cron.d/sga-cron

RUN chmod 0644 /etc/cron.d/sga-cron && crontab /etc/cron.d/sga-cron
RUN touch /var/log/cron.log

CMD printenv | grep -v "no_proxy" >> /etc/environment && cron && python manage.py runserver 0.0.0.0:8000