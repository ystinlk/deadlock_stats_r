// utils/api.ts

interface FetchOptions extends RequestInit {
  retries?: number;
  timeout?: number;
}

export async function fetchWithRetry(url: string, options: FetchOptions = {}) {
  // Задаем значения по умолчанию: 3 попытки и 8 секунд на таймаут
  const { retries = 3, timeout = 8000, ...fetchOptions } = options;

  for (let i = 0; i < retries; i++) {
    try {
      // Создаем контроллер для прерывания запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal, // привязываем контроллер к fetch
      });

      // Очищаем таймер, если запрос успешен
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      return await response.json();
      
    } catch (error: any) {
      const isLastAttempt = i === retries - 1;
      
      console.warn(`Попытка ${i + 1} провалилась: ${error.message}`);
      
      if (isLastAttempt) {
        throw new Error(`Не удалось получить данные после ${retries} попыток`);
      }
      
      // Небольшая пауза перед следующей попыткой (1 секунда)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}