import { getBlocks, getSiteData, type BlockPage } from '@/lib/content';
import { renderParagraphs } from '@/lib/rich-text';
import { AddBlockButton, BlockToolbar } from './admin/block-admin';

/** Text boxes board members have added to a page. */
export async function PageBlocks({ page }: { page: BlockPage }) {
  const [blocks, { admin }] = await Promise.all([getBlocks(page), getSiteData()]);
  if (!blocks.length && !admin) return null;

  return (
    <div className="page-blocks">
      {blocks.map((block, i) => {
        const external = /^https?:/i.test(block.button_url);
        return (
          <section key={block.id} className={`block block-${block.design}${block.image_url ? ' has-image' : ''}`}>
            {admin && <BlockToolbar block={block} first={i === 0} last={i === blocks.length - 1} />}
            <div className="block-inner">
              {block.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="block-image" src={block.image_url} alt="" loading="lazy" />
              )}
              <div className="block-text">
                {block.title && <h2>{block.title}</h2>}
                {renderParagraphs(block.body)}
                {block.button_label && block.button_url && (
                  <a className="block-button" href={block.button_url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {block.button_label}
                  </a>
                )}
              </div>
            </div>
          </section>
        );
      })}
      {admin && (
        <div className="admin-add-row">
          <AddBlockButton page={page} />
        </div>
      )}
    </div>
  );
}
