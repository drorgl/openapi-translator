# openapi-translator

Translate OpenAPI Summary and Description

This utility iterates over the entire json file looking for summary and description and translates them one by one via google translate.

Note: a cache is kept in ~/.openapi-translator for each language used so google translate won't block

Usage:
```
npm install -g @drorgl/openapi-translator
openapi-translator input.json output.json -l en
```
