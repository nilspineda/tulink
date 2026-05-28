import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-6 px-4">
      <div className="animate-pulse">
        <Image
          src="/logo.svg"
          alt="tulink logo"
          width={180}
          height={60}
          priority
          className="h-12 w-auto"
        />
      </div>
      <Loader2 className="w-8 h-8 text-[#28af90] animate-spin" />
    </div>
  )
}
