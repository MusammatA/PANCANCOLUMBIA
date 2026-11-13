import type { Metadata } from 'next';
import { Editable } from '@/components/editable';
import { PageBlocks } from '@/components/page-blocks';
import { getText } from '@/lib/content';
import { boardMembers, site } from '@/lib/site';
import styles from './contact.module.css';

export const metadata: Metadata = { title: 'Contact' };

export default async function Contact() {
  const [orgEmail, ...emails] = await Promise.all([
    getText('contact.email', site.contactEmail),
    ...boardMembers.map(member => getText(`board.${member.portrait}.email`, member.email)),
  ]);

  return (
    <>
      <h1 className="sr-only">Contact</h1>

      <section className={styles.org} aria-label="Email us">
        <Editable k="contact.org.title" as="h2">Email Us</Editable>
        <a className={styles.orgEmail} href={`mailto:${orgEmail}`}>
          <Editable k="contact.email">{site.contactEmail}</Editable>
        </a>
      </section>

      <section className={styles.board} aria-label="Board members">
        <Editable k="contact.board.title" as="h2" className={styles.sectionTitle}>Board Members</Editable>
        <ul className={styles.grid}>
          {boardMembers.map(({ name, role, email, portrait }, i) => (
            <li key={portrait} className={styles.card}>
              <Editable k={`board.${portrait}.name`} as="h3">{name}</Editable>
              <Editable k={`board.${portrait}.role`} as="p">{role}</Editable>
              <a href={`mailto:${emails[i]}`}>
                <Editable k={`board.${portrait}.email`}>{email}</Editable>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <PageBlocks page="contact" />
    </>
  );
}
