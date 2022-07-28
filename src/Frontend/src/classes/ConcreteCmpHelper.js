"use strict";

import { AbstractCmpHelper, config as settings } from './AbstractCmpHelper.js';

/**
 * @module ConcreteCmpHelper
 * @class
 * @abstract
 * @classdesc GDPR-Tools client-side CMP integration.
 *
 * @author Marwan Al-Soltany <MarwanAlsoltany@gmail.com>
 */
class ConcreteCmpHelper extends AbstractCmpHelper {
  /**
   * @var {string} cookieName - CMP settings cookie name.
   *
   * @private
   * @static
   */
  #cookieName = 'cookie';

  /**
   * @var {string} objectName - CMP object name.
   *
   * @private
   * @static
   */
  #objectName = 'object';

  /**
   * @var {string} updateEventName - CMP update event name.
   *
   * @private
   * @static
   */
  #updateEventName = 'event';

  /**
   * @var {object.<string,Function>} functions - CMP update event name.
   * @property {Function} functions.showDialog - A callback to show CMP dialog.
   * @property {Function} functions.consentTo - A callback to consent to the given category in CMP object.
   * @property {Function} functions.isConsentedTo - A callback to check if consent is given to the given category in the CMP object.
   *
   * @private
   * @static
   */
  static #functions = {};

  /**
   * @param {string} cookieName - CMP settings cookie name.
   *
   * @param {string} objectName - CMP object name.
   *
   * @param {string} updateEventName - CMP update event name.
   *
   * @param {object.<string,Function>} functions - CMP update event name.
   * @param {Function} functions.showDialog - A callback to show CMP dialog.
   * @param {Function} functions.consentTo - A callback to consent to the given category in CMP object.
   * @param {Function} functions.isConsentedTo - A callback to check if consent is given to the given category in the CMP object.
   *
   * @param {object.<string,*>} settings
   * @param {object.<string,string>} settings.attributes - Consent attributes translations.
   * @param {array<string>} settings.categories - Consent categories names.
   * @param {object.<string,array>} settings.categorization - Consent elements categorization by domains/paths.
   * @param {array<string>} settings.categorization.categoryName - Consent category name as in `categories`.
   * @param {array<string|HTMLElement>} settings.decoration - Types of elements that should be decorated (`<tagName>` as string or `HTMLElement` sub-classes).
   * @param {object.<string,string>} settings.messages - Consent element HTML wrapper messages.
   * @param {string} settings.messages.overlayTitle - Consent element HTML wrapper "Title".
   * @param {string} settings.messages.overlayDescription - Consent element HTML wrapper "Description".
   * @param {string} settings.messages.overlayAcceptButton - Consent element HTML wrapper "Accept Button".
   * @param {string} settings.messages.overlayInfoButton - Consent element HTML wrapper "Info Button".
   * @param {object.<string,string>} settings.classes - Consent element HTML wrapper classes.
   * @param {string} settings.classes.wrapper - Consent element HTML "Wrapper" class.
   * @param {string} settings.classes.container - Consent element HTML "Container" class.
   * @param {string} settings.classes.element - Consent element HTML "Element" class.
   * @param {string} settings.classes.overlay - Consent element HTML "Overlay" class.
   * @param {string} settings.classes.overlayTitle - Consent element HTML "Overlay Title" class.
   * @param {string} settings.classes.overlayDescription - Consent element HTML "Overlay Description" class.
   * @param {string} settings.classes.overlayButtons - Consent element HTML "Overlay Buttons" class.
   * @param {string} settings.classes.overlayAcceptButton - Consent element HTML "Overlay Accept Button" class.
   * @param {string} settings.classes.overlayInfoButton - Consent element HTML "Overlay Info Button" class.
   *
   * @fires AbstractCmpHelper#CmpHelperOnCreate
   */
  constructor({ cookieName, objectName, updateEventName, functions, settings }) {
    super(settings);

    this.#cookieName            = cookieName || this.#cookieName;
    this.#objectName            = objectName || this.#objectName;
    this.#updateEventName       = updateEventName || this.#updateEventName;
    this.constructor.#functions = {
      ...this.constructor.#functions,
      ...functions
    };

    this.initialize();
  }

  /**
   * @inheritdoc
   */
  getCmpCookieName() {
    return this.#cookieName;
  }

  /**
   * @inheritdoc
   */
  getCmpObjectName() {
    return this.#objectName;
  }

  /**
   * @inheritdoc
   */
  getCmpUpdateEventName() {
    return this.#updateEventName;
  }

  /**
   * @inheritdoc
   */
  static showDialog() {
    return this.#functions.showDialog();
  }

  /**
   * @inheritdoc
   */
  static consentTo(category) {
    return this.#functions.consentTo(category);
  }

  /**
   * @inheritdoc
   */
  static isConsentedTo(category) {
    return this.#functions.isConsentedTo(category);
  }

  static {
    const $function = function () {
      console.log({
        this:      this,
        arguments: arguments,
      });
    };

    this.#functions = {
      showDialog:    $function.bind(this, 'showDialog'),
      consentTo:     $function.bind(this, 'consentTo'),
      isConsentedTo: $function.bind(this, 'isConsentedTo'),
    };
  }
}

const config = {
  cookieName: 'cookie',
  objectName: 'object',
  updateEventName: 'event',
  functions: {
      showDialog: () => console.log('showDialog'),
      consentTo: () => console.log('consentTo'),
      isConsentedTo: () => console.log('isConsentedTo'),
    },
  settings: settings,
};

export {
  config,
  ConcreteCmpHelper,
  ConcreteCmpHelper as default,
}
