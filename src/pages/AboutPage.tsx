import Card from '../components/Card';

const todo = (text: string) => <p className="placeholder">TODO: {text}</p>;

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
          {todo('source and licence, pending the dictionary decision (candidate: JMdict).')}
        </section>

        <section>
          <h2>JLPT levels</h2>
          <p>JLPT levels shown in this app are unofficial; there are no official kanji lists for the current test.</p>
          {todo('source and licence, pending the JLPT data decision.')}
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
          {todo('add the exact IPADIC copyright and licence notice (ICOT / NAIST) after verifying its wording.')}
        </section>

        <section>
          <h2>Your own text</h2>
          <p>
            The passage you paste, its title, your study list and your review progress are stored
            only in this browser (IndexedDB). Nothing you write is sent to a server.
          </p>
        </section>
      </div>
    </Card>
  );
}
