<template>
  <tr class="m-15">
    <td class="px-6 py-3 align-top font-bold uppercase">
      <UIcon name="i-mdi-user" /> {{ individual.fullName }}
    </td>
    <td class="px-6 py-3 align-top">{{ individual.address }}</td>
    <td class="px-6 py-3 align-top min-w-[120px]">
      {{ individual.details?.dateOfBirth }}<br>
      <span v-for="taxResidency in individual.details?.taxResidency">{{ taxResidency }}<br></span>
      <!-- todo: internationalize tax resident -->
      <span>Tax Resident</span>
    </td>
    <td class="px-6 py-3 align-top"> {{ individual.significanceDates[0] }} to
      {{ !!individual.significanceDates ? individual.significanceDates[0] : 'Current' }}
    </td>
    <td class="px-6 py-3 align-top"> {{ individual.controlsText }}</td>
    <td class="px-6 py-3 align-top">todo: edit/change</td>
  </tr>
</template>

<script setup lang="ts">
import { IndividualPersonInterface } from '~/models/persons'

import { PropType } from '@vue/runtime-core'

defineProps({
  individual: {
    type: Object as PropType<IndividualPersonInterface>,
    required: true
  }
})
</script>
<style scoped>

</style>
