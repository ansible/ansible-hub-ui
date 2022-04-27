const express = require('express');
const crypto = require('crypto'); // node:crypto

const app = express();
const port = 4567;
const host = 0;

const fileByDigest = {};
const files = [data('foo'), data('foobar'), data('barbarbaz')];

function data(contents) {
  const digest =
    'sha256:' + crypto.createHash('sha256').update(contents).digest('hex');
  fileByDigest[digest] = contents;

  return {
    contents,
    digest,
    size: contents.length,
  };
}

// use http://localhost:4567/ , library/whatever , latest

app.set('case sensitive routing', true);
app.set('strict routing', false);

app.get('/v2', (req, res) => {
  res.json(true);
});

app.get('/v2/library/:name/tags/list', (req, res) => {
  const { name } = req.params;

  res.json({
    name,
    tags: ['latest', 'greatest'],
  });
});

app.get('/v2/library/:name/manifests/:tag', (req, res) => {
  const { name, tag } = req.params;

  res.json({
    schemaVersion: 2,
    mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
    config: {
      mediaType: 'application/vnd.docker.container.image.v1+json',
      size: files[0].size,
      digest: files[0].digest,
    },
    layers: [
      tag == 'latest'
        ? {
            mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
            size: files[0].size,
            digest: files[0].digest,
          }
        : null,
      {
        mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
        size: files[1].size,
        digest: files[1].digest,
      },
      tag == 'greatest'
        ? null
        : {
            mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip',
            size: files[2].size,
            digest: files[2].digest,
          },
    ].filter(Boolean),
  });
});

app.get('/v2/library/:name/blobs/:digest', (req, res) => {
  const { name, digest } = req.params;

  res.send(fileByDigest[digest]);
});

app.use((req, res, next) => {
  console.log('remote-registry:404:', req.url);
  res.status(404).send('404');
});

app.listen(port, host, (e) =>
  e
    ? console.error(e)
    : console.log(`remote-registry listening on port ${port}`),
);
