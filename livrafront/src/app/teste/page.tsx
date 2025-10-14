import Button from "@/components/button";
import GiftIcon from "@/components/icons/GiftIcon";
import MoneyIcon from "@/components/icons/MoneyIcon";
import PauseIcon from "@/components/icons/PauseIcon";

export default function TestePage() {

    const Icon = <PauseIcon />;

    return(
        <div>
            <Button
                text='Clique aqui'
                icon={Icon}
                size='small'
                colorScheme='dark-green'
            />
            <Button
                text='Clique aqui'
                icon={Icon}
                size='medium'
                colorScheme='dark-green'
            />
            <Button
                text='Clique aqui'
                icon={Icon}
                size='large'
                colorScheme='dark-green'
            />
        </div>
    );
}