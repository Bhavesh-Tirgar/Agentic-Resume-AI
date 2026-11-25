import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backend.settings")

try:
    from celery import Celery

    app = Celery("careerpilot")
    app.config_from_object("django.conf:settings", namespace="CELERY")
    app.conf.broker_url = os.getenv("CELERY_BROKER_URL", os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0"))
    app.conf.result_backend = os.getenv("CELERY_RESULT_BACKEND", app.conf.broker_url)
    app.conf.task_soft_time_limit = 90
    app.conf.task_time_limit = 120
    app.autodiscover_tasks()
except ImportError:
    app = None
