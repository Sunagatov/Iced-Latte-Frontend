import Image from 'next/image'
import hero from '../../../public/hero.png'

export default function Hero() {
  return (
    <section className={' mx-36 flex h-screen  justify-center '}>
      <div
        className={
          'h-[200px] w-[572px] rounded-2xl sm:h-[400px] sm:w-[1144px] sm:rounded-none'
        }
      >
        <Image src={hero} width={1144} height={400} alt="Hero" priority />
      </div>
    </section>
  )
}
