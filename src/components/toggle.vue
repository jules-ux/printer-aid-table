<template>
    <div :class="{ 'dark-mode': isDarkMode }">
      <header>
        <button @click="toggleDarkMode">
          {{ isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}
        </button>
      </header>
    </div>
  </template>

<script>
export default {
  data() {
    return {
      isDarkMode: false, // Default is light mode
    };
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    },
  },
};
</script>
