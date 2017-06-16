var businessSyncSpecHelper = require('./modules/business-sync-spec-helper.js');
var testHelper = require('../node_modules/synctos/etc/test-helper.js');
var errorFormatter = testHelper.validationErrorFormatter;

describe('business-sync merchant accounts reference document definition', function() {
  beforeEach(function() {
    testHelper.init('build/sync-functions/business-sync/sync-function.js');
  });

  var expectedDocType = 'merchantAccountsReference';
  var expectedBasePrivilege = 'CUSTOMER_PAYMENT_PROCESSORS';

  it('successfully creates a valid merchant accounts reference document', function() {
    var doc = {
      _id: 'biz.901.merchantAccounts',
      accounts: {
        account1: {
          provider: 'foo',
          merchantAccountId: 'my-merchant-account1',
          authorization: 'my-access-token1',
          paymentProcessorDefinitionId: 'my-payment-processor1',
          registrationConfirmed: '2017-02-17T18:44:35.128-0800'
        },
        account2: {
          provider: 'bar',
          merchantAccountId: 'my-merchant-account2',
          authorization: 'my-access-token2',
          paymentProcessorDefinitionId: 'my-payment-processor2',
          registrationConfirmationRequisitions: [
            '2017-02-16T07:15:32.767-0800'
          ]
        }
      }
    };

    testHelper.verifyDocumentCreated(doc, businessSyncSpecHelper.staffChannel);
  });

  it('cannot create a merchant accounts reference document when the properties are invalid', function() {
    var doc = {
      _id: 'biz.117.merchantAccounts',
      accounts: {
        account1: {
          provider: '',
          merchantAccountId: '',
          authorization: '',
          paymentProcessorDefinitionId: 71,
          registrationConfirmed: 'not-a-date'
        },
        '': {
          provider: 'wepay',
          merchantAccountId: 'my-merchant-account2',
          authorization: 'my-access-token2',
          registrationConfirmationRequisitions: [
            'also-not-a-date'
          ]
        }
      }
    };

    testHelper.verifyDocumentNotCreated(
      doc,
      expectedDocType,
      [
        errorFormatter.hashtableKeyEmpty('accounts'),
        errorFormatter.typeConstraintViolation('accounts[account1].paymentProcessorDefinitionId', 'string'),
        errorFormatter.mustNotBeEmptyViolation('accounts[account1].authorization'),
        errorFormatter.mustNotBeEmptyViolation('accounts[account1].merchantAccountId'),
        errorFormatter.mustNotBeEmptyViolation('accounts[account1].provider'),
        errorFormatter.datetimeFormatInvalid('accounts[account1].registrationConfirmed'),
        errorFormatter.requiredValueViolation('accounts[].paymentProcessorDefinitionId'),
        errorFormatter.datetimeFormatInvalid('accounts[].registrationConfirmationRequisitions[0]')
      ],
      businessSyncSpecHelper.staffChannel);
  });

  it('successfully replaces a valid merchant accounts reference document', function() {
    var doc = { _id: 'biz.88.merchantAccounts' };
    var oldDoc = {
      _id: 'biz.88.merchantAccounts',
      accounts: {
        account88: {
          provider: 'wepay',
          merchantAccountId: 'my-merchant-account88',
          authorization: 'my-access-token88',
          paymentProcessorDefinitionId: 'my-payment-processor2',
          registrationConfirmed: '2017-02-17',
          registrationConfirmationRequisitions: [ '2017-02-16', '2017-02-17' ]
        }
      }
    };

    testHelper.verifyDocumentReplaced(doc, oldDoc, businessSyncSpecHelper.staffChannel);
  });

  it('cannot replace a merchant accounts reference document when the properties are invalid', function() {
    var doc = {
      _id: 'biz.1.merchantAccounts',
      accounts: {
        account1: {
          provider: 0,
          merchantAccountId: 13.5,
          authorization: true,
          paymentProcessorDefinitionId: '',
          registrationConfirmed: 1283472
        },
        account2: { registrationConfirmationRequisitions: '' }
      }
    };
    var oldDoc = { _id: 'biz.1.merchantAccounts' };

    testHelper.verifyDocumentNotReplaced(
      doc,
      oldDoc,
      expectedDocType,
      [
        errorFormatter.typeConstraintViolation('accounts[account1].provider', 'string'),
        errorFormatter.typeConstraintViolation('accounts[account1].merchantAccountId', 'string'),
        errorFormatter.typeConstraintViolation('accounts[account1].authorization', 'string'),
        errorFormatter.typeConstraintViolation('accounts[account1].registrationConfirmed', 'datetime'),
        errorFormatter.mustNotBeEmptyViolation('accounts[account1].paymentProcessorDefinitionId'),
        errorFormatter.requiredValueViolation('accounts[account2].authorization'),
        errorFormatter.requiredValueViolation('accounts[account2].merchantAccountId'),
        errorFormatter.requiredValueViolation('accounts[account2].provider'),
        errorFormatter.requiredValueViolation('accounts[account2].paymentProcessorDefinitionId'),
        errorFormatter.typeConstraintViolation('accounts[account2].registrationConfirmationRequisitions', 'array')
      ],
      businessSyncSpecHelper.staffChannel);
  });

  it('successfully deletes a payment processor customer default summary document', function() {
    var doc = { _id: 'biz.2.merchantAccounts', _deleted: true };
    var oldDoc = {
      _id: 'biz.2.merchantAccounts',
      accounts: { }
    };

    testHelper.verifyDocumentDeleted(doc, businessSyncSpecHelper.staffChannel);
  });
});
