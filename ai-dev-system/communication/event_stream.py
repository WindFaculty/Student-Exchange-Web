from __future__ import annotations

import logging
from typing import Any

from communication.message_bus import RedisMessageBus


LOGGER = logging.getLogger(__name__)


class EventStream:
    def __init__(self, bus: RedisMessageBus):
        self._bus = bus

    def emit(self, event_type: str, payload: dict[str, Any]) -> None:
        message = {"type": event_type, "payload": payload}
        try:
            self._bus.publish_event(message)
        except Exception:
            LOGGER.warning("Failed to emit event %s", event_type, exc_info=True)
