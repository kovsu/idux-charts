import { type ComputedRef, type InjectionKey, computed, inject } from 'vue-demi'

import { type PieSeriesOption } from 'echarts/charts'
import { merge, get, set, cloneDeep } from 'lodash-es'

import {
  type AdditionalChartOption,
  type BaseChartOption,
  convertArray,
  filterEmptyProps,
} from '@idux/charts-core'

export const pieChartProps = [
  'data',
  'center',
  'label',
  'name',
  'markArea',
  'radius',
  'roseType',
] as const

export interface PieChartProps
  extends BaseChartOption<PieSeriesOption>,
    AdditionalChartOption,
    Pick<PieSeriesOption, (typeof pieChartProps)[number]> {}

export const PIE_CHART_TOKEN: InjectionKey<PieChartProps> = Symbol('PIE_CHART_TOKEN')

const defaultProps: PieChartProps = {
  style: 'width:400px; height:200px;',
  legend: {
    orient: 'vertical',
    itemGap: 16,
    top: 28,
    left: '50%',
  },
  title: {
    textStyle: {
      fontSize: '30px',
    },
    top: '35%',
    left: '18%',
    itemGap: 8,
  },
  tooltip: { trigger: 'item' },
}

export function usePieOption(
  props: PieSeriesOption,
  attrs: PieChartProps,
): ComputedRef<PieChartProps> {
  const injectProps = inject(PIE_CHART_TOKEN, null)
  const mergedDefaultProps = merge(cloneDeep(defaultProps), injectProps)

  const mergedSeriesOption = computed<PieSeriesOption>(() => {
    const option = filterEmptyProps(props)
    option.type = 'pie'
    return option
  })

  const total = computed(() =>
    // @ts-ignore
    mergedSeriesOption.value.data!.reduce((curr, next) => curr + next.value, 0),
  )

  const mergedOption = computed(() => {
    const option = merge({}, mergedDefaultProps, attrs)
    if (attrs.title !== null) {
      if (!get(option, ['title', 'text'])) {
        set(option, ['title', 'text'], `${total.value}`)
      }
      if (!get(option, ['title', 'subtext'])) {
        set(option, ['title', 'subtext'], `${mergedSeriesOption.value.name || ''}`)
      }
    } else {
      option.title = undefined
    }
    return option
  })

  return computed(() => {
    const option = { ...mergedOption.value }
    const seriesOption = mergedSeriesOption.value
    const { series } = attrs
    if (!series) {
      option.series = [seriesOption]
    } else {
      option.series = convertArray(series).map(item => merge({}, seriesOption, item))
    }
    return option
  })
}
