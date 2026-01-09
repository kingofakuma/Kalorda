import { App } from 'vue';
import { permission } from './permission';
const directivesList: any = {
    permission
};

export const directives = {
    install: function (app: App<Element>) {
        Object.keys(directivesList).forEach((key) => {
            app.directive(key, directivesList[key]);
        });
    }
};
