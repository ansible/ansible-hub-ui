import { t } from '@lingui/core/macro';

export const TECHNOLOGY_PREVIEW_TAG = 'technology_preview';

export const isTechnologyPreview = (
  tags: { name: string }[] | string[],
): boolean =>
  tags?.some((tag) => {
    const name = typeof tag === 'string' ? tag : tag.name;
    return name === TECHNOLOGY_PREVIEW_TAG || name === 'tech-preview';
  }) ?? false;

export const TechnologyPreviewTag = () => (
  <div
    style={{
      display: 'inline-block',
      margin: '4px',
      backgroundColor: '#0066CC',
      color: 'white',
      fontSize: '14px',
      paddingLeft: '5px',
      paddingRight: '5px',
      paddingBottom: '2px',
      paddingTop: '2px',
      borderRadius: '3px',
    }}
  >
    {t`TECHNOLOGY PREVIEW`}
  </div>
);
