# philentropyst

Masking tool to efficiently mask sensible data in CSV files (and more to come)

# Install

> Prerequisite is having NodeJS 14+ installed

To install globally and make it available as command line tool
just type

`npm i philentropyst -g`

# Usage

Once installed run

`philentropyst -i inputfile.csv -s inputfile.schema.yml`

To create a necessary masking schema do:

`philentropyst schema -o inputfile.schema.yml`

Open the file in your editor and start editing according your needs

To get more help type:

`philentropyst --help`


# Data Generators

See [Generator Types](./GENERATOR_TYPES.md)

