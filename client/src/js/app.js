import Vue from 'vue';
import ImageMapper from './components/ImageMapper.vue';
import createTreeFieldChangeObservable from './createTreeFieldChangeObservable';

Vue.component('ImageMapper', ImageMapper);

let cmsEditForm = null;

const boot = () => {
  const App = new Vue({
    el: '.image-map-field',

    provide: {
      $createTreeFieldChangeObservable: createTreeFieldChangeObservable,
      $confirm: window.confirm.bind(window),
    },

    methods: {
      handleChange() {
        // Make form change message shows before navigate away / page load
        if (cmsEditForm) {
          cmsEditForm.classList.add('changed');
        }
      },
    },

  });

  return App;
};

/**
 * Make sure that:
 * - The field is booted after the React app
 * - the field works when page is loaded via ajax and after Save or/and Publish
 */
jQuery('.js-react-boot').entwine({
  onmatch() {
    jQuery('.image-map-field-wrapper').entwine({
      onmatch() {
        boot();
        cmsEditForm = document.querySelector('.cms-edit-form');
      },
    });
  },
});
