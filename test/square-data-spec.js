var synctos = require('synctos');
var testFixtureMaker = synctos.testFixtureMaker;
var errorFormatter = synctos.validationErrorFormatter;

var staffChannel = 'STAFF';

describe('square-data database:', function() {
  var testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/square-data/sync-function.js');

  afterEach(function() {
    testFixture.resetTestEnvironment();
  });

  /* Generic function for doing a set of common tests against a given document type */
  function testDocumentType(basePrivilege, documentIdType) {
    it('successfully creates a valid document', function() {
      // kashooId is omitted from this document to test that the validator will accept that case
      var doc = {
        _id: 'merchant.3.' + documentIdType + '.2',
        id: documentIdType + '-ID',
        entity: { somekey: 'somevalue' },
        lastModified: '2016-02-29T17:13:43.666Z',
        kashooId: 12345,
        processingFailure: 'this is a processing failure'
      };

      verifyDocumentCreated(basePrivilege, 3, doc);
    });

    it('cannot create a document when the fields are of the wrong types', function() {
      var doc = {
        _id: 'merchant.3.' + documentIdType + '.2',
        id: 79,
        kashooId: 'some-string',
        entity: [ 'not', 'the', 'right', 'type' ],
        lastModified: 'lkjasdflkj',
        processingFailure: 98213098
      };

      verifyDocumentNotCreated(
        basePrivilege,
        3,
        doc,
        documentIdType,
        [
          errorFormatter.typeConstraintViolation('id', 'string'),
          errorFormatter.typeConstraintViolation('kashooId', 'integer'),
          errorFormatter.typeConstraintViolation('entity', 'object'),
          errorFormatter.typeConstraintViolation('lastModified', 'datetime'),
          errorFormatter.typeConstraintViolation('processingFailure', 'string')
        ]);
    });

    it('cannot create a document that has a non-positive kashooId field', function() {
      var doc = {
        _id: 'merchant.3.' + documentIdType + '.2',
        id: documentIdType + '-ID',
        entity: { somekey: 'somevalue' },
        lastModified: '2016-02-29T17:13:43.666Z',
        kashooId: 0
      };

      verifyDocumentNotCreated(basePrivilege, 3, doc, documentIdType, errorFormatter.minimumValueViolation('kashooId', 1));
    });

    it('successfully replaces a valid document', function() {
      var doc = {
        _id: 'merchant.3.' + documentIdType + '.2',
        id: documentIdType + '-ID',
        entity: { somekey: 'somevalue' },
        lastModified: '2016-02-29T17:13:43.666Z',
        kashooId: 98230980935
      };
      var oldDoc = { _id: 'merchant.3.' + documentIdType + '.2', lastModified: '2016-02-29T17:14:43.666Z', };

      verifyDocumentReplaced(basePrivilege, 3, doc, oldDoc);
    });

    it('cannot replace a document when the square entity and ID fields are missing', function() {
      var doc = {
        _id: 'merchant.3.' + documentIdType + '.2',
        kashooId: 78234672
      };
      var oldDoc = { _id: 'merchant.3.' + documentIdType + '.2', };

      verifyDocumentNotReplaced(
        basePrivilege,
        3,
        doc,
        oldDoc,
        documentIdType,
        [ errorFormatter.requiredValueViolation('id'), errorFormatter.requiredValueViolation('entity') ]
      )
    });

    it('successfully deletes a document', function() {
      var oldDoc = {
        _id: 'merchant.8.' + documentIdType + '.2',
        entity: { somekey: 'somevalue' },
        _deleted: true
      };

      verifyDocumentDeleted(basePrivilege, 8, oldDoc);
    });
  };

  describe('fee document definition', function() { testDocumentType('FEE', 'fee') });
  describe('item document definition', function() { testDocumentType('ITEM', 'item') });
  describe('payment document definition', function() { testDocumentType('PAYMENT', 'payment') });
  describe('refund document definition', function() { testDocumentType('REFUND', 'refund') });
  describe('settlement document definition', function() { testDocumentType('SETTLEMENT', 'settlement') });

  function verifyDocumentCreated(basePrivilegeName, merchantId, doc) {
    testFixture.verifyDocumentCreated(doc, [ staffChannel, merchantId + '-ADD_' + basePrivilegeName ]);
  }

  function verifyDocumentNotCreated(basePrivilegeName, merchantId, doc, docType, expectedErrorMessages) {
    testFixture.verifyDocumentNotCreated(doc, docType, expectedErrorMessages, [ staffChannel, merchantId + '-ADD_' + basePrivilegeName ]);
  }

  function verifyDocumentReplaced(basePrivilegeName, merchantId, doc, oldDoc) {
    testFixture.verifyDocumentReplaced(doc, oldDoc, [ staffChannel, merchantId + '-CHANGE_' + basePrivilegeName ]);
  }

  function verifyDocumentNotReplaced(basePrivilegeName, merchantId, doc, oldDoc, docType, expectedErrorMessages) {
    testFixture.verifyDocumentNotReplaced(doc, oldDoc, docType, expectedErrorMessages, [ staffChannel, merchantId + '-CHANGE_' + basePrivilegeName ]);
  }

  function verifyDocumentDeleted(basePrivilegeName, merchantId, oldDoc) {
    testFixture.verifyDocumentDeleted(oldDoc, [ staffChannel, merchantId + '-REMOVE_' + basePrivilegeName ]);
  }
});
