# Свадебное приглашение Михаила и Людмилы

Простой сайт для небольшой семейной свадьбы: одно фото, короткий текст, два адреса, отсчёт до события и форма подтверждения присутствия.

## Запуск

```bash
pnpm install
pnpm run image:prepare
pnpm run dev
```

Проверка сборки:

```bash
pnpm run build
```

## Где менять данные

Все основные данные лежат в `src/config/weddingConfig.ts`:

- имена: `groomName`, `brideName`;
- полные имена: `groomFullName`, `brideFullName`;
- дата: `weddingDate` и `weddingDateLabel`;
- почта для ответов: `responseEmail`;
- тексты первого экрана, приглашения и формы;
- адреса, время и ссылки на карты для росписи и банкета.

Сейчас указаны:

- Михаил и Людмила;
- Федрунов Михаил и Людмила Мамула;
- роспись: 10:15, Республика Крым, Симферополь, улица Миллера, 58А;
- банкет: 13:00, Республика Крым, Симферополь, улица Воровского, 24.

## Фото

В проекте используется одно фото:

- исходник: `src/assets/images/original/couple-main-original.jpg`;
- подготовленная версия: `src/assets/images/final/couple-main-retouched.png`;
- финальные файлы сайта: `src/assets/images/final/couple-main-final.webp` и `public/images/couple-main-final.webp`.

Команда:

```bash
pnpm run image:prepare
```

Sharp делает техническую подготовку: кадрирование, resize, WebP/JPEG, лёгкую нормализацию и резкость. Он не заменяет полноценную художественную ретушь. Если нужно заменить фото, сначала положите новый обработанный файл в `src/assets/images/final/couple-main-retouched.png`, затем запустите `pnpm run image:prepare`.

## Форма и Web3Forms

Форма отправляет ответы через Web3Forms на `kam1dzu00@yandex.ru`.

Создайте `.env.local`:

```bash
VITE_WEB3FORMS_ACCESS_KEY=ваш_ключ
```

Ключ можно получить в Web3Forms, привязав адрес `kam1dzu00@yandex.ru`. В GitHub Actions добавьте этот же ключ как secret и передайте его в окружение сборки, если публикуете через GitHub Pages.

Если письмо не пришло:

- проверьте ключ;
- проверьте папку «Спам»;
- убедитесь, что форма показывает успешную отправку;
- проверьте Network в браузере.

## Публикация

Для GitHub Pages включите `Settings -> Pages -> Build and deployment -> Source -> GitHub Actions`.

Workflow находится в `.github/workflows/deploy.yml`.
