from typing import Any, Awaitable, Callable, Dict
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery, TelegramObject
from cachetools import TTLCache

import time

class TimingMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        start_time = time.perf_counter()
        
        result = await handler(event, data)
        
        end_time = time.perf_counter()
        elapsed_ms = (end_time - start_time) * 1000
        
        # Визначаємо що саме було оброблено для красивого логу
        event_info = "Unknown"
        if isinstance(event, Message):
            event_info = f"Message: {event.text[:20] if event.text else 'media'}"
        elif isinstance(event, CallbackQuery):
            event_info = f"Callback: {event.data}"

        print(f"⏱ [PERF] {type(event).__name__} | {event_info} | Час обробки: {elapsed_ms:.2f} ms")
        
        return result

class ThrottlingMiddleware(BaseMiddleware):
    def __init__(self, rate_limit: float = 1.0):
        # Кеш, який зберігає до 10000 юзерів і автоматично очищає їх через rate_limit секунд
        self.cache = TTLCache(maxsize=10000, ttl=rate_limit)

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        # Визначаємо ID користувача залежно від типу апдейту (повідомлення чи кнопка)
        user_id = None
        if isinstance(event, Message):
            user_id = event.from_user.id
        elif isinstance(event, CallbackQuery):
            user_id = event.from_user.id

        if user_id:
            if user_id in self.cache:
                # Якщо юзер спамить - ігноруємо обробку (можна додати await event.answer("Не спамте!"))
                return
            else:
                # Додаємо юзера в кеш
                self.cache[user_id] = True

        return await handler(event, data)
