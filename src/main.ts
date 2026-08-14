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
  loadRecords,
  saveRecords,
  submitScore,
} from './game/records';
import { cryptoRandom } from './game/rng';
import { formatMs, formatTargetSeconds, scoreOf } from './game/scoring';
import type { GameState, Mode, Outcome, RoundPlan } from './game/types';
import { verdictView } from './ui/verdict';

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

const home = el('home');
const stage = el('stage');
const back = button('back');
const play = button('play');
const cue = el('cue');
const target = el('target');
const verdict = el('verdict');
const verdictLabel = el('verdictLabel');
const verdictNumber = el('verdictNumber');
const verdictUnit = el('verdictUnit');
const verdictDetail = el('verdictDetail');
const verdictBest = el('verdictBest');
const again = button('again');
const flash = el('flash');
const live = el('live');
const lockrow = el('lockrow');
const chips = el('chips');

const modeButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('.mode'),
);
const bestNodes = Array.from(
  document.querySelectorAll<HTMLElement>('[data-best]'),
);

const MODES: readonly Mode[] = ['reflex', 'count', 'lock'];

function toMode(value: string | undefined): Mode | null {
  return MODES.find((candidate) => candidate === value) ?? null;
}

const storage = browserStorage();
let records = loadRecords(storage);
let prefs = loadPrefs(storage);
let lastPointer: { x: number; y: number } | null = null;
let pulseTimer: number | null = null;

/* -------------------------------------------------------------------------
   Flash
   ------------------------------------------------------------------------- */

function paintFlash(hold: boolean): void {
  flash.classList.toggle('is-hold', hold);
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
  flash.classList.remove('is-on', 'is-hold');
}

/* -------------------------------------------------------------------------
   Rendering
   ------------------------------------------------------------------------- */

const CUE: Record<Mode, string> = {
  reflex: 'Wait for the light',
  count: 'Count after the flash',
  lock: 'Count after the flash',
};

function render(state: GameState): void {
  stage.dataset.phase = state.phase;
  back.disabled = !isTerminal(state.phase);

  const plan = state.plan;
  if (plan === null) return;

  stage.dataset.mode = plan.mode;
  cue.textContent = CUE[plan.mode];
  target.hidden = plan.targetMs === null;
  if (plan.targetMs !== null) {
    target.textContent = `${formatTargetSeconds(plan.targetMs)}s`;
  }
}

function placeAgain(): void {
  const margin = 74;
  const x =
    lastPointer === null
      ? window.innerWidth / 2
      : Math.min(Math.max(lastPointer.x, margin), window.innerWidth - margin);
  const y =
    lastPointer === null
      ? window.innerHeight * 0.74
      : Math.min(Math.max(lastPointer.y, margin), window.innerHeight - margin);

  again.style.setProperty('--tap-x', `${Math.round(x)}px`);
  again.style.setProperty('--tap-y', `${Math.round(y)}px`);
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
      node.textContent = '—';
    } else {
      node.textContent =
        mode === 'reflex' ? `${formatMs(best)} ms` : `${formatMs(best)} ms off`;
    }
  }
}

function settled(outcome: Outcome, plan: RoundPlan): void {
  const view = verdictView(outcome);

  verdict.classList.toggle('is-fail', view.fail);
  verdictLabel.textContent = view.label;
  verdictNumber.textContent = view.number;
  verdictUnit.textContent = view.unit;
  verdictDetail.textContent = view.detail;

  const score = scoreOf(outcome);
  let isRecord = false;
  if (score !== null) {
    const result = submitScore(records, plan.mode, plan.targetMs, score);
    records = result.records;
    isRecord = result.isRecord;
    if (isRecord) saveRecords(storage, records);
  }

  const best = bestFor(records, plan.mode, plan.targetMs);
  verdictBest.classList.toggle('is-record', isRecord);
  if (isRecord) {
    verdictBest.textContent = 'New best';
  } else if (best === null) {
    verdictBest.textContent = '';
  } else {
    verdictBest.textContent = `Best ${formatMs(best)} ms`;
  }

  placeAgain();
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
   Home controls
   ------------------------------------------------------------------------- */

function selectMode(mode: Mode): void {
  prefs = { ...prefs, mode };
  savePrefs(storage, prefs);

  for (const button of modeButtons) {
    const isSelected = button.dataset.mode === mode;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-checked', String(isSelected));
  }
  lockrow.hidden = mode !== 'lock';
  renderBests();
}

function selectTarget(targetMs: number): void {
  prefs = { ...prefs, lockTargetMs: targetMs };
  savePrefs(storage, prefs);

  for (const chip of chips.children) {
    const isSelected = (chip as HTMLElement).dataset.target === `${targetMs}`;
    chip.classList.toggle('is-selected', isSelected);
    chip.setAttribute('aria-checked', String(isSelected));
  }
  renderBests();
}

function buildChips(): void {
  const fragment = document.createDocumentFragment();
  for (let ms = MIN_TARGET_MS; ms <= MAX_TARGET_MS; ms += TARGET_STEP_MS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.target = `${ms}`;
    chip.textContent = `${formatTargetSeconds(ms)}s`;
    chip.setAttribute('role', 'radio');
    chip.setAttribute('aria-checked', 'false');
    chip.addEventListener('click', () => {
      selectTarget(ms);
    });
    fragment.append(chip);
  }
  chips.append(fragment);
}

for (const button of modeButtons) {
  button.addEventListener('click', () => {
    const mode = toMode(button.dataset.mode);
    if (mode !== null) selectMode(mode);
  });
}

play.addEventListener('click', startPlaying);

back.addEventListener('pointerdown', (event) => {
  // Otherwise the press bubbles to the stage and is read as "again".
  event.stopPropagation();
});
back.addEventListener('click', goHome);

/* -------------------------------------------------------------------------
   Input
   ------------------------------------------------------------------------- */

stage.addEventListener(
  'pointerdown',
  (event) => {
    if (!event.isPrimary) return;
    event.preventDefault();
    lastPointer = { x: event.clientX, y: event.clientY };
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
  lastPointer = null;
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
selectMode(prefs.mode);
selectTarget(prefs.lockTargetMs);
