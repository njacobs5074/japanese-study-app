import { licenseUrl, sentenceUrl, type Attributed } from '../lib/tatoeba';

export default function Attribution({ item, label }: { item: Attributed; label: string }) {
  return (
    <p className="attribution">
      {label} {item.owner ? <>by {item.owner}</> : 'from an unclaimed Tatoeba contribution'} ·{' '}
      <a href={licenseUrl(item.license)} target="_blank" rel="noreferrer">
        {item.license}
      </a>{' '}
      ·{' '}
      <a href={sentenceUrl(item.id)} target="_blank" rel="noreferrer">
        View on tatoeba.org
      </a>
    </p>
  );
}
