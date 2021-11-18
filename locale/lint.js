#!/usr/bin/env node
const { readFileSync } = require('fs');

if (process.argv[0] === 'node' || process.argv[0].match(/\/node$/)) {
  // `node script args` vs `./script args`
  process.argv.shift();
}

if (process.argv.length < 2) {
  console.error(`${process.argv[0]}: no files`);
  console.error(`use: ${process.argv[0]} <files>`);
  process.exit(1);
}

// find any {num} {str} <num> </num> <num/> %(str)s
const REGEX = /(\{([\p{Alpha}\p{Number}_]+|\d+)\})|(<\/?\d+\/?>)|(%(\([\p{Alpha}\p{Number}_]+\))?.)/ug;

// extract all vars from string
const extract = (str) => Array.from( str.matchAll(REGEX) ).map((m) => m[0]);

// set difference
const difference = (arr1, arr2) => arr1.filter(x => !arr2.includes(x));

// "\"foo\\n\\tbar\"" => "foo\n\tbar"
const unqqbackslash = (s) => JSON.parse(s);

const errors = [];
const fail = (message, data = {}) => {
  if (process.env.GITHUB_ACTIONS) {
    const s = message.replace(/[\r\n]/g, '').replace(/%/g, '%25');
    console.error(`::error file=${data.file},line=${data.line}::${s}`);
  }

  errors.push({ ...data, message });
};

const process_pair = (msgid, msgstr, file, line) => {
  // handling eof while still in state 2; magic id, untranslated strings
  if (!msgid || !msgstr) {
    return;
  }

  const msgidvars = extract(msgid);
  const msgstrvars = extract(msgstr);

  const missing = difference(msgidvars, msgstrvars);
  const extra = difference(msgstrvars, msgidvars);

  if (missing.length) {
    fail(`Missing from msgstr: ${missing.join(' ')}`, { file, line, msgid, msgstr });
  }
  if (extra.length) {
    fail(`Unexpected in msgstr: ${extra.join(' ')}`, { file, line, msgid, msgstr });
  }
};

const runState = (state, line, data = {}) => {
  const done = state.find(([ regex, callback ]) => {
    const match = line.match(regex);
    if (match) {
      callback(match);
    }
    return match;
  });

  if (! done) {
    fail(`(${state}) Unexpected input: ${line}`, { ...data, text: line, state });
  }
};

process.argv.slice(1).forEach((filename) => {
  let state = 0;
  let msgid = null;
  let msgstr = null;
  let msgstrlineno = 0;

  const lines = readFileSync(filename, 'utf8').split('\n');

  lines.forEach((line, lineno) => {
    if (line.match(/^#/)) {
      return;
    }

    line = line.trim();

    const states = [
      // 0 - expecting `msgid`
      [
        [/^$/, () => null],
        [/^msgid\s+(.*)$/, (match) => {
          msgid = unqqbackslash(match[1]);
          state = 1;
        }],
      ],
      // 1 - expecting `msgstr`, or more bits of previous msgid
      [
        [/^msgstr\s+(.*)$/, (match) => {
          msgstr = unqqbackslash(match[1]);
          msgstrlineno = lineno + 1;
          state = 2;
        }],
        [/^"/, () => {
          msgid += unqqbackslash(line);
        }],
      ],
      // 2 - expecting newline, or more bits of previous msgstr
      [
        [/^$/, () => {
          process_pair(msgid, msgstr, filename, msgstrlineno);

          state = 0;
          msgid = null;
          msgstr = null;
          msgstrlineno = 0;
        }],
        [/^"/, () => {
          msgstr += unqqbackslash(line);
        }]
      ],
    ];

    runState(states[state], line, { file: filename, line: lineno + 1 });
  });

  process_pair(msgid, msgstr, filename, msgstrlineno);
});

console.log(errors);
process.exit(errors.length ? 1 : 0);
