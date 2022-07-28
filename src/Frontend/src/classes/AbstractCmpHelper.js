"use strict";

/**
 * @module AbstractCmpHelper
 * @class
 * @abstract
 * @classdesc Base class for GDPR-Tools client-side CMP integration.
 *
 * @author Marwan Al-Soltany <MarwanAlsoltany@gmail.com>
 */
class AbstractCmpHelper {
  /**
   * @var {object.<string,*>} config
   * @property {object.<string,string>} attributes - Consent attributes translations.
   * @property {array<string>} categories - Consent categories names.
   * @property {object.<string,array>} categorization - Consent elements categorization by domains/paths.
   * @property {array<string>} categorization.categoryName - Consent category name as in `categories`.
   * @property {array<HTMLElement>} decoration - Types of elements that should be decorated (`HTMLElement` sub-classes).
   * @property {object.<string,string>} messages - Consent element HTML wrapper messages.
   * @property {string} messages.overlayTitle - Consent element HTML wrapper "Title".
   * @property {string} messages.overlayDescription - Consent element HTML wrapper "Description".
   * @property {string} messages.overlayAcceptButton - Consent element HTML wrapper "Accept Button".
   * @property {string} messages.overlayInfoButton - Consent element HTML wrapper "Info Button".
   * @property {object.<string,string>} classes - Consent element HTML wrapper classes.
   * @property {string} classes.wrapper - Consent element HTML "Wrapper" class.
   * @property {string} classes.container - Consent element HTML "Container" class.
   * @property {string} classes.element - Consent element HTML "Element" class.
   * @property {string} classes.overlay - Consent element HTML "Overlay" class.
   * @property {string} classes.overlayTitle - Consent element HTML "Overlay Title" class.
   * @property {string} classes.overlayDescription - Consent element HTML "Overlay Description" class.
   * @property {string} classes.overlayButtons - Consent element HTML "Overlay Buttons" class.
   * @property {string} classes.overlayAcceptButton - Consent element HTML "Overlay Accept Button" class.
   * @property {string} classes.overlayInfoButton - Consent element HTML "Overlay Info Button" class.
   *
   * @private
   */
  #config = {};

  /**
   * @var {object.<string,string>} attributes
   * @property {string} attributes.attribute
   *
   * @public
   */
  attributes = {
    // GDPR-Tools backend specific attributes
    'data-consent-element':         'data-consent-element',
    'data-consent-attribute':       'data-consent-attribute',
    'data-consent-value':           'data-consent-value',
    'data-consent-alternative':     'data-consent-alternative',
    // GDPR-Tools backend specific additional attributes
    'data-consent-original-href':   'data-consent-original-href',
    'data-consent-original-src':    'data-consent-original-src',
    'data-consent-original-srcset': 'data-consent-original-srcset',
    'data-consent-original-poster': 'data-consent-original-poster',
    'data-consent-original-data':   'data-consent-original-data',
    // GDPR-Tools frontend specific attributes
    'data-consent-category':        'data-consent-category',
    'data-consent-decorator':       'data-consent-decorator',
    'data-consent-evaluated':       'data-consent-evaluated',
  };

  /**
   * @var {array<HTMLElement>} elements
   *
   * @public
   * @readonly
   */
  elements = [];

  /**
   * @var {object} categories
   * @property {array<HTMLElement>} categories.category
   *
   * @public
   */
  categories = {};

  /**
   * @var {object,<string,array>} categorization
   * @property {array<string>} categorization.category
   *
   * @public
   */
  categorization = {};

  /**
   * @var {array<HTMLElement>} decoration
   *
   * @public
   */
  decorations = [
    HTMLIFrameElement,
    HTMLImageElement,
  ];

  /**
   * @var {object.<string,string>} messages
   * @property {string} messages.message
   *
   * @public
   */
  messages = {
    overlayTitle: 'Content is being blocked due to insufficient Cookies configuration!',
    overlayDescription: 'This content requires consent to the "{type}" cookies, to be viewed.',
    overlayAcceptButton: 'Allow this category',
    overlayInfoButton: 'More info',
  };

  /**
   * @var {object.<string,string>} classes
   * @property {string} classes.class
   *
   * @public
   */
  classes = {
    wrapper: '',
    container: '',
    element: '',
    overlay: '',
    overlayTitle: '',
    overlayDescription: '',
    overlayButtons: '',
    overlayAcceptButton: '',
    overlayInfoButton: '',
  };

  /**
   * @param {object.<string,*>} config
   * @param {object.<string,string>} attributes - Consent attributes translations.
   * @param {array<string>} categories - Consent categories names.
   * @param {object.<string,array>} categorization - Consent elements categorization by domains/paths.
   * @param {array<string>} categorization.categoryName - Consent category name as in `categories`.
   * @param {array<string|HTMLElement>} decoration - Types of elements that should be decorated (`<tagName>` as string or `HTMLElement` sub-classes).
   * @param {object.<string,string>} messages - Consent element HTML wrapper messages.
   * @param {string} messages.overlayTitle - Consent element HTML wrapper "Title".
   * @param {string} messages.overlayDescription - Consent element HTML wrapper "Description".
   * @param {string} messages.overlayAcceptButton - Consent element HTML wrapper "Accept Button".
   * @param {string} messages.overlayInfoButton - Consent element HTML wrapper "Info Button".
   * @param {object.<string,string>} classes - Consent element HTML wrapper classes.
   * @param {string} classes.wrapper - Consent element HTML "Wrapper" class.
   * @param {string} classes.container - Consent element HTML "Container" class.
   * @param {string} classes.element - Consent element HTML "Element" class.
   * @param {string} classes.overlay - Consent element HTML "Overlay" class.
   * @param {string} classes.overlayTitle - Consent element HTML "Overlay Title" class.
   * @param {string} classes.overlayDescription - Consent element HTML "Overlay Description" class.
   * @param {string} classes.overlayButtons - Consent element HTML "Overlay Buttons" class.
   * @param {string} classes.overlayAcceptButton - Consent element HTML "Overlay Accept Button" class.
   * @param {string} classes.overlayInfoButton - Consent element HTML "Overlay Info Button" class.
   *
   * @fires AbstractCmpHelper#CmpHelperOnCreate
   */
  constructor(config = {}) {
    this.#config = config;

    if (this.constructor === AbstractCmpHelper) {
      throw new Error(
        `${this.constructor} is an abstract class. Extend it and implement its abstract methods to get started.`
      );
    }

    this.attributes = {
      ...this.attributes,
      ...this.#config.attributes,
    }

    this.selector = `[${this.attributes['data-consent-element']}]`;

    this.elements = Array.from(document.querySelectorAll(this.selector));

    this.categories = {};

    for (const category of this.#config.categories) {
      this.categories[category]     = [];
      this.categorization[category] = [];
    }

    this.categorization = {
      ...this.categorization,
      ...this.#config.categorization,
    };

    this.decorations = [
      ...this.decorations,
      ...this.#config.decorations.map(type => {
        if (typeof type == 'function' && type.prototype instanceof Element) {
          return type;
        }

        return document.createElement(type).constructor;
      }),
    ];

    this.messages = {
      ...this.messages,
      ...this.#config.messages,
    };

    this.classes = {
      ...this.classes,
      ...this.#config.classes,
    };

    window.dispatchEvent(new CustomEvent('CmpHelperOnCreate', {
      bubbles: true,
      detail: { config: this.config }
    }));
  }

  /**
   * Initializes the class. This method MUST be called before any other method in sub-classes.
   *
   * @returns {AbstractCmpHelper}
   *
   * @private
   */
  initialize() {
    this.categorize();

    const name  = this.getCmpCookieName();
    const event = this.getCmpUpdateEventName();

    const regex = new RegExp(`^(.*;)?\s*${name}\s*=\s*[^;]+(.*)?$`);

    if (document.cookie.match(regex) === null) {
      this.update();
    }

    window.addEventListener(event, this.update.bind(this));
    document.addEventListener('DOMContentLoaded', this.update.bind(this));

    return this;
  };

  /**
   * @returns {string}
   *
   * @private
   */
  #getDatasetName(name) {
    let attribute = `data-consent-${name}`;

    attribute = this.attributes[attribute] || attribute;

    attribute = attribute
      .replace('data-', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')

    attribute = attribute.charAt(0).toLowerCase() + attribute.slice(1);

    return attribute;
  }

  /**
   * @returns {AbstractCmpHelper}
   *
   * @fires AbstractCmpHelper#CmpHelperElementsOnCategorize
   *
   * @public
   */
  categorize() {
    this.elements.forEach((element) => {
      let categorized = false;

      // this.#config.categories is used instead of this.categories to make sure the specified order is used
      this.#config.categories.forEach(category => {
        if (categorized) {
          return;
        }

        if (this.categorization[category].some(domain => element.dataset[this.#getDatasetName('value')]?.includes(domain))) {
          this.categories[category].push(element);

          element.dataset[this.#getDatasetName('category')]    = category;
          element.dataset[this.#getDatasetName('alternative')] = element[element.dataset[this.#getDatasetName('attribute')]];

          categorized = true;
        }
      });

      if (!categorized) {
        element.dataset[this.#getDatasetName('alternative')] = element[element.dataset[this.#getDatasetName('attribute')]];

        if (element instanceof HTMLScriptElement && !element.hasAttribute('src')) {
          // inline script tags
          this.categories[element.dataset[this.#getDatasetName('category')]]?.push(element);
        } else {
          // any other element, the last item in this.#config.categories should always denote the 'unclassified' category
          element.dataset[this.#getDatasetName('category')] = this.#config.categories.slice(-1).pop() || 'unclassified';
          this.categories[element.dataset[this.#getDatasetName('category')]].push(element);
        }
      }
    });

    window.dispatchEvent(new CustomEvent('CmpHelperElementsOnCategorize', {
      bubbles: true,
      detail: { categories: this.categories }
    }));

    return this;
  };

  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnActivate
   *
   * @public
   */
  activate(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    element[element.dataset[this.#getDatasetName('attribute')]] = element.dataset[this.#getDatasetName('value')];

    if (
      element instanceof HTMLScriptElement &&
      element.hasAttribute('src') == false &&
      element.hasAttribute(this.attributes['data-consent-evaluated']) == false
    ) {
      // const scriptElement = document.createElement(element.tagName);
      // const scriptContent = document.createTextNode(element.innerText);
      // scriptElement.appendChild(scriptContent);
      // element.parentNode.insertBefore(scriptElement, element.nextSibling);
      // element.remove();
      // eval() is used to better track changes in the actual document (HTML)
      eval(element.innerText);

      element.setAttribute(this.attributes['data-consent-evaluated'], true);
    }

    window.dispatchEvent(new CustomEvent('CmpHelperElementOnActivate', {
      bubbles: true,
      detail: { element }
    }));

    if (this.decorations.some(HTMLElementType => element instanceof HTMLElementType)) {
      return this.undecorate(element);
    }

    return true;
  };

  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnDeactivate
   *
   * @public
   */
  deactivate(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    element[element.dataset[this.#getDatasetName('attribute')]] = element.dataset[this.#getDatasetName('alternative')] || '';

    window.dispatchEvent(new CustomEvent('CmpHelperElementOnDeactivate', {
      bubbles: true,
      detail: { element }
    }));

    if (this.decorations.some(HTMLElementType => element instanceof HTMLElementType)) {
      return this.decorate(element);
    }

    return true;
  };

  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnDecorate
   *
   * @public
   */
  decorate(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (element.dataset.hasOwnProperty([this.#getDatasetName('decorator')]) === true) {
      return false;
    }

    const decoration = this.#createDecoration(element);

    window.dispatchEvent(new CustomEvent('CmpHelperElementOnDecorate', {
      bubbles: true,
      detail: { element, decoration }
    }));

    element.dataset[this.#getDatasetName('decorator')] = decoration.wrapper.id;
    element.parentNode.insertBefore(decoration.wrapper, element);

    decoration.element.appendChild(element);

    decoration.overlayAcceptButton.addEventListener('click', event => {
      event.preventDefault();

      this.activate(element);
      this.constructor.consentTo(element.dataset[this.#getDatasetName('category')]);
    });

    decoration.overlayInfoButton.addEventListener('click', event => {
      event.preventDefault();

      this.constructor.showDialog();
    });

    return true;
  };

  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnUndecorate
   *
   * @public
   */
  undecorate(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (element.dataset.hasOwnProperty([this.#getDatasetName('decorator')]) === false) {
      return false;
    }

    const decoration = document.getElementById(element.dataset[this.#getDatasetName('decorator')]);

    window.dispatchEvent(new CustomEvent('CmpHelperElementOnUndecorate', {
      bubbles: true,
      detail: { element, decoration }
    }));

    element.removeAttribute(this.attributes['data-consent-decorator']);

    decoration?.parentNode.insertBefore(element, decoration);
    decoration?.remove();

    return true;
  };

  /**
   * @param {HTMLElement} element
   * @returns {HTMLElement}
   *
   * @public
   */
  #createDecoration(element) {
    const identifier = 'cmp-helper-consent-element-'.concat(Math.random().toString(36).toUpperCase().substring(2));

    const template = (new DOMParser())
      .parseFromString(`
        <div id="${identifier}" class="cmp-helper-consent-wrapper cmp-helper-consent-${element.tagName.toLowerCase()}-wrapper">
          <div class="cmp-helper-consent-container">
            <div class="cmp-helper-consent-element" hidden></div>
            <div class="cmp-helper-consent-overlay">
              <div class="cmp-helper-consent-overlay-title">${this.messages.overlayTitle}</div>
              <div class="cmp-helper-consent-overlay-description">
                ${this.messages.overlayDescription.replace(
                  '{type}',
                  element.dataset[this.#getDatasetName('category')].charAt(0).toUpperCase() +
                  element.dataset[this.#getDatasetName('category')].slice(1).toLowerCase()
                )}
              </div>
              <div class="cmp-helper-consent-overlay-buttons">
                <a class="cmp-helper-consent-overlay-accept-button" href="javascript:void(0);">${this.messages.overlayAcceptButton}</a>
                &nbsp;
                <a class="cmp-helper-consent-overlay-info-button" href="javascript:void(0);">${this.messages.overlayInfoButton}</a>
              </div>
            </div>
          </div>
        </div>
      `, 'text/html');

    const decoration = {
      wrapper:             template.querySelector('.cmp-helper-consent-wrapper'),
      container:           template.querySelector('.cmp-helper-consent-container'),
      element:             template.querySelector('.cmp-helper-consent-element'),
      overlay:             template.querySelector('.cmp-helper-consent-overlay'),
      overlayTitle:        template.querySelector('.cmp-helper-consent-overlay-title'),
      overlayDescription:  template.querySelector('.cmp-helper-consent-overlay-description'),
      overlayButtons:      template.querySelector('.cmp-helper-consent-overlay-buttons'),
      overlayAcceptButton: template.querySelector('.cmp-helper-consent-overlay-accept-button'),
      overlayInfoButton:   template.querySelector('.cmp-helper-consent-overlay-info-button'),
    };

    decoration.wrapper.style.width = element.offsetWidth > 1 ? element.offsetWidth + 'px' : 'auto';
    decoration.wrapper.style.height = element.offsetHeight > 1 ? element.offsetHeight + 'px' : 'auto';
    decoration.wrapper.style.display = 'block';
    decoration.wrapper.style.overflow = 'hidden';
    decoration.wrapper.style.position = 'relative';
    decoration.wrapper.style.padding = '0 0 16px 0';

    for (let key in decoration) {
      if (
        this.classes.hasOwnProperty(key) &&
        this.classes[key].toString().trim() !== ''
      ) {
        this.classes[key]
          .trim()
          .split(' ')
          .forEach(className => {
            decoration[key].classList.add(className.trim());
          });
      }
    }

    return decoration;
  }

  /**
   * @param {string} category
   * @returns {boolean}
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnAllow
   *
   * @public
   */
  allow(category) {
    if (this.categories.hasOwnProperty(category) === false) {
      return false;
    }

    const elements = this.categories[category];

    for (const element of elements) {
      this.activate(element);
    }

    window.dispatchEvent(new CustomEvent('CmpHelperCategoryOnAllow', {
      bubbles: true,
      detail: { category, elements }
    }));

    return true;
  }

  /**
   * @param {string} category
   * @returns {boolean}
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnDisallow
   *
   * @public
   */
  disallow(category) {
    if (this.categories.hasOwnProperty(category) === false) {
      return false;
    }

    const elements = this.categories[category];

    for (const element of elements) {
      this.deactivate(element);
    }

    window.dispatchEvent(new CustomEvent('CmpHelperCategoryOnDisallow', {
      bubbles: true,
      detail: { category, elements }
    }));

    return true;
  }

  /**
   * @returns {AbstractCmpHelper}
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnUpdate
   *
   * @public
   */
  update() {
    Object
      .keys(this.categories)
      .forEach(category => {
        if (
          window.hasOwnProperty(this.getCmpObjectName()) &&
          this.constructor.isConsentedTo(category)
        ) {
          this.allow(category);
        } else {
          this.disallow(category);
        }
      });

    window.dispatchEvent(new CustomEvent('CmpHelperElementOnUpdate', {
      bubbles: true,
      detail: { object: this }
    }));

    return this;
  }

  /**
   * @returns {string}
   *
   * @public
   */
  getCmpCookieName() {
    throw new Error('Method is abstract and must be implemented in child class.');
  }

  /**
   * @returns {string}
   *
   * @abstract
   * @public
   */
  getCmpObjectName() {
    throw new Error('Method is abstract and must be implemented in child class.');
  }

  /**
   * @returns {string}
   *
   * @abstract
   * @public
   */
  getCmpUpdateEventName() {
    throw new Error('Method is abstract and must be implemented in child class.');
  }

  /**
   * @returns {void}
   *
   * @abstract
   * @public
   * @static
   */
  static showDialog() {
    throw new Error('Method is abstract and must be implemented in child class.');
  }

  /**
   * @param {string} category
   *
   * @returns {void}
   *
   * @abstract
   * @public
   * @static
   */
  static consentTo(category) {
    throw new Error('Method is abstract and must be implemented in child class.');
  }

  /**
   * @param {string} category
   *
   * @returns {void}
   *
   * @abstract
   * @public
   * @static
   */
  static isConsentedTo(category) {
    throw new Error('Method is abstract and must be implemented in child class.');
  }
}

const config = {
  attributes: {
    // GDPR-Tools backend specific attributes
    'data-consent-element':         'data-consent-element',
    'data-consent-attribute':       'data-consent-attribute',
    'data-consent-value':           'data-consent-value',
    'data-consent-alternative':     'data-consent-alternative',
    // GDPR-Tools backend specific additional attributes
    'data-consent-original-href':   'data-consent-original-href',
    'data-consent-original-src':    'data-consent-original-src',
    'data-consent-original-srcset': 'data-consent-original-srcset',
    'data-consent-original-poster': 'data-consent-original-poster',
    'data-consent-original-data':   'data-consent-original-data',
    // GDPR-Tools frontend specific attributes
    'data-consent-category':        'data-consent-category',
    'data-consent-decorator':       'data-consent-decorator',
    'data-consent-evaluated':       'data-consent-evaluated',
  },
  categories: [
    'necessary',
    'preferences',
    'statistics',
    'marketing',
    'unclassified',
  ],
  categorization: {
    necessary: [
      'google.com/recaptcha',
    ],
    preferences: [
      'cdn.jsdelivr.net',
    ],
    statistics: [
      'google-analytics.com',
    ],
    marketing: [
      'facebook.com',
      'twitter.com',
      'google.com',
      'youtube.com',
      'youtube-nocookie.com',
    ],
    unclassified: [],
  },
  decoration: [
    HTMLIFrameElement,
    HTMLImageElement,
    HTMLEmbedElement,
    HTMLAudioElement,
    HTMLVideoElement,
    HTMLTrackElement,
    HTMLObjectElement
  ],
  messages: {
    overlayTitle: 'Content is being blocked due to insufficient Cookies configuration!',
    overlayDescription: 'This content requires consent to the "{type}" cookies, to be viewed.',
    overlayAcceptButton: 'Allow this category',
    overlayInfoButton: 'More info',
  },
  classes: {
    wrapper: '',
    container: '',
    element: '',
    overlay: '',
    overlayTitle: '',
    overlayDescription: '',
    overlayButtons: '',
    overlayAcceptButton: '',
    overlayInfoButton: '',
  }
};

export {
  config,
  AbstractCmpHelper,
  AbstractCmpHelper as default,
}
