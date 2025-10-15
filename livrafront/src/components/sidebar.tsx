import Button from "./textless-button";

import LogoIcon from "./icons/LogoIcon";
import HomeIcon from "./icons/HomeIcon";
import ProfileIcon from "./icons/ProfileIcon";
import NotificationsIcon from "./icons/NotificationsIcon";
import SettingsIcon from "./icons/SettingsIcon";
import LogoutIcon from "./icons/LogoutIcon";

export default function Sidebar() {
    return (
    <div role="complementary" data-testid="sidebar" className="inline-block light-green w-[80px] h-fill pt-[15px] pb-[15px] m-4 rounded-[12px]">
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