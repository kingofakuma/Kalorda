import { RouteRecordRaw } from 'vue-router';
import { RouteMeta, IRouteMenu } from './MetaType';
import AppLayout from '@/layout/AppLayout.vue';
import { hasPermission } from '@/utils/Token';

export interface IResult {
    dynamicRoutes: RouteRecordRaw[];
    keepAliveNames: string[];
}

//views目录下vue页面自动发现加入路由管理
//路由path、name信息自动扫描文件目录+文件名会自动生成，设置页面的组件名与路由name一致
//不需要再手动维护路由配置数据
const parse: () => IResult = () => {
    let dynamicRoutes: RouteRecordRaw[] = [];
    let keepAliveNames: string[] = [];

    // 动态路由自动装配目录，在.env文件中配置的，如：VITE_ENV_DYNAMIC_ROUTE_DIR=src/views/dynamic/
    const dynamicViewDir = import.meta.env.VITE_ENV_DYNAMIC_ROUTE_DIR;
    if (!dynamicViewDir) {
        console.error('env.VITE_ENV_DYNAMIC_ROUTE_DIR is not set!');
        return { dynamicRoutes, keepAliveNames };
    }
    //注：import.meta.glob的参数都必须以字面量传入不可以在其中使用变量或表达式的
    const vueModules: any = import.meta.glob('@/views/**/*.vue');
    const allModules: Record<string, any> = import.meta.glob('@/views/**/(*.vue|*.ts)', { eager: true });
    const dirNodes: Record<string, any> = {};
    const workList = [];
    for (const key in allModules) {
        if (allModules[key].routeMeta) {
            let dirPath = key;
            let name = '';
            const isDirectory = key.endsWith('.ts');
            dirPath = dirPath.substring(0, dirPath.lastIndexOf('.'));

            if (isDirectory) {
                dirPath = dirPath.substring(0, dirPath.lastIndexOf('/'));
            }
            name = dirPath.substring(dirPath.lastIndexOf('/') + 1, dirPath.length);
            dirPath = dirPath.substring(dirPath.indexOf(dynamicViewDir) + dynamicViewDir.length, dirPath.lastIndexOf('/'));

            const node = {
                parent: null,
                dirPath: dirPath, // 所在的目录
                name: name,
                isDirectory: isDirectory,
                filePath: key, // 文件位置
                meta: allModules[key].routeMeta, // meta信息
                children: []
            };

            workList.push(node);
            if (isDirectory) {
                dirNodes[dirPath + '/' + name] = node;
            }
        }
    }

    // 构建目录结构
    Object.values(dirNodes).forEach((node: any) => {
        const parent = dirNodes[node.dirPath];
        if (parent) {
            parent.children.push(node);
            node.parent = parent;
        }
    });

    // 挂载模块
    workList.forEach((node: any) => {
        if (!node.isDirectory) {
            const parent = dirNodes[node.dirPath];
            if (parent) {
                parent.children.push(node);
                node.parent = parent;
            }
        }
    });

    // 完善对象 & 排序
    const visit = (nodeList: any[]) => {
        // 处理排序
        nodeList.sort((a: any, b: any) => {
            let aPosition = 100;
            if (typeof a.meta?.position === 'number') {
                aPosition = a.meta?.position;
            }
            let bPosition = 100;
            if (typeof b.meta?.position === 'number') {
                bPosition = b.meta?.position;
            }
            return aPosition - bPosition;
        });

        nodeList.forEach((node) => {
            // 处理redirect
            let redirect;
            node.children.forEach((childNode: any) => {
                if (childNode.meta.pathDefault) {
                    redirect = `${childNode.dirPath}/${childNode.name}`;
                }
            });
            if (redirect) {
                node.redirect = redirect;
            }

            if (!node.path) {
                node.path = node.dirPath + '/' + node.name;
            }

            //node.path和node.name处理
            // node.path = virtualPath + node.path;
            // node.name = node.path.replace(virtualPath, '').replaceAll('/', '_').substring(1); //斜杠换成_
            node.name = node.path.replaceAll('/', '_').substring(1); //斜杠换成_

            //views中类似1-test.vue文件名或文件夹前面的1-去掉后作为路由名和路径
            node.path = node.path.replaceAll(/[\d\.]+?-/gi, '');
            node.name = node.name.replaceAll(/[\d\.]+?-/gi, '');

            if (node.redirect) {
                node.redirect = node.redirect.replaceAll(/[\d\.]+?-/gi, '');
            }

            if (!node.component) {
                if (node.isDirectory) {
                    //node.component = ClassicLayout;
                    node.component = undefined; //后面会对一级节点单独处理修改为ClassicLayout
                } else {
                    //构造vue页面组件，自定义设置组件name
                    //本系统约定vue页面的组件名就是其路由的name，这样好处是1、组件script标签头里不用再显示写name属性，2、解决动态路由keepalive不生效问题

                    const component = () => {
                        const module = vueModules[node.filePath];
                        return module().then((comp: any) => ({
                            ...comp.default,
                            name: node.name
                        }));
                    };

                    node.component = defineAsyncComponent(component);
                    node.component.name = node.name;
                    // node.component = component;

                    //vue页面指定了keeepAlive=true，加入keepAlive登记数组中
                    if (node.meta.keepAlive == true) {
                        keepAliveNames.push(node.name); //路由名约定等于vue页面的组件名
                    }
                }
            }
            if (node.children.length > 0) {
                visit(node.children); // 递归处理
            } else {
                delete node.children;
            }
        });
    };

    // 抽离并完善一级节点
    dynamicRoutes = workList
        .filter((node) => {
            return node.dirPath === '';
        })
        .map((node: any) => {
            if (!node.component) {
                node.component = AppLayout; //一级节点使用的布局组件
            }
            node.path = '/' + node.name;
            return node;
        });

    visit(dynamicRoutes);

    return {
        dynamicRoutes,
        keepAliveNames
    };
};

//将动态路由列表转为导航菜单列表
export const convertRoutes2Menus = (routes: Array<RouteRecordRaw>): IRouteMenu[] => {
    let menus: IRouteMenu[] = [];
    Object.values(routes).forEach((route: RouteRecordRaw) => {
        let routeChildren: Array<RouteRecordRaw> = route.children && route.children.length > 0 ? route.children : [];
        let menuChildren = convertRoutes2Menus(routeChildren);
        let menu: IRouteMenu = {
            name: String(route.name), //route.name
            label: String(route.meta?.title), //route.meta.title
            icon: String(route.meta?.icon),
            meta: <RouteMeta>route.meta,
            // children: menuChildren,
            items: menuChildren.length > 0 ? menuChildren : undefined,
            // 非末级节点不设置path，外链也不设置path，单独设有url
            to: route.meta?.link || routeChildren.length > 0 ? '' : route.path,
            url: route.meta?.link ? String(route.meta?.link) : undefined,
            //外链都用弹新窗口的方式打开
            target: route.meta?.link ? '_blank' : undefined
        };

        // displayMenu=auto时按自动判断逻辑决定是否显示于菜单栏
        // 1、页面的自动判断逻辑：
        //    用户是否有该页面的访问权限来决定是否显示于菜单栏
        // 2、目录的自动判断：
        //    2.1如果目录上设有自己的访问权限，和页面一样也直接看权限来决定是否显示于菜单栏
        //    2.2如果没单独设目录权限，则看目录下有没有子级节点来决定是否显示于菜单栏，没有子节点的不显示于菜单栏
        let displayMenu = route.meta?.displayMenu;
        if (displayMenu == 'auto') {
            let permissions = route.meta?.permissions; // = roles
            if (permissions && Array.isArray(permissions)) {
                displayMenu = hasPermission(permissions) ? 'visible' : 'hidden';
            } else {
                // 针对auto显示的目录，如果其下没有显示的页面，则目录也不显示于菜单栏
                if ((<any>route).isDirectory == true && menuChildren.length == 0) {
                    console.log('发现一个空目录菜单=', menu);
                    displayMenu = 'hidden';
                }
            }
        }

        if (displayMenu != 'hidden') {
            menus.push(menu);
        }
    });
    return menus;
};

const parseResult = parse();
export const dynamicRoutes: Array<RouteRecordRaw> = parseResult.dynamicRoutes;
export const keepAliveNames: Array<string> = parseResult.keepAliveNames;
