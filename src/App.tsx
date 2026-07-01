import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, ChevronLeft, ChevronRight, Menu, MessageSquare, Pause, Phone, Play, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay, EffectFade, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/a11y";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import "swiper/css/keyboard";
import "swiper/css/navigation";
import "swiper/css/pagination";

gsap.registerPlugin(ScrollTrigger);

const asset = (name: string) => `/assets/site-images/${name}`;

const heroFrames = [
  asset("field-hero-01.webp"),
  asset("field-hero-02.webp"),
  asset("field-hero-03.webp"),
  asset("field-hero-04.webp"),
];

const visualSlides = [
  {
    eyebrow: "Phase 01",
    title: "Site Opens",
    copy: "가림막 너머의 첫 장면부터 기록합니다.",
    image: asset("field-slide-01.webp"),
  },
  {
    eyebrow: "Phase 02",
    title: "Heavy Line",
    copy: "장비 동선과 작업 흐름을 하나의 시퀀스로 엮습니다.",
    image: asset("field-slide-02.webp"),
  },
  {
    eyebrow: "Phase 03",
    title: "Ground Signal",
    copy: "매일 달라지는 현장의 밀도를 시각적으로 확인합니다.",
    image: asset("field-slide-03.webp"),
  },
  {
    eyebrow: "Phase 04",
    title: "Next Layer",
    copy: "다음 공정을 향해 쌓이는 데이터를 정리합니다.",
    image: asset("field-slide-04.webp"),
  },
];

const gallerySlides = [
  {
    title: "안전 동선",
    body: "사람과 장비가 동시에 움직이는 구간을 넓은 프레임으로 점검합니다.",
    image: asset("field-card-01.webp"),
  },
  {
    title: "작업 면",
    body: "해체면, 잔재물, 가설막의 변화를 한눈에 비교합니다.",
    image: asset("field-card-02.webp"),
  },
  {
    title: "장비 흐름",
    body: "장비 암과 붐의 방향성이 만드는 화면 리듬을 확인합니다.",
    image: asset("field-hero-02.webp"),
  },
  {
    title: "현장 기록",
    body: "브랜드형 사이트에서도 실제 진행 상황이 선명하게 읽히도록 구성합니다.",
    image: asset("field-hero-03.webp"),
  },
];

const blanzCards = [
  {
    letter: "B",
    title: "Bold",
    body: "구조의 첫 장면",
    image: asset("field-hero-01.webp"),
  },
  {
    letter: "L",
    title: "Layered",
    body: "공정이 겹치는 순간",
    image: asset("field-slide-02.webp"),
  },
  {
    letter: "A",
    title: "Authentic",
    body: "본질의 기록",
    image: asset("field-slide-04.webp"),
  },
  {
    letter: "N",
    title: "Narrative",
    body: "장면이 이어지는 흐름",
    image: asset("field-card-01.webp"),
  },
  {
    letter: "Z",
    title: "Zenith",
    body: "다음 단계의 정점",
    image: asset("field-hero-04.webp"),
  },
];

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function IntroOverlay({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const [isVisible, setIsVisible] = useState(!prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(false);
      return;
    }

    document.body.classList.toggle("intro-locked", isVisible);
    const timer = window.setTimeout(() => setIsVisible(false), 4200);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("intro-locked");
    };
  }, [isVisible, prefersReducedMotion]);

  useEffect(() => {
    if (!isVisible) {
      document.body.classList.remove("intro-locked");
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="intro" role="dialog" aria-modal="true" aria-label="현장 기록 인트로">
      <button className="intro__skip" type="button" onClick={() => setIsVisible(false)}>
        SKIP
      </button>
      <div className="intro__brand">FIELD MOTION</div>
      <div className="intro__figure intro__figure--one" />
      <div className="intro__figure intro__figure--two" />
      <div className="intro__figure intro__figure--three" />
      <div className="intro__words" aria-hidden="true">
        {["FROM", "GROUND", "TO", "SIGNAL"].map((word, index) => (
          <span key={word} style={{ "--delay": `${index * 0.18}s` } as React.CSSProperties}>
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="site-header__brand" href="#top" aria-label="Field Motion Lab">
        FIELD<span>LAB</span>
      </a>
      <nav className={open ? "site-header__nav is-open" : "site-header__nav"} aria-label="주요 메뉴">
        <a href="#visual" onClick={() => setOpen(false)}>
          Visual
        </a>
        <a href="#expand" onClick={() => setOpen(false)}>
          Expand
        </a>
        <a href="#story" onClick={() => setOpen(false)}>
          Story
        </a>
        <a href="#gallery" onClick={() => setOpen(false)}>
          Field
        </a>
        <a href="#contact" onClick={() => setOpen(false)}>
          Contact
        </a>
      </nav>
      <button className="icon-button site-header__menu" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="메뉴 열기">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}

function HeroSequence() {
  return (
    <section className="hero" id="top" aria-label="현장 메인 비주얼">
      <div className="hero__media" aria-hidden="true">
        {heroFrames.map((image, index) => (
          <img
            key={image}
            className="hero__frame"
            src={image}
            alt=""
            loading="eager"
            style={{ "--frame-index": index } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="hero__shade" />
      <div className="hero__content">
        <p className="eyebrow">Redevelopment Field Archive</p>
        <h1>
          FIELD
          <span>MOTION</span>
        </h1>
        <p>
          현장의 실제 장면 위에 브랜드형 슬라이드, 스크롤 리빌, 고정 CTA 모션을 결합한
          테스트 프로토타입입니다.
        </p>
        <a className="hero__link" href="#visual">
          시퀀스 보기
        </a>
      </div>
      <div className="hero__ticker" aria-hidden="true">
        <span>SCROLL</span>
      </div>
    </section>
  );
}

function VisualSlider({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [paused, setPaused] = useState(prefersReducedMotion);

  useEffect(() => {
    setPaused(prefersReducedMotion);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) {
      return;
    }
    if (paused) {
      swiper.autoplay.stop();
    } else {
      swiper.autoplay.start();
    }
  }, [paused]);

  const paginationLabels = useMemo(() => visualSlides.map((slide) => `${slide.eyebrow} ${slide.title}`), []);

  return (
    <section className="visual-section" id="visual">
      <div className="section-heading reveal">
        <p className="eyebrow">Main Visual</p>
        <h2>Fine Tuned Field Space</h2>
      </div>
      <div className="visual-slider" data-paused={paused}>
        <Swiper
          modules={[A11y, Autoplay, EffectFade, Keyboard, Navigation, Pagination]}
          effect="fade"
          loop
          speed={700}
          keyboard={{ enabled: true }}
          autoplay={
            prefersReducedMotion
              ? false
              : {
                  delay: 4200,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
          }
          navigation={{
            prevEl: ".visual-slider .slider-prev",
            nextEl: ".visual-slider .slider-next",
          }}
          pagination={{
            el: ".visual-slider .slider-pagination",
            clickable: true,
            renderBullet: (index, className) =>
              `<button class="${className}" type="button" aria-label="${paginationLabels[index]}"><span class="rail"><span></span></span><strong>${visualSlides[index].eyebrow}</strong><em>${visualSlides[index].title}</em></button>`,
          }}
          a11y={{
            prevSlideMessage: "이전 슬라이드",
            nextSlideMessage: "다음 슬라이드",
            firstSlideMessage: "첫 번째 슬라이드",
            lastSlideMessage: "마지막 슬라이드",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (prefersReducedMotion) {
              swiper.autoplay?.stop();
            }
          }}
        >
          {visualSlides.map((slide, index) => (
            <SwiperSlide key={slide.title}>
              <article className="visual-slide">
                <img src={slide.image} alt={`${slide.title} 현장 이미지`} loading={index === 0 ? "eager" : "lazy"} />
                <div className="visual-slide__shade" />
                <div className="visual-slide__copy">
                  <p>{slide.eyebrow}</p>
                  <h3>{slide.title}</h3>
                  <span>{slide.copy}</span>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="slider-controls">
          <button className="icon-button slider-prev" type="button" aria-label="이전 슬라이드">
            <ChevronLeft size={20} />
          </button>
          <button className="icon-button slider-next" type="button" aria-label="다음 슬라이드">
            <ChevronRight size={20} />
          </button>
          <button className="icon-button" type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "슬라이드 재생" : "슬라이드 정지"}>
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
        <div className="slider-pagination" />
      </div>
    </section>
  );
}

function BlanzScrollExpansion({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const maxMotionProgressRef = useRef(0);
  const lastRawProgressRef = useRef(0);
  const scrollDirectionRef = useRef(1);

  useEffect(() => {
    const section = sectionRef.current;
    const isCompactViewport = window.matchMedia("(max-width: 820px)").matches;
    if (!section || prefersReducedMotion || isCompactViewport) {
      if (section) {
        maxMotionProgressRef.current = 1;
        section.classList.add("is-complete");
        section.style.setProperty("--scroll-progress", "100");
        section.style.setProperty("--caption-y", "0%");
        section.querySelectorAll<HTMLElement>(".blanz-card").forEach((card) => {
          card.style.setProperty("--card-progress", "1");
          card.style.setProperty("--active-progress", "0");
          card.style.setProperty("--card-opacity", "1");
          card.style.setProperty("--card-y", "0px");
          card.style.setProperty("--card-scale", "1");
          card.style.setProperty("--cover-x", "102%");
          card.style.setProperty("--image-scale", "1.05");
          card.style.setProperty("--image-saturate", "1");
          card.style.setProperty("--image-contrast", "1");
          card.style.setProperty("--shade-a", "0.22");
          card.style.setProperty("--letter-scale", "1");
          card.style.setProperty("--letter-opacity", "1");
          card.style.setProperty("--copy-opacity", "0");
          card.style.setProperty("--copy-y", "16px");
        });
      }
      if (progressRef.current) {
        progressRef.current.textContent = "100";
      }
      return;
    }

    const cards = Array.from(section.querySelectorAll<HTMLElement>(".blanz-card"));
    const cardCount = Math.max(cards.length - 1, 1);

    const smoothstep = (value: number) => value * value * (3 - 2 * value);

    const setProgress = (requestedProgress: number, rawProgress = 0, scrollDirection = 1) => {
      const lockedProgress = Math.max(maxMotionProgressRef.current, requestedProgress);
      maxMotionProgressRef.current = lockedProgress;
      const rawDelta = rawProgress - lastRawProgressRef.current;
      if (Math.abs(rawDelta) > 0.001) {
        scrollDirectionRef.current = rawDelta > 0 ? 1 : -1;
      } else if (scrollDirection !== 0) {
        scrollDirectionRef.current = scrollDirection > 0 ? 1 : -1;
      }
      lastRawProgressRef.current = rawProgress;
      const percent = Math.round(lockedProgress * 100);
      section.classList.toggle("is-complete", lockedProgress >= 0.995);
      section.style.setProperty("--scroll-progress", String(percent));
      const captionProgress = gsap.utils.clamp(0, 1, (lockedProgress - 0.32) / 0.28);
      section.style.setProperty("--caption-y", `${(1 - captionProgress) * 110}%`);
      if (progressRef.current) {
        progressRef.current.textContent = String(percent).padStart(2, "0");
      }

      const centerStart = 0.64;
      const centerEnd = 0.86;
      const aboveCenterProgress = gsap.utils.clamp(0, 1, (centerStart - rawProgress) / 0.22);
      const belowCenterProgress = gsap.utils.clamp(0, 1, (rawProgress - centerEnd) / 0.14);
      const positionProgress = smoothstep(Math.max(aboveCenterProgress, belowCenterProgress));
      const staggerReady = smoothstep(gsap.utils.clamp(0, 1, (lockedProgress - 0.9) / 0.1));
      const directionSign = scrollDirectionRef.current;

      cards.forEach((card, index) => {
        const revealStart = 0.08 + index * 0.055;
        const revealProgress = gsap.utils.clamp(0, 1, (lockedProgress - revealStart) / 0.28);
        const staggerDirection = index % 2 === 0 ? -1 : 1;
        const staggerOffset = staggerDirection * directionSign * positionProgress * staggerReady * 36;
        const activeCenter = 0.42 + (index / cardCount) * 0.33;
        const activeProgress = gsap.utils.clamp(0, 1, 1 - Math.abs(lockedProgress - activeCenter) / 0.16);
        card.style.setProperty("--card-progress", revealProgress.toFixed(3));
        card.style.setProperty("--active-progress", activeProgress.toFixed(3));
        card.style.setProperty("--card-opacity", (0.18 + revealProgress * 0.82).toFixed(3));
        card.style.setProperty("--card-y", `${(1 - revealProgress) * 36 + staggerOffset}px`);
        card.style.setProperty("--card-scale", (1 + activeProgress * 0.045).toFixed(3));
        card.style.setProperty("--cover-x", `${revealProgress * 102}%`);
        card.style.setProperty("--image-scale", (1.13 - revealProgress * 0.08 + activeProgress * 0.1).toFixed(3));
        card.style.setProperty("--image-saturate", (0.72 + activeProgress * 0.38).toFixed(3));
        card.style.setProperty("--image-contrast", (0.94 + activeProgress * 0.12).toFixed(3));
        card.style.setProperty("--shade-a", (0.18 + activeProgress * 0.18).toFixed(3));
        card.style.setProperty("--letter-scale", (1 - activeProgress * 0.18).toFixed(3));
        card.style.setProperty("--letter-opacity", (1 - activeProgress * 0.1).toFixed(3));
        card.style.setProperty("--copy-opacity", "0");
        card.style.setProperty("--copy-y", "16px");
        card.classList.toggle("is-active", activeProgress > 0.62);
      });
    };

    setProgress(0);

    const context = gsap.context(() => {
      const getStartOffset = () => {
        const header = document.querySelector<HTMLElement>(".site-header");
        return (header?.offsetHeight ?? 0) + 36;
      };

      const getMotionProgress = (rawProgress: number) => gsap.utils.clamp(0, 1, rawProgress / 0.72);

      ScrollTrigger.create({
        trigger: ".blanz-scroll__pin",
        start: () => `top top+=${getStartOffset()}`,
        end: "+=190%",
        pin: ".blanz-scroll__pin",
        scrub: 0.8,
        snap: {
          snapTo: (value) => (value >= 0.68 && value <= 0.86 ? 0.78 : value),
          duration: { min: 0.18, max: 0.34 },
          delay: 0.04,
          ease: "power2.out",
        },
        invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(getMotionProgress(self.progress), self.progress, self.direction),
        onLeave: (self) => setProgress(1, 1, self.direction),
        onEnterBack: (self) => setProgress(getMotionProgress(self.progress), self.progress, self.direction),
        onLeaveBack: (self) => setProgress(maxMotionProgressRef.current, 0, self.direction),
      });
    }, section);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section className="blanz-scroll" ref={sectionRef} style={{ "--scroll-progress": 0 } as React.CSSProperties}>
      <div className="blanz-scroll__stage">
        <div className="blanz-scroll__header">
          <p className="eyebrow">Scroll Percent Expansion</p>
          <h2>BLANZ field sequence</h2>
          <div className="blanz-progress" aria-label="스크롤 진행률">
            <span ref={progressRef}>00</span>
            <em>%</em>
          </div>
        </div>
        <div className="blanz-scroll__pin" id="expand">
        <div className="blanz-scroll__ghost" aria-hidden="true">
          BLANZ
        </div>
        <div className="blanz-card-grid" aria-label="BLANZ 현장 카드">
          {blanzCards.map((card, index) => (
            <article
              className="blanz-card"
              key={card.letter}
              tabIndex={0}
              aria-label={`${card.title}, ${card.body}`}
              style={{ "--card-index": index } as React.CSSProperties}
            >
              <img src={card.image} alt={`${card.title} 현장 이미지`} loading="eager" />
              <div className="blanz-card__shade" />
              <div className="blanz-card__copy" aria-hidden="true">
                <strong className="blanz-card__initial">{card.letter}</strong>
                <p className="blanz-card__word">
                  <span className="blanz-card__lead">{card.letter}</span>
                  <span className="blanz-card__tail">{card.title.slice(1)}</span>
                </p>
                <em className="blanz-card__body">
                  <span>{card.body}</span>
                </em>
              </div>
            </article>
          ))}
        </div>
        <div className="blanz-scroll__caption">
          <p>BRINGING THE MOST PRECISE MOMENTS OF A MOVING FIELD</p>
          <p>WITH THE MOST HONEST PRESENCE OF CONSTRUCTION IN THIS ERA</p>
        </div>
        </div>
      </div>
    </section>
  );
}

function ScrollStory({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const storyRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion || !storyRef.current) {
      return;
    }

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".story-panel").forEach((panel) => {
        const image = panel.querySelector<HTMLElement>(".story-panel__crop img");
        const copy = panel.querySelector(".story-panel__copy");
        if (image) {
          gsap.fromTo(
            image,
            { x: 0, y: 0 },
            {
              x: 0,
              y: -160,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top 82%",
                end: "bottom 18%",
                scrub: 1,
              },
            },
          );
        }
        gsap.fromTo(
          copy,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 70%",
              once: true,
            },
          },
        );
      });
    }, storyRef);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section className="story-section" id="story" ref={storyRef}>
      <div className="story-panel">
        <div className="story-panel__copy">
          <p className="eyebrow">Scroll Story</p>
          <h2>기록은 장면이 되고, 장면은 다음 공정이 됩니다.</h2>
          <p>
            넓은 현장 컷과 짧은 문장을 엮어 브랜드형 랜딩의 스크롤 리듬을 재현했습니다.
          </p>
        </div>
        <figure className="story-panel__media">
          <div className="story-panel__crop">
          <img src={asset("field-hero-01.webp")} alt="해체 작업이 진행 중인 현장 전경" loading="lazy" />
          </div>
        </figure>
      </div>
      <div className="story-panel story-panel--reverse">
        <div className="story-panel__copy">
          <p className="eyebrow">Motion Layer</p>
          <h2>텍스트는 늦게, 이미지는 길게 움직입니다.</h2>
          <p>
            스크롤 중에는 이미지가 천천히 이동하고 문장은 진입 지점에서 한 번만 나타납니다.
          </p>
        </div>
        <figure className="story-panel__media">
          <div className="story-panel__crop">
          <img src={asset("field-hero-04.webp")} alt="장비와 가림막이 보이는 현장" loading="lazy" />
          </div>
        </figure>
      </div>
    </section>
  );
}

function FieldGallery({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [paused, setPaused] = useState(prefersReducedMotion);

  useEffect(() => {
    setPaused(prefersReducedMotion);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) {
      return;
    }
    if (paused) {
      swiper.autoplay.stop();
    } else {
      swiper.autoplay.start();
    }
  }, [paused]);

  return (
    <section className="gallery-section" id="gallery">
      <div className="section-heading reveal">
        <p className="eyebrow">Field Cards</p>
        <h2>Every frame has a job.</h2>
      </div>
      <div className="gallery-shell" data-paused={paused}>
        <Swiper
          modules={[A11y, Autoplay, Keyboard, Navigation, Pagination]}
          slidesPerView={1.08}
          spaceBetween={16}
          speed={600}
          keyboard={{ enabled: true }}
          autoplay={
            prefersReducedMotion
              ? false
              : {
                  delay: 3800,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
          }
          navigation={{
            prevEl: ".gallery-shell .gallery-prev",
            nextEl: ".gallery-shell .gallery-next",
          }}
          pagination={{ el: ".gallery-shell .gallery-pagination", clickable: true }}
          breakpoints={{
            760: { slidesPerView: 2.05, spaceBetween: 20 },
            1180: { slidesPerView: 3.05, spaceBetween: 24 },
          }}
          a11y={{
            prevSlideMessage: "이전 현장 카드",
            nextSlideMessage: "다음 현장 카드",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (prefersReducedMotion) {
              swiper.autoplay?.stop();
            }
          }}
        >
          {gallerySlides.map((slide) => (
            <SwiperSlide key={slide.title}>
              <article className="field-card">
                <img src={slide.image} alt={`${slide.title} 이미지`} loading="lazy" />
                <div>
                  <h3>{slide.title}</h3>
                  <p>{slide.body}</p>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="gallery-controls">
          <button className="icon-button gallery-prev" type="button" aria-label="이전 현장 카드">
            <ChevronLeft size={20} />
          </button>
          <button className="icon-button gallery-next" type="button" aria-label="다음 현장 카드">
            <ChevronRight size={20} />
          </button>
          <button className="icon-button" type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "카드 자동 넘김 재생" : "카드 자동 넘김 정지"}>
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
        <div className="gallery-pagination" />
      </div>
    </section>
  );
}

function FixedCTA() {
  return (
    <aside className="fixed-cta" id="contact" aria-label="상담 바로가기">
      <a href="tel:0212345678" aria-label="전화 상담">
        <Phone size={20} />
        <span>전화상담</span>
      </a>
      <a href="mailto:field@example.com" aria-label="간편 문의">
        <MessageSquare size={20} />
        <span>간편문의</span>
      </a>
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="상단으로 이동">
        <ArrowUp size={20} />
        <span>TOP</span>
      </button>
    </aside>
  );
}

function RevealObserver() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
      <RevealObserver />
      <IntroOverlay prefersReducedMotion={prefersReducedMotion} />
      <SiteHeader />
      <main>
        <HeroSequence />
        <VisualSlider prefersReducedMotion={prefersReducedMotion} />
        <BlanzScrollExpansion prefersReducedMotion={prefersReducedMotion} />
        <ScrollStory prefersReducedMotion={prefersReducedMotion} />
        <FieldGallery prefersReducedMotion={prefersReducedMotion} />
        <section className="closing-section">
          <p className="eyebrow">Field Motion Lab</p>
          <h2>현장 이미지는 선명하게, 움직임은 필요한 만큼만.</h2>
          <p>
            실제 공정 이미지를 기반으로 고급 주거형 랜딩의 핵심 모션 패턴을 한 페이지에서
            검증할 수 있도록 구성했습니다.
          </p>
        </section>
      </main>
      <FixedCTA />
    </>
  );
}
