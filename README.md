# Linked Data Fragments Server - JSON-LD Endpoint Datasources
<img src="http://linkeddatafragments.org/images/logo.svg" width="200" align="right" alt="" />

[![npm version](https://badge.fury.io/js/%40ldf%2Fdatasource-jsonld-endpoint.svg)](https://www.npmjs.com/package/@ldf/datasource-jsonld-endppoint)


This module contains a JSON-LD endpoint datasource for the [Linked Data Fragments server](https://github.com/LinkedDataFragments/Server.js).
It allows JSON-LD endpoints to be used as a data proxy.

_This package is a [Linked Data Fragments Server module](https://github.com/LinkedDataFragments/Server.js/)._

## Usage in `@ldf/server`

This package exposes the following config entries:
* `JsonLdEndpointDatasource`: A JSON-LD endpoint-based datasource that requires at least one `jsonLdEndpoint` field. _Should be used as `@type` value._
* `jsonLdEndpoint`: Refers to a JSON-LD endpoint capable of receiving and processing requests. _Should be used as key in a `JsonLdEndpointDatasource`._

Example:
```json
{
  "@context": "https://linkedsoftwaredependencies.org/bundles/npm/@ldf/server/^3.0.0/components/context.jsonld",
  "@id": "urn:ldf-server:my",
  "import": "preset-qpf:config-defaults.json",

  "datasources": [
    {
      "@id": "urn:ldf-server:myJsonLdEndpointDatasource",
      "@type": "JsonLdEndpointDatasource",
      "datasourceTitle": "My JSON-LD endpoint source",
      "description": "My datasource with a JSON_LD endpoint back-end",
      "datasourcePath": "myjsonldendpoint",
      "jsonLdEndpoint": "https://api.conceptnet.io/query"
    }
  ]
}
```

## Usage in other packages

When this module is used in a package other than `@ldf/server`,
then the JSON-LD context `https://linkedsoftwaredependencies.org/contexts/@ldf/datasource-sparql.jsonld` must be imported.

For example:
```
{
  "@context": [
    "https://linkedsoftwaredependencies.org/bundles/npm/@ldf/core/^3.0.0/components/context.jsonld",
    "https://linkedsoftwaredependencies.org/bundles/npm/@ldf/preset-qpf/^3.0.0/components/context.jsonld",
    "https://linkedsoftwaredependencies.org/bundles/npm/@ldf/datasource-jsonld-endpoint/^3.0.0/components/context.jsonld",
  ],
  // Same as above...
}
```

## License

The datasource module is written by Marcelo de Oliveira Costa Machado.

The Linked Data Fragments server is written by [Ruben Verborgh](https://ruben.verborgh.org/), Miel Vander Sande, [Ruben Taelman](https://www.rubensworks.net/) and colleagues.

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).
