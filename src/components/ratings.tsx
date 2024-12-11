import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Table, Td, Th, Tr } from '@patternfly/react-table';
import React, { useEffect, useState } from 'react';
import { HelpButton, Tooltip } from 'src/components';

interface IProps {
  namespace: string;
  name: string;
}

const cache = { collection: null, role: null };

const loadScore = (type, namespace, name, callback) => () => {
  if (!IS_COMMUNITY) {
    return;
  }

  const setScores = (data) => {
    if (namespace && name && callback) {
      callback(data?.[namespace]?.[name]);
    }
  };

  if (!cache[type]) {
    // not in cache, trigger load
    cache[type] = fetch(`/static/scores/${type}.json`)
      .then((response) => response.json())
      .then((data) => {
        cache[type] = data;
        setScores(data);
      });
  } else if (typeof cache[type].then === 'function') {
    // waiting for load
    cache[type].then(() => setScores(cache[type]));
  } else {
    // already loaded
    setScores(cache[type]);
  }
};

export function CollectionRatings({
  namespace,
  name,
  isList,
}: IProps & { isList?: boolean }) {
  const [scores, setScores] = useState(null);
  const loader = loadScore('collection', namespace, name, setScores);
  useEffect(loader, [namespace, name]);

  return isList ? (
    <Ratings scores={scores} />
  ) : (
    <span style={{ padding: '12px 0 4px 0' }}>
      <Ratings scores={scores} />
    </span>
  );
}

export function RoleRatings({ namespace, name }: IProps) {
  const [scores, setScores] = useState(null);
  const loader = loadScore('role', namespace, name, setScores);
  useEffect(loader, [namespace, name]);

  return <Ratings scores={scores} />;
}

function Ratings({ scores }: { scores: Record<string, number> }) {
  if (!scores) {
    return null;
  }

  const help = t`This is the rating from old-galaxy.ansible.com. We are working on redoing the rating for the new version of galaxy.`;
  const more = (
    <Table>
      {scores.quality_score !== null ? (
        <Tr>
          <Th>{t`Quality score`}</Th>
          <Td>
            <progress max={100} value={~~(20 * scores.quality_score)} />{' '}
          </Td>
          <Td>
            <strong>{scores.quality_score}</strong>&nbsp;/&nbsp;5
          </Td>
        </Tr>
      ) : null}
      <Tr>
        <Th>{t`Community score`}</Th>
        <Td>
          <progress max={100} value={~~(20 * scores.score)} />{' '}
        </Td>
        <Td>
          <strong>{scores.score}</strong>&nbsp;/&nbsp;5
        </Td>
      </Tr>
      <Tr>
        <Td colSpan={3} style={{ textAlign: 'right' }}>
          <Trans>Based on {scores.count} surveys.</Trans>
        </Td>
      </Tr>
      <Tr>
        <Th>{t`Quality of docs`}</Th>
        <Td>
          <progress max={100} value={~~(20 * scores.docs)} />{' '}
        </Td>
        <Td>
          <strong>{scores.docs}</strong>&nbsp;/&nbsp;5
        </Td>
      </Tr>
      <Tr>
        <Th>{t`Ease of use`}</Th>
        <Td>
          <progress max={100} value={~~(20 * scores.ease_of_use)} />{' '}
        </Td>
        <Td>
          <strong>{scores.ease_of_use}</strong>&nbsp;/&nbsp;5
        </Td>
      </Tr>
      <Tr>
        <Th>{t`Does what it promises`}</Th>
        <Td>
          <progress max={100} value={~~(20 * scores.does_what_it_says)} />{' '}
        </Td>
        <Td>
          <strong>{scores.does_what_it_says}</strong>&nbsp;/&nbsp;5
        </Td>
      </Tr>
      <Tr>
        <Th>{t`Works without change`}</Th>
        <Td>
          <progress max={100} value={~~(20 * scores.works_as_is)} />{' '}
        </Td>
        <Td>
          <strong>{scores.works_as_is}</strong>&nbsp;/&nbsp;5
        </Td>
      </Tr>
      <Tr>
        <Th>{t`Ready for production`}</Th>
        <Td>
          <progress max={100} value={~~(20 * scores.used_in_production)} />{' '}
        </Td>
        <Td>
          <strong>{scores.used_in_production}</strong>&nbsp;/&nbsp;5
        </Td>
      </Tr>
    </Table>
  );

  return (
    <Tooltip content={help}>
      <HelpButton hasAutoWidth content={more} />{' '}
      <span style={{ marginRight: '8px' }}>{scores.score}</span>
    </Tooltip>
  );
}
