import type { Grade } from '../game/scoring';
import type { Mode } from '../game/types';

export type Locale = 'en' | 'pl';

export const LOCALES: readonly Locale[] = ['en', 'pl'];

/** Every word the game says. Functions carry the values that vary. */
export interface Copy {
  tagline: string;
  language: string;
  modeGroup: string;
  modes: Record<Mode, { name: string; desc: string }>;
  howManySeconds: string;
  fineprint: string;
  spaceHint: string;

  back: string;
  again: string;
  tapAnywhere: string;

  wait: string;
  waitReflex: string;
  waitThenCount: (seconds: string) => string;
  countingNow: (seconds: string) => string;
  flashTap: string;
  flashStart: string;

  grades: Record<Grade, string>;
  unitMs: string;
  unitLate: string;
  unitShort: string;

  falseStart: string;
  falseStartDetail: string;
  tooEarly: string;
  dropped: string;
  droppedDetail: string;
  againstTarget: (target: string, you: string) => string;

  firstRound: string;
  newRecordBy: (better: string) => string;
  sameAsRecord: string;
  offBest: (worse: string, best: string) => string;
  ringLabel: (now: string, best: string) => string;

  bestNone: string;
  bestReflex: (value: string) => string;
  bestOff: (value: string) => string;

  announceReaction: (value: string, grade: string) => string;
  announceLate: (value: string, grade: string) => string;
  announceFalseStart: string;
  announceTooEarly: (value: string) => string;
  announceDropped: string;
}

const EN: Copy = {
  tagline: 'Stop the clock.',
  language: 'Language',
  modeGroup: 'Game mode',
  modes: {
    reflex: {
      name: 'Reflex',
      desc: 'It lights up. You tap. Speed is all that counts.',
    },
    count: {
      name: 'Count',
      desc: 'A random 2–10s to count out in the dark. Early is burnt.',
    },
    lock: {
      name: 'Lock',
      desc: 'Pick one number of seconds and practise it until you own it.',
    },
  },
  howManySeconds: 'How many seconds',
  fineprint:
    'Plays bright flashes on a dark screen. Sit this one out if that is a problem for you.',
  spaceHint: 'space starts your last mode',

  back: 'Modes',
  again: 'Again',
  tapAnywhere: 'or tap anywhere on the screen',

  wait: 'Wait',
  waitReflex: 'do not press until it lights up',
  waitThenCount: (seconds) =>
    `the flash starts it — then you count ${seconds}s`,
  countingNow: (seconds) => `counting ${seconds}s`,
  flashTap: 'Tap',
  flashStart: 'Start',

  grades: {
    uncanny: 'Uncanny',
    elite: 'Elite',
    sharp: 'Sharp',
    solid: 'Solid',
    steady: 'Steady',
    slack: 'Warming up',
  },
  unitMs: 'ms',
  unitLate: 'ms late',
  unitShort: 'ms early',

  falseStart: 'False start',
  falseStartDetail: 'You went before the light.',
  tooEarly: 'Too early',
  dropped: 'Dropped',
  droppedDetail: 'No press came. Round dropped.',
  againstTarget: (target, you) => `target ${target}s · you ${you}s`,

  firstRound: 'your first round in this mode',
  newRecordBy: (better) => `new record — ${better} ms better`,
  sameAsRecord: 'exactly your record',
  offBest: (worse, best) => `${worse} ms off your best of ${best} ms`,
  ringLabel: (now, best) =>
    `${now} against your best of ${best}. The ring is the record.`,

  bestNone: '—',
  bestReflex: (value) => `${value} ms`,
  bestOff: (value) => `${value} ms off`,

  announceReaction: (value, grade) => `${value} milliseconds. ${grade}.`,
  announceLate: (value, grade) => `${value} milliseconds late. ${grade}.`,
  announceFalseStart: 'False start. You went before the light.',
  announceTooEarly: (value) => `Too early by ${value} milliseconds.`,
  announceDropped: 'Round dropped. No press came.',
};

const PL: Copy = {
  tagline: 'Zatrzymaj zegar.',
  language: 'Język',
  modeGroup: 'Tryb gry',
  modes: {
    reflex: {
      name: 'Refleks',
      desc: 'Ekran się zapala. Klikasz. Liczy się tylko refleks.',
    },
    count: {
      name: 'Odliczanie',
      desc: 'Losowe 2–10 s do odliczenia w ciemności. Za wcześnie = spalone.',
    },
    lock: {
      name: 'Trening',
      desc: 'Wybierasz jedną liczbę sekund i ćwiczysz ją, aż ją opanujesz.',
    },
  },
  howManySeconds: 'Ile sekund',
  fineprint:
    'Gra pokazuje jasne błyski na ciemnym ekranie. Odpuść, jeśli to dla Ciebie problem.',
  spaceHint: 'spacja startuje ostatni tryb',

  back: 'Tryby',
  again: 'Jeszcze raz',
  tapAnywhere: 'albo dotknij ekranu gdziekolwiek',

  wait: 'Czekaj',
  waitReflex: 'nie klikaj, dopóki się nie zapali',
  waitThenCount: (seconds) =>
    `błysk to start — dopiero potem liczysz ${seconds} s`,
  countingNow: (seconds) => `liczysz ${seconds} s`,
  flashTap: 'Teraz',
  flashStart: 'Start',

  grades: {
    uncanny: 'Nieziemsko',
    elite: 'Elita',
    sharp: 'Ostro',
    solid: 'Solidnie',
    steady: 'Równo',
    slack: 'Rozgrzewka',
  },
  unitMs: 'ms',
  unitLate: 'ms po czasie',
  unitShort: 'ms za wcześnie',

  falseStart: 'Falstart',
  falseStartDetail: 'Kliknięcie przed błyskiem.',
  tooEarly: 'Za wcześnie',
  dropped: 'Przepadło',
  droppedDetail: 'Nikt nie kliknął. Runda przepadła.',
  againstTarget: (target, you) => `cel ${target} s · Ty ${you} s`,

  firstRound: 'pierwszy wynik w tym trybie',
  newRecordBy: (better) => `nowy rekord — o ${better} ms lepiej`,
  sameAsRecord: 'dokładnie tyle co rekord',
  offBest: (worse, best) => `o ${worse} ms gorzej od rekordu ${best} ms`,
  ringLabel: (now, best) =>
    `${now} przy rekordzie ${best}. Pierścień to rekord.`,

  bestNone: '—',
  bestReflex: (value) => `${value} ms`,
  bestOff: (value) => `${value} ms błędu`,

  announceReaction: (value, grade) => `${value} milisekund. ${grade}.`,
  announceLate: (value, grade) => `${value} milisekund po czasie. ${grade}.`,
  announceFalseStart: 'Falstart. Kliknięcie przed błyskiem.',
  announceTooEarly: (value) => `Za wcześnie o ${value} milisekund.`,
  announceDropped: 'Runda przepadła. Nikt nie kliknął.',
};

export const COPY: Record<Locale, Copy> = { en: EN, pl: PL };

/** Polish for a Polish browser, English for everyone else. */
export function detectLocale(languages: readonly string[]): Locale {
  return languages.some((tag) => tag.toLowerCase().startsWith('pl'))
    ? 'pl'
    : 'en';
}
