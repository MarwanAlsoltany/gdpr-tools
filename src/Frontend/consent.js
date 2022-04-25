"use strict";
/**
 * This is an example of how to handle the consent on the client side.
 *
 * Normally you are already using some kind of CMP (Consent Management Platform).
 * The CMP script will try to do its best to block what it can but the browser will send
 * requests of elements that load external resources before the CMP script can process them.
 * This is simply how browsers work, and there is no way to stop that on the client side.
 * What GDPR-Tools is doing, is sanitizing those elements so that they dont send any requests
 * until the client tells it to do so by adding the original attributes again.
 *
 * NOTE: Code here is only for demonstration purposes.
 */


// here we listen to the event (or some other way, depending on CMPs API)
// to load the resources after the consent is given
(window.cmp || document).addEventListener('{{ consentEvent }}', () => {
  // here you can set a cookie to use in the future
  // in the front- or backend logic to check that the user has agreed
  document
    .querySelectorAll('[data-consent-element]')
    .forEach(element => {
      element[element.dataset.consentAttribute] = element.dataset.consentValue;
    });
});

// for visual elements like <iframe /> we can put some button to trigger the consent
// that maps to the consent banner button or setting model provided by the CMP
document
  .querySelectorAll('[data-consent-element="iframe"]')
  .forEach(element => {
    const button = document.createElement('button');
    button.innerHTML = 'Agree';
    button.addEventListener('click', () => {
      element[element.dataset.consentAttribute] = element.dataset.consentValue;
      button.remove();
    });

    element.parentNode.insertBefore(button, element.nextSibling);
  });
