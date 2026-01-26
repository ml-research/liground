<template>
  <div class="addCommentModal" @keydown.stop @keyup.stop>
    <div
      class="backdrop"
      @click="close"
    />
    <div class="contents">
      <header class="header">
        Add Comment
      </header>
      <div class="body">
        <div class="inputGroup">
          <label for="commentText">Comment:</label>
          <textarea
            id="commentText"
            v-model="commentText"
            rows="5"
            cols="50"
            placeholder="Enter your comment here..."
            autofocus
            @keyup.ctrl.enter="save"
          />
        </div>
        <div class="moveInfo">
          Move: <strong>{{ moveName }}</strong>
        </div>
      </div>
      <footer class="footer">
        <button
          type="button"
          class="btn green"
          @click="save"
        >
          Save Comment
        </button>
        <button
          v-if="existingComment"
          type="button"
          class="btn red"
          @click="deleteComment"
        >
          Delete Comment
        </button>
        <button
          type="button"
          class="btn gray"
          @click="close"
        >
          Cancel
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddCommentModal',
  props: {
    moveName: {
      type: String,
      required: true
    },
    existingComment: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      commentText: ''
    }
  },
  mounted () {
    if (this.existingComment) {
      this.commentText = this.existingComment
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    save () {
      if (this.commentText.trim() === '') {
        alert('Please enter a comment')
        return
      }
      this.$emit('save', this.commentText)
    },
    deleteComment () {
      this.$emit('delete')
    }
  }
}
</script>

<style scoped>
.addCommentModal {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.backdrop {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.contents {
  position: relative;
  background-color: var(--second-bg-color);
  border: 2px solid var(--main-border-color);
  border-radius: 8px;
  width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.header {
  padding: 16px;
  border-bottom: 2px solid var(--main-border-color);
  font-size: 16px;
  font-weight: bold;
  color: var(--main-text-color);
}

.body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.inputGroup {
  margin-bottom: 16px;
}

.inputGroup label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--main-text-color);
  font-size: 14px;
}

.inputGroup textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--main-border-color);
  border-radius: 4px;
  background-color: var(--button-color);
  color: white;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
}

.inputGroup textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 4px rgba(33, 150, 243, 0.5);
}

.inputGroup textarea::placeholder {
  color: var(--light-text-color);
  opacity: 0.5;
}

.moveInfo {
  background-color: var(--button-color);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--main-border-color);
  font-size: 14px;
  color: var(--main-text-color);
}

.footer {
  padding: 16px;
  border-top: 2px solid var(--main-border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.green {
  background-color: #4CAF50;
  color: white;
}

.btn.green:hover {
  background-color: #45a049;
}

.btn.red {
  background-color: #f44336;
  color: white;
}

.btn.red:hover {
  background-color: #da190b;
}

.btn.gray {
  background-color: #757575;
  color: white;
}

.btn.gray:hover {
  background-color: #616161;
}
</style>
