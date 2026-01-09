<script lang="ts">
import { RouteMeta } from '@/router/MetaType';
export const routeMeta: RouteMeta = {
    title: 'help',
    icon: 'pi pi-question-circle',
    link: 'http://kalorda.vlmocr.com/help'
};
</script>
<script setup lang="ts">
console.log(routeMeta);
</script>
<template>
    <div></div>
</template>

<style scoped></style>
