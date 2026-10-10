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
          {todo('describe how searches are made once the Tatoeba client exists (milestone 3).')}
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
          <h2>Your own text</h2>
          {todo('confirm storage once decided. Planned: the text you paste stays in this browser (IndexedDB) and is never sent anywhere.')}
        </section>
      </div>
    </Card>
  );
}
