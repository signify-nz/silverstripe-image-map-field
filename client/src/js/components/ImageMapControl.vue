<style lang="scss">
  @import '../../scss/image-map-control';
</style>

<template>
  <div class="image-map-controls">
    <span class="image-map-controls__button-group">
      <button
        v-on:click="handleAddClick"
        class="
          image-map-controls__button
          image-map-controls__button--add
          image-map-controls__button--add-rect
        "
        data-shape="rect"
      >+ Rect</button>
      <button
        v-on:click="handleAddClick"
        class="
          image-map-controls__button
          image-map-controls__button--add
          image-map-controls__button--add-circle
        "
        data-shape="circle"
      >+ Circle</button>
    </span>

    <button
      v-if="showClearButton"
      v-on:click="handleClearClick"
      class="image-map-controls__button image-map-controls__button--clear"
    >Clear</button>

    <div v-show="editMode" class="image-map-controls__edit">
      <button v-on:click="handleDeleteClick" class="image-map-controls__button--delete">
        Delete selected
      </button>

      <span class="image-map-controls__link-type">
        <input
          type="radio"
          name="internalVsExternal"
          value="internal"
          :checked="useInternalPage"
          v-on:change="handleChangePageMode" /> Internal
        <input
          type="radio"
          name="internalVsExternal"
          value="external"
          :checked="!useInternalPage"
          v-on:change="handleChangePageMode" /> External
      </span>

      <input
        name="externalUrl"
        v-if="!useInternalPage"
        placeholder="Enter external URL. E.g. http://google.com/"
        v-on:input="handleExternalUrlChange"
        :value="area.externalUrl" />

      <div
        class="image-map-controls__tree-field-wrapper"
        ref="treeField"
        v-show="useInternalPage && (!internalPageTitle || editInternalPageMode)"
      >
        <!-- do not nest treedropdown field in `v-if` as
        it stops it from being rendered correctly by React -->
        <slot name="tree-field"></slot>
      </div>

      <button
        class="image-map-controls__button--internal-edit-cancel"
        v-if="useInternalPage && editInternalPageMode"
        v-on:click="editInternalPageMode = false"
      >Cancel</button>

      <span
        v-if="useInternalPage && internalPageTitle && !editInternalPageMode"
        class="image-map-controls__internal-page-display"
      >
        <strong>{{internalPageTitle}}</strong>
        <button
        class="image-map-controls__button--internal-edit-cancel"
        v-on:click="editInternalPageMode = true">Change</button>
      </span>
    </div>
  </div>
</template>

<script>
/**
 * This is the control parts (adding, editing and deleting) of the image map field.
 */
export default {

  inject: [
    '$confirm',
    '$createTreeFieldChangeObservable',
  ],

  data() {
    return {
      editInternalPageMode: false,
    };
  },

  props: {
    fieldName: {
      required: true,
      type: String,
    },

    area: {
      type: Object,
      default: null,
    },

    editMode: {
      type: Boolean,
      default: false,
    },

    showClearButton: {
      type: Boolean,
      default: false,
    },
  },

  mounted() {
    this.$nextTick(() => {
      if (typeof this.$createTreeFieldChangeObservable === 'function') {
        this.$createTreeFieldChangeObservable(this.fieldName).subscribe(
          (page) => {
            if (this.area && (this.area.internalPageId !== page.id)) {
              this.editInternalPageMode = false;
              this.$emit('control-internal-page-update', { id: page.id, title: page.title });
            }
          },
        );
      }
    });
  },

  watch: {
    area() {
      this.clearTreeDropdownDisplayText();
      this.editInternalPageMode = false;
    },

    editMode() {
      this.clearTreeDropdownDisplayText();
      this.editInternalPageMode = false;
    },
  },

  computed: {
    useInternalPage() {
      return !this.area || this.area.useInternalPage;
    },

    internalPageTitle() {
      return this.area && this.area.internalPageTitle;
    },
  },

  methods: {
    handleAddClick(e) {
      const el = e.target;
      this.$emit('control-add-click', el.dataset.shape);
    },

    handleDeleteClick() {
      this.$emit('control-delete-click');
    },

    handleExternalUrlChange(e) {
      this.$emit('control-external-url-change', e.target.value);
    },

    handleChangePageMode(e) {
      const val = e.target.value;
      this.$emit('control-use-internal-page-change', val === 'internal');
    },

    handleClearClick() {
      if (typeof this.$confirm === 'function') {
        // eslint-disable-next-line
        if (this.$confirm('Are you sure you want to clear all the regions?')) {
          this.$emit('control-clear');
        }
      } else {
        this.$emit('control-clear');
      }
    },

    clearTreeDropdownDisplayText() {
      // Since we can't re-instated a selected page of an area in the tree
      // dropdown field, we just clear to selected page title in the display to
      // avoid confusion.
      const displaySelectedTextEl = this.$refs.treeField.querySelector('.Select-value-label');
      if (displaySelectedTextEl) {
        displaySelectedTextEl.innerText = '';
      }
    },
  },

};
</script>

