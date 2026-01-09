export type RouteMeta = {
    title: string; // 设置该路由在侧边栏系统菜单名称、导航面包屑 ，i18n多语言处理处理时实际显示为t(`route.title.${to.meta.title}`)
    icon?: string; // 设置该路由的图标，记得将 svg 导入 @/icons/svg
    keepAlive?: boolean; //是否保持keepAlive缓存，不设置默认为false
    // tabTitle?: string; //tab标签页上显示的名称，一般不用设，默认等于title值，但有时需要区分两者的显示时才设置（带标签页的布局适用）
    // tabAffix?: boolean; //如果是固定的页面，则标签页中固定显示不可以关闭，一般用于首页，默认为false（带标签页的布局适用）
    displayMenu?: string; // hidden/visible/auto 如果设置hidden，则为不出现在菜单栏，如果作用于目录，则下级所有的节点模块都不显示
    pathDefault?: boolean; // 当前路由是否为上级路由的默认节点，true表示会在上级路由生成redirect指向当前节点
    permissions?: any; //第一个权限为当前路由的访问权限，如果不设置或标识为空表示不需要权限就能访问，其余权限为页面内操作权限
    position?: number; // 目录或模块的排序序号，默认为0，相同position时按文件夹名或文件名的字母顺序
    link?: string; //是否链接地址，如果不为空表示要新窗口打开链接地址
};

// export interface IPermission {
//     name: string;
//     value: number;
//     desc: string;
// }

export interface IRouteMenu {
    // key: string; // 0-0-0
    name: string; //对应route.name
    label: string; // title: string; //对应route.meta.title
    icon: string;
    // path: string;
    to: string;
    meta: RouteMeta;
    url?: string;
    target?: string;
    items?: IRouteMenu[]; //children
}
