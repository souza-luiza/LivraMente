'use client';

import Button from "../../components/botao";
import LogoIcon from "../../components/icons/logo";

export default function ButtonTest() {
  // Define your sizes and color schemes
  const sizes = ["Small", "Medium", "Large"] as const;
  const sizeMap = { Small: "small", Medium: "medium", Large: "large" } as const;

  const colorSchemes = ["light-green", "dark-green", "light-brown", "dark-brown"] as const;

  function handleClick() {
    alert("You clicked the button!");
  }

  return (
    <div className="grid grid-cols-3 gap-2 m-8">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-start gap-2">
          {colorSchemes.map((color) => (
            <Button
              key={color}
              text={size}
              size={sizeMap[size]}
              colorScheme={color}
              icon={<LogoIcon />}
              onClick={handleClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}