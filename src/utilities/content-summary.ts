import { CollectionVersion } from 'src/api';

class Summary {
  total_count: number;
  contents: {
    module: number;
    role: number;
    plugin: number;
    dependency: number;
    // playbook: number;
  };
}

export function convertContentSummaryCounts(
  metadata: CollectionVersion['metadata'],
): Summary {
  const { contents: content, dependencies } = metadata;
  const summary: Summary = {
    total_count: content.length,
    contents: {
      module: 0,
      role: 0,
      plugin: 0,
      dependency: Object.keys(dependencies).length,
    },
  };

  for (const c of content) {
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
