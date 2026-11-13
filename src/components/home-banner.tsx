import Image from 'next/image';
import { getText } from '@/lib/content';
import { site } from '@/lib/site';
import { Editable, EditableHref } from './editable';
import styles from './home-banner.module.css';

const JOIN_URL = 'https://secure.pancan.org/site/TR?fr_id=3239&pg=entry';

export function HomeBanner() {
  return (
    <section className={styles.banner} aria-label="Welcome">
      <Image
        className={styles.bannerPhoto}
        src="/images/pancan-community-event.jpg"
        alt="Four attendees at a PanCAN PurpleStride event beside the food and beverage tent."
        width={1600}
        height={1200}
        loading="eager"
      />
      <div className={styles.bannerCaption}>
        <Editable k="site.name" as="h1" className="chapter-name">{site.name}</Editable>
        <Editable k="home.tagline" as="p" className={styles.tagline}>Awareness. Community. Action.</Editable>
      </div>
    </section>
  );
}

export async function ChapterStory() {
  const [siteName, joinUrl] = await Promise.all([getText('site.name', site.name), getText('home.join.url', JOIN_URL)]);

  return (
    <section className={styles.story} aria-label="Our story">
      <div className={styles.panels}>
        <figure className={styles.portrait}>
          <Image
            className={styles.photo}
            src="/images/columbia-pancan-community.jpg"
            alt="Two attendees beside a Community Conversation sign. The chapter president is on the right, wearing yellow."
            width={1200}
            height={1600}
          />
        </figure>
        <div className={styles.mission}>
          <h2 className={`chapter-name ${styles.title}`}>{siteName}</h2>
          <Editable k="home.story" as="div" className={styles.card} multiline>
            {'PanCAN at Columbia is trying to achieve a simple goal: raising awareness and funds for pancreatic cancer patient research. Pancreatic cancer is one of the deadliest cancers, and also one of the most underfunded. After the president of the PanCAN Columbia chapter suffered a loss due to pancreatic cancer, she began volunteering in her hometown in Pittsburgh. Now, she brings together passionate students who come together to try to beat this cancer.'}
          </Editable>
        </div>
      </div>
      <a id="join-pancan" className={styles.joinLink} href={joinUrl}>
        <Editable k="home.join.label">Join PanCAN</Editable>
      </a>
      <div className={styles.linkEdit}>
        <EditableHref k="home.join.url" fallback={JOIN_URL} label="Edit Join PanCAN link" />
      </div>
    </section>
  );
}
