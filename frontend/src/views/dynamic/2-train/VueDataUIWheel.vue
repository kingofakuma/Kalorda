<script setup lang="ts">
import { VueUiWheel } from 'vue-data-ui';
import 'vue-data-ui/style.css'; // 如果您使用多个组件，请将此样式导入放在您的主文件中
import { useLayout } from '@/layout/composables/layout';
const { isDarkTheme } = useLayout(); //isDarkTheme
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
    // 图标标题
    title: {
        type: String,
        default: ''
    },
    summary: {
        type: Object,
        default: () => ({
            percentage: 0,
            progress: 0
        })
    },
    useAnimation: {
        type: Boolean,
        default: false
    }
});

// 是否使用动画
const useAnimation = computed(() => props.useAnimation);

const config_dark = computed(() => ({
    debug: false,
    loading: false,
    responsive: false,
    theme: '',
    layout: 'classic',
    style: {
        fontFamily: 'inherit',
        chart: {
            backgroundColor: '#1e2939ff',
            color: '#d3d3d3ff',
            animation: {
                use: useAnimation.value,
                speed: 0.5,
                acceleration: 1
            },
            layout: {
                wheel: {
                    radiusRatio: 1,
                    tiltAngle3d: 50,
                    ticks: {
                        type: 'classic',
                        rounded: true,
                        inactiveColor: '#e1e5e8',
                        activeColor: '#6376DD',
                        sizeRatio: 0.9,
                        quantity: 100,
                        strokeWidth: 5,
                        stroke: '#FFFFFF00',
                        spacingRatio3d: 0.8,
                        shadeColorRatio3d: 0.15,
                        depth3d: 0,
                        gradient: {
                            show: true,
                            shiftHueIntensity: 10
                        }
                    }
                },
                innerCircle: {
                    show: true,
                    stroke: '#e1e5e8ff',
                    strokeWidth: 1,
                    radiusRatio: 1
                },
                percentage: {
                    show: true,
                    fontSize: 48,
                    rounding: 0,
                    bold: true,
                    formatter: null,
                    offsetX: 0,
                    offsetY: 0,
                    stroke: '#a9a9a9ff',
                    strokeWidth: 0
                }
            },
            title: {
                text: '',
                color: '#d3d3d3ff',
                fontSize: 18,
                bold: true,
                textAlign: 'center',
                paddingLeft: 0,
                paddingRight: 0,
                subtitle: {
                    color: '#d3d3d3ff',
                    text: '',
                    fontSize: 16,
                    bold: false
                }
            }
        }
    },
    userOptions: {
        show: false,
        showOnChartHover: false,
        keepStateOnChartLeave: true,
        position: 'right',
        buttons: {
            tooltip: false,
            pdf: true,
            csv: false,
            img: true,
            table: false,
            labels: false,
            fullscreen: true,
            sort: false,
            stack: false,
            animation: false,
            annotator: true,
            svg: true
        },
        callbacks: {
            animation: null,
            annotator: null,
            csv: null,
            fullscreen: null,
            img: null,
            labels: null,
            pdf: null,
            sort: null,
            stack: null,
            table: null,
            tooltip: null,
            svg: null
        },
        buttonTitles: {
            open: 'Open options',
            close: 'Close options',
            pdf: 'Download PDF',
            img: 'Download PNG',
            fullscreen: 'Toggle fullscreen',
            annotator: 'Toggle annotator',
            svg: 'Download SVG'
        },
        print: {
            scale: 2,
            orientation: 'auto',
            overflowTolerance: 0.2
        }
    }
}));

const config_light = computed(() => ({
    debug: false,
    loading: false,
    responsive: false,
    theme: '',
    layout: 'classic',
    style: {
        fontFamily: 'inherit',
        chart: {
            backgroundColor: '#FFFFFFff',
            color: '#808080',
            animation: {
                use: useAnimation.value,
                speed: 0.5,
                acceleration: 1
            },
            layout: {
                wheel: {
                    radiusRatio: 1,
                    tiltAngle3d: 50,
                    ticks: {
                        type: 'classic',
                        rounded: true,
                        inactiveColor: '#e1e5e8',
                        activeColor: '#6376DD',
                        sizeRatio: 0.9,
                        quantity: 100,
                        strokeWidth: 5,
                        stroke: '#FFFFFF00',
                        spacingRatio3d: 0.8,
                        shadeColorRatio3d: 0.15,
                        depth3d: 0,
                        gradient: {
                            show: true,
                            shiftHueIntensity: 10
                        }
                    }
                },
                innerCircle: {
                    show: true,
                    stroke: '#e1e5e8ff',
                    strokeWidth: 1,
                    radiusRatio: 1
                },
                percentage: {
                    show: true,
                    fontSize: 48,
                    rounding: 0,
                    bold: true,
                    formatter: null,
                    offsetX: 0,
                    offsetY: 0,
                    stroke: '#a9a9a9ff',
                    strokeWidth: 0
                }
            },
            title: {
                text: '',
                color: '#808080',
                fontSize: 18,
                bold: true,
                textAlign: 'center',
                paddingLeft: 0,
                paddingRight: 0,
                subtitle: {
                    color: '#808080',
                    text: '',
                    fontSize: 16,
                    bold: false
                }
            }
        }
    },
    userOptions: {
        show: false,
        showOnChartHover: false,
        keepStateOnChartLeave: true,
        position: 'right',
        buttons: {
            tooltip: false,
            pdf: true,
            csv: false,
            img: true,
            table: false,
            labels: false,
            fullscreen: true,
            sort: false,
            stack: false,
            animation: false,
            annotator: true,
            svg: true
        },
        callbacks: {
            animation: null,
            annotator: null,
            csv: null,
            fullscreen: null,
            img: null,
            labels: null,
            pdf: null,
            sort: null,
            stack: null,
            table: null,
            tooltip: null,
            svg: null
        },
        buttonTitles: {
            open: 'Open options',
            close: 'Close options',
            pdf: 'Download PDF',
            img: 'Download PNG',
            fullscreen: 'Toggle fullscreen',
            annotator: 'Toggle annotator',
            svg: 'Download SVG'
        },
        print: {
            scale: 2,
            orientation: 'auto',
            overflowTolerance: 0.2
        }
    }
}));

const summary = computed(() => props.summary);

const dataset = computed(() => ({ percentage: summary.value.percentage }));

const display = ref(true);
const visibilityChange = () => {
    display.value = document.visibilityState === 'visible';
};

onMounted(() => {
    document.addEventListener('visibilitychange', visibilityChange);
});

onUnmounted(() => {
    document.removeEventListener('visibilitychange', visibilityChange);
});
</script>
<template>
    <div class="w-full h-[100%] chart-container select-none p-4 relative" v-if="display">
        <div class="w-full flex items-center justify-center">
            <div class="min-w-[40px] w-[40px] text-gray-500 flex items-center justify-start gap-3"></div>
            <div class="w-full text-center text-lg font-bold">{{ props.title }}</div>
            <div class="min-w-[40px] w-[40px] text-gray-500 flex items-center justify-end gap-3"></div>
        </div>
        <div class="w-full text-center flex flex-col items-center justify-center">
            <div class="w-45 my-4">
                <!-- wheel 组件切换时动画有点问题，通过这种办法hack -->
                <VueUiWheel v-if="props.useAnimation && dataset.percentage !== 0 && dataset.percentage !== 100" :config="(isDarkTheme ? config_dark : config_light) as any" :dataset="dataset" />
                <VueUiWheel v-else :config="(isDarkTheme ? config_dark : config_light) as any" :dataset="dataset" />
            </div>
        </div>
        <div class="absolute w-full text-center text-gray-500 dark:text-gray-200 bottom-7 pr-4">
            <div>
                {{ t('page.trainchart.global_step') }}：<span style="color: red" v-tooltip.top="'global_step'">{{ summary.max_steps ? Number((summary.max_steps * summary.percentage) / 100).toFixed(0) : '-' }}</span> /
                <span class="text-primary pr-1" v-tooltip.top="'max_steps'">{{ summary.max_steps ? summary.max_steps : '-' }}</span> {{ t('page.trainchart.elapsed_time') }}：{{ summary.elapsed_time ? summary.elapsed_time : '-- s' }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.vue-data-ui-wrapper-fullscreen {
    overflow: hidden !important;
}

:deep(.atom-title) {
    padding-top: 6px;
}
</style>
