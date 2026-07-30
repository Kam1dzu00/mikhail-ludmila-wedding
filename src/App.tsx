import { FormEvent, useEffect, useMemo, useState } from "react";
import { weddingConfig } from "./config/weddingConfig";
import "./styles/main.css";

type Status = "idle" | "submitting" | "success" | "error";

type FormState = {
  name: string;
  attendance: "" | "yes" | "no";
  place: "" | "both" | "ceremony" | "banquet";
  count: "" | "1" | "2" | "other";
  otherCount: string;
  comment: string;
  website: string;
};

const initialForm: FormState = {
  name: "",
  attendance: "",
  place: "",
  count: "",
  otherCount: "",
  comment: "",
  website: "",
};

export default function App() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const isComing = form.attendance === "yes";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      delete next.form;
      return next;
    });
  }

  function validate() {
    const next: Record<string, string> = {};
    const number = Number(form.otherCount);
    if (!form.name.trim()) next.name = "Напишите имя и фамилию.";
    if (!form.attendance) next.attendance = "Выберите, придёте ли вы.";
    if (isComing) {
      if (!form.place) next.place = "Выберите, где вас ждать.";
      if (!form.count) next.count = "Укажите количество человек.";
      if (form.count === "other" && (!Number.isInteger(number) || number < 1 || number > 8)) {
        next.otherCount = "Введите число от 1 до 8.";
      }
    }
    if (form.comment.length > 500) next.comment = "Комментарий лучше сделать короче.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    if (form.website) {
      setStatus("success");
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "";
    if (!accessKey) {
      setStatus("error");
      setErrors({ form: "Перед публикацией формы нужно добавить Web3Forms Access Key." });
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Ответ на свадебное приглашение — ${form.name.trim()}`,
          guest_name: form.name.trim(),
          attendance: form.attendance === "yes" ? "Да, буду" : "К сожалению, не смогу",
          attendance_place: isComing ? placeLabel(form.place) : "",
          guest_count: isComing ? (form.count === "other" ? form.otherCount : form.count) : "0",
          comment: form.comment,
          submitted_at: new Date().toISOString(),
          page_url: window.location.href,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("Submit failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrors({ form: "Не получилось отправить. Попробуйте ещё раз." });
    }
  }

  return (
    <main>
      <section className="hero" id="top">
        <div className="heroText">
          <p className="names">{weddingConfig.groomName} и {weddingConfig.brideName}</p>
          <h1>
            {weddingConfig.hero.title}
            <span>{weddingConfig.hero.joke}</span>
          </h1>
          <p>{weddingConfig.hero.subtitle}</p>
          <div className="heroActions">
            <a className="primaryButton" href="#rsvp">Подтвердить присутствие</a>
            <a className="quietButton" href="#where">Где и когда</a>
          </div>
        </div>

        <figure className="photoCard">
          <picture>
            <source srcSet={`${import.meta.env.BASE_URL}images/couple-main-final.webp`} type="image/webp" />
            <img src={`${import.meta.env.BASE_URL}images/couple-main-final.jpg`} width="1400" height="1750" alt="Михаил и Людмила" />
          </picture>
          <figcaption>{weddingConfig.weddingDateLabel}</figcaption>
        </figure>
      </section>

      <section className="countdownSection" aria-labelledby="countdown-title">
        <div>
          <p className="kicker">До мероприятия</p>
          <h2 id="countdown-title">Осталось немного</h2>
        </div>
        <Countdown />
      </section>

      <section className="invite">
        <p>{weddingConfig.invitation}</p>
      </section>

      <section className="where" id="where" aria-labelledby="where-title">
        <p className="kicker">{weddingConfig.eventsIntro}</p>
        <h2 id="where-title">Где и когда</h2>
        <div className="eventGrid">
          <EventCard event={weddingConfig.ceremony} />
          <EventCard event={weddingConfig.banquet} />
        </div>
      </section>

      <section className="rsvp" id="rsvp" aria-labelledby="rsvp-title">
        <p className="kicker">Ответ</p>
        <h2 id="rsvp-title">Ставить стул?</h2>
        <p className="formIntro">{weddingConfig.rsvpIntro}</p>

        {status === "success" ? (
          <div className="result" role="status">
            <strong>{form.attendance === "no" ? "Принято" : "Готово"}</strong>
            <p>{form.attendance === "no" ? weddingConfig.form.successAbsent : weddingConfig.form.successComing}</p>
            <button type="button" className="quietButton" onClick={() => {
              setForm(initialForm);
              setStatus("idle");
              setErrors({});
            }}>
              Изменить ответ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label className="field" htmlFor="name">
              <span>Имя и фамилия</span>
              <input id="name" value={form.name} onChange={(event) => update("name", event.target.value)} aria-invalid={Boolean(errors.name)} />
              {errors.name && <small>{errors.name}</small>}
            </label>

            <ChoiceGroup
              title="Вы придёте?"
              name="attendance"
              value={form.attendance}
              error={errors.attendance}
              options={[["yes", "Да, буду"], ["no", "К сожалению, не смогу"]]}
              onChange={(value) => update("attendance", value as FormState["attendance"])}
            />

            {isComing && (
              <div className="conditional">
                <ChoiceGroup
                  title="Где вас ждать?"
                  name="place"
                  value={form.place}
                  error={errors.place}
                  options={[
                    ["both", "На росписи и банкете"],
                    ["ceremony", "Только на росписи"],
                    ["banquet", "Только на банкете"],
                  ]}
                  onChange={(value) => update("place", value as FormState["place"])}
                />
                <ChoiceGroup
                  title="Сколько человек придёт вместе с вами?"
                  name="count"
                  value={form.count}
                  error={errors.count}
                  options={[["1", "1"], ["2", "2"], ["other", "Другое"]]}
                  onChange={(value) => update("count", value as FormState["count"])}
                />
                {form.count === "other" && (
                  <label className="field compact" htmlFor="otherCount">
                    <span>Количество</span>
                    <input id="otherCount" inputMode="numeric" value={form.otherCount} onChange={(event) => update("otherCount", event.target.value)} aria-invalid={Boolean(errors.otherCount)} />
                    {errors.otherCount && <small>{errors.otherCount}</small>}
                  </label>
                )}
              </div>
            )}

            <label className="field" htmlFor="comment">
              <span>Комментарий, если есть</span>
              <textarea id="comment" rows={4} value={form.comment} onChange={(event) => update("comment", event.target.value)} aria-invalid={Boolean(errors.comment)} />
              {errors.comment && <small>{errors.comment}</small>}
            </label>

            <input className="honeypot" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} aria-hidden="true" />
            {errors.form && <p className="formError" role="alert">{errors.form}</p>}
            <button className="primaryButton submitButton" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Отправляем..." : "Отправить ответ"}
            </button>
          </form>
        )}
      </section>

      <footer>
        <p>{weddingConfig.groomFullName} и {weddingConfig.brideFullName}</p>
        <span>{weddingConfig.weddingDateLabel}</span>
        <a href="#top">Наверх</a>
      </footer>
    </main>
  );
}

function Countdown() {
  const target = useMemo(
    () => new Date(`${weddingConfig.weddingDate}T${weddingConfig.ceremony.time}:00+03:00`).getTime(),
    [],
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return (
    <div className="countdown" aria-label="Отсчёт до мероприятия">
      <TimeBox value={days} label="дней" />
      <TimeBox value={hours} label="часов" />
      <TimeBox value={minutes} label="минут" />
      <TimeBox value={seconds} label="секунд" />
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="timeBox">
      <strong>{String(value).padStart(2, "0")}</strong>
      <span>{label}</span>
    </div>
  );
}

function EventCard({ event }: { event: { title: string; time: string; address: string; mapUrl: string } }) {
  return (
    <article className="eventCard">
      <div>
        <p>{event.title}</p>
        <strong>{event.time}</strong>
      </div>
      <address>{event.address}</address>
      <a href={event.mapUrl} target="_blank" rel="noreferrer">Открыть на карте</a>
    </article>
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
    <fieldset className="choiceGroup">
      <legend>{title}</legend>
      <div className="choices">
        {options.map(([optionValue, label]) => (
          <label className={value === optionValue ? "choice selected" : "choice"} key={optionValue}>
            <input type="radio" name={name} checked={value === optionValue} onChange={() => onChange(optionValue)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {error && <small>{error}</small>}
    </fieldset>
  );
}

function placeLabel(place: FormState["place"]) {
  if (place === "both") return "На росписи и банкете";
  if (place === "ceremony") return "Только на росписи";
  if (place === "banquet") return "Только на банкете";
  return "";
}
