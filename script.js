const target=new Date("2026-08-08T10:15:00+03:00");
function tick(){
  const now=new Date(),diff=target-now,msg=document.getElementById("countdownMessage");
  if(diff<=0){
    ["days","hours","minutes","seconds"].forEach(id=>document.getElementById(id).textContent="00");
    msg.textContent=now.toDateString()===target.toDateString()?"Сегодня тот самый день!":"Это было 08.08.2026 — и, кажется, всё прошло по плану.";
    return;
  }
  const values=[Math.floor(diff/86400000),Math.floor(diff/3600000%24),Math.floor(diff/60000%60),Math.floor(diff/1000%60)];
  ["days","hours","minutes","seconds"].forEach((id,i)=>document.getElementById(id).textContent=String(values[i]).padStart(2,"0"));
}
tick();setInterval(tick,1000);

const bar=document.querySelector(".progress span");
addEventListener("scroll",()=>{
  const max=document.documentElement.scrollHeight-innerHeight;
  bar.style.width=(max?scrollY/max*100:0)+"%";
},{passive:true});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}
  });
},{threshold:.12});
document.querySelectorAll(".reveal-scroll").forEach(el=>observer.observe(el));

const form=document.getElementById("rsvpForm"),details=document.getElementById("details"),status=document.getElementById("status");
form.addEventListener("change",e=>{
  if(e.target.name==="attendance"){
    const yes=e.target.value==="Да, буду";
    details.classList.toggle("show",yes);
    details.querySelectorAll('input[name="events"]').forEach(i=>i.required=yes);
  }
});
form.addEventListener("submit",async e=>{
  e.preventDefault();
  const button=form.querySelector('button[type="submit"]');
  const data=new FormData(form);
  const payload={
    _subject:`Свадьба 08.08.2026 — ответ от ${data.get("name")||"гостя"}`,
    _template:"table",
    _url:"https://kam1dzu00.github.io/mikhail-ludmila-wedding/",
    "Имя и фамилия":data.get("name")||"",
    "Получится ли прийти":data.get("attendance")||"",
    "Мероприятия":data.get("events")||"—",
    "Количество гостей":data.get("count")||"—",
    "Комментарий":data.get("comment")||"—",
    _honey:data.get("_honey")||""
  };

  button.disabled=true;
  button.textContent="Отправляем…";
  status.className="status";
  status.textContent="Сохраняем ваш ответ.";

  try{
    const response=await fetch(form.action,{
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify(payload)
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result.success===false) throw new Error(result.message||"Не удалось отправить ответ");

    localStorage.setItem("wedding-rsvp",JSON.stringify({...payload,savedAt:new Date().toISOString()}));
    status.className="status success";
    status.textContent=data.get("attendance")==="Да, буду"
      ?"Готово! Стул за вами закреплён."
      :"Спасибо, что предупредили. Ответ отправлен.";
    form.reset();
    details.classList.remove("show");
  }catch(error){
    status.className="status error";
    status.textContent="Не получилось отправить. Проверьте интернет и попробуйте ещё раз.";
  }finally{
    button.disabled=false;
    button.textContent="Отправить ответ";
  }
});

const hasFinePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if(hasFinePointer && !prefersReducedMotion){
  const hero = document.querySelector(".hero");
  const photo = document.querySelector(".hero-photo");
  const shapeOne = document.querySelector(".shape-one");
  const shapeTwo = document.querySelector(".shape-two");
  const ringOne = document.querySelector(".ring-one");
  const ringTwo = document.querySelector(".ring-two");

  hero?.addEventListener("pointermove", event=>{
    const x = event.clientX / innerWidth - .5;
    const y = event.clientY / innerHeight - .5;

    if(photo) photo.style.translate = `${x * 8}px ${y * 6}px`;
    if(shapeOne) shapeOne.style.translate = `${x * -20}px ${y * -14}px`;
    if(shapeTwo) shapeTwo.style.translate = `${x * 16}px ${y * 11}px`;
    if(ringOne) ringOne.style.translate = `${x * -12}px ${y * 10}px`;
    if(ringTwo) ringTwo.style.translate = `${x * 10}px ${y * -8}px`;
  });

  hero?.addEventListener("pointerleave", ()=>{
    [photo, shapeOne, shapeTwo, ringOne, ringTwo].forEach(el=>{
      if(el) el.style.translate = "0 0";
    });
  });

  document.querySelectorAll(".button,.nav-button").forEach(button=>{
    button.addEventListener("pointermove", event=>{
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * .08}px, ${y * .08}px)`;
    });

    button.addEventListener("pointerleave", ()=>{
      button.style.transform = "";
    });
  });

  document.querySelectorAll(".photo-tile,.warm-grid figure").forEach(card=>{
    card.addEventListener("pointermove", event=>{
      const rect = card.getBoundingClientRect();
      const rotateX = ((event.clientY - rect.top) / rect.height - .5) * -3;
      const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 3;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("pointerleave", ()=>{
      card.style.transform = "";
    });
  });
}
