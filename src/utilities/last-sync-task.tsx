import React from 'react';
import { DateComponent, HelpButton, StatusIndicator } from 'src/components';

export function lastSynced(entity) {
  if (!entity.last_sync_task || !entity.last_sync_task.finished_at) {
    return null;
  }

  return (
    <>
      <DateComponent date={entity.last_sync_task.finished_at} />
    </>
  );
}

export function lastSyncStatus(entity) {
  if (!entity.last_sync_task) {
    return null;
  }

  let errorMessage = null;
  if (entity.last_sync_task.error) {
    errorMessage = (
      <HelpButton content={entity.last_sync_task.error['description']} />
    );
  }

  return (
    <>
      <StatusIndicator status={entity.last_sync_task.state} /> {errorMessage}
    </>
  );
}
