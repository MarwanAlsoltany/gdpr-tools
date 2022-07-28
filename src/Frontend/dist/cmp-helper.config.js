(() => {
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
  helper = helper.update();

  window.cmpHelper       = helper;
  window.cmpHelperConfig = config;
})();
