<template>
  <div class="image-map-controls">
    <span class="image-map-controls__button-group">
      <button
        class="
          image-map-controls__button
          image-map-controls__button--add
          image-map-controls__button--add-rect
        "
        data-shape="rect"
        @click="handleAddClick"
      >+ Rect</button>
      <button
        class="
          image-map-controls__button
          image-map-controls__button--add
          image-map-controls__button--add-circle
        "
        data-shape="circle"
        @click="handleAddClick"
      >+ Circle</button>
    </span>

    <button
      v-if="showClearButton"
      class="image-map-controls__button image-map-controls__button--clear"
      @click="handleClearClick"
    >
      Clear
    </button>

    <div
      v-show="editMode"
      class="image-map-controls__edit"
    >
      <button
        class="image-map-controls__button--delete"
        @click="handleDeleteClick"
      >
        Delete selected
      </button>

      <span class="image-map-controls__link-type">
        <input
          type="radio"
          name="internalVsExternal"
          value="internal"
          :checked="useInternalPage"
          @change="handleChangePageMode"
        > Internal
        <input
          type="radio"
          name="internalVsExternal"
          value="external"
          :checked="!useInternalPage"
          @change="handleChangePageMode"
        > External
      </span>

      <input
        v-if="!useInternalPage"
        name="externalUrl"
        placeholder="Enter external URL. E.g. http://google.com/"
        :value="area.externalUrl"
        @input="handleExternalUrlChange"
      >

      <div
        v-show="useInternalPage && (!internalPageTitle || editInternalPageMode)"
        ref="treeField"
        class="image-map-controls__tree-field-wrapper"
      >
        <!--
          do not nest treedropdown field in `v-if` as it stops it from being rendered
          correctly by React
        -->
        <slot name="tree-field" />
      </div>

      <button
        v-if="useInternalPage && editInternalPageMode"
        class="image-map-controls__button--internal-edit-cancel"
        @click="editInternalPageMode = false"
      >
        Cancel
      </button>

      <span
        v-if="useInternalPage && internalPageTitle && !editInternalPageMode"
        class="image-map-controls__internal-page-display"
      >
        <strong>{{ internalPageTitle }}</strong>
        <button
          class="image-map-controls__button--internal-edit-cancel"
          @click="editInternalPageMode = true"
        >Change</button>
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

  data() {
    return {
      editInternalPageMode: false,
    };
  },

  computed: {
    useInternalPage() {
      return !this.area || this.area.useInternalPage;
    },

    internalPageTitle() {
      return this.area && this.area.internalPageTitle;
    },
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
      const displaySelectedTextEl = this.$refs.treeField.querySelector('.treedropdownfield__single-value');
      if (displaySelectedTextEl) {
        displaySelectedTextEl.innerText = '';
      }
    },
  },

};
</script>

<style lang="scss">
  @import '../../scss/image-map-control';
</style>
