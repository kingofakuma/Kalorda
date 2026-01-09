import { Directive } from 'vue';
import { hasPermission } from '@/utils/Token';

export const permission: Directive = {
    beforeMount(el: any, binding: any) {
        let permission = binding.value;
        el.style.display = hasPermission(permission) ? '' : 'none';
    },
    updated(el: any, binding: any) {
        let permission = binding.value;
        el.style.display = hasPermission(permission) ? '' : 'none';
    },
    beforeUnmount(el: any, binding: any) {
        binding;
        el;
    }
};
