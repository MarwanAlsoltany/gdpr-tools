window.addEventListener('DOMContentLoaded', (event) => {
  const object = 'cmpHelper';

  if (object in window) {
    return;
  }

  if (!event.isTrusted) {
    console.error(
      'GDPR-Tools will not be initialized!',
      'The "DOMContentLoaded" was not trusted, this means that the original event was prevented and fake one was dispatched instead.',
      'This can be achieved by making GDPR-Tools the first script of the document.'
    );

    return;
  }

  let helper = null;
  let config = null;

  config = JSON.parse(JSON.stringify({config}));
  config = {
    ...config,
    functions: {
      showDialog:    (new Function('return '.concat(config.functions.showDialog)))(),
      consentTo:     (new Function('return '.concat(config.functions.consentTo)))(),
      isConsentedTo: (new Function('return '.concat(config.functions.isConsentedTo)))(),
    },
  };

  helper = new ConcreteCmpHelper(config);
  helper.update();

  window[object]            = helper;
  window[object + 'Config'] = config;

  setTimeout(() => {
    console.groupCollapsed(
      '%c GDPR-Tools ',
      'background:#222222;color:#999999;font-weight:bold;font-style:italic'
    );

    console.log(
      '%c GDPR-Tools: %c [SERVER] - ' + (helper.elements.length
        ? 'Page was sanitized. 3rd-Party resources have been blocked. '
        : "Page didn't need sanitization! "
      ),
      'background:#222222;color:#ffffff;font-weight:bold',
      `background:#222222;color:${helper.elements.length ? '#ffff00' : '#ff4500'};font-weight:bold`
    );

    console.groupCollapsed(
      '%c GDPR-Tools: %c [CLIENT] - CMP Helper has been launched successfully! ',
      'background:#222222;color:#ffffff',
      'background:#222222;color:#00ff00'
    );

    console.log(
      '- Helper:%c window.cmpHelper',
      'color:#999999;font-weight:bold;font-style:italic',
      helper
    );

    console.groupEnd();

    console.groupCollapsed(
      `%c GDPR-Tools: %c [CLIENT] - Integrating with CMP Provider "${config.objectName}". `,
      'background:#222222;color:#ffffff',
      'background:#222222;color:#1e90ff'
    );

    console.log(
      '- Config:%c window.cmpHelperConfig ',
      'color:#999999;font-weight:bold;font-style:italic',
      config
    );

    console.groupEnd();

    console.log(
      `%c GDPR-Tools:  https://github.com/MarwanAlsoltany/gdpr-tools/tree/${helper.constructor.VERSION}`,
      'background:#222222;color:#ffffff'
    );

    console.groupEnd();
  }, 0);
}, { once: true, capture: true, passive: true });
