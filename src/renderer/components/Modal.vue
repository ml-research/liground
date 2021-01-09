<template>
  <div class="modal-backdrop">
    <div class="modal">
      <header class="modal-header">
        <slot name="header">
          Engine Settings
        </slot>
      </header>
      <section class="modal-body">
        <slot name="body">
          <PrettyCheck
            class="p-icon p-curve p-smooth"
            color="primary-o"
          >
            <em
              slot="extra"
              class="icon mdi mdi-check"
            />
            <p>1st Option</p>
          </PrettyCheck>
          <br>
          <PrettyCheck
            class="p-icon p-curve p-smooth"
            color="primary-o"
          >
            <em
              slot="extra"
              class="icon mdi mdi-check"
            />
            2nd Option
          </PrettyCheck>
          <br>
          <PrettyCheck
            class="p-icon p-curve p-smooth"
            color="primary-o"
          >
            <em
              slot="extra"
              class="icon mdi mdi-check"
            />
            3rd Option
          </PrettyCheck>
          <br>
        </slot>
      </section>
      <footer class="modal-footer">
        <slot name="footer">
          <p />
          <button
            type="button"
            class="btn-green"
            @click="close"
          >
            <p> Save & Exit</p>
          </button>
        </slot>
      </footer>
    </div>
  </div>
</template>

<script>
import PrettyCheck from 'pretty-checkbox-vue/check'
export default {
  name: 'Modal',
  components: {
    PrettyCheck
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style>
  .modal-backdrop {
    z-index: 1;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal {
    background: #FFFFFF;
    box-shadow: 2px 2px 20px 1px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
  }

  .modal-header,
  .modal-footer {
    padding: 15px;
    display: flex;
  }

  .modal-header {
    border-bottom: 1px solid #eeeeee;
    color: #4AAE9B;
    justify-content: space-between;
  }

  .modal-footer {
    border-top: 1px solid #eeeeee;
    justify-content: flex-end;
  }

  .modal-body {
    position: relative;
    padding: 20px 10px;
  }

  .btn-close {
    border: none;
    font-size: 20px;
    padding: 20px;
    cursor: pointer;
    font-weight: bold;
    color: #4AAE9B;
    background: transparent;
  }

  .btn-green {
    color: white;
    background: #4AAE9B;
    border: 1px solid #4AAE9B;
    border-radius: 2px;
  }
</style>
