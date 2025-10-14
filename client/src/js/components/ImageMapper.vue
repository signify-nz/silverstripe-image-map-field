<template>
  <div>
    <image-mapper-control
      :edit-mode="selectedAreaId !== null"
      :area="getSelectedAreaCopy()"
      :field-name="name"
      :show-clear-button="areas && areas.length > 0"
      @control-add-click="handleControlAddClick"
      @control-delete-click="handleControlDeleteClick"
      @control-area-update="handleControlAreaUpdate"
      @control-clear="handleControlClear"
      @control-external-url-change="handleControlExternalUrlChange"
      @control-use-internal-page-change="handleControlUseInternalPageChange"
      @control-internal-page-update="handleControlInternalPageUpdate"
    >
      <template slot="tree-field">
        <slot name="tree-field" />
      </template>
    </image-mapper-control>

    <image-map-viewport
      ref="viewport"
      class="image-map-viewport"
      @viewport-drag="handleViewportDrag"
      @viewport-mouseup="handleViewportMouseUp"
      @viewport-self-mousedown="handleViewportSelfMouseDown"
      @viewport-self-click="handleViewportSelfClick"
    >
      <image-map-area
        v-for="area in areas"
        :id="area.id"
        :key="area.id"
        css-classes="image-mapper__map"
        :x="area.x"
        :y="area.y"
        :w="area.width"
        :h="area.height"
        :shape="area.shape"
        :selected="area.selected"
        @area-click="handleAreaClick"
        @area-mouse-down="handleAreaMouseDown"
        @area-resize-mouse-down="handleAreaResizeMouseDown"
        @area-resize-mouse-up="handleAreaResizeMouseUp"
      />
      <img :src="src">
    </image-map-viewport>
    <input
      :name="name"
      :value="serialisedAreas"
      type="hidden"
    >
  </div>
</template>

<script>
import ImageMapArea from './ImageMapArea.vue';
import ImageMapViewport from './ImageMapViewport.vue';
import ImageMapperControl from './ImageMapControl.vue';
import constants from '../constants';

/**
 * This component is for drawing image map areas/region/hotspot overlays on top
 * of an image. This is to replicate HTML image map `<map>` so we use the same terms here.
 *
 * One important thing to note is instead of using absolute coordinates, we use
 * percentage instead as this allow easier translation in the responsive /
 * fluid image dimensions. This component only support rectangle and circle shape.
 *
 * This component does all the main heavy lifting where its child components
 * should just tell it what happened and privided the correct data via events.
 *
 * This componants consists of:
 * - one `ImageMapControl`
 * - one `ImageViewport`
 * - zero to many `ImageMapArea` refer to data return from
 *   `createNewAreaData()` method for the structure of an image map area object
 */
export default {

  components: {
    ImageMapArea,
    ImageMapViewport,
    ImageMapperControl,
  },

  props: {
    name: {
      type: String,
      required: true,
    },

    src: {
      type: String,
      default: null,
    },

    defaultAreasData: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      // Main map area data
      areas: this.defaultAreasData,

      selectedAreaId: null,
      mouseDownAreaResizeMode: false,
      resizeDirection: null,
    };
  },

  computed: {
    serialisedAreas() {
      return JSON.stringify(this.areas);
    },
  },

  mounted() {
    // Clear left-over state
    this.selectAreaById(null);
  },

  methods: {
    /**
     * @return {integer}
     */
    getNewId() {
      const allIds = this.areas.map((m) => Number(m.id));
      const maxId = allIds.length > 0 ? Math.max(...allIds) : 0;
      return maxId + 1;
    },

    /**
     * Create and return new area object
     *
     * @param {string} shape Either constants.SHAPE.RECT (default) or
     * constants.SHAPE.CIRCLE
     * @return {object}
     */
    createNewAreaData(shape) {
      shape = shape || constants.SHAPE.RECT;
      return {
        id: this.getNewId(),
        x: 0,
        y: 0,
        width: this.getXInPercent(30),
        height: this.getYInPercent(30),
        externalUrl: null,
        internalPageId: null,
        useInternalPage: true,
        shape,
        selected: false,
        internalPageTitle: null,
      };
    },

    getSelectedAreaCopy() {
      return { ...this.getSelectedArea() };
    },

    getSelectedArea() {
      return this.areas.find((area) => area.id === this.selectedAreaId);
    },

    /**
     * Get value in percentage along x axis in the viewport
     *
     * @param {integer} px value in pixel
     * @return {float} value in percentage
     */
    getXInPercent(px) {
      const viewport = this.$refs.viewport.$el;
      return (px * 100) / viewport.offsetWidth;
    },

    /**
     * Get value in percentage along y axis in the viewport
     *
     * @param {integer} px value in pixel
     * @return {float} value in percentage
     */
    getYInPercent(px) {
      const viewport = this.$refs.viewport.$el;
      return (px * 100) / viewport.offsetHeight;
    },

    handleControlDeleteClick() {
      this.areas = this.areas.filter((area) => area.id !== this.selectedAreaId);
      this.selectedAreaId = null;
      this.$emit('area-change');
    },

    /**
     * @param {object} area
     */
    handleControlAreaUpdate(area) {
      let selected = this.getSelectedArea();
      if (selected) {
        selected = area;
      }
    },

    /**
     * @param {string} url
     */
    handleControlExternalUrlChange(url) {
      const selected = this.getSelectedArea();
      if (selected) {
        selected.externalUrl = url;
      }
    },

    handleControlInternalPageUpdate(page) {
      const selected = this.getSelectedArea();
      if (selected) {
        selected.internalPageId = page.id;
        selected.internalPageTitle = page.title;
      }
    },

    /**
     * @param {boolean} flag
     */
    handleControlUseInternalPageChange(flag) {
      const selected = this.getSelectedArea();
      if (selected) {
        selected.useInternalPage = flag;
      }
    },

    handleControlClear() {
      this.areas = [];
      this.selectedAreaId = null;
    },

    /**
     * @param string
     */
    handleControlAddClick(shape) {
      this.areas.push(this.createNewAreaData(shape));
      this.$emit('area-change');
    },

    handleViewportSelfClick() {
      this.areas.forEach((area) => {
        area.selected = false;
      });
      this.selectedAreaId = null;
    },

    handleViewportSelfMouseDown() {
      this.selectedAreaId = null;
    },

    handleViewportMouseUp() {
      this.mouseDownAreaResizeMode = false;
    },

    /**
     * @param {integer} movementX
     * @param {integer} movementY
     */
    handleViewportDrag(movementX, movementY) {
      const selected = this.areas.find((area) => area.id === this.selectedAreaId);

      if (selected) {
        if (this.mouseDownAreaResizeMode) {
          // Lock the ratio - width and height should always be the same for circle
          if (selected.shape === constants.SHAPE.CIRCLE) {
            movementY = movementX;
          }

          if (this.resizeDirection === constants.RESIZE_DIR.NW) {
            selected.x += this.getXInPercent(movementX);
            selected.y += this.getYInPercent(movementY);
            selected.width -= this.getXInPercent(movementX);
            selected.height -= this.getYInPercent(movementY);
          } else { // Default direction is 'bottom-right'
            selected.width += this.getXInPercent(movementX);
            selected.height += this.getYInPercent(movementY);
          }
        } else {
          selected.x += this.getXInPercent(movementX);
          selected.y += this.getYInPercent(movementY);
        }

        this.$emit('area-change');
      }
    },

    /**
     * @param {Event} e
     */
    handleUrlChange(e) {
      const selected = this.getSelectedArea();
      selected.externalUrl = e.target.value;
    },

    /**
     * @param {integer} id
     */
    selectAreaById(id) {
      this.selectedAreaId = id;
      this.areas.forEach((area) => {
        area.selected = area.id === id;
      });
    },

    /**
     * @param {integer} id
     */
    handleAreaClick(id) {
      this.selectAreaById(id);
    },

    /**
     * @param {integer} id
     */
    handleAreaMouseDown(id) {
      this.selectedAreaId = id;
    },

    /**
     * @param {string} resizeDirection
     */
    handleAreaResizeMouseDown(resizeDirection) {
      this.mouseDownAreaResizeMode = true;
      this.resizeDirection = resizeDirection;
    },

    handleAreaResizeMouseUp() {
      this.mouseDownAreaResizeMode = false;
    },
  },
};
</script>
