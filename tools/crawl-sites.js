const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const playwrightPath = path.join(
  os.tmpdir(),
  "codex-site-crawl-playwright",
  "node_modules",
  "playwright"
);
const { chromium, devices } = require(playwrightPath);

const workspace = process.cwd();
const outDir = path.join(workspace, "crawl-output");
const screenshotDir = path.join(outDir, "screenshots");
fs.mkdirSync(screenshotDir, { recursive: true });

const sites = [
  { id: "apgujeong-h", url: "https://apgujeong-h.co.kr/district2/main/index" },
  { id: "theblanz", url: "https://theblanz.co.kr/" },
  { id: "ssyapt", url: "https://www.ssyapt.com/" },
  { id: "mokheon", url: "https://xn--w52bzji9aba940l3iu.com/" },
  { id: "ipark", url: "https://www.i-park.com/" },
];

const libPatterns = [
  ["swiper", /swiper/i],
  ["slick", /slick/i],
  ["splide", /splide/i],
  ["owl-carousel", /owl\.carousel|owl-carousel/i],
  ["gsap", /gsap|TweenMax|TweenLite|ScrollTrigger/i],
  ["aos", /\bAOS\b|aos\./i],
  ["lottie", /lottie|dotlottie|bodymovin/i],
  ["fullpage", /fullpage/i],
  ["scrollmagic", /ScrollMagic/i],
  ["locomotive", /locomotive-scroll/i],
  ["lenis", /\blenis\b/i],
  ["animejs", /anime(\.min)?\.js|anime\(/i],
  ["wowjs", /wow(\.min)?\.js|\bWOW\b/i],
  ["three", /three(\.min)?\.js|\bTHREE\b/i],
  ["jQuery", /jquery/i],
];

const controlTextRegex = new RegExp(
  [
    "prev",
    "next",
    "previous",
    "skip",
    "scroll",
    "play",
    "pause",
    "stop",
    "\\uC774\\uC804", // previous
    "\\uB2E4\\uC74C", // next
    "\\uB118\\uAE30",
    "\\uC2A4\\uD0B5",
    "\\uC7AC\\uC0DD",
    "\\uC815\\uC9C0",
    "\\uBA48\\uCDA4",
    "\\uB2EB\\uAE30",
    "\\uBA54\\uB274",
  ].join("|"),
  "i"
);

const sliderRegex = /swiper|slick|splide|owl|carousel|slider|slide|visual|banner|intro|mainVisual|kv|gallery/i;
const motionRegex = /animate|animation|transition|transform|fade|reveal|motion|parallax|scroll|intro|keyframe/i;

function trimText(value, max = 160) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function hash(value) {
  return crypto.createHash("sha1").update(String(value)).digest("hex").slice(0, 10);
}

async function safeGoto(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch (err) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  }
  await page.waitForTimeout(2500);
}

async function fetchText(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    const text = await res.text();
    return { ok: res.ok, status: res.status, url: res.url, text };
  } catch (err) {
    return { ok: false, status: 0, url, error: err.message, text: "" };
  } finally {
    clearTimeout(timer);
  }
}

async function collectStaticResourceHints(page) {
  const resources = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => ({
      name: entry.name,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize || 0,
      duration: Math.round(entry.duration || 0),
    }))
  );

  const scriptAndStyleUrls = resources
    .filter((entry) => /script|link|css/i.test(entry.initiatorType) || /\.(js|css)(\?|$)/i.test(entry.name))
    .map((entry) => entry.name)
    .filter(Boolean);

  const fetched = [];
  for (const url of scriptAndStyleUrls.slice(0, 80)) {
    const result = await fetchText(url);
    if (result.text) {
      fetched.push({
        url: result.url || url,
        status: result.status,
        length: result.text.length,
        sampleHash: hash(result.text),
        libMatches: libPatterns.filter(([, rx]) => rx.test(result.text)).map(([name]) => name),
        keyframes: (result.text.match(/@keyframes\s+[-_a-z0-9]+/gi) || []).slice(0, 40),
        animationTokens: (result.text.match(/[-_a-z0-9]*(?:fade|slide|intro|reveal|parallax|motion|scroll|swiper|slick|splide)[-_a-z0-9]*/gi) || [])
          .slice(0, 120),
      });
    }
  }

  return { resources, fetched };
}

async function collectDom(page) {
  return page.evaluate(({ controlTextSource, sliderSource, motionSource }) => {
    const controlRx = new RegExp(controlTextSource, "i");
    const sliderRx = new RegExp(sliderSource, "i");
    const motionRx = new RegExp(motionSource, "i");

    const getBox = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        visible:
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth,
      };
    };

    const short = (value, max = 160) => String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
    const all = Array.from(document.querySelectorAll("*"));
    const html = document.documentElement.outerHTML;
    const title = document.title;
    const bodyText = short(document.body?.innerText || "", 1200);

    const globals = {
      Swiper: !!window.Swiper,
      gsap: !!window.gsap,
      ScrollTrigger: !!window.ScrollTrigger || !!window.gsap?.plugins?.ScrollTrigger,
      Splide: !!window.Splide,
      AOS: !!window.AOS,
      lottie: !!window.lottie || !!window.bodymovin,
      jQuery: !!window.jQuery,
      slick: !!window.jQuery?.fn?.slick,
      fullpage: !!window.fullpage_api,
      Lenis: !!window.Lenis,
      ScrollMagic: !!window.ScrollMagic,
      THREE: !!window.THREE,
    };

    const scripts = Array.from(document.scripts).map((script) => script.src || short(script.textContent, 120));
    const stylesheets = Array.from(document.querySelectorAll('link[rel*="stylesheet"], link[href$=".css"]')).map((link) => link.href);

    const images = Array.from(document.images).map((img) => ({
      src: img.currentSrc || img.src,
      attrSrc: img.getAttribute("src"),
      alt: img.alt || "",
      loading: img.loading || img.getAttribute("loading") || "",
      fetchPriority: img.fetchPriority || img.getAttribute("fetchpriority") || "",
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      className: img.className || "",
      box: getBox(img),
    }));

    const controls = Array.from(document.querySelectorAll("a, button, [role='button'], input[type='button'], input[type='submit'], .swiper-button-next, .swiper-button-prev, .slick-next, .slick-prev"))
      .map((el, index) => ({
        index,
        tag: el.tagName.toLowerCase(),
        text: short(el.innerText || el.value || el.getAttribute("aria-label") || el.title || el.className),
        aria: el.getAttribute("aria-label") || "",
        href: el.href || "",
        className: String(el.className || ""),
        id: el.id || "",
        role: el.getAttribute("role") || "",
        box: getBox(el),
      }))
      .filter((item) => controlRx.test(`${item.text} ${item.aria} ${item.className} ${item.id}`) || /swiper|slick|splide|arrow|btn/i.test(`${item.className} ${item.id}`))
      .slice(0, 100);

    const sliderCandidates = all
      .map((el, index) => {
        const className = String(el.className || "");
        const id = el.id || "";
        const label = el.getAttribute("aria-label") || "";
        const text = short(el.innerText || "", 180);
        return {
          index,
          tag: el.tagName.toLowerCase(),
          id,
          className,
          role: el.getAttribute("role") || "",
          aria: label,
          text,
          childCount: el.children.length,
          imageCount: el.querySelectorAll("img").length,
          buttonCount: el.querySelectorAll("button, a, [role='button']").length,
          box: getBox(el),
        };
      })
      .filter((item) => sliderRx.test(`${item.id} ${item.className} ${item.role} ${item.aria} ${item.text}`))
      .sort((a, b) => b.imageCount + b.buttonCount - (a.imageCount + a.buttonCount))
      .slice(0, 80);

    const animatedElements = all
      .map((el, index) => {
        const cs = getComputedStyle(el);
        const className = String(el.className || "");
        const id = el.id || "";
        const text = short(el.innerText || "", 120);
        return {
          index,
          tag: el.tagName.toLowerCase(),
          id,
          className,
          text,
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
          transitionProperty: cs.transitionProperty,
          transitionDuration: cs.transitionDuration,
          transform: cs.transform,
          opacity: cs.opacity,
          box: getBox(el),
        };
      })
      .filter((item) =>
        item.animationName !== "none" ||
        item.transitionDuration !== "0s" ||
        item.transform !== "none" ||
        motionRx.test(`${item.id} ${item.className}`)
      )
      .slice(0, 120);

    const libMatchesInHtml = [
      ["swiper", /swiper/i],
      ["slick", /slick/i],
      ["splide", /splide/i],
      ["owl-carousel", /owl\.carousel|owl-carousel/i],
      ["gsap", /gsap|TweenMax|TweenLite|ScrollTrigger/i],
      ["aos", /\bAOS\b|aos\./i],
      ["lottie", /lottie|dotlottie|bodymovin/i],
      ["fullpage", /fullpage/i],
      ["scrollmagic", /ScrollMagic/i],
      ["locomotive", /locomotive-scroll/i],
      ["lenis", /\blenis\b/i],
      ["animejs", /anime(\.min)?\.js|anime\(/i],
      ["wowjs", /wow(\.min)?\.js|\bWOW\b/i],
      ["three", /three(\.min)?\.js|\bTHREE\b/i],
      ["jQuery", /jquery/i],
    ].filter(([, rx]) => rx.test(html)).map(([name]) => name);

    return {
      url: location.href,
      title,
      bodyText,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      document: {
        readyState: document.readyState,
        height: document.documentElement.scrollHeight,
        elementCount: all.length,
      },
      globals,
      scripts,
      stylesheets,
      images,
      controls,
      sliderCandidates,
      animatedElements,
      libMatchesInHtml,
    };
  }, {
    controlTextSource: controlTextRegex.source,
    sliderSource: sliderRegex.source,
    motionSource: motionRegex.source,
  });
}

async function snapshot(page) {
  return page.evaluate(() => {
    const short = (value, max = 120) => String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
    return Array.from(document.querySelectorAll("img, .swiper-slide, .slick-slide, .splide__slide, [class*='slide'], [class*='visual'], [class*='banner'], [class*='intro']"))
      .slice(0, 120)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          className: String(el.className || ""),
          text: short(el.innerText || el.alt || ""),
          src: el.currentSrc || el.src || "",
          transform: getComputedStyle(el).transform,
          opacity: getComputedStyle(el).opacity,
          box: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        };
      });
  });
}

function diffSnapshots(before, after) {
  const a = hash(JSON.stringify(before));
  const b = hash(JSON.stringify(after));
  return {
    changed: a !== b,
    beforeHash: a,
    afterHash: b,
  };
}

async function testAutoplay(page) {
  const before = await snapshot(page);
  await page.waitForTimeout(4200);
  const after = await snapshot(page);
  return diffSnapshots(before, after);
}

async function clickLikelyControls(page, dom) {
  const results = [];
  const controls = dom.controls
    .filter((item) => item.box.visible && /(next|prev|swiper|slick|splide|arrow|\uB2E4\uC74C|\uC774\uC804)/i.test(`${item.text} ${item.aria} ${item.className} ${item.id}`))
    .slice(0, 6);

  for (const control of controls) {
    const before = await snapshot(page);
    try {
      await page.mouse.click(control.box.x + Math.max(4, Math.min(control.box.width / 2, 40)), control.box.y + Math.max(4, Math.min(control.box.height / 2, 24)));
      await page.waitForTimeout(900);
      const after = await snapshot(page);
      results.push({
        control,
        result: diffSnapshots(before, after),
        urlAfterClick: page.url(),
      });
    } catch (err) {
      results.push({ control, error: err.message });
    }
  }
  return results;
}

async function maybeClickSkip(page, dom, id) {
  const skip = dom.controls.find((item) => item.box.visible && /skip|\uC2A4\uD0B5/i.test(`${item.text} ${item.aria} ${item.className} ${item.id}`));
  if (!skip) return null;
  const before = await snapshot(page);
  try {
    await page.mouse.click(skip.box.x + Math.max(4, Math.min(skip.box.width / 2, 40)), skip.box.y + Math.max(4, Math.min(skip.box.height / 2, 24)));
    await page.waitForTimeout(1200);
    const after = await snapshot(page);
    const file = path.join(screenshotDir, `${id}-after-skip.png`);
    await page.screenshot({ path: file, fullPage: false });
    return {
      control: skip,
      result: diffSnapshots(before, after),
      screenshot: file,
    };
  } catch (err) {
    return { control: skip, error: err.message };
  }
}

async function crawlDesktop(browser, site) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
    reducedMotion: "no-preference",
    locale: "ko-KR",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const consoleMessages = [];
  const pageErrors = [];
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) {
      consoleMessages.push({ type: msg.type(), text: trimText(msg.text(), 300) });
    }
  });
  page.on("pageerror", (err) => pageErrors.push(trimText(err.message, 300)));

  await safeGoto(page, site.url);
  const topShot = path.join(screenshotDir, `${site.id}-desktop-top.png`);
  await page.screenshot({ path: topShot, fullPage: false });

  const domInitial = await collectDom(page);
  const skipTest = await maybeClickSkip(page, domInitial, site.id);
  const domAfterSkip = skipTest ? await collectDom(page) : null;

  const autoplay = await testAutoplay(page);
  const clickTests = await clickLikelyControls(page, domAfterSkip || domInitial);

  const scrollShots = [];
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  for (const [name, y] of [
    ["mid", Math.round(scrollHeight * 0.35)],
    ["deep", Math.round(scrollHeight * 0.7)],
  ]) {
    await page.evaluate((targetY) => window.scrollTo({ top: targetY, behavior: "instant" }), y);
    await page.waitForTimeout(1200);
    const file = path.join(screenshotDir, `${site.id}-desktop-${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    scrollShots.push({ name, y, file });
  }

  const resourceHints = await collectStaticResourceHints(page);
  const domFinal = await collectDom(page);
  await context.close();
  return {
    topShot,
    scrollShots,
    domInitial,
    domAfterSkip,
    domFinal,
    skipTest,
    autoplay,
    clickTests,
    resourceHints,
    consoleMessages: consoleMessages.slice(0, 80),
    pageErrors: pageErrors.slice(0, 40),
  };
}

async function crawlMobile(browser, site) {
  const iPhone = devices["iPhone 13"];
  const context = await browser.newContext({
    ...iPhone,
    ignoreHTTPSErrors: true,
    reducedMotion: "no-preference",
    locale: "ko-KR",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await safeGoto(page, site.url);
  const topShot = path.join(screenshotDir, `${site.id}-mobile-top.png`);
  await page.screenshot({ path: topShot, fullPage: false });
  const dom = await collectDom(page);
  await context.close();
  return { topShot, dom };
}

function summarizeResult(site, desktop, mobile) {
  const resourceText = JSON.stringify({
    resources: desktop.resourceHints.resources.map((entry) => entry.name).join("\n"),
    fetched: desktop.resourceHints.fetched,
    scripts: desktop.domInitial.scripts,
    stylesheets: desktop.domInitial.stylesheets,
    htmlLibs: desktop.domInitial.libMatchesInHtml,
    globals: desktop.domInitial.globals,
  });

  const libMatches = new Set();
  for (const [name, rx] of libPatterns) {
    if (rx.test(resourceText)) libMatches.add(name);
  }

  const sliderCandidates = desktop.domInitial.sliderCandidates.slice(0, 12).map((item) => ({
    tag: item.tag,
    id: item.id,
    className: trimText(item.className, 140),
    text: trimText(item.text, 100),
    imageCount: item.imageCount,
    buttonCount: item.buttonCount,
    box: item.box,
  }));

  const controls = desktop.domInitial.controls.slice(0, 30).map((item) => ({
    tag: item.tag,
    text: trimText(item.text, 90),
    aria: trimText(item.aria, 90),
    className: trimText(item.className, 100),
    id: item.id,
    box: item.box,
  }));

  const visibleHeroImages = desktop.domInitial.images
    .filter((img) => img.box.visible)
    .slice(0, 12)
    .map((img) => ({
      src: img.src,
      alt: trimText(img.alt, 80),
      loading: img.loading,
      fetchPriority: img.fetchPriority,
      width: img.width,
      height: img.height,
      className: trimText(img.className, 80),
      box: img.box,
    }));

  const keyframes = [...new Set(desktop.resourceHints.fetched.flatMap((item) => item.keyframes || []))].slice(0, 80);
  const animationTokens = [...new Set(desktop.resourceHints.fetched.flatMap((item) => item.animationTokens || []))].slice(0, 100);

  return {
    id: site.id,
    url: site.url,
    finalUrl: desktop.domInitial.url,
    title: desktop.domInitial.title,
    desktop: {
      document: desktop.domInitial.document,
      screenshots: {
        top: desktop.topShot,
        afterSkip: desktop.skipTest?.screenshot || null,
        scroll: desktop.scrollShots,
      },
      librariesDetected: [...libMatches],
      globals: desktop.domInitial.globals,
      controls,
      sliderCandidates,
      visibleHeroImages,
      animatedElementCount: desktop.domInitial.animatedElements.length,
      sampleAnimatedElements: desktop.domInitial.animatedElements.slice(0, 20).map((item) => ({
        tag: item.tag,
        id: item.id,
        className: trimText(item.className, 120),
        animationName: item.animationName,
        animationDuration: item.animationDuration,
        transitionProperty: trimText(item.transitionProperty, 120),
        transitionDuration: item.transitionDuration,
        transform: trimText(item.transform, 80),
        box: item.box,
      })),
      autoplay: desktop.autoplay,
      skipTest: desktop.skipTest,
      clickTests: desktop.clickTests,
      keyframes,
      animationTokens,
      resourceCounts: {
        total: desktop.resourceHints.resources.length,
        scriptsAndStylesFetched: desktop.resourceHints.fetched.length,
        images: desktop.domInitial.images.length,
      },
      consoleMessages: desktop.consoleMessages,
      pageErrors: desktop.pageErrors,
    },
    mobile: {
      document: mobile.dom.document,
      screenshot: mobile.topShot,
      controls: mobile.dom.controls.slice(0, 20).map((item) => ({
        tag: item.tag,
        text: trimText(item.text, 90),
        aria: trimText(item.aria, 90),
        className: trimText(item.className, 100),
        id: item.id,
        box: item.box,
      })),
      sliderCandidates: mobile.dom.sliderCandidates.slice(0, 10).map((item) => ({
        tag: item.tag,
        id: item.id,
        className: trimText(item.className, 120),
        text: trimText(item.text, 100),
        imageCount: item.imageCount,
        buttonCount: item.buttonCount,
        box: item.box,
      })),
    },
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const site of sites) {
    console.log(`Crawling ${site.id} ${site.url}`);
    try {
      const desktop = await crawlDesktop(browser, site);
      const mobile = await crawlMobile(browser, site);
      results.push(summarizeResult(site, desktop, mobile));
      console.log(`Done ${site.id}`);
    } catch (err) {
      console.error(`Failed ${site.id}: ${err.stack || err.message}`);
      results.push({ id: site.id, url: site.url, error: err.stack || err.message });
    }
  }
  await browser.close();

  const output = {
    generatedAt: new Date().toISOString(),
    sites: results,
  };
  fs.writeFileSync(path.join(outDir, "crawl-results.json"), JSON.stringify(output, null, 2), "utf8");
  console.log(`Wrote ${path.join(outDir, "crawl-results.json")}`);
})();
