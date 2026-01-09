<script setup lang="ts">
import { useLayout } from '@/layout/composables/layout';
const { isDarkTheme } = useLayout(); //isDarkTheme
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
    title: {
        type: String,
        default: null
    },
    // 图标数据
    data: {
        type: Array as PropType<
            Array<{
                name: string;
                series: Array<number>;
                color: string;
            }>
        >,
        default: []
    },
    xAxis: {
        type: Array as PropType<Array<number>>,
        default: []
    },
    yFormatter: {
        type: String,
        default: null
    }
});

// 格式化y轴刻度数据
const yFormatter = computed(() => {
    switch (props.yFormatter) {
        case 'format1':
            return (value: any) => {
                return value == 0 ? 0 : Number(value.toFixed(6).replace(/(\.\d*?)0+$/, '$1'));
            }; // 显示小数x位，损失率 训练速度
        case 'format2':
            return (value: any) => {
                return value == 0 ? 0 : value.toExponential(1);
            }; // 显示科学记数法 学习率
        case 'format3':
            return (value: any) => {
                return value == 0 ? 0 : (value * 100).toFixed(2) + '%';
            }; // 显示百分比 token准确率
        default:
            return null;
    }
});

const chartData = computed(() => {
    return {
        labels: props.xAxis,
        datasets: [
            ...props.data.map((item) => ({
                label: item.name,
                data: item.series,
                fill: false,
                borderWidth: 2,
                tension: 0.4,
                lineTension: 0.3,
                pointRadius: 0,
                borderColor: item.color
            }))
        ]
    };
});

const chartOptions = computed(() => {
    const documentStyle = isDarkTheme.value ? getComputedStyle(document.documentElement) : getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        // 图表宽高自适应
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: textColor
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                // backgroundColor: textColorSecondary,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += yFormatter.value ? yFormatter.value(context.parsed.y) : context.parsed.y;
                        }
                        return label;
                    }
                }
            },
            decimation: {
                enabled: true,
                algorithm: 'min-max',
                samples: 10,
                threshold: 0.5
            }
        },
        animation: false,
        scales: {
            x: {
                // type: 'linear',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary,
                    callback: (value: number) => {
                        // value: number, index: number, values: number[]
                        if (yFormatter.value) {
                            return yFormatter.value(value);
                        }
                        return value;
                    }
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
});

const expandViewVisible = ref(false);
const expandView = () => {
    expandViewVisible.value = true;
};
const dataTableVisible = ref(false);
const showDataTable = () => {
    dataTableVisible.value = true;
};
const downloadPng = () => {
    const base64Image = chartRef.value.getBase64Image();
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = `${props.title}_${Math.random().toString(36).substring(2)}.png`;
    link.click();
};

const downloadCsv = () => {
    let headers = ['step'];
    let series = [];
    props.data.forEach((item) => {
        headers.push(item.name);
    });

    for (let i = 0; i < props.xAxis.length; i++) {
        let row: any[] = [props.xAxis[i]];
        props.data.forEach((item) => {
            row.push(item.series[i] ? item.series[i] : '-');
        });
        series.push(row);
    }
    let csvContent = headers ? headers.join(',') + '\r\n' : '';
    series.forEach((row) => {
        csvContent += row.join(',') + '\r\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${props.title}_${Math.random().toString(36).substring(2)}.csv`;
    link.click();
};

const chartRef = ref();
const menuRef = ref();
const items = ref([
    {
        label: t('page.trainchart.chartmenu'),
        items: [
            {
                label: t('page.trainchart.refresh'),
                icon: 'pi pi-refresh',
                command: () => {
                    chartRef.value.refresh();
                }
            },
            {
                label: t('page.trainchart.datatable'),
                icon: 'pi pi-table',
                command: () => {
                    showDataTable();
                }
            },
            {
                label: t('page.trainchart.savepng'),
                icon: 'pi pi-image',
                command: () => {
                    downloadPng();
                }
            },
            {
                label: t('page.trainchart.savecsv'),
                icon: 'pi pi-file',
                command: () => {
                    downloadCsv();
                }
            }
        ]
    }
]);
const menuToggle = (e: any) => {
    menuRef.value.toggle(e);
};
</script>

<template>
    <div class="w-full chart-container select-none p-4 relative">
        <div class="w-full flex items-center justify-center">
            <div class="min-w-[50px] w-[50px] text-gray-500 flex items-center justify-start gap-2"></div>
            <div class="w-full text-center text-lg font-bold">{{ props.title }}</div>
            <div class="min-w-[50px] w-[50px] text-gray-500 flex items-center justify-end gap-2">
                <i class="pi pi-expand cursor-pointer hover:text-purple-500" @click="expandView" v-tooltip.top="t('page.trainchart.expandchart')"></i>
                <i class="pi pi-ellipsis-v cursor-pointer hover:text-purple-500" @click="menuToggle" v-tooltip.top="t('page.common.more')"></i>
                <Menu ref="menuRef" :model="items" :popup="true" />
            </div>
        </div>
        <Chart ref="chartRef" type="line" :data="chartData" :options="chartOptions" class="w-full h-[16rem]" @dblclick="expandView" />
        <Dialog v-model:visible="expandViewVisible" modal dismissableMask :style="{ width: '60vw' }">
            <template #header>
                <div class="flex items-center justify-between ml-2">
                    <div class="text-lg font-bold">{{ props.title }}</div>
                </div>
            </template>
            <Chart type="line" :data="chartData" :options="chartOptions" class="w-full h-[60vh]" />
        </Dialog>
        <Dialog v-model:visible="dataTableVisible" modal dismissableMask :style="{ width: '40vw' }">
            <template #header>
                <div class="flex items-center justify-between ml-2">
                    <div class="text-lg font-bold">{{ props.title }} - {{ t('page.trainchart.datatable') }}</div>
                </div>
            </template>
            <div class="w-full overflow-hidden">
                <DataTable :value="props.xAxis" scrollable scrollHeight="400px" :virtualScrollerOptions="{ itemSize: 50 }" class="mx-3">
                    <Column header="step">
                        <template #body="slotProps">
                            <div>
                                {{ slotProps.index + 1 }}
                            </div>
                        </template>
                    </Column>
                    <Column :header="item.name" v-for="item in props.data" :key="item.name">
                        <template #body="slotProps">
                            <div class="flex items-center gap-1">
                                {{ item.series[slotProps.index] != undefined ? item.series[slotProps.index] : '-' }}
                                <div class="flex items-center gap-1 text-green-500" v-if="item.series[slotProps.index] == Math.max(...item.series)"><i class="pi pi-thumbtack text-green-500"></i>{{ t('page.trainchart.max') }}</div>
                                <div class="flex items-center gap-1 text-red-500" v-if="item.series[slotProps.index] == Math.min(...item.series)"><i class="pi pi-thumbtack text-red-500"></i>{{ t('page.trainchart.min') }}</div>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </Dialog>
    </div>
</template>

<style scoped></style>
