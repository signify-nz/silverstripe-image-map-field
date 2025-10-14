import Rx from 'rx';

/**
 * Create an observable for tree field's input change event. See
 * https://rxjs-dev.firebaseapp.com/api/index/Observable for more details on
 * observable.
 *
 * NOTE: This relies on React TreeDropdown and Redux store and state. There are
 * a few workaounds put int to work around the shortcomings in the store by the
 * tree field.
 *
 * The shortcomings:
 *  - No selected page Id in the Redux store
 *  - No ability to update the selected page on the field via store dispatch funciton
 *
 * @param {string} fieldName treedrop down field name
 *
 * @return {Rx.Observable}
 */
export default (fieldName) => {
  const store = window.ss.store;

  return Rx.Observable.create((observer) => {
    let fieldObserver = null;

    // Setup observer on the tree dropdown field input and watch for value changes.
    const setupFieldObserver = (input) => {
      fieldObserver = new MutationObserver(() => {
        const state = store.getState();
        const selectedValues = state?.treeDropdownField?.fields?.[`Form_EditForm_${fieldName}`]?.selectedValues;

        if (selectedValues) {
          const selectedPageId = Number(input.value);
          const selectedPage = selectedValues.find(value => value.id === selectedPageId);
          if (selectedPage) {
            observer.next(selectedPage);
          }
        }
      });

      fieldObserver.observe(input, { attributes: true });
    };

    // Check if the TreeDropdown input is present.
    const checkForInput = () => {
      if (!fieldObserver) {
        // There are multiple hidden inputs with the same name so we need to
        // find the one without an ID and with a numeric value.
        const allInputs = document.querySelectorAll(`input[type="hidden"][name="${fieldName}"]`);
        const input = Array.from(allInputs).find(inp => {
          const value = inp.value;
          return !inp.id && value && !isNaN(Number(value)) && Number(value) > 0;
        });

        if (input) {
          setupFieldObserver(input);
        }
      }
    };

    // Watch for the TreeDropdown input to be created
    const containerObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          checkForInput();
        }
      });
    });

    // Watch the form container for new elements
    const formContainer = document.querySelector('.image-map-controls__tree-field-wrapper');
    if (formContainer) {
      containerObserver.observe(formContainer, {
        childList: true,
        subtree: true
      });
    }

    // Check immediately in case it already exists, but usually the React
    //  Treedropdown component has not been initialised yet.
    checkForInput();

    return () => {
      containerObserver.disconnect();
      if (fieldObserver) fieldObserver.disconnect();
    };
  });
};