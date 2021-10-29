#!/usr/bin/env perl
use v5.30;
use String::Escape qw( unqqbackslash ); # apt install libstring-escape-perl
use Array::Utils qw( array_diff array_minus ); # apt install libarray-utils-perl

sub process {
  my ($msgid, $msgstr) = @_;
  return 1 if not defined $msgid or not defined $msgstr; # handling eof while still in state 2
  return 1 if $msgid eq ""; # magic
  return 1 if $msgstr eq ""; # untranslated

  my @msgidvars = ();
  while ($msgid =~ /\{(\w+|\d+)\}|<\/?\d+\/?>/g) {
    push @msgidvars, $&;
  }
  my @msgstrvars = ();
  while ($msgstr =~ /\{(\w+|\d+)\}|<\/?\d+\/?>/g) {
    push @msgstrvars, $&;
  }

  my @diff = array_diff(@msgidvars, @msgstrvars);
  if (@diff) {
    my @missing = array_minus(@msgidvars, @msgstrvars);
    my @extra = array_minus(@msgstrvars, @msgidvars);
    my $message = "";
    $message .= "  Missing from msgstr: @missing\n" if @missing;
    $message .= "  Unexpected in msgstr: @extra\n" if @extra;
    $message .= " ";

    warn "Difference between msgid=\"$msgid\" and msgstr=\"$msgstr\":\n$message";
    return 0;
  }

  return 1;
}

my $state = 0;
my $msgid;
my $msgstr;
my $exit = 0;

while (<>) {
  next if /^#/;

  chomp;
  s/^\s*//;

  # 0 = expecting `msgid`
  if ($state == 0) {
    next if /^$/;

    if (/^msgid\s+/) {
      $msgid = unqqbackslash($');
      $state = 1;
      next;
    }

    warn "($state) Unexpected input: $_";
    $exit |= 1;
  }

  # 1 = expecting `msgstr`, or more bits of previous msgid
  if ($state == 1) {
    if (/^msgstr\s+/) {
      $msgstr = unqqbackslash($');
      $state = 2;
      next;
    }

    if (/^"/) {
      $msgid .= unqqbackslash($_);
      next;
    }

    warn "($state) Unexpected input: $_";
    $exit |= 1;
  }

  # 2 = expecting newline, or more bits of previous msgstr
  if ($state == 2) {
    if (/^$/) {
      $exit |= 2 unless process($msgid, $msgstr);
      $state = 0;
      $msgid = undef;
      $msgstr = undef;
      next;
    }

    if (/^"/) {
      $msgstr .= unqqbackslash($_);
      next;
    }

    warn "($state) Unexpected input: $_";
    $exit |= 1;
  }
}

$exit |= 2 unless process($msgid, $msgstr);
exit $exit;
