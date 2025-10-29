import Button from "./button";

import LogoIcon from "./icons/LogoIcon";
import HomeIcon from "./icons/HomeIcon";
import ProfileIcon from "./icons/ProfileIcon";
import NotificationsIcon from "./icons/NotificationsIcon";
import SettingsIcon from "./icons/SettingsIcon";
import LogoutIcon from "./icons/LogoutIcon";

export default function Sidebar() {
    return (
        <nav data-testid="sidebar" className="light-green h-[calc(100vh-1rem)] sticky top-2 flex flex-col w-fit pt-4 pb-4 m-2 large-border-radius z-50">
            <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col gap-[8px]">   
                    <Button icon={<LogoIcon />} colorScheme="light-green" size="large" tooltip="Início" />
                    <Button icon={<HomeIcon />} colorScheme="light-green" size="large" tooltip="Início" />
                    <Button icon={<ProfileIcon />} colorScheme="light-green" size="large" tooltip="Perfil" />
                    <Button icon={<NotificationsIcon />} colorScheme="light-green" size="large" tooltip="Notificações" />
                    <Button icon={<SettingsIcon />} colorScheme="light-green" size="large" path="/settings" tooltip="Configurações" />
                </div>
                <div>
                    <Button icon={<LogoutIcon />} colorScheme="light-green" size="large" tooltip="Sair" />
                </div>
            </div>
        </nav>
    );
}   