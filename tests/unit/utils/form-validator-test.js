import FormValidator from 'ember-legit-forms/utils/form-validator';
import { module, test } from 'qunit';
import Ember from 'ember';

module('Unit | Utility | form validator');

function generateLookupStub(returnValues) {
  return Ember.Object.create({
    lookupValidator(_, name) {
      return {
        validate() {
          return returnValues[name];
        }
      };
    }
  });
}

function generateParserStub() {
  return Ember.Object.create({
    parseRule(ruleName) {
      return [{
        name: ruleName
      }];
    }
  });
}

test('it creates fields from rules', function(assert) {
  let subject = FormValidator.create().set('rules', {
    password: 'required',
    name: 'required|min(6)'
  });

  assert.deepEqual(subject.get('fields')[0].getProperties('name', 'valid'), {
    name: 'password',
    valid: null
  });

  assert.deepEqual(subject.get('fields')[1].getProperties('name', 'valid'), {
    name: 'name',
    valid: null
  });
});

test('it gets correct validation when all fields correct', function(assert) {
  let subject = FormValidator.create().setProperties({
    parserService: generateParserStub(),
    lookupService: generateLookupStub({
      required: true
    }),
    rules: {
      password: 'required'
    }
  });

  let validation = subject.getValidateFunction('password');
  assert.deepEqual(validation, {
    messages: [],
    isValid: true
  });
});

test('it sets correctly fields when all fields correct', function(assert) {
  let subject = FormValidator.create().setProperties({
    parserService: generateParserStub(),
    lookupService: generateLookupStub({
      required: true
    }),
    rules: {
      password: 'required'
    }
  });

  subject.getValidateFunction('password');

  assert.deepEqual(subject.get('fields')[0].getProperties('name', 'valid'), {
    name: 'password',
    valid: true
  }, 'should return fields');
});

test('it marks wrong fields', function(assert) {
  let subject = FormValidator.create().setProperties({
    parserService: generateParserStub(),
    lookupService: generateLookupStub({
      numeric: false
    }),
    rules: {
      phone: 'numeric'
    }
  });

  subject.getValidateFunction('phone');
  assert.deepEqual(subject.get('fields')[0].getProperties('name', 'valid'), {
    name: "phone",
    valid: false
  });

});

test('it correctly recalculates fields', function(assert) {
  let subject = FormValidator.create().setProperties({
    parserService: generateParserStub(),
    lookupService: generateLookupStub({
      numeric: false
    }),
    rules: {
      phone: 'numeric'
    }
  });

  subject.getValidateFunction('phone');
  assert.deepEqual(subject.get('fields')[0].getProperties('name', 'valid'), {
    name: "phone",
    valid: false
  });

  subject.set('lookupService', generateLookupStub({ numeric: true }));

  subject.getValidateFunction('phone');

  assert.deepEqual(subject.get('fields')[0].getProperties('name', 'valid'), {
    "name": "phone",
    "valid": true
  });
});

test('it sets and recalculates isFormValid property correctly', function(assert) {
  let subject = FormValidator.create().setProperties({
    parserService: generateParserStub(),
    lookupService: generateLookupStub({
      numeric: true,
      required: true
    }),
    rules: {
      phone: 'numeric',
      password: 'required'
    }
  });

  subject.getValidateFunction('phone');
  subject.getValidateFunction('password');

  assert.ok(subject.get('isFormValid'));

  subject.set('lookupService', generateLookupStub({
    numeric: true,
    required: false
  }));


  subject.getValidateFunction('phone');
  subject.getValidateFunction('password');

  assert.equal(subject.get('isFormValid'), false);
});