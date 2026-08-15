import './styles.css';

import { Engine } from './engine/engine';
import { inputTime } from './engine/input';
import {
  FLASH_PULSE_MS,
  MAX_TARGET_MS,
  MIN_TARGET_MS,
  TARGET_STEP_MS,
} from './game/constants';
import { isTerminal } from './game/machine';
import { planRound } from './game/plan';
import { loadPrefs, savePrefs } from './game/prefs';
import {
  bestFor,
  browserStorage,
  emptyRecords,
  loadRecords,
  saveRecords,
  submitScore,
} from './game/records';
import { cryptoRandom } from './game/rng';
import { formatMs, formatTargetSeconds, scoreOf } from './game/scoring';
import type { GameState, Mode, Outcome, RoundPlan } from './game/types';
import { COPY, LOCALES, detectLocale } from './i18n/copy';
import type { Copy, Locale } from './i18n/copy';
import { recordView, verdictView } from './ui/verdict';
import type { RecordView } from './ui/verdict';

function el(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (node === null) throw new Error(`Missing element #${id}`);
  return node;
}

function button(id: string): HTMLButtonElement {
  const node = el(id);
  if (!(node instanceof HTMLButtonElement)) {
    throw new Error(`#${id} is not a button`);
  }
  return node;
}

function svgEl(selector: string): SVGElement {
  const node = document.querySelector(selector);
  if (!(node instanceof SVGElement)) {
    throw new Error(`${selector} is not an SVG element`);
  }
  return node;
}

const home = el('home');
const stage = el('stage');
const back = button('back');
const cue = el('cue');
const cueSub = el('cueSub');
const cueTarget = el('cueTarget');
const counting = el('counting');
const verdict = el('verdict');
const verdictLabel = el('verdictLabel');
const verdictNumber = el('verdictNumber');
const verdictUnit = el('verdictUnit');
const verdictRecord = el('verdictRecord');
const verdictDetail = el('verdictDetail');
const dial = el('dial');
const dialDisc = svgEl('#dialDisc');
const again = button('again');
const againHint = el('againHint');
const flash = el('flash');
const flashWord = el('flashWord');
const live = el('live');
const lockrow = el('lockrow');
const secondsLabel = el('secondsLabel');
const chips = el('chips');
const modes = el('modes');
const lang = el('lang');
const tagline = el('tagline');
const fineprint = el('fineprint');
const clear = button('clear');

const modeButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('.mode'),
);
const langButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('.lang__btn'),
);
const bestNodes = Array.from(
  document.querySelectorAll<HTMLElement>('[data-best]'),
);
const nameNodes = Array.from(
  document.querySelectorAll<HTMLElement>('[data-name]'),
);
const descNodes = Array.from(
  document.querySelectorAll<HTMLElement>('[data-desc]'),
);

const lockButton = modeButtons.find((node) => node.dataset.mode === 'lock');

/** The ring radius in the dial's own coordinates; the disc is a multiple of it. */
const RING_RADIUS = 62;

const MODES: readonly Mode[] = ['reflex', 'count', 'lock'];

function toMode(value: string | undefined): Mode | null {
  return MODES.find((candidate) => candidate === value) ?? null;
}

function toLocale(value: string | undefined): Locale | null {
  return LOCALES.find((candidate) => candidate === value) ?? null;
}

const storage = browserStorage();
let records = loadRecords(storage);
let prefs = loadPrefs(storage, detectLocale(navigator.languages));
let copy: Copy = COPY[prefs.locale];
let pulseTimer: number | null = null;

/* -------------------------------------------------------------------------
   Flash
   ------------------------------------------------------------------------- */

function paintFlash(hold: boolean): void {
  flash.classList.add('is-on');

  if (!hold) {
    // Counting modes get a pulse, not a lamp: leaving it lit would hand the
    // player a clock to read.
    pulseTimer = window.setTimeout(() => {
      pulseTimer = null;
      flash.classList.remove('is-on');
    }, FLASH_PULSE_MS);
  }
}

function clearFlash(): void {
  if (pulseTimer !== null) {
    clearTimeout(pulseTimer);
    pulseTimer = null;
  }
  flash.classList.remove('is-on');
}

/* -------------------------------------------------------------------------
   Rendering
   ------------------------------------------------------------------------- */

function render(state: GameState): void {
  stage.dataset.phase = state.phase;

  const shouldDisable = !isTerminal(state.phase);
  if (back.disabled !== shouldDisable) back.disabled = shouldDisable;

  const plan = state.plan;
  if (plan === null) return;

  // Only refreshed when a round is armed. Rewriting text on the frame that
  // paints the flash would drag layout into the one frame that must not have
  // any.
  if (state.phase !== 'armed') return;

  stage.dataset.mode = plan.mode;
  flashWord.textContent =
    plan.mode === 'reflex' ? copy.flashTap : copy.flashStart;
  cue.textContent = copy.wait;

  if (plan.targetMs === null) {
    cueSub.textContent = copy.waitReflex;
    cueTarget.textContent = '';
    counting.textContent = '';
  } else {
    const seconds = formatTargetSeconds(plan.targetMs);
    cueSub.textContent = copy.waitBeforeCount;
    cueTarget.textContent = copy.seconds(seconds);
    counting.textContent = copy.countingNow(seconds);
  }
}

/**
 * The ring is the record, the disc is this round. Fitting inside means you beat
 * it — which is a question anyone can answer without knowing what a millisecond
 * is.
 */
function renderDial(view: RecordView): void {
  dial.classList.toggle('is-first', view.ratio === null);
  dial.classList.toggle('is-record', view.beats);
  dialDisc.setAttribute('r', `${(view.ratio ?? 1) * RING_RADIUS}`);
  dial.setAttribute('aria-label', view.label);

  verdictRecord.textContent = view.line;
  verdictRecord.classList.toggle('is-better', view.beats);
  verdictRecord.classList.toggle('is-neutral', view.ratio === null);
}

function renderBests(): void {
  for (const node of bestNodes) {
    const mode = toMode(node.dataset.best);
    if (mode === null) continue;

    const best = bestFor(
      records,
      mode,
      mode === 'lock' ? prefs.lockTargetMs : null,
    );
    if (best === null) {
      node.textContent = copy.bestNone;
    } else {
      const value = formatMs(best);
      node.textContent =
        mode === 'reflex' ? copy.bestReflex(value) : copy.bestOff(value);
    }
  }
}

function settled(outcome: Outcome, plan: RoundPlan): void {
  const view = verdictView(outcome, copy);

  verdict.classList.toggle('is-fail', view.fail);
  verdictLabel.textContent = view.label;
  verdictNumber.textContent = view.number;
  verdictUnit.textContent = view.unit;
  verdictDetail.textContent = view.detail;

  const score = scoreOf(outcome);
  if (score !== null) {
    // Read the record *before* submitting, or a new best would be compared
    // against itself and every record would read as a tie.
    const previousBest = bestFor(records, plan.mode, plan.targetMs);
    renderDial(recordView(score, previousBest, copy));

    const result = submitScore(records, plan.mode, plan.targetMs, score);
    records = result.records;
    if (result.isRecord) saveRecords(storage, records);
  }

  live.textContent = view.announce;
  buzz(view.fail ? [8, 40, 8] : 12);
}

/** Haptics are a nicety and half the browsers out there have never heard of them. */
function buzz(pattern: number | number[]): void {
  const capabilities: Partial<Navigator> = navigator;
  capabilities.vibrate?.(pattern);
}

/* -------------------------------------------------------------------------
   Engine
   ------------------------------------------------------------------------- */

function nextPlan(): RoundPlan {
  return planRound(prefs.mode, cryptoRandom, prefs.lockTargetMs);
}

const engine = new Engine({
  paintFlash,
  clearFlash,
  render,
  settled,
  nextPlan,
});

/* -------------------------------------------------------------------------
   Screens
   ------------------------------------------------------------------------- */

function startPlaying(): void {
  home.hidden = true;
  stage.hidden = false;
  stage.dataset.mode = prefs.mode;
  engine.arm(nextPlan());
}

function goHome(): void {
  engine.abort();
  clearFlash();
  stage.hidden = true;
  home.hidden = false;
  renderBests();
}

/* -------------------------------------------------------------------------
   Home
   ------------------------------------------------------------------------- */

/** Marks what the space bar would start, and which interval is loaded. */
function markLast(): void {
  for (const node of modeButtons) {
    node.classList.toggle('is-last', node.dataset.mode === prefs.mode);
  }
  for (const chip of chips.children) {
    const selected =
      (chip as HTMLElement).dataset.target === `${prefs.lockTargetMs}`;
    chip.classList.toggle('is-last', selected);
  }
  renderBests();
}

/** Tracked rather than read back off the DOM, where `hidden` is tri-state. */
let secondsOpen = false;

function setSecondsOpen(open: boolean): void {
  secondsOpen = open;
  lockrow.hidden = !open;
  lockButton?.setAttribute('aria-expanded', `${open}`);
}

/**
 * A mode card is the start button. Lock is the exception: it has a number to
 * settle first, so it opens the seconds and each of those is the start button.
 */
function pressMode(mode: Mode): void {
  if (mode === 'lock') {
    setSecondsOpen(!secondsOpen);
    return;
  }
  prefs = { ...prefs, mode };
  savePrefs(storage, prefs);
  markLast();
  startPlaying();
}

function pressSeconds(targetMs: number): void {
  prefs = { ...prefs, mode: 'lock', lockTargetMs: targetMs };
  savePrefs(storage, prefs);
  markLast();
  startPlaying();
}

/* -------------------------------------------------------------------------
   Clearing records
   ------------------------------------------------------------------------- */

let clearArmed = false;
let clearTimer: number | null = null;

function resetClear(): void {
  if (clearTimer !== null) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }
  clearArmed = false;
  clear.classList.remove('is-armed');
  clear.textContent = copy.clearRecords;
}

/**
 * Two presses, because there is nowhere to recover a wiped record from — and a
 * dialog would be a heavier promise than a personal best deserves.
 */
function pressClear(): void {
  if (!clearArmed) {
    resetClear();
    clearArmed = true;
    clear.classList.add('is-armed');
    clear.textContent = copy.clearRecordsConfirm;
    clearTimer = window.setTimeout(resetClear, 4_000);
    return;
  }

  records = emptyRecords();
  saveRecords(storage, records);
  renderBests();

  resetClear();
  clear.textContent = copy.clearRecordsDone;
  clearTimer = window.setTimeout(resetClear, 1_800);
}

function buildChips(): void {
  const fragment = document.createDocumentFragment();
  for (let ms = MIN_TARGET_MS; ms <= MAX_TARGET_MS; ms += TARGET_STEP_MS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.target = `${ms}`;
    chip.textContent = `${formatTargetSeconds(ms)}s`;
    chip.addEventListener('click', () => {
      pressSeconds(ms);
    });
    fragment.append(chip);
  }
  chips.append(fragment);
}

/* -------------------------------------------------------------------------
   Language
   ------------------------------------------------------------------------- */

function applyCopy(): void {
  document.documentElement.lang = prefs.locale;

  tagline.textContent = copy.tagline;
  lang.setAttribute('aria-label', copy.language);
  modes.setAttribute('aria-label', copy.modeGroup);
  secondsLabel.textContent = copy.howManySeconds;
  chips.setAttribute('aria-label', copy.howManySeconds);
  fineprint.textContent = copy.fineprint;
  resetClear();
  back.textContent = copy.back;
  again.textContent = copy.again;
  againHint.textContent = copy.tapAnywhere;

  for (const node of nameNodes) {
    const mode = toMode(node.dataset.name);
    if (mode !== null) node.textContent = copy.modes[mode].name;
  }
  for (const node of descNodes) {
    const mode = toMode(node.dataset.desc);
    if (mode !== null) node.textContent = copy.modes[mode].desc;
  }

  for (const node of langButtons) {
    const selected = node.dataset.locale === prefs.locale;
    node.classList.toggle('is-selected', selected);
    node.setAttribute('aria-checked', `${selected}`);
  }

  renderBests();
}

function selectLocale(locale: Locale): void {
  prefs = { ...prefs, locale };
  savePrefs(storage, prefs);
  copy = COPY[locale];
  applyCopy();
}

/* -------------------------------------------------------------------------
   Wiring
   ------------------------------------------------------------------------- */

for (const node of modeButtons) {
  node.addEventListener('click', () => {
    const mode = toMode(node.dataset.mode);
    if (mode !== null) pressMode(mode);
  });
}

for (const node of langButtons) {
  node.addEventListener('click', () => {
    const locale = toLocale(node.dataset.locale);
    if (locale !== null) selectLocale(locale);
  });
}

clear.addEventListener('click', pressClear);

back.addEventListener('pointerdown', (event) => {
  // Otherwise the press bubbles to the stage and is read as "again".
  event.stopPropagation();
});
back.addEventListener('click', goHome);

stage.addEventListener(
  'pointerdown',
  (event) => {
    if (!event.isPrimary) return;
    event.preventDefault();
    engine.press(inputTime(event));
  },
  { passive: false },
);

stage.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

window.addEventListener('keydown', (event) => {
  if (event.repeat || event.key !== ' ') return;

  const focused = document.activeElement;
  const onButton = focused instanceof HTMLButtonElement;

  if (!home.hidden) {
    // A focused control gets to handle its own space bar.
    if (onButton) return;
    event.preventDefault();
    startPlaying();
    return;
  }

  if (focused === back) return;

  event.preventDefault();
  engine.press(inputTime(event));
});

document.addEventListener('visibilitychange', () => {
  // A round that ran while the tab was hidden did not measure anything real.
  if (document.hidden && !stage.hidden) goHome();
});

/* -------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */

buildChips();
applyCopy();
markLast();
setSecondsOpen(prefs.mode === 'lock');
