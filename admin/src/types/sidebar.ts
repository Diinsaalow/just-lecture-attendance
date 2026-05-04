export interface MenuItem {
    title: string;
    icon?: any;
    path?: string;
    target?: string;
    isSection?: boolean;
    children?: MenuItem[];
    resource?: string;
    action?: string | string[];
}
