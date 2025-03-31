'use client';
import Image from 'next/image';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavItems({ items = [] }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url || '#'}>
                {item.icon && typeof item.icon === 'string' ? (
                  <Image src={item.icon} width={16} height={16} alt={`${item.name} icon`} />
                ) : item.icon ? (
                  <item.icon />
                ) : null}
                <span>{item.name || 'Untitled menu'}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
