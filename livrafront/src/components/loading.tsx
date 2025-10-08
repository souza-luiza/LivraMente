import LogoIcon from './icons/LogoIcon'

export default function LoadingPage() {
  return (
    <div data-testid="loading-main" className="flex items-center justify-center h-screen w-screen bg-white">
      <div data-testid="loading-middle" className="relative flex items-center justify-center">
  <div data-testid="spinning-element" className="absolute w-48 h-48 border-16 border-[#B0CC9E] border-t-[#5C8046] rounded-full animate-[spin_1.5s_ease-in-out_infinite]"></div>
        <div data-testid="logo-container" className="w-24 h-24 text-[#1F2A17]">
          <LogoIcon />
        </div>
      </div>
    </div>
  )
}