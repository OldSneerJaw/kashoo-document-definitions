var businessSyncSpecHelperMaker = require('./helpers/business-sync-spec-helper-maker.js');
var synctos = require('synctos');
var testFixtureMaker = synctos.testFixtureMaker;
var errorFormatter = synctos.validationErrorFormatter;

describe('business-sync notifications reference document definition', function() {
  var testFixture = testFixtureMaker.initFromSyncFunction('build/sync-functions/business-sync/sync-function.js');
  var businessSyncSpecHelper = businessSyncSpecHelperMaker.init(testFixture);

  afterEach(function() {
    testFixture.resetTestEnvironment();
  });

  var expectedDocType = 'notificationsReference';
  var expectedBasePrivilege = 'NOTIFICATIONS';

  it('successfully creates a valid notifications reference document', function() {
    var doc = {
      _id: 'biz.4.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    businessSyncSpecHelper.verifyDocumentCreated(expectedBasePrivilege, 4, doc);
  });

  it('cannot create a notifications reference document when the properties are invalid', function() {
    var doc = {
      _id: 'biz.123.notifications',
      allNotificationIds: [ 23, 'Y', 'Z' ],
      unreadNotificationIds: [ 'Z', '' ]
    };

    businessSyncSpecHelper.verifyDocumentNotCreated(
      expectedBasePrivilege,
      123,
      doc,
      expectedDocType,
      [
        errorFormatter.typeConstraintViolation('allNotificationIds[0]', 'string'),
        errorFormatter.mustNotBeEmptyViolation('unreadNotificationIds[1]')
      ]);
  });

  it('successfully replaces a valid notifications reference document', function() {
    var doc = {
      _id: 'biz.44.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z', 'A' ],
      unreadNotificationIds: [ 'X', 'Z', 'A' ]
    };
    var oldDoc = {
      _id: 'biz.44.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    businessSyncSpecHelper.verifyDocumentReplaced(expectedBasePrivilege, 44, doc, oldDoc);
  });

  it('cannot replace a notifications reference document when the properties are invalid', function() {
    var doc = {
      _id: 'biz.29.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z', '' ],
      unreadNotificationIds: [ 'X', 'Z', 5 ]
    };
    var oldDoc = {
      _id: 'biz.29.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    businessSyncSpecHelper.verifyDocumentNotReplaced(
      expectedBasePrivilege,
      29,
      doc,
      oldDoc,
      expectedDocType,
      [
        errorFormatter.mustNotBeEmptyViolation('allNotificationIds[3]'),
        errorFormatter.typeConstraintViolation('unreadNotificationIds[2]', 'string')
      ]);
  });

  it('successfully deletes a notifications reference document', function() {
    var oldDoc = {
      _id: 'biz.369.notifications',
      allNotificationIds: [ 'X', 'Y', 'Z' ],
      unreadNotificationIds: [ 'X', 'Z' ]
    };

    businessSyncSpecHelper.verifyDocumentDeleted(expectedBasePrivilege, 369, oldDoc);
  });
});
