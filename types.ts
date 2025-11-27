export type MenuItemType = 'link' | 'dropdown' | 'mega-menu' | 'button' | 'divider';

export interface MenuItemData {
  id: string;
  label: string;
  type: MenuItemType;
  url?: string;
  icon?: string;
  target?: '_self' | '_blank';
  hidden?: boolean;
  description?: string;
  classes?: string;
}

// The main state structure
export interface NestedMenuItem extends MenuItemData {
  children: NestedMenuItem[];
  isOpen?: boolean; // For expanding/collapsing in builder
}

export interface FlatMenuItem extends MenuItemData {
  parentId: string | null;
  depth: number;
  index: number;
  isOpen?: boolean;
}

export interface AvailablePage {
  id: string;
  title: string;
  path: string;
  type: 'page' | 'collection';
}

export type IconName = 'Home' | 'Settings' | 'User' | 'ShoppingCart' | 'ChevronDown' | 'Menu' | 'Search' | 'Globe' | 'Mail' | 'Phone';