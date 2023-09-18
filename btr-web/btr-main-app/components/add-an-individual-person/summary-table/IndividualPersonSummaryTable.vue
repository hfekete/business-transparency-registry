<template>
  <div class="mx-5 bg-white rounded-[5px]">
    <table class="text-left mx-6 my-3 "
           aria-description="Summary of individual person details."
    >
      <caption class="sr-only"> Summary of individual person details.</caption>
      <thead class="border-b">
      <tr>
        <th scope="col" class="px-6 py-3">Name</th>
        <th scope="col" class="px-6 py-3">Address</th>
        <th scope="col" class="px-6 py-3 min-w-[14ch]">Details</th>
        <th scope="col" class="px-6 py-3">Significance Dates</th>
        <th scope="col" class="px-6 py-3">Controls</th>
        <th scope="col" class="px-6 py-3"></th>
      </tr>
      </thead>
      <tbody>

      <IndividualPersonSummaryTableEntry
        v-for="individualPerson in individualPersons"
        :key="individualPerson.uuid"
        :individual="individualPerson"
        class="border-b"
      />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { IndividualPersonInterface } from '~/models/persons'

defineProps({
  individualPersons: {
    type: Array<IndividualPersonInterface>,
    required: true
  }
})
</script>

<style scoped>

</style>
