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
   * Package version.
   *
   * @var {string} VERSION
   *
   * @public
   * @static
   * @constant
   *
   * @since 1.4.0
   */
  static VERSION = 'v1.4.1';

  /**
   * CMP-Helper config.
   *
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
   * CMP-Helper expensive operations cache.
   *
   * @var {object.<string,WeakMap|Object|Array>} cache
   * @property {WeakMap|Object|Array} cache.pool
   *
   * @protected
   *
   * @since 1.4.2
   */
  #cache = {}

  /**
   * CMP-Helper attributes names overrides.
   *
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
    'data-consent-decorates':       'data-consent-decorates',
    'data-consent-decorator':       'data-consent-decorator',
    'data-consent-evaluated':       'data-consent-evaluated',
  };

  /**
   * CMP-Helper blocked elements.
   *
   * @var {array<HTMLElement>} elements
   *
   * @public
   * @readonly
   */
  elements = [];

  /**
   * CMP-Helper configured categories.
   *
   * @var {object} categories
   * @property {array<HTMLElement>} categories.category
   *
   * @public
   */
  categories = {};

  /**
   * CMP-Helper categorization configuration.
   *
   * @var {object,<string,array>} categorization
   * @property {array<string>} categorization.category
   *
   * @public
   */
  categorization = {};

  /**
   * CMP-Helper decoratable elements.
   *
   * @var {array<HTMLElement>} decoration
   *
   * @public
   */
  decorations = [
    HTMLIFrameElement,
    HTMLImageElement,
  ];

  /**
   * CMP-Helper overlay messages.
   *
   * @var {object.<string,string>} messages
   * @property {string} messages.message
   *
   * @public
   */
  messages = {
    overlayTitle: 'Content of "{service}" is being blocked due to insufficient Cookies configuration!',
    overlayDescription: 'This content requires consent to the "{type}" Cookies, to be viewed.',
    overlayAcceptButton: 'Allow this category',
    overlayInfoButton: 'More info',
  };

  /**
   * CMP-Helper overlay markup CSS classes.
   *
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
   * AbstractCmpHelper constructor.
   *
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

    this.decorations = Array.from(new Set([
      ...this.decorations,
      ...this.#config.decorations.map(type => {
        if (typeof type == 'function' && type.prototype instanceof Element) {
          return type;
        }

        return document.createElement(type).constructor;
      }),
    ]));

    this.messages = {
      ...this.messages,
      ...this.#config.messages,
    };

    this.classes = {
      ...this.classes,
      ...this.#config.classes,
    };

    window.dispatchEvent(new CustomEvent('CmpHelperOnCreate', {
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this, config: this.#config }
    }));
  }

  /**
   * Returns object internal cache.
   *
   * @returns {object}
   *
   * @since 1.4.2
   */
  get cache() {
      return this.#cache
  }


  /**
   * Initializes class internal state and bindes global events (i.e. `load`, `update`, and `resize`).
   * This method MUST be called before any other method in sub-classes (normally in constructor after `super()`).
   *
   * @returns {AbstractCmpHelper} `this`
   *
   * @protected
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
    window.addEventListener('resize', this.refresh.bind(this), { passive: true });
    window.addEventListener('load', this.update.bind(this), { once: true, capture: false });

    return this;
  };

  /**
   * Returns the `camelCase` version of a `data-consent-*` attribute that can be used as a key on element `DOMStringMap`.
   *
   * @param {string} name The name of the attribute after `data-consent-`.
   *
   * @returns {string} The `camelCase` version of the attribute name (e.g. `element` (`data-consent-element`) -> `consentElement`).
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
   * Categorizes blocked elements by adding each element to its catgory group and attaching the following attributes:
   *    - `data-consent-category`
   *    - `data-consent-alternative`
   *
   * @returns {AbstractCmpHelper} `this`
   *
   * @fires AbstractCmpHelper#CmpHelperElementsOnCategorize This event is fired always.
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
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this, categories: this.categories }
    }));

    return this;
  };

  /**
   * Refreshes blocked elements that have an overlay to update rendered overlay view.
   *
   * @returns {AbstractCmpHelper} `this`
   *
   * @fires AbstractCmpHelper#CmpHelperElementsOnRefresh This event is fired always.
   *
   * @public
   *
   * @since 1.4.0
   */
  refresh() {
    let elements = [];

    window.requestAnimationFrame(() => {
      this.elements.forEach((element) => {
        if (element.dataset.hasOwnProperty(this.#getDatasetName('decorator'))) {
          if (this.undecorate(element) && this.decorate(element)) {
            elements.push(element);
          }
        }
      });
    });

    window.dispatchEvent(new CustomEvent('CmpHelperElementsOnRefresh', {
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this, elements }
    }));

    return this;
  };

  /**
   * Updates CMP-Helper state by allowing/disallow elements depending on the current given consent by the user.
   *
   * @returns {AbstractCmpHelper} `this`
   *
   * @fires AbstractCmpHelper#CmpHelperOnUpdate This event is fired always.
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

    window.dispatchEvent(new CustomEvent('CmpHelperOnUpdate', {
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this }
    }));

    return this;
  }

  /**
   * Evaluates the passed inline script element in a safe context for a single time
   * on demand or when the document is ready and before `load` event is dispatched.
   *
   * @param {HTMLScriptElement} script The script element to evaluated.
   *
   * @returns {void}
   *
   * @private
   *
   * @since 1.4.2
   */
  #evaluate(script) {
    if (
      script.tagName !== 'SCRIPT' ||
      script.hasAttribute('src') === true ||
      script.hasAttribute(this.attributes['data-consent-evaluated']) === true
    ) {
      return;
    }

    script.setAttribute(this.attributes['data-consent-evaluated'], false);

    const promise = new Promise((resolve, reject) => {
      const controller = new AbortController();
      const trySatisfy = (callback, event = null) => {
        if (document.readyState === 'complete') {
          const success = callback === resolve;
          const message = `${success ? 'Resolved' : 'Rejected'} via ${event ? '"' + event.type + '" event' : 'consent'}`;

          callback({success, message});

          controller.abort();
        }
      };

      // (document.readyState === 'complete') is starts just before 'load' event is dispatched
      const actions = Object.entries({readystatechange: resolve, load: reject});

      for (const [event, callback] of actions) {
        document.addEventListener(
          event,
          event => trySatisfy(callback, event),
          { once: true, signal: controller.signal }
        );
      }

      trySatisfy(resolve);
    });

    let evaluated = null;

    promise
      .then(data => {
        evaluated = data.success;

        setTimeout(() => {
          const evaluate = new Function(script.innerText);
          while (typeof evaluate() === 'function') evaluate();
        }, 0);
      })
      .catch(data => {
        evaluated = data.success;

        const element = script.outerHTML.replace(script.innerHTML, '/* ... */');
        throw new Error(
          `The content of (${element}) cloud not be evaluated: ${data.message}`
        );
      })
      .finally(() => {
        script.setAttribute(this.attributes['data-consent-evaluated'], evaluated);
      });
  }

  /**
   * Activates a blocked element by loading it or executing its content.
   * The `data-consent-evaluated` attribute may be added depending on element type.
   *
   * @param {HTMLElement} element The element to activate.
   *
   * @returns {boolean} Whether the element has been activated or not.
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnActivate This event is fired only if the element is not already activated.
   *
   * @public
   */
  activate(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    element[element.dataset[this.#getDatasetName('attribute')]] = element.dataset[this.#getDatasetName('value')];

    if (element instanceof HTMLScriptElement) {
      this.#evaluate(element);
    }

    window.dispatchEvent(new CustomEvent('CmpHelperElementOnActivate', {
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this, element }
    }));

    if (this.#isDecoratable(element)) {
      return this.undecorate(element);
    }

    return true;
  };

  /**
   * Deactivates an element by blocking it and adding an overlay if necessary.
   * The `data-consent-decorator` attribute will be added to element containing decoration ID.
   *
   * @param {HTMLElement} element The element to deactivate.
   *
   * @returns {boolean} Whether the element has been deactivated or not.
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnDeactivate This event is fired only if the element is not already deactivated.
   *
   * @public
   */
  deactivate(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    element[element.dataset[this.#getDatasetName('attribute')]] = element.dataset[this.#getDatasetName('alternative')] || '';

    window.dispatchEvent(new CustomEvent('CmpHelperElementOnDeactivate', {
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this, element }
    }));

    if (this.#isDecoratable(element)) {
      return this.decorate(element);
    }

    return true;
  };

  /**
   * Decorates an element by associating an overlay with it.
   * The overlay is added over the element or teleported elsewhere in the DOM
   * if the `data-consent-decorates` attribute is set.
   *
   * @param {HTMLElement} element The element to decorate.
   *
   * @returns {boolean} Whether the element has been decorated or not.
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnDecorate This event is fired only if the element is not already decorated.
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

    let decoratable = element;

    if (element.dataset.hasOwnProperty([this.#getDatasetName('decorates')]) === true) {
      decoratable = document.querySelector(element.dataset[this.#getDatasetName('decorates')]) ?? element;
    }

    if (!decoratable || window.getComputedStyle(decoratable)['display'] === 'none') {
      return false;
    }

    const decoration = this.#createDecoration(element, decoratable);

    window.dispatchEvent(new CustomEvent('CmpHelperElementOnDecorate', {
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this, element, decoratable, decoration }
    }));

    element.dataset[this.#getDatasetName('decorator')] = decoration.wrapper.id;
    element.parentNode.insertBefore(decoration.wrapper, decoratable);

    decoration.element.appendChild(decoratable);

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
   * Undecorates an element by removing the overlay associated with it.
   *
   * @param {HTMLElement} element The element to undecorate.
   *
   * @returns {boolean} Whether the element has been undecorated or not.
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnUndecorate This event is fired only if the element is not already undecorated.
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

    let decoratable = element;

    if (element.dataset.hasOwnProperty([this.#getDatasetName('decorates')]) === true) {
      decoratable = document.querySelector(element.dataset[this.#getDatasetName('decorates')]) ?? element;
    }

    if (!decoratable || window.getComputedStyle(decoratable)['display'] === 'none') {
      return false;
    }

    const decoration = document.getElementById(element.dataset[this.#getDatasetName('decorator')]);

    window.dispatchEvent(new CustomEvent('CmpHelperElementOnUndecorate', {
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this, element, decoratable, decoration }
    }));

    element.removeAttribute(this.attributes['data-consent-decorator']);

    decoration?.parentNode.insertBefore(decoratable, decoration);
    decoration?.remove();

    return true;
  };

  /**
   * Returns whether the element should be decorated or not depending on configuration.
   *
   * @returns {boolean} Whether the element is decoratable or not.
   *
   * @private
   */
  #isDecoratable(element) {
    return (
      // if the element is any of the types that should be decorated
      this.decorations.some(HTMLElementType => element instanceof HTMLElementType) ||
      // if the element teleports decoration on another element
      element.dataset.hasOwnProperty(this.#getDatasetName('decorates'))
      // we determine also later whether to decorate or not depending on element visibility
    )
  }

  /**
   * Creates decoration markup and returns it as an object of live HTML nodes.
   *
   * @param {HTMLElement} element The element to create the decoration for.
   * @param {HTMLElement|null} decoratable [optional] The element to teleport the decoration on (this is mostly the same as `element`).
   *
   * @returns {object} An object containing the following elements as live HTML nodes (note that the decoration still need to be added to the DOM):
   *    - `wrapper`: Overlay wrapper.
   *    - `container`: Overlay container.
   *    - `element`: Overlay element (where the blocked element should be added).
   *    - `overlay`: Overlay content container.
   *    - `overlayTitle`: Overlay content title.
   *    - `overlayDescription`: Overlay content description.
   *    - `overlayButtons`: Overlay buttons container.
   *    - `overlayAcceptButton`: Overlay accept button.
   *    - `overlayInfoButton`: Overlay info button.
   *
   * @private
   */
  #createDecoration(element, decoratable) {
    decoratable = decoratable ? decoratable : element;

    !(
      this.#cache.decorations instanceof WeakMap
    ) && (
      this.#cache.decorations = new WeakMap()
    );

    let decoration;

    if (this.#cache.decorations.has(element)) {
      decoration = this.#cache.decorations.get(element);
    } else {
      const prefix          = 'cmp-helper-consent';
      const { id, classes } = {
        id:
          `${prefix}-element-` +
          `${Math.random().toString(36).toUpperCase().substring(2)}`,
        classes:
          `${prefix}-wrapper ` +
          `${prefix}-${decoratable.tagName.toLowerCase()}-wrapper ` +
          `${prefix}-${element.tagName.toLowerCase()}-successor`,
      };

      const template = (new DOMParser())
        .parseFromString(`
          <div id="${id}" class="${classes}" role="dialog">
            <div class="${prefix}-container">
              <div class="${prefix}-element" hidden></div>
              <div class="${prefix}-overlay" role="suggestion">
                <div class="${prefix}-overlay-title" role="heading" aria-level="4"></div>
                <div class="${prefix}-overlay-description" role="paragraph"></div>
                <div class="${prefix}-overlay-buttons">
                  <a class="${prefix}-overlay-accept-button" href="javascript:void(0);" role="button deletion"></a>
                  &nbsp;
                  <a class="${prefix}-overlay-info-button" href="javascript:void(0);" role="button insertion"></a>
                </div>
              </div>
            </div>
          </div>
        `, 'text/html');

      decoration = {
        wrapper:             template.querySelector(`.${prefix}-wrapper`),
        container:           template.querySelector(`.${prefix}-container`),
        element:             template.querySelector(`.${prefix}-element`),
        overlay:             template.querySelector(`.${prefix}-overlay`),
        overlayTitle:        template.querySelector(`.${prefix}-overlay-title`),
        overlayDescription:  template.querySelector(`.${prefix}-overlay-description`),
        overlayButtons:      template.querySelector(`.${prefix}-overlay-buttons`),
        overlayAcceptButton: template.querySelector(`.${prefix}-overlay-accept-button`),
        overlayInfoButton:   template.querySelector(`.${prefix}-overlay-info-button`),
      };

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

      this.#cache.decorations.set(element, decoration);
    }

    decoration.wrapper.style.width    = element.offsetWidth > 1 ? element.offsetWidth + 'px' : 'auto';
    decoration.wrapper.style.height   = element.offsetHeight > 1 ? element.offsetHeight + 'px' : 'auto';
    decoration.wrapper.style.display  = 'block';
    decoration.wrapper.style.overflow = 'hidden';
    decoration.wrapper.style.position = 'relative';
    decoration.wrapper.style.padding  = '0 0 16px 0';

    decoration.overlayTitle.innerText = this.messages.overlayTitle.replace(
      /(\{\s*(service|name)\s*\})/ig, this.#getElementServiceName(element)
    );
    decoration.overlayDescription.innerText = this.messages.overlayDescription.replace(
      /(\{\s*(category|type)\s*\})/ig, this.#getElementCategoryName(element)
    );
    decoration.overlayAcceptButton.innerText = this.messages.overlayAcceptButton;
    decoration.overlayInfoButton.innerText = this.messages.overlayInfoButton;

    return decoration;
  }

  /**
   * Returns a service name for the passed element.
   * This can be the URL hostname if the element loads an external resource, or the capitalized tag name of the element if not.
   *
   * @param {HTMLElement} element The element to get the service name for.
   *
   * @returns {string} A hostname or a capitalized tag name.
   *
   * @private
   *
   * @since 1.4.0
   */
  #getElementServiceName(element) {
    const attribute = this.#getDatasetName('value');

    let service = 'Service';

    try {
      service = (new URL(element.dataset[attribute])).hostname;
    } catch {
      service = element.tagName.charAt(0).toUpperCase().concat(element.tagName.slice(1).toLowerCase());
    }

    return service;
  }

  /**
   * Returns a capitalized version of the category name of the blocked element.
   *
   * @param {HTMLElement} element
   *
   * @returns {string} A captiliazed version of element's category.
   *
   * @private
   *
   * @since 1.4.0
   */
  #getElementCategoryName(element) {
    const attribute = this.#getDatasetName('category');

    return (
      element.dataset[attribute].charAt(0).toUpperCase() +
      element.dataset[attribute].slice(1).toLowerCase()
    );
  }

  /**
   * Allows the passed category by activating all elements in that category group.
   *
   * @param {string} category The category to activate.
   *
   * @returns {boolean} Whether the category has been allowed or not.
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnAllow This event is fired only if the category is known.
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
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this, category, elements }
    }));

    return true;
  }

  /**
   * Disallows the passed category be deactivating all elements of that category.
   *
   * @param {string} category
   *
   * @returns {boolean} Whether the category has been disalloed or not.
   *
   * @fires AbstractCmpHelper#CmpHelperElementOnDisallow This event is fired only if the category is known.
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
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: { object: this, category, elements }
    }));

    return true;
  }

  /**
   * Returns the name of the cookie used by the integrated CMP.
   * This method is abstract, it should be implemented when extending the `AbstractCmpHelper` class.
   *
   * @returns {string} Cookie name of the integrated CMP.
   *
   * @abstract
   * @public
   */
  getCmpCookieName() {
    throw new Error('Method is abstract and must be implemented in child class.');
  }

  /**
   * Returns the name of the JavaScript object available on `window` of the integrated CMP.
   * This method is abstract, it should be implemented when extending the `AbstractCmpHelper` class.
   *
   * @returns {string} JavaScript object name (on `window`) of the integrated CMP.
   *
   * @abstract
   * @public
   */
  getCmpObjectName() {
    throw new Error('Method is abstract and must be implemented in child class.');
  }

  /**
   * Returns the name of the update event provided by the integrated CMP.
   * This method is abstract, it should be implemented when extending the `AbstractCmpHelper` class.
   *
   * @returns {string} Update event of the integrated CMP.
   *
   * @abstract
   * @public
   */
  getCmpUpdateEventName() {
    throw new Error('Method is abstract and must be implemented in child class.');
  }

  /**
   * Shows CMP dialog. Used as binding on overlay info button.
   * This method is abstract and static, it should be implemented when extending the `AbstractCmpHelper` class.
   *
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
   * Consents to the given category on the CMP object. Used as binding on overlay accept button.
   * This method is abstract and static, it should be implemented when extending the `AbstractCmpHelper` class.
   *
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
   * Returns whether the user is constent to the given category on the CMP object or not.
   * This method is abstract and static, it should be implemented when extending the `AbstractCmpHelper` class.
   *
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
    'data-consent-decorates':       'data-consent-decorates',
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
  decorations: [
    HTMLIFrameElement,
    HTMLImageElement,
    HTMLEmbedElement,
    HTMLAudioElement,
    HTMLVideoElement,
    HTMLTrackElement,
    HTMLObjectElement
  ],
  messages: {
    overlayTitle:        'Content of "{service}" is being blocked due to insufficient Cookies configuration!',
    overlayDescription:  'This content requires consent to the "{type}" Cookies, to be viewed.',
    overlayAcceptButton: 'Allow this category',
    overlayInfoButton:   'More info',
  },
  classes: {
    wrapper:             '',
    container:           '',
    element:             '',
    overlay:             '',
    overlayTitle:        '',
    overlayDescription:  '',
    overlayButtons:      '',
    overlayAcceptButton: '',
    overlayInfoButton:   '',
  }
};

export {
  config,
  AbstractCmpHelper,
  AbstractCmpHelper as default,
}
