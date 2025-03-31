'use client';

import * as React from 'react';
import { ShoppingCart, User } from 'lucide-react';
import { NavItems } from '@/components/nav-items';
import { BrandTitle } from '@/components/brand-title';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { ModeToggle } from './ui/toggle-mode';

const data = {
  items: [
    {
      name: 'Skins',
      url: '/skins',
      icon: '/icons8-ak-47-48.png',
    },
    {
      name: 'Agents',
      url: '/agents',
      icon: User,
    },
    {
      name: 'Agents(Using SOAP)',
      url: '/agentsSOAP',
      icon: User,
    },
    {
      name: 'Market',
      url: '/market',
      icon: ShoppingCart,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BrandTitle />
      </SidebarHeader>
      <SidebarContent>
        <NavItems items={data.items} />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
