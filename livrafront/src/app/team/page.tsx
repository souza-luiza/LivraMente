'use client'

import LogoIcon from '@/components/icons/LogoIcon'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import EnzoImg from '../../../public/team/Enzo.jpeg'
import IsabeleImg from '../../../public/team/Isabele.jpeg'
import ZampoliImg from '../../../public/team/Zampoli.jpeg'
import AkemiImg from '../../../public/team/Akemi.jpeg'
import LorenImg from '../../../public/team/Loren.jpeg'
import LuImg from '../../../public/team/Luiza.jpeg'
import ViviImg from '../../../public/team/Vivi.jpeg'

export default function Team() {
  const radius = 250;

  const team = [
    { id: 1, name: 'Enzo', img: EnzoImg, github: 'https://github.com/EnzoBelfort'},
    { id: 2, name: 'Isabele', img: IsabeleImg, github: 'https://github.com/isabele7' },
    { id: 3, name: 'Dr Zampoli', img: ZampoliImg, github: 'https://github.com/JoaoPedroZampoli' },
    { id: 4, name: 'Akemi', img: AkemiImg, github: 'https://github.com/akemiikemoto' },
    { id: 5, name: 'Loren', img: LorenImg, github: 'https://github.com/Loworen' },
    { id: 6, name: 'Lu Maga da Tecnologia', img: LuImg, github: 'https://github.com/souza-luiza' },
    { id: 7, name: 'Vivi', img: ViviImg, github: 'https://github.com/parkvivi' }
  ];

  return (
    <div className="h-screen flex justify-center items-center relative bg-[#CADDBF]">
      <div className="relative flex justify-center items-center">
        <div className='flex flex-col justify-center items-center gap-1 text-white'>
          <LogoIcon size={80} fill="#1F2A17" />
          <h1 className='text-h2'>LivraTime</h1>
        </div>
        {team.map((member, i) => {
          const angle = (i / team.length) * 2 * Math.PI;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <motion.div
              key={member.id}
              className="absolute w-32 h-32 rounded-full overflow-hidden border-[2px] border-[#1F2A17] shadow-md"
              style={{ 
                left: `calc(21% + ${x}px)`,
                top: `calc(5% + ${y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.01, type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.2 }}
            >
              <Link href={member.github} target="_blank">
                <Image
                  src={member.img}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}