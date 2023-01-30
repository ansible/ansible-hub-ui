import { saveAs } from 'file-saver';

export const downloadString = (data, filename) =>
  saveAs(
    new Blob([data], {
      type: 'text/plain;charset=utf-8',
    }),
    filename,
  );
