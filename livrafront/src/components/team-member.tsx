import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Url } from "next/dist/shared/lib/router/router";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

import GitHubIcon from "./icons/GithubIcon";
import LinkedinIcon from "./icons/LinkedinIcon";

interface TeamMemberProps {
    img: string | StaticImport,
    imgSize?: number
    name: string
    nameStyle?: string
    color?: string
    initialScale?: boolean
    github?: Url
    linkedin?: Url
    buttonSize?: 'small' | 'medium' | 'large'
    hoverScale?: boolean
}

export default function TeamMember({
    img,
    imgSize = 80,
    name,
    nameStyle = "text-b1 body-semibold",
    color = "#1F2A17",
    initialScale = true,
    github,
    linkedin,
    buttonSize = "medium",
    hoverScale = true
    }: TeamMemberProps) {

    const iconSize: Record<"small" | "medium" | "large", number> = {
        small:  24,
        medium: 28,
        large:  32
    }

    return (
        <motion.div 
            className="flex flex-col items-center gap-2"
            initial={initialScale ? { scale: 0, opacity: 0 } : { opacity: 0 }}
            animate={initialScale ? { scale: 1, opacity: 1 } : { opacity: 1 }}
            transition={{ delay: 0.01, type: 'spring', stiffness: 100 }}
            whileHover= {hoverScale ? { scale: 1.1 } : {}}
        >

            {/*Foto*/}
            <div 
                className="rounded-full overflow-hidden border-[2px] shadow-md"
                style={{
                    width: imgSize,
                    height: imgSize,
                    borderColor: color,
                }}
            >
                <Image
                    src={img}
                    alt={name}
                    width={imgSize}
                    height={imgSize}
                    className="object-cover"
                />
            </div>

            {/*Nome*/}
            <p className={`${nameStyle} text-[${color}] text-center`}>
                {name}
            </p>

            {/*Botões de Github e LinkedIn*/}
            <div className="flex flex-row gap-3">

                {/*Botão do Github*/}
                {github &&
                    <Link href={github} target="_blank">
                        <button className="cursor-pointer">
                            <GitHubIcon size={iconSize[buttonSize]} fill={`${color}`} />
                        </button>
                    </Link>
                }

                {/*Botão do LinkedIn*/}
                {linkedin &&
                    <Link href={linkedin} target="_blank">
                        <button className="cursor-pointer">
                            <LinkedinIcon size={iconSize[buttonSize]} fill={`${color}`} />
                        </button>
                    </Link>
                }

            </div>
        </motion.div>
    );
}