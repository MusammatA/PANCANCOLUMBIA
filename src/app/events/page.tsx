import type { Metadata } from 'next';
import { AddEventButton, EventToolbar } from '@/components/admin/event-admin';
import { Editable } from '@/components/editable';
import { PageBanner } from '@/components/page-banner';
import { PageBlocks } from '@/components/page-blocks';
import { getEvents, getSiteData, type EventItem } from '@/lib/content';
import styles from './events.module.css';

export const metadata: Metadata = { title: 'Events' };

function Photo({ src, className }: { src: string; className?: string }) {
  if (!src) return <div className={`${className ?? ''} ${styles.noPhoto}`} aria-hidden="true" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt="" loading="lazy" />;
}

export default async function Events() {
  const [events, { admin }] = await Promise.all([getEvents(), getSiteData()]);
  const upcoming = events.filter(event => event.is_upcoming);
  const others = events.filter(event => !event.is_upcoming);
  const toolbar = (event: EventItem, list: EventItem[], i: number) =>
    admin && <EventToolbar event={event} first={i === 0} last={i === list.length - 1} />;

  return (
    <>
      <PageBanner k="events.title">Events</PageBanner>

      {(upcoming.length > 0 || admin) && (
        <section className={styles.upcoming} aria-label="Upcoming events">
          <Editable k="events.upcoming.title" as="h2" className={styles.sectionTitle}>
            {upcoming.length > 1 ? 'Upcoming Events' : 'Upcoming Event'}
          </Editable>
          <div className={styles.featuredList}>
            {upcoming.map((event, i) => (
              <article key={event.id} className={styles.featured}>
                {toolbar(event, upcoming, i)}
                <Photo src={event.photo_url} className={styles.featuredPhoto} />
                <div className={styles.featuredBody}>
                  <h3>{event.name}</h3>
                  {(event.event_date || event.location) && (
                    <dl className={styles.details}>
                      {event.event_date && <div><dt>Date</dt><dd>{event.event_date}</dd></div>}
                      {event.location && <div><dt>Location</dt><dd>{event.location}</dd></div>}
                    </dl>
                  )}
                  {event.description && <p>{event.description}</p>}
                </div>
              </article>
            ))}
          </div>
          {admin && (
            <div className="admin-add-row">
              <AddEventButton upcoming label="+ Add an upcoming event" />
            </div>
          )}
        </section>
      )}

      <section className={styles.all} aria-label="Our events">
        <div className={styles.allInner}>
          <Editable k="events.all.title" as="h2" className={styles.sectionTitle}>Our Events</Editable>
          <ul className={styles.grid}>
            {others.map((event, i) => (
              <li key={event.id} className={styles.card}>
                {toolbar(event, others, i)}
                <Photo src={event.photo_url} className={styles.cardPhoto} />
                <div className={styles.cardBody}>
                  <h3>{event.name}</h3>
                  {event.event_date && <p className={styles.cardDate}>{event.event_date}{event.location && ` · ${event.location}`}</p>}
                  {event.description && <p>{event.description}</p>}
                </div>
              </li>
            ))}
          </ul>
          {admin && (
            <div className="admin-add-row">
              <AddEventButton />
            </div>
          )}
        </div>
      </section>
      <PageBlocks page="events" />
    </>
  );
}
