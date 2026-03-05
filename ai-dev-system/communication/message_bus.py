from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any

import redis


LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class BusConfig:
    redis_url: str
    queue_key: str
    events_channel: str


class RedisMessageBus:
    def __init__(self, config: BusConfig):
        self._config = config
        self._client = redis.Redis.from_url(config.redis_url, decode_responses=True)

    def ping(self) -> bool:
        try:
            return bool(self._client.ping())
        except redis.RedisError:
            return False

    def queue_task(self, task_payload: dict[str, Any]) -> None:
        self._client.rpush(self._config.queue_key, json.dumps(task_payload))

    def pop_task(self, timeout_seconds: int = 1) -> dict[str, Any] | None:
        item = self._client.blpop(self._config.queue_key, timeout=timeout_seconds)
        if not item:
            return None
        _, raw_payload = item
        return json.loads(raw_payload)

    def publish_event(self, event_payload: dict[str, Any]) -> None:
        self._client.publish(self._config.events_channel, json.dumps(event_payload))

    def queue_depth(self) -> int:
        try:
            return int(self._client.llen(self._config.queue_key))
        except redis.RedisError:
            return 0

    def close(self) -> None:
        try:
            self._client.close()
        except redis.RedisError:
            LOGGER.warning("Failed to close Redis client cleanly", exc_info=True)
