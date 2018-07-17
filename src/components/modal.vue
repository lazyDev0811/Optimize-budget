<template>
  <transition name="modal">
    <div class="modal_overlay" @click="close" v-if="show">
      <div class="modal_content" @click.stop>
        <div class="modal_title">{{ title }} <div class="modal_close" @click="close">&#10006;</div></div>
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>

export default
{
  props: ['show','title'],
  data: function()
  {
    return {};
  },
  created: function()
  {
    document.addEventListener('keydown', modal_escape.bind(this), false);
  },
  beforeDestroy: function()
  {
    document.removeEventListener('keydown', modal_escape.bind(this), false);
  },
  methods:
    {
      close: function()
      {
        this.$emit('close');
      }
    }
}

function modal_escape(event)
{
  var e = event || window.event;
  if((this.show || this.$options.propsData.show) && e.keyCode == 27)
  {
    this.close();
    // All good browsers…
    if (e.preventDefault) e.preventDefault();
    // …and IE
    if (e.returnValue) e.returnValue = false;
    return false;
  }
}

</script>

<style>
  .modal_overlay
  {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.65);
  }

  .modal_content
  {
    position: relative;
    display: inline-block;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    background-color: white;
    border: 2px solid #000;
    border-radius: 5px;
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
  }

  .modal_title
  {
    text-align: center;
    background-color: #F27935;
    color: white;
    line-height: 1.65;
  }

  .modal_close
  {
    position: absolute;
    right: 5px;
    display: inline-block;
    cursor: pointer;
    padding: 0 5px 0 4px;
  }

  .modal_close:hover
  {
    color: white;
    background-color: #00B4FF;
  }

  .modal-enter-active
  {
    transition: all .4s ease;
  }

  .modal-leave-active
  {
    transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }

  .modal-enter, .modal-leave-to
  {
    transform: translateX(10px);
    opacity: 0;
  }
</style>
