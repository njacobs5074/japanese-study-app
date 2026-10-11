import Card from '../components/Card';
import { IPADIC_NOTICE } from '../data/ipadicNotice';

export default function AboutPage() {
  return (
    <Card>
      <div className="about">
        <h1>About</h1>

        <section>
          <h2>Stroke-order diagrams</h2>
          <p>
            Stroke diagrams come from <a href="https://kanjivg.tagaini.net/">KanjiVG</a>, © Ulrich
            Apel, licensed under{' '}
            <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>.
          </p>
        </section>

        <section>
          <h2>Example sentences</h2>
          <p>
            Example sentences and translations come from{' '}
            <a href="https://tatoeba.org/">Tatoeba</a>. Each sentence is shown with its contributor
            and licence (CC BY 2.0 FR or CC0 1.0), and links back to the sentence on tatoeba.org.
          </p>
          <p>
            For each word, one search is sent to the Tatoeba API for Japanese sentences containing
            that exact word, with English translations, in random order (up to 10 results). Only
            sentences without a licensing problem are returned. Results are saved in your browser
            and are not requested again for the same word. A sentence’s reading is Tatoeba’s own
            kana transcription where it has one, and may contain mistakes. Sentences can be
            licensed under CC BY 2.0 FR or CC0 1.0; each translation is credited with its own
            contributor and licence.
          </p>
        </section>

        <section>
          <h2>Readings and definitions</h2>
          <p>
            Word readings and definitions come from{' '}
            <a href="https://www.edrdg.org/jmdict/j_jmdict.html">JMdict</a>, and kanji readings and
            meanings from <a href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project">KANJIDIC2</a>.
            Both are the property of the{' '}
            <a href="https://www.edrdg.org/">Electronic Dictionary Research and Development Group</a>{' '}
            (EDRDG) and are used under its{' '}
            <a href="https://www.edrdg.org/edrdg/licence.html">licence</a> (Creative Commons
            Attribution-ShareAlike 4.0). The data was converted to JSON by{' '}
            <a href="https://github.com/scriptin/jmdict-simplified">jmdict-simplified</a> (release
            3.6.2, dictionary date 2026-10-05) and shortened for use in this app: only the first
            few senses and English glosses of each entry are kept.
          </p>
        </section>

        <section>
          <h2>Splitting text into words</h2>
          <p>
            Passages are split into words in your browser by{' '}
            <a href="https://github.com/patdx/kuromoji.js">@patdx/kuromoji</a>, a fork of{' '}
            <a href="https://github.com/takuyaa/kuromoji.js">kuromoji.js</a> (Apache License 2.0),
            using its bundled IPADIC dictionary. The dictionary is downloaded the first time you
            split a text.
          </p>
          <details className="notice">
            <summary>Dictionary copyright and licence notice</summary>
            <p className="muted">
              mecab-ipadic-2.7.0-20070801, as reproduced in the kuromoji.js{' '}
              <a href="https://github.com/takuyaa/kuromoji.js/blob/master/NOTICE.md">NOTICE.md</a>:
            </p>
            <pre>{IPADIC_NOTICE}</pre>
          </details>
        </section>

        <section>
          <h2>Your own text and privacy</h2>
          <p>
            The passage you paste, your study list and your review progress are stored only in this
            browser (IndexedDB). Your passage is never sent anywhere. There is no account and no
            server-side storage.
          </p>
          <p>Using the app does make a few requests to other services:</p>
          <ul>
            <li>
              Each word you add to your study list is sent as a search to the Tatoeba API
              (api.tatoeba.org) to find example sentences, once per word.
            </li>
            <li>
              The first time a kanji’s stroke diagram is shown, its file is fetched from the KanjiVG
              repository on GitHub (raw.githubusercontent.com).
            </li>
            <li>The page fonts are loaded from Google Fonts.</li>
          </ul>
          <p>Those services can see your IP address and what you request from them.</p>
        </section>

        <section>
          <h2>Source code</h2>
          <p>
            This app is open source, released under the MIT licence. The code is on{' '}
            <a href="https://github.com/njacobs5074/japanese-study-app">GitHub</a>, where you can
            also report problems or suggest changes.
          </p>
        </section>
      </div>
    </Card>
  );
}
