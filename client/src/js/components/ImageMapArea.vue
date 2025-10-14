<template>
  <span
    :id="id"
    class="image-map-area"
    :class="[
      cssClasses,
      selected ? 'image-map-area--selected' : '',
      `image-map-area--${shape}`,
    ]"
    :style="{
      left: `${x}%`,
      top: `${y}%`,
      width: `${w}%`,
      height: `${h}%`,
    }"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <span
      class="image-map-area__resize image-map-area__resize-tl"
      data-resize-direction="north-west"
      @mousedown="handleResizeMouseDown"
      @mouseup="handleResizeMouseUp"
    />

    <span
      class="image-map-area__resize image-map-area__resize-br"
      data-resize-direction="south-east"
      @mousedown="handleResizeMouseDown"
      @mouseup="handleResizeMouseUp"
    />
  </span>
</template>

<script>
import constants from '../constants';

/**
 * This component replicate HTML `<area>`
 */
export default {

  props: {
    id: Number,

    // Value is in %
    x: {
      type: Number,
      default: 0,
    },

    // Value is in %
    y: {
      type: Number,
      default: 0,
    },

    // Value is in %
    w: {
      type: Number,
      default: 5,
    },

    // Value is in %
    h: {
      type: Number,
      default: 5,
    },

    shape: {
      type: String,
      default: constants.SHAPE.RECT,
    },

    selected: {
      type: Boolean,
      default: false,
    },

    cssClasses: {
      type: String,
      default: 'map-area',
    },
  },

  data() {
    // The unit is percentage
    return {
    };
  },

  methods: {
    handleClick() {
      this.$emit('area-click', this.id);
    },

    handleMouseDown(e) {
      // The parent (viewport) of this element relies on MouseMove event to
      // calculate how much the mouse point has moved but when this element is
      // being dragged (which happens only in Firefox) the MouseMove event stops
      // firing.
      e.preventDefault();

      this.$emit('area-mouse-down', this.id);
    },

    handleMouseUp() {
      this.$emit('area-mouse-up', this.id);
    },

    handleResizeMouseDown(e) {
      const resizeDirection = e.target.dataset.resizeDirection || constants.RESIZE_DIR.SE;
      this.$emit('area-resize-mouse-down', resizeDirection);
    },

    handleResizeMouseUp() {
      this.$emit('area-resize-mouse-up', this.id);
    },
  },
};
</script>

<style lang="scss">
  @import '../../scss/image-map-area';
</style>
