#!/usr/bin/env ruby
require 'json'

if ARGV.empty?
  $stderr.puts "#{$0}: no files"
  $stderr.puts "use: #{$0} <files>"
  exit 1
end

# find any {num} {str} <num> </num> <num/> %(str)s
REGEX = /(\{(\w+|\d+)\})|(<\/?\d+\/?>)|(%(\(\w+\))?.)/

# s.undump if only it worked with utf8 strings
def unqqbackslash(s)
  JSON.parse("#{s}")
end

def process_pair(msgid, msgstr, file, line)
  # handling eof while still in state 2; magic id, untranslated strings
  return true if msgid.nil? or msgstr.nil?
  return true if msgid.empty?
  return true if msgstr.empty?

  msgidvars = msgid.scan(REGEX).map { |m| m.compact.first }
  msgstrvars = msgstr.scan(REGEX).map { |m| m.compact.first }

  missing = msgidvars - msgstrvars
  extra = msgstrvars - msgidvars
  if missing.any? or extra.any?
    message = ""
    if missing.any?
      msg = "Missing from msgstr: #{missing.join(' ')}"
      $stderr.puts "::error file=#{file},line=#{line}::#{msg.gsub(/[\r\n]/, '').gsub('%', '%25')}" if ENV['GITHUB_ACTIONS']
      message += "  #{msg}\n"
    end
    if extra.any?
      msg = "Unexpected in msgstr: #{extra.join(' ')}"
      $stderr.puts "::error file=#{file},line=#{line}::#{msg.gsub(/[\r\n]/, '').gsub('%', '%25')}" if ENV['GITHUB_ACTIONS']
      message += "  #{msg}\n"
    end
    message += "  at #{file}:#{line}"

    $stderr.puts "Difference between msgid=\"#{msgid}\" and msgstr=\"#{msgstr}\":\n#{message}\n\n"
    return false
  end

  return true
end

errors = false

ARGV.each do |filename|
  state = 0
  msgid = nil
  msgstr = nil
  msgstrlineno = 0

  IO.readlines(filename).each_with_index do |line, lineno|
    next if line =~ /^#/
    line = line.chomp.sub(/^\s*/, '')

    case state
      when 0 # expecting `msgid`
        next if line =~ /^$/;

        if line =~ /^msgid\s+/
          msgid = unqqbackslash($')
          state = 1
          next
        end

        warn "(#{state}) Unexpected input: #{line}"
        errors = true

      when 1 # expecting `msgstr`, or more bits of previous msgid
        if line =~ /^msgstr\s+/
          msgstr = unqqbackslash($')
          msgstrlineno = lineno + 1
          state = 2
          next
        end

        if line =~ /^"/
          msgid += unqqbackslash(line)
          next
        end

        warn "(#{state}) Unexpected input: #{line}"
        errors = true

      when 2 # expecting newline, or more bits of previous msgstr
        if line =~ /^$/
          errors = true unless process_pair(msgid, msgstr, filename, msgstrlineno)
          state = 0
          msgid = nil
          msgstr = nil
          msgstrlineno = 0
          next
        end

        if line =~ /^"/
          msgstr += unqqbackslash(line)
          next
        end

        warn "(#{state}) Unexpected input: #{line}"
        errors = true
    end
  end

  errors = true unless process_pair(msgid, msgstr, filename, msgstrlineno)
end

exit(errors ? 1 : 0)
