import { ContentSummaryType } from 'src/api';

class Summary {
  total_count: number;
  contents: {
    module: number;
    role: number;
    plugin: number;
    // playbook: number;
  };
}

export function convertContentSummaryCounts(
  content: ContentSummaryType[],
): Summary {
  const summary: Summary = {
    total_count: content.length,
    contents: { module: 0, role: 0, plugin: 0 },
  };

  for (let c of content) {
    if (c.content_type === 'role') {
      summary.contents.role++;
    } else if (c.content_type === 'module') {
      summary.contents.module++;
    } else {
      summary.contents.plugin++;
    }
  }

  return summary;
}
