<template>
  <div>
    <UTable :rows="individuals" class="bg-white">
<!--      <template #name-data="{ row }">-->
<!--        <span :class="[selected.find(person => person.id === row.id) && 'text-primary-500 dark:text-primary-400']">{{ row.name }}</span>-->
<!--      </template>-->
      <template #details-data="{ row }">
          <div class="px-6 py-3 align-top min-w-[120px]">
            {{ row.details?.dateOfBirth }}<br>
            <span v-for="taxResidency in row.details?.taxResidency">{{ taxResidency }}<br></span>
            <!-- todo: internationalize tax resident -->
            <span>Tax Resident</span>
          </div>
      </template>

      <template #actions-data>
        <ULink><UIcon name="i-mdi-edit" />Change</ULink>
      </template>
    </UTable>
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
