"use client";

import Button from '@/components/button'
import TeamMember from '@/components/team-member'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

import LogoIcon from '@/components/icons/LogoIcon'
import LoginIcon from '@/components/icons/LoginIcon'
import Edit3Icon from '@/components/icons/Edit3Icon'

import EnzoImg from '../../../public/team/Enzo.jpeg'
import IsabeleImg from '../../../public/team/Isabele.jpeg'
import ZampoliImg from '../../../public/team/Zampoli.jpeg'
import AkemiImg from '../../../public/team/Akemi.jpeg'
import LorenImg from '../../../public/team/Loren.jpeg'
import LuImg from '../../../public/team/Luiza.jpeg'
import ViviImg from '../../../public/team/Vivi.jpeg'
import KemiImg from '../../../public/team/Kemi.jpg'
import HomeIcon from '@/components/icons/HomeIcon'
import { getSessionInfos } from '@/services/auth'

export default function LivraTime() {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const team = [
    { name: 'Enzo',       img: EnzoImg,     github: 'https://github.com/EnzoBelfort',       linkedin: 'https://www.linkedin.com/in/enzobelfort'           },
    { name: 'Isabele',    img: IsabeleImg,  github: 'https://github.com/isabele7',          linkedin: 'https://www.linkedin.com/in/isabele-nascimento'    },
    { name: 'Dr Zampoli', img: ZampoliImg,  github: 'https://github.com/JoaoPedroZampoli',  linkedin: 'https://www.linkedin.com/in/joaopedrozampoli'      },
    { name: 'Akemi',      img: AkemiImg,    github: 'https://github.com/akemiikemoto',      linkedin: 'https://www.linkedin.com/in/leticia-akemi-ikemoto' },
    { name: 'Loren',      img: LorenImg,    github: 'https://github.com/Loworen',           linkedin: 'https://www.linkedin.com/in/loren-pe%C3%B1a-rodriguez-lorenzetto-616a13382/'                                                  },
    { name: 'MagaLu',     img: LuImg,       github: 'https://github.com/souza-luiza',       linkedin: 'https://www.linkedin.com/in/luizadesouzaferreira'  },
    { name: 'Vivirgínia', img: ViviImg,     github: 'https://github.com/parkvivi',          linkedin: 'https://www.linkedin.com/in/viviane-park'          }  
  ];

  useEffect(() => {
    const checkSession = async () => {
      const info = await getSessionInfos()
      setIsLoggedIn(!!info)
    }
    checkSession()
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col">

      {/*Parte de Cima*/}
      <div data-testid="top-section" className="h-4/9 w-screen flex flex-row bg-[#FFFFFF]">

        {/*Botão de Voltar*/}
        <div className="w-1/4 h-fill">
          <div className="justify-start m-[16px]">
              <Button
                  text="Página Inicial"
                  icon={<HomeIcon />}
                  size="medium"
                  colorScheme="dark-brown"
                  path="/"
              />
          </div>
        </div>

        {/*Logo + LivraTime*/}
        <div className="w-1/2 h-fill flex flex-col justify-center items-center">
          <motion.div
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <AnimatePresence mode="wait">
              {!isHovered && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, rotateY: 90}}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{
                    perspective: 1000,
                    transformStyle: 'preserve-3d',
                  }}
                  className="flex flex-col items-center"
                >
                  <LogoIcon size={120} fill="#23160A" className="mb-1" />
                  <h1 className="text-h2">LivraTime</h1>
                  <p className="text-b2 body-semibold">O time dos leitores brasileiros</p>
                </motion.div>
              )}

              {isHovered && (
                <motion.div
                  key="kemi"
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{
                    perspective: 1000,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <TeamMember
                    key="kemi"
                    img={KemiImg}
                    imgSize={160}
                    name="Kemi Funnycat's"
                    nameStyle="text-h5"
                    initialScale={false}
                    hoverScale={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/*Botões de Entrar & Cadastrar*/}
        <div className="w-1/4 h-fill">
          {!isLoggedIn && (
            <div className="flex flex-row justify-end gap-1 m-[16px]">
                <Button 
                    text="Entrar"
                    colorScheme="dark-brown"
                    size="medium"
                    icon={<LoginIcon />}
                    path="/entrar"
                />
                <Button 
                    text="Cadastrar"
                    colorScheme="dark-brown"
                    size="medium"
                    icon={<Edit3Icon />}
                    path="/cadastro"
                />
            </div>
          )}
        </div>
      </div>

      {/*Parte de Baixo*/}
      <div data-testid="bottom-section" className="h-5/9 w-screen flex flex-row items-center justify-center gap-[32px] bg-[#B0CC9E]">

            {/*LivraTime*/}
            {team.map((member, i) => {
              return (
                <TeamMember
                  key={i}
                  img={member.img}
                  imgSize={160}
                  name={member.name}
                  nameStyle="text-h5"
                  github={member.github}
                  linkedin={member.linkedin}
                />
              )
            })}
            
      </div>

    </div>
  )
}