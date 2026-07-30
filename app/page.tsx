"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

const couple = {
  groom: "Михаил",
  bride: "Невеста",
  date: "Дата скоро будет тут",
  shortDate: "soon",
  phrase: "Похоже, у нас всё серьёзно",
};

const events = [
  {
    title: "Роспись",
    time: "10:15",
    address: "Республика Крым, Симферополь, улица Миллера, 58А",
    mapUrl: "https://yandex.ru/maps/?text=Республика%20Крым%2C%20Симферополь%2C%20улица%20Миллера%2C%2058А",
  },
  {
    title: "Банкет",
    time: "13:00",
    address: "Республика Крым, Симферополь, улица Воровского, 24",
    mapUrl: "https://yandex.ru/maps/?text=Республика%20Крым%2C%20Симферополь%2C%20улица%20Воровского%2C%2024",
  },
];

const gallery = [
  {
    src: "/images/favorite-mirror-gallery.webp",
    fallback: "/images/favorite-mirror-gallery.jpg",
    alt: "Михаил и невеста в мастерской у зеркала",
    caption: "Главный кадр. Немного краски, немного серьёзных намерений.",
    className: "gallery-main",
  },
  {
    src: "/images/crimea-sea-couple-gallery.webp",
    fallback: "/images/crimea-sea-couple-gallery.jpg",
    alt: "Пара на фоне моря, гор и скал в Крыму",
    caption: "Крымский свет, море и два человека, которые уже всё поняли.",
    className: "gallery-tall",
  },
  {
    src: "/images/crimea-horizon-gallery.webp",
    fallback: "/images/crimea-horizon-gallery.jpg",
    alt: "Морской горизонт, горы и южная трава",
    caption: "Алуштинское настроение: воздух, горизонт, без лишних слов.",
    className: "gallery-wide",
  },
];

type FormStatus = "idle" | "validating" | "submitting" | "success" | "error";

type FormState = {
  guestName: string;
  attendance: "" | "yes" | "no";
  ceremony: "" | "yes" | "no";
  banquet: "" | "yes" | "no";
  guestCount: "" | "1" | "2" | "other";
  otherCount: string;
  stayUntil: string;
  comment: string;
  website: string;
};

const initialForm: FormState = {
  guestName: "",
  attendance: "",
  ceremony: "",
  banquet: "",
  guestCount: "",
  otherCount: "",
  stayUntil: "",
  comment: "",
  website: "",
};

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstErrorRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const isComing = form.attendance === "yes";
  const isBanquet = isComing && form.banquet === "yes";
  const buttonText = useMemo(() => {
    if (status === "validating") return "Проверяем ответ";
    if (status === "submitting") return "Отправляем";
    if (status === "error") return "Повторить отправку";
    return "Отправить ответ";
  }, [status]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validate() {
    const next: Record<string, string> = {};
    const trimmedName = form.guestName.trim();
    const numericGuests = Number(form.otherCount);

    if (!trimmedName) next.guestName = "Напишите имя, чтобы мы поняли, кого ждать.";
    if (trimmedName.length > 80) next.guestName = "Имя получилось слишком длинным.";
    if (!form.attendance) next.attendance = "Выберите, получится ли прийти.";

    if (isComing) {
      if (!form.ceremony) next.ceremony = "Отметьте, будете ли на росписи.";
      if (!form.banquet) next.banquet = "Отметьте, будете ли на банкете.";
      if (!form.guestCount) next.guestCount = "Укажите, сколько вас будет.";
      if (form.guestCount === "other" && (!Number.isInteger(numericGuests) || numericGuests < 1 || numericGuests > 8)) {
        next.otherCount = "Введите число от 1 до 8.";
      }
    }

    if (form.comment.length > 600) next.comment = "Комментарий лучше уложить в 600 символов.";
    return next;
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("validating");
    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      setStatus("idle");
      requestAnimationFrame(() => firstErrorRef.current?.focus());
      return;
    }

    if (form.website) {
      setStatus("success");
      return;
    }

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "";
    if (!accessKey) {
      setStatus("error");
      setErrors({ form: "Нужно добавить Web3Forms Access Key перед публикацией формы." });
      return;
    }

    setStatus("submitting");
    const payload = {
      access_key: accessKey,
      subject: `Ответ на свадебное приглашение — ${form.guestName.trim()}`,
      from_name: "Свадебный сайт",
      guest_name: form.guestName.trim(),
      attendance_status: form.attendance === "yes" ? "Да, буду" : "К сожалению, не смогу",
      ceremony_attendance: isComing ? form.ceremony : "",
      banquet_attendance: isComing ? form.banquet : "",
      guest_count: isComing ? (form.guestCount === "other" ? form.otherCount : form.guestCount) : "0",
      stay_until: isBanquet ? form.stayUntil : "",
      comment: form.comment,
      submitted_at: new Date().toISOString(),
      page_url: window.location.href,
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("Web3Forms rejected request");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrors({ form: "Не получилось отправить. Проверьте интернет и попробуйте ещё раз." });
    }
  }

  function resetAnswer() {
    setForm(initialForm);
    setErrors({});
    setStatus("idle");
  }

  return (
    <main className="site-shell">
      <div className="progress-line" aria-hidden="true" />
      <section className="hero" id="top">
        <div className="sea-atmosphere" aria-hidden="true">
          <span className="horizon-line" />
          <span className="drift drift-one" />
          <span className="drift drift-two" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Крым · море · свои люди</p>
          <h1>{couple.groom} &amp; {couple.bride}</h1>
          <p className="hero-phrase">{couple.phrase}</p>
          <div className="hero-actions">
            <a className="button primary" href="#rsvp">Ответить</a>
            <a className="button ghost" href="#events">Где и когда</a>
          </div>
        </div>
        <figure className="hero-photo reveal">
          <picture>
            <source srcSet="/images/favorite-mirror-hero.webp" type="image/webp" />
            <img src="/images/favorite-mirror-hero.jpg" width="1080" height="1350" alt="Михаил и невеста в любимом зеркальном кадре" />
          </picture>
          <figcaption>главное совместное путешествие уже в календаре</figcaption>
        </figure>
        <p className="date-mark" aria-label={couple.date}>{couple.shortDate}</p>
        <a className="scroll-cue" href="#invite" aria-label="Прокрутить к приглашению">
          <span />
        </a>
      </section>

      <section className="invite section" id="invite">
        <p className="section-kicker">Без лишней помпы</p>
        <h2>Хотим провести этот день рядом с теми, кто нам правда дорог.</h2>
        <p>
          Мы решили пожениться. Будем рады, если вы присоединитесь: спокойно, красиво, по‑семейному и с нормальной компанией за одним столом.
        </p>
        <div className="marquee" aria-hidden="true">
          <span>алуштинский воздух · крымский свет · подписи · стол · всё официально ·</span>
        </div>
      </section>

      <section className="events section" id="events">
        <div className="section-heading">
          <p className="section-kicker">Два важных адреса</p>
          <h2>Всё предельно просто</h2>
          <p>Сначала ставим подписи, потом собираемся за одним столом. Сложный сценарий оставим сериалам.</p>
        </div>
        <div className="event-grid">
          {events.map((item) => (
            <article className="event-card" key={item.title}>
              <p>{item.title}</p>
              <strong>{item.time}</strong>
              <span>{item.address}</span>
              <a className="map-link" href={item.mapUrl} target="_blank" rel="noreferrer">Открыть на карте</a>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery section" aria-labelledby="gallery-title">
        <div className="section-heading">
          <p className="section-kicker">Немного нашей географии</p>
          <h2 id="gallery-title">Море отдельно, мы отдельно, но всё как-то связано</h2>
        </div>
        <div className="gallery-track">
          {gallery.map((item) => (
            <figure className={`gallery-card ${item.className}`} key={item.src}>
              <picture>
                <source srcSet={item.src} type="image/webp" />
                <img src={item.fallback} alt={item.alt} width="1200" height="1500" loading="lazy" />
              </picture>
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="rsvp section" id="rsvp">
        <div className="section-heading">
          <p className="section-kicker">RSVP</p>
          <h2>Ответьте, пожалуйста, без дипломатии</h2>
          <p>Нам нужно понять, кого ждать. Форма короткая: бюрократия сегодня отдыхает.</p>
        </div>

        {status === "success" ? (
          <div className="success-panel" role="status">
            <span aria-hidden="true">✓</span>
            <h3>{form.attendance === "no" ? "Спасибо, что сообщили." : "Ответ принят."}</h3>
            <p>
              {form.attendance === "no"
                ? "Будем мысленно держать для вас место рядом."
                : "Теперь всё официально — ждём вас!"}
            </p>
            <button className="button ghost" type="button" onClick={resetAnswer}>Изменить ответ</button>
          </div>
        ) : (
          <form className="rsvp-form" onSubmit={submitForm} noValidate>
            <div className="field">
              <label htmlFor="guestName">Имя и фамилия</label>
              <input
                id="guestName"
                name="guest_name"
                value={form.guestName}
                onChange={(event) => updateField("guestName", event.target.value)}
                aria-invalid={Boolean(errors.guestName)}
                aria-describedby={errors.guestName ? "guestName-error" : undefined}
                ref={(node) => {
                  if (errors.guestName && !firstErrorRef.current) firstErrorRef.current = node;
                }}
              />
              {errors.guestName && <small id="guestName-error">{errors.guestName}</small>}
            </div>

            <ChoiceGroup
              title="Получится ли прийти?"
              name="attendance"
              value={form.attendance}
              error={errors.attendance}
              options={[
                ["yes", "Да, буду"],
                ["no", "К сожалению, не смогу"],
              ]}
              onChange={(value) => updateField("attendance", value as FormState["attendance"])}
            />

            {isComing && (
              <div className="conditional-fields">
                <ChoiceGroup
                  title="Будете ли на росписи в 10:15?"
                  name="ceremony"
                  value={form.ceremony}
                  error={errors.ceremony}
                  options={[["yes", "Да"], ["no", "Нет"]]}
                  onChange={(value) => updateField("ceremony", value as FormState["ceremony"])}
                />
                <ChoiceGroup
                  title="Будете ли на банкете с 13:00?"
                  name="banquet"
                  value={form.banquet}
                  error={errors.banquet}
                  options={[["yes", "Да"], ["no", "Нет"]]}
                  onChange={(value) => updateField("banquet", value as FormState["banquet"])}
                />
                <ChoiceGroup
                  title="Сколько вас будет?"
                  name="guestCount"
                  value={form.guestCount}
                  error={errors.guestCount}
                  options={[["1", "1"], ["2", "2"], ["other", "Другое"]]}
                  onChange={(value) => updateField("guestCount", value as FormState["guestCount"])}
                />
                {form.guestCount === "other" && (
                  <div className="field compact">
                    <label htmlFor="otherCount">Другое количество</label>
                    <input
                      id="otherCount"
                      inputMode="numeric"
                      value={form.otherCount}
                      onChange={(event) => updateField("otherCount", event.target.value)}
                      aria-invalid={Boolean(errors.otherCount)}
                      aria-describedby={errors.otherCount ? "otherCount-error" : undefined}
                    />
                    {errors.otherCount && <small id="otherCount-error">{errors.otherCount}</small>}
                  </div>
                )}
                {isBanquet && (
                  <div className="field">
                    <label htmlFor="stayUntil">До скольких примерно планируете остаться?</label>
                    <input id="stayUntil" value={form.stayUntil} onChange={(event) => updateField("stayUntil", event.target.value)} />
                  </div>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="comment">Что нам ещё стоит знать?</label>
              <textarea
                id="comment"
                rows={4}
                value={form.comment}
                onChange={(event) => updateField("comment", event.target.value)}
                aria-invalid={Boolean(errors.comment)}
                aria-describedby={errors.comment ? "comment-error" : undefined}
              />
              {errors.comment && <small id="comment-error">{errors.comment}</small>}
            </div>

            <input
              className="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              aria-hidden="true"
            />
            {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
            <button className="button primary submit" type="submit" disabled={status === "submitting" || status === "validating"}>
              {buttonText}
            </button>
          </form>
        )}
      </section>

      <footer className="footer">
        <p>{couple.groom} &amp; {couple.bride}</p>
        <span>{couple.date}</span>
        <a href="#top">Наверх</a>
      </footer>
    </main>
  );
}

function ChoiceGroup({
  title,
  name,
  value,
  options,
  error,
  onChange,
}: {
  title: string;
  name: string;
  value: string;
  options: [string, string][];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="choice-group" aria-invalid={Boolean(error)}>
      <legend>{title}</legend>
      <div className="choice-grid">
        {options.map(([optionValue, label]) => (
          <label className={value === optionValue ? "choice selected" : "choice"} key={optionValue}>
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {error && <small>{error}</small>}
    </fieldset>
  );
}
