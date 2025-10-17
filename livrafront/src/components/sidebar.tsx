import Button from "./textless-button";

import LogoIcon from "./icons/LogoIcon";
import HomeIcon from "./icons/HomeIcon";
import ProfileIcon from "./icons/ProfileIcon";
import NotificationsIcon from "./icons/NotificationsIcon";
import SettingsIcon from "./icons/SettingsIcon";
import LogoutIcon from "./icons/LogoutIcon";
import Link from "next/link";

export default function Sidebar() {
    return (
        <div role="complementary" data-testid="sidebar" className="light-green h-[calc(100vh-1rem)] sticky top-2 flex flex-col w-fit pt-4 pb-4 m-2 rounded-xl">
            <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col gap-[8px]">   
                    <Button icon={<LogoIcon />} colorScheme="light-green" size="large" tooltip="Início" />
                    <Button icon={<HomeIcon />} colorScheme="light-green" size="large" tooltip="Início" />
                    <Button icon={<ProfileIcon />} colorScheme="light-green" size="large" tooltip="Perfil" />
                    <Button icon={<NotificationsIcon />} colorScheme="light-green" size="large" tooltip="Notificações" />
                    <Button icon={<SettingsIcon />} colorScheme="light-green" size="large" tooltip="Configurações" />
                </div>
                <div>
                    <Button icon={<LogoutIcon />} colorScheme="light-green" size="large" tooltip="Sair" />
                </div>
            </div>
        </div>
    );
}   