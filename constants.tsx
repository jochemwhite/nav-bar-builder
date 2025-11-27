import { 
  Home, Settings, User, ShoppingCart, ChevronDown, Menu, Search, Globe, Mail, Phone,
  Layout, Type, Link, Square, List, GripVertical, Trash2, Copy, Eye, EyeOff, Plus
} from 'lucide-react';
import React from 'react';

export const ITEM_TYPES = [
  { value: 'link', label: 'Link', icon: Link },
  { value: 'dropdown', label: 'Dropdown', icon: List },
  { value: 'mega-menu', label: 'Mega Menu', icon: Layout },
  { value: 'button', label: 'Button', icon: Square },
  { value: 'divider', label: 'Divider', icon: Type },
];

export const AVAILABLE_ICONS = [
  { value: 'Home', icon: Home },
  { value: 'Settings', icon: Settings },
  { value: 'User', icon: User },
  { value: 'ShoppingCart', icon: ShoppingCart },
  { value: 'Search', icon: Search },
  { value: 'Globe', icon: Globe },
  { value: 'Mail', icon: Mail },
  { value: 'Phone', icon: Phone },
];

export const MAX_DEPTH = 3; // 0-based, so 4 levels total
