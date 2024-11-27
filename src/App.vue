<template>
  <v-app>
    <!-- Voeg eventueel een navigation bar toe of andere layout elementen hier -->
    <v-container>
      <print-table /> <!-- Laad de PrintTable-component -->
    </v-container>
  </v-app>
</template>

<script setup>
// Importeer de PrintTable-component die je hebt gemaakt
import PrintTable from './components/PrintTable.vue'
</script>

<style>
/* Je kunt hier globale stijlen toevoegen */
</style>
