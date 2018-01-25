function() {
  // some common reuseable stuff
  var docBusinessId = getBusinessId(doc, oldDoc);
  var docBusinessIdNumber = Number(docBusinessId);
  var typeRegex = createBusinessEntityRegex('paymentProcessor\\.([A-Za-z0-9_-]+)\\.processedSettlement\\.([A-Za-z0-9_-]+)');
  var typeRegexMatchGroups = typeRegex.exec(doc._id);
  var PROCESSOR_ID_MATCH_GROUP = 1;
  var SETTLEMENT_ID_MATCH_GROUP = 2;

  return {
    channels: function(doc, oldDoc) {
      // Only staff/service users can create, replace or delete payment processor settlements to prevent regular users from tampering
      return {
        view: [ toSyncChannel(docBusinessId, 'VIEW_PAYMENT_PROCESSOR_SETTLEMENTS'), staffChannel ],
        write: staffChannel
      };
    },
    typeFilter: function(doc, oldDoc) {
      return typeRegexMatchGroups && typeRegexMatchGroups.length === 3;
    },
    immutable: true,
    propertyValidators: {
      businessId: {
        // The ID of the business with which the settlement is associated
        type: 'integer',
        required: true,
        minimumValue: docBusinessIdNumber,
        maximumValue: docBusinessIdNumber,
        immutable: true
      },
      transferId: {
        // The ID of the Books transfer record that represents the settlement
        type: 'integer',
        required: true,
        minimumValue: 1,
        immutable: true
      },
      settlementId: {
        // The ID of the settlement as provided by the payment processor
        type: 'string',
        required: true,
        mustNotBeEmpty: true,
        immutable: true,
        mustEqual: function(doc, oldDoc, value, oldValue) {
          return typeRegexMatchGroups[SETTLEMENT_ID_MATCH_GROUP];
        }
      },
      processorId: {
        // The Kashoo payment processor associated with the settlement
        type: 'string',
        required: true,
        mustNotBeEmpty: true,
        immutable: true,
        mustEqual: function(doc, oldDoc, value, oldValue) {
          return typeRegexMatchGroups[PROCESSOR_ID_MATCH_GROUP];
        }
      },
      capturedAt: {
        // The date that the settlement was completed (captured)
        type: 'datetime',
        required: true,
        immutable: true
      },
      processedAt: {
        // The date/time at which the settlement was processed/imported to Kashoo
        type: 'datetime',
        required: true,
        immutable: true
      },
      amount: {
        // The raw amount that was paid as an integer (e.g. 19999)
        type: 'integer',
        minimumValue: 1,
        required: true
      },
      currency: {
        // The currency of the settlement amount
        type: 'string',
        required: true,
        regexPattern: iso4217CurrencyCodeRegex
      },
      processorMessage: {
        // The message specified by the payment processor as part of the settlement
        type: 'string'
      }
    }
  };
}
