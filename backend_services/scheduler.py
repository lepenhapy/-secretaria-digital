"""
Agendador de tarefas diárias.
Roda em background thread ao iniciar o servidor.
"""
import logging
import threading
import time
from datetime import datetime
from typing import Callable

logger = logging.getLogger(__name__)


class DailyJob:
    def __init__(self, hora: str, func: Callable, label: str):
        self.hora  = hora   # 'HH:MM'
        self.func  = func
        self.label = label
        self._last_run: str = ''

    def deve_rodar(self) -> bool:
        agora = datetime.now().strftime('%H:%M')
        if agora == self.hora and agora != self._last_run:
            self._last_run = agora
            return True
        return False

    def executar(self) -> None:
        try:
            logger.info(f'[Scheduler] Executando: {self.label}')
            self.func()
            logger.info(f'[Scheduler] Concluído: {self.label}')
        except Exception as e:
            logger.error(f'[Scheduler] Erro em {self.label}: {e}')


class Scheduler:
    def __init__(self):
        self._jobs: list[DailyJob] = []
        self._thread: threading.Thread | None = None
        self._running = False

    def add_daily(self, hora: str, func: Callable, label: str = '') -> None:
        self._jobs.append(DailyJob(hora=hora, func=func, label=label or func.__name__))

    def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True, name='SD-Scheduler')
        self._thread.start()
        logger.info('[Scheduler] Iniciado.')

    def stop(self) -> None:
        self._running = False

    def _loop(self) -> None:
        while self._running:
            for job in self._jobs:
                if job.deve_rodar():
                    job.executar()
            time.sleep(30)  # verifica a cada 30 segundos
