import { Trans, t } from '@lingui/macro';
import { Tooltip } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { HelperText } from 'src/components';

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
    <table className='pf-v5-c-table'>
      {scores.quality_score !== null ? (
        <tr>
          <th>{t`Quality score`}</th>
          <td>
            <progress max={100} value={~~(20 * scores.quality_score)} />{' '}
          </td>
          <td>
            <strong>{scores.quality_score}</strong>&nbsp;/&nbsp;5
          </td>
        </tr>
      ) : null}
      <tr>
        <th>{t`Community score`}</th>
        <td>
          <progress max={100} value={~~(20 * scores.score)} />{' '}
        </td>
        <td>
          <strong>{scores.score}</strong>&nbsp;/&nbsp;5
        </td>
      </tr>
      <tr>
        <td colSpan={3} style={{ textAlign: 'right' }}>
          <Trans>Based on {scores.count} surveys.</Trans>
        </td>
      </tr>
      <tr>
        <th>{t`Quality of docs`}</th>
        <td>
          <progress max={100} value={~~(20 * scores.docs)} />{' '}
        </td>
        <td>
          <strong>{scores.docs}</strong>&nbsp;/&nbsp;5
        </td>
      </tr>
      <tr>
        <th>{t`Ease of use`}</th>
        <td>
          <progress max={100} value={~~(20 * scores.ease_of_use)} />{' '}
        </td>
        <td>
          <strong>{scores.ease_of_use}</strong>&nbsp;/&nbsp;5
        </td>
      </tr>
      <tr>
        <th>{t`Does what it promises`}</th>
        <td>
          <progress max={100} value={~~(20 * scores.does_what_it_says)} />{' '}
        </td>
        <td>
          <strong>{scores.does_what_it_says}</strong>&nbsp;/&nbsp;5
        </td>
      </tr>
      <tr>
        <th>{t`Works without change`}</th>
        <td>
          <progress max={100} value={~~(20 * scores.works_as_is)} />{' '}
        </td>
        <td>
          <strong>{scores.works_as_is}</strong>&nbsp;/&nbsp;5
        </td>
      </tr>
      <tr>
        <th>{t`Ready for production`}</th>
        <td>
          <progress max={100} value={~~(20 * scores.used_in_production)} />{' '}
        </td>
        <td>
          <strong>{scores.used_in_production}</strong>&nbsp;/&nbsp;5
        </td>
      </tr>
    </table>
  );

  return (
    <Tooltip content={help}>
      <HelperText hasAutoWidth content={more} />{' '}
      <span style={{ marginRight: '8px' }}>{scores.score}</span>
    </Tooltip>
  );
}
