<template>
  <div>
    <NUIndividualPersonSummaryTable :individuals="individuals" />
    <br>
    <IndividualPersonSummaryTable :individual-persons="individuals" />
  </div>
</template>

<script setup lang="ts">
import { useIndividualPerson } from '~/store/individual-person'

const individualPersonStore = useIndividualPerson()

const individuals = computed(() => individualPersonStore.getIndividualPersons)

</script>

<style scoped>

</style>
