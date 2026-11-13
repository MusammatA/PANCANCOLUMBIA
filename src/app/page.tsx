import Image from 'next/image';
import { Editable } from '@/components/editable';
import { ChapterStory, HomeBanner } from '@/components/home-banner';
import { PageBlocks } from '@/components/page-blocks';
import { boardMembers } from '@/lib/site';
import styles from './home.module.css';

export default function Home() {
  return (
    <>
      <HomeBanner />
      <ChapterStory />
      <section className={styles.about} aria-label="About PanCAN">
        <Editable k="home.about.title" as="h2">What is PanCAN?</Editable>
        <Editable k="home.about.p1" as="p" multiline>
          {'PanCAN, short for the **Pancreatic Cancer Action Network**, is a national nonprofit organization dedicated to fighting pancreatic cancer through research, education, patient support, and advocacy.'}
        </Editable>
        <Editable k="home.about.p2" as="p" multiline>
          {'Pancreatic cancer is one of the deadliest forms of cancer, with a five-year survival rate of just 13%. Many patients are diagnosed at later stages, when treatment options are more limited. PanCAN works to change this by funding research into earlier detection and better treatments, providing free resources to patients and their families, and advocating for increased government funding.'}
        </Editable>
        <Editable k="home.about.p3" as="p" multiline>
          {"**At Columbia, we want to be part of that effort.** Through fundraising, awareness campaigns, and campus events, our chapter hopes to bring more attention to a disease that doesn't get nearly enough of it. Whether you've personally been affected by pancreatic cancer or simply want to support a meaningful cause, we welcome you to get involved."}
        </Editable>
        <Editable k="home.about.p4" as="p" multiline>
          {'**Learn more about the national organization at [pancan.org](https://pancan.org/).**'}
        </Editable>
      </section>
      <section className={styles.board} id="meet-the-board" aria-label="Meet the Board">
        <div className={styles.boardInner}>
          <Editable k="home.board.title" as="h2">Meet the Board</Editable>
          <ul className={styles.boardGrid}>
            {boardMembers.map(({ name, role, portrait }) => (
              <li key={portrait}>
                <figure>
                  <Image src={`/images/board/${portrait}.webp`} width={640} height={640} alt="" />
                  <figcaption>
                    <Editable k={`board.${portrait}.name`} as="h3">{name}</Editable>
                    <Editable k={`board.${portrait}.role`} as="p">{role}</Editable>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <PageBlocks page="home" />
    </>
  );
}
