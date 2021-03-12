# Generator Types

This document describes the types of data that is supported by
_philentropyst_

## Configuring Generator Types

The generator (also: field) types are mostly generated using [FakerJS](https://github.com/marak/Faker.js/).
This library supports a bunch of "real world" data generators, which are best described [here](https://fakerjsdocs.netlify.app/)

### Additional Parameters

Some data generators support additional parameters, e.g. range for random numbers. The additional
parameters are defined in an _optional_ `options` field. As the YAML schema get's transformed into a JSON object
following considerations need to be respected:

__Value Parameter__

`random.words` accepts a [value as parameter](https://fakerjsdocs.netlify.app/api/random.html#words-count) to determine the number of words to be generated

This is how you define a value parameter

> To Do: support multiple value parameters

```yaml
masks:
- field:
    ref: seed 
    type: random.words
    options: 12
```

__Object Parameter__

`random.number` accepts an [object as parameter](https://fakerjsdocs.netlify.app/api/random.html#number-options) in the format `{ min, max, precision }`

So, here is how to define a random number for the US SSN (no punctuation) 

```yaml
masks:
- field:
    ref: ssn 
    type: random.number
    options:
      min: 100000000
      max: 999999999
```

__Array Parameter__

`random.arrayElement` accepts an [array as parameter](https://fakerjsdocs.netlify.app/api/random.html#number-options) in the format `{ min, max, precision }`

So, here is how to define a random number for the US SSN (no punctuation)

```yaml
masks:
- field:
    ref: ssn 
    type: random.number
    options:
      min: 100000000
      max: 999999999
```

### Non-FakerJS Generators

FakerJS is pretty complete, nevertheless there is still place for extension, and so additional generators are supported by `philentropyst` 
All these generators start with the suffix `custom.` - these are described [here](./CUSTOM_GENERATOR_TYPES.md)

__Configuration Example__

Suppose we want to replace a persons name inside a file and hiding his true age. The files (CSV) structure is

```
Id, FirstName, LastName, Age, Password
1, Oliver, Hager, 23, 123securepass
2, Walter, White, 39, 12345679evenmoresecure
...
```

In our schema we would write inside the `masks` section:

```yaml
masks:
- field:
    # case insensitive
    ref: firstname 
    # see https://fakerjsdocs.netlify.app/api/name.html#firstname-gender
    type: name.firstName
- field:
    ref: lastname
    type: name.lastName
- field:
    ref: age
    # see https://fakerjsdocs.netlify.app/api/random.html#number-options
    type: random.number
    # these are the options supported by random.number
    options: 
      min: 10
      max: 99
- field:
    ref: password
    # custom fake data is exclusively supported by philentropyst
    type: custom.fixedValue
    options: '****'
```


