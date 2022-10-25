/*! @license MIT ©2013-2016 Ruben Verborgh, Ghent University - imec */
let JsonLdEndpointDatasource = require('../..').datasources.JsonLdEndpointDatasource;

let Datasource = require('@ldf/core').datasources.Datasource,
    fs = require('fs'),
    path = require('path'),
    URL = require('url');

let jsonResult = fs.readFileSync(path.join(__dirname, '../../../../test/assets/sparql-quads-response.json'));
let countResult = '"c"\n12345678\n';

describe('JsonLdEndpointDatasource', () => {
  describe('The JsonLdEndpointDatasource module', () => {
    it('should be a function', () => {
      JsonLdEndpointDatasource.should.be.a('function');
    });

    it('should be a JsonLdEndpointDatasource constructor', () => {
      new JsonLdEndpointDatasource({}).should.be.an.instanceof(JsonLdEndpointDatasource);
    });

    it('should create Datasource objects', () => {
      new JsonLdEndpointDatasource({}).should.be.an.instanceof(Datasource);
    });
  });

  describe('A JsonLdEndpointDatasource instance', () => {
    let request = sinon.stub();
    let datasource = new JsonLdEndpointDatasource({ endpoint: 'http://api.conceptnet.io/query', request: request });
    datasource.initialize();

    it('should indicate support for its features', () => {
      datasource.supportedFeatures.should.deep.equal({
        triplePattern: true,
        quadPattern: true,
        limit: true,
        offset: true,
        totalCount: true,
      });
    });

    it('should support the empty query', () => {
      datasource.supportsQuery({}).should.be.true;
    });

    it('should support a query with supported features', () => {
      datasource.supportsQuery({ features: { limit: true, offset: true, b: false } }).should.be.true;
    });

    it('should not support a query with unsupported features', () => {
      datasource.supportsQuery({ features: { limit: true, b: true } }).should.be.false;
    });

    it('should throw an error when trying to execute an unsupported query', (done) => {
      datasource.select({ features: { a: true, b: true } }, (error) => {
        error.should.be.an.instanceOf(Error);
        error.should.have.property('message', 'The datasource does not support the given query');
        done();
      });
    });

    

    describe('when invalid JSON is returned in response to the data query', () => {
      let result, error;
      before((done) => {
        request.reset();
        request.onFirstCall().returns(test.createHttpResponse('invalid', 'application/sparql-results+json'));
        request.onSecondCall().returns(test.createHttpResponse(countResult, 'text/csv'));
        let query = { subject: dataFactory.namedNode('abcd'), features: { quadPattern: true } };
        result = datasource.select(query);
        result.on('error', (e) => { error = e; done(); });
      });

      it('should emit an error', () => {
        error.should.have.property('message', 'Error accessing SPARQL endpoint http://ex.org/sparql: The endpoint returned an invalid SPARQL results JSON response.');
      });
    });

    describe('when invalid JSON is returned in response to the count query', () => {
      let result, error;
      before((done) => {
        request.reset();
        request.onFirstCall().returns(test.createHttpResponse(jsonResult, 'application/sparql-results+json'));
        request.onSecondCall().returns(test.createHttpResponse('invalid', 'application/trig'));
        let query = { subject: dataFactory.namedNode('abcde'), features: { quadPattern: true } };
        result = datasource.select(query);
        result.on('error', (e) => { error = e; done(); });
      });

      it('should emit an error', () => {
        error.should.have.property('message', 'Error accessing SPARQL endpoint http://ex.org/sparql: COUNT query failed.');
      });
    });

    describe('when the data query request errors', () => {
      let result, error;
      before((done) => {
        request.reset();
        let query = { subject: dataFactory.namedNode('abcde'), features: { quadPattern: true } };
        result = datasource.select(query);
        result.on('error', (e) => { error = e; done(); });
        request.getCall(0).callArgWith(1, Error('query response error'));
      });

      it('should emit an error', () => {
        error.should.have.property('message', 'Error accessing SPARQL endpoint http://ex.org/sparql: query response error');
      });
    });

    describe('when the count query request errors', () => {
      let result, totalCount;
      before(() => {
        request.reset();
        let query = { subject: dataFactory.namedNode('abcdef'), features: { quadPattern: true } };
        result = datasource.select(query);
        request.returnValues[1].emit('error', new Error());
        result.getProperty('metadata', (metadata) => { totalCount = metadata.totalCount; });
      });

      it('should emit a high count estimate', () => {
        expect(totalCount).to.equal(1e9);
      });
    });
  });

  describe('A JsonLdEndpointDatasource instance with forceTypedLiterals true', () => {
    let request = sinon.stub();
    let datasource = new JsonLdEndpointDatasource({ dataFactory, endpoint: 'http://ex.org/sparql', request: request, forceTypedLiterals: true });
    datasource.initialize();
    
  });
});

function itShouldExecute(datasource, request, name, query, constructQuery, countQuery) {
  describe('executing ' + name, () => {
    let result, totalCount;
    before(() => {
      request.reset();
      request.onFirstCall().returns(test.createHttpResponse(jsonResult, 'application/sparql-results+json'));
      request.onSecondCall().returns(test.createHttpResponse(countResult, 'text/csv'));
      result = datasource.select(query);
      result.getProperty('metadata', (metadata) => { totalCount = metadata.totalCount; });
    });

    it('should request a matching CONSTRUCT query', () => {
      request.should.have.been.called;
      let url = URL.parse(request.firstCall.args[0].url, true);
      (url.protocol + '//' + url.host + url.pathname).should.equal('http://ex.org/sparql');
      url.query.query.should.equal(constructQuery);
    });

    if (countQuery) {
      it('should request a matching COUNT query', () => {
        request.should.have.been.calledTwice;
        let url = URL.parse(request.secondCall.args[0].url, true);
        (url.protocol + '//' + url.host + url.pathname).should.equal('http://ex.org/sparql');
        url.query.query.should.equal(countQuery);
      });
    }
    else {
      it('should use the cached COUNT result', () => {
        request.should.have.been.calledOnce;
      });
    }

    it('should emit all triples in the SPARQL response', (done) => {
      result.should.be.a.streamWithLength(55, done);
    });

    it('should emit the extracted count', () => {
      expect(totalCount).to.equal(12345678);
    });
  });
}
