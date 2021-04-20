# Caching

This document describes how caching works in _philentropyst_

> At this time writing the cache feature is bound to csv schema only

# Motivation

If you handle multiple files which contain personal information about the same entity, e.g. a patients name, you 
may want to use the cache as it "remembers" the referenced information that was generated priorly. The cache is simply a file
stored on your computer (User App Data Path) and is being read to see if specific information was generated before already.

Example:

Imagine you have health claim information received by some trading partner. Over the time you receive several claim files, which
may contain data of the same patient. In most cases you want to keep the claim information consistent and always referencing
the same patient. Using the cache you can keep the same patient information and apply them when the specific patient is being referenced
in other files. 


# How to define

The cache is optional (and per default not active) and can be defined on field basis, i.e. you define the fields that shall be cached.
The field set must be a subset of the entire mask field set. (Otherwise, you will get annoying warnings)

```yaml
schema:
  version: 1.0
  csv:
    delimiter: ,
    multiline: false
    allowQuotes: true
    hasHeader: true
    wrapStringInQuotes: true
    parseNumbers: false
    parseBooleans: false
    trim: true
    # here you define which fields shall be cached
    # they need to match the fields in 'masks' sections
    cache:
      # give it a unique name
      name: cached.data
      fields:
        - firstName
        - lastName
        - cc
  # masks define what fields has to be masked and how
  masks:
    - field:
        ref: firstName
        type: name.firstName
    - field:
        ref: lastName
        type: name.lastName
    - field:
        ref: cc
        type: finance.creditCardNumber
    - field:
        ref: pid
        type: datatype.number
        options:
          min: 1000000
          max: 9999999
```
