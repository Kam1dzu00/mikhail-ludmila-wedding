# Свадебный сайт Михаила и невесты

Камерное digital-приглашение в морской крымской стилистике: любимое зеркальное фото пары, отдельный атмосферный фон, два события, галерея и короткая RSVP-форма без лишней свадебной канцелярии.

## Технологии

- Vinext / Next / React
- TypeScript
- CSS custom properties
- Sharp для подготовки изображений
- Web3Forms для отправки RSVP без backend
- GitHub Pages workflow

## Запуск

1. Установите Node.js 22 или новее.
2. Установите зависимости: `pnpm install`.
3. Подготовьте изображения: `pnpm run images:prepare`.
4. Запустите локально: `pnpm run dev`.
5. Проверьте production-сборку: `pnpm run build`.

В GitHub Actions проект также использует `pnpm`, потому что lock-файл создан именно для него.

## Где менять данные

Основные тексты и данные сейчас находятся в [app/page.tsx](app/page.tsx):

- имена: объект `couple`, поля `groom` и `bride`;
- дата: объект `couple`, поля `date` и `shortDate`;
- фраза первого экрана: `couple.phrase`;
- адреса и ссылки на карты: массив `events`;
- подписи галереи: массив `gallery`;
- тексты формы и success-состояний: блок RSVP.

Адреса по умолчанию:

- роспись: Республика Крым, Симферополь, улица Миллера, 58А, 10:15;
- банкет: Республика Крым, Симферополь, улица Воровского, 24, 13:00.

## Фотографии

Оригиналы лежат в `src/assets/images/originals/`:

- `favorite-mirror.jpg` — любимое зеркальное фото, главный эмоциональный кадр;
- `crimea-sea-couple.jpg` — пара на фоне моря и скал;
- `crimea-horizon.jpg` — морской крымский фон.

Скрипт `pnpm run images:prepare` создаёт:

- `src/assets/images/hero/` — hero-версии;
- `src/assets/images/gallery/` — gallery-версии;
- `src/assets/images/backgrounds/` — фоновые версии;
- `src/assets/images/thumbnails/` — миниатюры;
- `public/images/` — файлы, которые реально использует сайт.

Sharp выполняет техническую подготовку: resize, crop, лёгкую нормализацию, умеренную резкость, WebP/JPEG и AVIF при поддержке локальной сборки. Художественную AI-ретушь лучше делать заранее, сохраняя естественные лица, кожу и реальные детали, затем заменять файлы в `src/assets/images/originals/` и повторять `pnpm run images:prepare`.

## RSVP и Web3Forms

Форма отправляет ответы на `https://api.web3forms.com/submit` и передаёт:

- имя гостя;
- статус присутствия;
- роспись;
- банкет;
- количество гостей;
- примерное время ухода;
- комментарий;
- дату отправки;
- URL страницы;
- honeypot-поле против спама.

Чтобы форма реально отправляла письма:

1. Получите Web3Forms Access Key для `kam1dzu00@yandex.ru`.
2. Создайте `.env.local`.
3. Добавьте строку:

```bash
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=ваш_ключ
```

Если письмо не пришло, проверьте ключ, папку «Спам» и ответ Web3Forms в браузерной консоли/Network.

## GitHub Pages

Workflow находится в `.github/workflows/deploy.yml`.

В репозитории откройте `Settings -> Pages -> Build and deployment -> Source` и выберите `GitHub Actions`. После push в `main` workflow установит зависимости, подготовит изображения, выполнит сборку и опубликует `dist`.

## Настройка внешнего вида

Палитра находится в [app/globals.css](app/globals.css) в CSS-переменных:

- `--color-sea-deep`
- `--color-sea`
- `--color-sky`
- `--color-salt`
- `--color-stone`
- `--color-sand`
- `--color-sage`
- `--color-accent`
- `--color-text`
- `--color-muted`

Шрифты подключены в [app/layout.tsx](app/layout.tsx): Manrope для интерфейса и Playfair Display для крупной editorial-типографики.

## Проверка перед публикацией

Перед отправкой гостям выполните:

```bash
pnpm run images:prepare
pnpm run build
```

Проверьте мобильную версию, отсутствие горизонтального скролла, клики по картам, состояние успешной отправки формы и состояние ошибки при отсутствующем Web3Forms ключе.
