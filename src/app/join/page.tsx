import type { Metadata } from 'next';
import { Editable, EditableHref } from '@/components/editable';
import { PageBlocks } from '@/components/page-blocks';
import { getText } from '@/lib/content';
import styles from './join.module.css';

export const metadata: Metadata = { title: 'Join' };

const formUrl = (id: string) => `https://docs.google.com/forms/d/e/${id}/viewform`;

const forms = [
  {
    slug: 'volunteer',
    name: 'Volunteer with PanCAN at Columbia',
    description: 'Help out at our tabling, panels, meetings, and fundraisers throughout the year.',
    action: 'Sign up to volunteer',
    url: formUrl('1FAIpQLSftrBTGgUBqu63zyoPH2nxzudJTbwRA5tK35Pxwt6EAWWJ6mQ'),
  },
  {
    slug: 'leadership',
    name: 'Leadership Opportunities',
    description: 'Interested in taking on a bigger role? Help grow our chapter, bring new ideas to the table, and take initiative in supporting pancreatic cancer awareness and research.',
    action: 'Apply for leadership',
    url: formUrl('1FAIpQLSdY8PUVtlHplgYS5l4fsMiKsKo65hD5ilxXi7GIy7jwtZFFBQ'),
  },
  {
    slug: 'support',
    name: 'Support PanCAN at Columbia',
    description: 'Every contribution helps move our mission forward. Support our fundraising efforts and the fight against pancreatic cancer.',
    action: 'Support us',
    url: formUrl('1FAIpQLSfWFx5l7S6T1As7kJ7ncia9zW6kFLyYOfjSnSNdpW-PkRTlgQ'),
  },
  {
    slug: 'connect',
    name: 'Let’s Connect!',
    description: 'Not sure where to start? Schedule a one-on-one conversation with one of our board members to ask questions or learn more about what we do.',
    action: 'Schedule a chat',
    url: formUrl('1FAIpQLScAegFNBytySOzhahjbjv-9N_4vVkV_cr2FE2_MtZZKTiBLGw'),
  },
];

export default async function Join() {
  const urls = await Promise.all(forms.map(form => getText(`join.${form.slug}.url`, form.url)));

  return (
    <>
      <h1 className="sr-only">Join</h1>
      <section className={styles.forms} aria-label="Ways to get involved">
        <ul className={styles.grid}>
          {forms.map(({ slug, name, description, action, url }, i) => (
            <li key={slug} className={styles.card}>
              <Editable k={`join.${slug}.name`} as="h2">{name}</Editable>
              <Editable k={`join.${slug}.description`} as="p" multiline>{description}</Editable>
              <a className={styles.button} href={urls[i]} target="_blank" rel="noopener noreferrer">
                <Editable k={`join.${slug}.action`}>{action}</Editable>
              </a>
              <EditableHref k={`join.${slug}.url`} fallback={url} label="Edit form link" />
            </li>
          ))}
        </ul>
      </section>
      <PageBlocks page="join" />
    </>
  );
}
