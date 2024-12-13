<template>
  <div>
    <Top />
    <Tabel />
  </div>
</template>

<script>
import Top from './components/top-section.vue';
import Tabel from './components/PrintTable.vue';

export default {
  name: 'ParentComponent',
  components: {
    Top,
    Tabel,
  },
};
</script>