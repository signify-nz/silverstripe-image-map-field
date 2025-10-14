<template>
  <div
    class="image-map__viewport"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <slot />
  </div>
</template>

<script>
export default {

  data() {
    return {
      prevScreenX: 0,
      prevScreenY: 0,
    };
  },

  methods: {
    /**
     * Get an object with two properties - {integer} movementX and {integer} movementY.
     * This is here because IE11 doesn't support `MouseEvent.movementX` and `MouseEvent.movementY`.
     *
     * @param {MouseEvent} e
     * @return {object}
     */
    getMouseMovement(e) {
      const movementX = (this.prevScreenX ? e.screenX - this.prevScreenX : 0);
      const movementY = (this.prevScreenY ? e.screenY - this.prevScreenY : 0);

      this.prevScreenX = e.screenX;
      this.prevScreenY = e.screenY;

      return { movementX, movementY };
    },

    handleClick(e) {
      if (e.target === this.$el) {
        this.$emit('viewport-self-click', e);
      }
    },

    handleMouseDown(e) {
      if (e.target === this.$el) {
        this.$emit('viewport-self-mousedown', e);
      }
    },

    handleMouseUp(e) {
      this.$emit('viewport-mouseup', e);

      if (e.target === this.$el) {
        this.$emit('viewport-self-mouseup', e);
      }

      // Reset these values for the next mousedown event
      this.prevScreenX = 0;
      this.prevScreenY = 0;
    },

    handleMouseMove(e) {
      // Mouse button is held down
      if (e.buttons) {
        const { movementX, movementY } = this.getMouseMovement(e);
        this.$emit('viewport-drag', movementX, movementY);
      }
    },
  },
};
</script>

<style lang="sass">
    @import '../../scss/image-map-viewport';
</style>
