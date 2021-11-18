#!/usr/bin/env python3
import json
import re
import os
import sys

if len(sys.argv) <= 1:
  print(f"{sys.argv[0]}: no files", file=sys.stderr)
  print(f"use: {sys.argv[0]} <files>", file=sys.stderr)
  sys.exit(1)

# find any {num} {str} <num> </num> <num/> %(str)s
REGEX = r'(\{(\w+|\d+)\})|(<\/?\d+\/?>)|(%(\(\w+\))?.)'

# s.encode('utf-8').decode('unicode-escape') if only it worked with utf8 strings
def unqqbackslash(s):
  return json.loads(s)

def process_pair(msgid, msgstr, file, line):
  # handling eof while still in state 2; magic id, untranslated strings
  if msgid == None or msgstr == None or len(msgid) == 0 or len(msgstr) == 0:
    return True

  # findall(...).map((arr) => arr.compact.first)
  msgidvars = [ [truthy for truthy in match if truthy][0] for match in re.findall(REGEX, msgid) ]
  msgstrvars = [ [truthy for truthy in match if truthy][0] for match in re.findall(REGEX, msgstr) ]

  missing = list( set(msgidvars) - set(msgstrvars) )
  extra = list( set(msgstrvars) - set(msgidvars) )

  if len(missing) or len(extra):
    message = ""
    if len(missing):
      msg = f"Missing from msgstr: {' '.join(missing)}"
      if os.environ.get('GITHUB_ACTIONS'):
        s = msg.replace("\r", "").replace("\n", "").replace('%', '%25')
        print(f"::error file={file},line={line}::{s}", file=sys.stderr)
      message += f"  {msg}\n"
    if len(extra):
      msg = f"Unexpected in msgstr: {' '.join(extra)}"
      if os.environ.get('GITHUB_ACTIONS'):
        s = msg.replace("\r", "").replace("\n", "").replace('%', '%25')
        print(f"::error file={file},line={line}::{s}", file=sys.stderr)
      message += f"  {msg}\n"
    message += f"  at {file}:{line}"

    print(f"Difference between msgid=\"{msgid}\" and msgstr=\"{msgstr}\":\n{message}\n", file=sys.stderr)
    return False

  return True

errors = False

for filename in sys.argv[1:]:
  state = 0
  msgid = None
  msgstr = None
  msgstrlineno = 0
  lines = None

  with open(filename) as f:
    lines = f.read().splitlines()

  for lineno, line in enumerate(lines):
    if re.match(r'^#', line):
      continue

    line = line.strip()

    if state == 0: # expecting `msgid`
      if re.match(r'^$', line):
        continue

      if m := re.match(r'^msgid\s+(.*)$', line):
        msgid = unqqbackslash(m[1])
        state = 1
        continue

      warnings.warn(f"({state}) Unexpected input: {line}")
      errors = True

    elif state == 1: # expecting `msgstr`, or more bits of previous msgid
      if m := re.match(r'^msgstr\s+(.*)$', line):
        msgstr = unqqbackslash(m[1])
        msgstrlineno = lineno + 1
        state = 2
        continue

      if re.match(r'^"', line):
        msgid += unqqbackslash(line)
        continue

      warnings.warn(f"({state}) Unexpected input: {line}")
      errors = True

    elif state == 2: # expecting newline, or more bits of previous msgstr
      if re.match(r'^$', line):
        if not process_pair(msgid, msgstr, filename, msgstrlineno):
          errors = True

        state = 0
        msgid = None
        msgstr = None
        msgstrlineno = 0
        continue

      if re.match(r'^"', line):
        msgstr += unqqbackslash(line)
        continue

      warnings.warn(f"({state}) Unexpected input: {line}")
      errors = True

  if not process_pair(msgid, msgstr, filename, msgstrlineno):
    errors = True

sys.exit(1 if errors else 0)
